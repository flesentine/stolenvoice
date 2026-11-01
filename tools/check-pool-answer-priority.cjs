const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,',`globalThis.game={checkPoolPriority(frame){
 const old=[room,storyAction,hero,drawPoolAnswerRipple,drawPoolAnswerSparks];const order=[];
 try{room=6;storyAction={kind:'poolRiddleSolved',frame,total:28};
 hero=()=>order.push('hero');drawPoolAnswerRipple=()=>order.push('ripple');drawPoolAnswerSparks=()=>order.push('sparks');draw();return order;
 }finally{[room,storyAction,hero,drawPoolAnswerRipple,drawPoolAnswerSparks]=old}
},command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot',s);const a=s.bootQA();a.start();
for(let frame=0;frame<28;frame++){
 const order=Array.from(a.game.checkPoolPriority(frame));
 assert.deepEqual(order,['ripple','sparks','hero'],'pool animation stays below actor on frame '+frame);
}
console.log('PASS built game draw order: all 28 ECHO answer frames paint ripples and sparks before Rosella, with no second foreground pass.');
