const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];let stopped=0;playGameSound=(...args)=>{if(soundEnabled){heard.push(args);effectSource={}}};stopGameSound=()=>{stopped++;effectSource=null};globalThis.game={face(value){player.facing=value},setMenu(value){menuOpen=value},setMuted(value){soundEnabled=!value;if(value)stopGameSound()},get heard(){return heard},get stopped(){return stopped},foreignSound(){effectSource={}},rosellaDanceSprite,rosellaDanceChoreography,drawRosellaDance,drawWorkshopMice,workshopMousePoses,workshopRatRoutes,workshopRatPixelVisible,workshopMouseSprite,insidePolygon,drawMirrorReflection,tickStoryEffect,get action(){return storyAction&&{...storyAction}},setFrame(n){storyAction.frame=n},reduced(){window.matchMedia=()=>({matches:true})},place(r,x,y){soundEnabled=true;room=r;player={x,y,step:1,facing:"front"}},colors:rosellaColors,command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
function drain(a){while(a.game.state.popupOpen)a.game.closeMessage()}
function at(r=0,x=85,y=185){const a=s.bootQA();a.start();drain(a);a.game.place(r,x,y);return a}
for(const [r,command]of [[0,'dance with Merrin'],[1,'dance for mirror'],[3,'dance']]){
 const a=at(r,r===1?144:85,r===1?190:185),before=a.game.state;a.game.command(command);
 assert.equal(a.game.action.kind,'courtDance');assert.equal(a.game.action.total,48);assert(!a.game.state.popupOpen,'response waits until dancing finishes');
 assert(a.game.heard.some(call=>call[0]==='courtDance'),'dance starts its score');
 const first=a.game.action.frame;a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,first);assert(a.game.stopped>0,'hidden dance pauses owned music');a.doc.hidden=false;
 const frames=[];for(let n=0;n<48;n++){a.game.setFrame(n);const rows=a.game.rosellaDanceSprite(n);frames.push(Array.from(rows));assert.equal(rows.length,40);assert(rows.every(row=>row.length===14&&/^[.0-9a-f]+$/.test(row)));}
 assert(new Set(frames.map(rows=>rows.slice(14,25).map(row=>row.replace(/[^c]/g,".")).join(""))).size>=6,'hands change pose through the turn');
 assert(new Set(frames.map(JSON.stringify)).size>=8,'visibly different turn and step cels');assert.deepEqual(frames[0],frames[47],'returns to starting pose');
 a.game.setFrame(0);for(let n=0;n<48;n++)a.game.tickStoryEffect();assert(!a.game.action);assert(a.game.state.popupOpen);assert.deepEqual(a.game.state.player,before.player);assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.inv,before.inv);
 if(r!==0)assert.deepEqual(a.game.state.flags,before.flags);
 if(r===0)fs.writeFileSync('assets/reviews/rosella-dance-frames.json',JSON.stringify({frames,colors:Array.from(a.game.colors)}));
}
// Turning the arm away must reveal cloth, not transparent torso pixels.
const body=at(),turn=['front','left','back','right'];
const centerOf=(row,inks)=>{const columns=[...row].map((ink,col)=>inks.includes(ink)?col:-1).filter(col=>col>=0);assert(columns.length,'visible anatomy row');return(columns[0]+columns.at(-1))/2};
for(const origin of turn)for(const reflected of [false,true])for(let n=25;n<43;n++){
 body.game.face(origin);const rows=body.game.rosellaDanceSprite(n,reflected),waist=centerOf(rows[23],'19');
 assert(Math.abs(centerOf(rows[36],'c')-waist)<=.5,'twirl legs centered under waist '+origin+'/'+reflected+'/'+n);
 assert(Math.abs(centerOf(rows[38],'6')-waist)<=.5,'twirl boots follow body '+origin+'/'+reflected+'/'+n);
}
for(const origin of turn)for(const reflected of [false,true])for(let n=0;n<48;n++){
 body.game.face(origin);const frame=n>=44?27:n%24,twirl=n>=24&&n<44;if(!twirl&&(frame<2||frame>=24))continue;
 const rotation=twirl?(n<40?Math.floor((n-24)/2)%4:0):[0,1,2,3,0,0,0][Math.floor(frame/4)];
 let facing=turn[(turn.indexOf(origin)+rotation)%4];
 if(reflected)facing={front:'back',back:'front',left:'left',right:'right'}[facing];
 if(!['left','right'].includes(facing))continue;
 const rows=body.game.rosellaDanceSprite(n,reflected),sway=Math.round(Math.sin(frame*Math.PI/8)),left=(facing==='left'?3:2)+3+sway;
 for(let y=14;y<=24;y++)for(let x=left;x<left+3;x++)assert.notEqual(rows[y][x],'.','solid profile torso '+origin+'/'+reflected+'/'+n+' at '+x+','+y);
}
body.game.face('front');
const spinning=body.game.rosellaDanceSprite(33),settled=body.game.rosellaDanceSprite(47);
assert(spinning[27].includes('c')&&spinning[36].includes('c'),'twirl raises hem to show knees and calves');
assert(!spinning[26].includes('c'),'spinning skirt covers upper legs');
assert(spinning[26].replace(/\./g,'').length>=12,'skirt fans out during spin');
assert(!settled[30].includes('c'),'hem settles after twirl');
for(let n=24;n<44;n++)assert(/[06]/.test(body.game.rosellaDanceSprite(n)[39]),'pivot feet stay grounded throughout twirl');
const mirror=at(1,144,190);mirror.game.command('dance for mirror');const ctx=mirror.get('canvas').getContext('2d'),pixels=[];ctx.fillRect=(x,y)=>pixels.push([x,y]);
for(let n=0;n<48;n++){mirror.game.setFrame(n);mirror.game.drawMirrorReflection()}
assert(pixels.length>0);const polygon=[[63,48],[72,38],[82,48],[82,101],[63,101]];
// Use the same public game geometry helper as the room's clipping contract.
for(const [x,y]of pixels)assert(mirror.game.insidePolygon(x,y,polygon),'reflection remains inside the arched glass');
const reduced=at();reduced.game.reduced();reduced.game.command('dance');assert(!reduced.game.action);assert(reduced.game.state.popupOpen);
const saved=at();saved.game.command('dance');saved.game.saveGame();assert(!saved.game.action);assert(saved.storage.has(saved.game.key));
const interrupted=at();interrupted.game.command('dance');interrupted.game.movePlayer(1,0);assert(!interrupted.game.action,'walking interrupts optional dance');
const paused=at();paused.game.command('dance');paused.game.tickStoryEffect();const frame=paused.game.action.frame;
paused.game.setMenu(true);paused.game.tickStoryEffect();assert.equal(paused.game.action.frame,frame);paused.game.setMenu(false);paused.game.tickStoryEffect();assert.equal(paused.game.heard.at(-1)[2],frame*.09,'menu resumes score at frozen dance frame');
paused.game.setMuted(true);paused.game.tickStoryEffect();const muted=paused.game.heard.length;paused.game.tickStoryEffect();assert.equal(paused.game.heard.length,muted);const resumeFrame=paused.game.action.frame;paused.game.setMuted(false);paused.game.tickStoryEffect();assert.equal(paused.game.heard.at(-1)[2],resumeFrame*.09,'unmute rejoins current dance beat');
const owned=at();owned.game.command('dance');const stopped=owned.game.stopped;owned.game.movePlayer(1,0);assert.equal(owned.game.stopped,stopped+1,'interrupt stops owned dance music');
const foreign=at();foreign.game.command('dance');foreign.game.foreignSound();const untouched=foreign.game.stopped;foreign.game.movePlayer(1,0);assert.equal(foreign.game.stopped,untouched,'interrupt preserves newer cue');
for(const command of ['dance','dance for Merrin','dance with Merrin']){
 const far=at(0,290,225),before=far.game.state;far.game.command(command);assert.equal(far.game.action.kind,'courtDance','dance anywhere in garden');assert.match(far.game.action.message,/roses.*audience/);assert.deepEqual(far.game.state.player,before.player,'no auto-walk toward Merrin');assert.deepEqual(far.game.state.flags,before.flags,'distant dance does not record a Merrin interaction');
}
const stillFar=at(0,290,225);stillFar.game.command('kiss Merrin');assert(!stillFar.game.action,'other close interactions retain their reach gate');
console.log('PASS 48-frame courtly dance, eight-plus distinct native poses, grounded return, reflection clipping, optional state/score, reduced motion, save and movement interruption, reach and hidden pause.');

