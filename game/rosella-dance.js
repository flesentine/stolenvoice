// A courtly turn in place. Reuse her measured head/walking cels; only pose
// pixels move, never her world position or collision baseline.
function rosellaDanceChoreography(frame,reflected=false){
 if(storyAction?.kind==='courtDance'&&storyAction.room===2)frame=frame<192?frame%48:frame<220?frame-192:44+frame-220;
 const danceFrame=Math.max(0,frame),twirl=danceFrame>=24&&danceFrame<44;
 frame=frame>=44?27:Math.max(0,frame)%24;
 const beat=Math.min(6,Math.floor(frame/4)),step=beat===0||beat===6?player.step%4:[1,0,1,2,3,0,1][beat];
 const turn=['front','left','back','right'],origin=Math.max(0,turn.indexOf(player.facing));
 const rotation=twirl?(danceFrame<40?Math.floor((danceFrame-24)/2)%4:0):[0,1,2,3,0,0,0][beat];
 let facing=turn[(origin+rotation)%4];
 if(reflected)facing={front:'back',back:'front',left:'left',right:'right'}[facing];
 const active=twirl||(frame>=2&&frame<24),sway=active?Math.round(Math.sin(frame*Math.PI/8)):0;
 return{danceFrame,twirl,frame,beat,step,facing,active,sway};
}
function rosellaDanceSprite(frame,reflected=false){
 const pose=rosellaDanceChoreography(frame,reflected);
 const {danceFrame,twirl,beat,step,facing,active,sway}=pose;frame=pose.frame;
 const rows=rosellaWalkSprites[facing][step],out=Array.from({length:40},()=>Array(14).fill('.'));
 // In profile, the idle arm covers much of the torso. Paint the blouse and
 // dress underneath before removing that arm to bend it into a new pose.
 if(active&&(facing==='left'||facing==='right')){
  const left=(facing==='left'?3:2)+3+sway;
  for(let row=14;row<=24;row++)for(let col=left;col<left+3;col++)out[row][col]=row<16?'f':row<20?'1':'9';
 }
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  if(active&&row>=14&&row<=24&&(ink==='c'||(ink==='f'&&(col<2||col>5))))continue;
  const shift=row<25||twirl?sway:0;out[row][col+3+shift]=ink;
 }
 if(active){
  // Turn the arms with the torso. Profile views have one visible bent arm,
  // rather than keeping the front-facing pair pinned across the screen.
  const bob=Math.round(Math.sin(frame*Math.PI/4));
  const line=(a,b,ink)=>{
   let [x,y]=a;const [ex,ey]=b,dx=Math.abs(ex-x),dy=-Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;let error=dx+dy;
   for(;;){for(let thick=0;thick<2;thick++)if(x>=0&&x<14&&y+thick>=0&&y+thick<40)out[y+thick][x]=ink;
    if(x===ex&&y===ey)break;const twice=error*2;if(twice>=dy){error+=dy;x+=sx}if(twice<=dx){error+=dx;y+=sy}
   }
  };
  const arm=(root,elbow,hand)=>{line(root,elbow,'f');line(elbow,hand,'c')};
  if(facing==='left'||facing==='right'){
   const side=facing==='left'?-1:1,root=[(side<0?6:7)+sway,14];
   arm(root,[root[0]+side*2,16+bob],[root[0]+side*3,12+bob]);
  }else for(const side of [-1,1]){
   const root=[(side<0?4:9)+sway,14],lift=facing==='back'?2:-2;
   arm(root,[root[0]+side,15+bob],[root[0]+side*2,14+lift-bob]);
  }
  // A small hem flare preserves her dress colors and leaves her feet grounded.
  for(let row=30;row<37;row++)for(const side of [-1,1]){
   const col=side<0?3:10,ink=rows[row][side<0?0:7];
   if(['1','9'].includes(ink))out[row][col+side]=ink;
  }
 }
 if(twirl){
  const lift=Math.round(Math.sin((danceFrame-24)*Math.PI/19)*9),hem=36-lift;
  if(lift){
   // The second phrase becomes a quick double turn. The skirt fans out
   // from her waist, showing knees and calves while her feet pivot in place.
   // Each facing cel has a slightly different hip position. Anchor the
   // whole lower pose to that actual waist, including the torso's sway.
   const waist=out[23].map((ink,col)=>['1','9'].includes(ink)?col:-1).filter(col=>col>=0),center=Math.round((waist[0]+waist.at(-1))/2);
   for(let row=24;row<40;row++)out[row].fill('.');
   for(let row=24;row<hem;row++){
    const spread=Math.round((row-24)/Math.max(1,hem-25)*4),left=Math.max(0,center-2-spread),right=Math.min(13,center+2+spread);
    for(let col=left;col<=right;col++)out[row][col]=(col+Math.floor((danceFrame-24)/2))%5===0?'1':'9';
   }
   const profile=facing==='left'||facing==='right',legs=(profile?[-1,0,1]:[-2,-1,1,2]).map(offset=>center+offset);
   for(let row=hem;row<=36;row++)for(const col of legs)out[row][col]='c';
   for(let row=37;row<39;row++)for(const col of legs)out[row][col]='6';
   out[39][center-(profile?1:3)]='6';out[39][center+(profile?1:3)]='6';
  }
 }
 return out.map(row=>row.join(''));
}
function drawRosellaDance(px,py){
 const rows=rosellaDanceSprite(storyAction.frame),left=pictureX(px)-7,top=pictureY(py)-39;
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<14;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
}

