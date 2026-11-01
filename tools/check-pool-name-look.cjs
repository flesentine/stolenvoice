const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={setPool(f){room=6;Object.assign(flags,f)},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);const {boot}=s.qa;
const base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function drain(a){for(let i=0;i<60&&a.game.state.popupOpen;i++)a.game.closeMessage()}
let cases=0;
for(const [flags,expected]of [[{},/No letters/],[{poolAwake:true},/question/],[{poolAwake:true,poolRiddleSolved:true},/No name/],[{poolAwake:true,poolRiddleSolved:true,echoNamed:true},/letters MERRIN/],[{echoNamed:true,echoCaught:true},/open jar/],[{echoNamed:true,echoCaught:true,jarSealed:true},/sealed inside/],[{echoNamed:true,echoCaught:true,voiceReturned:true},/nothing more/]]){
 const a=boot();a.start();drain(a);a.game.setPool(flags);
 for(const command of ['look name','look merrin','look at the name','examine floating letters','inspect silver letters','look echo']){a.game.command(command);assert.match(a.message.replace(/\s+/g,' '),expected,command);drain(a);cases++}
}
console.log('PASS '+cases+' pool name descriptions across silent, question, named, collected, sealed and returned states.');
