function norm(t){return t.toLowerCase().replace(/[.,!?'"’]/g,'').replace(/\s+/g,' ').trim()}
const objectAliases={
 key:['key','workshop key','shed key','brass key','small key','merrins key'],
 man:['man','old man','person','guy','fellow','gardener','old gardener','merrin'],
 rose:['rose','flower','rose stem','stem'],clapper:['clapper','silver clapper','bell clapper','handbell','hand bell','little silver bell','small bell','small silver bell','portable bell'],
 bell:['bell','little bell','garden bell','silver bell','high bell','tower bell','great bell'],mirror:['mirror','glass','royal mirror','enchanted mirror','gallery mirror'],
 book:['book','old book','volume','almanac','spellbook','book of enchantments','book cover','cover of the book','cover of book'],
 oil:['oil','flask','oil flask','bottle','oil bottle'],twine:['twine','string','coil','coil of twine','cord','strong twine','length of twine','piece of twine','length of string','piece of string','ball of twine','ball of string'],
 plank:['plank','wood','board','wooden plank','woodpile','wood pile','boards','planks','board of wood','piece of wood','wooden board','oak plank','oak board','spare plank','spare board','lumber','timber'],
 shears:['shears','blades','rusty shears','sharp shears','pruning shears','working shears','scissors','pruners'],wax:['wax','beeswax','hive','beehive','abandoned hive','honeycomb','wax chips','wax flakes','beeswax flakes','loose wax','chips of wax','chips of beeswax'],
 jar:['jar','glass jar','measuring jar','glass measure','glass measuring jar','empty jar','echo jar','sealed jar','sealed echo','voice jar','bottled echo','vessel','voice','borrowed voice','merrins voice'],
 thorns:['thorns','thorn','blackthorn','brambles','thorn bush','bush'],bridge:['bridge','gap','broken bridge','footbridge','hole','bridge gap','gap in bridge','hole in bridge','missing boards','broken part of bridge'],
 wheel:['wheel','gear','gears','waterwheel','mill wheel','wooden wheel','mechanism'],cabinet:['cabinet','cupboard','catch','latch','cabinet door','cupboard door'],
 pool:['pool','water','still water','echo','echo pool','still pool','pool rim','rim of pool','rim of the pool','stone rim'],rope:['rope','bell rope','frayed rope','broken rope','sling','frayed bell rope','broken bell rope','damaged rope','bell pull','end of rope']
};
const noun=text=>text.replace(/\b(?:the|a|an)\s+/g,'').trim();
function objectId(text,preferVisible=false){const target=noun(text);if(room===0&&!flags.bell&&['handbell','hand bell','little silver bell','small bell','small silver bell','portable bell'].includes(target))return 'bell';if(['bell','little bell','garden bell','silver bell'].includes(target)&&flags.bell&&!(room===7&&target==='bell'))return 'clapper';if(['voice','borrowed voice','merrins voice'].includes(target))return flags.jarTaken&&!flags.voiceReturned?'jar':'voice';if(preferVisible&&target==='bottle'&&room===5&&flags.wheelTurned&&!flags.jarTaken)return 'jar';if(room===2&&['roots','root'].includes(target))return 'soil';if(room===8&&target==='left door')return 'shed';if(room===8&&target==='right door')return 'gallery';if(target==='rim')return room===6?'pool':room===0?'bell':target;if(['flower','flowers','garden flowers','flower bed','flowers in garden'].includes(target))return room===0?'rose':'flowers';if(room===0&&['roses','garden rose'].includes(target))return 'rose';return Object.keys(objectAliases).find(key=>objectAliases[key].includes(target))||sceneryId(target)}
function bridgePlankIntent(text){
 const isPlank=value=>objectId(value.replace(/\s+down$/,''))==='plank';
 const isBridge=value=>objectId(value)==='bridge';
 const placing=text.match(/^(?:put|place|lay|set|fit|insert|slide|position|use|add|drop)(?: down)? (.+?) (?:in|into|on|onto|across|over|to|inside) (.+)$/);
 if(placing&&isPlank(placing[1])&&isBridge(placing[2]))return true;
 const direct=text.match(/^(?:put|place|lay|set|fit|insert|slide|position|use|add|drop)(?: down)? (.+)$/);
 if(direct){const words=direct[1].split(' ');for(let i=1;i<words.length;i++)if(isPlank(words.slice(0,i).join(' '))&&isBridge(words.slice(i).join(' ')))return true}
 const repair=text.match(/^(?:fix|repair|mend|patch|build|rebuild|cover|fill|bridge) (.+?) (?:with|using) (.+)$/);
 if(repair&&isBridge(repair[1])&&isPlank(repair[2]))return true;
 const purpose=text.match(/^(?:use|using) (.+?) to (?:fix|repair|mend|patch|build|rebuild|cover|fill|bridge) (.+)$/);
 if(purpose&&isPlank(purpose[1])&&isBridge(purpose[2]))return true;
 const simpleRepair=text.match(/^(?:fix|repair|mend)(?: up)? (.+)$/);
 if(simpleRepair&&(isPlank(simpleRepair[1])||isBridge(simpleRepair[1])))return true;
 const short=text.match(/^(?:put|place|lay|set|fit|insert|position)(?: down)? (.+)$/);
 return room===4&&short&&isPlank(short[1]);
}
function bridgeBindingIntent(text){
 if(/^put (?:the )?(?:twine|string|cord) (?:the )?(?:bridge|plank|board)$/.test(text))return true;
 const target=value=>{
  value=noun(value).replace(/^(?:both )?ends? of /,'').replace(/ (?:down|in place|ends?)$/,'');
  const parts=value.split(/ (?:to|onto|on) /);
  return parts.every(part=>['plank','bridge'].includes(objectId(part)));
 };
 const tool=value=>objectId(value)==='twine'||(room===4&&noun(value)==='rope');
 const verb='(?:tie|lash|bind|secure|fasten|reinforce|tether|anchor|strap|stabilize|fix|repair|mend|attach)';
 let match=text.match(new RegExp('^'+verb+'(?: down| up)? (.+?) (?:with|using) (.+)$'));
 if(match&&target(match[1])&&tool(match[2]))return true;
 match=text.match(/^(?:use|tie|lash|bind|wrap|wind|loop|attach|fasten|put) (.+?) (?:around|round|to|on|onto|over|across|under) (.+)$/);
 if(match&&tool(match[1])&&target(match[2]))return true;
 match=text.match(new RegExp('^(?:use|using) (.+?) to '+verb+'(?: down| up)? (.+)$'));
 if(match&&tool(match[1])&&target(match[2]))return true;
 // General repairs only place/reseat the board. Binding requires a tying
 // intention or an explicitly named twine/string tool above.
 match=text.match(/^(?:tie|lash|bind|secure|fasten|reinforce|tether|anchor|strap|stabilize|attach)(?: down| up)? (.+)$/);
 if(match&&target(match[1]))return true;
 return room===4&&/^(?:use|tie|wrap|attach) (.+)$/.test(text)&&tool(text.replace(/^(?:use|tie|wrap|attach) /,''));
}
function ropeRepairIntent(text){
 const repair='(?:fix|repair|mend|patch|bind|tie|lash|splice|reinforce|strengthen|secure)';
 const isRope=value=>['rope','bell'].includes(objectId(value));
 const isTwine=value=>objectId(value)==='twine';
 const targetFirst=text.match(new RegExp('^'+repair+'(?: up)? (.+?) (?:with|using) (.+)$'));
 if(targetFirst&&isRope(targetFirst[1])&&isTwine(targetFirst[2]))return true;
 const toolFirst=text.match(/^(?:use|tie|bind|wrap|wind|loop|attach|fasten|lash|splice) (.+?) (?:on|onto|to|around|round|about|over|with) (.+)$/);
 if(toolFirst&&isTwine(toolFirst[1])&&isRope(toolFirst[2]))return true;
 const purpose=text.match(new RegExp('^(?:use|using) (.+?) to '+repair+' (.+)$'));
 if(purpose&&isTwine(purpose[1])&&isRope(purpose[2]))return true;
 const short=text.match(new RegExp('^'+repair+'(?: up)? (.+)$'));
 if(short&&objectId(short[1])==='rope')return true;
 return room===7&&/^(?:use|tie|wrap|attach) (.+)$/.test(text)&&isTwine(text.replace(/^(?:use|tie|wrap|attach) /,''));
}
function own(id){return({apple:flags.appleCarried,key:hasWorkshopKey(),rose:flags.rose&&!flags.roseGiven,clapper:flags.bell,oil:flags.oilTaken,twine:flags.twineTaken,plank:flags.plankTaken&&!flags.bridgePlank,shears:flags.shearsTaken,wax:flags.waxTaken&&!flags.jarSealed,jar:flags.jarTaken})[id]===true}
function describeRoom(){
 return[
  (flags.voiceArrivalSeen?'Merrin hums happily beside the winding path. ':'Merrin waits beside the winding path. ')+(flags.rose?(flags.roseGiven?'The red rose brightens Merrin\'s coat. ':'The red rose you picked is in your satchel. '):'A red rose grows beside the path. ')+(flags.bell?'An empty bell peg remains on the orchard gatepost. ':'A little silver bell hangs from the orchard gatepost. ')+'Red roofs and fluttering pennants rise above the castle moat.',
  'Blue and gold banners frame '+(flags.voiceReturned?'a quiet silver mirror. ':flags.mirrorAwake?'a softly murmuring mirror. ':'an elaborate mirror. ')+'The Book of Enchantments rests '+(flags.bookOpen?'open':'closed')+' on a carved table beside the purple carpet.',
  shedBenchContents()+' '+shedBoardsDescription()+' Pots and hanging tools fill Merrin\'s little workshop.',
  'Red apples brighten the old trees. Bees circle a straw hive on a stump. '+(flags.waxTaken?'': 'Loose beeswax rests on its landing shelf. ')+(flags.thornsCut?'Freshly cut blackthorn lies beside the path.':'A thick tangle of blackthorn chokes the path.'),
  flags.bridgeFixed?'The repaired footbridge spans the rushing stream. The old mill nestles among the trees; across the water, a path climbs to a dark grotto in the cliff.':flags.bridgePlank?'A new plank spans the gap in the footbridge, its ends resting on solid timbers. Water rushes past the old mill. Across the stream, a path climbs toward a dark grotto in the cliff.':'Two missing boards leave a gap in the footbridge. Water rushes past the old mill; across the stream, a path climbs to a dark grotto in the cliff.',
  'Water glints beneath the mill machinery. '+(flags.wheelUnlocked?'A full counterweight bucket holds the wheel brake clear. ':'Water spills from a tray of carved trough blocks. A rope links its empty bucket to the wheel brake. Its wooden panel has shallow trough blocks and worn finger grips. ')+(flags.wheelTurned?(millAction==='hoist'?'The grain hoist is lifting its heavy sack.':'A grain sack hangs safely at the loft beam.'): 'A loaded grain sack blocks a wooden cupboard. Its hoist rope runs back to the great wheel.')+' '+(flags.cabinetOpen?(flags.jarTaken?'The cupboard stands open, its measuring shelf empty.':'An empty glass measuring jar stands in the open cupboard.'):'The cupboard door is closed.'),
  flags.echoCaught?'The pool is quiet beneath the stone vault. Pale mineral seams catch the light.':flags.poolAwake&&!flags.poolRiddleSolved?'Silver words shimmer on the pool. A voice asks a question, then waits for your reply.':flags.echoNamed?'Merrin\'s name repeats above the perfectly still pool. Pale mineral seams catch the light beneath the stone vault.':'A perfectly still pool rests beneath the stone vault. Pale mineral seams catch the light. Every sound seems to wait before answering.',
  'A high brass bell hangs between oak beams. '+(flags.ropeFixed?'Fresh twine binds its short rope.':'Its short rope is badly frayed.')+' An oak string instrument hangs beside the bell, its strings stretched over a shared bridge to three brass weights. Beyond the deep windows lie the fields and hills of Alderwick.',
  'Ivy softens the castle walls. '+(flags.workshopOpen?'The workshop door stands open. ':'The workshop door is closed. ')+'A timber-framed potting shed faces a grand stone arch hung with royal banners. Flowers brighten a raised planter between them.'
 ][room];
}
function describeObject(id,requested=''){
 if(room===6&&['name','merrin','letters','word','words','floating name','floating letters','silver letters','merrins name','echo'].includes(noun(requested))){
  if(flags.echoCaught){say(flags.voiceReturned?'The letters have vanished. The pool has nothing more of Merrin to repeat.':flags.jarSealed?'The letters have vanished from above the water. Their repeating syllables are sealed inside your jar.':'The letters have vanished from above the water. A thin repetition of Merrin\'s name curls from the open jar.');return}
  if(flags.echoNamed){say('Pale mist gathers into the letters MERRIN, then loosens into curling wisps. His name repeats in the same borrowed tone each time. The sound seems to hang in the air just above the water.');return}
  if(flags.poolAwake&&!flags.poolRiddleSolved){say('Silver writing shimmers on the water. It is a question, waiting for an answer; no name has formed above it yet.');return}
  say(flags.poolRiddleSolved?'No name has formed above the pool yet. The water seems to listen for the person whose voice is missing.':'No letters hang above the silent pool. Merrin himself is back in the royal garden.');return;
 }

 if(id==='voice'){if(flags.voiceReturned&&!flags.voiceArrivalSeen){say('The freed voice is making its way back to Merrin. A golden wisp leads toward the garden.');return}say(flags.voiceReturned?'Merrin has his voice back. The borrowed sound is no longer in the glass.':'Merrin cannot speak; a little bell chime has taken the place of his voice.');return}
 if(id==='wax'&&room===3&&/hive/.test(requested)){say(flags.waxTaken?'Rounded coils of woven straw form an old dome-shaped hive. Bees come and go through its little entrance. You have gathered the loose wax beneath it.':'A straw skep rests on the stump, its tightly bound coils sheltering the bees. They weave separate circuits past its little entrance. Loose wax rests on the landing shelf.');return}
 if(id==='man'){say(room===0?(flags.voiceArrivalSeen?'Merrin pats his throat and smiles. He looks as though he has a great deal to say.':'Merrin opens his mouth. A tiny bell chimes instead of words. He touches his throat, then points anxiously at the castle. '+(hasWorkshopKey()?'The rose brightens his coat; he seems easier in your company.':'A brass key hangs at his belt; his hand rests protectively over it.')):'Merrin is in the royal garden.');return}
 if(own(id)){

  showInventoryDescription(id,inventoryItemDescription(id));return;
 }
 const descriptions=[
  {bell:flags.bell?'The orchard gatepost has an empty peg; the little silver bell is in your satchel.':"A little silver bell hangs by its wooden handle beside the open orchard gate. Visitors ring it to call Merrin from the orchard or potting shed. The handle is polished smooth by many hands.",rose:flags.roseGiven?'Your rose brightens Merrin\'s coat. He touches the petals with a shy smile.':flags.rose?'Only a few green leaves remain where you picked the rose.':'A red rose grows beside the path. Its petals smell faintly sweet.'},
  {mirror:flags.voiceReturned?'The mirror is quiet. It has returned what it borrowed.':flags.voiceOffered?'The jar and its reflection shimmer together. The mirror waits: \"Whose voice was it?\"':flags.mirrorAwake?'The mirror whispers: "I borrowed a voice, little princess. Not its shadow."':'Something murmurs behind the silver mist. Your reflection moves, but its lips do not quite follow yours.',book:flags.bookOpen?'The old book lies open, its yellowed pages crowded with careful handwriting.':'A heavy red book rests on the table, its covers closed.',rope:'The stairway at the right climbs to the castle belfry.'},
  {oil:'A small flask of oil rests on the bench.',twine:'A coil of strong twine hangs from the bench.',shears:'Rusty pruning shears lie on the bench.',plank:flags.plankTaken?'The remaining boards are split. You have already chosen the one sound plank.':'Several spare boards lean beside the workbench. One looks sound.'},
  {wax:flags.waxTaken?'Rounded coils of woven straw form an old dome-shaped hive. Bees come and go through its little entrance. You have gathered the loose wax beneath it.':'A straw skep rests on the stump, its tightly bound coils sheltering the bees. They weave separate circuits past its little entrance. Loose wax rests on the landing shelf.',thorns:flags.thornsCut?'A clean cut opens the path to the bridge.':'A dense tangle of woody blackthorn bars the path. Long hooked thorns catch at your sleeves.'},
  {wheel:exteriorWheelDescription(),bridge:flags.bridgeFixed?'The new plank is firmly lashed to the old timbers. It no longer shifts under your weight.':flags.bridgePlankSlipped?'The plank hangs crookedly from one timber. Its other end swings loose over the stream.':flags.bridgePlank?'The new plank rests across the gap. It rocks against the surviving timbers; the old lashings hang loose.':'Two center boards are missing. The surviving timbers are weathered but solid, with old lashings still wound around them.'},
  {wheel:flags.wheelTurned?'The wheel turns freely. A drive rope runs from its winding drum to the grain-hoist pulley.':flags.wheelUnlocked?'The counterweight has lifted the brake. The wheel gives a little when you lean against a spoke.':'A brake grips the wooden wheel. Beside it, wooden trough blocks sit in a sliding tray with two empty sockets and a fixed stone. Guide pegs keep each channel facing the same way. Water spills before reaching the hanging counterweight bucket. The trough blocks have worn finger grips.',cabinet:cabinetTimer?'The hoist or cupboard door is still moving.':flags.cabinetOpen?(flags.jarTaken?'The cupboard stands open. Its measuring shelf is empty.':'An ordinary oak cupboard stands open. A glass measuring jar waits on its shelf.'):flags.wheelTurned?'The raised sack leaves room for the cupboard door to swing open.':'A loaded grain sack presses against the cupboard door. The door is not locked, but it cannot swing past the sack.',jar:flags.cabinetOpen?'An empty glass measuring jar waits on the shelf. Pale marks record the miller\'s measures.':'The closed cupboard hides its contents.'},
  {pool:flags.echoCaught?(flags.voiceReturned?'The pool is still again. The borrowed voice has returned to Merrin.':'The pool is still again. Merrin\'s named echo has been gathered into glass.'):flags.echoNamed?'Merrin\'s name hangs over the water, returning again and again from no visible mouth.':flags.poolAwake&&!flags.poolRiddleSolved?'Silver letters float on the still water. A question waits for an answer. READ QUESTION or LISTEN.':flags.poolAwake?'The pool repeats your breath. Silver words ask: \"Whose voice is lost? Call that person by name.\"':'The water is perfectly still. Ordinary sounds fall strangely flat beneath the vault.'},
  {rope:flags.ropeFixed?'Fresh twine binds the frayed rope. The bell can be rung safely.':'The short bell rope has almost worn through. Pale fibers part under the slightest strain.',bell:flags.voiceReturned?'The brass is quiet now. Its work is done.':flags.bellRung?'The brass still trembles with a fading note. Something in your satchel answers in a familiar voice.':'A great brass bell hangs from the oak head beam. Beside it hangs the bell-keeper\'s oak psaltery. Three weighted strings share a wooden bridge; when the bell trembles, they answer.'},
  {}
 ];
 if(descriptions[room][id]){say(descriptions[room][id]);return}
 const scenery=sceneryDescription(id==='pool'&&[0,4,5].includes(room)?room===0?'moat':'stream':id);
 if(scenery){say(scenery);return}
 if(id==='window'){say('There is no window to look through here.');return}
 say('You do not see '+id+' here.');
}
function command(raw){
 if(beeStingInProgress())return;
 if(bridgeFall||storyAction?.kind==='hiveKick')return;
 if(storyAction?.kind==='voiceReturned')return;
 if(storyAction&&storyAction.kind!=='voiceFollow')finishStoryEffect(false);
 const t=norm(raw);if(!t||!playing||popupOpen||menuOpen||bellAction||workshopDoorMotion)return;
 if(speedCommand(t))return;
 if(t==='xyzzy inventory'){testingInventory();return}
 if(t==='xyzzy puzzles'||t==='skip puzzle'){testingPuzzleSkip();return}
 if(t==='xyzzy'){testingXyzzy();return}
 if(swimmingCommand(t))return;
 if(handleHiveDisaster(t))return;
 if(handleWorkshopIntent(t))return;
 if(handleMillSluiceIntent(t))return;
 if(handleHarmonyIntent(t))return;
 if(handleWindowJump(t))return;
 if(handleClimb(t))return;
 if(handleBookOpening(t))return;
 if(swimState.active&&!/^(?:look|examine|inspect|listen|l|x|inventory|inv|i|help|hint|save|restore|load)(?: |$)/.test(t)){say('You cannot manage that while keeping your head above water.');return}
 const hint=t.match(/^(?:help|hint)(?: (more|command))?$/);
 if(hint||t==='what can i do'){say(helpText(hint?.[1]==='command'?2:hint?.[1]==='more'?1:0));return}
 if(/^(?:save files|save file|manage saves)$/.test(t)){showSaveFiles();return}
 if(/^(?:export save|download save)$/.test(t)){downloadGameSave();return}
 if(/^(?:import save|open save file|load save file)$/.test(t)){chooseGameSave();return}
 if(/^(?:recover save|restore backup)$/.test(t)){restoreBackupGame();return}
 if(/^(save|save game)$/.test(t)){saveGame();return}
 if(/^(restore|load|restore game|load game)$/.test(t)){restoreGame();return}
 if(/^(inventory|inv|i|i have)$/.test(t)){showInventory();return}
 if(handleHumanIntent(t))return;
 if(handleBarrelPrank(t))return;
 if(handleAppleIntent(t))return;
 if(handlePlayfulIntent(t))return;
 if(handleOptionalSecret(t))return;
 if(handleSceneryReaction(t))return;
 if(handleAcceptedIntent(t))return;
 const look=t.match(/^(?:look(?:\s+(?:out of|up at|down at|out through|out|through|inside|into|underneath|beneath|under|behind|in|at))?|examine|inspect|l|x)(?:\s+(.*))?$/);
 if(look){let target=noun(look[1]||'');if(['up','ceiling above'].includes(target))target='ceiling';if(target==='down')target='floor';if(['out','outside'].includes(target)||(!target&&/^look (?:out|out of|out through|through)$/.test(t)))target='window';if(['','around','room','surroundings','here','screen'].includes(target))say(describeRoom());else if(['me','myself','self','elara','princess'].includes(target))say('You are Princess Elara. A stolen voice is reason enough to walk beyond the castle walls.');else describeObject(objectId(target,true),target);return}
 const read=t.match(/^read(?:\s+(.+))?$/);
 if(read){
  if(room===1&&(!read[1]||objectId(read[1])==='book')){if(!nearObject('book'))return;if(!flags.bookOpen){say('The red book is closed. Its covers conceal the writing.');return}if(bookAnimationTimer){say('Wait for the heavy cover to settle.');return}flags.readBook=true;playGameSound('bookReading');say(["Of Borrowed Voices", "", "Silver wakes the deep;", "The pool your words will keep.", "Call whose voice is gone;", "His name will linger on.", "Let hollow glass draw near;", "The name will gather here.", "Open lips let whispers fly;", "Honey's gold will bind a sigh.", "Let strings and glass agree;", "The bell shall set voice free.", "At mirror, silver ring;", "Then glass to glass you bring.", "To end the borrowed claim,", "Speak out the rightful name."]);agiMessagePages.push(AgiMessageWindow.wrap('A faded note mentions the old miller\'s experiments with echoes.'))}
  else say('You do not see a book here.');return;
 }
 const opening=t.match(/^(?:open|lift|raise|remove|take off|lift off|look under|look inside|look in)\s+(.+)$/);
 if(opening&&objectId(opening[1])==='barrel'){
  if(room!==2){say('You do not see a barrel here.');return}
  if(!nearObject('barrel'))return;
  handleBarrelPrank('open barrel');return;
 }
 const take=t.match(/^(?:take|get|pick(?:\s+up)?)\s+(.+)$/);
 if(take){
  const id=objectId(take[1],true);
  if(id==='wax'&&/^(?:the )?(?:abandoned )?(?:bee)?hive$/.test(take[1])){say(room===3?'The old straw hive would crumble if you lifted it. You leave it on its stump.':'You do not see a hive here.');return}
  if(own(id)){say('You already have that.');return}
  const pickups={rose:[0,'rose','You pick the rose carefully. Its petals keep their scent.'],oil:[2,'oilTaken','You take the little oil flask.'],twine:[2,'twineTaken','You take the coil of strong twine.'],plank:[2,'plankTaken','You choose one sound oak plank from the woodpile.'],shears:[2,'shearsTaken','You take the rusty pruning shears.'],wax:[3,'waxTaken','You collect a few dry beeswax flakes from the hive shelf.'],jar:[5,'jarTaken','You take the empty glass jar from the open cabinet.']};
  if(id==='clapper'){if(room===0&&!nearObject('bell'))return;say(room===0?'The clapper is fastened inside the little bell. You can lift the whole bell by its handle.':'You do not see a clapper here.');return}
  const pickup=pickups[id];
  if(!pickup||pickup[0]!==room){say(takeRefusal(id,take[1]));return}
  if(flags[pickup[1]]){if(id==='wax'&&flags.voiceReturned){say('The wax you used remains as a broken ring around the empty jar.');return}say(id==='wax'&&flags.jarSealed?'The wax you gathered has hardened around the jar\'s mouth.':'You have already gathered the loose '+(id==='plank'?'wood':id)+' from here.');return}
  if(id==='jar'&&cabinetTimer){say('The heavy door is still swinging. You wait for it to settle clear of the shelf.');return}
  if(id==='jar'&&!flags.cabinetOpen){say('The jar is inside the cupboard. You must open its wooden door first.');return}
  if(!nearObject(id))return;
  if(id==='wax'){showHive();return}
  progress(pickup[1],pickup[2]);return;
 }
 if(ropeRepairIntent(t)){if(room!==7)say('There is no bell rope to mend here.');else useObject('twine','rope');return}
 if(bridgePlankIntent(t)){if(room!==4)say('There is no bridge here.');else useObject('plank','bridge');return}
 let item,target;
 const use=t.match(/^(?:use|put|place|apply|touch|strike)\s+(.+?)\s+(?:on|in|into|to|against|with)\s+(.+)$/);
 const withTool=t.match(/^(?:cut|mend|repair|tie|lash|seal)\s+(.+?)\s+(?:with|using)\s+(.+)$/);
 const oil=t.match(/^oil\s+(.+)$/);
 const ring=t.match(/^ring(?:\s+(.+?))?(?:\s+with\s+(.+))?$/);
 if(use){item=objectId(use[1]);target=objectId(use[2])}
 else if(withTool){item=objectId(withTool[2]);target=objectId(withTool[1])}
 else if(oil){item='oil';target=objectId(oil[1])}
 else if(ring){item=objectId(ring[2]||'clapper');target=objectId(ring[1]||(room===6?'pool':'bell'))}
 if(item){useObject(item,target);return}
 if(/^(?:turn|push|work)\s+(?:the\s+)?(?:wheel|gear|waterwheel)$/.test(t)){
  if(room===4){say(flags.wheelTurned?'The moving paddles would sweep you into the mill race. You keep clear.':'The wet paddles offer no safe grip from the riverbank.');return}if(room!==5){say('There is no mill wheel here.');return}if(!nearObject('wheel'))return;
  if(!flags.wheelUnlocked){say('You lean against a spoke, but the wheel will not budge. A wooden brake grips its rim. A chain links the brake to an empty bucket beneath a wooden panel. Its channel blocks have finger grips, polished smooth by years of handling. The sliding trough panel seems to control where the water goes.');return}
  if(flags.wheelTurned)say('The mill runs steadily. Its hoist holds the grain sack safely at the loft beam.');else progress('wheelTurned','The freed spokes move. Water catches the outside paddles, the gears turn, and the grain hoist lifts the heavy sack clear of the cupboard.');return;
 }
 if(/^(?:pull|tug)\s+(?:the\s+)?(?:rope|bell rope)$/.test(t)){useObject('clapper','bell');return}
 const speak=(t==='merrin'?['merrin','merrin']:null)||t.match(/^(?:say|call|shout|speak)\s+(?:the name\s+)?(.+)$/);
 if(speak&&!/^speak\s+(?:to|with)\s/.test(t)){
  if(noun(speak[1])!=='merrin'){say('Your words fade without an answer.');return}
  if(room===6){
   if(!nearObject('pool'))return;
   if(!flags.poolAwake){say('Your voice dies against the stone. The water remains perfectly still.');return}
   if(flags.echoCaught){say(flags.voiceReturned?(flags.voiceArrivalSeen?'Merrin already has his voice back. Your call fades over the quiet water.':'The freed voice is on its way to Merrin. Your call fades over the quiet water.'):'Merrin\'s named echo is already in your jar.');return}
   echoMistFrame=0;progress('echoNamed','"Merrin," you say. His name hovers above the water, returning in a voice almost like his own.');return;
  }
  if(room===1){
   if(!nearObject('mirror'))return;
   if(flags.voiceReturned){say('The mirror answers only with your own reflection. The familiar murmur is gone.');return}
   if(!flags.mirrorAwake){say('The mist scarcely stirs at your voice.');return}
   if(!flags.voiceOffered){say('"That is his name," the mirror whispers. "But a name alone is not what I borrowed."');return}
   progress('voiceReturned',voiceReleaseText);return;
  }
  say('You call Merrin\'s name. No one answers.');return;
 }
 const talk=t.match(/^(?:talk|speak)(?:\s+(?:to|with))?(?:\s+(.+))?$/);
 if(talk){
  const id=objectId(talk[1]||'man');
  if(id==='man'&&room===0){if(!nearObject('man'))return;talkMerrin();return}
  if(id==='mirror'&&room===1){say(flags.voiceReturned?'Only your own reflection answers now.':flags.voiceOffered?'\"I remember,\" the mirror whispers. \"Whose voice was it?\"':flags.bellRung?'\"Something in your satchel keeps interrupting me,\" the mirror complains.':flags.echoCaught?'\"A perfect imitation,\" it murmurs. \"A poor original.\"':flags.mirrorAwake?'"So many words," the mirror murmurs, "and so few of them worth keeping."':'Only a faint murmur answers from behind the mist.');return}
  say('No one here can answer you.');return;
 }
 const listening=t.match(/^listen(?:\s+(?:to\s+)?(.+))?$/);
 if(listening){listenAt(listening[1]||'');return}
 const go=t.match(/^(?:go(?:\s+(?:to|through|into|across))?|enter|walk(?:\s+(?:to|through|into|across))?|leave|exit)(?:\s+(.+))?$/);
 const destination=noun(go?go[1]||'out':t);
 if(go||['n','s','e','w','u','d','north','south','east','west','up','down','nw','ne','northwest','northeast','garden','gallery','castle','courtyard','court','shed','workshop','orchard','bridge','mill','grotto','belfry','out','outside','back'].includes(destination)){goToExit(destination);return}
 const attempted=t.match(/^\S+\s+(.+)$/);
 if(attempted){
  const requested=noun(attempted[1]),id=objectId(requested);
  if(objectIsHere(id)){say('Elara finds no useful way to do that with the '+requested+'.');return}
 }
 say('I did not understand that action. Try phrasing it another way.');
}
function useObject(item,target){
 // Working on carried tools does not require a room hotspot.
 if(item==='oil'&&target==='shears'){
  if(!flags.oilTaken||!flags.shearsTaken){say('You do not have both of those items with you.');return}
  if(flags.shearsReady)say('The shears already move freely.');else progress('shearsReady','A drop of oil frees the seized pivot. The blades slide cleanly past one another.');return;
 }
 if(item==='wax'&&target==='jar'){
  if(!flags.jarTaken){say('You have no jar with you.');return}
  if(flags.voiceReturned){say('The jar is empty now. Only a broken ring of the old wax remains.');return}
  if(flags.jarSealed){say('The echo jar is already sealed.');return}
  if(!flags.waxTaken){say('You have no wax with you.');return}
  if(!flags.echoCaught){say('The jar is quite empty. You leave its mouth uncovered.');return}
  progress('jarSealed','You press beeswax around the jar\'s mouth. The escaping whisper stops; a tiny voice still stirs inside.');return;
 }
 if(item==='rose'&&target==='bell'&&room===0){say('The green stem bends against the metal. You draw it back before it breaks. The little bell hangs on a peg.');return}
 if(item==='shears'&&target==='thorns'&&room===3){
  if(!flags.shearsTaken){say('The woody stems resist your bare hands. The thorns catch at your fingers.');return}
  if(!flags.shearsReady){say('The handles barely move. The stiff blades will not close around a stem.');return}if(!nearObject('thorns'))return;
  if(flags.thornsCut)say('The path is already clear.');else progress('thornsCut','You cut the blackthorn back, opening the eastern path to the stream.');return;
 }
 if(item==='plank'&&target==='bridge'&&room===4){
  if(flags.bridgePlank){if(flags.bridgePlankSlipped){if(!nearObject('bridge'))return;flags.bridgePlankSlipped=false;say('You pull the hanging plank back onto the timbers. It rocks beneath your hand.');draw()}else say('The plank is already fitted over the gap.');return}if(!flags.plankTaken){say('You have no plank with you.');return}if(!nearObject('bridge'))return;
  progress('bridgePlank','The oak plank spans the gap, its ends resting on sound timbers. It shifts when you press it with your foot; the old lashings hang loose.');return;
 }
 if(item==='twine'&&target==='bridge'&&room===4){
  if(!flags.twineTaken){say('You have no twine with you.');return}if(!flags.bridgePlank){say('The twine stretches across empty air. There is nothing beneath it to bear your weight.');return}if(!nearObject('bridge'))return;
  if(flags.bridgeFixed)say('The repair is already secure.');else{const slipped=flags.bridgePlankSlipped;flags.bridgePlankSlipped=false;progress('bridgeFixed',slipped?'You pull the slipped plank back onto the timbers and lash both ends firmly. The crossing is sound.':'You lash the oak plank to the bridge. The crossing is sound.');}return;
 }
 if(item==='oil'&&target==='wheel'&&room===4){say('You cannot safely reach the axle from the rushing mill race.');return}
 if(item==='oil'&&['wheel','cabinet'].includes(target)&&room===5){
  if(!flags.oilTaken){say('You have no oil with you.');return}if(!nearObject('wheel'))return;
  if(flags.wheelOiled)say('A dark sheen already covers the bearing.');else progress('wheelOiled','Oil soaks into the dry bearing. The bearing moves more smoothly, but a brake still grips the wheel. A small panel of carved troughs is linked to its counterweight.');return;
 }
 if(item==='jar'&&['pool','echo'].includes(target)&&room===6){
  if(flags.voiceReturned){say('The pool is quiet now. There is no borrowed voice left to gather.');return}
  if(!flags.jarTaken){say('You have no jar with you.');return}if(!nearObject('pool'))return;
  if(flags.echoCaught){say(flags.bellRung?'The jar already holds Merrin\'s true voice.':flags.jarSealed?'The captured echo is already sealed inside your jar.':'The named echo is already inside your jar.');return}
  if(!flags.echoNamed){say(flags.poolAwake&&!flags.poolRiddleSolved?'Your jar catches nothing. The pool is still waiting for an answer to its question.':'You hold the jar above the still water. No sound gathers at its mouth; the pool gives no answer.');return}
  progress('echoCaught','You hold the empty jar above the pool. Merrin\'s repeating name slips inside, leaving the grotto suddenly quiet. But a thin whisper curls from the open mouth. You cover it with your palm; the sound still seeps between your fingers. The rim needs something that will cling and seal.');return;
 }
 if(item==='twine'&&['rope','bell'].includes(target)&&room===7){
  if(!flags.twineTaken){say('You have no twine with you.');return}if(!nearObject('rope'))return;
  if(flags.ropeFixed)say('The rope is already mended.');else progress('ropeFixed','You bind the frayed bell rope with fresh twine. It will hold when the high bell swings.');return;
 }
 if(item==='clapper'&&target==='mirror'&&room===1){
  if(!flags.bell){say('You have no little silver bell with you.');return}if(!nearObject('mirror'))return;
  if(flags.voiceReturned){say('The mirror has already returned its borrowed voice.');return}
  progress('mirrorAwake','The silver note hangs in the air. The mist turns toward you. "Ah," whispers the mirror. "Someone with something worth hearing."');return;
 }
 if(item==='clapper'&&target==='pool'&&room===6){
  if(!flags.bell){say('You have no little silver bell with you.');return}if(!nearObject('pool'))return;
  if(flags.echoCaught)say('The silver note fades over the quiet pool. The repeating name has gone.');else if(flags.poolAwake)say('Your note returns from the water. For a moment, you can almost hear a voice within it.');else progress('poolAwake',['You ring the little silver bell. A clear note hangs over the water. Silver letters rise to the surface.', '', ...poolQuestion]);return;
 }
 if(item==='clapper'&&target==='bell'&&room===7){
  if(!nearObject('bell'))return;
  if(!flags.ropeFixed){say('A few fibers separate as you take the strain. You let go before the rope parts.');return}
  if(flags.voiceReturned){startBellPull('lonely',flags.voiceArrivalSeen?'The high bell rings. Your empty jar remains silent; Merrin has his voice back.':'The high bell rings. Your empty jar remains silent; its voice is on the way to Merrin.');return}
  if(!flags.jarSealed){startBellPull('lonely','The bell gives a lonely note. Nothing answers it.');return}
  if(!flags.harmonyTuned){startBellPull('harmony','The bell shivers through three clashing notes. Your jar answers with a different phrase. Three brass strings lead down to sliding weights.');return}
  // The great bell has its own full-sized clapper.

  if(flags.bellRung)startBellPull('repeat','The high bell rings again. Merrin\'s voice grumbles from the jar.');
  else startBellPull('voice','Elara jumps, catches the repaired rope, and pulls. The high bell rings! The sealed jar sings in Merrin\'s own voice. The echo has become true!');return;
 }
 if(item==='jar'&&target==='mirror'&&room===1){
  if(!flags.jarTaken){say('You have no jar with you.');return}if(!nearObject('mirror'))return;
  if(!flags.bellRung){say('The mirror remains cold. "That is not the voice I borrowed," it whispers.');return}
  if(!flags.mirrorAwake){say('The reflection of the jar is dim and still. Nothing behind the mist responds.');return}
  if(flags.voiceReturned){say('The voice has already flown home.');return}
  progress('voiceOffered','The jar and its reflection shimmer together. "I remember," the mirror whispers. "Whose voice was it?"');return;
 }
 if(item==='clapper'&&target==='bell'&&room===0){if(flags.bell)playGameSound('bell');say(flags.bell?'The little bell rings sweetly. Its last note lingers over the garden.':'The clapper is still caught inside the bell.');return}
 say('You try it, but nothing happens.');
}
