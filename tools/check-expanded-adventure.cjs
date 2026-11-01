// Headless acceptance checks of the real embedded game script and input handlers.
// Uses a small DOM/canvas stand-in; does not open a browser or render screenshots.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../stolen-voice.html'),'utf8');
const original=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name)}
function boot(storage=new Map()){
 const handlers=new Map(),nodes=new Map(),intervals=new Map();let timer=0,draws=0;
 const context={fillRect(){draws++},clearRect(){},drawImage(){},putImageData(){},getImageData(){return{data:new Uint8ClampedArray(320*168*4)}},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)}}};
 let doc;
 class Element{
  constructor(name){this.name=name;this.classList={remove(){},add(){}};this.style={};this.dataset={};this.value='';this.textContent='';this.innerHTML='';this.hidden=name==='#agi-message';this.inert=['.hud','.footer'].includes(name);this.tabIndex=-1;this.isConnected=true;this.listeners={};this.width=160;this.height=168}
  getContext(){return context}
  focus(){doc.activeElement=this}
  addEventListener(type,callback){(this.listeners[type]??=[]).push(callback)}
  remove(){this.isConnected=false}
  setAttribute(name,value){this[name]=value}
  querySelector(){return get(this.name+' button')}
  querySelectorAll(){return[]}
  matches(selector){return (this===get('#input')&&selector.includes('input'))||(this.name.includes('button')&&selector.includes('button'))||(this.tabIndex>=0&&selector.includes('[tabindex]'))}
  closest(selector){if(selector==='[inert]')return this===get('#input')&&get('.hud').inert?get('.hud'):null;if(selector==='button')return this.name.includes('button')?this:null;return null}
  setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end}
  setPointerCapture(){}
  append(child){child.parent=this;if(child.className==='overlay')nodes.set('ending',child)}
 }
 const get=name=>{if(!nodes.has(name))nodes.set(name,new Element(name));return nodes.get(name)};
 const verbs=['look at','take','use','talk to','go to','save','restore','help'].map(cmd=>{const e=new Element('button '+cmd);e.dataset.cmd=cmd;return e});
 const dpad=['up','down','left','right'].map(move=>{const e=new Element('button '+move);e.dataset.move=move;return e});
 doc={body:get('body'),activeElement:null,hidden:false,querySelector(selector){if(selector==='.screen>.overlay[aria-modal="true"]')return nodes.get('ending')||null;const e=get(selector);return e.isConnected?e:null},querySelectorAll(selector){return selector==='[data-cmd]'?verbs:selector==='[data-move]'?dpad:[]},createElement(tag){return new Element(tag)},addEventListener(type,fn,capture=false){const a=handlers.get(type)||[];a.push({fn,capture});handlers.set(type,a)}};
 doc.activeElement=get('body');
 const window={addEventListener(type,fn){const a=handlers.get('window:'+type)||[];a.push({fn});handlers.set('window:'+type,a)},matchMedia(){return{matches:false}}};
 const sandbox={document:doc,window,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setInterval(fn){const id=++timer;intervals.set(id,fn);return id},clearInterval(id){intervals.delete(id)},atob:text=>Buffer.from(text,'base64').toString('binary'),console,Uint8Array,Uint8ClampedArray,Set,Map};
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const expose=`globalThis.game={command,closeMessage,saveGame,restoreGame,movePlayer,draw,finishGame,hero,canStand,roomLayouts,hotspots,stopWalking,roomPictures, get maxScore(){return MAX_SCORE}, get state(){return JSON.parse(JSON.stringify({room,inv,score,scored,flags,player,playing,popupOpen}))},get key(){return SAVE_KEY}};`;
 vm.runInNewContext(script.replace(/\}\)\(\);\s*$/,expose+'})();'),sandbox,{timeout:10000});
 const game=sandbox.game;
 const event=(key,target=get('#game'))=>({key,target,repeat:false,isComposing:false,preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){this.stopped=true}});
 const key=(name,target)=>{const e=event(name,target);for(const h of [...(handlers.get('keydown')||[])].sort((a,b)=>Number(b.capture)-Number(a.capture))){h.fn(e);if(e.stopped)break}return e};
 const start=()=>{get('#start').onclick();if(get('#intro').isConnected)get('#start').onclick();for(let beat=0;beat<6&&get('#intro').isConnected;beat++)get('#start').onclick();for(let page=0;page<4&&game.state.popupOpen;page++)game.closeMessage()};
 const run=text=>{game.closeMessage();game.command(text);return get('#message').textContent};
 return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,get message(){return get('#message').textContent},get draws(){return draws}};
}
function walkWhere(a,goal,allowExit=null){
 a.game.closeMessage();a.game.stopWalking();
 const state=a.game.state,room=state.room,w=320,h=240,start=state.player.y*w+state.player.x;
 const previous=new Int32Array(w*h).fill(-1),queue=new Int32Array(w*h);let head=0,tail=1,found=-1;queue[0]=start;previous[start]=start;
 const exits=a.game.roomLayouts[room].exits;
 const portalAt=(x,y)=>exits.find(e=>x>=e.zone[0]&&x<=e.zone[2]&&y>=e.zone[1]&&y<=e.zone[3]);
 // A player who tested a closed doorway must be able to step back out of
 // that same zone. The real movement code permits this via its exit latch.
 const startingPortal=portalAt(state.player.x,state.player.y);
 while(head<tail){
  const p=queue[head++],x=p%w,y=Math.floor(p/w);if(goal(x,y)){found=p;break}
  for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
   if(nx<0||nx>=w||ny<0||ny>=h)continue;const next=ny*w+nx;if(previous[next]!==-1)continue;
   const portal=portalAt(nx,ny);if(portal&&portal.id!==allowExit&&portal!==startingPortal)continue;
   if(!a.game.canStand(nx,ny,room))continue;
   previous[next]=p;queue[tail++]=next;
  }
 }
 assert.notEqual(found,-1,'No walkable route from room '+room+' '+state.player.x+','+state.player.y);
 const path=[];for(let p=found;p!==start;p=previous[p])path.push(p);path.reverse();
 // Coalesce unit-grid route into the same small steps used by keyboard movement.
 for(let i=0;i<path.length;){
  const before=a.game.state.player,p=path[i],dx=p%w-before.x,dy=Math.floor(p/w)-before.y;
  let count=1;while(i+count<path.length&&count<3&&path[i+count]%w===before.x+dx*(count+1)&&Math.floor(path[i+count]/w)===before.y+dy*(count+1))count++;
  a.game.movePlayer(dx*count,dy*count);i+=count;
  if(a.game.state.room!==room){assert.equal(i,path.length,'Unexpected early exit');break}
 }
}
function approach(a,id){const point=a.game.hotspots[a.game.state.room][id];assert.ok(point,'Missing hotspot '+id);walkWhere(a,(x,y)=>Math.hypot(x-point[0],y-point[1])<=31)}
function travel(a,id){const exit=a.game.roomLayouts[a.game.state.room].exits.find(e=>e.id===id);assert.ok(exit,'Missing exit '+id);walkWhere(a,(x,y)=>x>=exit.zone[0]&&x<=exit.zone[2]&&y>=exit.zone[1]&&y<=exit.zone[3],id);assert.equal(a.game.state.room,exit.to,'Exit '+id+' did not connect')}
function checkpoint(a){a.run('save');const before=a.game.state;a.run('restore');assert.equal(a.game.state.room,before.room);assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.flags,before.flags);assert.deepEqual(a.game.state.inv,before.inv)}
function act(a,id,text){approach(a,id);return a.run(text)}
// Keep this marker stable: focused suites load the sandbox helpers above it.
check('Eight rooms plus courtyard, embedded native pictures and 105-point quest',()=>{const a=boot();a.start();assert.equal(a.game.roomLayouts.length,9);assert.equal(a.game.maxScore,105);assert.match(html,/const roomPictures=/);assert.equal(a.game.state.score,0)});
check('Object aliases, reach checks and premature name keep the quest intact',()=>{const a=boot();a.start();assert.match(a.run('look at the old man'),/Merrin/);assert.match(a.run('look elephant'),/do not see/);assert.match(a.run('take flower'),/too far/);travel(a,'courtyard');travel(a,'gallery');act(a,'mirror','use jar on mirror');assert.match(a.message,/no jar/);act(a,'mirror','say Merrin');assert.equal(a.game.state.flags.voiceReturned,false)});
// The maintained walkthrough uses the current hive, sluice and harmony puzzles,
// courtyard/key route, narrow single plank and fresh-runtime save checkpoints.
require('./check-adventure-playthrough.cjs');
check('Testing checkpoint keeps its secured plank consistent across restore',()=>{const a=boot();a.start();a.run('xyzzy');assert(a.game.state.flags.bridgeFixed);assert.equal(a.game.state.flags.bridgePlankSlipped,false);checkpoint(a)});
check('Earlier short saves migrate useful progress without skipping the expanded ritual',()=>{const short={version:1,game:'stolen-voice',room:1,flags:{rose:true,bell:true,mirrorAwake:true,readBook:true,voiceReturned:true,complete:true},player:{x:155,y:188,step:1,facing:'front'}};const storage=new Map([['stolen-voice-agi-save-v1',JSON.stringify(short)]]);const a=boot(storage);a.start();a.run('restore');assert.equal(a.game.state.flags.bell,true);assert.equal(a.game.state.flags.mirrorAwake,true);assert.equal(a.game.state.flags.voiceReturned,false);assert.equal(a.game.state.score,15);assert.equal(a.game.state.room,1);assert.match(a.message,/earlier/);assert.equal(storage.get('stolen-voice-agi-save-v1'),JSON.stringify(short))});
check('Popup pauses movement and typing resumes through the native prompt',()=>{const a=boot();a.start();a.run('look');const before=a.game.state.player;a.game.movePlayer(5,0);assert.equal(a.game.state.player.x,before.x);a.key('Enter');a.key('l');assert.equal(a.get('#input').value,'l');a.key('Tab');assert.equal(a.game.state.popupOpen,true)});
check('Every embedded room decodes to exactly 160x168 indexed EGA pixels',()=>{const a=boot();for(const encoded of Object.values(a.game.roomPictures)){const data=Buffer.from(encoded,'base64');let pixels=0;assert.equal(data.length%2,0);for(let i=0;i<data.length;i+=2){assert.ok(data[i]>0);assert.ok(data[i+1]<16);pixels+=data[i]}assert.equal(pixels,160*168)}});
check('All room landing positions lie on walkable ground',()=>{const a=boot();a.game.roomLayouts.forEach((room,id)=>assert.equal(a.game.canStand(room.spawn[0],room.spawn[1],id),true,room.name))});
console.log(`\n${checks} expanded-adventure acceptance checks passed.`);
