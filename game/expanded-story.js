const eventPoints={rose:5,roseGiven:5,bell:5,oilTaken:2,twineTaken:2,plankTaken:2,shearsTaken:2,waxTaken:2,shearsReady:5,thornsCut:5,bridgePlank:5,bridgeFixed:5,wheelUnlocked:5,wheelTurned:0,jarTaken:5,poolAwake:0,poolRiddleSolved:5,echoNamed:5,echoCaught:5,jarSealed:5,ropeFixed:5,bellRung:5,mirrorAwake:5,voiceOffered:5,voiceReturned:5,complete:5};
const MAX_SCORE=Object.values(eventPoints).reduce((a,b)=>a+b,0);
const flagDefaults={barrelOpen:false,manureSoiled:false,inventoryCheat:false,hiveWaxOne:false,hiveWaxTwo:false,rose:false,roseGiven:false,workshopKey:false,workshopUnlocked:false,workshopOpen:false,bell:false,oilTaken:false,twineTaken:false,plankTaken:false,shearsTaken:false,waxTaken:false,shearsReady:false,thornsCut:false,bridgePlank:false,bridgePlankSlipped:false,bridgeFixed:false,wheelOiled:false,wheelUnlocked:false,wheelTurned:false,cabinetOpen:false,jarTaken:false,poolAwake:false,poolRiddleSolved:false,echoNamed:false,echoCaught:false,jarSealed:false,ropeFixed:false,harmonyTuned:false,bellRung:false,mirrorAwake:false,voiceOffered:false,voiceReturned:false,complete:false,readBook:false,bookOpen:false,voiceArrivalSeen:false,voiceDepartureSeen:false,voiceCourtyardSeen:false};
function carriedItems(state=flags){
 const items=[];
 if(state.rose&&!state.roseGiven)items.push('rose');if(state.workshopKey||state.roseGiven)items.push('workshop key');if(state.bell)items.push('silver bell');
 if(state.oilTaken)items.push('oil flask');if(state.twineTaken)items.push('twine');
 if(state.plankTaken&&!state.bridgePlank)items.push('wooden plank');
 if(state.shearsTaken)items.push(state.shearsReady?'pruning shears':'rusty shears');
 if(state.waxTaken&&!state.jarSealed)items.push('beeswax');
 if(state.jarTaken)items.push(state.voiceReturned?'glass jar':state.bellRung?'voice jar':state.jarSealed?'sealed echo':state.echoCaught?'echo jar':'glass jar');
 return items;
}
function syncInventory(){inv=carriedItems();renderItems()}
function progress(flag,text){
 const fresh=!flags[flag];
 if(fresh){flags[flag]=true;if(eventPoints[flag])award(flag,eventPoints[flag]);playGameSound(flag==='thornsCut'?'point':flag,flag!=='thornsCut'&&!!eventPoints[flag]);}
 if(fresh&&flag==='wheelUnlocked'){progress('wheelTurned',text);return}
 if(fresh&&flag==='thornsCut'){syncInventory();startStoryEffect('thornsCut',text);return}
 syncInventory();draw();
 if(fresh&&pickupObjects[flag]){startStoryEffect('pickup',text,pickupObjects[flag]);return}
 if(fresh&&flag==='wheelTurned'){startGrainHoist(text);return}
 if(fresh&&flag==='voiceReturned'){startVoiceFollow();say(voiceReleaseText);return}
 if(fresh&&['bell','poolRiddleSolved','echoCaught','voiceOffered','voiceReturned'].includes(flag)){startStoryEffect(flag==='bell'?'bellTaken':flag,text);return}
 if(text)say(text);
}
// Repeating a gentle hint cycles local leads; only an explicit request adds detail.
let hintSessionKey='',hintSessionIndex=-1;
function roomHintChoices(){
 const hints=[];
 const add=(id,nudge,more,command)=>hints.push({id,steps:[nudge,more,command]});
 const shedSupplies='The potting shed has gardening supplies. Merrin keeps its key.';
 if(room===0){
  if(!flags.roseGiven)add('garden-kindness',
   'Merrin seems as worried about his garden as his voice. A small kindness might earn his trust.',
   flags.rose?'The rose in your satchel would make a thoughtful gift.':'A red rose grows near the path. Merrin might appreciate it.',
   flags.rose?'Near Merrin, GIVE ROSE TO MERRIN.':'Near the rose, TAKE ROSE; then bring it to Merrin and GIVE ROSE TO MERRIN.');
  if(!flags.bell)add('garden-bell','The little bell across the lawn looks portable.',
   'Its wooden handle hangs from a peg. It could travel with you.',
   'Walk close to the little garden bell and TAKE BELL.');
  if(flags.roseGiven)add('garden-explore','Merrin has trusted you with his key. The castle and the orchard offer different leads.',
   'His workshop is across the courtyard; the orchard path leaves the garden to the east.',
   'Near the castle gate, GO NORTH for the courtyard; near the right-hand path, GO EAST for the orchard.');
 }else if(room===8){
  if(!flags.workshopOpen)add('court-shed',hasWorkshopKey()?'The key Merrin gave you belongs to the workshop door on the left.':'The locked workshop is Merrin\'s private space. You may need to earn his trust.',
   hasWorkshopKey()?'Try the key in the left-hand door, then lift the latch.':'Merrin waits in the garden. A gift from his flowers might soften him.',
   hasWorkshopKey()?(flags.workshopUnlocked?'Near the left door, OPEN WORKSHOP DOOR.':'Near the left door, UNLOCK WORKSHOP DOOR WITH KEY, then OPEN WORKSHOP DOOR.'):'Return to the garden and bring Merrin the rose.');
  add('court-gallery','The open arch on the right leads deeper into the castle.',
   'The gallery has an old book, a mirror and stairs leading upward.',
   'Walk close to the right-hand arch and ENTER GALLERY.');
 }else if(room===2){
  const missing=[['oilTaken','oil'],['shearsTaken','shears'],['twineTaken','twine'],['plankTaken','plank']].filter(([flag])=>!flags[flag]);
  if(missing.length)add('shed-supplies','The workshop holds useful supplies in more than one place.',
   'Check the bench, hanging coil and spare boards. You need only one of each useful item.',
   'Still available here: '+missing.map(([,item])=>'TAKE '+item.toUpperCase()).join('; ')+'. Walk near the matching object first.');
 }else if(room===3){
  if(!flags.waxTaken)add('orchard-wax','Pale flakes lie below the hive entrance, where the bees are less interested.',
   (flags.hiveWaxOne||flags.hiveWaxTwo?'Your gathered flakes are safe. ':'')+'Watch for a break in the low bees\' flight before reaching for more wax.',
   mobilePuzzleUI()?'Near the hive, TAKE WAX opens the close-up. Watch the bees and tap to reach during a gap.':'Near the hive, TAKE WAX opens the close-up. Watch the bees and use Space or click to reach during a gap.');
  if(!flags.thornsCut)add('orchard-thorns','The eastern path is blocked by woody stems, not just leaves.',
   flags.shearsReady?'Your working shears look suited to those stems.':flags.shearsTaken?'The shears are the right sort of tool, but their pivot still seizes.':shedSupplies,
   flags.shearsReady?'Near the blackthorn, CUT THORNS WITH SHEARS.':flags.oilTaken&&flags.shearsTaken?'OIL SHEARS first; then return to the blackthorn and CUT THORNS WITH SHEARS.':'Find the oil and shears in the potting shed before working on the blackthorn.');
  if(flags.thornsCut)add('orchard-east','The cut stems leave the eastern path open.',
   'Beyond the orchard lies the stream, a broken bridge and the old mill.',
   'Near the cleared eastern path, GO EAST.');
 }else if(room===4){
  if(!flags.bridgePlank)add('bridge-board','The missing boards need something solid to span the gap.',
   flags.plankTaken?'The spare plank in your satchel is long enough to rest on the surviving timbers.':shedSupplies+' Look among the spare boards.',
   flags.plankTaken?'Near the broken crossing, PUT PLANK ON BRIDGE.':'In the potting shed, TAKE PLANK; return to the crossing and PUT PLANK ON BRIDGE.');
  else if(!flags.bridgeFixed)add('bridge-binding','The plank rocks underfoot. Resting it across the gap is only half a repair.',
   flags.twineTaken?'Your twine could hold it against the old timbers.':'The old lashings are loose. Fresh binding from the workshop would help.',
   flags.twineTaken?'Near the plank, TIE PLANK TO BRIDGE.':'Collect twine from the potting shed, then TIE PLANK TO BRIDGE at the crossing.');
  if(!flags.jarTaken)add('bridge-mill','You can investigate the old mill from this bank, even before repairing the crossing.',
   'Its doorway is reached by the path beside the waterwheel.',
   'Walk up to the mill doorway and ENTER MILL.');
  if(flags.bridgeFixed&&!flags.echoCaught)add('bridge-cave','The repaired bridge gives you access to the cave across the stream.',
   'A still pool waits inside the grotto.',
   'Cross the repaired bridge, walk up to the cave entrance and ENTER GROTTO.');
 }else if(room===5){
  if(!flags.wheelUnlocked)add('mill-water','The brake grips the wheel. Its hanging bucket is empty, while water spills from the wooden panel.',
   'The troughs in that panel can guide water into the bucket. They slide into empty sockets rather than turning.',
   'Walk up to the wooden panel beside the wheel and LOOK PANEL. Slide troughs to connect the inlet to the bucket.');
  else if(!flags.wheelTurned)add('mill-wheel','The brake is clear, but the wheel still needs a start.',
   'A push on a spoke should let the current take over.',
   'Near the wheel, TURN WHEEL.');
  else if(!flags.cabinetOpen)add('mill-cupboard','The hoist has moved the grain sack away from the cupboard.',
   'Its door is within reach now.',
   'Near the cupboard, OPEN CUPBOARD.');
  else if(!flags.jarTaken)add('mill-jar','There is a hollow glass vessel on the measuring shelf.',
   'It is small enough to carry and has an open mouth.',
   'Near the open cupboard, TAKE JAR.');
 }else if(room===6){
  if(!flags.poolAwake)add('pool-wake','The pool is unnaturally still, as though it is waiting to hear something.',
   flags.bell?'A clear silver note might disturb that silence.':'There is a little silver bell back in the garden.',
   flags.bell?'Beside the pool, RING BELL.':'Take the little bell in the garden, then RING BELL beside the pool.');
  else if(!flags.poolRiddleSolved)add('pool-riddle','The pool\'s riddle describes something that answers without a voice of its own.',
   'Think of what returns your own words from a cliff or empty hall.',
   'ANSWER ECHO.');
  else if(!flags.echoNamed)add('pool-name','The pool can repeat words. Whose missing voice brought you here?',
   'Remember the gardener\'s name.',
   'Beside the pool, SAY MERRIN.');
  else if(!flags.echoCaught)add('pool-capture','The repeated name lingers above the water, but you cannot carry a sound in your hands.',
   flags.jarTaken?'Your hollow glass jar could give it somewhere to gather.':'The mill has a glass measuring jar behind its blocked cupboard.',
   flags.jarTaken?'Beside the pool, USE JAR ON POOL.':'Find the measuring jar in the mill, then USE JAR ON POOL beside the lingering name.');
 }else if(room===7){
  if(!flags.ropeFixed)add('belfry-rope','The short bell rope is badly frayed. A hard pull would finish it.',
   flags.twineTaken?'Fresh twine could bind the damaged section.':'Look for fresh twine among the workshop supplies.',
   flags.twineTaken?'Near the bell rope, FIX ROPE WITH TWINE.':'Take twine from the potting shed, then FIX ROPE WITH TWINE in the belfry.');
  if(flags.ropeFixed&&flags.jarSealed&&!flags.harmonyTuned)add('belfry-harmony','The strings answer the jar, but their notes do not yet agree.',
   'The brass weights share tension. Compare each answering string with the jar\'s marked note.',
   'Near the instrument, LOOK RESONATORS opens the harmony puzzle.');
  else if(flags.harmonyTuned&&!flags.bellRung)add('belfry-ring','The repaired rope and answering strings are ready.',
   'The great bell can now give the bottled echo strength.',
   'Near the bell rope, PULL ROPE.');
  if(flags.bellRung)add('belfry-return','The jar now holds a familiar voice. The mirror downstairs still owes a debt.',
   'Bring the voice back to the gallery.',
   'Leave DOWN to the gallery and bring the voice jar close to the mirror.');
 }else if(room===1){
  if(flags.voiceOffered&&!flags.voiceReturned)add('mirror-name','The mirror is waiting to hear who rightfully owns the voice.',
   'Name the gardener whose voice it borrowed.',
   'Near the mirror, SAY MERRIN.');
  else if(!flags.mirrorAwake&&flags.bell)add('mirror-wake','The silver glass seems asleep. A clear note might make it listen.',
   'The little garden bell can wake more than still water.',
   'Near the mirror, USE BELL ON MIRROR.');
  else if(flags.mirrorAwake&&flags.bellRung&&!flags.voiceOffered)add('mirror-offer','The awake mirror seems to recognize what is singing in your jar.',
   'Bring glass to glass and offer back the voice.',
   'Offer the voice jar to the mirror: GIVE VOICE JAR TO MIRROR.');
  if(!flags.readBook)add('gallery-book','The old red book may explain what the mirror has borrowed.',
   flags.bookOpen?'Its pages describe a voice\'s journey, in verse.':'The red book on the table has a clasped cover.',
   flags.bookOpen?'Near the table, READ BOOK.':'Near the table, OPEN BOOK, then READ BOOK.');
 }
 // Carried-item work is a valid alternative anywhere, never a required next step.
 if(flags.oilTaken&&flags.shearsTaken&&!flags.shearsReady)add('carried-shears','The shears in your satchel still seize at the pivot.',
  'You have oil and the rusty tool together; there is no need to return to a bench.',
  'OIL SHEARS (or OIL BLADES) works on the carried tool.');
 if(flags.echoCaught&&!flags.jarSealed)add('carried-seal','A thin whisper is escaping around the jar\'s open mouth.',
  flags.waxTaken?'Soft beeswax could close the gap around the rim.':'The orchard hive has loose wax below its entrance.',
  flags.waxTaken?'SEAL JAR WITH WAX.':'Near the orchard hive, TAKE WAX; then SEAL JAR WITH WAX.');
 return hints;
}
function helpText(level=0){
 if(swimState.active)return 'Use the arrow keys to swim back to the bank you fell from, or type SWIM TO SHORE. The current prevents crossing to the opposite bank. You have only five seconds of active play.';
 if(flags.voiceReturned)return flags.voiceArrivalSeen?'Merrin has his voice back. His song is about to begin.':'The freed voice is heading back to Merrin. Follow it toward the royal garden.';
 const choices=roomHintChoices();
 if(!choices.length){
  const onward=[
   'The garden paths lead into the castle courtyard and east to the orchard.',
   'The stairs on the right lead up to the belfry. Other parts of the voice\'s journey lie beyond the castle.',
   'You have gathered the useful supplies here. The orchard and the stream offer places to use them.',
   'The cleared eastern path leads onward; the western path returns to the garden.',
   'The mill and the grotto offer different leads on either bank of the stream.',
   'The jar is yours now. A still pool waits in the grotto beyond the stream.',
   'The pool has done what it can for this echo. The castle may offer a way to strengthen it.',
   'The belfry is ready for a voice to answer its strings. The old gallery book describes where an echo can be found.',
   'The courtyard connects the garden, workshop and gallery.'
  ];
  return onward[room];
 }
 const key=room+':'+choices.map(h=>h.id).join('|');
 if(key!==hintSessionKey){hintSessionKey=key;hintSessionIndex=-1}
 if(level===0||hintSessionIndex<0)hintSessionIndex=(hintSessionIndex+1)%choices.length;
 const hint=choices[hintSessionIndex].steps[Math.max(0,Math.min(2,level))];
 return hint+(level===0?'\n\n'+(choices.length>1?'Ask again for another local lead. ':'')+'HINT MORE gives a stronger nudge; HINT COMMAND gives exact wording.':level===1?'\n\nHINT COMMAND gives exact wording.':'');
}
const SAVE_KEY='stolen-voice-agi-save-v2',SAVE_BACKUP_KEY=SAVE_KEY+'-backup';let memorySave='',memoryBackup='';
function saveGame(){
 if(beeStingInProgress())return;
 if(hiveDisaster)return;
 if(millSluiceReleaseFrame>=0)return;
 if(bridgeFall){say('Wait until Elara has landed before saving.');return}
 const pendingMirrorQuestion=storyAction?.kind==='voiceOffered',pendingDeparture=storyAction?.kind==='voiceFollow'&&room===1&&popupOpen&&!flags.voiceDepartureSeen;
 if(storyAction&&!(storyAction.kind==='voiceFollow'&&popupOpen))finishStoryEffect(false);
 if(bellAction){say(bellAction.stage==='jar'?'Wait until the bell note fades before saving.':'Wait until Elara has landed before saving.');return}
 if(swimState.active){say('You cannot save while struggling in the current.');return}
 const raw=JSON.stringify({version:2,game:'stolen-voice-expanded',room,flags,player,merrinMemory:savedMerrinMemory(),sluiceRevision:3,sluice:millSluiceTurns,harmony:harmonyWeights});
 if(!validAdventureSave(raw)){say('This moment cannot be saved yet. Finish the current action first.');return false}
 const stored=writeAdventureSave(raw);
 say(stored?'Your adventure is saved.':'Saved for this visit only. Use SAVE FILES to download a copy you can keep.');
 if(pendingDeparture)agiMessagePages.push(AgiMessageWindow.wrap(voiceReleaseText));
 if(pendingMirrorQuestion)agiMessagePages.push(AgiMessageWindow.wrap('The mirror whispers: \"Whose voice was it?\"'));
 return raw;
}
function validateAdventureSave(raw){
  const saved=decodeSaveFile(raw);
  if(!saved||typeof saved!=='object'||Array.isArray(saved)||!saved.flags||typeof saved.flags!=='object'||Array.isArray(saved.flags))throw Error('invalid save');
  const migrating=saved.version===1&&saved.game==='stolen-voice',nextMerrinMemory=readMerrinMemory(saved.merrinMemory);let nextFlags={...flagDefaults},nextRoom=saved.room;
  if(migrating&&saved.version===1&&saved.game==='stolen-voice'){
   if(![0,1].includes(saved.room)||!saved.flags)throw Error('invalid earlier save');
   for(const key of ['rose','bell','mirrorAwake'])nextFlags[key]=saved.flags[key]===true;
   if(nextFlags.bell)nextFlags.rose=true;
  }else{
   if(saved.version!==2||saved.game!=='stolen-voice-expanded'||!Number.isInteger(saved.room)||!roomLayouts[saved.room]||!saved.flags||Array.isArray(saved.flags))throw Error('invalid save');
   const legacyWorkshop=saved.room===2||['oilTaken','twineTaken','plankTaken','shearsTaken'].some(k=>saved.flags[k]===true);
   for(const key of Object.keys(flagDefaults)){if(['barrelOpen','manureSoiled'].includes(key)&&saved.flags[key]===undefined)continue;if(key==='inventoryCheat'&&saved.flags[key]===undefined)continue;if(key==='bridgePlankSlipped'&&saved.flags[key]===undefined)continue;if(['hiveWaxOne','hiveWaxTwo'].includes(key)&&saved.flags[key]===undefined){nextFlags[key]=false;continue}if(['voiceDepartureSeen','voiceCourtyardSeen'].includes(key)&&saved.flags[key]===undefined){nextFlags[key]=saved.flags.voiceArrivalSeen===true||saved.flags.complete===true;continue}if(['workshopKey','workshopUnlocked','workshopOpen'].includes(key)&&saved.flags[key]===undefined){nextFlags[key]=key==='workshopKey'?(legacyWorkshop||saved.flags.roseGiven===true):legacyWorkshop;continue}if(key==='harmonyTuned'&&saved.flags[key]===undefined){nextFlags[key]=saved.flags.bellRung===true;continue}if(key==='wheelUnlocked'&&saved.flags[key]===undefined){nextFlags[key]=saved.flags.wheelTurned===true;continue}if(key==='roseGiven'&&saved.flags[key]===undefined){nextFlags[key]=false;continue}if(key==='cabinetOpen'&&saved.flags[key]===undefined){nextFlags[key]=saved.flags.wheelTurned===true;continue}if(key==='poolRiddleSolved'&&saved.flags[key]===undefined){nextFlags[key]=saved.flags.poolAwake===true;continue}if(key==='voiceArrivalSeen'&&saved.flags[key]===undefined){nextFlags.voiceArrivalSeen=saved.flags.complete===true;continue}if(key==='bookOpen'&&saved.flags[key]===undefined){nextFlags.bookOpen=saved.flags.readBook===true;continue}if(typeof saved.flags[key]!=='boolean')throw Error('invalid flag');nextFlags[key]=saved.flags[key]}
  }
  const prerequisites={workshopOpen:['workshopUnlocked'],roseGiven:['rose'],shearsReady:['oilTaken','shearsTaken'],thornsCut:['shearsReady'],bridgePlank:['plankTaken'],bridgeFixed:['bridgePlank','twineTaken'],wheelOiled:['oilTaken'],wheelUnlocked:[],wheelTurned:['wheelUnlocked'],cabinetOpen:['wheelTurned'],jarTaken:['wheelTurned'],poolAwake:['bell'],poolRiddleSolved:['poolAwake'],echoNamed:['poolAwake','poolRiddleSolved'],echoCaught:['echoNamed','jarTaken'],jarSealed:['echoCaught','waxTaken'],ropeFixed:['twineTaken'],harmonyTuned:['ropeFixed','jarSealed'],bellRung:['ropeFixed','jarSealed','bell'],mirrorAwake:['bell'],voiceOffered:['bellRung','mirrorAwake'],voiceReturned:['voiceOffered'],complete:['voiceReturned'],voiceArrivalSeen:['voiceReturned']};
  for(const [key,needs] of Object.entries(prerequisites))if(nextFlags[key]&&!(key==='jarTaken'&&nextFlags.inventoryCheat)&&needs.some(need=>!nextFlags[need]))throw Error('invalid progress');
  const nextTurns=(saved.sluiceRevision!==3||saved.sluice===undefined)?(nextFlags.wheelUnlocked?millSluiceSolved.slice():millSluiceInitial.slice()):saved.sluice;
  if(!validMillSluice(nextTurns))throw Error('invalid sluice');
  if(millSluiceFlow(nextTurns).solved!==nextFlags.wheelUnlocked)throw Error('inconsistent brake');
  // Saves made before automatic startup may have a released brake and idle wheel.
  if(nextFlags.wheelUnlocked)nextFlags.wheelTurned=true;
  if(nextFlags.bellRung)nextFlags.harmonyTuned=true;
  const nextHarmony=nextFlags.bellRung?harmonySolution.slice():saved.harmony===undefined?(nextFlags.harmonyTuned?harmonySolution.slice():harmonyInitial.slice()):saved.harmony;
  if(!validHarmony(nextHarmony))throw Error('invalid tuning weights');
  if(nextFlags.harmonyTuned&&!harmonyPitches(nextHarmony).every((p,i)=>p===harmonyPitches(harmonySolution)[i]))throw Error('inconsistent harmony');
  const nextPlayer={x:Number.isFinite(saved.player?.x)?saved.player.x:roomLayouts[nextRoom].spawn[0],y:Number.isFinite(saved.player?.y)?saved.player.y:roomLayouts[nextRoom].spawn[1],step:Number.isInteger(saved.player?.step)&&saved.player.step>=0?saved.player.step%4:1,facing:['front','back','left','right'].includes(saved.player?.facing)?saved.player.facing:'front'};
  const oldFlags=flags;flags=nextFlags;
  try{
  if(nextRoom===4&&nextFlags.bridgeFixed&&nextPlayer.x>=141&&nextPlayer.x<=179&&nextPlayer.y>=158&&nextPlayer.y<=181&&!canStand(nextPlayer.x,nextPlayer.y,nextRoom)&&canStand(nextPlayer.x,162,nextRoom))nextPlayer.y=162;
  if(!canStand(nextPlayer.x,nextPlayer.y,nextRoom)){const spawn=roomLayouts[nextRoom].spawn;nextPlayer.x=spawn[0];nextPlayer.y=spawn[1]}
  }finally{flags=oldFlags}
  return{nextRoom,nextFlags,nextTurns,nextHarmony,nextPlayer,nextMerrinMemory,migrating};
}
function validAdventureSave(raw){try{validateAdventureSave(raw);return true}catch{return false}}
function applyAdventureSave(raw,source='browser'){
 let state;
 try{state=validateAdventureSave(raw)}catch{say('That saved adventure could not be read. Your current quest is unchanged.');return false}
 const {nextRoom,nextFlags,nextTurns,nextHarmony,nextPlayer,nextMerrinMemory,migrating}=state;
 stopWalking();closeMessage(false);
  resetHarmony();harmonyWeights=nextHarmony.slice();if(millSluiceOpen)closeMillSluice();millSluiceTurns=nextTurns.slice();resetMillSluiceControls();resetSwimming();resetHiveDisaster();resetBookAnimation();resetBellPull();resetStoryEffect();resetMillCabinet();resetWorkshopDoor();room=nextRoom;flags=nextFlags;merrinMemories=nextMerrinMemory;if(flags.bridgeFixed||!flags.bridgePlank)flags.bridgePlankSlipped=false;player=nextPlayer;scored={};score=0;
  for(const key of Object.keys(eventPoints))if(flags[key])award(key,eventPoints[key]);
  syncInventory();selected='';exitLatch=false;
  if(source==='file'&&memorySave&&validAdventureSave(memorySave))memoryBackup=memorySave;
  memorySave=JSON.stringify({version:2,game:'stolen-voice-expanded',room,flags,player,merrinMemory:savedMerrinMemory(),sluiceRevision:3,sluice:millSluiceTurns,harmony:harmonyWeights});
  const stored=source==='file'||source==='backup'?writeAdventureSave(memorySave):true;
  draw();if(flags.complete)finishGame();else{maybeVoiceArrival();say(migrating?'Your earlier belongings and progress are restored. The adventure continues.':source==='file'?'Your save file is restored.'+(stored?'':' Browser storage is unavailable; keep your save file.'):source==='backup'?'Your backup adventure is restored.':'Your saved adventure is restored.');if(flags.voiceReturned&&!flags.voiceArrivalSeen&&!flags.voiceDepartureSeen&&room===1)agiMessagePages.push(AgiMessageWindow.wrap(voiceReleaseText));}
 return true;
}
function restoreGame(){
 if(beeStingInProgress())return false;
 const primary=memorySave||readStoredSave(SAVE_KEY),backup=memoryBackup||readStoredSave(SAVE_BACKUP_KEY),earlier=readStoredSave('stolen-voice-agi-save-v1');
 for(const [raw,source]of [[primary,'browser'],[backup,'backup'],[earlier,'browser']])if(raw&&validAdventureSave(raw))return applyAdventureSave(raw,source);
 say(primary||backup||earlier?'That saved adventure could not be read. Your current quest is unchanged.':'There is no saved adventure yet.');return false;
}
function restoreBackupGame(){
 if(beeStingInProgress())return false;
 const raw=memoryBackup||readStoredSave(SAVE_BACKUP_KEY);
 if(!raw){say('There is no previous save to recover yet.');return false}
 return applyAdventureSave(raw,'backup');
}

