// Partial clearing cels, rendered from the current orchard and real underpainting.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
const project=JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/orchard-workshop-v1.json'))),cut=[];let group='';
require('./draw-blackthorn.cjs')({named:n=>group=n,fill:(points,color)=>cut.push({type:'polygon',name:group,points,color,outline:null}),stroke:(points,color)=>cut.push({type:'line',name:group,points,color})},true);
const intact=A.render(project.commands),cleared=A.render([...project.commands.filter(c=>!c.name.startsWith('Blackthorn')), ...cut]);
function encode(pixels){const runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}return Buffer.from(runs).toString('base64')}
const frames=[138,146,153,159].map(edge=>{const p=intact.slice();for(let y=123;y<=151;y++)for(let x=139;x<=edge;x++)p[y*160+x]=cleared[y*160+x];return encode(p)});
fs.writeFileSync(path.join(root,'game/thorn-pictures.js'),'const thornCutPictures='+JSON.stringify(frames)+';\n');
console.log('Built four native blackthorn clearing stages.');