const workshop=at(2,160,212),workshopBefore=workshop.game.state;workshop.game.command('dance');
assert.equal(workshop.game.action.total,224);assert.equal(workshop.game.heard.at(-1)[0],'workshopDance');
const mouseContext=workshop.get('canvas').getContext('2d'),mouseFrames=[],heroFrames=[],poses=[];
for(let frame=0;frame<224;frame++){
 workshop.game.setFrame(frame);poses.push(workshop.game.workshopMousePoses(frame));
 const dots=[];mouseContext.fillRect=function(x,y,w,h){assert(Number.isInteger(x)&&Number.isInteger(y));dots.push([x,y,w,h,this.fillStyle])};
 workshop.game.drawWorkshopMice();const mousePixels=dots.length,ratDots=dots.slice();workshop.game.drawRosellaDance(160,212);const heroPixels=new Set(dots.slice(mousePixels).filter(d=>d[4]!=='#000000').map(d=>d[0]+','+d[1]));for(const dot of ratDots)assert(!heroPixels.has(dot[0]+','+dot[1]),'rat stays outside Rosella silhouette at '+frame);mouseFrames.push(dots);heroFrames.push(Array.from(workshop.game.rosellaDanceSprite(frame)));
 if(frame<8||frame>=220)assert.equal(mousePixels,0,'guests stay hidden before entrance and after exit');
 else if(frame>=28&&frame<208)assert(mousePixels>0,'dancing mice emerge and remain visible');
}
assert.equal(poses[45].length,3);assert(poses[45].every(p=>p.x>=9&&p.x<=152&&p.y>=125&&p.y<=163));assert.notDeepEqual(poses[45],poses[48],'mice step to the beat');
assert.deepEqual(heroFrames[0],heroFrames[223],'Rosella settles at original pose');assert.notDeepEqual(heroFrames[55],heroFrames[95],'Rosella keeps dancing beyond original 48 frames');
fs.writeFileSync('assets/reviews/workshop-mouse-dance.json',JSON.stringify(mouseFrames));
workshop.game.setFrame(70);workshop.doc.hidden=true;workshop.game.tickStoryEffect();assert.equal(workshop.game.action.frame,70);workshop.doc.hidden=false;workshop.game.tickStoryEffect();assert.equal(workshop.game.heard.at(-1)[0],'workshopDance');assert.equal(workshop.game.heard.at(-1)[2],70*.09);
workshop.game.setFrame(223);workshop.game.tickStoryEffect();assert(!workshop.game.action);assert.match(workshop.message.replace(/\s+/g,' '),/Three mice.*footwear/);
for(const key of ['player','flags','inv','score'])assert.deepEqual(workshop.game.state[key],workshopBefore[key],'workshop dance preserves '+key);
for(const [x,y]of [[20,195],[300,235]]){const edge=at(2,x,y);edge.game.command('dance');for(let n=0;n<224;n++){edge.game.setFrame(n);for(const p of edge.game.workshopMousePoses(n))assert(p.x>=9&&p.x<=152&&p.y>=125&&p.y<=163,'floor guests remain in bounds')}}
const workshopReduced=at(2,160,212);workshopReduced.game.reduced();workshopReduced.game.command('dance');assert(!workshopReduced.game.action);assert.equal(workshopReduced.game.heard.at(-1)[0],'workshopDance');assert.match(workshopReduced.message,/mice/);
const mouseInterrupted=at(2,160,212);mouseInterrupted.game.command('dance');mouseInterrupted.game.movePlayer(1,0);assert(!mouseInterrupted.game.action);assert.equal(mouseInterrupted.game.workshopMousePoses(40).length,0,'mice disappear with interrupted effect');
console.log('PASS twenty-second workshop dance, three entering/dancing/retreating native mice, extended hero poses, music offset, floor bounds, reduced motion, interruption and unchanged quest state.');

