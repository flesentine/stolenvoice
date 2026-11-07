// Manual outline-and-fill interpretation of opening-imagegen-v2.png.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),commands=[];let name='Moonlit gallery';
const p=(points,color,outline=null)=>commands.push({type:'polygon',name,points:points.map(([x,y])=>[Math.max(0,Math.min(160,Math.round(x))),Math.max(0,Math.min(168,Math.round(y)))]),color,outline});
const l=(points,color)=>commands.push({type:'line',name,points:points.map(([x,y])=>[Math.max(0,Math.min(159,Math.round(x))),Math.max(0,Math.min(167,Math.round(y)))]),color});
const r=(x,y,w,h,c,e=null)=>p([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
r(0,0,160,168,0);
// A complete stone arch, with a continuous reveal rather than loose rib lines.
name='Window stone arch';p([[39,115],[39,27],[40,19],[44,10],[50,3],[57,0],[79,0],[86,4],[92,12],[95,21],[96,28],[96,115]],8);
name='Window moonlit reveal';p([[41,114],[41,26],[42,19],[46,11],[52,5],[59,2],[77,2],[84,6],[89,13],[92,21],[93,28],[93,114],[90,114],[90,28],[89,22],[86,15],[81,10],[75,6],[61,6],[54,10],[49,16],[46,23],[45,29],[45,114]],7);
name='Indigo night beyond the arch';p([[45,114],[45,28],[46,22],[49,15],[54,9],[61,5],[75,5],[82,9],[87,16],[90,23],[91,29],[91,114]],1);
// Wide AGI pixels: a five-by-eight logical ellipse reads as a near-round moon.
// Subtract a shifted ellipse inside the same mask, keeping both horns symmetric.
name='Crescent moon';
for(let yy=14;yy<=30;yy++){
 let run=-1;
 for(let xx=60;xx<=77;xx++){
  const outer=((xx-69)/4.5)**2+((yy-22)/8)**2<=1;
  const shadow=((xx-66)/4.8)**2+((yy-22)/8)**2<=1;
  const lit=outer&&!shadow;
  if(lit&&run<0)run=xx;
  if(run>=0&&(!lit||xx===77)){r(run,yy,(lit?xx+1:xx)-run,1,14);run=-1}
 }
}
name='Stars';for(const[x,y]of [[56,8],[63,14],[86,18],[69,5],[54,27],[85,34]])r(x,y,1,1,15);l([[63,22],[65,22]],15);l([[64,21],[64,23]],15);
// A distant walled keep on a continuous low hill, seen beyond the garden.
name='Distant rolling hills';p([[45,66],[50,60],[56,56],[61,58],[68,52],[74,53],[80,59],[86,56],[92,62],[92,91],[45,91]],3);
name='Castle grounded garden slope';p([[45,84],[50,76],[54,70],[54,67],[58,65],[83,65],[88,70],[92,80],[92,112],[45,112]],2);
// A broad lit shoulder meets the foundation; no sky-colored strip cuts below it.
name='Garden slope light';l([[52,80],[57,74],[62,72]],10);l([[82,78],[86,81]],10);
// Cypresses stand beside the hill instead of obscuring its foundation.
name='Far garden silhouettes';p([[45,99],[45,63],[47,55],[49,64],[50,79],[52,73],[54,80],[55,101]],0);
p([[84,103],[85,77],[87,66],[89,58],[91,71],[92,103]],0);
name='Distant castle foundation';p([[57,64],[83,64],[83,66],[81,67],[58,67],[56,66]],8);l([[58,65],[82,65]],7);
// Rear keep: roof touches its walls, with a narrow shadow return.
name='Distant castle';r(68,39,8,16,7);r(74,40,2,15,8);
name='Castle red roofs';p([[66,39],[72,32],[78,39]],4);l([[67,39],[77,39]],6);
name='Keep moonlit edge';l([[69,40],[69,49]],15);
// Curtain wall and gatehouse connect the two lower round towers.
name='Castle curtain';p([[59,53],[62,53],[62,51],[64,51],[64,53],[67,53],[67,51],[69,51],[69,53],[73,53],[73,51],[75,51],[75,53],[78,53],[78,51],[80,51],[80,64],[59,64]],7);
l([[61,55],[79,55]],8);l([[61,56],[78,56]],15);
name='Castle flanking towers';for(const [left,top]of [[58,45],[78,47]]){
 p([[left,top],[left+5,top],[left+5,64],[left+4,65],[left+1,65],[left,64]],7);
 r(left+4,top+1,1,18-(top-45),8);
 l([[left+1,top+2],[left+1,63]],15);
 p([[left-2,top],[left+2,top-6],[left+7,top]],4);l([[left-1,top],[left+6,top]],6);
 r(left+2,top+4,1,3,1);r(left+2,top+12,1,2,1);
}
name='Castle warm windows';for(const[x,y]of [[71,43],[71,48]])r(x,y,1,2,14);
name='Castle gate';p([[68,64],[68,59],[70,57],[72,59],[72,64]],1);
l([[67,64],[67,59],[70,56],[73,59],[73,64]],8);
name='Castle approach';p([[69,67],[72,67],[73,70],[77,73],[78,75],[77,77],[75,79],[74,82],[76,86],[79,91],[80,99],[77,100],[76,93],[73,87],[72,83],[72,80],[75,76],[75,74],[71,71]],7);l([[70,68],[72,71],[76,74],[76,76],[73,80],[73,82],[75,86],[78,92],[78,98]],8);
name='Garden shrubs';p([[46,112],[46,93],[49,89],[51,95],[54,91],[57,99],[61,94],[65,99],[68,94],[72,99],[77,94],[80,101],[84,96],[88,100],[90,112]],3);for(const[x,y]of [[48,100],[55,104],[70,104],[83,106]])l([[x,y+5],[x+1,y],[x+3,y+4]],2);
name='Garden fountain';r(65,108,15,2,9);r(68,105,10,2,3);r(72,96,2,10,9);l([[73,96],[73,102]],11);l([[63,111],[81,111]],3);
// Architecture establishes a real gallery around the magical scene.
name='Stone arch columns';
// The title's central window shares its spring line with these square imposts.
for(const left of [40,89]){
 r(left,26,5,88,8);r(left+1,28,1,85,7);
 r(left-1,23,7,2,0);r(left-1,22,7,1,7);
 for(const yy of [49,77,103])l([[left,yy],[left+3,yy]],0);
}
// A separate far gallery pier remains behind Elara, outside the window view.
r(146,21,5,115,8,0);r(147,23,1,109,7);r(145,19,7,2,7,0);
for(const yy of [49,77,103,127])l([[146,yy],[149,yy]],0);
name='Window arch block joints';
for(const pts of [[[40,21],[44,22]],[[44,11],[48,14]],[[51,4],[55,9]],[[59,1],[62,5]],[[77,1],[74,5]],[[85,5],[81,10]],[[92,13],[87,17]],[[95,23],[90,25]]])l(pts,0);
name='Far gallery arch';l([[145,17],[143,8],[139,0]],9);l([[151,17],[152,8],[156,0]],7);
name='Royal hangings';for(const left of [23,132]){p([[left,0],[left+7,0],[left+7,43],[left+3,50],[left,43]],4,6);l([[left+1,1],[left+1,42],[left+3,46],[left+6,42],[left+6,1]],14);l([[left+3,9],[left+3,29]],14);l([[left+1,19],[left+5,19]],14)}
name='Gallery floor';p([[0,141],[44,131],[121,132],[160,141],[160,168],[0,168]],8);for(const pts of [[[43,135],[112,136]],[[52,149],[147,153]],[[44,165],[62,142]],[[143,140],[158,151]]])l(pts,7);
name='Window stone sill';r(42,113,52,2,0);r(43,112,50,1,7);r(44,115,48,2,8);
name='Pierced stone window apron';r(44,117,48,17,0);r(44,133,48,3,8);l([[44,133],[91,133]],7);
for(const xx of [45,55,65,75,85]){p([[xx,117],[xx+4,117],[xx+3,121],[xx+3,130],[xx+4,132],[xx,132],[xx+1,130],[xx+1,121]],8);l([[xx+1,118],[xx+1,130]],7)}
name='Crimson carpet';p([[93,135],[122,135],[151,168],[62,168]],4);l([[95,137],[68,167]],6);l([[97,137],[71,167]],14);l([[120,137],[144,167]],6);l([[118,137],[141,167]],14);for(const yy of [148,158])l([[84,yy],[129,yy]],6);
name='Mirror cast shadow';p([[87,141],[124,138],[140,151],[103,155],[83,149]],0);
// Mirror is drawn bilaterally around x108. One-pixel gold carving, bold outer edge.
name='Mirror outer carving';p([[88,136],[88,32],[90,26],[96,22],[99,18],[103,14],[103,9],[108,3],[113,9],[113,14],[117,18],[120,22],[126,26],[128,32],[128,136],[132,140],[132,146],[84,146],[84,140]],0);
name='Mirror gilt fill';p([[90,136],[90,32],[92,28],[98,24],[101,20],[105,17],[105,10],[108,6],[111,10],[111,17],[115,20],[118,24],[124,28],[126,32],[126,136],[130,141],[130,144],[86,144],[86,141]],6);
for(const side of [-1,1]){
 name='Mirror matched carved pillars';l([[108+side*17,133],[108+side*17,31],[108+side*11,24],[108+side*4,20]],14);l([[108+side*19,134],[108+side*19,32]],14);
 for(const yy of [40,63,86,109,129]){p([[108+side*18,yy],[108+side*16,yy+3],[108+side*18,yy+6],[108+side*20,yy+3]],4);l([[108+side*18,yy+1],[108+side*17,yy+3]],12)}
 r(108+side*20-1,26,3,3,14);l([[108+side*20,25],[108+side*20,20]],14);
}
name='Mirror sapphire';p([[105,12],[108,7],[111,12],[110,17],[106,17]],1,14);l([[106,12],[108,9],[108,13]],11);
name='Mirror silver';p([[93,130],[93,34],[96,29],[102,24],[108,21],[114,24],[120,29],[123,34],[123,130],[119,136],[97,136]],7);
name='Mirror violet shadow';p([[108,23],[118,30],[121,36],[121,126],[117,132],[112,133],[117,112],[110,94],[115,77],[107,60],[113,43]],9);
name='Mirror dark return';p([[120,34],[122,38],[122,127],[117,133],[113,133],[118,113],[114,98],[119,80],[113,61],[118,46]],8);
name='Glass sweeping light';p([[99,33],[107,27],[106,36],[99,51],[97,67],[96,84],[94,86],[94,60]],15);p([[105,108],[108,123],[113,130],[109,134],[103,124],[101,113]],15);
name='Mirror foot';r(88,137,40,3,6);l([[89,137],[127,137]],14);r(85,141,46,3,6);l([[86,141],[130,141]],14);for(const xx of [95,108,121])p([[xx-1,139],[xx,138],[xx+1,139],[xx,141]],4);
// Merrin, a worried older gardener. Broad shapes preserve adult anatomy.
name='Merrin shoulder outline';p([[0,115],[12,102],[25,100],[39,103],[51,111],[64,133],[75,168],[0,168]],0);
name='Merrin blue tunic';p([[0,118],[13,106],[25,104],[39,107],[48,115],[60,136],[71,168],[0,168]],1);p([[43,115],[49,121],[58,141],[64,163],[60,168],[53,150]],9);p([[2,136],[9,124],[15,117],[12,133],[16,152],[19,168],[5,168]],9);
name='Merrin apron';p([[12,118],[16,114],[19,132],[34,136],[45,128],[48,130],[50,168],[14,168]],6,0);l([[17,139],[18,164]],0);l([[44,140],[46,163]],14);
name='Merrin neck';p([[13,88],[31,91],[32,106],[25,120],[12,109]],12,0);p([[13,95],[20,104],[29,101],[27,110],[22,115],[15,108]],4);
name='Merrin hair mass';p([[2,46],[12,40],[25,44],[29,54],[25,67],[21,74],[23,87],[17,103],[7,98],[1,87],[0,70]],7,0);for(const pts of [[[5,64],[3,75],[6,84]],[[8,76],[6,87],[10,94]],[[12,84],[11,95],[15,98]]])l(pts,8);
name='Merrin face';p([[16,44],[27,42],[33,47],[34,55],[33,65],[38,70],[39,73],[35,76],[36,84],[33,94],[27,102],[20,102],[13,96],[11,86],[8,76],[10,64]],12,0);
name='Merrin warm shadows';p([[12,77],[16,85],[23,91],[33,89],[32,95],[26,100],[20,100],[14,95],[12,86]],4);l([[33,75],[35,77],[35,80]],4);
name='Merrin ear';p([[9,65],[12,63],[15,66],[15,72],[12,78],[9,75],[7,70]],12,0);l([[10,67],[12,66],[13,69],[11,72]],4);
name='Silver sideburn';p([[11,52],[16,49],[16,59],[13,64],[14,73],[12,81],[11,89],[7,87],[7,81],[9,73],[8,66]],7);l([[12,55],[11,62],[12,67]],15);l([[10,75],[10,82]],8);
name='Merrin brow and eye';l([[23,54],[26,51],[29,52]],7);l([[24,56],[27,55],[29,57]],0);p([[24,58],[28,56],[30,59],[27,61],[24,60]],15);r(28,57,1,3,0);l([[23,64],[25,63]],4);l([[28,47],[30,48]],4);
name='Merrin mouth';p([[31,83],[34,81],[36,82],[36,86],[32,89],[30,88]],0);l([[32,83],[35,83]],15);l([[29,94],[32,93]],4);
name='Felt cap black contour';p([[0,39],[8,29],[19,23],[27,26],[34,31],[38,35],[42,36],[42,41],[35,43],[26,48],[18,54],[6,66],[0,68]],0);
name='Felt cap brown';p([[0,42],[9,32],[19,26],[27,29],[34,34],[39,38],[39,40],[33,41],[25,46],[16,52],[5,63],[0,64]],6);p([[0,47],[13,35],[23,32],[27,34],[16,39],[7,49],[0,54]],0);l([[6,56],[20,44],[31,38],[36,38]],14);l([[18,30],[24,31],[27,33]],0);
name='Linen collar';p([[10,105],[17,112],[24,116],[29,107],[34,108],[30,120],[24,126],[16,121],[10,113]],7,0);l([[13,108],[20,116]],15);l([[28,110],[26,118]],8);
// Native-grid figure study: measured landmarks, explicit one-pixel clusters.
commands.push(...require('./opening-figure-pixels.cjs')());
name='Silver handbell on carpet';p([[94,149],[95,145],[98,143],[100,146],[102,150],[101,152],[94,152]],7,0);l([[95,149],[100,150]],15);l([[93,150],[91,152]],6);
name='Rose by mirror';l([[104,153],[114,148]],2);p([[107,151],[109,147],[111,149]],2);p([[114,145],[117,144],[120,147],[119,151],[115,152],[112,149]],4,0);l([[115,146],[118,146],[118,149],[115,150],[114,148],[116,147]],12);
// Separate wisps of breath, with clear air between the mouth and the magic.
// No filled tube, dark contour or coiled tip connects Merrin to the mirror.
name='Stolen voice ribbon';
for(const pts of [ [[41,86],[44,85]],[[49,82],[52,80]],[[58,78],[61,78]],[[67,80],[70,81]],[[77,84],[80,85]],[[88,85],[91,84]],[[98,82],[101,81]],[[106,80],[108,80]]])l(pts,11);
name='Silver breath highlights';for(const pts of [[[49,81],[51,80]],[[58,77],[60,77]],[[78,84],[79,84]],[[99,81],[100,81]]])l(pts,15);
name='Dissolving whisper flecks';for(const [xx,yy]of [[46,87],[54,78],[64,83],[73,86],[84,81],[94,86],[103,78]])r(xx,yy,1,1,3);
name='Voice sparks';for(const [xx,yy]of [[55,75],[82,89],[96,78]])r(xx,yy,1,1,15);
const project={format:'agi-picture-workshop',version:1,name:'Opening - The Stolen Breath',room:'opening',width:160,height:168,palette:A.palette,reference:'assets/opening/opening-imagegen-v2.png',notes:'Architecture uses closed flat fills; figures use measured native-grid landmarks and explicit one-pixel brush clusters. Generated reference is a proportion guide, never a converted game bitmap. Original 160x168 logical pixels.',commands};
fs.writeFileSync(path.join(root,'assets/opening/opening-workshop-v2.json'),JSON.stringify(project,null,2)+'\n');
// The editor and existing tools use this stable project path.
fs.writeFileSync(path.join(root,'assets/opening/opening-workshop-v1.json'),JSON.stringify(project,null,2)+'\n');
const pixels=A.render(commands),runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}
fs.writeFileSync(path.join(root,'game/opening-picture.js'),'const openingPicture='+JSON.stringify(Buffer.from(runs).toString('base64'))+';\nconst openingPennants=[];\nconst openingCloudSky='+JSON.stringify(Array.from(pixels.entries()).filter(([i,c])=>(c===1||c===14)&&i%160>=45&&i%160<=90&&Math.floor(i/160)<32).map(([i])=>i))+';\n');
Promise.all(['opening-agi-v2.png','opening-agi-v1.png'].map(file=>sharp(Buffer.from(A.rgba(pixels)),{raw:{width:160,height:168,channels:4}}).png().toFile(path.join(root,'assets/opening',file)))).then(()=>console.log('Opening imagegen redraw: '+commands.length+' editable native AGI commands.'));
