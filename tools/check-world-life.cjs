const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h='const testClock={now:20000};\n'+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,',`
const lifeHeard=[];playGameSound=(...args)=>lifeHeard.push(args);
globalThis.game={get lifeHeard(){return lifeHeard},get lifeFrame(){return worldLifeFrame},lifePixels:worldLifePixels,birds:worldBirdsHere,tickLife:tickWorldLife,draw,
setLifeScene(r,next={},frame=0){room=r;flags={...flagDefaults,...next};worldLifeFrame=frame;worldLifeLastSound=0;lifeHeard.length=0;effectSource=null;soundEnabled=true;waterAnimationFocused=true;playing=true;draw()},
gateLife(kind){if(kind==='mute')soundEnabled=false;if(kind==='busy')effectSource={};if(kind==='story')storyAction={kind:'bellTaken'};if(kind==='puzzle')harmonyOpen=true;if(kind==='swim')swimState.active=true;if(kind==='focus')waterAnimationFocused=false;if(kind==='popup')popupOpen=true;if(kind==='menu')menuOpen=true},placeRoom(r){room=r;player={...player,x:roomLayouts[r].spawn[0],y:roomLayouts[r].spawn[1]}},command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,clock:testClock}',s);const {boot,clock}=s.qa;
function drain(a){let n=0;while(a.game.state.popupOpen&&n++<40)a.game.closeMessage();assert(n<40)}
function fresh(room=3,flags={}){const a=boot();a.start();drain(a);a.game.setLifeScene(room,flags);return a;}
for(const room of [0,3,4,8]){
 const a=fresh(room);assert.equal(a.game.lifePixels().length,0,'birds absent before high bell');
 a.game.setLifeScene(room,{bellRung:true});const before=a.game.state,pixels=JSON.stringify(a.game.lifePixels());assert(a.game.birds());assert(a.game.lifePixels().length>0);
 for(let n=0;n<120;n++){a.game.tickLife();for(const p of a.game.lifePixels()){assert(Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<160&&p.y>=0&&p.y<168);assert([0,14,15].includes(p.color));}}
 assert.equal(JSON.stringify(a.game.lifePixels()),pixels,'native flight loop closes');assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 assert(a.game.lifeHeard.some(c=>c[0]==='birdsAnswer'&&c[3]===.22));
}
for(const room of [1,2,5,6,7])assert.equal(fresh(room,{bellRung:true}).game.birds(),false,'birds remain outdoors');
const garden=fresh(0,{voiceReturned:true});assert.equal(garden.game.lifePixels().length,0,'no humming while voice is still travelling');garden.game.setLifeScene(0,{voiceReturned:true,voiceArrivalSeen:true});assert(garden.game.lifePixels().some(p=>p.color===14),'Merrin has native music notes once voice arrives');
const mill=fresh(5);mill.game.tickLife();assert.equal(mill.game.lifeHeard.length,0);mill.game.setLifeScene(5,{wheelTurned:true});mill.game.tickLife();assert.equal(mill.game.lifeHeard.at(-1)[0],'millWorking');const heard=mill.game.lifeHeard.length;clock.now+=11000;mill.game.tickLife();assert.equal(mill.game.lifeHeard.length,heard,'no frequent repeating sound');clock.now+=1001;mill.game.tickLife();assert.equal(mill.game.lifeHeard.length,heard+1);
for(const kind of ['mute','busy','story','puzzle','swim','focus','popup','menu','hidden']){
 const a=fresh(3,{bellRung:true}),frame=a.game.lifeFrame;if(kind==='hidden')a.doc.hidden=true;else a.game.gateLife(kind);clock.now+=13000;a.game.tickLife();assert.equal(a.game.lifeHeard.length,0,kind+' never interrupts with ambient sound');
 if(['focus','popup','menu','hidden'].includes(kind))assert.equal(a.game.lifeFrame,frame,kind+' pauses motion');
}
const saved=fresh();saved.game.command('xyzzy');drain(saved);saved.game.placeRoom(3);saved.game.saveGame();drain(saved);const data=saved.storage.get(saved.game.key),restored=boot(new Map([[saved.game.key,data]]));restored.start();restored.game.restoreGame();drain(restored);assert(restored.game.birds());assert(restored.game.lifePixels().length>0,'completed world state survives actual save/restore');
const inspect=fresh(3,{bellRung:true});inspect.game.command('listen to birds');assert.match(inspect.message.replace(/\s+/g,' '),/high bell has company/);drain(inspect);inspect.game.command('look birds');assert.match(inspect.message.replace(/\s+/g,' '),/bright duet/);
console.log('PASS puzzle-gated native birds/Merrin notes, mill audio, quiet cooldown, quest/mute/focus/modal guards, unchanged score/flags and saved world state.');

let pcm;class AudioContext{constructor(){this.destination={}}createBuffer(ch,n){pcm=new Float32Array(n);return{getChannelData:()=>pcm}}createBufferSource(){return{connect(){},disconnect(){},start(){},stop(){}}}resume(){return Promise.resolve()}}
const audio={window:{AudioContext,addEventListener(){}},document:{addEventListener(){}},soundEnabled:true,jingleContext:null,stopOpeningJingle(){}};vm.createContext(audio);vm.runInContext(fs.readFileSync('game/tandy-sound.js','utf8')+';globalThis.play=playGameSound;',audio);
for(const cue of ['birdsAnswer','millWorking']){
 audio.play(cue);const loud=pcm.slice();assert(loud.some(n=>n!==0));audio.play(cue,false,0,.22);assert.equal(pcm.length,loud.length);
 for(let i=0;i<pcm.length;i++)assert(Math.abs(pcm[i]-loud[i]*.22)<1e-7,'ambient cue is attenuated to 22%');
 assert(pcm.every(n=>Number.isFinite(n)&&Math.abs(n)<1),'finite nonclipping PSG audio');
}
console.log('PASS both short PSG ambient cues at verified quiet gain, with normal foreground cue gain preserved.');
