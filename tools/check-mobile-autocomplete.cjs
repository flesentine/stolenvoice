const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('game/mobile-autocomplete.js','utf8')+';globalThis.complete=mobileActionCompletion;globalThis.words=mobileActionWords;',context);
for(const [prefix,word]of [['ta','take'],['tal','talk'],['lo','look'],['op','open'],['cl','close'],['cli','climb'],['ju','jump'],['cur','curtsy'],['ki','kiss'],['kic','kick'],['fa','fart'],['inve','inventory'],['rest','restore'],['swim','swim']]){
 if(prefix===word)assert.equal(context.complete(prefix),null);else assert.equal(context.complete(prefix).word,word);
}
for(const word of context.words)assert.equal(context.complete(word),null,'complete words and aliases remain unchanged');
for(const text of ['','take ','take ro','look at mi','hello','xyzzy','123'])assert.equal(context.complete(text),null,'only action prefixes are completed');
assert.equal(context.complete('ta',1),null,'do not replace middle of word');assert.equal(context.complete('ta',2,1),null,'do not replace selection');
assert.equal(context.complete('  TA').start,2);assert.equal(context.complete('  TA').word,'take');
console.log('PASS mobile action prefixes, ambiguity, exact verbs/aliases, unknown words, object text, case, caret and selection handling.');
