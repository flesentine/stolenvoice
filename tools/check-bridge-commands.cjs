const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');let h=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');h=h.slice(0,h.indexOf("check('Eight rooms"));const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+'\nglobalThis.bridgeQA={boot};',s);const boot=s.bridgeQA.boot,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(room=4,x=130,y=169,hasPlank=true){const data={...save,room,player:{x,y,step:1,facing:'right'},flags:{...save.flags,plankTaken:hasPlank}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a}
const commands=['put wood in bridge','put the wood into the bridge','place board on bridge','lay plank across gap','lay the wooden plank over the hole','fit piece of wood into gap in bridge','insert wooden board in bridge gap','slide oak plank across broken bridge','set spare board onto bridge','put plank down on bridge','add lumber to bridge','fix bridge with board','repair the bridge using timber','mend footbridge with plank','patch bridge with oak board','cover gap with wood','fill hole with plank','bridge gap with plank','use wood to fix bridge','use plank to cover gap','lay wood','place board','fit plank','put down wood','fix board','fix the plank','repair wood','mend bridge','fix up the bridge'];
for(const command of commands){const a=at(),before=a.game.state.score;a.game.command(command);assert(a.game.state.flags.bridgePlank,command);assert.equal(a.game.state.flags.bridgeFixed,false,'still requires lashing');assert.equal(a.game.state.score,before+5);while(a.game.state.popupOpen)a.game.closeMessage();a.game.command(command);assert.equal(a.game.state.score,before+5,'no duplicate points');assert(!a.game.state.inv.includes('wooden plank'))}
const missing=at(4,130,169,false);missing.game.command('put wood in bridge');assert(!missing.game.state.flags.bridgePlank);assert.match(missing.message.replace(/\s+/g,' '),/no plank/);
const far=at(4,28,202);far.game.command('lay plank across bridge');assert(!far.game.state.flags.bridgePlank);assert.match(far.message.replace(/\s+/g,' '),/too far/);
const elsewhere=at(0,155,190);elsewhere.game.command('put wood in bridge');assert(!elsewhere.game.state.flags.bridgePlank);assert.match(elsewhere.message.replace(/\s+/g,' '),/no bridge/);
const wrong=at();wrong.game.command('repair bridge with jar');assert(!wrong.game.state.flags.bridgePlank);
console.log('PASS '+commands.length+' plank-placement phrases, inventory/reach/room checks, single scoring and separate lashing step.');

const bindings=['tie plank','tie wood','tie board to bridge','tie down the plank','tie the board down','lash plank','bind wood to bridge','fasten wood with string','secure bridge with cord','attach twine to plank','wrap twine around board','wind string around plank','loop cord around bridge','use twine to secure plank','use string to tie down wood','use twine on bridge','tie both ends of plank','secure board in place','reinforce bridge using twine','anchor plank with twine','tie plank with rope','use twine'];
for(const phrase of bindings){
 // Restore an equipped fixture with placed plank and twine.
 const data={...save,room:4,player:{x:130,y:169,step:0,facing:'right'},flags:{...save.flags,plankTaken:true,bridgePlank:true,twineTaken:true}};
 const r=boot(new Map([[key,JSON.stringify(data)]]));r.start();r.game.restoreGame();while(r.game.state.popupOpen)r.game.closeMessage();const score=r.game.state.score;r.game.command(phrase);assert(r.game.state.flags.bridgeFixed,phrase);assert.equal(r.game.state.score,score+5);while(r.game.state.popupOpen)r.game.closeMessage();r.game.command(phrase);assert.equal(r.game.state.score,score+5,'no duplicate lashing points');}
const noTwine=at();noTwine.game.command('tie plank with twine');assert(!noTwine.game.state.flags.bridgeFixed);assert.match(noTwine.message,/no twine/);
console.log('PASS '+bindings.length+' natural lashing phrases, tool requirement and single award.');

// Generic repair never silently performs the separate twine step.
for(const slipped of [false,true])for(const phrase of ['fix board','repair plank','mend bridge']){
 const data={...save,room:4,player:{x:140,y:169,step:1,facing:'right'},flags:{...save.flags,plankTaken:true,bridgePlank:true,bridgePlankSlipped:slipped,twineTaken:true}};
 const r=boot(new Map([[key,JSON.stringify(data)]]));r.start();r.game.restoreGame();while(r.game.state.popupOpen)r.game.closeMessage();
 const score=r.game.state.score;r.game.command(phrase);assert(!r.game.state.flags.bridgeFixed,phrase+' must not add twine');assert(!r.game.state.flags.bridgePlankSlipped,'reseats the plank');assert.equal(r.game.state.score,score,'no lashing award');
 while(r.game.state.popupOpen)r.game.closeMessage();r.key('ArrowRight');
 assert([...r.intervals.values()].some(fn=>fn.name==='tickBridgeFall'),'unlashed repaired board still causes a fall');
}
for(const phrase of ['put twine bridge','put string plank','put the cord the board','fix board with twine','repair bridge using string','use cord to mend plank']){
 const data={...save,room:4,player:{x:130,y:169,step:0,facing:'right'},flags:{...save.flags,plankTaken:true,bridgePlank:true,twineTaken:true}};
 const r=boot(new Map([[key,JSON.stringify(data)]]));r.start();r.game.restoreGame();while(r.game.state.popupOpen)r.game.closeMessage();r.game.command(phrase);assert(r.game.state.flags.bridgeFixed,phrase);
}
console.log('PASS generic repairs only reseat, still fall without lashing, and explicit twine repairs secure the board.');
