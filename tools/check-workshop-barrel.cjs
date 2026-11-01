const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={place(x,y){room=2;player={x,y,step:1,facing:"front"}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
const a=s.qa.boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();
assert.equal(a.game.canStand(276,185,2),false,'rounded native row 130 is inside the barrel');
assert.equal(a.game.canStand(276,187,2),true,'floor immediately in front stays open');
assert.equal(a.game.canStand(252,187,2),true,'left route stays open');assert.equal(a.game.canStand(300,187,2),true,'right route stays open');
for(const [point,step,axis,limit]of [[[276,205],[0,-3],'y',187],[[250,182],[3,0],'x',260],[[302,182],[-3,0],'x',295]]){
 a.game.place(...point);for(let n=0;n<15;n++)a.game.movePlayer(...step);
 const pos=a.game.state.player;assert(a.game.canStand(pos.x,pos.y,2),'stops on valid floor');
 assert(step[axis==='x'?0:1]<0?pos[axis]>=limit:pos[axis]<limit,'cannot walk through barrel from '+point);
}
a.game.place(252,195);for(let n=0;n<16;n++)a.game.movePlayer(3,0);assert.equal(a.game.state.player.x,300,'can cross clear floor in front');
console.log('PASS workshop barrel front and side collisions in built movement; clear path around the barrel.');
