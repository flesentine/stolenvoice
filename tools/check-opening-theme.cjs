const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const score=JSON.parse(read('assets/stolen-voice-opening-score.json')),wave=fs.readFileSync(path.join(root,'assets/stolen-voice-opening-tandy.wav'));
assert.equal(score.voices.length,3);assert.equal(score.meter,'6/8');assert.equal(score.bars,16);
for(const voice of score.voices){assert.equal(voice.notes.reduce((n,event)=>n+event[1],0),96);for(const [midi,ticks]of voice.notes){assert(ticks>0);if(midi===0)continue;const hz=440*2**((midi-69)/12),divisor=Math.round(score.clockHz/(32*hz));assert(divisor>=1&&divisor<=1023,'pitch fits real PSG divisor')}}
assert.equal(wave.subarray(0,4).toString(),'RIFF');assert.equal(wave.readUInt16LE(22),1);assert.equal(wave.readUInt32LE(24),22050);assert.equal(wave.readUInt32LE(40),wave.length-44);
let peak=0,energy=0;for(let n=44;n<wave.length;n+=2){const value=wave.readInt16LE(n);peak=Math.max(peak,Math.abs(value));energy+=value*value}assert(peak>1000&&peak<32767);assert(energy>0);for(let n=wave.length-2200;n<wave.length;n+=2)assert.equal(wave.readInt16LE(n),0,'silent tail');
const html=read('stolen-voice.html');assert(Buffer.from(html.match(/const openingJingleWave='([^']+)'/)[1],'base64').equals(wave),'built game embeds exact new score');
let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get titleMusic(){return titleMusicStarted},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);const a=s.qa.boot();
a.get('#start').onclick();assert(a.get('#intro').isConnected,'first Enter keeps title art');assert(a.game.titleMusic);assert(!a.game.state.popupOpen);a.get('#start').onclick();assert(a.get('#intro').isConnected,'second Enter begins animated prologue');for(let beat=0;beat<6;beat++)a.get('#start').onclick();assert(!a.get('#intro').isConnected,'prologue leads into story');assert(a.game.state.popupOpen);
console.log('PASS 16-bar three-voice PSG score, pitch limits, unclipped mono PCM, silent ending, exact embedding and title music/start gestures.');

// The repeated call and its lower answer are part of the actual rendered score.
assert.equal(score.title,'The Missing Answer');assert.equal(score.dottedQuarterBpm,72);
const hook=[[69,2],[72,1],[77,2],[76,1]];
assert.deepEqual(score.voices[0].notes.slice(0,4),hook);
let tickAt=0;const echo=[];for(const event of score.voices[1].notes){if(tickAt>=6&&tickAt<12)echo.push(event);tickAt+=event[1]}
assert.deepEqual(echo,hook.map(([n,t])=>[n-12,t]));
for(const voice of score.voices)assert(voice.notes.some(([n])=>n===0),'Each voice leaves breathing space');
assert(Math.abs(score.durationSeconds-27.0166667)<.001);
const A=require('../editor/agi-picture.js'),art=JSON.parse(read('assets/opening/opening-workshop-v1.json'));
assert.equal(art.width,160);assert.equal(art.height,168);assert.equal(art.palette.length,16);
for(const name of ['Merrin mouth','Rosella reaching hand','Mirror silver','Stolen voice ribbon'])assert(art.commands.some(c=>c.name===name),name);
assert.equal(art.reference,'assets/opening/opening-imagegen-v2.png');assert(art.commands.length>180,'manually redrawn architecture and figures');
const pixels=A.render(art.commands);assert.equal(pixels.length,160*168);assert(pixels.every(c=>c>=0&&c<16));
// Exercise all cels of the title overlay independently, recording native ink.
const ink=[],ctx={fillStyle:'',fillRect(x,y,w,h){ink.push([x,y,w,h,this.fillStyle])}};
const scope={window:{matchMedia:()=>({matches:false})}};vm.createContext(scope);
vm.runInContext(read('game/opening-picture.js')+read('game/opening-screen.js')+';globalThis.proof={draw:paintOpeningVoice,point:openingBreathPoint,setFrame(n){titleFrame=n}};',scope);
const frames=new Set();for(let f=0;f<48;f++){
 ink.length=0;scope.proof.setFrame(f);scope.proof.draw(ctx);frames.add(JSON.stringify(ink));
 for(const [x,y,w,h,c]of ink){assert.equal(x%2,0);assert.equal(w,2);assert.equal(h,1);assert(x>=0&&x<320&&y>=20&&y<188);assert(art.palette.includes(c));}
}
assert(frames.size>=40,'Traveling voice has distinct cels');
assert.deepEqual(Array.from(scope.proof.point(0)),[39,86]);
const end=scope.proof.point(1);assert(Math.abs(end[0]-108)<1&&Math.abs(end[1]-80)<1);
console.log('PASS voice-themed native EGA art, 48 animated cels, mouth-to-mirror path, repeated hook and quieter octave answer.');
