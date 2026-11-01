const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),sources=[],resumes=[];let pcm;
class AudioContext{
 constructor(){this.destination={}}
 createBuffer(ch,n,rate){assert.equal(ch,1);assert.equal(rate,22050);pcm=new Float32Array(n);return{getChannelData:()=>pcm}}
 createBufferSource(){const source={connect(){},disconnect(){},start(time,offset){this.offset=offset},stop(){this.stopped=true}};sources.push(source);return source}
 resume(){return new Promise((resolve,reject)=>resumes.push({resolve,reject}))}
}
const sandbox={window:{AudioContext,addEventListener(){}},document:{addEventListener(){}},soundEnabled:true,jingleContext:null,stopOpeningJingle(){}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'game/tandy-sound.js'),'utf8')+fs.readFileSync(path.join(root,'game/prologue-score.js'),'utf8')+';globalThis.qa={playGameSound,stopGameSound,cues:tandyCues,get source(){return effectSource}};',sandbox);
const qa=sandbox.qa;
async function main(){
 for(const voice of qa.cues.courtDance)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-48*.09)<1e-10,'all dance voices match animation duration');
 for(const voice of qa.cues.workshopDance)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-224*.09)<1e-10,'workshop music matches twenty-second dance');
 for(const voice of qa.cues.chairPace)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-48*.09)<1e-10,'chair pacing music matches recovery duration');
 for(const voice of qa.cues.barrelTumble)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-25*.09)<1e-10,'barrel ditty matches fall ticks20–45');
 for(const voice of qa.cues.royalRaspberry)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-12*.09)<1e-10,'raspberry matches vapor ticks5–17');
 for(const cue of Object.keys(qa.cues)){
  qa.playGameSound(cue);
  if(cue==='barrelTumble'||cue==='royalRaspberry'){const data=Buffer.alloc(pcm.length*2);pcm.forEach((n,i)=>data.writeInt16LE(Math.round(n*32767),i*2));const wav=Buffer.alloc(44);wav.write('RIFF');wav.writeUInt32LE(36+data.length,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(data.length,40);fs.writeFileSync(path.join(root,'assets/reviews/'+(cue==='barrelTumble'?'barrel-tumble':'royal-raspberry')+'.wav'),Buffer.concat([wav,data]))}
  assert(pcm.some(n=>n!==0),cue+' is audible');
  assert(pcm.every(n=>Number.isFinite(n)&&Math.abs(n)<1),cue+' is finite and nonclipping');
  assert.equal(Math.abs(pcm[0]),0,cue+' starts at zero');assert.equal(Math.abs(pcm.at(-1)),0,cue+' ends at zero');
 }
 qa.playGameSound('merrinSong',false,3.2);const first=Math.floor(3.2*22050);
 assert.equal(Math.abs(pcm[first]),0,'resumed song gets a fresh attack');assert.equal(sources.at(-1).offset,3.2,'resume position is preserved');
 qa.playGameSound('bell',false,NaN,NaN);assert.equal(sources.at(-1).offset,0);assert(pcm.every(Number.isFinite),'invalid playback inputs cannot produce NaN audio');
 qa.playGameSound('grottoSong');assert.equal(sources.at(-1).loop,true,'cave song loops in audio source');qa.playGameSound('sluiceSong');assert.equal(sources.at(-1).loop,true,'water puzzle song loops');
 const starts=sources.length;sandbox.soundEnabled=false;qa.playGameSound('bell');assert.equal(sources.length,starts,'muted playback creates no source');sandbox.soundEnabled=true;
 qa.playGameSound('bell');const old=qa.source,oldResume=resumes.at(-1);
 qa.playGameSound('hiveWax');const current=qa.source,currentResume=resumes.at(-1);
 assert(old.stopped,'new cue replaces old cue');old.onended();assert.equal(qa.source,current,'old onended cannot clear new cue');
 oldResume.reject(Error('old request failed'));await Promise.resolve();assert.equal(qa.source,current);assert(!current.stopped,'stale resume rejection cannot stop current cue');
 currentResume.reject(Error('current request failed'));await Promise.resolve();assert.equal(qa.source,null);assert(current.stopped,'current resume failure cleans its own source');
 console.log('PASS '+Object.keys(qa.cues).length+' PSG cues: finite nonclipping PCM, silent cue edges, resumed attack/offset, invalid inputs, mute and stale audio callback isolation.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
