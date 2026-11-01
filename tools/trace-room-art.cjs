// Render authored AGI-style line-and-fill pictures to native EGA assets.
// The original tool name remains for build compatibility. Generated images
// are composition references only: none are opened or sampled by this tool.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/rooms');
const names=['potting','orchard','bridge','mill','grotto','belfry','courtyard','gallery'];
const palette=['000000','0000aa','00aa00','00aaaa','aa0000','aa00aa','aa5500','aaaaaa','555555','5555ff','55ff55','55ffff','ff5555','ff55ff','ffff55','ffffff'];
const colors=palette.map(h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)));
const references=JSON.parse(fs.readFileSync(path.join(out,'active-reference-map.json'),'utf8'));
const W=160,H=168;
const Agi=require('../editor/agi-picture.js');
function paint(name){
 const project=Agi.project(JSON.parse(fs.readFileSync(path.join(out,name+'-workshop-v1.json'),'utf8')));
 return {pixels:Agi.render(project.commands),commands:project.commands};
}
function encode(indices){
 const runs=[];
 for(let n=0;n<indices.length;){let end=n+1;while(end<indices.length&&indices[end]===indices[n]&&end-n<255)end++;runs.push(end-n,indices[n]);n=end}
 return Buffer.from(runs).toString('base64');
}
(async()=>{
 const pictures={},tiles=[];
 for(const name of names){
  const {pixels,commands}=paint(name),rgb=Buffer.alloc(W*H*3);
  for(let n=0;n<pixels.length;n++)for(let k=0;k<3;k++)rgb[n*3+k]=colors[pixels[n]][k];
  const png=await sharp(rgb,{raw:{width:W,height:H,channels:3}}).png().toBuffer();
  fs.writeFileSync(path.join(out,name+'-agi-v1.png'),png);
  fs.writeFileSync(path.join(out,'traces',name+'.json'),JSON.stringify({width:W,height:H,palette,compositionReference:references[name],method:'Complete authored integer-pixel lines and filled polygons; reference raster is not sampled',commands})+'\n');
  pictures[name]=encode(pixels);
  if(name==='orchard'){const cleared=commands.filter(c=>!c.name.startsWith('Blackthorn')),cut=[];let group='Cut blackthorn';require('./draw-blackthorn.cjs')({named:n=>group=n,fill:(points,color)=>cut.push({type:'polygon',points,color,outline:null,name:group}),stroke:(points,color)=>cut.push({type:'line',points,color,name:group})},true);pictures['orchard-cleared']=encode(Agi.render([...cleared,...cut]));}
  tiles.push(await sharp(png).resize(480,302,{fit:'fill',kernel:'nearest'}).png().toBuffer());
  console.log(name+': '+commands.length+' authored drawing commands');
 }
 fs.writeFileSync(path.join(root,'game/room-pictures.js'),'const roomPictures='+JSON.stringify(pictures)+';\n');
 await sharp({create:{width:1456,height:922,channels:3,background:'#000000'}}).composite(tiles.map((input,i)=>({input,left:(i%3)*488,top:Math.floor(i/3)*310}))).png().toFile(path.join(out,'agi-room-preview.png'));
})();
