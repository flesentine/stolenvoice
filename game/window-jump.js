// A cartoon return trip, never a shortcut to another room or a quest action.
const belfryJumpWindows=[
 {name:'left',x:32,glass:[[8,112],[8,53],[16,43],[24,53],[24,112]]},
 {name:'middle',x:142,glass:[[59,112],[59,49],[71,39],[82,49],[82,112]]},
 {name:'right',x:300,glass:[[141,112],[141,53],[150,43],[158,53],[158,112]]}
];
// Authored bell silhouette: outside flight must stay behind this foreground.
const belfryJumpBell=[[81,37],[95,37],[100,42],[101,57],[104,68],[112,79],[111,89],[67,89],[65,80],[72,70],[76,57],[77,43]];
function handleWindowJump(text){
 const match=text.match(/^(?:jump|leap|hop|dive) (?:(?:out(?: of)?|through|from) )?(.+)$/);
 if(!match||objectId(match[1])!=='window')return false;
 if(room!==7){say('That is not an open belfry window. You keep your feet where they are.');return true}
 const named=belfryJumpWindows.find(w=>match[1].includes(w.name)),target=named||belfryJumpWindows.reduce((a,b)=>Math.abs(player.x-a.x)<Math.abs(player.x-b.x)?a:b);
 if(Math.hypot(player.x-target.x,player.y-180)>40){say('Walk closer to the window first. Rosella prefers her leaps with less of a run-up.');return true}
 startStoryEffect('windowJump','A heroic leap! A decidedly unheroic gust catches your skirts and deposits you back in the belfry. Apparently, the scenic route has a return policy.',{jumpWindow:target.name});return true;
}
function windowJumpPose(frame){
 const window=belfryJumpWindows.find(w=>w.name===storyAction.jumpWindow),cx=pictureX(player.x),floor=pictureY(player.y),wx=window.x/2;
 let x,y,outside=false;
 if(frame<8){const t=frame/7;x=cx+(wx-cx)*t;y=floor+(110-floor)*t-Math.sin(t*Math.PI)*6}
 else if(frame<23){const t=(frame-8)/14;x=wx+Math.sin(t*Math.PI)*2;y=108-20*Math.sin(t*Math.PI)+65*t*t;outside=true}
 else if(frame<33){const t=(frame-23)/9;x=wx;y=173-65*t;outside=true}
 else{const t=Math.min(1,(frame-33)/10);x=wx+(cx-wx)*t;y=108+(floor-108)*t-Math.sin(t*Math.PI)*6}
 return{x:Math.round(x),feet:Math.round(y),outside,glass:window.glass};
}
function drawWindowJumpHero(){
 if(storyAction?.kind!=='windowJump')return false;
 const frame=storyAction.frame,pose=windowJumpPose(frame),rows=windowJumpSprite(frame),left=pose.x-4,top=pose.feet-39;
 const dot=(xPos,y,color)=>{if(xPos<0||xPos>=160||y<0||y>=168||(pose.outside&&(!insidePolygon(xPos,y,pose.glass)||insideSolidFootprint(xPos,y,belfryJumpBell))))return;x.fillStyle=rosellaColors[color];x.fillRect(xPos,y,1,1)};
 if(!pose.outside)ellipse(player.x,player.y+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  let ink=rows[row][col];
  if(row>=14&&row<=24&&ink==='c')ink=col>=2&&col<=5?(row<17?'f':row<20?'1':'9'):'.';
  if(ink!=='.')dot(left+col,top+row,parseInt(ink,16));
 }
 if(frame>1&&frame<42)for(const side of [-1,1])for(let n=0;n<5;n++){
  const y=top+14-n+(frame%4<2?0:1),xPos=left+(side<0?1:6)+side*Math.floor(n/2);
  dot(xPos,y,n<2?15:12);dot(xPos,y+1,n<2?15:12);
 }
 // The returning gust is visible only through the opening, not on the wall.
 if(frame>=23&&frame<33)for(let i=0;i<3;i++)for(let n=0;n<7;n++){
  const xPos=pose.x-8+n+(frame+i)%3,y=91+i*5;
  dot(xPos,y,i%2?15:11);
 }
 return true;
}
function windowJumpSprite(frame){
 const rows=rosellaWalkSprites[frame<23?'back':'front'][Math.floor(frame/3)%4].map(row=>[...row]);
 const flutter=frame>5&&frame<39?Math.max(Math.sin((frame-5)*Math.PI/34),frame>26?Math.sin((frame-26)*Math.PI/13):0):0;
 const lift=Math.round(flutter*9);
 if(lift){
  // The gust lifts the hem to her knees, then it settles before landing.
  const hem=36-lift;
  for(let y=hem;y<40;y++)for(let col=0;col<8;col++)rows[y][col]='.';
  for(let y=hem;y<=36;y++)for(const col of [2,3,5,6])rows[y][col]='c';
  for(let y=37;y<39;y++)for(const col of [2,3,5,6])rows[y][col]='6';
  rows[39][3]='6';rows[39][5]='6';
  for(const col of [0,1,6,7])rows[hem-1][col]=col<4?'9':'1';
 }
 return rows.map(row=>row.join(''));
}
