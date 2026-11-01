// Walk the current nine-room game through its real parser and walk masks.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
let h=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');h=h.slice(0,h.indexOf("check('Eight rooms"));const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+'\nglobalThis.qa={boot,travel,approach};',s);const {boot,travel,approach}=s.qa,a=boot();a.start();
const drain=()=>{let limit=30;while(a.game.state.popupOpen&&limit--)a.game.closeMessage();assert(limit>0)};
function cmd(text){
 drain();a.game.command(text);const pages=[];
 // Dismiss text before advancing active-play animation time.
 for(let n=0;n<35;n++){
  let limit=30;while(a.game.state.popupOpen&&limit--){pages.push(a.message);a.game.closeMessage()}assert(limit>0);
  for(const fn of [...a.intervals.values()])fn();
 }
 let limit=30;while(a.game.state.popupOpen&&limit--){pages.push(a.message);a.game.closeMessage()}assert(limit>0);
 return pages.join(' ').replace(/\s+/g,' ');
}
function act(id,text){drain();approach(a,id);return cmd(text)}
function go(id){drain();travel(a,id)}
act('man','talk man');act('rose','take flower');act('bell','lift bell');go('courtyard');go('shed');
for(const [id,text]of [['oil','take oil'],['twine','take string'],['plank','take board'],['shears','take shears']])act(id,text);
assert.match(cmd('look shears'),/handles scarcely move/);assert.doesNotMatch(cmd('look shears'),/need.*oil|drop of oil/i);
cmd('oil shears');assert(a.game.state.flags.shearsReady);go('courtyard');go('gallery');act('book','open book');for(let i=0;i<6;i++)for(const fn of [...a.intervals.values()])fn();const book=act('book','read book');assert.match(book,/Silver wakes/);assert.match(book,/highest bell/);assert.match(book,/rightful name/);act('mirror','use clapper on mirror');go('belfry');act('rope','fix rope');go('gallery');go('courtyard');go('garden');go('orchard');
assert.doesNotMatch(cmd('look thorns'),/shears/i);act('wax','take beeswax');act('thorns','cut thorns with shears');go('bridge');
assert.doesNotMatch(cmd('look bridge'),/spare plank|strong binding|you need/i);act('bridge','use plank on bridge');assert.match(cmd('look bridge'),/securely/);act('bridge','use twine on bridge');go('mill');
assert.match(cmd('look wheel'),/dry scrape/);assert.doesNotMatch(cmd('look wheel'),/oil|TURN WHEEL/);assert.match(act('wheel','turn wheel'),/scraping/);act('wheel','oil wheel');act('wheel','turn wheel');act('cabinet','open cupboard');act('jar','take jar');go('bridge');go('grotto');
act('pool','use clapper on pool');act('pool','answer echo');act('pool','say Merrin');assert.doesNotMatch(cmd('look pool'),/jar|vessel/);act('pool','use jar on pool');assert.match(cmd('look jar'),/escapes/);cmd('seal jar with wax');assert(a.game.state.flags.jarSealed);go('bridge');go('orchard');go('garden');go('courtyard');go('gallery');go('belfry');act('bell','ring bell');assert(a.game.state.flags.bellRung);go('gallery');act('mirror','use jar on mirror');act('mirror','say Merrin');assert(a.game.state.flags.voiceReturned);go('courtyard');go('garden');act('man','talk man');assert.equal(a.game.state.score,100);assert(a.game.state.flags.complete);assert.equal(a.game.state.playing,false);
// Explicit help still answers a deliberate request, rather than appearing in LOOK.
const hints=boot();hints.start();hints.game.command('help');assert(hints.game.state.popupOpen);assert.match(hints.message.replace(/\s+/g,' '),/stem|bell/);
console.log('PASS current nine-room physical walkthrough reaches 100/100; observational clues, spellbook paging and opt-in HELP verified.');
