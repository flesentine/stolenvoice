const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const Window=require('../game/inventory-window.js'),Message=require('../game/agi-message-window.js'),font=fs.readFileSync(path.join(root,'assets/fonts/sierra-agi-8x8.bin')),pictures=vm.runInNewContext(read('game/inventory-pictures.js')+';inventoryPictures');
for(const name of Object.keys(pictures)){
 const card=Window.renderDescription(name,'A curious object worth a closer look.',font,pictures,Message);
 assert.equal(card.width,280);assert(card.top>=0&&card.top+card.height<=200);
 const bytes=Buffer.from(pictures[name],'base64'),expected=[];
 for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)expected.push(bytes[i+1]);
 const top=34+Message.wrap('A curious object worth a closer look.',30).length*8;
 for(let i=0;i<expected.length;i++)for(let x=0;x<2;x++)assert.equal(card.pixels[(top+Math.floor(i/32))*280+108+(i%32)*2+x],expected[i],name+' cel beneath description');
}
assert.equal(Window.renderDescription('rose','long words '.repeat(100),font,pictures,Message),null);
let h=read('tools/check-expanded-adventure.cjs').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={get inventoryUI(){return inventoryOpen},setInventoryState(values){Object.assign(flags,values);syncInventory()},setRoom(value){room=value},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
const a=s.qa.boot();a.start();a.game.setInventoryState({rose:true,workshopKey:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,waxTaken:true,jarTaken:true});
const cases=[['look at rose','rose'],['examine key','workshop key'],['inspect silver bell','silver bell'],['look at oil','oil flask'],['x twine','twine'],['look at plank','wooden plank'],['look at shears','rusty shears'],['look at wax','beeswax'],['look at jar','glass jar']];
const before=JSON.stringify(a.game.state);
for(const [command,name] of cases){
 a.run(command);assert.equal(a.get('#agi-message-picture').width,280,command);assert(a.message.startsWith(Window.displayName(name)+'\n\n'),command);const description=a.message.slice(name.length+2);assert.equal(a.get('#agi-message-picture').height,72+Message.wrap(description,30).length*8,'no printed return footer');assert(!a.game.inventoryUI);assert.equal(a.game.state.inv.length,9);a.key('Enter');assert(!a.game.state.popupOpen);
}
assert.equal(JSON.stringify(a.game.state),before,'inspection does not change quest, inventory, position or score');
a.run('look at bell');
for(const listener of a.get('#agi-message').listeners.click||[])listener({preventDefault(){},stopPropagation(){}});
assert(!a.game.state.popupOpen,'click dismisses parser card directly');
for(const [values,command,name] of [[{shearsReady:true},'examine blades','pruning shears'],[{echoCaught:true},'look at jar','echo jar'],[{jarSealed:true},'look at jar','sealed echo'],[{bellRung:true},'look at jar','voice jar'],[{voiceReturned:true},'look at jar','glass jar']]){
 a.game.setInventoryState(values);a.run(command);assert.equal(a.get('#agi-message-picture').width,280);assert(a.message.startsWith(Window.displayName(name)+'\n\n'),command+' '+name);a.key('Escape');assert(!a.game.state.popupOpen);
}
a.game.setRoom(7);a.run('look at bell');assert(!a.message.startsWith('Silver bell\n'));a.key('Enter');
a.game.setRoom(3);a.run('look at hive');assert(!a.message.startsWith('Beeswax\n'));a.key('Enter');
a.run('look');assert(!a.game.inventoryUI);assert.notEqual(a.get('#agi-message-picture').width,280);a.key('Enter');
a.game.setInventoryState({rose:false});a.run('look at rose');assert(!a.message.startsWith('Rose\n\n'));a.key('Enter');
a.key('Tab');assert(a.game.inventoryUI);a.key('Escape');assert(!a.game.inventoryUI);
const preview=Window.renderDescription('silver bell','A little silver handbell with a worn wooden handle. Its clapper is fastened inside. A gentle shake gives a clear, lingering note.',font,pictures,Message,{showHelp:false});
fs.writeFileSync(path.join(root,'assets/reviews/parser-inventory-card.json'),JSON.stringify({...preview,pixels:Array.from(preview.pixels)}));
console.log('PASS all 13 cels beneath text; parser aliases and evolving objects; scenery, dismissal, unchanged state and inventory selection.');
