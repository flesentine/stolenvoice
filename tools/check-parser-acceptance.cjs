// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get busy(){return !!storyAction||!!bellAction||!!millAction||!!bookAnimationTimer},get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelTurned:true,jarTaken:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true,voiceArrivalSeen:true,voiceDepartureSeen:true,voiceCourtyardSeen:true};
function at(room,flags={},x,y){const data={...save,room,flags:{...save.flags,...flags}};data.flags.wheelUnlocked=!!(flags.wheelUnlocked||flags.wheelTurned);data.sluice=data.flags.wheelUnlocked?[2,5,0,0,1,1,1,7,1,1,4,5,1,3,6,3]:[2,1,1,5,1,1,0,7,1,3,4,3,1,6,5,0];if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<160&&(n<35||a.game.busy);n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}
for(const text of ['lift bell','tip bell','turn bell upside down','take bell','unhook bell']){const a=at(0,{rose:true},273,184),before=a.game.state.score;run(a,text);assert(a.game.state.flags.bell,text);assert.equal(a.game.state.score,before+5);run(a,text);assert.equal(a.game.state.score,before+5,'single clapper scoring')}
for(const text of ['cut blackthorn','prune thorns','trim back brambles','cut thorns using shears']){const a=at(3,equipped,273,201),score=a.game.state.score;run(a,text);assert(a.game.state.flags.thornsCut,text);assert.equal(a.game.state.score,score+5);run(a,text);assert.equal(a.game.state.score,score+5)}
for(const text of ['put wood bridge','put planks bridge','place wooden plank broken bridge','lay board bridge','put wood on bridge']){const a=at(4,equipped,130,169),score=a.game.state.score;run(a,text);assert(a.game.state.flags.bridgePlank,text);assert.equal(a.game.state.score,score+5);run(a,text);assert.equal(a.game.state.score,score+5)}
for(const text of ['tie plank to bridge','lash board onto bridge','secure plank with twine','bind bridge','tie plank to bridge with twine']){const a=at(4,{...equipped,bridgePlank:true},130,169),score=a.game.state.score;run(a,text);assert(a.game.state.flags.bridgeFixed,text);assert.equal(a.game.state.score,score+5);run(a,text);assert.equal(a.game.state.score,score+5)}
for(const text of ['catch echo','capture echo with jar','fill jar','fill jar with echo','hold jar over pool','hold glass jar above water','bottle echo in jar']){const a=at(6,echo,190,190),score=a.game.state.score;run(a,text);assert(a.game.state.flags.echoCaught,text);assert.equal(a.game.state.score,score+5);run(a,text);assert.equal(a.game.state.score,score+5)}
for(const text of ['seal jar beeswax','seal glass jar wax','seal jar with beeswax','seal the jar using the wax','plug jar with wax']){const a=at(6,captured,190,190),score=a.game.state.score;run(a,text);assert(a.game.state.flags.jarSealed,text);assert.equal(a.game.state.score,score+5);unchanged(a,text,/already sealed/)}
for(const [flags,match]of [[echo,/faint|empty|uncovered/],[{...captured,waxTaken:false},/wax/],[{},/jar/]]){const a=at(6,flags,190,190);unchanged(a,'seal jar beeswax',match)}
for(const text of ['give voice jar to mirror','offer voice to mirror','offer voice jar to gallery mirror','hand jar to mirror','show voice jar to mirror']){const a=at(1,{...voice,mirrorAwake:true},144,190),score=a.game.state.score;run(a,text);assert(a.game.state.flags.voiceOffered,text);assert.equal(a.game.state.score,score+5);run(a,text);assert.equal(a.game.state.score,score+5)}
for(const text of ['ring clapper','sound silver clapper','tap clapper against mirror']){const a=at(1,equipped,144,190);run(a,text);assert(a.game.state.flags.mirrorAwake,text)}
for(const [room,flags,x,y,commands]of [
 [0,{},85,185,['hello','ask merrin about voice']],
 [0,{rose:true},273,184,['smell rose','reach into bell']],
 [8,{},undefined,undefined,['open left door','open right door']],
 [2,equipped,160,212,['open drawer','look inside drawer','open shears','take soil','take roots','take all']],
 [3,equipped,181,202,['search hive','look bees','eat apple','take honey','take hive']],
 [4,{},116,194,['look wheel','turn wheel','climb wheel','jump','jump gap','listen to water']],
 [5,equipped,245,190,['open cabinet','pull latch','open cupboard']],
 [1,equipped,144,190,['touch mirror','give rose to mirror']],
 [6,captured,190,190,['close jar','listen jar','throw clapper in pool']]
]){const a=at(room,flags,x,y);for(const text of commands)unchanged(a,text)}
// Looking inside now props the visible lid open; repeated OPEN is harmless.
const barrel=at(2,{},260,205),barrelBefore=barrel.game.state;
assert.match(run(barrel,'look in barrel'),/manure.*glints/);
assert.deepEqual(JSON.parse(JSON.stringify(barrel.game.state.flags)),{...JSON.parse(JSON.stringify(barrelBefore.flags)),barrelOpen:true});
for(const field of ['inv','score','player'])assert.deepEqual(barrel.game.state[field],barrelBefore[field],'opening barrel preserves '+field);
unchanged(barrel,'open lid',/already propped open/);
// Visible orchard scenery responds without changing story state.
for(const text of ['look mountains','look at mountains','look mountain','look peaks','examine snowy mountains','look at snow-capped mountains'])unchanged(at(3,{}),text,/Snow crowns the distant blue peaks/);
unchanged(at(2,{}),'look mountains',/do not see/);
// Correct intentions must still respect reach, ownership and ritual prerequisites.
unchanged(at(0,{},273,184),'use rose on bell',/stem|growing/);
unchanged(at(0,{rose:true},85,185),'lift bell',/closer/);
unchanged(at(3,{},273,201),'cut blackthorn',/bare hands/);
unchanged(at(3,{shearsTaken:true},273,201),'cut blackthorn',/handles barely move/);
unchanged(at(4,{plankTaken:true,bridgePlank:true},130,169),'tie plank to bridge',/no twine/);
unchanged(at(6,{},190,190),'catch echo',/empty air/);
unchanged(at(6,{...echo,echoNamed:false},190,190),'hold jar over pool',/No sound gathers/);
unchanged(at(6,echo,43,184),'capture echo with jar',/closer/);
unchanged(at(1,{...sealed,mirrorAwake:true},144,190),'give jar to mirror',/not the voice/);
unchanged(at(1,voice,144,190),'offer voice jar to mirror',/dim and still/);
unchanged(at(1,{...voice,mirrorAwake:true},284,201),'give voice jar to mirror',/closer/);
// The pictured bottle in the unlocked cupboard must not resolve to carried oil.
const bottle=at(5,{oilTaken:true,wheelOiled:true,wheelTurned:true,cabinetOpen:true},245,190);run(bottle,'take bottle');assert(bottle.game.state.flags.jarTaken);assert(bottle.game.state.inv.includes('oil flask'));run(bottle,'take jar');assert.equal(bottle.game.state.score,12);
// Changing contents agree across inventory, LOOK, LISTEN, help, reuse and restore.
const heard=at(6,echo,190,190);unchanged(heard,'listen',/Merrin.*again/);unchanged(heard,'listen to echo',/Merrin.*again/);
const r=at(1,offered,144,190);run(r,'say Merrin');assert(r.game.state.flags.voiceReturned);assert(r.game.state.inv.includes('glass jar'));assert(!r.game.state.inv.includes('voice jar'));unchanged(r,'look jar',/empty again/);unchanged(r,'listen jar',/silent/);unchanged(r,'listen to jar',/silent/);unchanged(r,'look voice',/making its way/);unchanged(r,'take voice',/making its way/);unchanged(r,'seal jar',/empty and open/);run(r,'save');run(r,'restore');assert(r.game.state.inv.includes('glass jar'));
const done=at(6,returned,190,190);unchanged(done,'look pool',/returned to Merrin/);unchanged(done,'fill jar',/no borrowed voice/);unchanged(done,'say Merrin',/voice back/);unchanged(done,'use wax on jar',/empty now/);
const hive=at(3,equipped,181,202);unchanged(hive,'look hive',/gathered/);unchanged(hive,'look wax',/Golden beeswax/);
const hint=at(1,{...voice,mirrorAwake:true,readBook:true,thornsCut:true,bridgePlank:true,bridgeFixed:true},144,190);assert.match(run(hint,'hint command'),/Offer the voice jar/);run(hint,'offer voice jar to gallery mirror');assert(hint.game.state.flags.voiceOffered);
const pages=at(1,{bookOpen:true},94,196);pages.game.command('read book');const bookPages=drain(pages).map(t=>t.replace(/\s+/g,' ').trim());assert.equal(bookPages.length,2);assert.match(bookPages[0],/rightful name/);assert.match(bookPages[1],/^A faded note.*echoes\.$/);
const water=at(4,{},140,169);water.game.movePlayer(5,0);assert(water.game.swim.active);run(water,'get out');assert(!water.game.swim.active,'GET OUT heads for shore');
const unknown=at(2,equipped);unchanged(unknown,'search elephant',/do not see elephant/);unchanged(unknown,'lubricate elephant',/do not see elephant/);unchanged(unknown,'give rose to elephant',/do not see elephant/);
console.log('PASS '+count+' newcomer phrases/state checks: aliases, physical refusals, negative prerequisites, one-time points, audible contents, empty returned jar, save/restore and complete book pages.');

