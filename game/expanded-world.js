const roomLayouts=[{"name":"The Royal Garden","art":null,"spawn":[155,190],"areas":[[[8,166],[112,166],[143,142],[165,142],[181,166],[312,166],[312,238],[8,238]]],"blocked":[[51,200,70,208]],"exits":[{"id":"courtyard","names":["castle","courtyard","court","north","n","gate","inside"],"to":8,"zone":[118,152,184,180],"spawn":[160,232],"requires":null,"blocked":"","facing":"back"},{"id":"orchard","names":["orchard","east","e"],"to":3,"zone":[305,183,316,238],"spawn":[27,202],"requires":null,"blocked":"","facing":"right"}]},{"name":"The Mirror Gallery","art":"gallery","spawn":[160,213],"areas":[[[8,165],[312,165],[312,238],[8,238]],[[276,151],[316,151],[316,214],[276,214]],[[34,159],[110,159],[110,168],[34,168]]],"blocked":[],"exits":[{"id":"courtyard","names":["courtyard","court","outside","out","south","s","back"],"to":8,"zone":[110,225,204,239],"spawn":[251,158],"requires":null,"blocked":"","facing":"front"},{"id":"belfry","names":["belfry","tower","stairs","up","u"],"to":7,"zone":[289,151,316,182],"spawn":[35,207],"requires":null,"blocked":"","facing":"right"}]},{"name":"The Potting Shed","art":"potting","spawn":[160,212],"areas":[[[8,180],[312,180],[312,238],[8,238]]],"blocked":[[28,172,73,184]],"exits":[{"id":"courtyard","names":["courtyard","court","outside","out","south","s","back"],"to":8,"zone":[120,226,202,239],"spawn":[64,166],"requires":null,"blocked":"","facing":"front"}]},{"name":"The Old Orchard","art":"orchard","spawn":[27,202],"areas":[[[8,170],[312,170],[312,238],[8,238]]],"blocked":[[193,185,220,194]],"exits":[{"id":"garden","names":["garden","west","w","back"],"to":0,"zone":[4,184,15,218],"spawn":[286,201],"requires":null,"blocked":"","facing":"left"},{"id":"bridge","names":["bridge","stream","east","e"],"to":4,"zone":[305,180,316,220],"spawn":[28,202],"requires":"thornsCut","blocked":"The blackthorn snags your clothes. Its tangled stems leave no room to pass.","facing":"right"}]},{"name":"The Broken Bridge","art":"bridge","spawn":[28,202],"areas":[[[8,147],[50,147],[50,125],[93,125],[116,145],[140,153],[140,238],[8,238]],[[182,146],[312,146],[312,238],[182,238]],[[284,74],[300,78],[284,99],[284,119],[312,143],[312,177],[294,177],[292,150],[268,118],[270,96]]],"blocked":[],"exits":[{"id":"orchard","names":["orchard","garden","west","w","back"],"to":3,"zone":[4,183,15,220],"spawn":[286,201],"requires":null,"blocked":"","facing":"left"},{"id":"mill","names":["mill","northwest","nw"],"to":5,"zone":[68,148,100,160],"spawn":[28,181],"requires":null,"blocked":"","facing":"front"},{"id":"grotto","names":["grotto","cave","north","n","northeast","ne"],"to":6,"zone":[278,129,307,149],"spawn":[56,199],"requires":"bridgePlank","blocked":"The grotto lies across the stream.","facing":"front"}]},{"name":"The Old Watermill","art":"mill","spawn":[28,205],"areas":[[[8,178],[312,178],[312,238],[8,238]],[[8,149],[35,149],[44,181],[8,181]]],"blocked":[],"exits":[{"id":"bridge","names":["bridge","door","doorway","outside","out","northwest","nw","back"],"to":4,"zone":[9,150,31,167],"spawn":[85,176],"requires":null,"blocked":"","facing":"front"}]},{"name":"The Echo Grotto","art":"grotto","spawn":[56,199],"areas":[[[15,173],[166,173],[174,163],[218,163],[231,173],[299,176],[292,196],[251,202],[230,220],[165,231],[87,222],[52,203],[15,197]],[[18,144],[45,144],[54,185],[18,190]]],"blocked":[],"exits":[{"id":"bridge","names":["bridge","outside","out","west","w","back"],"to":4,"zone":[18,168,50,190],"spawn":[290,166],"requires":null,"blocked":"","facing":"front"}]},{"name":"The Castle Belfry","art":"belfry","spawn":[35,207],"areas":[[[8,180],[312,180],[312,238],[8,238]]],"blocked":[],"exits":[{"id":"gallery","names":["gallery","stairs","down","d","out","back"],"to":1,"zone":[4,190,15,230],"spawn":[284,201],"requires":null,"blocked":"","facing":"left"}]},{"name":"The Castle Courtyard","art":"courtyard","spawn":[160,232],"areas":[[[8,148],[96,148],[108,153],[208,153],[224,162],[292,162],[312,152],[312,238],[8,238]],[[51,130],[77,130],[87,162],[47,162]],[[231,129],[269,129],[277,162],[226,162]]],"blocked":[],"exits":[{"id":"garden","names":["garden","gate","south","s","out","outside","back"],"to":0,"zone":[128,234,194,239],"spawn":[153,185],"facing":"front","requires":null,"blocked":""},{"id":"shed","names":["shed","workshop","workshop door","shed door","potting shed","left door","left","west","w","northwest","nw"],"to":2,"zone":[50,141,79,153],"spawn":[160,212],"facing":"back","requires":"workshopOpen","blocked":"The workshop door is closed."},{"id":"gallery","names":["gallery","mirror gallery","right door","right","north","n","northeast","ne","inside"],"to":1,"zone":[234,129,267,143],"spawn":[160,213],"facing":"back","requires":null,"blocked":""}]}];
const hotspots=[{"man":[61,204],"rose":[273,201],"bell":[296,216]},{"book":[76,171],"chair":[222,174],"mirror":[144,169],"stairs":[302,171]},{"oil":[158,191],"twine":[183,191],"shears":[132,191],"plank":[35,193],"barrel":[276,185],"drawer":[160,191]},{"wax":[206,203],"thorns":[292,200]},{"bridge":[134,169]},{"wheel":[83,180],"cabinet":[245,181],"jar":[245,181]},{"pool":[193,178]},{"rope":[176,181],"bell":[176,181]},{}];
// The wall panels have their own ground approach, separate from the wheel/bell.
hotspots[5].mechanism=[244,181];hotspots[7].mechanism=[248,181];
function insidePolygon(px,py,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
function canStand(px,py,atRoom=room){
 const layout=roomLayouts[atRoom];
 const areas=layout.areas.slice();
 if(atRoom===4)for(const deck of bridgeDecks)areas.push(deck.map(([x,y])=>[x*2,y/0.7]));
 if(atRoom===4&&flags.bridgeFixed)areas.push(bridgeRepairDeck);
 // The closed workshop door is a wall at ground level. Stop the feet
 // below its sill, even after the silent approach exit has latched.
 if(atRoom===8&&!flags.workshopOpen&&px>=47&&px<=83&&py<145)return false;
 if(objectBlocksActor(px,py,atRoom))return false;
 if(atRoom===3&&!flags.thornsCut&&px>288&&py<219)return false;
 for(const sample of [px-3,px,px+3]){
  if(atRoom===4&&isBridgeWater(sample,py)&&!isBridgeDeck(sample,py))return false;
  if(!areas.some(area=>insidePolygon(sample,py,area)))return false;
  if(layout.blocked.some(([x1,y1,x2,y2])=>sample>=x1&&sample<=x2&&py>=y1&&py<=y2))return false;
 }
 return true;
}
function clearGroundStep(ax,ay,bx,by){
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax),Math.abs(by-ay))));
 for(let i=1;i<=steps;i++)if(!canStand(ax+(bx-ax)*i/steps,ay+(by-ay)*i/steps))return false;
 return true;
}
function nearObject(id,range=58){
 const point=hotspots[room][id];
 if(!point){say('You do not see that here.');return false}
 if(Math.hypot(player.x-point[0],player.y-point[1])>range){say('You are too far away. Walk closer to the '+(id==='man'?'gardener':id)+'.');return false}
 return true;
}
function enterExit(exit){
 // Reaching the closed door is silent; trying its latch discovers the lock.
 if(room===8&&exit.id==='shed'&&!flags.workshopOpen){stopWalking();draw();return false}
 if(exit.requires&&!flags[exit.requires]){stopWalking();say(exit.blocked);return false}
 changeRoom(exit.to,exit.spawn,exit.facing);return true;
}
function changeRoom(nextRoom,spawn,facing='front'){
 if(!Number.isInteger(nextRoom)||!roomLayouts[nextRoom])return;
 stopWalking();if(storyAction?.kind==='voiceFollow'&&room!==0)finishStoryEffect(false);resetStoryEffect();resetHiveDisaster();resetSwimming();resetBookAnimation();resetMillCabinet();resetWorkshopDoor();room=nextRoom;
 const point=spawn||roomLayouts[room].spawn;
 player={x:point[0],y:point[1],step:1,facing};
 exitLatch=false;draw();maybeVoiceArrival();
}
let exitLatch=false;
function movePlayer(dx,dy){
 if(beeStingInProgress()){stopWalking();return}
 if(bridgeFall||['voiceReturned','hiveKick'].includes(storyAction?.kind))return;
 if(storyAction&&storyAction.kind!=='voiceFollow')finishStoryEffect(false);
 if(!playing||popupOpen||menuOpen||bellAction||millAction||workshopDoorMotion)return;
 if(swimState.active){swimState.route=null;moveSwimming(dx,dy);return}
 const nx=player.x+dx,ny=player.y+dy;
 if(orchardBeeSting(nx,ny))return;
 if(room===0&&dy>0&&ny>=238){stopWalking();say(castleBoundaryReason());return}
 // The thorn footprint stops her before the distant exit zone is reached.
 // Explain that physical boundary at the point of contact.
 if(room===3&&!flags.thornsCut&&dx>0&&player.x<=288&&nx>288&&ny>=170&&ny<219){stopWalking();say(roomLayouts[3].exits.find(exit=>exit.id==='bridge').blocked);return}
 player.facing=dx<0?'left':dx>0?'right':dy<0?'back':'front';
 // Crossing the narrow plank requires the player's own alignment. Missing
 // its visible surface follows the same water-entry path as stepping off it.
 let moved=false;
 if(clearGroundStep(player.x,player.y,nx,ny)){player.x=nx;player.y=ny;moved=true}
 else if(room===4&&isBridgeWater(nx,ny)&&!objectBlocksActor(nx,ny,room)){if(flags.bridgePlank&&!flags.bridgeFixed)beginBridgeFall(nx,ny);else beginSwimming(nx,ny);return}
 else if(dx&&dy&&clearGroundStep(player.x,player.y,nx,player.y)){player.x=nx;moved=true}
 else if(dx&&dy&&clearGroundStep(player.x,player.y,player.x,ny)){player.y=ny;moved=true}
 // Horizontal keyboard strides can overshoot the last standable column.
 // Enter a reachable portal along that stride before rejecting its endpoint.
 if(!moved&&dx&&!dy&&!exitLatch){
  for(let offset=1;offset<=Math.abs(dx);offset++){
   const edgeX=player.x+Math.sign(dx)*offset;
   if(!clearGroundStep(player.x,player.y,edgeX,player.y))break;
   const edgeExit=roomLayouts[room].exits.find(({zone:[x1,y1,x2,y2]})=>edgeX>=x1&&edgeX<=x2&&player.y>=y1&&player.y<=y2);
   if(edgeExit){player.x=edgeX;player.step++;exitLatch=true;enterExit(edgeExit);return}
  }
 }
 // A restored actor may already occupy an exit at the last walkable column.
 // Check that exit even when the next step is blocked by the screen edge.
 if(moved)player.step++;
 const exit=roomLayouts[room].exits.find(({zone:[x1,y1,x2,y2]})=>player.x>=x1&&player.x<=x2&&player.y>=y1&&player.y<=y2);
 if(exit&&!exitLatch){exitLatch=true;enterExit(exit);return}
 if(!exit)exitLatch=false;
 if(!moved)stopWalking();
 draw();
}
function castleBoundaryReason(){return flags.voiceReturned?'Rosella will see Merrin before leaving the castle grounds.':'Rosella cannot leave Merrin like this. The road beyond the castle must wait.'}
function goToExit(destination){
 // Resolve the visible doorway in this room, rather than requiring its map name.
 const doorwayNames=[
  {'castle gate':'courtyard',drawbridge:'courtyard'},
  {door:'courtyard',doorway:'courtyard',arch:'belfry',archway:'belfry','stair opening':'belfry'},
  {door:'courtyard',doorway:'courtyard',entrance:'courtyard'},
  {},
  {'mill door':'mill','mill doorway':'mill','cave entrance':'grotto','grotto entrance':'grotto'},
  {entrance:'bridge',arch:'bridge',archway:'bridge'},
  {door:'bridge',doorway:'bridge',entrance:'bridge',passage:'bridge','cave entrance':'bridge'},
  {'stair opening':'gallery',staircase:'gallery',stairway:'gallery'},
  {arch:'gallery',archway:'gallery','gallery arch':'gallery','shed door':'shed','shed doorway':'shed','gallery door':'gallery','castle gate':'garden'}
 ];
 if(room===8&&['door','doorway','entrance'].includes(destination)){
  say('There are two entrances: the workshop door on the left and the gallery arch on the right. Which one?');return;
 }
 destination=doorwayNames[room][destination]||destination;
 if(room===0&&['south','s','down','d','leave','road'].includes(destination)){stopWalking();say(castleBoundaryReason());return}
 const exit=roomLayouts[room].exits.find(exit=>exit.names.includes(destination));
 if(!exit){
  if([1,2].includes(room)&&['garden','castle','gate'].includes(destination)){say('First leave through the SOUTH doorway into the courtyard. The garden gate is across the court.');return}
  if(room===0&&['shed','gallery','mirror gallery'].includes(destination)){say('Go through the castle gate NORTH into the courtyard, then enter the '+(destination==='shed'?'left-hand shed door.':'gallery arch on the right.'));return}
  say('There is no exit that way. The visible paths and doorways are the ways through.');return
 }
 if(room===8&&exit.id==='shed'&&!flags.workshopOpen){stopWalking();say(flags.workshopUnlocked?'The workshop door is closed.':'The workshop door is locked. The iron latch will not lift.');return false}
 if(exit.requires&&!flags[exit.requires]){say(exit.blocked);return}
 const [x1,y1,x2,y2]=exit.zone,cx=(x1+x2)/2,cy=(y1+y2)/2;
 if(Math.hypot(player.x-cx,player.y-cy)>65){say('Walk closer to the '+exit.id+' entrance first.');return}
 enterExit(exit);
}
function drawExpandedRoom(){
 const art=roomLayouts[room].art;
 if(!pictureCache[art])pictureCache[art]=decodePicture(roomPictures[art]);
 // Both wheels stay still until the internal mechanism is freed and turned.
 // Freeze naturally with the shared timer while a popup or menu is open.
 const wheelFrame=[4,5].includes(room)&&flags.wheelTurned?animationFrame:null;
 if(wheelFrame!==null){const key=art+'-wheel-'+wheelFrame;if(!pictureCache[key])pictureCache[key]=decodePicture(wheelPictures[art][wheelFrame]);x.drawImage(pictureCache[key],0,0)}
 else if(room===7&&bellSwingFrame()!==null){const frame=bellSwingFrame(),key='belfry-swing-'+frame;if(!pictureCache[key])pictureCache[key]=decodePicture(bellSwingPictures[frame]);x.drawImage(pictureCache[key],0,0)}
 else if(room===3&&thornCutStage()!==null){const stage=thornCutStage(),key='orchard-cut-'+stage;if(!pictureCache[key])pictureCache[key]=decodePicture(thornCutPictures[stage]);x.drawImage(pictureCache[key],0,0)}
 else if(room===3&&flags.thornsCut){if(!pictureCache['orchard-cleared'])pictureCache['orchard-cleared']=decodePicture(roomPictures['orchard-cleared']);x.drawImage(pictureCache['orchard-cleared'],0,0)}
 else if(room===8){const frame=workshopDoorMotion?workshopDoorMotion.frame:flags.workshopOpen?8:0,key='courtyard-door-'+frame;if(!pictureCache[key])pictureCache[key]=decodePicture(workshopDoorPictures[frame]);x.drawImage(pictureCache[key],0,0)}
 else x.drawImage(pictureCache[art],0,0);
 if(room===8)drawCourtyardPennant();
 if(room===3)drawOrchardPennants();
 if(room===2){
  // Foreground threshold returns to the courtyard doorway just used.
  line(125,237,195,237,'#aa5500');line(125,234,195,234,'#555555');
  // Hand-sized tools share the corrected waist-high worktop at native y104.
  // Drawn independently so taking an item removes it from the bench.
  drawShedTools();
  if(pickupStillInScene('plankTaken')){poly([[17,166],[36,161],[42,169],[23,176]],'#aa5500');line(20,166,36,164,'#ffff55')}
 }else if(room===3){
  orchardHive();
 }else if(room===4){
  drawRiverWater();
  // Actual mill doorway and the ground approach beneath its threshold.
  poly([[76,100],[93,100],[93,133],[76,133]],'#000000');
  line(75,100,94,100,'#aa5500');line(75,101,75,133,'#aa5500');line(94,101,94,133,'#555555');
  poly([[76,134],[94,134],[100,149],[76,149]],'#aa5500');line(76,134,94,134,'#aaaaaa');
  // The authored broken edges and clipped river cels define the opening.
  // Keep them visible around the single workshop repair plank.
  drawBridgeRepair();
 }else if(room===5){
  drawMillSluicePanel();drawMillCabinet();
  // Wheel motion comes from native cels, avoiding old crossing-line overlays.
  for(const [left,top,w]of [[86,156,8],[115,159,12],[143,156,10]])line(left+(animationFrame%3)*2,top,left+w+(animationFrame%3)*2,top,'#55ffff');
 }else if(room===6){
  if(flags.poolAwake&&!flags.poolRiddleSolved)drawAwakenedPool(echoMistFrame);
  if(flags.poolRiddleSolved)drawEnchantedPool(echoMistFrame);
  if(storyAction?.kind==='poolRiddleSolved'){drawPoolAnswerRipple(storyAction.frame);drawPoolAnswerSparks(storyAction.frame)}
  if(flags.echoNamed&&!flags.echoCaught)drawFloatingName(animationFrame);
 }else if(room===7){
  drawHarmonyResonators();
  if(flags.ropeFixed){line(176,137,176,177,'#aa5500');line(178,137,178,177,'#ffff55');ellipse(177,178,4,3,'#aa5500')}
  if(flags.bellRung){line(140,97,135,91,'#ffff55');line(207,97,212,91,'#ffff55')}
 }
}
function drawBridgeRepair(){
 if(bridgeFall&&!flags.bridgePlankSlipped){
  // A single loose board tips off its bearing, then catches on the old timber.
  const f=bridgeFall.frame,tilt=f<5?Math.round(f*.6):f<12?Math.round(3+(f-5)*10/7):13;
  poly([[142,158+tilt],[177,158-tilt/2],[179,165-tilt/2],[141,165+tilt]],'#aa5500');
  line(143,159+tilt,177,159-tilt/2,'#ffff55');return;
 }
 if(flags.bridgePlankSlipped&&!flags.bridgeFixed){
  // One end remains hooked on the old timber after the fall.
  poly(bridgeRepairPoints(),'#aa5500');
  line(143,172,177,153,'#ffff55');return;
 }
 if(flags.bridgePlank){
  // The one workshop plank is the same narrow board seen tipping below.
  poly(bridgeRepairPoints(),'#aa5500');
  line(143,159,177,159,'#ffff55');
  line(151,162,164,162,'#000000');
 }
 if(flags.bridgeFixed){
  // Two short twine wraps secure the ends of that single board.
  for(const xx of [146,174]){line(xx,157,xx+1,166,'#ffff55');line(xx+2,158,xx+3,165,'#aa5500')}
 }
}
const pictureCache={};
function decodePicture(encoded){
 const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
 const canvas=document.createElement('canvas');canvas.width=160;canvas.height=168;
 const context=canvas.getContext('2d'),pixels=context.createImageData(160,168);let offset=0;
 for(let i=0;i<bytes.length;i+=2){const color=EGA[bytes[i+1]];for(let n=0;n<bytes[i];n++){pixels.data[offset++]=color[0];pixels.data[offset++]=color[1];pixels.data[offset++]=color[2];pixels.data[offset++]=255}}
 context.putImageData(pixels,0,0);return canvas;
}

function drawShedTools(){
  if(pickupStillInScene('oilTaken')){rect(156,141,5,8,'#0000aa');rect(157,138,3,3,'#aaaaaa');line(157,143,157,147,'#55ffff')}
  if(pickupStillInScene('twineTaken')){ellipse(183,150,5,2,'#aa5500');ellipse(183,149,4,2,'#ffff55');ellipse(183,149,2,1,'#aa5500')}
  if(pickupStillInScene('shearsTaken')){line(125,147,140,153,'#aaaaaa');line(140,147,125,153,'#aaaaaa');ellipse(124,154,2,1,'#aa0000');ellipse(141,154,2,1,'#aa0000')}
}

// Only crowding the hive mouth provokes a sting; the path and wax approach
// remain usable. Moving away from an overlapping restored position is safe.
function orchardBeeSting(nx,ny){
 if(room!==3||flags.waxTaken)return false;
 const distance=(a,b)=>((a-206)/23)**2+((b-194)/14)**2;
 if(distance(nx,ny)>=1||distance(nx,ny)>=distance(player.x,player.y))return false;
 startBeeStingReaction();
 return true;
}
