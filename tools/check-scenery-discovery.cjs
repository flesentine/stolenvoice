// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelTurned:true,jarTaken:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true};
function at(room,flags={},x,y){const data={...save,room,flags:{...save.flags,...flags}};if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<35;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}

// Each added noun is visible locally, observational and free of state changes.
for(const [room,commands] of [
 [0,['look','look pennants','look rose']],
 [1,['look','look mirror frame','look jewel','look behind table']],
 [2,['look','look underneath bench','look shelves','look drawer']],
 [3,['look','look stump','look under hive','look wax flakes','look beeswax flakes']],
 [4,['look','look cliff','look cave ledge','look bridge posts','look bridge rails']],
 [5,['look','look bearing cap','look axle','look iron rod','look crank pin','look cabinet mechanism']],
 [6,['look','look mineral seams','look mineral deposits','look reflection']],
 [7,['look','look bell axle','look inscription','look plaque']],
 [8,['look','look planter','look ivy','look royal banners']]
]){
 const a=at(room);for(const text of commands){const msg=unchanged(a,text);assert.doesNotMatch(msg,/You do not see|There is no|undefined/,text)}
}
const hive=at(3,{},206,203);assert.match(unchanged(hive,'look'),/beeswax flakes.*grass/);
run(hive,'take wax');assert(hive.game.state.flags.waxTaken);
assert.doesNotMatch(unchanged(hive,'look'),/flakes.*grass/);
assert.match(unchanged(hive,'look stump'),/where the loose beeswax lay/);
const mill=at(5);assert.match(unchanged(mill,'look linkage'),/sling holds.*sack/);
const moving=at(5,{oilTaken:true,wheelOiled:true,wheelTurned:true});assert.match(unchanged(moving,'look linkage'),/sack safely above/);assert.match(unchanged(moving,'look axle'),/smoothly/);
for(const state of [{},{plankTaken:true,bridgePlank:true},{plankTaken:true,bridgePlank:true,twineTaken:true,bridgeFixed:true}])assert.match(unchanged(at(4,state),'look'),/grotto.*cliff/);
for(const [room,command]of [[0,'look linkage'],[2,'look cliff'],[3,'look mirror frame'],[5,'look stump']])assert.match(unchanged(at(room),command),/You do not see/);
for(const [room,object]of [[1,'frame'],[3,'stump'],[4,'cliff'],[4,'bridge posts'],[5,'linkage'],[5,'bearing'],[6,'mineral seams']])assert.doesNotMatch(unchanged(at(room),'take '+object),/You do not see|I did not understand/);
for(const room of [0,3,4,8]){
 const a=at(room);for(const phrase of ['look grass','look at the grass','examine lawn','look turf'])unchanged(a,phrase,/grass/i);
 unchanged(a,'take grass',/rooted/);
}
for(const room of [1,2,5,6,7])unchanged(at(room),'look grass',/You do not see grass here/);
console.log('PASS '+count+' scenery/discovery checks across nine rooms; wax pickup, mechanism states, locality and read-only observations.');
