// Replay the saved player-intention audit against the current standalone build.
// This preserves the original evidence and writes a separate after-change log.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get busy(){return !!bookAnimationTimer||!!cabinetTimer||!!bellAction||!!storyAction},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,travel,approach};',s);const {boot,travel,approach}=s.qa,a=boot(),baseline=JSON.parse(read('assets/reviews/novice-playthrough-2026-10-24.json')),result=[];
function drain(){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<60){messages.push(a.message.replace(/\s+/g,' ').trim());a.game.closeMessage()}assert(n<60);return messages}
for(const row of baseline){
 let messages=[];
 if(row.op==='start'){a.get('#start').onclick();if(a.get('#intro').isConnected)a.get('#start').onclick();messages=drain()}
 else if(row.op==='cmd'){
 // The puzzle design changed: retain trials, add the new intentional steps.
 if(row.t.toLowerCase().includes('take jar')&&a.game.state.room===5&&a.game.state.flags.wheelTurned&&!a.game.state.flags.cabinetOpen){a.game.command('open cupboard');for(let n=0;n<30;n++){drain();for(const fn of [...a.intervals.values()])fn()}drain()}
 if(row.t.toLowerCase()==='say merrin'&&a.game.state.room===6&&a.game.state.flags.poolAwake&&!a.game.state.flags.poolRiddleSolved){a.game.command('answer echo');for(let n=0;n<30;n++){drain();for(const fn of [...a.intervals.values()])fn()}drain()}
 if(/rose.*bell|clapper.*rose/.test(row.t.toLowerCase())&&a.game.state.room===0&&!a.game.state.flags.bell){a.game.command('lift bell');for(let n=0;n<30;n++){drain();for(const fn of [...a.intervals.values()])fn()}drain()}
 drain();a.get('#message').textContent='';a.game.command(row.t);messages=drain();for(let n=0;a.game.busy&&n<70;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain())}
 else if(row.op==='go'){drain();travel(a,row.id)}
 else if(row.op==='near'){drain();approach(a,row.id)}
 else throw Error('Unsupported audit operation: '+row.op);
 const state=a.game.state;
 result.push({n:row.n,op:row.op,...(row.t?{command:row.t}:{}),...(row.id?{target:row.id}:{}),beforeMessages:row.messages,messages,room:state.room,score:state.score,inventory:state.inv});
}
const generic=result.filter(r=>r.messages.some(m=>m.includes('I did not understand')));
assert.equal(a.game.state.score,100);assert(a.game.state.flags.complete);assert.equal(generic.length,0,'all original trial phrases should now be recognized');assert(a.game.state.inv.includes('glass jar'));assert(!a.game.state.inv.includes('voice jar'));
const before=baseline.filter(r=>r.messages.some(m=>m.includes('I did not understand'))).length;
fs.writeFileSync(path.join(root,'assets/reviews/novice-adapted-playwright-2026-10-25.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS adapted '+baseline.length+'-action newcomer route (new bell/cupboard/riddle steps inserted): '+before+' -> '+generic.length+' generic parser rejections, 100/100 ending, empty jar retained.');
