// Render the same three stepped square-wave voices used by the game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const scope={tandyCues:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync('game/prologue-score.js','utf8')+';globalThis.score=prologueScore;globalThis.bars=prologueMelodyBars;',scope);
const voices=scope.tandyCues.prologueStory,rate=22050,duration=40.32,out=new Float32Array(Math.round(rate*duration));
assert.equal(voices.length,3);assert.equal(scope.bars.length,24);
for(const bar of scope.bars)assert.equal(bar.reduce((s,e)=>s+e[1],0),6);
for(let voice=0;voice<3;voice++){
 const events=voices[voice];assert(Math.abs(events.reduce((s,e)=>s+e[1],0)-duration)<1e-8);
 let time=0,phase=0;
 for(const [note,length]of events){
  assert(Number.isInteger(note)&&length>0);const from=Math.round(time*rate),to=Math.min(out.length,Math.round((time+length)*rate));
  if(note){const divisor=Math.round(3579545/(32*440*2**((note-69)/12)));assert(divisor>=1&&divisor<=1023);const hz=3579545/(32*divisor);
   for(let i=from;i<to;i++){phase=(phase+hz/rate)%1;const pos=(i-from)/(to-from),release=Math.floor(pos*5)*2;out[i]+=(phase<.5?1:-1)*.18*10**(-(voice*2+release)/20)}
  }time+=length;
 }
}
let peak=0;const wave=Buffer.alloc(44+out.length*2);wave.write('RIFF');wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(rate,24);wave.writeUInt32LE(rate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(out.length*2,40);
for(let i=0;i<out.length;i++){peak=Math.max(peak,Math.abs(out[i]));wave.writeInt16LE(Math.round(Math.max(-1,Math.min(1,out[i]))*32767),44+i*2)}assert(peak<1&&peak>.1);
fs.writeFileSync('assets/stolen-voice-prologue-tandy.wav',wave);fs.writeFileSync('assets/stolen-voice-prologue-score.json',JSON.stringify({title:scope.score.title,durationSeconds:duration,meter:'6/8',bars:24,voices},null,2)+'\n');
console.log('PASS 40.32-second original score: 24 complete 6/8 bars, three equal-length PSG voices, legal chip pitches and unclipped mono PCM.');