function finishGame(){
 if(orchardBeeTimer)clearInterval(orchardBeeTimer);orchardBeeTimer=0;
 const firstCompletion=!flags.complete;
 if(!flags.complete)progress('complete');
 playing=false;resetHarmony();if(titleTimer){clearInterval(titleTimer);titleTimer=0}closeMessage(false);stopWalking();resetBookAnimation();resetMillCabinet();resetWorkshopDoor();resetBellPull();resetStoryEffect();stopOpeningJingle();
 if(animationTimer){clearInterval(animationTimer);animationTimer=0}
 c.tabIndex=-1;document.querySelector('.hud').inert=true;document.querySelector('.footer').inert=true;draw();
 if(document.querySelector('.screen>.overlay[aria-modal="true"]'))return;
 const end=document.createElement('div');end.className='overlay';end.tabIndex=-1;end.setAttribute('role','dialog');end.setAttribute('aria-modal','true');end.setAttribute('aria-label','Adventure complete');
 end.innerHTML='<div class="agi-ending-window"><canvas id="ending-picture" aria-hidden="true"></canvas></div><span class="sr-only">Merrin sings joyfully: '+merrinEndingLyrics.join(' ')+(merrinFinalMemory()?' '+merrinFinalMemory():'')+' THE END. Score '+score+' of '+MAX_SCORE+'. Press Enter to play again.</span>';
 document.querySelector('.screen').append(end);
 const panel=end.querySelector('.agi-ending-window');
 panel.style.position='absolute';panel.style.inset='0';panel.style.width='100%';panel.style.height='100%';panel.style.maxWidth='none';
 const canvas=end.querySelector('#ending-picture');canvas.style.width='100%';canvas.style.height='100%';canvas.style.imageRendering='pixelated';canvas.style.display='block';
 startMerrinEnding(canvas,firstCompletion);
 end.addEventListener('click',advanceMerrinEnding);end.focus();
}

