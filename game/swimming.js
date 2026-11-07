// The stream is a hazard; eight seconds of controllable play remain after a fall.
const swimmingTime=8000;
const bridgeRiver=[[81,76],[99,78],[93,92],[101,102],[91,115],[94,134],[107,152],[111,168],[56,168],[62,147],[69,130],[65,116],[57,106],[33,99],[17,90],[20,84],[42,94],[66,99],[76,89]];
const bridgeDecks=[[[44,111],[74,110],[74,125],[41,127]],[[86,110],[117,111],[122,126],[86,125]]];
const bridgeRepairDeck=[[142,158],[177,158],[179,165],[141,165]];
const bridgeHangingDeck=[[142,171],[177,152],[179,158],[141,178]];
function bridgeRepairPoints(){return flags.bridgePlankSlipped&&!flags.bridgeFixed?bridgeHangingDeck:bridgeRepairDeck}
let bridgeFall=null;
let swimState={active:false,dead:false,remaining:swimmingTime,lastTick:0,frame:0,bank:null},swimTimer=0,swimFocused=true;
function isBridgeWater(px,py){return insidePolygon(pictureX(px),pictureY(py),bridgeRiver)}
function isBridgeDeck(px,py){return bridgeDecks.some(p=>insidePolygon(pictureX(px),pictureY(py),p))||(flags.bridgeFixed&&insidePolygon(px,py,bridgeRepairDeck))}
// Swimming uses the visible timber, not the walkable surface above it.
let bridgeSwimWoodMask=null,bridgeSwimPiersMask=null,bridgeSwimRepairDeck=null,bridgeSwimHangingDeck=null;
function bridgeWoodAt(px,py,underBridge=false){
 if(!bridgeSwimWoodMask){
  bridgeSwimWoodMask=new Uint8Array(160*168);bridgeSwimPiersMask=new Uint8Array(160*168);
  // These authored shapes never change; only the selected pose changes.
  // A shore search checks thousands of pixels, so convert each shape once.
  bridgeSwimRepairDeck=bridgeRepairDeck.map(([x,y])=>[pictureX(x),pictureY(y)]);
  bridgeSwimHangingDeck=bridgeHangingDeck.map(([x,y])=>[pictureX(x),pictureY(y)]);
  for(const object of objectPriorityData[4]||[])if((object.id==='bridge-decking'||object.id.startsWith('bridge-supports-'))||object.id.startsWith('Bridge post ')){
   for(const [left,top,length]of object.mask){bridgeSwimWoodMask.fill(1,top*160+left,top*160+left+length);if(object.id!=='bridge-decking')bridgeSwimPiersMask.fill(1,top*160+left,top*160+left+length)}
  }
 }
 const nx=pictureX(px),ny=pictureY(py);
 if(nx<0||nx>=160||ny<0||ny>=168)return false;
 return !!(underBridge?bridgeSwimPiersMask:bridgeSwimWoodMask)[ny*160+nx]||(!underBridge&&flags.bridgePlank&&insideSolidFootprint(nx,ny,flags.bridgePlankSlipped&&!flags.bridgeFixed?bridgeSwimHangingDeck:bridgeSwimRepairDeck));
}
function woodBlocksSwimming(px,py,underBridge=false){return[-7,-3,0,3,7].some(offset=>bridgeWoodAt(px+offset,py,underBridge))}
function riverBankSide(px,py){
 const areas=roomLayouts[4].areas;
 if(areas.slice(1).some(area=>insidePolygon(px,py,area)))return 'east';
 if(insidePolygon(px,py,areas[0]))return 'west';
 // The bridge's two halves retain the bank they project from.
 return px<161?'west':'east';
}
function anySwimmingShore(px,py){return !woodBlocksSwimming(px,py)&&!rockBlocksSwimming(px,py)&&!isBridgeDeck(px,py)&&canStand(px,py,4)}
function oppositeSwimmingBank(px,py){return !!(swimState.active&&swimState.bankSide&&anySwimmingShore(px,py)&&riverBankSide(px,py)!==swimState.bankSide)}
function swimmingShore(px,py){return anySwimmingShore(px,py)&&!oppositeSwimmingBank(px,py)}
function sweptBackByCurrent(){
 if(swimState.pushback)return;
 stopWalking();swimState.route=null;
 let route=swimmingShoreRoute(),underBridge=false;
 // Upstream rocks can seal off the home bank at the surface. Let the
 // current carry her beneath the deck, while piers and rocks stay solid.
 if(!route.length){route=swimmingShoreRoute(player.x,player.y,swimState.bankSide,true);underBridge=true}
 if(!route.length){say('The current bars the far bank. Swim back around the bridge timbers.');return}
 swimState.currentWarned=true;
 swimState.pushback={route,underBridge};playGameSound('riverCurrent');draw();
}
// Rocks are solid at the waterline too, not just along their tiny ground base.
let bridgeSwimRockMask=null;
function rockBlocksSwimming(px,py){
 if(!bridgeSwimRockMask){bridgeSwimRockMask=new Uint8Array(160*168);for(const object of objectPriorityData[4]||[])if(/^(Rock|Bank stone) /.test(object.id))for(const [left,top,length]of object.mask)bridgeSwimRockMask.fill(1,top*160+left,top*160+left+length)}
 return[-7,-3,0,3,7].some(offset=>{const nx=pictureX(px+offset),ny=pictureY(py);return nx>=0&&nx<160&&ny>=0&&ny<168&&bridgeSwimRockMask[ny*160+nx]});
}
function swimmingSpace(px,py,underBridge=false){return px>=6&&px<=314&&py>=115&&py<=238&&!oppositeSwimmingBank(px,py)&&!woodBlocksSwimming(px,py,underBridge)&&!rockBlocksSwimming(px,py)&&!objectBlocksActor(px,py,4)&&(isBridgeWater(px,py)||isBridgeWater(px-7,py)||isBridgeWater(px+7,py)||isBridgeWater(px,py-2)||isBridgeWater(px,py+2)||swimmingShore(px,py))}
const swimmingRouteSteps=[[-1,0],[1,0],[0,-1],[0,1]];
function swimmingShoreRoute(fromX=player.x,fromY=player.y,bankSide=swimState.bankSide,underBridge=false){
 const startX=Math.round(fromX),startY=Math.round(fromY),start=startY*320+startX;
 const previous=new Int32Array(320*240).fill(-1),queue=[start];previous[start]=start;let end=-1;
 for(let head=0;head<queue.length;head++){
  const current=queue[head],cx=current%320,cy=Math.floor(current/320);
  if(current!==start&&swimmingShore(cx,cy)&&(!bankSide||riverBankSide(cx,cy)===bankSide)){end=current;break}
  for(const [dx,dy]of swimmingRouteSteps){
   const nx=cx+dx,ny=cy+dy;
   if(nx<6||nx>314||ny<115||ny>238)continue;const next=ny*320+nx;
   if(previous[next]!==-1)continue;previous[next]=-2;
   if(!swimmingSpace(nx,ny,underBridge)||(bankSide&&anySwimmingShore(nx,ny)&&riverBankSide(nx,ny)!==bankSide))continue;previous[next]=current;queue.push(next);
  }
 }
 const route=[];if(end<0)return route;
 for(let n=end;n!==start;n=previous[n])route.push([n%320,Math.floor(n/320)]);
 return route.reverse();
}
function resetSwimming(){bridgeFall=null;if(swimTimer){clearInterval(swimTimer);swimTimer=0}swimState={active:false,dead:false,remaining:swimmingTime,lastTick:0,frame:0,bank:null}}
// Place the waterline in the current, rather than on the last deck-edge pixel.
function swimmingLanding(px,py,bank){
 const dx=Math.sign(px-bank.x),dy=Math.sign(py-bank.y),candidates=[];
 // A foot can leave the narrow plank while its waterline is still in the
 // deck opening. A downward exit must place her whole swimming pose below
 // the decking, including the fourteen pixels above her waterline. Upstream
 // exits retain their existing current-assisted route beneath the deck.
 const vertical=isBridgeDeck(bank.x,bank.y)?dy:0;
 const deckTop=Math.min(...bridgeDecks.flat().map(p=>p[1])),deckBottom=Math.max(...bridgeDecks.flat().map(p=>p[1]));
 for(let oy=-18;oy<=54;oy+=2)for(let ox=-18;ox<=18;ox+=2){
  const y=py+oy,waterline=pictureY(y);
  if((vertical>0&&waterline-14<=deckBottom)||(vertical<0&&waterline+3>=deckTop))continue;
  candidates.push({x:px+ox,y,cost:ox*ox+oy*oy-(ox*dx+oy*dy)*2});
 }
 candidates.sort((a,b)=>a.cost-b.cost);
 return candidates.find(p=>p.x>=6&&p.x<=314&&p.y>=115&&p.y<=238&&!objectBlocksActor(p.x,p.y,4)&&!woodBlocksSwimming(p.x,p.y)&&!rockBlocksSwimming(p.x,p.y)&&[-5,0,5].every(offset=>isBridgeWater(p.x+offset,p.y)&&!isBridgeDeck(p.x+offset,p.y))&&(swimmingShoreRoute(p.x,p.y,riverBankSide(bank.x,bank.y)).length>0||(vertical<0&&swimmingShoreRoute(p.x,p.y,riverBankSide(bank.x,bank.y),true).length>0)))||{x:160,y:vertical>0?210:vertical<0?148:194};
}
// An unsecured crossing gives way visibly before the swimming clock begins.
function beginBridgeFall(px,py){
 const bank={...player};stopWalking();resetSwimming();
 // Authored clear-water splash point below the deck, between its piers.
 // Its routes to both banks are regression-tested. Do not scan candidate
 // landings or run breadth-first shore searches on this input/paint path.
 const landing={x:160,y:194};
 bridgeFall={frame:0,bank,landing};
 swimTimer=setInterval(tickBridgeFall,75);draw();
}
function tickBridgeFall(){
 if(!bridgeFall||document.hidden||!swimFocused||popupOpen||menuOpen)return;
 bridgeFall.frame++;
 if(bridgeFall.frame===1&&!flags.bridgePlankSlipped)playGameSound('bridgePlank');
 // The cue begins with a falling pitch; its impact follows about 180 ms
 // later. Start during descent so it meets the visible frame-18 splash.
 if(bridgeFall.frame===16){bridgeFall.waterSoundStarted=true;playGameSound('fallWater')}
 if(bridgeFall.frame>=24){
  const fall=bridgeFall;flags.bridgePlankSlipped=true;player={...fall.bank};
  beginSwimming(fall.landing.x,fall.landing.y,fall.landing);return;
 }
 draw();
}
function drawBridgeFallHero(){
 const fall=bridgeFall;if(!fall)return false;
 const frame=fall.frame,t=Math.max(0,Math.min(1,(frame-7)/13));
 const ease=t*t*(3-2*t);
 const px=fall.bank.x+(fall.landing.x-fall.bank.x)*ease;
 const py=fall.bank.y+(fall.landing.y-fall.bank.y)*ease;
 const waterline=pictureY(fall.landing.y);
 const facing=elaraWalkSprites[fall.bank.facing]?fall.bank.facing:'front';
 const rows=elaraWalkSprites[facing][1];
 const direction=Math.sign(fall.landing.x-fall.bank.x)||(facing==='left'?-1:1);
 const reel=frame<5?0:frame<10?Math.sin((frame-4)*Math.PI/6)*.12:.12+t*.34;
 const angle=direction*reel,cos=Math.cos(angle),sin=Math.sin(angle);
 const center=pictureX(px),feet=Math.round(pictureY(py)+24*t*t);
 // Rotate in display space: native picture pixels are twice as wide as tall.
 const paint=(col,row,ink)=>{
  const dx=(col-3.5)*2,dy=row-39;
  const xx=center+Math.round((dx*cos-dy*sin)/2),yy=feet+Math.round(dx*sin+dy*cos);
  if(yy>=waterline&&frame>=14)return;
  x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1);
 };
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  const kick=frame>=10&&row>=37?(col<4?-1:1)*(frame%4<2?1:0):0;
  paint(col+kick,row,parseInt(ink,16));
 }
 if(frame>=5&&frame<20){
  // Joined sleeves, forearms and small hands make the loss of balance visible.
  for(const side of [-1,1]){
   const shoulder=side<0?1:6,raise=frame<10?1:3;
   for(let step=0;step<5;step++)for(let thick=0;thick<2;thick++)
    paint(shoulder+side*step,14-Math.floor(step*.6)-raise+thick,step<3?15:12);
  }
 }
 if(frame>=18){
  const splash=frame-18,cx=pictureX(fall.landing.x),cy=waterline;
  for(let i=0;i<20;i++){
   const a=i*Math.PI/10,rx=3+splash*1.4;
   x.fillStyle=i%3?'#55ffff':'#00aaaa';
   x.fillRect(cx+Math.round(Math.cos(a)*rx),cy+Math.round(Math.sin(a)*2),1,1);
  }
  if(splash<5)for(const side of [-1,1]){
   const dx=side*(2+splash),dy=-2-Math.round(Math.sin(splash*Math.PI/5)*5);
   x.fillStyle='#ffffff';x.fillRect(cx+dx,cy+dy,1,2);
   x.fillStyle='#55ffff';x.fillRect(cx+dx+side*2,cy+dy+2,1,1);
  }
 }
 return true;
}
function beginSwimming(px,py,preparedLanding=null){
 const waterSoundStarted=bridgeFall?.waterSoundStarted;
 rememberMerrin('river');
 const washedManure=flags.manureSoiled;flags.manureSoiled=false;
 const bank={...player};stopWalking();resetSwimming();swimState.active=true;swimState.bank=bank;swimState.bankSide=riverBankSide(bank.x,bank.y);swimState.currentWarned=false;const landing=preparedLanding||swimmingLanding(px,py,bank);player.x=landing.x;player.y=landing.y;swimState.waterEntry={x:landing.x,y:landing.y};if(!waterSoundStarted)playGameSound('fallWater');draw();
 // Landing/path setup and the first paint must finish before reaction time starts.
 swimState.lastTick=Date.now();swimTimer=setInterval(tickSwimming,100);
 if(washedManure)say('The river rinses away the last of the manure. At last, a royal bath! Now, about getting out...');
}
function tickSwimming(){
 const now=Date.now(),elapsed=Math.max(0,now-swimState.lastTick);swimState.lastTick=now;
 if(!swimState.active||popupOpen||menuOpen||document.hidden||!swimFocused)return;
 swimState.frame=(swimState.frame+1)%4;
 if(swimState.pushback){
  // Forced current motion is a short visible payoff; it never consumes the
  // player's remaining reaction time or travels through foreground objects.
  const push=swimState.pushback;let moved=0;
  while(push.route.length&&moved++<4&&swimState.active){
   const [nx,ny]=push.route.shift();moveSwimming(nx-player.x,ny-player.y,true);
  }
  if(!swimState.active){say(push.underBridge?'The current carries you beneath the bridge and sweeps you onto the bank you fell from.':'The current sweeps you onto the bank you fell from. The opposite bank remains out of reach.');return}
  if(!push.route.length)swimState.pushback=null;
  draw();return;
 }
 swimState.remaining-=elapsed;
 if(swimState.remaining<=0){drown();return}
 if(swimState.route?.length){
  const first=swimState.route.shift(),dx=first[0]-player.x,dy=first[1]-player.y;let count=1;
  while(count<3&&swimState.route.length&&swimState.route[0][0]===player.x+dx*(count+1)&&swimState.route[0][1]===player.y+dy*(count+1)){swimState.route.shift();count++}
  moveSwimming(dx*count,dy*count);return;
 }
 draw();
}
function moveSwimming(dx,dy,fromCurrent=false){
 if(swimState.pushback&&!fromCurrent)return;
 // Recover old/edge landings caught within a timber footprint instead of
 // rejecting every directional input from an invalid starting position.
 if(!fromCurrent&&!swimmingSpace(player.x,player.y)){sweptBackByCurrent();return}
 const nx=player.x+dx,ny=player.y+dy;
 player.facing=dx<0?'left':dx>0?'right':dy<0?'back':'front';
 // Sweep the whole move so a larger step cannot jump over a timber edge.
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))));
 for(let i=1;i<=steps;i++){const sx=player.x+dx*i/steps,sy=player.y+dy*i/steps;if(oppositeSwimmingBank(sx,sy)){sweptBackByCurrent();return}if(!swimmingSpace(sx,sy,fromCurrent&&swimState.pushback?.underBridge)){
   // The upstream shoreline can be outside the walking floor entirely.
   // It still belongs to the far bank: trigger the current at its blocked
   // edge instead of requiring entry onto a standable shore pixel first.
   if(!fromCurrent&&swimState.bankSide&&riverBankSide(sx,sy)!==swimState.bankSide&&!woodBlocksSwimming(sx,sy)){
    sweptBackByCurrent();return;
   }
   // Homeward input blocked by a timber, bank rock or shoreline corner
   // follows the clear route around it instead of sticking at that pixel.
   const homeward=swimState.bankSide==='west'?dx<0:swimState.bankSide==='east'?dx>0:false;
   if(homeward){
    const route=swimmingShoreRoute();
    if(route.length){stopWalking();swimState.route=route;}else sweptBackByCurrent();
   }else if(!fromCurrent&&slideSwimming(dx,dy)){
    return;
   }
   draw();return;
  }}
 if(swimmingShore(nx,ny)){player.x=nx;player.y=ny;resetSwimming();stopWalking();draw();return}
 player.x=nx;player.y=ny;player.step++;

 draw();
}
function slideSwimming(dx,dy){
 // Follow the diagonal broken edge when a cardinal stroke catches it.
 // Check every pixel of both legs; never jump through wood or rocks.
 if((dx===0)===(dy===0))return false;
 const pathClear=(x,y,xx,yy)=>{
  const count=Math.max(Math.abs(xx-x),Math.abs(yy-y));
  for(let n=1;n<=count;n++)if(!swimmingSpace(x+(xx-x)*n/count,y+(yy-y)*n/count))return false;
  return true;
 };
 for(let offset=1;offset<=8;offset++)for(const sign of [-1,1]){
  const sx=player.x+(dy?offset*sign:0),sy=player.y+(dx?offset*sign:0),nx=sx+dx,ny=sy+dy;
  if(!pathClear(player.x,player.y,sx,sy)||!pathClear(sx,sy,nx,ny))continue;
  player.x=nx;player.y=ny;player.step++;
  if(swimmingShore(nx,ny)){resetSwimming();stopWalking()}
  draw();return true;
 }
 return false;
}
function drown(){
 swimState.remaining=0;swimState.active=false;swimState.dead=true;
 if(swimTimer){clearInterval(swimTimer);swimTimer=0}stopWalking();playing=false;draw();
 say('The current pulls Elara under. Her struggle is over.\n\nYou have drowned.\n\nENTER: retry from the bank.\nF7: restore a saved game.\nR: restart.');
}
function retryAfterDrowning(){
 const bank=swimState.bank||{x:28,y:202,step:1,facing:'front'};resetSwimming();stopWalking();
 popupOpen=false;textPopup.hidden=true;agiMessagePages=[];popupFocus=null;playing=true;room=4;player={...bank};input.value='';document.querySelector('.hud').inert=false;document.querySelector('.footer').inert=false;c.focus();draw();
}
function swimmingCommand(text){
 if(!swimState.active)return false;
 if(swimState.pushback)return true;
 if(/^(?:get out(?: of (?:the )?(?:water|river|stream))?|get to (?:the )?(?:shore|bank)|head (?:to|for) (?:the )?(?:shore|bank))$/.test(text))text='swim to shore';
 const match=text.match(/^swim(?:\s+(?:to|toward|towards))?(?:\s+(.*))?$/);
 if(!match)return false;
 let target=noun(match[1]||'shore');
 if(['back','back to shore','back to bank','back to the bank','back to the shore','original bank','same bank','safety','out'].includes(target))target='shore';
 const directions={left:'left',west:'left',w:'left',right:'right',east:'right',e:'right',up:'up',north:'up',n:'up',down:'down',south:'down',s:'down'};
 let direction=directions[target];
 if(['across','across river','across the river','across stream','across the stream','other side','other bank','other shore','opposite bank','opposite shore','far bank','far shore'].includes(target)){
  sweptBackByCurrent();return true;
 }
 if(['east bank','east shore','west bank','west shore'].includes(target)){
  if(swimState.bankSide&&target.split(' ')[0]!==swimState.bankSide){sweptBackByCurrent();return true}
  stopWalking();swimState.route=swimmingShoreRoute();if(!swimState.route.length)sweptBackByCurrent();return true;
 }
 if(['shore','bank','land','nearest shore','nearest bank'].includes(target)){
  stopWalking();swimState.route=swimmingShoreRoute();
  if(!swimState.route.length)sweptBackByCurrent();
  return true;
 }
 if(direction){swimState.route=null;toggleWalk(direction);return true}
 say('You paddle in place, trying to keep your head above the water.');return true;
}
// Reuse Elara's exact walking head, without a replacement character design.
function drawSwimming(px,py){
 const left=pictureX(px)-4,waterline=pictureY(py),frame=swimState.frame;
 if(!swimState.dead){
  const facing=elaraWalkSprites[player.facing]?player.facing:'front';
  const cel=elaraWalkSprites[facing][0];
  for(let row=0;row<14;row++)for(let col=0;col<8;col++){
   const ch=cel[row][col];if(ch==='.')continue;
   x.fillStyle=elaraColors[parseInt(ch,16)];x.fillRect(left+col,waterline-14+row,1,1);
  }
 }
 const ripple=(start,y,length,color)=>{x.fillStyle=color;for(let xx=start;xx<start+length;xx++)if(isBridgeWater(xx*2,y/0.7)&&!isBridgeDeck(xx*2,y/0.7)&&!bridgeWoodAt(xx*2,y/0.7)&&!objectFootprintAt(xx*2,y/0.7,4))x.fillRect(xx,y,1,1)};
 ripple(left-3+(frame%2),waterline,4,'#55ffff');ripple(left+7,waterline+1,4,'#55ffff');ripple(left,waterline+2,7,'#5555ff');
 if(swimState.pushback){ripple(left-6+(frame%2),waterline+3,4,'#55ffff');ripple(left+9-(frame%2),waterline-1,3,'#55ffff')}
}
window.addEventListener('blur',()=>{swimFocused=false;swimState.lastTick=Date.now()});
window.addEventListener('focus',()=>{swimFocused=true;swimState.lastTick=Date.now()});
document.addEventListener('visibilitychange',()=>{swimState.lastTick=Date.now()});
