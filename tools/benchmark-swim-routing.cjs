// Diagnostic benchmark, not a timing assertion: run on the same host/build.
const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),path=require('path');
process.chdir(path.resolve(__dirname,'..'));
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={swimmingShoreRoute,bridgeWoodAt,setRepair(fixed,slipped){flags.bridgePlank=true;flags.bridgeFixed=fixed;flags.bridgePlankSlipped=slipped},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot',s);
const a=s.bootQA();a.start();const outputs=[],times=[];
for(const [fixed,slipped]of [[false,false],[false,true],[true,false]]){
 a.game.setRepair(fixed,slipped);const start=performance.now();
 for(const [x,y,side,under]of [[160,194,'west',false],[160,194,'east',false],[160,150,'west',true]])outputs.push(a.game.swimmingShoreRoute(x,y,side,under));
 times.push(Math.round(performance.now()-start));
}
console.log(JSON.stringify({milliseconds:times,routeHash:crypto.createHash('sha256').update(JSON.stringify(outputs)).digest('hex'),lengths:outputs.map(r=>r.length)}));
