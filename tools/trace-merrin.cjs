// Convert the generated gardener reference to a native, palette-indexed AGI cel.
const sharp=require('sharp'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const palette=JSON.parse(fs.readFileSync(path.join(root,'assets/elara-direct-trace-v3.json'),'utf8')).palette;
const rgb=palette.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
(async()=>{
 const {data,info}=await sharp(path.join(root,'assets/merrin-reference-v1.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const seen=new Uint8Array(info.width*info.height),components=[];
 for(let i=0;i<seen.length;i++){
  if(seen[i]||data[i*4+3]<192)continue;
  const queue=[i];seen[i]=1;
  for(let cursor=0;cursor<queue.length;cursor++){
   const p=queue[cursor],x=p%info.width,y=Math.floor(p/info.width);
   for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
    if(nx<0||nx>=info.width||ny<0||ny>=info.height)continue;
    const n=ny*info.width+nx;if(seen[n]||data[n*4+3]<192)continue;
    seen[n]=1;queue.push(n);
   }
  }
  components.push(queue);
 }
 components.sort((a,b)=>b.length-a.length);
 if(!components.length)throw Error('No opaque gardener found');
 const pixels=components.filter(c=>c.length>=components[0].length*.008).flat(),mask=new Uint8Array(seen.length);
 let x0=info.width,y0=info.height,x1=0,y1=0;
 for(const p of pixels){mask[p]=1;const x=p%info.width,y=Math.floor(p/info.width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const width=8,height=38,sw=x1-x0+1,sh=y1-y0+1;
 const inkWidth=Math.min(width,Math.max(1,Math.round(sw/sh*height/(5/3)))),pad=Math.floor((width-inkWidth)/2),rows=[];
 for(let row=0;row<height;row++){
  let line='';
  for(let col=0;col<width;col++){
   if(col<pad||col>=pad+inkWidth){line+='.';continue}
   const counts=new Uint32Array(16);let opaque=0,total=0;
   const ax=x0+(col-pad)*sw/inkWidth,bx=x0+(col-pad+1)*sw/inkWidth,ay=y0+row*sh/height,by=y0+(row+1)*sh/height;
   for(let y=Math.ceil(ay);y<by;y++)for(let x=Math.ceil(ax);x<bx;x++){
    total++;const p=y*info.width+x;if(!mask[p])continue;
    const o=p*4;let best=0,distance=Infinity;
    for(let n=0;n<16;n++){const c=rgb[n],d=(data[o]-c[0])**2+(data[o+1]-c[1])**2+(data[o+2]-c[2])**2;if(d<distance){distance=d;best=n}}
    counts[best]++;opaque++;
   }
   if(opaque<total*.38){line+='.';continue}
   let best=0;for(let n=1;n<16;n++)if(counts[n]>counts[best])best=n;
   line+=best.toString(16);
  }
  rows.push(line);
 }
 const trace={source:'merrin-reference-v1.png',width,height,palette,bounds:{x:x0,y:y0,width:sw,height:sh},rows};
 fs.writeFileSync(path.join(root,'assets/merrin-trace-v1.json'),JSON.stringify(trace,null,2)+'\n');
 const htmlPath=path.join(root,'index.html');let html=fs.readFileSync(htmlPath,'utf8');
 const propStart=html.indexOf('// Merrin and the two garden puzzle objects');
 let a=html.indexOf('prop(204,()=>{',propStart);
 if(a<0)a=html.indexOf('prop(204,()=>gardener(60,204));',propStart);
 const b=html.indexOf('prop(201,()=>{',a);
 if(a<0||b<0)throw Error('Gardener prop anchors not found');
 html=html.slice(0,a)+'prop(204,()=>gardener(60,204));\n'+html.slice(b);
 const source=`// Direct EGA conversion of assets/merrin-reference-v1.png.
const merrinSprite=${JSON.stringify(rows)};
function gardener(px,py){
 ellipse(px,py+1,8,1,'#000000');
 const left=pictureX(px)-4,top=pictureY(py)-37;
 for(let row=0;row<38;row++)for(let col=0;col<8;col++){
  const ink=merrinSprite[row][col];if(ink==='.')continue;
  x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
}
`;
 const oldSource=html.indexOf('// Direct EGA conversion of assets/merrin-reference-v1.png.');
 if(oldSource>=0)html=html.slice(0,oldSource)+html.slice(html.indexOf('function gallery(){',oldSource));
 html=html.replace('function gallery(){',source+'function gallery(){');
 fs.writeFileSync(htmlPath,html);
 console.log('Replaced the block gardener with an 8x38 EGA reference conversion.');
})();
