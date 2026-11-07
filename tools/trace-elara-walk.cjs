// Directly reduce the generated 4x4 walking sheet to the game's EGA grid.
const sharp=require('sharp'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const idle=JSON.parse(fs.readFileSync(path.join(root,'assets/elara-direct-trace-v3.json'),'utf8'));
const rgb=idle.palette.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
(async()=>{
 const sheet=await sharp(path.join(root,'assets/elara-walk-reference-v1.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const side=await sharp(path.join(root,'assets/elara-walk-side-reference-v1.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const directions=['front','back','left','right'],frames=[],bounds={};
 const sourceDirections=['front','back','right'];
 const width=8,height=40,pixelAspect=5/3;
 for(let gy=0;gy<3;gy++)for(let gx=0;gx<4;gx++){
  const {data,info}=gy===2?side:sheet;
  const sx=Math.floor(gx*info.width/4),ex=Math.floor((gx+1)*info.width/4),sy=gy===2?0:Math.floor(gy*info.height/4),ey=gy===2?info.height:Math.floor((gy+1)*info.height/4);
  const seen=new Uint8Array(info.width*info.height),components=[];
  for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
   const p=y*info.width+x;if(seen[p]||data[p*4+3]<192)continue;
   const queue=[p];seen[p]=1;
   for(let cursor=0;cursor<queue.length;cursor++){
    const q=queue[cursor],qx=q%info.width,qy=Math.floor(q/info.width);
    for(const [nx,ny] of [[qx-1,qy],[qx+1,qy],[qx,qy-1],[qx,qy+1]]){
     if(nx<sx||nx>=ex||ny<sy||ny>=ey)continue;
     const n=ny*info.width+nx;if(seen[n]||data[n*4+3]<192)continue;
     seen[n]=1;queue.push(n);
    }
   }
   components.push(queue);
  }
  components.sort((a,b)=>b.length-a.length);
  if(!components.length)throw Error('Missing figure in cell '+gx+','+gy);
  // Keep substantial separate hands/shoes but discard isolated generation noise.
  const pixels=components.filter(c=>c.length>=components[0].length*.012).flat();
  let x0=ex,y0=ey,x1=sx,y1=sy;
  const mask=new Uint8Array(info.width*info.height);
  for(const p of pixels){const x=p%info.width,y=Math.floor(p/info.width);mask[p]=1;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  const sh=y1-y0+1;let headSum=0,headCount=0;
  for(const p of pixels){const x=p%info.width,y=Math.floor(p/info.width),o=p*4;
   if(y<y0+sh*.18&&data[o]>150&&data[o+1]>130&&data[o+2]<150){headSum+=x;headCount++}
  }
  const center=headCount?headSum/headCount:(x0+x1)/2;
  frames.push({direction:sourceDirections[gy],frame:gx,x0,y0,x1,y1,center,mask,data,info});
 }
 const views={};
 for(const direction of directions)views[direction]=[];
 for(const f of frames){
  const {data,info}=f;
  const sourceStep=Math.max(...frames.filter(other=>other.direction===f.direction).map(other=>other.y1-other.y0+1))/height;
  const rows=[],sourceXStep=sourceStep*pixelAspect;
  const sourceLeft=f.center-width*sourceXStep/2;
  const sourceTop=f.y1+1-height*sourceStep;
  bounds[f.direction+'-'+f.frame]={x:f.x0,y:f.y0,width:f.x1-f.x0+1,height:f.y1-f.y0+1,headCenter:f.center};
  for(let row=0;row<height;row++){
   let line='';
   for(let col=0;col<width;col++){
    const counts=new Uint32Array(16);let opaque=0,total=0;
    const ax=sourceLeft+col*sourceXStep,bx=ax+sourceXStep,ay=sourceTop+row*sourceStep,by=ay+sourceStep;
    for(let y=Math.ceil(ay);y<by;y++)for(let x=Math.ceil(ax);x<bx;x++){
     total++;if(x<0||x>=info.width||y<0||y>=info.height)continue;
     const p=y*info.width+x;if(!f.mask[p])continue;
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
  views[f.direction].push(rows);
 }
 views.left=views.right.map(cel=>cel.map(row=>[...row].reverse().join('')));
 // The passing pose has the arms and shoes closest to rest. Use the exact
 // same pixels for idle so stopping never switches to a differently drawn figure.
 const restFrame=1;
 const standingViews=Object.fromEntries(directions.map(direction=>[direction,views[direction][restFrame]]));
 const result={sources:['elara-walk-reference-v1.png','elara-walk-side-reference-v1.png'],width,height,pixelAspect,palette:idle.palette,restFrame,method:'common scale within direction; area-majority EGA reduction; yellow head center and ground baseline alignment; left mirrored from right; stopped movement holds the current frame',bounds,views};
 fs.writeFileSync(path.join(root,'assets/elara-walk-trace-v1.json'),JSON.stringify(result,null,2)+'\n');
 // Export the exact game cels as a transparent atlas and an aspect-correct preview.
 const atlasWidth=48,atlasHeight=176,atlas=Buffer.alloc(atlasWidth*atlasHeight*4);
 directions.forEach((direction,gy)=>views[direction].forEach((rows,gx)=>{
  rows.forEach((row,y)=>[...row].forEach((ink,x)=>{
   if(ink==='.')return;
   const color=rgb[parseInt(ink,16)],offset=((gy*44+y+2)*atlasWidth+gx*12+x+2)*4;
   atlas[offset]=color[0];atlas[offset+1]=color[1];atlas[offset+2]=color[2];atlas[offset+3]=255;
  }));
 }));
 await sharp(atlas,{raw:{width:atlasWidth,height:atlasHeight,channels:4}}).png().toFile(path.join(root,'assets/elara-walk-native-v1.png'));
 await sharp(atlas,{raw:{width:atlasWidth,height:atlasHeight,channels:4}}).resize(atlasWidth*10,atlasHeight*6,{kernel:'nearest',fit:'fill'}).png().toFile(path.join(root,'assets/elara-walk-preview-v1.png'));
 const htmlPath=path.join(root,'index.html');let html=fs.readFileSync(htmlPath,'utf8');
 const start=html.indexOf('// Direct indexed conversion of the generated reference'),end=html.indexOf('function changeRoom(',start);
 if(start<0||end<0)throw Error('Sprite replacement anchors not found');
 const spriteSource=`// Direct indexed conversion of the generated reference and walking sheet.
// Sources and exact pixels are retained in assets/elara-*-trace-*.json.
const elaraSprites=${JSON.stringify(standingViews)};
const elaraWalkSprites=${JSON.stringify(views)};
const elaraColors=${JSON.stringify(idle.palette)};
function hero(px,py){
 ellipse(px,py+1,7,1,'#000000');
 const facing=elaraSprites[player.facing]?player.facing:'front';
 const rows=elaraWalkSprites[facing][player.step%4];
 const left=pictureX(px)-4,top=pictureY(py)-39;
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
}
`;
 html=html.slice(0,start)+spriteSource+html.slice(end);
 const moveStart=html.indexOf('function movePlayer(dx,dy){'),moveEnd=html.indexOf('function norm(',moveStart);
 if(moveStart<0||moveEnd<0)throw Error('Movement replacement anchors not found');
 html=html.slice(0,moveStart)+`function movePlayer(dx,dy){
 if(!playing||popupOpen)return;
 const nextX=Math.max(12,Math.min(308,player.x+dx));
 const nextY=Math.max(walkFloors[room],Math.min(220,player.y+dy));
 player.facing=dx<0?'left':dx>0?'right':dy<0?'back':'front';
 if(nextX===player.x&&nextY===player.y){draw();return}
 player.x=nextX;player.y=nextY;
 // Keep this exact cel when movement stops; no delayed idle pose swap.
 player.step++;
 draw();
}
`+html.slice(moveEnd);
 fs.writeFileSync(htmlPath,html);
 console.log('Converted and installed 4 walking cels for each direction at 8x40 native pixels.');
})();
