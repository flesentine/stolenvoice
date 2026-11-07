// Original call-and-echo lament in 6/8; three SN76489 tone channels, no noise or FX.
// Pitch = 3,579,545 / (32 * 10-bit divisor); 2 dB volume-register steps.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),sampleRate=22050,tick=60/72/3,clock=3579545;
const melody=[
 [['A4',2],['C5',1],['F5',2],['E5',1]],
 [['B4',2],['A4',1],['-',3]],
 [['E4',2],['A4',1],['C5',2],['B4',1]], [['A4',4],['-',2]],
 [['A4',2],['C5',1],['F5',2],['E5',1]],
 [['G5',2],['E5',1],['D5',2],['C5',1]],
 [['B4',2],['G#4',1],['E5',2],['D5',1]], [['C5',3],['B4',1],['A4',2]],
 [['C5',1],['E5',2],['F5',1],['E5',2]], [['D5',2],['B4',1],['-',3]],
 [['G4',2],['B4',1],['E5',2],['D5',1]], [['C5',3],['B4',2],['G#4',1]],
 [['A4',2],['C5',1],['F5',2],['E5',1]], [['D5',2],['C5',1],['B4',2],['A4',1]],
 [['G#4',1],['B4',1],['E5',3],['B4',1]], [['A4',5],['-',1]]
];
const harmony=[
 [['E4',3],['C4',2],['-',1]],
 [['A3',2],['C4',1],['F4',2],['E4',1]],
 [['C4',2],['E4',1],['A3',2],['-',1]], [['C4',3],['E4',2],['-',1]],
 [['C4',2],['-',1],['A3',2],['-',1]],
 [['A3',2],['C4',1],['F4',2],['E4',1]],
 [['D4',3],['B3',2],['-',1]], [['E4',2],['D4',1],['C4',3]],
 [['G4',2],['-',1],['C4',2],['-',1]],
 [['C4',1],['E4',2],['F4',1],['E4',2]],
 [['D4',2],['G4',1],['B3',2],['-',1]], [['E4',3],['D4',2],['-',1]],
 [['C4',2],['-',1],['A3',2],['-',1]],
 [['A3',2],['C4',1],['F4',2],['E4',1]],
 [['D4',3],['G#3',2],['-',1]], [['C4',5],['-',1]]
];
const roots=[['A2','E3'],['F3','C3'],['A2','E3'],['A2','E3'],
 ['F3','C3'],['C3','G3'],['E3','B2'],['A2','E3'],
 ['C3','G3'],['G3','D3'],['G3','D3'],['E3','B2'],
 ['F3','C3'],['D3','A2'],['E3','B2'],['A2','E3']];
const midi=name=>{if(name==='-')return 0;const m=name.match(/^([A-G])(#?)(\d)$/);return 12*(Number(m[3])+1)+({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[m[1]]+(m[2]?1:0)};
const voices=[
 {name:'The missing answer - cantus',attenuation:4,notes:melody.flat().map(([n,t])=>[midi(n),t])},
 {name:'Distant answering voice',attenuation:9,notes:harmony.flat().map(([n,t])=>[midi(n),t])},
 {name:'Plucked lute foundation',attenuation:9,notes:roots.flatMap(([a,b])=>[[midi(a),2],[0,1],[midi(b),2],[0,1]])}
];
for(const bar of melody)if(bar.reduce((sum,n)=>sum+n[1],0)!==6)throw Error('Unbalanced 6/8 bar');
const duration=96*tick+.35,pcm=new Float64Array(Math.ceil(duration*sampleRate));
for(const voice of voices){
 let time=0,phase=0;
 for(let index=0;index<voice.notes.length;index++){
  const [midi,ticks]=voice.notes[index],length=ticks*tick;
  if(midi===0){time+=length;continue}
  const target=440*2**((midi-69)/12),divisor=Math.max(1,Math.min(1023,Math.round(clock/(32*target)))),frequency=clock/(32*divisor);
  const start=Math.round(time*sampleRate),end=Math.round((time+length)*sampleRate),last=index===voice.notes.length-1;
  for(let n=start;n<end;n++){
   const position=(n-start)/(end-start);
   // Discrete volume-register release: no reverb, chorus, or extra oscillators.
   const release=last?(position>.98?15:position>.91?9:position>.81?6:position>.66?3:0):(position>.98?15:position>.94?5:position>.84?2:0);
   const attenuation=Math.min(15,voice.attenuation+release);
   const amplitude=attenuation===15?0:Math.pow(10,-attenuation*2/20)*.37;
   phase=(phase+frequency/sampleRate)%1;
   pcm[n]+=(phase<.5?1:-1)*amplitude;
  }
  time+=length;
 }
}
const wave=Buffer.alloc(44+pcm.length*2);
wave.write('RIFF',0);wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);wave.writeUInt32LE(sampleRate,24);wave.writeUInt32LE(sampleRate*2,28);wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(pcm.length*2,40);
for(let n=0;n<pcm.length;n++)wave.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm[n]))*32767),44+n*2);
fs.writeFileSync(path.join(root,'assets/stolen-voice-opening-tandy.wav'),wave);
fs.writeFileSync(path.join(root,'assets/stolen-voice-opening-score.json'),JSON.stringify({title:'The Missing Answer',motif:'A4 C5 F5 E5; answered one octave below',composer:'Original theme for Elara and the Stolen Voice',meter:'6/8',dottedQuarterBpm:72,key:'A minor, with a falling-semitone hook and raised-seventh cadences',bars:16,sampleRate,tickSeconds:tick,durationSeconds:duration,clockHz:clock,voices},null,2)+'\n');
console.log('Rendered '+duration.toFixed(2)+'-second original Tandy three-voice lament: The Missing Answer.');
