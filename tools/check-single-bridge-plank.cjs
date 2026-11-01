const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const source=fs.readFileSync('game/expanded-world.js','utf8');
const swimSource=fs.readFileSync('game/swimming.js','utf8'),geometry=swimSource.slice(swimSource.indexOf('const bridgeRepairDeck'),swimSource.indexOf('let bridgeFall'));
const code=source.slice(source.indexOf('function drawBridgeRepair(){'),source.indexOf('const pictureCache={}'));
function draw(fixed=false,frame=null,slipped=false){
 const commands=[],px=n=>Math.round(n/2),py=n=>Math.round(n*.7),color=c=>A.palette.indexOf(c);
 const s={flags:{bridgePlank:true,bridgeFixed:fixed,bridgePlankSlipped:slipped},bridgeFall:frame===null?null:{frame},poly:(points,c)=>commands.push({type:'polygon',points:points.map(([x,y])=>[px(x),py(y)]),color:color(c),outline:null}),line:(x,y,xx,yy,c)=>commands.push({type:'line',points:[[px(x),py(y)],[px(xx),py(yy)]],color:color(c)})};
 vm.createContext(s);vm.runInContext(geometry+'\n'+code+';drawBridgeRepair()',s);return commands;
}
const placed=draw(),fixed=draw(true);
for(const commands of [placed,fixed,...Array.from({length:24},(_,frame)=>draw(false,frame))]){
 assert.equal(commands.filter(c=>c.type==='polygon').length,1,'one continuous board');
 A.project({format:'agi-picture-workshop',version:1,width:160,height:168,palette:A.palette,commands});
}
assert.equal(JSON.stringify(placed[0].points),JSON.stringify(draw(false,0)[0].points),'placed board matches first tipping frame');
assert.notEqual(JSON.stringify(draw(false,8)[0].points),JSON.stringify(placed[0].points),'board still tips');
assert.notEqual(JSON.stringify(draw(false,null,true)[0].points),JSON.stringify(placed[0].points),'fallen board stays tilted');
for(let frame=0;frame<24;frame++)assert.equal(JSON.stringify(draw(false,frame,true)),JSON.stringify(draw(false,null,true)),'second fall never lifts slipped board at frame '+frame);
assert.equal(JSON.stringify(draw(true,null,true)[0].points),JSON.stringify(placed[0].points),'lashing returns board to bearings');
assert.equal(fixed.length-placed.length,4,'two twine wraps, each with a shaded edge');
if(process.argv.includes('--preview')){
 const base=require('../assets/rooms/bridge-workshop-v1.json').commands;
 require('sharp')(Buffer.from(A.rgba(A.render([...base,...placed]))),{raw:{width:160,height:168,channels:4}}).resize(640,336,{fit:'fill',kernel:'nearest'}).png().toFile('assets/reviews/bridge-single-plank.png');
}
console.log('PASS single placed/lashed plank, matching tipping start, all24 animated board poses and native EGA geometry.');
