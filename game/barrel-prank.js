// The cinematic stays outside the solid barrel; completion settles on clear floor.
function handleBarrelPrank(t){
 const close=/^(?:close|replace|lower|shut) (?:the )?(?:barrel|cask|lid|barrel lid)$/.test(t);
 const open=/^(?:open|lift|raise|remove|take off|lift off) (?:the )?(?:barrel|cask|lid|barrel lid|lid of the barrel)$/.test(t);
 const peer=/^(?:look (?:in|inside|into|under)(?: the)? (?:barrel|cask|lid)(?: more| again| closely)?|(?:peer|peek) (?:in|inside|into)(?: the)? (?:barrel|cask)|look (?:in more|closer|deeper)|peer deeper|search (?:the )?(?:barrel|cask))$/.test(t);
 if(!close&&!open&&!peer)return false;
 if(room!==2){say('You do not see a barrel here.');return true}if(!nearObject('barrel'))return true;
 if(close){flags.barrelOpen=false;draw();say('You lower the wooden lid. A wise precaution.');return true}
 if(!flags.barrelOpen){flags.barrelOpen=true;draw();playGameSound('chairCreak',false,0,.4);say('You tip back the lid. Dark garden manure fills the barrel. Something glints beneath the straw. A little nearer, and you might make out what it is.');return true}
 if(open){say('The lid is already propped open.');return true}
 flags.manureSoiled=true;
 startStoryEffect('barrelPrank','You straighten your dress and wipe off the last clumps. The glint was a beetle. It looks considerably cleaner than you. A certain garden fragrance lingers.');return true;
}
function barrelInk(points,color){galleryInk(points,color)}
// Image-contour EGA key cels: intact silhouettes, no runtime deformation.
function barrelPrankCel(frame){return barrelPrankCels[Math.max(0,Math.min(26,Math.floor(frame/5)))]}
function settleBarrelPrank(){
 const clean=barrelPrankCels[26],px=clean.anchorX*2,py=Math.round(clean.floor/.7);
 if(room===2&&canStand(px,py,2)){player.x=px;player.y=py}
 player.facing='front';player.step=1;
}
function drawBarrelEmergence(frame){
 // Preserve the approved head rise and shake between the traced keys.
 const hy=Math.max(111,128-(frame-58)*3),shake=frame>=66?Math.round(Math.sin(frame*1.8)*2):0,rows=elaraWalkSprites.front[1];
 for(let r=0;r<24;r++)for(let c=0;c<8;c++){
  let ink=rows[r][c];if(ink==='.')continue;
  if([[1,4],[5,7],[3,12],[1,19],[5,22]].some(([xx,yy])=>c>=xx&&c<=xx+1&&r>=yy&&r<=yy+1))ink='6';
  const xx=134+c+(r<13?shake:0),yy=hy-24+r;
  if(yy<=102){x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(xx,yy,1,1)}
 }
 if(frame>=66&&frame%2===0)for(let n=0;n<3;n++){x.fillStyle='#aa5500';x.fillRect(130+n*7+(frame%3),88+(n*3+frame)%12,1,1)}
}
function drawBarrelPrank(){
 if(room!==2||!flags.barrelOpen)return;
 x.fillStyle='#555555';x.fillRect(131,97,14,8);
 barrelShape([[132,102],[135,100],[141,100],[144,102],[141,105],[134,105]],'#aa5500','#000000');
 x.fillStyle='#000000';x.fillRect(134,102,8,2);
 barrelShape([[145,102],[147,99],[148,88],[146,87],[144,98]],'#aa5500','#000000');
 barrelInk([[146,99],[147,90]],'#ffff55');
 if(storyAction?.kind!=='barrelPrank')return;
 const f=storyAction.frame;
 if(f>=58&&f<85){drawBarrelEmergence(f);return}
 let dx=0,dy=0;
 // Approach the barrel with intact cels; the final pose stays at cleanup.
 if(f<10){const t=1-f/10,base=barrelPrankCels[0];dx=Math.round((pictureX(player.x)-base.anchorX)*t);dy=Math.round((pictureY(player.y)-base.floor)*t)}
 for(const [left,top,width,ink]of barrelPrankCel(f).runs){x.fillStyle=elaraColors[ink];x.fillRect(left+dx,top+dy,width,1)}
}

function barrelShape(points,fill,edge){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);x.fillStyle=fill;
 for(let yy=Math.min(...ys);yy<=Math.max(...ys);yy++)for(let xx=Math.min(...xs);xx<=Math.max(...xs);xx++)if(insidePolygon(xx,yy,points))x.fillRect(xx,yy,1,1);
 barrelInk([...points,points[0]],edge);
}
