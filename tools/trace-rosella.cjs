// Convert the generated reference into indexed AGI pixels, preserving display aspect.
// Run with Node.js and sharp available on NODE_PATH. No generated art is repainted.
const sharp=require('sharp');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const palette=['000000','0000aa','00aa00','00aaaa','aa0000','aa00aa','aa5500','aaaaaa','555555','5555ff','55ff55','55ffff','ff5555','ff55ff','ffff55','ffffff'];
const rgb=palette.map(h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)));
(async()=>{
 const {data,info}=await sharp(path.join(root,'assets/rosella-turnaround-reference-v2.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const width=8,height=40,pixelAspect=5/3,views={},bounds={};
 for(const [name,panel] of [['front',0],['back',1],['right',2]]){
  const start=Math.floor(info.width*panel/4),end=Math.floor(info.width*(panel+1)/4);
  const seen=new Uint8Array(info.width*info.height);let largest=[];
  for(let yy=0;yy<info.height;yy++)for(let xx=start;xx<end;xx++){
   const index=yy*info.width+xx;if(seen[index]||data[index*4+3]<192)continue;
   const queue=[index];seen[index]=1;
   for(let cursor=0;cursor<queue.length;cursor++){
    const p=queue[cursor],x=p%info.width,y=Math.floor(p/info.width);
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
     if(nx<start||nx>=end||ny<0||ny>=info.height)continue;
     const n=ny*info.width+nx;if(seen[n]||data[n*4+3]<192)continue;
     seen[n]=1;queue.push(n);
    }
   }
   if(queue.length>largest.length)largest=queue;
  }
  if(!largest.length)throw Error('No opaque figure in '+name);
  let x0=info.width,y0=info.height,x1=0,y1=0;
  const mask=new Uint8Array(info.width*info.height);
  for(const p of largest){const x=p%info.width,y=Math.floor(p/info.width);mask[p]=1;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const sw=x1-x0+1,sh=y1-y0+1;
  const inkWidth=Math.min(width,Math.max(1,Math.round(sw/sh*height/pixelAspect)));
  const pad=Math.floor((width-inkWidth)/2),rows=[];
  bounds[name]={x:x0,y:y0,width:sw,height:sh,inkWidth};
  for(let row=0;row<height;row++){
   let line='';
   for(let col=0;col<width;col++){
    if(col<pad||col>=pad+inkWidth){line+='.';continue}
    const counts=new Uint32Array(16);let opaque=0,total=0;
    const ax=x0+(col-pad)*sw/inkWidth,bx=x0+(col-pad+1)*sw/inkWidth;
    const ay=y0+row*sh/height,by=y0+(row+1)*sh/height;
    for(let y=Math.ceil(ay);y<by;y++)for(let x=Math.ceil(ax);x<bx;x++){
     total++;const p=y*info.width+x;if(!mask[p])continue;
     const offset=p*4;let best=0,distance=Infinity;
     for(let n=0;n<16;n++){const c=rgb[n];const d=(data[offset]-c[0])**2+(data[offset+1]-c[1])**2+(data[offset+2]-c[2])**2;if(d<distance){distance=d;best=n}}
     counts[best]++;opaque++;
    }
    if(opaque<total*.38){line+='.';continue}
    let best=0;for(let n=1;n<16;n++)if(counts[n]>counts[best])best=n;
    line+=best.toString(16);
   }
   rows.push(line);
  }
  views[name]=rows;
 }
 views.left=views.right.map(row=>[...row].reverse().join(''));
 const trace={source:'rosella-turnaround-reference-v2.png',method:'connected opaque component; area-majority EGA colors; corrected pixel aspect',width,height,pixelAspect,palette:palette.map(h=>'#'+h),bounds,views};
 fs.writeFileSync(path.join(root,'assets/rosella-direct-trace-v3.json'),JSON.stringify(trace,null,2)+'\n');
 const htmlPath=path.join(root,'index.html');let html=fs.readFileSync(htmlPath,'utf8');
 let a=html.indexOf('// Compact trace of assets/rosella-turnaround');
 if(a<0)a=html.indexOf('// Direct indexed conversion of the generated reference');
 const b=html.indexOf('function changeRoom(',a);
 if(a<0||b<0)throw Error('Sprite replacement anchors not found');
 const source=`// Direct indexed conversion of the generated reference, not an invented redraw.
// See assets/rosella-direct-trace-v3.json and tools/trace-rosella.cjs.
const rosellaSprites=${JSON.stringify(views,null,1)};
const rosellaColors=${JSON.stringify(trace.palette)};
function hero(px,py){
 ellipse(px,py+1,7,1,'#000000');
 const rows=rosellaSprites[player.facing]||rosellaSprites.front;
 const left=pictureX(px)-4,top=pictureY(py)-39;
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
}
`;
 html=html.slice(0,a)+source+html.slice(b);fs.writeFileSync(htmlPath,html);
 console.log('Converted source figures to indexed 8x40 cels:',JSON.stringify(bounds));
})();
