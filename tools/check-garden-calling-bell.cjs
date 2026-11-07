const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','presentEgaFrame=()=>{};globalThis.game={get bellSpot(){return hotspots[0].bell},get bellContact(){return pickupNativeContacts.bell},get action(){return storyAction},tickStoryEffect,place(x,y,next={}){room=0;flags={...flagDefaults,...next};player={x,y,step:0,facing:"front"};syncInventory()},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot}',s);const a=s.qa.boot();a.start();
assert.deepEqual(Array.from(a.game.bellSpot),[296,216]);assert.deepEqual(Array.from(a.game.bellContact),[148,131]);
function render(){const pixels=new Array(160*168).fill(0),ctx=a.get('canvas').getContext('2d');ctx.fillRect=function(x,y,w,h){const c=A.palette.indexOf(this.fillStyle);if(c>=0)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<160&&yy>=0&&yy<168)pixels[yy*160+xx]=c};a.game.draw();return pixels.slice()}
const mounted=render();assert.notEqual(mounted[99*160+143],14,'old isolated bell removed from moat edge');assert.equal(mounted[127*160+149],14,'bell hangs at new gatepost');
// The raised handbell belongs to the rear post, while the open front leaf
// keeps its own foreground depth. It must not paint through an actor's torso.
a.game.place(296,211);const inFront=render();a.game.place(296,211,{bell:true});const noBell=render();assert.equal(inFront[127*160+149],noBell[127*160+149],'actor in front occludes handbell');assert.notEqual(inFront[127*160+149],14,'no yellow bell across her torso');a.game.place(296,180);assert.equal(render()[127*160+149],14,'bell remains visible in front of actor behind post');a.game.place(190,220);
a.game.command('look at bell');assert.match(a.message.replace(/\s+/g,' '),/orchard gate.*Visitors ring it to call Merrin/s);a.game.closeMessage();a.game.command('look orchard gate');assert.match(a.message.replace(/\s+/g,' '),/propped open.*summon Merrin/s);a.game.closeMessage();a.game.command('open orchard gate');assert.match(a.message.replace(/\s+/g,' '),/already propped open/);a.game.closeMessage();
a.game.place(276,205);const before=a.game.state.score;a.game.command('take bell');assert.equal(a.game.action.kind,'bellTaken');assert.equal(a.game.action.pickupStand.y,216);
for(let n=0;n<60&&a.game.action;n++)a.game.tickStoryEffect();assert(!a.game.action);assert(a.game.state.inv.includes('silver bell'));assert.equal(a.game.state.score,before+5);a.game.closeMessage();
const empty=render();assert.notEqual(empty[127*160+149],14,'bell disappears from gate peg after pickup');assert.equal(empty[150*160+148],mounted[150*160+148],'post remains');
a.game.place(278,200,{rose:true,roseGiven:true});for(let n=0;n<15&&a.game.state.room===0;n++)a.game.movePlayer(3,0);assert.equal(a.game.state.room,3,'open gate leaves east path usable');
fs.writeFileSync('assets/reviews/garden-calling-bell.json',JSON.stringify({mounted,empty}));
console.log('PASS new calling-bell location/contact, gate backstory, open gate, animated pickup/one award, empty peg and physical east exit.');
