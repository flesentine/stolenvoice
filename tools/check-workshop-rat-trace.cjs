const assert=require('assert/strict'),trace=require('./trace-workshop-rats.cjs')();
assert.equal(Object.keys(trace).length,8);
for(const [name,rows]of Object.entries(trace)){
 assert.equal(rows.length,11,name+' very small native height');assert(rows.every(r=>r.length===13&&/^[.078c]+$/.test(r)),name+' indexed EGA-only trace');
 // Floor is dark gray. Even ignoring that shadow ink, the visible silhouette
 // must remain one connected animal, including its nose, paws, feet and tail.
 const visible=new Set();rows.forEach((row,y)=>[...row].forEach((ink,x)=>{if(ink!=='.'&&ink!=='8')visible.add(y*13+x)}));
 const queue=[visible.values().next().value],seen=new Set(queue);
 for(let i=0;i<queue.length;i++){const n=queue[i],x=n%13,y=Math.floor(n/13);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,k=yy*13+xx;if(xx>=0&&xx<13&&yy>=0&&yy<11&&visible.has(k)&&!seen.has(k)){seen.add(k);queue.push(k)}}}
 assert.equal(seen.size,visible.size,name+' has no disconnected pink paws or tail');assert(rows[10].includes('c')||rows[10].includes('7'),name+' retains a grounded foot');
 if(name.startsWith('back'))assert(!rows.join('').includes('0'),name+' has no backward-facing eye');
}
assert(trace.left[3].indexOf('c')<trace.left[2].indexOf('0'),'left nose faces left of its eye');assert(trace.right[3].indexOf('c')>trace.right[2].indexOf('0'),'right nose faces right of its eye');
console.log('PASS eight 13x11 hand-traced EGA rat cels, floor-visible connected silhouettes, true left/right noses, back views and grounded baselines.');
