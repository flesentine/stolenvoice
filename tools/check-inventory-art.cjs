const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),Agi=require('../editor/agi-picture.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pictures=vm.runInNewContext(read('game/inventory-pictures.js')+';inventoryPictures'),font=fs.readFileSync(path.join(root,'assets/fonts/sierra-agi-8x8.bin'));
const manifest=JSON.parse(read('assets/inventory/manifest.json')),Window=require('../game/inventory-window.js'),Message=require('../game/agi-message-window.js');
assert.equal(Object.keys(pictures).length,13);
for(const file of manifest.projects){const project=Agi.project(JSON.parse(read('assets/inventory/'+file)));const pixels=Agi.render(project.commands);assert(pixels.some(p=>p!==15));assert(pixels.every(p=>p<16));const bytes=Buffer.from(pictures[project.name],'base64');let count=0;for(let i=0;i<bytes.length;i+=2)count+=bytes[i];assert.equal(count,32*28)}
assert.notEqual(pictures['rusty shears'],pictures['pruning shears']);assert.equal(new Set(['glass jar','echo jar','sealed echo','voice jar'].map(n=>pictures[n])).size,4);
const maxItems=['rose','silver bell','oil flask','twine','wooden plank','rusty shears','beeswax','glass jar'];const grid=Window.renderList(maxItems,font,0);assert.equal(grid.width,288);assert.equal(grid.height,152);assert(grid.pixels.every(p=>p<16));
let harness=read('tools/check-expanded-adventure.cjs');harness=harness.slice(0,harness.indexOf("check('Eight rooms"));const sandbox={require,console,Buffer,__dirname};vm.createContext(sandbox);vm.runInContext(harness+'\nglobalThis.inventoryHarness={boot};',sandbox);
const boot=sandbox.inventoryHarness.boot,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
while(base.game.state.popupOpen)base.game.closeMessage();base.key('Tab');assert.equal(base.game.state.popupOpen,true);assert.match(base.message,/nothing/);base.key('Enter');assert.equal(base.game.state.popupOpen,false);
for(const state of ['glass jar','echo jar','sealed echo','voice jar']){
 const named=state!=='glass jar',sealed=['sealed echo','voice jar'].includes(state),voice=state==='voice jar';
 const flags={...save.flags,rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,waxTaken:true,wheelOiled:true,wheelUnlocked:true,wheelTurned:true,jarTaken:true,poolAwake:named,poolRiddleSolved:named,echoNamed:named,echoCaught:named,jarSealed:sealed,ropeFixed:voice,bellRung:voice};
 const a=boot(new Map([[key,JSON.stringify({...save,flags,sluice:[2,5,0,0,1,1,1,7,1,1,4,5,1,3,6,3]})]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();const before=a.game.state;a.key('Tab');assert(a.game.state.popupOpen);assert(a.message.includes(state));assert.equal(a.get('#agi-message-picture').width,288);assert.equal(a.get('#agi-message-picture').height,Math.max(104,a.game.state.inv.length*12+56));assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);a.key('End');a.key('Enter');assert.equal(a.get('#agi-message-picture').width,180);assert(a.message.includes(state));a.key('Enter');a.key('Escape');assert.equal(a.game.state.popupOpen,false);
}
console.log('PASS 13 editable native objects, four jar states, shears variants, full inventory layout, Tab/Enter, empty inventory and story preservation.');