// Thorn-jumping is a recognized intention, without bypassing the shears puzzle.
for(const text of ['jump over thorns','jump over the thorns','jump thorns','leap over blackthorn','hop across brambles','jump over thorn bush']){
 const a=at(3,{},280,210),before=a.game.state;
 unchanged(a,text,/too high and deep.*cut a path/);
 assert.equal(a.game.state.room,3);assert.deepEqual(a.game.state.player,before.player,'jump refusal keeps feet in place');
 unchanged(at(3,{...equipped,thornsCut:true},280,210),text,/walk EAST through the cleared path/);
}
unchanged(at(0,{}),'jump over thorns',/do not see any thorns here/);
console.log('PASS thorn jump/leap/hop responses before cutting, after cutting and outside orchard; no puzzle bypass.');

for(const text of ['oil shears','oil blades','oil the blades','use oil on blades']){
 const a=at(0,{oilTaken:true,shearsTaken:true}),score=a.game.state.score;
 run(a,text);assert(a.game.state.flags.shearsReady,text);assert.equal(a.game.state.score,score+5);
 unchanged(a,text,/already move freely/);
 unchanged(at(0,{shearsTaken:true}),text,/do not have both/);
 unchanged(at(0,{oilTaken:true}),text,/do not have both/);
}
console.log('PASS blades alias uses the shears oiling action, inventory checks and one-time reward.');
