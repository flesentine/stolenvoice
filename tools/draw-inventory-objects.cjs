// Authored AGI line/fill redraws from inventory-reference-v1.png; no sampling.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/inventory');
const names=['workshop key','rose','silver bell','oil flask','twine','wooden plank','rusty shears','pruning shears','beeswax','glass jar','echo jar','sealed echo','voice jar'];
const art={};
function draw(name){
 const commands=[];
 const p=(label,points,color,outline=null)=>commands.push({type:'polygon',name:label,points:points.map(([x,y])=>[x+64,y+64]),color,outline});
 const l=(label,points,color)=>commands.push({type:'line',name:label,points:points.map(([x,y])=>[x+64,y+64]),color});
 const r=(label,x,y,w,h,c,e=null)=>p(label,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
 if(name==='workshop key'){
  p('Key bow',[[5,4],[8,2],[12,2],[15,5],[15,10],[12,13],[8,13],[5,10]],6,8);
  p('Bow opening',[[8,5],[12,5],[12,9],[8,9]],15,6);
  p('Brass shaft and teeth',[[13,11],[16,10],[27,21],[27,26],[24,26],[24,23],[21,23],[21,20]],6,8);
  l('Key glint',[[7,4],[11,3],[13,5]],14);l('Shaft light',[[15,12],[25,22]],14);
 }else if(name==='rose'){
  l('Long stiff stem',[[15,10],[15,21],[17,26]],2);
  p('Left leaf',[[14,18],[10,13],[6,13],[8,17],[13,19]],2);l('Leaf light',[[8,14],[11,16]],10);
  p('Right leaf',[[15,22],[18,17],[23,16],[21,20],[17,22]],2);l('Leaf light',[[18,20],[21,18]],10);
  p('Rose sepals',[[11,10],[13,14],[17,13],[20,9]],2);
  p('Outer red petals',[[8,5],[11,3],[14,4],[16,1],[20,3],[20,5],[23,6],[22,10],[19,12],[13,11],[10,9]],4,4);
  p('Lit rose petals',[[9,5],[12,4],[14,6],[17,4],[20,5],[20,8],[17,10],[13,9]],12);
  l('Folded petal',[[11,6],[14,8],[18,7],[19,5],[16,4],[15,5],[17,6]],4);
  l('Petal glint',[[10,6],[11,8],[13,8]],15);
 }else if(name==='silver bell'){
  p('Bell handle',[[13,3],[17,3],[18,5],[17,9],[13,9],[12,5]],6,8);
  l('Handle highlight',[[14,4],[16,4],[16,7]],14);
  p('Silver bell crown',[[11,10],[14,8],[17,8],[20,11],[21,18],[25,23],[25,25],[6,25],[6,23],[10,18]],7,8);
  p('Bell shaded return',[[17,10],[19,12],[20,19],[23,23],[18,23]],8);
  l('Silver bell gleam',[[13,11],[12,14],[12,18],[10,21]],15);
  l('Bell mouth',[[7,24],[24,24]],0);
  l('Bell lip',[[7,23],[24,23]],15);
  p('Attached clapper',[[14,25],[17,25],[17,27],[14,27]],8);
 }else if(name==='oil flask'){
  p('Blue flask silhouette',[[8,10],[10,7],[10,5],[16,5],[16,9],[20,12],[24,7],[28,3],[30,3],[26,9],[22,16],[21,22],[18,25],[10,25],[6,22],[5,16]],1,1);
  p('Flask light plane',[[9,12],[12,10],[15,11],[17,14],[16,23],[10,23],[7,20],[7,16]],9);
  l('Glass highlight',[[9,14],[8,16],[8,19]],11);l('Spout light',[[22,13],[26,7],[29,4]],9);
  r('Metal neck',10,4,7,3,7,8);p('Oil stopper',[[11,4],[12,2],[15,2],[16,4]],8);l('Cap light',[[12,3],[14,3]],15);
 }else if(name==='twine'){
  p('Coil silhouette',[[3,11],[7,6],[14,4],[23,6],[28,10],[29,17],[26,22],[16,25],[7,23],[3,19]],6,6);
  for(const pts of [[[5,11],[9,7],[16,6],[24,9],[26,12],[24,17],[17,20],[9,19],[5,16],[5,11]],[[8,12],[11,9],[17,8],[23,11],[23,14],[19,17],[12,17],[8,15],[8,12]],[[5,20],[10,22],[18,23],[25,20]]])l('Twine winding',pts,14);
  p('Coil opening',[[11,12],[15,10],[20,12],[20,14],[15,16],[11,14]],15);
  l('Loose twine end',[[26,20],[29,22],[30,26]],6);l('Twine end light',[[27,21],[29,23]],14);
 }else if(name==='wooden plank'){
  p('Oak board',[[3,21],[22,2],[29,7],[10,26]],6,6);
  p('End grain',[[3,21],[10,26],[10,27],[3,23]],6,8);
  l('Board lit edge',[[4,21],[22,3],[27,7]],14);
  l('Oak grain',[[8,20],[14,14],[18,9],[23,6]],8);l('Second grain',[[11,22],[16,17],[24,10]],14);
  p('Wood knot',[[15,16],[17,13],[19,13],[18,16],[16,18]],8);l('Knot center',[[16,16],[17,15]],6);
 }else if(name.includes('shears')){
  const rusty=name==='rusty shears',steel=rusty?6:7,shade=rusty?4:8,light=rusty?14:15;
  p('Upper curved blade',[[15,14],[16,7],[20,2],[22,1],[21,7],[19,13],[17,16]],steel,shade);
  p('Lower curved blade',[[17,15],[23,11],[27,5],[28,4],[28,11],[24,16],[19,18]],steel,shade);
  l('Blade edge',[[17,11],[19,5],[21,3]],light);l('Second blade edge',[[21,15],[25,12],[27,8]],light);
  p('Left red handle',[[14,14],[10,15],[5,19],[3,23],[5,26],[9,25],[14,20],[16,17]],4,4);
  p('Left finger opening',[[11,17],[7,20],[5,23],[6,24],[9,23],[12,20]],15);
  p('Right red handle',[[18,17],[21,19],[23,24],[22,27],[18,27],[17,24],[18,21],[16,19]],4,4);
  p('Right finger opening',[[19,21],[20,23],[21,25],[19,25],[19,23]],15);
  l('Red handle highlight',[[5,20],[9,17],[12,16]],12);l('Right handle highlight',[[20,20],[22,24]],12);
  r('Metal pivot',15,14,3,3,8);r('Pivot cap',16,14,1,1,15);
  if(rusty){l('Rust pit',[[18,8],[19,9]],4);l('Second rust pit',[[25,12],[24,13]],4)}
 }else if(name==='beeswax'){
  p('Beeswax lump',[[5,17],[8,10],[15,6],[20,7],[26,13],[28,21],[23,25],[11,25],[5,22]],14,6);
  p('Wax dark face',[[19,11],[24,13],[27,21],[23,24],[19,24],[17,17]],6);
  for(const [x,y]of [[13,12],[19,14],[22,19]])l('Honeycomb cell',[[x,y-2],[x+2,y-1],[x+2,y+2],[x,y+3],[x-2,y+1],[x-2,y-1],[x,y-2]],6);
  l('Soft wax highlight',[[7,18],[9,13],[13,10]],15);
 }else{
  p('Jar outline',[[9,6],[8,4],[9,2],[22,2],[24,4],[23,6],[25,9],[26,11],[26,23],[23,26],[9,26],[6,23],[6,11]],3,3);
  p('Clear glass interior',[[10,7],[22,7],[24,11],[24,22],[22,24],[10,24],[8,22],[8,11]],15);
  l('Jar rim shine',[[10,3],[21,3]],11);l('Jar mouth',[[10,5],[21,5]],3);
  l('Left glass edge',[[8,12],[8,21],[10,23]],11);l('Right glass edge',[[23,11],[23,22],[21,24]],11);l('Glass base',[[11,25],[21,25]],11);
  if(name!=='glass jar'){
   const voice=name==='voice jar',c=voice?6:1,h=voice?14:9;
   l('Echo sound ribbon',[[18,9],[14,12],[14,14],[19,17],[19,19],[14,22],[17,23]],c);
   l('Ribbon lit side',[[19,10],[16,12],[16,14],[21,17],[21,19],[17,22]],h);
   r('Echo sparkle',11,11,0,0,h);r('Echo sparkle',21,21,0,0,h);
  }
  if(['sealed echo','voice jar'].includes(name)){
   p('Red wax seal',[[8,3],[10,1],[22,1],[24,3],[23,6],[21,6],[21,8],[19,7],[17,6],[12,6],[11,8],[9,7]],4,4);
   l('Wax top highlight',[[10,2],[15,2],[17,3],[21,2]],12);r('Wax stamp',14,3,4,3,4,12);
  }
 }
 // Compensate for the wide AGI pixels: round objects need narrow native x spans.
 const xScale=name.includes('jar')||name==='sealed echo'?0.6:name==='rose'?0.75:name==='silver bell'?0.7:name.includes('shears')?0.8:name==='beeswax'?0.85:1;
 for(const command of commands)command.points=command.points.map(([x,y])=>[Math.round(80+(x-80)*xScale),y]);
 const authored={format:'agi-picture-workshop',version:1,name,room:'inventory',width:160,height:168,palette:Agi.palette,reference:'../assets/inventory/inventory-reference-v1.png',spriteRegion:[64,64,32,28],notes:'Hand-authored line-and-fill redraw of generated reference. Native pixels; no raster sampling.',commands};
 const target=path.join(out,name.replaceAll(' ','-')+'-workshop-v1.json');
 const project=fs.existsSync(target)&&!process.argv.includes('--force')?Agi.project(JSON.parse(fs.readFileSync(target,'utf8'))):Agi.project(authored);
 if(!fs.existsSync(target)||process.argv.includes('--force'))fs.writeFileSync(target,JSON.stringify(project,null,2)+'\n');
 const full=Agi.render(project.commands),pixels=[];for(let y=64;y<92;y++)for(let x=64;x<96;x++)pixels.push(full[y*160+x]);
 const runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}
 art[name]=Buffer.from(runs).toString('base64');
 return project;
}
const projects=names.map(draw);fs.writeFileSync(path.join(root,'game/inventory-pictures.js'),'const inventoryPictures='+JSON.stringify(art)+';\n');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({names,reference:'inventory-reference-v1.png',method:'Authored AGI drawer commands; 32x28 native object cels',projects:projects.map(p=>p.name.replaceAll(' ','-')+'-workshop-v1.json')},null,2)+'\n');
console.log('Drew '+names.length+' inventory states with editable AGI commands.');
