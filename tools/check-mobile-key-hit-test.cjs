const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s={};vm.createContext(s);vm.runInContext(fs.readFileSync('game/mobile-key-hit-test.js','utf8')+';globalThis.api={mobileKeyboardVocabulary,mobileNextLetters,mobileLetterAtPoint};',s);
const {mobileKeyboardVocabulary:vocabulary,mobileNextLetters:next,mobileLetterAtPoint:pick}=s.api;
const words=vocabulary(['move','make'],{man:['man','merrin'],mirror:['mirror']},{sky:['moon']});
const likely=next('look m',words);assert(likely.a>0&&likely.o>0,'man and moon both expand their next letter');assert(likely.i>0&&likely.e>0);
assert.deepEqual(Object.keys(next('look qzx',words)),[]);assert.deepEqual(Object.keys(next('look ',words)),[]);assert.deepEqual(Object.keys(next('m',words,0)),[]);assert.deepEqual(Object.keys(next('m',words,1,0)),[]);assert(next('LOOK M',words).o>0);
const keys=[{id:'a',letter:'a',left:0,right:40,top:0,bottom:44},{id:'s',letter:'s',left:44,right:84,top:0,bottom:44},{id:'space',letter:'',left:0,right:84,top:48,bottom:92}];
assert.equal(pick(41,22,keys,{}),null,'ordinary gap stays unassigned without a prediction');assert.equal(pick(41,22,keys,{a:1}),'a','probable letter gains the nearby gap');assert.equal(pick(45,22,keys,{a:1}),'a','probable letter gains a thin neighboring edge');assert.equal(pick(49,22,keys,{a:1}),'a','likely letter borrows more of unlikely neighboring edge');assert.equal(pick(56,22,keys,{a:1}),'s','protected center stays literal');
for(const key of keys)assert.equal(pick((key.left+key.right)/2,(key.top+key.bottom)/2,keys,{a:1,s:1}),key.id,'key centers are always literal');assert.equal(pick(40,48,keys,{a:1}),'space','control edges are literal too');assert.equal(pick(-15,22,keys,{a:1}),null,'cannot reach beyond cap');assert.equal(pick(64,22,keys,{a:1}),'s','unlikely deliberate key stays usable');
assert.equal(JSON.stringify(keys),JSON.stringify([{id:'a',letter:'a',left:0,right:40,top:0,bottom:44},{id:'s',letter:'s',left:44,right:84,top:0,bottom:44},{id:'space',letter:'',left:0,right:84,top:48,bottom:92}]),'hit testing never moves keycaps');
console.log('PASS prefix prediction, multiple next letters, unknown words/selection fallback, capped edge/gap expansion, protected key centers/controls and unchanged geometry.');

const commands=['take','talk','turn','tie','touch'];const hints=next('t',['tree','thorn','tsar',...commands],1,1,commands);assert(hints.a>0&&hints.u>0&&hints.i>0&&hints.o>0&&!hints.s&&!hints.r,'first word uses action continuations rather than scenery');
const nouns=vocabulary(commands,{bell:['bell','silver bell'],bees:['bees','beehive']},{});assert(next('look be',nouns).l>0);assert(next('look bel',nouns).l>0,'both L letters in bell remain likely');
console.log('PASS command-aware first letters and repeated noun continuation for bell.');
