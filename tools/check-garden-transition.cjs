const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const legacy=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');
const sandbox={require,console,Buffer,__dirname};vm.createContext(sandbox);
vm.runInContext(legacy.slice(0,legacy.indexOf("check('Eight rooms"))+'\nglobalThis.transitionHarness={boot};',sandbox);
const boot=sandbox.transitionHarness.boot;
const base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(room,x,y){const data={...save,room,player:{x,y,step:1,facing:'back'}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a}
// Approach on the yellow path: transition before reaching the distant bridge.
for(const x of [140,153,168]){const a=at(0,x,185);assert.equal(a.game.canStand(x,185),true);a.game.movePlayer(0,-3);a.game.movePlayer(0,-3);assert.equal(a.game.state.room,0);a.game.movePlayer(0,-3);assert.equal(a.game.state.room,8);assert.equal(a.game.state.player.facing,'back')}
// Walking beside the path should not trigger the castle entrance.
const side=at(0,190,179);side.game.movePlayer(0,-3);assert.equal(side.game.state.room,0);
// Returning places her below the new trigger, facing the foreground.
const back=at(8,160,225);back.game.movePlayer(0,3);assert.equal(back.game.state.room,0);assert.equal(back.game.state.player.x,153);assert.equal(back.game.state.player.y,185);assert.equal(back.game.state.player.facing,'front');assert(back.game.canStand(153,185));back.game.movePlayer(0,3);assert.equal(back.game.state.room,0);assert.equal(back.game.state.player.y,188);
assert.equal(back.game.state.score,0);assert.equal(back.game.state.flags.complete,false);
console.log('PASS early path transition at three approach positions, no side trigger, safe return and unchanged quest state.');
