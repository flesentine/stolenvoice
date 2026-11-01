// State-aware observations shared by LOOK, LISTEN and alternative verbs.
function jarDescription(){
 if(flags.voiceReturned)return 'The glass jar is empty again. The broken wax around its lip is all that remains of its borrowed voice.';
 if(flags.bellRung)return 'From inside the sealed jar, Merrin\'s unmistakable voice grumbles at the cramped accommodations.';
 if(flags.jarSealed)return 'The wax has hardened over the mouth. The small voice within repeats itself, thin and distant.';
 if(flags.echoCaught)return 'Merrin\'s name whispers inside the jar. Each time you move it, a faint syllable escapes through the open mouth.';
 return 'An empty glass measuring jar with a broad, open mouth and worn measure marks. A pale blue glint follows the curve of its sides.';
}
function jarSound(){
 if(flags.voiceReturned)return 'The jar is silent. Merrin\'s voice has gone home; only hollow glass remains.';
 if(flags.bellRung)return '\"A little more elbow room, please!\" Merrin\'s unmistakable voice grumbles from inside the jar.';
 if(flags.jarSealed)return 'A thin, muffled voice repeats Merrin\'s name behind the wax seal.';
 if(flags.echoCaught)return 'Merrin\'s name whispers from the jar. A faint syllable slips through its open mouth.';
 return 'The empty jar gives back only a hollow little ring.';
}
function grottoSound(){
 if(flags.echoCaught)return 'Water drips beneath the vault. The repeating name has gone, and the pool is quiet again.';
 if(flags.echoNamed)return 'Merrin\'s name returns from the pool, again and again, with no mouth to speak it.';
 if(flags.poolAwake&&!flags.poolRiddleSolved)return 'The pool asks: "No tongue, yet I reply; no wings, yet I can fly. Speak, and I speak too. Be still, and I am through. What am I?"';
 if(flags.poolAwake)return 'Even your breath returns as a faint silver whisper above the water.';
 return 'A drop falls somewhere in the dark. No echo follows it.';
}
function exteriorWheelDescription(){return flags.wheelTurned?'The wooden paddles turn through the mill race. Their axle disappears into the stone wall.':'The wooden paddles stand motionless above the rushing mill race. Their axle disappears into the stone wall.'}
function objectIsHere(id){
 return own(id)||!!hotspots[room][id]||!!sceneryDescription(id)||(room===4&&id==='wheel');
}
function listenAt(requested=''){
 const id=objectId(requested);
 if(flags.voiceReturned&&!flags.voiceArrivalSeen&&(!requested||['voice','man'].includes(id))){say('A warm murmur drifts along with the golden light. The voice is on its way back to Merrin.');return}
 if(requested){
  if(id==='voice'){say(flags.voiceReturned?(room===0?'Merrin hums happily, enjoying the sound of his own voice.':'Merrin\'s voice is back with him in the royal garden.'):'Merrin\'s voice has been stolen. A tiny bell chime has taken its place.');return}
  if(id==='jar'){say(flags.jarTaken?jarSound():room===5&&flags.cabinetOpen?'The jar in the cabinet is quite silent.':'You do not hear a jar here.');return}
  if(id==='pool'&&room===6){say(grottoSound());return}
  if(['pool','stream','moat'].includes(id)&&[0,4,5].includes(room)){say(room===0?'The moat water laps quietly beneath the drawbridge.':'The stream rushes past the banks and through the mill race.');return}
  if(id==='man'){if(room!==0){say('Merrin is in the royal garden.');return}say(flags.voiceReturned?'Merrin hums happily, enjoying the sound of his own voice.':'Merrin tries to speak. A tiny, frustrated bell chimes instead.');return}
  if(id==='mirror'&&room===1){say(flags.voiceReturned?'Only the soft hiss of the candles disturbs the quiet glass.':flags.voiceOffered?'The mirror whispers, \"Whose voice was it?\", then waits for your answer.':flags.mirrorAwake?'A voice murmurs behind the silver mist, as though speaking in a dream.':'A faint murmur comes from somewhere deep behind the glass.');return}
  if(id==='wheel'&&[4,5].includes(room)){say(flags.wheelTurned?'The wooden wheel creaks steadily above the rush of water.':'Water rushes past the motionless wheel. Its wooden spokes are silent.');return}
  if(id==='bell'&&[0,7].includes(room)){say('The bell is quiet now. The air around it holds the faintest hum.');return}
  if(!objectIsHere(id)){say('You do not hear '+noun(requested)+' here.');return}
  say('You listen closely. The '+noun(requested)+' makes no sound.');return;
 }
 say(room===6?grottoSound():room===5?(flags.wheelTurned?'The wheel creaks steadily above the rush of water.':'Water rushes below the mill. The wooden machinery is silent.'):room===7?'Wind passes through the high windows. A timber creaks overhead.':worldBirdsHere()?'Birdsong answers the restored high bell above the distant water.':[0,3,4,8].includes(room)?'Leaves and distant water fill the air.':'The old room is quiet around you.');
}

function merrinGiftRefusal(item){
 const label={clapper:'little silver bell',oil:'oil flask',twine:'twine',plank:'wooden plank',shears:'pruning shears',wax:'beeswax',jar:flags.voiceReturned?'empty jar':flags.bellRung?'voice jar':flags.echoCaught?'echo jar':'glass jar'}[item]||'offering';
 if(flags.voiceReturned)return 'Merrin raises a hand. "No, thank you. I have no use for the '+label+' just now." You keep it in your satchel.';
 const response={
  clapper:'Merrin holds up a palm at the little bell, then touches his throat with a weary smile. He has quite enough ringing to contend with already.',
  oil:'Merrin glances at the oily spout and folds his clean hands behind his back. He shakes his head.',
  twine:'Merrin looks at the coil, then gently pushes your hand back toward your satchel. He shakes his head.',
  plank:'Merrin raises both palms and steps back from the plank. Apparently he has no carpentry planned.',
  shears:'Merrin keeps his hands behind his back and shakes his head at the shears.',
  wax:'Merrin rubs two fingers together, considers the sticky wax, and politely shakes his head.',
  jar:flags.echoCaught?'Merrin listens closely to the jar, then points to his throat and shakes his head. He leaves the glass in your hands.':'Merrin peers into the empty jar, then shakes his head and waves it gently away.'
 }[item]||'Merrin raises a hand and politely shakes his head at your offering.';
 return response+' He does not want the '+label+'. You keep it.';
}

// Inventory browsing and parser LOOK share these state-aware descriptions.
function inventoryItemDescription(id){
 const text={key:'A small brass key with a worn bow and two square teeth. Merrin gave you the key to his potting shed.',rose:'The red petals have a gentle perfume. It is a flower, not much of a tool.',clapper:'A little silver handbell with a worn wooden handle. Its clapper is fastened inside. A gentle shake gives a clear, lingering note.',oil:'A blue flask with a narrow spout. A bead of dark oil gathers at its tip.',twine:'A tightly wound coil of twine. The dry strands are rough against your fingers, but hold firm when pulled.',plank:'A straight oak plank with a dark knot near one end. It feels solid beneath your hands.',shears:flags.shearsReady?'The shears open and close cleanly. Their blades meet with a satisfying snip.':'Rust cakes the pivot of the old pruning shears. The handles scarcely move.',wax:'Golden beeswax with a lingering smell of honey. It softens between your fingers and clings to them.',jar:jarDescription()};
 return text[id]||'';
}
