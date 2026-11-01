// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelUnlocked:true,wheelTurned:true,jarTaken:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true};
function at(room,flags={},x,y){const data={...save,sluice:undefined,room,flags:{...save.flags,...flags}};if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<35;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}


for(const item of ['bell','oil','twine','plank','shears','wax','jar']){
 const a=at(0,{...equipped,wheelOiled:true,wheelUnlocked:true,wheelTurned:true,jarTaken:true},85,205),inventory=JSON.stringify(a.game.state.inv);
 for(const verb of ['give','offer','hand']){unchanged(a,`${verb} ${item} man`,/does not want.*You keep it/);assert.equal(JSON.stringify(a.game.state.inv),inventory)}
}
for(const item of ['bell','oil','twine','plank','shears','jar']){const a=at(0,returned,85,205),inv=JSON.stringify(a.game.state.inv);unchanged(a,`give ${item} to Merrin`,/No, thank you.*You keep it/);assert.equal(JSON.stringify(a.game.state.inv),inv)}
unchanged(at(0,equipped,273,201),'give oil man',/closer/);unchanged(at(0,{},85,205),'give oil man',/not carrying/);
const gift=at(0,{rose:true},85,205);run(gift,'give rose man');assert(gift.game.state.flags.roseGiven);assert(!gift.game.state.inv.includes('rose'));
console.log('PASS item-specific Merrin refusals, restored-voice spoken refusals, shorthand verbs, inventory/score preservation, reach/ownership guards and accepted rose.');
