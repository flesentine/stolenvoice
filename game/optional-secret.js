// One optional curiosity, saved with Merrin's memories rather than quest flags.
function secretSnailFound(){return merrinMemories.seen.includes('snail')}
function secretSnailText(){
 return 'Beneath the workbench, a little wooden snail trophy is fixed to the low crosspiece. It wears a very small crown.\n\nThe faded label reads: "SIR CREEP-A-LOT. FIRST PLACE, DAVENTRY SNAIL DERBY."\n\nIn Merrin\'s handwriting below: "Only entrant. Still counts."';
}
function handleOptionalSecret(text){
 const under=text.match(/^(?:look|peek|peer|search|check|examine|inspect) (?:under|underneath|beneath) (.+)$/);
 const underside=text.match(/^(?:look(?: at)?|examine|inspect|search) (?:the )?(?:underside|bottom|low crosspiece|lower rail) of (.+)$/);
 const spiral=/^(?:look(?: at)?|examine|inspect|read) (?:the )?(?:tiny )?(?:spiral|carving|spiral carving)(?: (?:on|under|beneath) (?:the )?(?:bench|workbench))?$/.test(text);
 if(spiral||((under||underside)&&['bench','workbench','work bench','worktop'].includes(noun((under||underside)[1])))){
  if(room!==2){say('There is no workbench here to look beneath.');return true}
  if(Math.hypot(player.x-160,player.y-191)>46){say('Walk closer to the workbench to see beneath it.');return true}
  const fresh=!secretSnailFound();rememberMerrin('snail');
  say((fresh?'You crouch for a closer look.\n\n':'')+secretSnailText());return true;
 }
 const action=text.match(/^(look(?: at)?|examine|inspect|read|take|get|pick up|talk(?: to)?|speak(?: to)?) (.+)$/);
 if(!action)return false;
 const target=noun(action[2]);
 if(!['snail','wooden snail','snail trophy','little trophy','trophy','sir creep-a-lot','sir creep a lot','snail derby','derby','trophy label','snail label','label on trophy',...(room===2&&secretSnailFound()?['label']:[])].includes(target))return false;
 if(room!==2||!secretSnailFound()){say('You do not see anything like that here.');return true}
 if(Math.hypot(player.x-160,player.y-191)>46){say('Walk closer to the workbench to see the little trophy.');return true}
 if(/^(?:take|get|pick up)$/.test(action[1]))say('The little trophy is fixed to the bench. You leave Merrin his private moment of glory.');
 else if(/^(?:talk|speak)/.test(action[1]))say('You congratulate Sir Creep-a-lot. He remains woodenly modest.');
 else say(secretSnailText());
 return true;
}
