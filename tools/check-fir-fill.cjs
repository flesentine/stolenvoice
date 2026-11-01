const fs=require('fs'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
let checked=0;
for(const room of ['orchard','bridge']){
 const project=JSON.parse(fs.readFileSync('assets/rooms/'+room+'-workshop-v1.json'));
 const names=[...new Set(project.commands.filter(c=>c.name.startsWith('Fir ')).map(c=>c.name))];
 for(const name of names){
  const commands=project.commands.filter(c=>c.name===name),body=commands.find(c=>c.type==='polygon'&&c.points.length>10);
  assert(body,name+' has a single silhouette');assert.equal(commands.filter(c=>c.type==='polygon'&&c.color===2).length,1,name+' no redundant fill');
  const shape=A.render([{...body,color:1,outline:1}]),paint=A.render(commands);
  for(let n=0;n<paint.length;n++)if(paint[n]===2||paint[n]===10)assert.equal(shape[n],1,room+' '+name+' green stays inside silhouette at '+n%160+','+Math.floor(n/160));checked++;
 }
}
console.log('PASS '+checked+' native firs: foliage and highlights stay within their single outline.');
