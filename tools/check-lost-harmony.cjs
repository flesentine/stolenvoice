const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={get heard(){return heard},get harmonySolved(){return harmonySolved},get harmonyPulse(){return harmonyPulse},get harmonyHelp(){return harmonyHelp},get weights(){return harmonyWeights.slice()},get harmonyOpen(){return harmonyOpen},get pitches(){return harmonyPitches()},get harmonyBeat(){return harmonyBeat},get bellUI(){return bellAction},tickBellPull,art:harmonyPixels,command,');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(h+';globalThis.qa={boot};',scope);const {boot}=scope.qa;
const base=boot();base.start();base.game.saveGame();const save=JSON.parse(base.storage.get(base.game.key));save.room=7;save.player={x:177,y:221,step:0,facing:'front'};Object.assign(save.flags,{bell:true,jarTaken:true,wheelUnlocked:true,wheelTurned:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true,echoCaught:true,waxTaken:true,jarSealed:true,twineTaken:true,ropeFixed:true});save.sluice=[2,5,0,0,1,1,1,7,1,1,4,5,1,3,6,3];
function drain(a){for(let i=0;a.game.state.popupOpen&&i<30;i++)a.game.closeMessage()}
function setup(data=save){const a=boot(new Map([[base.game.key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,7);return a}
function tick(a){for(const fn of [...a.intervals.values()])fn()}
function ring(a){a.game.command('pull rope');for(let i=0;i<90&&!a.game.harmonyOpen;i++)tick(a);assert(a.game.harmonyOpen);assert(a.game.harmonyHelp);const before=Array.from(a.game.weights);a.key('ArrowUp');assert.deepEqual(Array.from(a.game.weights),before,'instructions consume adjustment keys');a.key('Enter');assert(!a.game.harmonyHelp);assert(!a.game.state.flags.bellRung)}
const listening=setup();listening.game.command('pull rope');
for(let n=0;n<20;n++)tick(listening);
assert(listening.game.bellUI,'bell keeps the scene while the melody rings out');
assert(!listening.game.harmonyOpen,'puzzle does not interrupt the bell melody');
for(let n=0;n<34;n++)tick(listening);
assert(!listening.game.harmonyOpen,'full additional listening hold');
tick(listening);assert(listening.game.harmonyOpen,'puzzle opens after the bell listening hold');
const a=setup(),score=a.game.state.score;ring(a);assert.deepEqual(Array.from(a.game.weights),[1,5,2]);const player=a.game.state.player;
a.key('z');a.game.movePlayer(3,0);assert.deepEqual(a.game.state.player,player);assert(a.game.harmonyOpen);
a.key('h');assert(a.game.harmonyHelp);a.key('Enter');assert(!a.game.harmonyHelp);a.key('l');tick(a);assert(a.game.harmonyBeat>0);const beat=a.game.harmonyBeat;a.doc.hidden=true;tick(a);assert.equal(a.game.harmonyBeat,beat);a.doc.hidden=false;
a.get('#agi-message-picture').getBoundingClientRect=()=>({left:10,top:10,width:640,height:400});for(const fn of a.get('#agi-message').listeners.click||[])fn({clientX:0,clientY:0,preventDefault(){},stopPropagation(){}});
a.key('ArrowUp');assert.deepEqual(Array.from(a.game.pitches),[0,2,0],'left weight changes two pitches');a.key('Escape');a.game.saveGame();const saved=JSON.parse(a.storage.get(base.game.key));assert.deepEqual(saved.harmony,[2,5,2]);const resumed=setup(saved);assert.deepEqual(Array.from(resumed.game.weights),[2,5,2]);resumed.game.command('tune resonators');assert(resumed.game.harmonyOpen);resumed.key('Enter');resumed.key('r');assert.deepEqual(Array.from(resumed.game.weights),[1,5,2]);resumed.key('Enter');assert.equal(resumed.game.harmonyBeat,0);
for(let i=0;i<3;i++)resumed.key('ArrowUp');resumed.key('ArrowRight');for(let i=0;i<4;i++)resumed.key('ArrowDown');resumed.key('ArrowRight');for(let i=0;i<3;i++)resumed.key('ArrowUp');assert(resumed.game.harmonyOpen);assert(resumed.game.harmonySolved);assert(resumed.game.heard.some(args=>args[0]==="sluiceSolved"),'joyous music begins at the winning adjustment');assert(resumed.game.state.flags.harmonyTuned);assert(!resumed.game.bellUI);const solvedWeights=Array.from(resumed.game.weights),pulse=resumed.game.harmonyPulse;for(let n=0;n<50;n++)tick(resumed);assert(resumed.game.harmonyPulse>pulse);assert(resumed.game.harmonyOpen,'success waits for the player');resumed.key('ArrowDown');assert.deepEqual(Array.from(resumed.game.weights),solvedWeights);resumed.key('Enter');assert(!resumed.game.harmonyOpen);assert(resumed.game.bellUI);assert(!resumed.game.state.flags.bellRung);
for(let i=0;i<180&&resumed.game.bellUI;i++)tick(resumed);assert(resumed.game.state.flags.bellRung);assert.equal(resumed.game.state.score,score+5);drain(resumed);resumed.game.command('inspect resonators');assert(!resumed.game.harmonyOpen);assert.equal(resumed.game.state.score,score+5);
// Every possible weight arrangement is valid and exactly one matches the phrase.
let matches=0;for(let l=0;l<7;l++)for(let m=0;m<7;m++)for(let r=0;r<7;r++)if([(l+m)%7,(l+m+r)%7,(m+r)%7].join()==='5,3,6')matches++;assert.equal(matches,1);
// Mouse rail positions use the same puzzle rules and support fractional scaling.
const mouse=setup();ring(mouse);const bounds={left:13,top:27,width:800,height:500};mouse.get('#agi-message-picture').getBoundingClientRect=()=>bounds;
function clickWeight(index,value){const event={clientX:bounds.left+(43+index*37)*5,clientY:bounds.top+(149-value*5)*2.5,preventDefault(){},stopPropagation(){}};for(const fn of mouse.get('#agi-message').listeners.click||[])fn(event)}
clickWeight(0,4);clickWeight(1,1);clickWeight(2,5);assert(mouse.game.state.flags.harmonyTuned);assert(mouse.game.harmonyOpen);assert(mouse.game.harmonySolved);clickWeight(2,5);assert(!mouse.game.harmonyOpen);
const old=JSON.parse(JSON.stringify(save));delete old.flags.harmonyTuned;delete old.harmony;old.flags.bellRung=true;const legacy=setup(old);assert(legacy.game.state.flags.harmonyTuned);assert.deepEqual(Array.from(legacy.game.weights),[4,1,5]);
const bad=JSON.parse(JSON.stringify(save));bad.harmony=[8,0,0];const rejected=boot(new Map([[base.game.key,JSON.stringify(bad)]]));rejected.start();rejected.game.restoreGame();assert.equal(rejected.game.state.room,0);
const art=a.game.art();assert.equal(art.length,160*168);assert(art.every(v=>v<16));
if(process.argv.includes('--preview')){const A=require('../editor/agi-picture.js'),sharp=require('sharp');sharp(Buffer.from(A.rgba(art)),{raw:{width:160,height:168,channels:4}}).resize(640,672,{kernel:'nearest'}).png().toFile('assets/reviews/lost-harmony.png')}
console.log('PASS Lost Harmony: linked pitches, unique solution, keyboard and mouse, replay/mute visual clues, reset, pause, partial save, old-save migration, automatic bell transformation and one reward.');

const panelSave=JSON.parse(JSON.stringify(save));panelSave.player={x:248,y:195,step:0,facing:'back'};const panel=setup(panelSave);
panel.game.command('look mechanism');assert(panel.game.harmonyOpen,'generic mechanism resolves to the belfry instrument from its own approach');
console.log('PASS belfry LOOK MECHANISM uses its local instrument and proximity.');
