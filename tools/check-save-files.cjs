// Exercise the actual embedded save paths, including native file/dialog event
// callbacks. Browser download/picker APIs are stand-ins; no browser is opened.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={portableSaveText,importGameSave,downloadGameSave,chooseGameSave,showSaveFiles,closeSaveFiles,restoreBackupGame,validateAdventureSave,get backupKey(){return SAVE_BACKUP_KEY},get filesDialog(){return saveFileDialog},get filePicker(){return saveFileInput},get fileBusy(){return saveFileBusy},command,');
h=h.replace('  getContext(){return context}',`  click(){for(const fn of this.listeners.click||[])fn({target:this})}
  showModal(){this.open=true}
  close(){this.open=false}
  getContext(){return context}`);
h=h.replace("append(child){child.parent=this;", "append(child){(this.children??=[]).push(child);child.parent=this;");
h=h.replace('const sandbox={document:doc,window,localStorage:',`const transfers={blobs:[],revoked:[]};const sandbox={Blob:class{constructor(parts,options){this.text=parts.join('');this.type=options.type}},URL:{createObjectURL(blob){transfers.blobs.push(blob);return 'blob:test-save'},revokeObjectURL(url){transfers.revoked.push(url)}},setTimeout(fn){transfers.cleanup=fn},document:doc,window,localStorage:`);
h=h.replace('return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,','return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,transfers,');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(h+';globalThis.qa={boot};',scope);const boot=scope.qa.boot;
const drain=a=>{let n=0;while(a.game.state.popupOpen&&n++<40)a.game.closeMessage();assert(n<40)};
const state=a=>JSON.parse(JSON.stringify({...a.game.state,popupOpen:false}));
const fresh=storage=>{const a=boot(storage);a.start();drain(a);return a};
function save(a){drain(a);const raw=a.game.saveGame();assert.equal(typeof raw,'string');drain(a);return raw}
(async()=>{
 const a=fresh(),early=save(a),key=a.game.key,backupKey=a.game.backupKey;
 a.run('xyzzy');drain(a);const later=save(a),laterState=state(a);
 assert.equal(a.storage.get(backupKey),early,'previous valid checkpoint is retained');
 assert.notEqual(later,early);assert(laterState.score>0);
 const file=a.game.portableSaveText(later),envelope=JSON.parse(file);assert.equal(envelope.formatVersion,1);assert.equal(envelope.payload.game,'stolen-voice-expanded');
 const moved=fresh(new Map());assert.equal(moved.storage.size,0,'new location has no shared browser storage');
 assert(moved.game.importGameSave(file));drain(moved);assert.deepEqual(state(moved),laterState,'portable file restores exact quest/player/score/inventory in fresh storage');
 const rawCopy=fresh(new Map());assert(rawCopy.game.importGameSave(later));drain(rawCopy);assert.deepEqual(state(rawCopy),laterState,'raw existing v2 save remains importable');
 const baseline=state(moved),stored=[...moved.storage];
 const damaged=JSON.parse(file);damaged.payload.flags.rose=!damaged.payload.flags.rose;
 const invalid=[JSON.stringify(damaged),'{broken','null','[]',JSON.stringify({...envelope,formatVersion:99}),JSON.stringify({...JSON.parse(later),version:99}),JSON.stringify({...JSON.parse(later),game:'different-game'}),JSON.stringify({...JSON.parse(later),flags:{...JSON.parse(later).flags,rose:'yes'}}),JSON.stringify({...JSON.parse(later),flags:{...JSON.parse(later).flags,echoCaught:false,jarSealed:true}}),'x'.repeat(262145)];
 for(const bad of invalid){drain(moved);assert.equal(moved.game.importGameSave(bad),false);assert.deepEqual(state(moved),baseline,'bad file leaves quest unchanged');assert.deepEqual([...moved.storage],stored,'bad file leaves primary/backup unchanged')}
 const corrupt=new Map(a.storage);corrupt.set(key,'{broken');const recovered=fresh(corrupt);recovered.game.restoreGame();assert.match(recovered.message,/backup/);drain(recovered);assert.equal(recovered.game.state.score,0);assert.equal(recovered.game.state.flags.rose,false);assert(recovered.game.validateAdventureSave(corrupt.get(key)),'recovery repairs the primary slot');
 const previous=fresh(new Map(a.storage));assert(previous.game.restoreBackupGame());drain(previous);assert.equal(previous.game.state.score,0);assert.equal(previous.storage.get(backupKey),later,'previous-primary remains recoverable after selecting backup');
 class BlockedStorage extends Map{get(){throw Error('storage blocked')}set(){throw Error('storage blocked')}}
 const blocked=fresh(new BlockedStorage());blocked.run('xyzzy');drain(blocked);const blockedRaw=save(blocked);assert(blockedRaw);blocked.game.downloadGameSave();assert.equal(blocked.transfers.blobs.length,1);assert.equal(blocked.transfers.blobs[0].type,'application/json');assert(JSON.parse(blocked.transfers.blobs[0].text).checksum);assert.match(blocked.message,/ready to\s+download/);blocked.transfers.cleanup();assert.deepEqual(Array.from(blocked.transfers.revoked),['blob:test-save']);
 const offline=fresh(new BlockedStorage());assert(offline.game.importGameSave(blocked.transfers.blobs[0].text));assert.match(offline.message,/keep\s+your\s+save\s+file/);drain(offline);assert.equal(offline.game.state.score,blocked.game.state.score);
 const legacy={version:1,game:'stolen-voice',room:1,flags:{rose:true,bell:true,mirrorAwake:true,voiceReturned:true,complete:true},player:{x:155,y:188,step:1,facing:'front'}};
 const old=fresh();assert(old.game.importGameSave(JSON.stringify(legacy)));assert.match(old.message,/earlier/);drain(old);assert.equal(old.game.state.score,15);assert(!old.game.state.flags.voiceReturned,'legacy imports do not skip the expanded quest');
 const ui=fresh();ui.run('save files');assert(ui.game.filesDialog?.open);const first=ui.doc.activeElement;assert.equal(first.textContent,'Quick save');assert(ui.game.state.popupOpen,'save panel pauses active play');const draft=ui.get('#input').value;ui.key('q');assert.equal(ui.get('#input').value,draft);ui.key('Escape');assert.equal(ui.game.filesDialog,null);assert(!ui.game.state.popupOpen);
 ui.game.showSaveFiles();ui.game.filesDialog.children.find(b=>b.textContent==='Download save').click();assert.equal(ui.game.filesDialog,null);assert.equal(ui.transfers.blobs.length,1);
 drain(ui);const beforePicker=state(ui);ui.game.chooseGameSave();let picker=ui.game.filePicker;assert.equal(picker.accept,'.json,.elara-save,application/json');assert(ui.game.fileBusy);picker.listeners.cancel[0]();drain(ui);assert(!ui.game.fileBusy);assert.deepEqual(state(ui),beforePicker);
 ui.game.chooseGameSave();assert.equal(ui.doc.activeElement.textContent,'Cancel file');ui.doc.activeElement.click();drain(ui);assert(!ui.game.fileBusy);assert.deepEqual(state(ui),beforePicker,'visible cancel control works without a native picker cancel event');
 ui.game.chooseGameSave();picker=ui.game.filePicker;picker.files=[{size:file.length,text:async()=>file}];await picker.listeners.change[0]();assert(!ui.game.fileBusy);drain(ui);assert.deepEqual(state(ui),laterState,'file-picker change event loads the selected save');
 ui.game.chooseGameSave();picker=ui.game.filePicker;const beforeBig=state(ui);picker.files=[{size:262145,text:async()=>{throw Error('must not read oversized file')}}];await picker.listeners.change[0]();drain(ui);assert.deepEqual(state(ui),beforeBig);
 ui.game.chooseGameSave();picker=ui.game.filePicker;let resolve;picker.files=[{size:file.length,text:()=>new Promise(r=>resolve=r)}];const reading=picker.listeners.change[0]();ui.key('Escape');resolve(early);await reading;drain(ui);assert.deepEqual(state(ui),beforeBig,'Escape cancels a pending read without a late restore');
 const interrupted=fresh(new Map(a.storage));interrupted.storage.set=function(k,v){if(k===backupKey)throw Error('quota');return Map.prototype.set.call(this,k,v)};assert(interrupted.game.importGameSave(early));assert.equal(interrupted.storage.get(key),later,'backup-write failure preserves the previous primary save');assert.match(interrupted.message,/keep\s+your\s+save\s+file/);
 console.log('PASS portable saves: fresh-location exact round trip, raw v2/v1 migration, corruption/version/schema/size rejection with unchanged quest and slots, quick-save rotation/recovery, blocked storage, download bytes/revocation, native dialog controls and picker cancel/read/oversize/late cancellation.');
})().catch(error=>{console.error(error);process.exitCode=1});
