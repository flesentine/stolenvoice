// Recognize ordinary intentions, then use the same guarded puzzle actions.
function handleAcceptedIntent(text){
 if(bridgeBindingIntent(text)){if(room!==4)say('There is no bridge here.');else useObject('twine','bridge');return true}
 const local=(id,message,reach=id)=>{
  if(!objectIsHere(id)){say('You do not see '+id+' here.');return}
  if(hotspots[room][reach]&&!own(id)&&!nearObject(reach))return;
  say(message);
 };
 let m;
 const echoAttempt=text.match(/^(?:get|take|catch|capture|collect|trap|bottle|scoop|put)(?: up)? (?:the )?(?:echo|sound|name|merrin|merrins name|whisper|voice)(?: (?:in|into|with|using) (?:the )?(?:empty |glass )?jar)?$/)||text.match(/^(?:hold|raise|put|place|use|offer) (?:the )?(?:empty |glass )?jar(?: (?:to|under|over|above|at|near|beside|against|around|toward|towards|on) (?:the )?(?:echo|sound|name|merrin|whisper|voice|pool))?$/);
 if(room===6&&echoAttempt){if(!flags.jarTaken){say('Your fingers close on empty air. The sound slips between them.');return true}useObject('jar','pool');return true}

 m=text.match(/^(?:sit(?: down)?|seat myself)(?: (?:(?:in|on|upon) )?(.+))?$/);
 if((m&&(!m[1]||objectId(m[1])==='chair'))||/^(?:take|have) a seat$/.test(text)){
  if(room!==1){say('There is no chair here to sit in.');return true}
  if(!nearObject('chair',48))return true;
  startChairRest();return true;
 }

 m=text.match(/^(?:kick|boot) (.+)$/);
 if(m&&/\b(?:hive|beehive|honeycomb)\b/.test(m[1])&&objectId(m[1])==='wax'){
  if(room!==3){say('You do not see a hive here.');return true}
  if(!nearObject('wax'))return true;
  say('You give the hive a gentle nudge with your boot. Dry straw rustles, but the old hive stays put.');return true;
 }
 if(/^(?:take|get|pick up) (?:all|everything)$/.test(text)){say('Choose one thing at a time. Rosella likes to know what she is putting in her satchel.');return true}
 if(/^(?:hello|hi|greet(?: merrin| gardener| man)?)$/.test(text)||/^(?:ask|question) (?:the )?(?:merrin|gardener|man)(?: about .+)?$/.test(text)){
  if(room!==0){say('Merrin is in the royal garden.');return true}command('talk man');return true;
 }
 m=text.match(/^(?:get|take|retrieve|extract|fish|hook) (.+?) (?:with|using) (.+)$/);
 if(m&&objectId(m[1])==='clapper'&&objectId(m[2])==='rose'){useObject('rose','bell');return true}
 m=text.match(/^(?:cut|trim|prune|clip)(?: back| down)? (.+)$/);
 if(m&&!/ (?:with|using) /.test(m[1])&&objectId(m[1])==='thorns'){
  if(room!==3)say('You do not see blackthorn here.');else useObject('shears','thorns');return true;
 }
 m=text.match(/^(?:lubricate|grease) (.+)$/);
 if(m){const id=objectId(m[1]);if(!objectIsHere(id))say('You do not see '+noun(m[1])+' here.');else useObject('oil',id);return true}
 m=text.match(/^(?:tie|lash|bind|secure|fasten|reinforce) (.+)$/);
 if(m){
  const tool=m[1].match(/ (?:with|using) (.+)$/),rest=tool?m[1].slice(0,tool.index):m[1],parts=rest.split(/ (?:to|onto|on|across) /);
  if((!tool||objectId(tool[1])==='twine')&&((objectId(parts[0])==='plank'&&(!parts[1]||objectId(parts[1])==='bridge'))||(objectId(parts[0])==='bridge'&&!parts[1]))){
   if(room!==4)say('There is no bridge here.');else useObject('twine','bridge');return true;
  }
 }
 m=text.match(/^(?:ring|sound|tap|strike) (.+?)(?: (?:on|against|at|beside|near) (.+))?$/);
 if(m&&objectId(m[1])==='clapper'){
  if(!flags.bell){say('You have no little silver bell with you.');return true}
  const target=m[2]?objectId(m[2]):({0:'bell',1:'mirror',6:'pool',7:'bell'})[room];
  if(target){if(!objectIsHere(target)){say('You do not see '+noun(m[2]||target)+' here.');return true}useObject('clapper',target)}
  else{playGameSound('bell');say('A small silver note rings out, then fades without an answer.')}return true;
 }
 // Accept recipient-first phrasing through the same guarded gift handler.
 if(room===0&&/^(give|offer|hand) (?:the )?rose$/.test(text))text=text+' to merrin';
 const recipientFirst=text.match(/^(give|offer|hand|show) ((?:the )?(?:man|gardener|merrin|mirror)) (.+)$/);
 if(recipientFirst)text=recipientFirst[1]+' '+recipientFirst[3]+' to '+recipientFirst[2];
 m=text.match(/^(?:give|offer|hand|show) (.+?) (?:to|at) (.+)$/)||text.match(/^(?:give|offer|hand|show) (.+?) ((?:the )?(?:man|gardener|merrin|mirror))$/);
 if(m){
  const item=objectId(m[1]),target=objectId(m[2]);
  if(!objectIsHere(target)){say('You do not see '+noun(m[2])+' here.');return true}
  if(target==='man'&&flags.voiceReturned&&flags.voiceArrivalSeen&&['jar','voice'].includes(item)){if(!nearObject('man'))return true;say(item==='jar'&&own('jar')?merrinGiftRefusal('jar'):'Merrin already has his voice back. He smiles, eager to speak with you.');return true}
  if(item==='rose'&&target==='man'&&room===0){
   if(!nearObject('man'))return true;
   if(flags.roseGiven){say('Merrin has already tucked your rose into his coat.');return true}
   if(!own('rose')){say('You have no rose with you.');return true}
   flags.workshopKey=true;
   progress('roseGiven','Merrin accepts the rose with a surprised smile. He tucks it carefully into his coat, then studies you for a moment. At last he presses a little brass key into your hand and points toward his workshop. A warm, grateful "ding" escapes him.');return true;
  }
  if(!own(item)){say('You are not carrying '+noun(m[1])+'.');return true}
  if(hotspots[room][target]&&!nearObject(target))return true;
  if(item==='jar'&&target==='mirror'){useObject(item,target);return true}
  if(target==='man'){say(merrinGiftRefusal(item));return true}
  if(target==='mirror'){say(item==='rose'?'The glass reflects your offering. Apparently it has no taste for flowers.':'The mirror reflects your offering, but makes no move to accept it.');return true}
  say('The '+noun(m[2])+' has no use for your offering. You keep it.');return true;
 }
 m=text.match(/^(?:catch|capture|collect|trap|bottle|scoop)(?: up)? (.+?)(?: (?:with|using|in|into) (.+))?$/);
 let capture=m&&objectId(m[1])==='pool'&&(!m[2]||objectId(m[2])==='jar');
 if(!capture){m=text.match(/^fill (.+?)(?: (?:with|from|at) (.+))?$/);capture=m&&objectId(m[1])==='jar'&&(!m[2]||objectId(m[2])==='pool')}
 if(!capture){m=text.match(/^(?:hold|raise|put|place) (.+?) (?:over|above|beside|near|against) (.+)$/);capture=m&&objectId(m[1])==='jar'&&objectId(m[2])==='pool'}
 if(capture){
  if(room!==6){say('There is no echo hanging in the air here.');return true}
  if(!flags.jarTaken){say('Your fingers close on empty air. The sound slips between them.');return true}
  useObject('jar','pool');return true;
 }
 // Accept both explicit tools and the short noun-noun phrasing.
 m=text.match(/^(?:seal|stopper|cork|plug)(?: up)? (.+?) (?:with |using )?(?:the )?(beeswax|wax)$/);
 if(m&&objectId(m[1])==='jar'){useObject('wax','jar');return true}
 m=text.match(/^(?:open|close|shut|stopper|cork|seal|plug)(?: up)? (.+)$/);
 if(m){
  const id=objectId(m[1]),opening=text.startsWith('open ');
  if(id==='jar'){
   if(!flags.jarTaken){say('You have no jar with you.');return true}
   say(flags.voiceReturned?'The jar is empty and open again. The old wax seal has broken.':flags.jarSealed?(opening?'The wax holds the mouth tightly sealed. You leave the captured sound inside.':'The jar is already sealed.'):opening?'The jar is already open.':flags.echoCaught?'There is no lid or stopper. The whisper leaks around your fingers.':'There is no stopper for the empty jar. You leave its mouth uncovered.');return true;
  }
  if(id==='shears'){
   if(!own(id)&&!(room===2&&!flags.shearsTaken)){say('You do not see shears here.');return true}
   if(!own(id)&&!nearObject('shears'))return true;
   say(flags.shearsReady?'The blades open and close with a crisp little snip.':'The handles move a fraction, then seize with a rusty squeak.');return true;
  }
  if(id==='cabinet'){
   if(room!==5){say('You do not see a cabinet here.');return true}if(!nearObject('cabinet'))return true;
   return handleHumanIntent((opening?'open ':'close ')+'cupboard');
  }
  if(id==='drawer'){
   if(room!==2){say('You do not see a drawer here.');return true}if(!nearObject('drawer'))return true;
   say(opening?'You slide the shallow drawer open. It is empty. You push it shut again.':'The drawer is already shut.');return true;
  }
  if(room===8&&['arch','shed','gallery'].includes(id)){say(opening?(id==='shed'?workshopDoorDescription():id==='gallery'?'The gallery arch is already open.':'The stone gallery arch has no door to open.'):'You leave the courtyard passages open.');return true}
  if(id==='arch'&&objectIsHere(id)){say(opening?'The archway is already open.':'There is no closed door across the archway. You leave the passage clear.');return true}
 }
 m=text.match(/^(?:pull|tug|lift|try) (.+)$/);
 if(m&&objectId(m[1])==='cabinet')return handleAcceptedIntent('open cabinet');
 m=text.match(/^(?:look (?:in|inside)|search) (.+)$/);
 if(m&&objectId(m[1])==='drawer')return handleAcceptedIntent('open drawer');
 if(m&&objectId(m[1])==='barrel'){
  if(room!==2){say('You do not see a barrel here.');return true}if(!nearObject('barrel'))return true;
  handleBarrelPrank('open barrel');return true;
 }
 if(m&&objectId(m[1])==='wax'){
  if(room!==3){say('You do not see a hive here.');return true}if(!nearObject('wax'))return true;describeObject('wax','hive');return true;
 }
 m=text.match(/^search (.+)$/);
 if(m){const id=objectId(m[1]);if(objectIsHere(id))describeObject(id,m[1]);else say('You do not see '+noun(m[1])+' here.');return true}
 m=text.match(/^(?:smell|sniff) (.+)$/);
 if(m&&objectId(m[1])==='rose'){local('rose','The red petals have a delicate, sweet perfume.');return true}
 m=text.match(/^(?:eat|bite|taste) (.+)$/);
 if(m&&objectId(m[1])==='apple'){local('apple','The apples are hard and sour. You leave them on their branches.');return true}
 m=text.match(/^(?:take|get|collect) (?:the )?honey$/);
 if(m&&room===3){if(!nearObject('wax'))return true;say('The bees guard their honeycomb. Loose wax on the landing shelf is another matter.');return true}
 m=text.match(/^(?:touch|feel|knock on) (.+)$/);
 if(m&&objectId(m[1])==='mirror'){local('mirror',flags.voiceReturned?'The glass is cool and quiet beneath your fingers.':flags.mirrorAwake?'The cold glass trembles faintly beneath your fingers.':'The glass is cold. The mist lies somewhere beyond its surface.');return true}
 m=text.match(/^(?:shake|reach into|reach inside|reach in) (.+)$/);
 if(m&&objectId(m[1])==='bell'){
  if(![0,7].includes(room)){say('You do not see a bell here.');return true}if(!nearObject('bell'))return true;
  say(room===7?'The great bell hangs high above you, firmly held by its iron fittings.':flags.bell?'The wooden peg is empty; your little silver bell is in the satchel.':text.startsWith('shake')?'The bell rocks on its peg. Its attached clapper gives a soft chime.':'The clapper is fastened inside the little bell. Its wooden handle can be lifted off the peg.');return true;
 }
 m=text.match(/^(?:jump|leap|hop)(?: over| across)? (.+)$/);
 if(m&&objectId(m[1])==='thorns'){
  say(room!==3?'You do not see any thorns here to jump over.':flags.thornsCut?
   'The blackthorn has been cut back. You can simply walk EAST through the cleared path.':
   'The blackthorn is too high and deep to jump. You would land in the middle of the thorns. Better find a way to cut a path.');
  return true;
 }
 if(/^jump(?: (?:the )?(?:gap|bridge|across gap|over gap|across bridge))?$/.test(text)){
  say(room===4?(flags.bridgePlank?'The narrow bridge boards leave little room for a safe jump.':'The wet edges offer no firm takeoff. You stay on the bank.'):'There is no safe reason to jump here. Rosella keeps her feet on the ground.');return true;
 }
 m=text.match(/^(?:throw|drop|toss) (.+?) (?:in|into|at) (.+)$/);
 if(m&&objectId(m[1])==='clapper'&&objectId(m[2])==='pool'){
  if(!flags.bell){say('You have no little silver bell to throw.');return true}
  if(room!==6){say('There is no still pool here.');return true}if(!nearObject('pool'))return true;
  say('You keep hold of the little bell. Its weight would take it straight to the bottom.');return true;
 }
 return false;
}
