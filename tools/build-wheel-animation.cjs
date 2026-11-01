// Native integer-grid wheel cels: each begins with the authored room picture.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
const root=path.resolve(__dirname,'..'),output={};
function encode(p){const a=[];for(let i=0;i<p.length;){let end=i+1;while(end<p.length&&p[end]===p[i]&&end-i<255)end++;a.push(end-i,p[i]);i=end}return Buffer.from(a).toString('base64')}
for(const room of ['bridge','mill']){
 const project=JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/'+room+'-workshop-v1.json')));
 output[room]=[];
 for(let frame=0;frame<6;frame++){
  if(room==='bridge'){
   const commands=[];require('./draw-waterwheel.cjs')({fill:(points,color,outline)=>commands.push({type:'polygon',name:'Outside waterwheel',points,color,outline}),stroke:(points,color)=>commands.push({type:'line',name:'Outside waterwheel',points,color})},frame*Math.PI/18);
   const first=project.commands.findIndex(c=>c.name==='Outside waterwheel');
   const combined=[...project.commands.slice(0,first),...commands,...project.commands.slice(first).filter(c=>c.name!=='Outside waterwheel')];
   output[room].push(encode(Agi.render(combined)));continue;
  }
  const phase=frame*Math.PI/24,make=(name,paint)=>{
   const commands=[];paint({fill:(points,color,outline)=>commands.push({type:'polygon',name,points,color,outline}),stroke:(points,color)=>commands.push({type:'line',name,points,color})},phase);return commands;
  };
  const replacement={
   'Mill wheel assembly':make('Mill wheel assembly',require('./draw-mill-wheel.cjs')),
   'Small meshing gear':make('Small meshing gear',require('./draw-mill-wheel.cjs').gear)
  },seen=new Set(),combined=[];
  for(const command of project.commands){
   if(replacement[command.name]){if(!seen.has(command.name)){combined.push(...replacement[command.name]);seen.add(command.name)}}else combined.push(command);
  }
  if(seen.size!==2)throw Error('Mill rotor/gear drawing groups missing');
  output[room].push(encode(Agi.render(combined)));
 }
}
fs.writeFileSync(path.join(root,'game/wheel-pictures.js'),'const wheelPictures='+JSON.stringify(output)+';\n');
console.log('Built six native EGA wheel cels for bridge and mill.');