// All guests emerge behind the barrel. Plan floor routes around Rosella's
// full dancing silhouette, so the middle rat never runs beneath her dress.
function workshopRatRoutes(){
 if(storyAction.workshopRatRoutes)return storyAction.workshopRatRoutes;
 const cx=pictureX(player.x),feet=pictureY(player.y),valid=(x,y)=>x>=10&&x<=151&&y>=136&&y<=163&&!(Math.abs(x-cx)<16&&y<=feet+13);
 const exits=[[151,136],[126,136],[120,136],[151,163],[120,163]];
 const exit=exits.find(([x,y])=>valid(x,y));
 const previous=new Map(),queue=[exit],key=(x,y)=>y*160+x;previous.set(key(...exit),null);
 for(let n=0;n<queue.length;n++){
  const [x,y]=queue[n];for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y+1],[x,y-1]])if(valid(xx,yy)&&!previous.has(key(xx,yy))){previous.set(key(xx,yy),[x,y]);queue.push([xx,yy])}
 }
 const chosen=[],desired=[[cx-26,feet+9],[cx,feet+18],[cx+26,feet+9]],source=[140,125];
 const routes=desired.map(([tx,ty])=>{
  const candidates=queue.filter(([x,y])=>chosen.every(([a,b])=>Math.abs(x-a)>=14||Math.abs(y-b)>=12));
  candidates.sort((a,b)=>(a[0]-tx)**2+(a[1]-ty)**2-((b[0]-tx)**2+(b[1]-ty)**2));
  const target=candidates[0];chosen.push(target);
  const path=[];for(let point=target;point;point=previous.get(key(...point)))path.push(point);path.reverse();
  const lead=[],steps=Math.max(Math.abs(exit[0]-source[0]),Math.abs(exit[1]-source[1]));
  for(let n=0;n<steps;n++)lead.push([Math.round(source[0]+(exit[0]-source[0])*n/steps),Math.round(source[1]+(exit[1]-source[1])*n/steps)]);
  return [...lead,...path];
 });
 return storyAction.workshopRatRoutes=routes;
}
function workshopMousePoses(frame){
 if(room!==2||storyAction?.kind!=='courtDance'||frame<8||frame>=220)return[];
 const dance=rosellaDanceChoreography(frame);
 return workshopRatRoutes().map((path,i)=>{
  const start=8+i*6,end=208+i*6;if(frame<start||frame>=end)return null;
  const duration=Math.ceil((path.length-1)/2.6),t=Math.max(0,Math.min(1,(frame-start)/duration,(end-frame)/duration));
  const index=t*(path.length-1),a=path[Math.floor(index)],b=path[Math.min(path.length-1,Math.ceil(index))],fraction=index%1;
  return{x:Math.round(a[0]+(b[0]-a[0])*fraction+(t===1?dance.sway:0)),y:Math.round(a[1]+(b[1]-a[1])*fraction),hop:t===1&&dance.twirl&&dance.step%2?1:0,beat:dance.beat,facing:dance.facing==='left'?-1:1,danceFacing:dance.facing,step:dance.step,active:dance.active,twirl:dance.twirl,travelling:t<1};
 }).filter(Boolean);
}
let workshopRatBarrelMask=null,workshopRatBarrelFront=131;
function workshopRatPixelVisible(xx,yy,ratFeet=125){
 if(!workshopRatBarrelMask){const barrel=objectPriorityData[2].find(o=>o.id==='storage-barrel');workshopRatBarrelFront=Math.ceil(barrel.depth*.7);workshopRatBarrelMask=new Set();for(const[left,top,width]of barrel.mask)for(let x=left;x<left+width;x++)workshopRatBarrelMask.add(top*160+x)}
 const cx=pictureX(player.x),feet=pictureY(player.y);
 // Feet beyond the barrel base put the entire mouse in front of its wall.
 return (ratFeet>=workshopRatBarrelFront||!workshopRatBarrelMask.has(yy*160+xx))&&!(Math.abs(xx-cx)<=8&&yy>=feet-41&&yy<=feet+2);
}
// Tiny hand-traced imagegen stencils; pose selection shares her choreography.
function workshopMouseSprite(beat,facing='right',active=true,step=1,twirl=false){
 let key;
 if(facing==='front')key=active?(twirl||beat%2===0?'frontRaised':'front'):'settled';
 else if(facing==='back')key=twirl||step===2?'backSpin':'back';
 else key=twirl||step===2?'leftSpin':'left';
 const rows=workshopRatCels[key];
 return facing==='right'?rows.map(row=>[...row].reverse().join('')):rows;
}
function drawWorkshopMice(){
 for(const mouse of workshopMousePoses(storyAction?.frame||0)){
  const {x:cx,y:feet,hop,beat}=mouse,top=feet-10-hop;
  const dot=(dx,dy,color)=>{const xx=cx+dx,yy=top+dy;if(!workshopRatPixelVisible(xx,yy,feet))return;x.fillStyle=color;x.fillRect(xx,yy,1,1)};
  const rows=workshopMouseSprite(beat,mouse.danceFacing,mouse.active,mouse.step,mouse.twirl);
  rows.forEach((row,y)=>[...row].forEach((ink,col)=>{if(ink!=='.')dot(col-6,y,rosellaColors[parseInt(ink,16)])}));

 }
}
