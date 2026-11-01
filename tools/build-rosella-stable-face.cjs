// Walking changes the limbs, never the shape/position of facial features.
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
module.exports=function(){
 const original=JSON.parse(fs.readFileSync(path.join(root,'stolen-voice-short.html'),'utf8').match(/const rosellaWalkSprites=(\{[^\n]+\});/)[1]);
 const views={};
 for(const direction of ['front','back','left','right']){
  const head=original[direction][0].slice(0,12);
  if(direction==='front')head[5]=head[5].slice(0,5)+'1'+head[5].slice(6);
  if(direction==='right')head[4]=head[4].slice(0,5)+'1'+head[4].slice(6);
  if(direction==='left')head[4]=head[4].slice(0,2)+'1'+head[4].slice(3);
  views[direction]=original[direction].map(rows=>[...head,...rows.slice(12)]);
 }
 // Contrast only: retain every original boot pixel and every walk silhouette.
 for(const direction of Object.keys(views))views[direction]=views[direction].map(rows=>{
  const out=rows.map(r=>[...r]),pending=new Set();
  for(let y=36;y<40;y++)for(let x=0;x<8;x++)if(rows[y][x]==='6')pending.add(y*8+x);
  while(pending.size){
   const first=pending.values().next().value;pending.delete(first);const component=[first],queue=[first];
   while(queue.length){const n=queue.pop(),x=n%8,y=Math.floor(n/8);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=x+dx,ny=y+dy,j=ny*8+nx;if(nx>=0&&nx<8&&ny>=36&&ny<40&&pending.delete(j)){component.push(j);queue.push(j)}}}
   const sole=new Set();for(const n of component){const x=n%8,y=Math.floor(n/8);if(!component.includes(n+8)){out[y][x]='0';sole.add(n)}}
   const heel=direction==='left'?Math.max(...component.map(n=>n%8)):Math.min(...component.map(n=>n%8));
   const bottom=Math.max(...component.map(n=>Math.floor(n/8)));if(bottom-1>=36&&rows[bottom-1]?.[heel]==='6')out[bottom-1][heel]='0';
   const highlight=component.filter(n=>!sole.has(n)&&out[Math.floor(n/8)][n%8]==='6').sort((a,b)=>Math.floor(a/8)-Math.floor(b/8)||(direction==='left'?a%8-b%8:b%8-a%8))[0];
   if(highlight!==undefined)out[Math.floor(highlight/8)][highlight%8]='e';
  }
  return out.map(r=>r.join(''));
 });
 const result={width:8,height:40,headRows:12,method:'Original first-cel head held steady in each direction; mirrored one-pixel profile eyes; original animated body rows preserved; boot pixels gain dark soles/heels and one warm highlight.',views};
 fs.writeFileSync(path.join(root,'assets/rosella-walk-stable-face-v2.json'),JSON.stringify(result,null,2)+'\n');return views;
};
