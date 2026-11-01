// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelTurned:true,jarTaken:true,poolAwake:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true};
function at(room,flags={},x,y){const data={...save,room,flags:{...save.flags,...flags}};if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<35;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}

const hive=at(3,{},206,203);
for(const text of ['kick hive','kick the beehive','boot abandoned hive'])unchanged(hive,text,/gentle nudge.*straw rustles/);
unchanged(at(3,{},25,202),'kick hive',/closer/);
unchanged(at(8),'kick hive',/do not see a hive/);
unchanged(at(3,{waxTaken:true},206,203),'kick hive',/gentle nudge/);
unchanged(hive,'polish hive',/no useful way/);
unchanged(at(8),'tickle grass',/no useful way/);
const unknown=at(8),message=run(unknown,'flibbertigibbet moonstone');assert.match(message,/phrasing it another way/);assert.doesNotMatch(message,/Try a verb and an object/);
assert.doesNotMatch(read('stolen-voice.html'),/Try a verb and an object/);
console.log('PASS hive kick/nudge, reach/locality, no state or score changes, and truthful action fallback.');
