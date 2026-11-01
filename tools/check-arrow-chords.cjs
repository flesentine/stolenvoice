const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];h=h.replace('globalThis.game={command,','globalThis.game={place(){room=2;player={x:160,y:210,step:0,facing:"front"}},get walking(){return walkDirection},walkTick,command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
for(const [vertical,horizontal,expected]of [['ArrowUp','ArrowLeft','nw'],['ArrowUp','ArrowRight','ne'],['ArrowDown','ArrowLeft','sw'],['ArrowDown','ArrowRight','se']]){
 const a=s.qa.boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place();
 const up=key=>{for(const handler of a.handlers.get('keyup')||[])handler.fn({key})};
 a.key(vertical);a.key(horizontal);assert.equal(a.game.walking,expected);const before=a.game.state.player;a.game.walkTick();const after=a.game.state.player;assert.notEqual(after.x,before.x);assert.notEqual(after.y,before.y);
 up(horizontal);assert.equal(a.game.walking,vertical==='ArrowUp'?'up':'down');up(vertical);assert.equal(a.game.walking,null,'releasing chord stops');
 a.key('ArrowRight');up('ArrowRight');assert.equal(a.game.walking,'right','single tap still latches');a.key('ArrowRight');assert.equal(a.game.walking,null,'second tap still stops');
 a.key('ArrowUp');a.key('ArrowLeft');a.game.stopWalking();up('ArrowLeft');assert.equal(a.game.walking,null,'modal/blur stop cannot resume stale held keys');
}
console.log('PASS all four held-arrow diagonals, actual two-axis motion, key release, tap-to-walk compatibility and stale-key cleanup.');
