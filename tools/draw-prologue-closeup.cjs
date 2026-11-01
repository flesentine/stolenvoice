// Dedicated native close-up based on merrin-polishing-closeup-v1.png.
// Integer outlines and fills, with a clipped reflected drawing; no sprite zoom.
const fs=require('fs'),A=require('../editor/agi-picture.js');
function picture(stage=0,cel=0){
 let commands=[];
 const p=(name,points,color,outline=null)=>commands.push({type:'polygon',name,points,color,outline});
 const l=(name,points,color)=>commands.push({type:'line',name,points,color});
 const r=(name,x,y,w,h,c)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);
 r('Pale gallery stone',0,0,160,168,7);
 for(const yy of [21,57,96,135]){l('Quiet stone courses',[[0,yy],[159,yy]],8);for(let xx=(yy%2?17:5);xx<160;xx+=39)l('Stone joints',[[xx,yy],[xx,yy+13]],8)}
 r('Blue royal banner',144,0,15,88,1);l('Banner gold hem',[[145,0],[145,87],[152,80],[159,87]],14);
 l('Banner emblem',[[152,18],[152,48]],14);l('Banner emblem',[[148,31],[156,31]],14);
 r('Sconce candle',5,35,2,23,15);l('Sconce iron',[[1,59],[10,59],[6,63],[6,78]],0);
 p('Candle flame',[[5,32],[6,26+(cel%3===0?1:0)],[8,32],[7,35]],4);
 p('Orange flame body',[[5,32],[6,28+(cel%3===0?1:0)],[7,31],[7,34],[6,34]],6);
 p('Yellow flame heart',[[6,30],[7,32],[6,34]],14);
 l('Steady flame heart',[[6,32],[6,33]],14);
 p('Mirror carved silhouette',[[76,162],[76,30],[79,19],[87,11],[95,7],[101,1],[108,7],[118,10],[128,20],[132,31],[132,162]],0);
 p('Mirror gilt',[[78,162],[78,31],[81,21],[89,14],[98,10],[102,5],[107,11],[117,13],[126,22],[130,32],[130,162]],6);
 p('Silver glass',[[83,159],[83,32],[86,24],[93,18],[102,14],[113,17],[121,24],[125,33],[125,159]],8);
 l('Mirror inner gilt',[[81,157],[81,31],[85,22],[94,15],[102,11],[114,15],[123,24],[127,33],[127,157]],14);
 for(const xx of [78,129]){
  l('Gilt column light',[[xx,30],[xx,160]],14);
  for(const yy of [35,75,118,156]){p('Ruby setting',[[xx-2,yy],[xx,yy-3],[xx+2,yy],[xx,yy+4]],4);l('Ruby glint',[[xx,yy-2],[xx+1,yy]],12)}
 }
 p('Blue crown jewel',[[98,8],[99,2],[103,0],[106,4],[105,10],[101,12]],1,14);
 const actorStart=commands.length;
 // Body reference traced as native polygons; retain the accepted head exactly.
 const bodyTrace=require('./trace-merrin-prologue-body.cjs');
 commands.push(...bodyTrace(stage,cel,'base'));
 commands.push(...require('./trace-merrin-prologue-head.cjs')(stage,cel).filter(c=>!['Traced left linen collar','Traced right linen collar'].includes(c.name)));
 commands.push(...bodyTrace(stage,cel,'front'));
 const actor=commands.splice(actorStart);
 // Reflect the same face, cap and pose with one scale on both axes.
 // Keep skin, hair and cap distinct; turning all three gray erased his likeness.
 const reflected=actor.map(c=>{
  // The foreground drawing ends at the picture edge, not at Merrin's waist.
  // Continue those garment edges below the mirror sill before clipping them.
  const garment=['Traced work tunic','Traced waist apron','Traced apron fold'].includes(c.name);
  return {...c,points:c.points.map(([x,y])=>[Math.round(152-x*.78),Math.round(18+(garment&&y>=166?185:y)*.78)]),color:c.color===9?1:c.color,outline:c.outline};
 });
 const background={type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null};
 const renderActor=require('./render-merrin-actor.cjs');
 const cleanSkin=input=>{
 const ref=renderActor([background,...input]);
 // Scaling rounds facial features and finger creases independently of their
 // enclosing polygons. Keep these details inside the visible skin interior,
 // so they cannot overwrite an outline or leave a colored pixel beyond it.
 const headDetails=new Set(require('./trace-merrin-prologue-head.cjs')(stage,cel)
  .filter(c=>!['Traced face and neck','Traced gray hair','Traced ear','Traced hair part','Medieval brown felt cap','Soft folded cap edge','Soft felt cap underside','Cap crown crease','Short felt crease','Traced left linen collar','Traced right linen collar'].includes(c.name)).map(c=>c.name));
 const isDetail=c=>headDetails.has(c.name)||/separation$/.test(c.name);
 const shell=input.filter(c=>!isDetail(c));
 const base=renderActor([background,...shell]);
 const skin=renderActor([{...background,color:0},...shell.map(c=>({...c,color:c.color===12?15:0,outline:c.outline==null?null:0}))]);
 for(let i=0;i<ref.length;i++)if(skin[i]!==15)ref[i]=base[i];
 // Cloth fold lines must stay inside the visible white cloth, too. Their
 // independently rounded endpoints used to leave gray dots on its outline.
 const clothFold=c=>/^Traced cloth (long|lower) fold$/.test(c.name);
 if(input.some(clothFold)){
  const clothShell=input.filter(c=>!clothFold(c));
  const withoutFolds=renderActor([background,...clothShell]);
  const original=renderActor([background,...input]);
  const cloth=renderActor([{...background,color:0},...clothShell.map(c=>({...c,color:c.name==='Traced polishing cloth'?15:0,outline:c.outline==null?null:0}))]);
  for(let i=0;i<ref.length;i++)if(cloth[i]!==15&&original[i]!==withoutFolds[i])ref[i]=withoutFolds[i];
 }
 // Scanline fills can also project one pixel beyond a diagonal Bresenham
 // contour. Close skin edges and the polishing hand/cloth/sleeve silhouette.
 const bodyTop=input.find(c=>c.name==='Traced face and neck').points[0][0]>80?88:90;
 const exposed=[];
 for(let y=1;y<167;y++)for(let x=1;x<159;x++){
  const i=y*160+x;
  if((ref[i]===12||(y>=bodyTop&&![0,3].includes(ref[i])))&&[i-1,i+1,i-160,i+160].some(j=>ref[j]===3))exposed.push(i);
 }
 for(const i of exposed)ref[i]=0;
 return ref;
 };
 const ref=cleanSkin(reflected);
 const mask=A.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:0},{type:'polygon',points:[[84,158],[84,33],[87,25],[94,19],[102,15],[112,18],[120,25],[124,34],[124,158]],color:15}]);
 for(let y=0;y<168;y++)for(let x=0;x<160;){if(mask[y*160+x]!==15||ref[y*160+x]===3){x++;continue}const start=x,col=ref[y*160+x];while(x<160&&mask[y*160+x]===15&&ref[y*160+x]===col)x++;l('Clipped reflected Merrin',[[start,y],[x-1,y]],col)}
 l('Silver light',[[116,27],[121,37],[121,60]],7);
 const behindActor=A.render(commands);
 commands.push(...actor);
 // Preserve editable foreground shapes; append only native pixel corrections.
 const rawActor=A.render([background,...actor]),cleanActor=cleanSkin(actor);
 for(let y=0;y<168;y++)for(let x=0;x<160;x++){
  const i=y*160+x;
  if(cleanActor[i]!==rawActor[i])l('Foreground skin contour correction',[[x,y],[x,y]],cleanActor[i]===3?behindActor[i]:cleanActor[i]);
 }
 // Discrete musical breaths read as sound, rather than a continuous tentacle.
 if(stage===1||stage===3){
  const count=stage===3?3:2;
  for(let i=0;i<count;i++){
   const progress=cel/7-i*.17;
   if(progress<0||progress>.95)continue;
   const x=Math.round(67+progress*44),y=Math.round(69-Math.sin(progress*Math.PI)*17);
   const color=i%2?14:11;
   l('Flying song note',[[x,y],[x,y-5],[x+3,y-4]],color);
   r('Song note head',x-1,y,1,1,15);
  }
 }
 if(stage>=2){
  const strength=stage===2?cel:stage===3?Math.min(7,cel+3):7;
  for(let i=0;i<strength;i++){
   const x=94+(i*11)%24,y=47+(i*17)%57;
   r('Voice held inside silver',x,y,0,0,i%3===0?14:11);
  }
  if(stage===3&&cel>=4){
   const y=38+(cel-4)*19;
   l('Silver answers the stolen song',[[88,y],[96,y-2],[105,y],[114,y-2],[121,y]],11);
  }
 }
 if(stage===2&&cel>=2&&cel<=5){
  const y=24+(cel-2)*31;
  l('Light climbs the gilt',[[79,y+4],[80,y],[81,y+4]],15);
  l('Light climbs the gilt',[[128,y+4],[129,y],[130,y+4]],14);
 }
 if(stage===4&&cel>=3){
  const x=69+Math.min(5,cel-3),y=72-Math.min(3,cel-3);
  p('Little bell instead of words',[[x-2,y-4],[x,y-6],[x+2,y-4],[x+3,y],[x-3,y]],14);
  l('Bell dark lip',[[x-4,y+1],[x+4,y+1]],6);
  r('Bell clapper',x+(cel%2?1:-1),y+2,0,1,15);
  if(cel>=4&&cel<=6){
   l('Chime spreading left',[[x-7,y-3],[x-8,y],[x-7,y+2]],15);
   l('Chime spreading right',[[x+7,y-3],[x+8,y],[x+7,y+2]],14);
  }
 }
 return commands;
}
const encode=pix=>{let runs=[];for(let i=0;i<pix.length;){let e=i+1;while(e<pix.length&&pix[e]===pix[i]&&e-i<255)e++;runs.push(e-i,pix[i]);i=e}return Buffer.from(runs).toString('base64')};
const frames=Array.from({length:5},(_,stage)=>Array.from({length:8},(_,cel)=>encode(A.render(picture(stage,cel)))));
fs.writeFileSync('game/prologue-closeup-picture.js','const prologueCloseupPictures='+JSON.stringify(frames)+';\n');
fs.writeFileSync('assets/rooms/prologue-closeup-workshop-v1.json',JSON.stringify({format:'agi-picture-workshop',version:1,name:'Merrin polishing the mirror - dedicated close-up',width:160,height:168,palette:A.palette,reference:'assets/references/merrin-polishing-closeup-v1.png',headReference:'assets/references/merrin-profile-approved-v3.png',bodyReference:'assets/references/merrin-polishing-body-medieval-v3.png',commands:picture(0,0)},null,2)+'\n');
console.log('Drew 40 dedicated native close-up cels, including clipped reflection.');