// Inventory-only testing; mark it so a jar obtained early can be restored.
function testingInventory(){
 stopWalking();flags.inventoryCheat=true;
 for(const key of ['rose','workshopKey','bell','oilTaken','twineTaken','plankTaken','shearsTaken','waxTaken','jarTaken'])flags[key]=true;
 selected='';syncInventory();draw();
 say('XYZZY INVENTORY! Your satchel holds every available item. Items already given away or used in repairs stay where you put them. Puzzles, position and saved game are unchanged.');
}

// Deliberate testing shortcut: rebuild a consistent pre-finale checkpoint.
function testingXyzzy(){
 stopWalking();resetHarmony();resetSwimming();resetHiveDisaster();resetBookAnimation();resetBellPull();resetStoryEffect();resetMillCabinet();resetWorkshopDoor();
 if(millSluiceOpen)closeMillSluice();
 flags=Object.fromEntries(Object.keys(flagDefaults).map(key=>[key,true]));
 for(const key of ['voiceOffered','voiceReturned','complete','voiceArrivalSeen','voiceDepartureSeen','voiceCourtyardSeen','bridgePlankSlipped'])flags[key]=false;
 millSluiceTurns=millSluiceSolved.slice();resetMillSluiceControls();harmonyWeights=harmonySolution.slice();
 scored={};score=0;for(const key of Object.keys(eventPoints))if(flags[key])award(key,eventPoints[key]);
 selected='';syncInventory();changeRoom(1,[160,213],'back');
 say('XYZZY! Testing checkpoint: the puzzles are solved and the voice jar is sealed. Approach the mirror and SHOW JAR TO MIRROR. Your saved game has not been changed.');
}

// Local puzzle-only shortcut. It follows the normal gates and reward animations.
function testingPuzzleSkip(){
 if(room===5){
  showMillSluice();if(!millSluiceOpen)return;
  millSluiceTurns=millSluiceSolved.slice();resetMillSluiceControls();
  celebrateMillSluice();paintMillSluice();return;
 }
 if(room===7){
  showHarmony();if(!harmonyOpen)return;
  harmonyHelp=false;harmonyWeights=harmonySolution.slice();celebrateHarmony();return;
 }
 if(room===6){handleHumanIntent('answer echo');return}
 say('Puzzle testing: use XYZZY PUZZLES beside the mill sluice, the awakened pool, or the belfry instrument. It solves only that puzzle; you keep playing from here.');
}
