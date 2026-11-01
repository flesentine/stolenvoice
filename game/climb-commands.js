// Local climbing responses; real stairs keep the existing reach/exit checks.
function handleClimb(text){
 const match=text.match(/^(climb|ascend|descend)(?:\s+(.*))?$/);if(!match)return false;
 let target=noun(match[2]||''),direction=match[1]==='ascend'?'up':match[1]==='descend'?'down':'';
 const movement=target.match(/^(up|down|onto|on|over|into|through|out of|out)(?:\s+(.*))?$/);
 if(movement){direction=movement[1];target=noun(movement[2]||'')}
 if(swimState.active){
  if(['out','out of'].includes(direction)||['bank','shore','riverbank'].includes(target))swimmingCommand('swim to shore');
  else say('The current gives you no footing. You struggle to keep your head above water.');return true;
 }
 const id=objectId(target),stairs=['stairs','tower','belfry'].includes(id);
 if(room===1&&(stairs||(!target&&direction==='up'))){goToExit('belfry');return true}
 if(room===7&&(id==='stairs'||(!target&&direction==='down'))){goToExit('gallery');return true}
 if([5,6].includes(room)&&(['out','out of'].includes(direction)||id==='arch')){goToExit('bridge');return true}
 if(room===4&&['grotto','path'].includes(id)){goToExit('grotto');return true}
 if(!target){
  say([
   'The garden trees have high branches, and the castle walls offer no foothold.',
   'A stone staircase winds upward at the side of the gallery.',
   'The shed rafters are well above your reach. The furniture looks better suited to gardening.',
   'The apple trees have broad trunks, but their lowest sound branches are out of reach.',
   'Wet rocks border the stream. A narrow path climbs the far bank toward the cave.',
   'The mill machinery crowds the walls. The open arch leads back outside.',
   'Damp rock rises into darkness. The passage back outside is easier going.',
   'You are already high in the tower. The stairs lead back down.',
   'Ivy trails over the courtyard walls, but its little roots could never support your weight.'
  ][room]);return true;
 }
 const local=[
  {tree:'The lowest branches are too high to grasp from the lawn.',bell:'The little bell post is too slender to support you.',drawbridge:'The drawbridge is a walkway. You can approach the gate on foot.'},
  {table:'The carved legs wobble under sideways pressure. You leave the book table on the floor.',chair:'The tall chair would tip before it made a useful ladder.',mirror:'The polished frame has no secure foothold.'},
  {bench:'Loose tools and a narrow worktop make the bench a poor climbing platform.',plank:'The loose boards would slide apart under your feet.',barrel:'The curved lid rocks beneath your hands. You leave the barrel upright.',shelf:'The shelf brackets are meant for flowerpots, not a princess.'},
  {tree:'The bark crumbles beneath your fingers, and the sound branches begin above your reach.',wax:'The straw hive would collapse beneath your weight.',thorns:'The thorns catch at your sleeves before you can find a foothold.'},
  {wheel:flags.wheelTurned?'The moving paddles would sweep your feet into the mill race. You keep clear.':'The wet paddles offer no secure foothold above the mill race.',bridge:flags.bridgePlank?'The bridge is ready to cross on foot. Its narrow posts are no place to balance.':'The surviving bridge timbers end at an open gap. Climbing the posts would not carry you across.',rock:'Water slicks the sloping rocks. You cannot find a safe foothold.',mill:'Smooth masonry and slippery paddles offer no safe way up.'},
  {wheel:flags.wheelTurned?'The turning spokes would sweep your feet from under you. You keep clear.':'The wheel offers a precarious perch above the mill race. You keep your feet on the floor.',cabinet:'The cabinet is tall and narrow. Pulling yourself up would bring it down on you.',sack:'The sacks sag as soon as you press against them.'},
  {rock:'The damp stone is slick, and the cracks are too shallow for your fingers.',stalagmites:'The slender formations would snap beneath your weight.',pool:'The pool has a low rim, not a climbable bank.'},
  {rope:flags.ropeFixed?'The repaired rope hangs from the bell. It is a bell pull, not a ladder.':'The frayed rope begins to part under a gentle tug. It would never hold your weight.',bell:'The bell hangs beyond your reach from a heavy overhead beam.',railing:'Beyond the railing is a long drop. You remain on the floorboards.'},
  {ivy:'The ivy peels away from the mortar when you tug it. Its roots cannot hold you.',flowers:'The planter is narrow and full of carefully tended flowers. You leave it undisturbed.',pillar:'The stone piers have smooth sides and no footholds.'}
 ];
 if(local[room][id]){say(local[room][id]);return true}
 if(sceneryDescription(id)){
  const reasons={wall:'The smooth wall has no reliable handholds.',castle:'The castle masonry offers no safe foothold from here.',tower:'The tower rises far above your reach. Its outer stones are smooth.',ceiling:'The overhead timbers are beyond your reach.',window:'The deep opening has no footholds that would support a climb.',banner:'The hanging cloth would tear under your weight.',pennant:'The pennant is far above your reach.',gate:'The gateway is meant to be walked through. There is no secure climbing hold.',floor:'You are already standing on it.',path:'The path can be followed on foot.',arch:'The arch has no footholds. Its passage can be entered on foot.'};
  say(reasons[id]||'You cannot find a safe handhold or foothold on that.');return true;
 }
 say('You do not see '+target+' here.');return true;
}
