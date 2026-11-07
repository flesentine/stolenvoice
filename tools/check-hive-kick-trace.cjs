const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let harness=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
harness=harness.replace('globalThis.game={command,','globalThis.game={place(px){room=3;player={x:px,y:212,step:1,facing:"front"}},get disaster(){return hiveDisaster},get head(){return elaraWalkSprites.right[1]},get cels(){return hiveKickCels},get hiveMask(){return orchardHiveMask},setFrame(f){storyAction.frame=f},drawHiveKickHero,drawHiveKickObject,tickStoryEffect,get walks(){return elaraWalkSprites},command,');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(harness+';globalThis.qa={boot};',scope);
const colors=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
const paintings=[],walkingPaintings=[];
for(const [startX,dir]of [[170,1],[250,-1]]){
 const a=scope.qa.boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(startX);
 a.game.command('kick hive');assert(a.game.disaster,'kick starts from either side');assert.equal(a.game.disaster.direction,dir);
 let ticks=0,steps=0;const strideCels=new Set();
 const walkCtx=a.get('canvas').getContext('2d'),walking=[];
 while(a.game.disaster.walking&&ticks++<100){
  const before=a.game.state.player;a.game.tickStoryEffect();const after=a.game.state.player;
  assert(Math.abs(after.x-before.x)<=5&&Math.abs(after.y-before.y)<=3,'normal walking stride, no interpolated glide');
  if(after.x!==before.x||after.y!==before.y){steps++;strideCels.add(after.step%4);assert.equal(after.step,before.step+1,'normal walk animation advances');}
  if(a.game.disaster.walking){
   const dots=[];walkCtx.fillRect=function(x,y,w,h){dots.push([x,y,this.fillStyle])};a.game.drawHiveKickHero();
   const expected=[];for(let y=0;y<40;y++)for(let x=0;x<8;x++){const ink=a.game.walks[after.facing][after.step%4][y][x];if(ink!=='.')expected.push([Math.round(after.x/2)+x-4,Math.round(after.y*.7)+y-39,colors[parseInt(ink,16)]])}
   assert.equal(JSON.stringify(dots),JSON.stringify(expected),'approach paints the exact normal walking cel at the real player position');
   const full=[];walkCtx.fillRect=function(x,y,w,h){full.push([x,y,w,h,this.fillStyle])};a.game.drawHiveKickObject();a.game.drawHiveKickHero();walking.push(full);
  }
 }
 walkingPaintings.push(walking);assert(ticks<100&&steps>0);assert(strideCels.size>=2,'feet cycle while approaching');
 const stand=a.game.disaster.stand;assert.equal(stand.y,200,'registered contact position is reachable');
 const ctx=a.get('canvas').getContext('2d');const poses=[];
 for(let f=7;f<30;f++){
  a.game.setFrame(f);const dots=[];ctx.fillRect=function(x,y,w,h){assert.equal(w,1);assert.equal(h,1);dots.push([x,y,this.fillStyle.toLowerCase()])};a.game.drawHiveKickHero();
  const pixels=new Map(dots.map(([x,y,c])=>[`${x},${y}`,c]));const cx=Math.round(stand.x/2),feet=Math.round(stand.y*.7);
  for(let y=0;y<20;y++)for(let x=0;x<8;x++){const ink=a.game.head[y][x];if(ink!=='.')assert.equal(pixels.get(`${cx+dir*(x-4)},${feet+y-39}`),colors[parseInt(ink,16)],'original face/hair stencil stays intact')}
  if(f===14){const shoe=dots.filter(([x,y,c])=>c===colors[6]&&dir*(x-cx)>6);assert(shoe.length>=5,'extended brown shoe');assert(shoe.some(([x,y])=>y<=125&&y>=120),'shoe lifts to hive height');assert(shoe.some(([x,y])=>y<=125&&a.game.hiveMask.some(([left,row,width])=>row===y&&x>=left&&x<left+width)),'toe touches the straw before it tips')}
  poses.push(dots);
 }
 paintings.push(poses);
 assert.equal(a.game.cels.length,6);for(const cel of a.game.cels){assert(cel.some(([x,y,c])=>y===0&&(c===6||c===0)),'original support sole remains on floor');for(const [x,y,c]of cel){assert(Number.isInteger(x)&&Number.isInteger(y));assert([0,1,6,9,12,14,15].includes(c),'original flat EGA palette only')}}
 const original=[];for(let y=0;y<40;y++)for(let x=0;x<8;x++){const c=a.game.head[y][x];if(c!=='.')original.push([x-4,y-39,parseInt(c,16)])}for(const i of [0,5])assert.equal(JSON.stringify(a.game.cels[i]),JSON.stringify(original),'standing endpoints are pixel-identical to the original');
}
fs.writeFileSync('assets/reviews/hive-kick-walk-paint.json',JSON.stringify(walkingPaintings));
fs.writeFileSync('assets/reviews/hive-kick-trace-paint.json',JSON.stringify(paintings));
console.log('PASS normal animated walking approach, six raised kick cels, exact original upper body/endpoints, flat EGA palette, support sole, both mirrored approaches and toe/straw impact.');