for(let beat=0;beat<4;beat++){
 const rows=workshop.game.workshopMouseSprite(beat);assert.equal(rows.length,11);assert(rows.every(r=>r.length===13));
 const ink=rows.join('').replace(/\./g,''),pink=[...ink].filter(c=>c==='c').length,gray=[...ink].filter(c=>c==='7'||c==='8').length;
 assert(gray/ink.length>=.8,'solid gray mouse rather than scattered pink pixels');assert(pink/ink.length<=.16,'small pink accents');assert(rows.join('').includes('0'),'clear dark eye');
}
console.log('PASS compact mouse silhouettes, round ear/muzzle, dark eye and limited pink accents in all four dance beats.');

const synchronized=at(2,160,212);synchronized.game.command('dance');
for(let f=8;f<220;f++){
 synchronized.game.setFrame(f);const dance=synchronized.game.rosellaDanceChoreography(f);
 for(const mouse of synchronized.game.workshopMousePoses(f)){assert.equal(mouse.danceFacing,dance.facing);assert.equal(mouse.step,dance.step);assert.equal(mouse.active,dance.active);assert.equal(mouse.twirl,dance.twirl)}
}
for(const facing of ['front','back','left','right'])for(let beat=0;beat<6;beat++){const rows=workshop.game.workshopMouseSprite(beat,facing,true,beat%4);assert.equal(rows.length,11);assert(rows.every(r=>r.length===13));if(facing==='back')assert(!rows[3].includes('0'),'back-facing mice turn their faces away')}
console.log('PASS mice share Rosella\'s exact facing, footwork, arm phrase and twirl timing through the full number.');

