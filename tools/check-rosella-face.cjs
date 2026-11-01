const fs=require('fs'),assert=require('assert/strict');const read=p=>fs.readFileSync(p,'utf8'),original=JSON.parse(read('stolen-voice-short.html').match(/const rosellaWalkSprites=(\{[^\n]+\});/)[1]),built=JSON.parse(read('stolen-voice.html').match(/const rosellaWalkSprites=(\{[^\n]+\});/)[1]),asset=JSON.parse(read('assets/rosella-walk-stable-face-v2.json')).views;
assert.deepEqual(built,asset);
for(const direction of ['front','back','left','right'])for(let cel=0;cel<4;cel++){
 const rows=built[direction][cel];assert.equal(rows.length,40);assert(rows.every(r=>r.length===8));assert.deepEqual(rows.slice(0,12),built[direction][0].slice(0,12),'fixed head '+direction);assert.deepEqual(rows.slice(12,36),original[direction][cel].slice(12,36),'body animation preserved above shoes');
 for(let y=36;y<40;y++)for(let x=0;x<8;x++){const old=original[direction][cel][y][x];if(old==='6')assert(['6','0','e'].includes(rows[y][x]),'boot contrast uses EGA only');else assert.equal(rows[y][x],old,'non-boot pixels stay unchanged')}
 assert(rows.slice(36).join('').includes('0'),'dark sole/heel');assert(rows.slice(36).join('').includes('e'),'one warm highlight');
 if(direction==='front'){assert.equal(rows[5][3],'1');assert.equal(rows[5][5],'1');}if(direction==='left')assert.equal(rows[4][2],'1');if(direction==='right')assert.equal(rows[4][5],'1');if(direction==='back')assert(!rows.slice(0,12).join('').includes('1'),'no rear-facing eyes');
}
assert.deepEqual(built.left[0].slice(0,12),built.right[0].slice(0,12).map(row=>[...row].reverse().join('')),'profile heads mirror exactly');
console.log('PASS fixed facial/eye pixels through all 16 walking cels, mirrored profiles, no back eyes, unchanged body silhouettes and contrasting shoes and exact embedded asset.');

const vm=require('vm'),dots=[],scope={pictureX:x=>Math.round(x/2),pictureY:y=>Math.round(y*.7),x:{fillStyle:'',fillRect(x,y,w,h){dots.push([x,y,w,h,this.fillStyle])}}};vm.createContext(scope);vm.runInContext(read('game/rosella-footing.js')+';globalThis.shadow=drawRosellaContactShadow',scope);
for(const direction of Object.keys(built))for(const rows of built[direction]){dots.length=0;scope.shadow(160,212,rows);assert(dots.length>0);for(const [x,y,w,h,c]of dots){assert.equal(y,149);assert.equal(c,'#000000');assert.equal(w,1);assert.equal(h,1);assert(['0','6','e'].includes(rows[39][x-76]),'shadow touches a planted shoe, not a lifted heel')}}
console.log('PASS per-foot contact shadows under the planted shoes across all sixteen walking cels.');
