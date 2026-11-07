const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,',`globalThis.game={memory:savedMerrinMemory,setScene(r,next={},point){room=r;flags={...flagDefaults,...next};player={x:point[0],y:point[1],step:0,facing:'front'};syncInventory()},command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot}',s);const {boot}=s.qa;
function drain(a){let text='',n=0;while(a.game.state.popupOpen&&n++<30){text+=' '+a.message;a.game.closeMessage()}assert(n<30);return text.replace(/\s+/g,' ')}
let count=0;
function check(room,command,pattern,flags={},point=[160,210]){
 const a=boot();a.start();drain(a);a.game.setScene(room,flags,point);const before=a.game.state,memory=JSON.stringify(a.game.memory());
 a.game.command(command);const text=drain(a);assert.match(text,pattern,command);assert.doesNotMatch(text,/undefined|did not understand|no useful way/,command);
 for(const key of ['flags','inv','score','scored','player'])assert.deepEqual(a.game.state[key],before[key],command+' preserves '+key);
 assert.equal(JSON.stringify(a.game.memory()),memory,'observation does not invent an antic');count++;return text;
}
for(let room=0;room<9;room++){check(room,'smell',/rose|wax|earth|apples|water|grain|stone|oak|flowers/i);check(room,'sniff',/rose|wax|earth|apples|water|grain|stone|oak|flowers/i)}
for(const command of ['smell apples','sniff the fruit'])check(3,command,/not quite ripe/);
check(3,'smell honey',/keeping the honey/);check(2,'sniff potting soil',/excellent vintage/);check(2,'smell herbs',/peppery/);check(8,'smell plants',/window box/);
check(0,'smell flowerbed',/royal paperwork/);check(0,'smell flowers',/sweet perfume/,{},[273,201]);check(8,'sniff the flower box',/light perfume/);check(5,'smell grain',/grain smells dry/);check(4,'sniff river',/wet stone/);check(5,'smell mill race',/wet oak/);
check(3,'listen to bees',/restless buzz/);check(3,'listen at hive',/restless buzz/);
check(3,'listen to bees',/satisfied/,{waxTaken:true});check(3,'look bees',/landing shelf/,{waxTaken:true});check(3,'listen to apple trees',/twig ticks/);check(0,'listen to tree',/Leaves rustle/);
check(4,'listen bridge',/broken crossing/);check(4,'listen to bridge',/dry creak/,{bridgePlank:true});check(4,'listen to bridge',/hanging plank/,{bridgePlank:true,bridgePlankSlipped:true});check(4,'listen to bridge',/rope creaks/,{bridgePlank:true,bridgeFixed:true});
check(4,'listen mill',/motionless paddles/);check(4,'listen to watermill',/Paddles slap/,{wheelTurned:true});check(5,'listen mill',/stubbornly quiet/);check(5,'listen mill',/wooden conversation/,{wheelTurned:true});
check(4,'listen at cave entrance',/distant drip/);check(6,'listen cave',/No echo follows/);check(6,'listen cave',/No tongue/,{poolAwake:true});check(6,'listen cave',/name returns/,{echoNamed:true});check(6,'listen cave',/pool is quiet/,{echoCaught:true});
check(1,'listen to stairs',/draught/);check(7,'listen stairs',/gallery is quiet/);check(8,'listen banners',/officious/);
for(const command of ['knock on mill door','knock mill','rap on the mill doorpost','tap the mills door'])check(4,command,/hollow little echo/,{},[85,175]);
check(4,'knock on mill door',/machinery answers/,{wheelTurned:true},[85,175]);check(5,'knock doorframe',/Dust shifts/);check(8,'knock workshop door',/nobody comes/,{},[64,170]);check(8,'knock on door',/empty workshop/,{workshopOpen:true},[64,170]);
check(2,'knock on barrel',/dull.*thud/,{},[270,205]);check(2,'knock on barrel',/closer/,{},[50,207]);check(1,'tap wall',/castles seldom lose/);check(6,'knock on rock wall',/cold rock|do not see|no.*here/i);
check(3,'feel tree',/bark is ridged/);check(0,'touch grass',/springs back/);check(4,'feel stream',/safety of the bank/);
for(const command of ['look broken boards','examine splinters','inspect bridge timbers'])check(4,command,/splinters|splintered/);
check(4,'look broken ends',/merely resting/,{bridgePlank:true});check(4,'look broken boards',/hangs crookedly/,{bridgePlank:true,bridgePlankSlipped:true});check(4,'examine splinters',/Fresh twine/,{bridgePlank:true,bridgeFixed:true});
check(0,'smell apples',/No apples.*here/);check(8,'knock workshop door',/closer/,{},[285,220]);check(4,'knock mill door',/closer/,{},[25,220]);
check(0,'smell rose',/sweet perfume/,{},[273,201]);check(1,'touch mirror',/glass is cold/,{},[144,190]);
for(const command of ['look at mountains','examine snowy peaks','look at mountain range'])check(3,command,/Snow crowns.*old ranger.*admire them from the orchard/);
console.log('PASS '+count+' scenery reactions/aliases and puzzle states, locality/reach, existing rose/mirror responses, preserved memory/inventory/quest state and no automatic hazard.');