// Confirm facing is not reversed again by the native painter after cel selection.
for(const frame of [12,18,28,32,36,40,60,68,84]){
 synchronized.game.setFrame(frame);const dots=new Map(),ctx=synchronized.get('canvas').getContext('2d');ctx.fillRect=function(x,y,w,h){dots.set(x+','+y,this.fillStyle)};
 synchronized.game.drawWorkshopMice();
 for(const mouse of synchronized.game.workshopMousePoses(frame)){
  const rows=synchronized.game.workshopMouseSprite(mouse.beat,mouse.danceFacing,mouse.active,mouse.step,mouse.twirl);
  rows.forEach((row,y)=>[...row].forEach((ink,col)=>{if(ink!=='.'&&synchronized.game.workshopRatPixelVisible(mouse.x+col-6,mouse.y-10-mouse.hop+y,mouse.y))assert.equal(dots.get((mouse.x+col-6)+','+(mouse.y-10-mouse.hop+y)),synchronized.game.colors[parseInt(ink,16)],'traced rat paints exact facing, without a second flip')}));
 }
}
console.log('PASS exact 13x11 traced-rat painting in all turn phases, including correct left/right noses.');

const conga=at(2,160,212);conga.game.command('dance');const routes=conga.game.workshopRatRoutes();
assert.equal(routes.length,3);for(const route of routes){assert.equal(route[0][0],140);assert.equal(route[0][1],125,'all rats originate behind the barrel');for(let n=1;n<route.length;n++){assert(Math.abs(route[n][0]-route[n-1][0])<=1&&Math.abs(route[n][1]-route[n-1][1])<=1,'continuous floor route')}}
for(let frame=8;frame<220;frame++){conga.game.setFrame(frame);for(const rat of conga.game.workshopMousePoses(frame))if(rat.y>=136)assert(Math.abs(rat.x-80)>=14||rat.y-10-rat.hop>149,'routes skirt the full hero, including the middle rat')}
console.log('PASS shared barrel origin, continuous obstacle-avoiding routes, visible semicircle, no rat/hero pixel overlap, and staggered retreat behind barrel.');

// Barrel overlap changes priority with the mouse's feet, in both directions.
const priority=at(2,160,212);priority.game.command('dance');
assert(!priority.game.workshopRatPixelVisible(138,120,125),'initial mouse remains behind the barrel');
assert(priority.game.workshopRatPixelVisible(138,120,131),'emerged mouse is in front, even where its head overlaps the barrel');
assert(!priority.game.workshopRatPixelVisible(138,120,130),'retreating mouse goes behind only after crossing the base');
const barrelMask=new Set();for(const [left,top,width]of require('./build-object-priorities.cjs')()[2].find(o=>o.id==='storage-barrel').mask)for(let n=0;n<width;n++)barrelMask.add(top*160+left+n);
let frontOverlap=0;
for(let f=8;f<220;f++){
 priority.game.setFrame(f);const dots=new Map(),ctx=priority.get('canvas').getContext('2d');ctx.fillRect=function(x,y,w,h){dots.set(y*160+x,this.fillStyle)};priority.game.drawWorkshopMice();
 for(const mouse of priority.game.workshopMousePoses(f)){
  if(mouse.y<131)continue;
  const rows=priority.game.workshopMouseSprite(mouse.beat,mouse.danceFacing,mouse.active,mouse.step,mouse.twirl);
  rows.forEach((row,y)=>[...row].forEach((ink,col)=>{const xx=mouse.x+col-6,yy=mouse.y-10-mouse.hop+y;if(ink!=='.'&&barrelMask.has(yy*160+xx)){frontOverlap++;assert(dots.has(yy*160+xx),'front mouse pixels paint over barrel at '+f)}}));
 }
}
assert(frontOverlap>0,'exercise real entrance/retreat overlap with barrel');
console.log('PASS mouse priority behind barrel before emergence, in front after crossing its base, and behind again on retreat.');
