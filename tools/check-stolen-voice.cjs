// Headless acceptance checks of the real embedded game script and input handlers.
// Uses a small DOM/canvas stand-in; does not open a browser or render screenshots.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../stolen-voice-short.html'),'utf8');
const original=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name)}
function boot(storage=new Map()){
 const handlers=new Map(),nodes=new Map(),intervals=new Map();let timer=0,draws=0;
 const context={fillRect(){draws++},clearRect(){},drawImage(){},putImageData(){},getImageData(){return{data:new Uint8ClampedArray(160*168*4)}}};
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
 const expose=`globalThis.game={command,closeMessage,saveGame,restoreGame,movePlayer,draw,finishGame,hero, get state(){return JSON.parse(JSON.stringify({room,inv,score,scored,flags,player,playing,popupOpen}))},get key(){return SAVE_KEY}};`;
 vm.runInNewContext(script.replace(/\}\)\(\);\s*$/,expose+'})();'),sandbox,{timeout:10000});
 const game=sandbox.game;
 const event=(key,target=get('#game'))=>({key,target,repeat:false,isComposing:false,preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){this.stopped=true}});
 const key=(name,target)=>{const e=event(name,target);for(const h of [...(handlers.get('keydown')||[])].sort((a,b)=>Number(b.capture)-Number(a.capture))){h.fn(e);if(e.stopped)break}return e};
 const start=()=>{get('#start').onclick();for(let page=0;page<4&&game.state.popupOpen;page++)game.closeMessage()};
 const run=text=>{game.closeMessage();game.command(text);return get('#message').textContent};
 return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,get message(){return get('#message').textContent},get draws(){return draws}};
}
check('Root entry point serves the current original-branded game',()=>{assert.match(original,/<title>Elara and the Stolen Voice<\/title>/);assert.doesNotMatch(original,/King.s Quest|Rosella|Daventry/)});
check('New adventure has the right title, no Google font dependency and only two rooms',()=>{assert.match(html,/<title>Elara and the Stolen Voice<\/title>/);assert.doesNotMatch(html,/fonts.googleapis|function shore|function lighthouse/);const a=boot();a.start();assert.equal(a.game.state.score,0);a.run('go shore');assert.equal(a.game.state.room,0);a.run('go gallery');a.run('go mirror');assert.equal(a.game.state.room,1)});
check('Main route finishes at 20/20',()=>{const a=boot();a.start();assert.match(a.run('look man'),/tiny bell/);assert.match(a.run('talk gardener'),/Ding/);a.run('take flower');assert.equal(a.game.state.score,5);a.run('use rose on bell');assert.equal(a.game.state.score,10);a.run('go gallery');assert.equal(a.game.state.room,1);assert.match(a.run('read book'),/Speak the owner's name/);a.run('use clapper on mirror');assert.equal(a.game.state.room,1);assert.equal(a.game.state.flags.mirrorAwake,true);a.run('say Merrin');assert.equal(a.game.state.score,15);a.run('go garden');a.run('talk man');assert.equal(a.game.state.score,20);assert.equal(a.game.state.playing,false);assert.equal(a.game.state.flags.complete,true);assert.match(a.get('ending').innerHTML,/Score 20 of 20/);assert.equal(a.intervals.size,0)});
check('Look aliases resolve the man and unknown objects never describe the room',()=>{const a=boot();a.start();for(const cmd of ['look man','look at man','look at the old man','examine gardener','x Merrin'])assert.match(a.run(cmd),/Merrin/);assert.match(a.run('look elephant'),/do not see/);assert.match(a.run('look'),/royal garden/)});
check('Early speech, missing items and wrong locations give useful responses',()=>{const a=boot();a.start();assert.match(a.run('say Merrin'),/inside the gallery/);assert.match(a.run('use rose on bell'),/pick the rose/);a.run('go gallery');assert.match(a.run('say Merrin'),/First sound a silver note/);assert.match(a.run('use clapper on mirror'),/caught inside/);assert.match(a.run('say Graham'),/name of the person/);assert.equal(a.game.state.score,0)});
check('Repeated actions cannot duplicate inventory or points',()=>{const a=boot();a.start();for(let i=0;i<3;i++)a.run('pick up the flower');for(let i=0;i<3;i++)a.run('use the flower in the bell');assert.deepEqual(Array.from(a.game.state.inv),['rose','bell clapper']);assert.equal(a.game.state.score,10);for(let i=0;i<3;i++){a.run('go gallery');a.run('go garden')}assert.equal(a.game.state.score,10);a.run('go gallery');for(let i=0;i<3;i++)a.run('use silver clapper on glass');for(let i=0;i<3;i++)a.run('say "Merrin!"');assert.equal(a.game.state.score,15);a.run('go garden');a.run('talk to the old man');a.game.finishGame();assert.equal(a.game.state.score,20)});
check('Save/restore persists progress without touching the original save slot',()=>{const store=new Map([['star-bell-agi-save-v2','original-save']]);const a=boot(store);a.start();a.run('take rose');a.run('use rose on bell');a.run('go castle');a.run('read book');a.run('use clapper on mirror');a.run('save');const b=boot(store);b.start();b.run('restore');assert.equal(b.game.state.room,1);assert.equal(b.game.state.score,10);assert.equal(b.game.state.flags.mirrorAwake,true);assert.equal(b.game.state.flags.readBook,true);b.run('say Merrin');b.run('go garden');b.run('talk man');assert.equal(b.game.state.score,20);assert.equal(store.get('star-bell-agi-save-v2'),'original-save')});
check('Unreadable and inconsistent saves leave the current quest intact',()=>{const a=boot(new Map([['stolen-voice-agi-save-v1','{broken']]));a.start();a.run('take rose');const before=a.game.state;a.run('restore');assert.match(a.message,/could not be read/);assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,5);const bad={version:1,game:'stolen-voice',room:1,inv:[],score:20,scored:{},flags:{rose:false,bell:false,mirrorAwake:false,voiceReturned:false,complete:true,readBook:false}};const b=boot(new Map([['stolen-voice-agi-save-v1',JSON.stringify(bad)]]));b.start();b.run('restore');assert.equal(b.game.state.score,0);assert.equal(b.game.state.room,0)});
check('Messages block movement and dismiss with Enter, Space, Escape or a click',()=>{const a=boot();a.start();for(const key of ['Enter',' ','Escape']){a.run('look');const before=a.game.state.player;a.game.movePlayer(5,0);assert.deepEqual(a.game.state.player,before);a.key(key);assert.equal(a.game.state.popupOpen,false);assert.equal(a.get('.hud').inert,false)}a.run('look');a.get('#agi-message').listeners.click[0]();assert.equal(a.game.state.popupOpen,false)});
check('Typing starts the parser and WASD enters text',()=>{const a=boot();a.start();for(const k of 'wasd')a.key(k);assert.equal(a.get('#input').value,'wasd');assert.equal(a.doc.activeElement,a.get('#input'));a.key('Backspace');assert.equal(a.get('#input').value,'was');a.key('Escape');assert.equal(a.get('#agi-menu').hidden,false);a.key('Escape');assert.equal(a.get('#agi-menu').hidden,true);assert.equal(a.get('#input').value,'was');const before=a.game.state.player.x;a.key('ArrowRight');assert.equal(a.game.state.player.x,before+5)});
check('Submitting typed commands shows the popup and clears the prompt',()=>{const a=boot();a.start();a.get('#input').value='look at man';a.get('#form').listeners.submit[0]({preventDefault(){}});assert.equal(a.get('#input').value,'');assert.equal(a.game.state.popupOpen,true);assert.match(a.message,/Merrin/);assert.equal(a.doc.activeElement,a.get('#agi-message'))});
check('Standing retains the exact walking frame through background animation',()=>{const a=boot();a.start();a.game.movePlayer(5,0);const step=a.game.state.player.step;for(const tick of a.intervals.values())tick();assert.equal(a.game.state.player.step,step);a.game.draw();assert.equal(a.game.state.player.step,step);assert.doesNotMatch(html,/heroIdleTimer|heroWalking/)});
console.log(`\n${checks} acceptance checks passed.`);