fs.writeFileSync('assets/rooms/merrin-profile-head-trace-v3.json',JSON.stringify({format:'agi-picture-workshop',version:1,name:'Merrin head - approved imagegen reference trace',width:160,height:168,palette:A.palette,reference:'../references/merrin-profile-approved-v3.png',notes:'Face, hair and collar traced from reference; cap adapted to medieval felt bonnet without a modern bill.',commands:require('./trace-merrin-prologue-head.cjs')(0,3)},null,2)+'\n');

fs.writeFileSync('assets/rooms/merrin-polishing-body-trace-v3.json',JSON.stringify({format:'agi-picture-workshop',version:1,name:'Merrin medieval polishing body - reference trace',width:160,height:168,palette:A.palette,reference:'../references/merrin-polishing-body-medieval-v3.png',commands:require('./trace-merrin-prologue-body.cjs')(0,0)},null,2)+'\n');
fs.writeFileSync('assets/rooms/merrin-hand-over-chest-trace-v1.json',JSON.stringify({format:'agi-picture-workshop',version:1,name:'Merrin hand over chest - reference trace',width:160,height:168,palette:A.palette,reference:'../references/merrin-hand-over-chest-v1.png',commands:require('./trace-merrin-prologue-body.cjs')(3,3)},null,2)+'\n');
