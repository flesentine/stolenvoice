const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s={window:{addEventListener(){}},document:{addEventListener(){}}};vm.createContext(s);
vm.runInContext(fs.readFileSync('game/hive-minigame.js','utf8')+';globalThis.qa={hit:hiveContact,bees:hiveBees,seed:n=>hiveFlight=makeHiveFlight(n)}',s);
const q=s.qa;let total=0;
for(const seed of [1,2,3,5,19,113,999,1234567]){
 q.seed(seed);const first=JSON.stringify(q.bees(0));assert.equal(first,JSON.stringify(q.bees(0)),'drawing does not advance randomness');
 assert.notEqual(first,JSON.stringify(q.bees(90)),'no former shared 90-beat repeat');
 q.seed(seed+1);assert.notEqual(first,JSON.stringify(q.bees(0)),'new visit seed changes flight');q.seed(seed);
 let safe=0,wait=0,maxWait=0,longest=0,run=0;
 for(let t=0;t<900;t++){
  const bees=q.bees(t),next=q.bees(t+1);
  bees.forEach(([x,y],i)=>{assert(x>=3&&x<=156&&y>=3&&y<=118);assert(Math.abs(x-next[i][0])<=10&&Math.abs(y-next[i][1])<=10,'continuous flight without teleports');});
  const ok=!Array.from({length:12},(_,i)=>q.hit(t+i+1,i+1)).some(Boolean);
  safe+=ok;wait=ok?0:wait+1;maxWait=Math.max(wait,maxWait);run=ok?run+1:0;longest=Math.max(longest,run);
 }
 assert(safe>=900*.12&&safe<=900*.35,'challenging but playable seed '+seed);
 assert(maxWait<=150,'no extended lockout in sampled flight');assert(longest>=5,'readable openings');total+=safe;
 console.log('seed '+seed+': '+(safe/9).toFixed(1)+'% safe starts; longest wait '+(maxWait*.08).toFixed(1)+'s');
}
console.log('PASS 7200 sampled starts: '+(total/72).toFixed(1)+'% safe; repeatable collision queries, varied seeds, bounds, continuity and playable openings.');
