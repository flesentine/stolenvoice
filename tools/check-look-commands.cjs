// Focused checks through the built adventure's actual parser and message path.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
// Reuse only the DOM stand-in, without the older walkthrough's stale room routes.
const legacy=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');
const harness=legacy.slice(0,legacy.indexOf("check('Eight rooms"));
const sandbox={require,console,Buffer,__dirname};vm.createContext(sandbox);
vm.runInContext(harness+'\nglobalThis.lookHarness={boot};',sandbox);
let a=sandbox.lookHarness.boot();a.start();
// A saved room selection exercises normal restore instead of exposing a test teleport.
function room(id){a.game.closeMessage();a.game.saveGame();const save=JSON.parse(a.storage.get(a.game.key));save.room=id;delete save.player;const storage=new Map([[a.game.key,JSON.stringify(save)]]);a=sandbox.lookHarness.boot(storage);a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert.equal(a.game.state.room,id);}
function look(text,expected){while(a.game.state.popupOpen)a.game.closeMessage();const before=a.game.state;a.game.command(text);assert.match(a.message.replace(/\s+/g,' '),expected,text);assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.flags,before.flags);assert.deepEqual(a.game.state.inv,before.inv);}
let count=0;
for(const [id,commands]of [
 [0,[['look at castle',/red roofs/],['look at water',/moat/],['look out window',/no window/],['look chair',/do not see chair/]]],
 [1,[['look through the window',/small high window/],['look up',/Oak ribs/],['inspect banners',/heraldic bird/],['look at rug',/purple runner/i],['look at chair',/upholstered/],['look at gem',/blue jewel/]]],
 [2,[['look out of the window',/green trees/],['look at pots',/terracotta/],['look at tools',/trowel/],['look at barrel',/iron-banded/i],['look at shelf',/shelves/],['look down',/flagstone/i]]],
 [3,[['look at apples',/red apples/],['look trees',/apple trees/],['look path',/blackthorn/]]],
 [4,[['look at river',/stream/],['look at cave',/far bank/],['look at mill',/NORTHWEST/]]],
 [5,[['look at water',/wheel pit/],['look inside cabinet',/catch/],['look at door',/upper LEFT/]]],
 [6,[['look at reflection',/reflects you/],['look at stalagmites',/formations/],['look up',/vault/]]],
 [7,[['look out the window',/green fields/i],['look through windows',/red village roofs/],['look at rafters',/crossed oak/],['look at railing',/handrail/],['look at inscription',/founder/],['look at plaque',/guild/]]],
 [8,[['look at flowers',/planter/],['look at ivy',/ivy/i],['look at shield',/gold tree/],['look at door',/LEFT.*RIGHT/],['look through window',/from this side/]]]
]){room(id);for(const [text,expected]of commands){look(text,expected);count++}look('look',/./);look('look at the elephant',/do not see elephant/);count+=2}
room(7);look('look out',/green fields/i);count++;
console.log('PASS '+count+' look commands through the built game; descriptions preserve inventory, flags and score.');
