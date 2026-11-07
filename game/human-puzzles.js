// Physical and conversational actions from the playwright pass.
const poolQuestion=['The silver pool asks:', '', 'No tongue, yet I reply;', 'No wings, yet I can fly.', 'Speak, and I speak too;', 'Be still, and I am through.', '', 'What am I?'];
function tipGardenBell(){
 if(room!==0){say('There is no little garden bell here.');return}
 if(!nearObject('bell'))return;
 if(flags.bell){say('The peg is empty. The little silver bell is already in your satchel.');return}
 progress('bell','You lift the little silver bell off its peg by the wooden handle. Its clapper gives a soft chime as you slip the whole bell into your satchel.');
}
function handleHumanIntent(text){
 if(/^(?:open|push open) (?:the )?orchard gate$/.test(text)){
  say(room===0?'The little gate is already propped open beside the orchard path.':'There is no orchard gate here.');return true;
 }
 if(text==='merrin'&&[1,6].includes(room)){command('say merrin');return true}

 const poolEntry=text.match(/^(?:swim|wade|bathe|enter|dive|jump|step|get|go|walk)(?: (?:in|into|down into))? (.+)$/);
 if(room===6&&(/^(?:swim|wade|bathe|dive)(?: in)?$/.test(text)||(poolEntry&&objectId(poolEntry[1])==='pool'))){
  if(!nearObject('pool'))return true;
  stopWalking();say('You test the pool with a toe. The cold goes straight through your shoe. Elara retreats to the dry stone, her enthusiasm for a royal bath considerably diminished.');return true;
 }

 if(room===0&&/^(?:use|hook|retrieve|get|grab).*?(?:rose|stem).*?clapper|^(?:hook|retrieve|get|grab).*?clapper.*?(?:rose|stem)/.test(text)){useObject('rose','bell');return true}
 // Water is a physical attempt, distinct from holding glass over an echo.
 if(room===6&&(
  /^(?:put|pour|scoop|collect|take|get|catch)(?: up)? (?:the )?(?:pool water|water) (?:in|into|with|using) (?:the )?(?:empty |glass |measuring )?jar$/.test(text)||
  /^fill (?:the )?(?:empty |glass |measuring )?jar (?:with|from) (?:the )?(?:pool water|water)$/.test(text)||
  /^(?:dip|dunk|lower|immerse|put|place) (?:the )?(?:empty |glass |measuring )?jar (?:in|into|under) (?:the )?(?:pool|water)$/.test(text))){
  if(!flags.jarTaken){say('You have no jar with you.');return true}
  if(!nearObject('pool'))return true;
  if(flags.jarSealed){say('The wax seal covers the mouth of the jar. You keep it above the water.');return true}
  if(flags.echoCaught){say('A whisper stirs inside the jar. You draw it back before the water can wash away the sound.');return true}
  say('You dip the jar into the pool. Water seems to fill it, then slips away like a reflection as you lift it. The glass comes up dry. Not a ripple marks the surface.');return true;
 }
 const clapperAttempt=text.replace(/ with (?:a |my |your )?fingernail$/, '');
 let sound=clapperAttempt.match(/^(?:use|ring|sound|tap|strike|hit|chime|play|shake|flick) (.+?)(?: (?:next to|beside|by|near|at|over|above|on|against) (.+))?$/);
 if(room===0&&sound&&objectId(sound[1])==='bell'&&!flags.bell){if(!nearObject('bell'))return true;playGameSound('bell');say('You give the hanging bell a gentle shake. A clear silver note rings across the garden.');return true}
 if(room!==7&&sound&&objectId(sound[1])==='clapper'&&(!sound[2]||objectId(sound[2])==='mirror')&&room!==6){if(!flags.bell)say('You have no little silver bell with you.');else if(room===1)useObject('clapper','mirror');else{playGameSound('bell');say('You ring the little silver bell. Its clear note fades into the air.')}return true}
 if(room===7&&sound&&objectId(sound[1])==='clapper'){if(!flags.bell)say('You have no little silver bell with you.');else{playGameSound('bell');say('Your little silver bell gives a bright tinkle beneath the great bell overhead.')}return true}
 if(room===6&&((sound&&objectId(sound[1])==='clapper'&&(!sound[2]||objectId(sound[2])==='pool'))||/^(?:use|ring|sound) (?:the )?(?:silver )?(?:clapper|bell) (?:the )?(?:pool|water)$/.test(text))){useObject('clapper','pool');return true}
 let m=text.match(/^(?:tilt|tip|invert|shake|lift|raise|unhook|turn)(?: over)? (.+?)(?: (?:over|upside down|on its side))?$/);
 if(m&&['bell','clapper'].includes(objectId(m[1]))&&room===0){tipGardenBell();return true}
 if(room===0&&/^(?:take|get|pick up) (?:the )?(?:(?:garden |little |silver |little silver |small |small silver )?bell|handbell|hand bell)$/.test(text)){tipGardenBell();return true}
 m=text.match(/^(?:push|move|shift|drag|lift|raise|pull|tug|take|get|cut|untie|open)(?: at)? (?:the )?(?:grain )?(?:sack|bag|hoist|pulley|hoist rope|mill rope|rope|sling|chain)$/);
 if(m&&room===5){
  if(!nearObject('cabinet'))return true;
  say(flags.wheelTurned?'The loaded sack hangs safely at the loft beam. You leave the hoist secured.':'The grain sack scarcely shifts. Flour dust settles on your shoes. A rope runs from its sling to the pulley overhead.');return true;
 }
 if(room===5&&/^(?:open|close|shut|pull|lift|release) (?:the )?(?:cabinet|cupboard|cabinet door|cupboard door|catch|latch)$/.test(text)){
  if(!nearObject('cabinet'))return true;
  if(cabinetTimer){say('The hoist or door is still moving. You keep your fingers clear.');return true}
  if(!flags.wheelTurned){say('The grain sack presses against the cupboard door. You cannot swing it open.');return true}
  if(/^(?:close|shut) /.test(text)){if(!flags.cabinetOpen)say('The cupboard is already closed.');else{flags.cabinetOpen=false;closeMillCabinet()}return true}
  if(flags.cabinetOpen){say('The cupboard is already open.');return true}
  flags.cabinetOpen=true;openMillCabinet();draw();return true;
 }
 if(room===6&&/^(?:read|look at|examine|inspect) (?:the )?(?:question|riddle|inscription|writing|words)$/.test(text)){
  if(!nearObject('pool'))return true;
  say(flags.poolAwake?flags.poolRiddleSolved?'A last silver line remains: \"Whose voice is lost? Call that person by name.\"':poolQuestion:'No writing marks the stone. The still water reflects only darkness.');return true;
 }
 m=text.match(/^(?:(?:say|answer|reply|solve|guess)(?: (?:the )?(?:riddle|question))?(?: with| is|:)? )?((?:an? )?echo(?:es)?)$/);
 if(m&&room===6){
  if(!nearObject('pool'))return true;
  if(!flags.poolAwake){say('Your answer falls flat. The pool has asked no question.');return true}
  if(flags.poolRiddleSolved){say('The pool already knows that you understand its nature. It waits for a name.');return true}
  progress('poolRiddleSolved','"An echo," you answer. The silver words dissolve into circles. For the first time, your own breathing comes back from the pool. A last silver line appears: \"Whose voice is lost? Call that person by name.\"');return true;
 }
 if(room===6&&flags.poolAwake&&!flags.poolRiddleSolved&&/^(?:say|answer|reply|guess|solve) /.test(text)){
  if(!nearObject('pool'))return true;
  say('The pool repeats your answer in your own voice, then falls quiet. The silver question still waits.');return true;
 }
 return false;
}
function drawGardenBell(){
 // An open, braced gate leaf recedes below the path; all timber is drawn
 // directly on the native picture grid so the joints meet cleanly.
 const stroke=(points,color)=>{for(let i=1;i<points.length;i++)millLinkLine(...points[i-1],...points[i],color)};
 const chip=(xx,yy,w,h,color)=>{x.fillStyle=color;x.fillRect(xx,yy,w,h)};
 stroke([[150,144],[159,150],[159,162],[150,155],[150,144]],'#000000');
 stroke([[150,145],[158,150]],'#aa5500');stroke([[150,146],[158,151]],'#aaaaaa');
 stroke([[150,154],[158,160]],'#aa5500');
 for(const [xx,yy]of [[152,147],[155,149],[158,151]]){
  stroke([[xx,yy],[xx,yy+9]],'#aa5500');chip(xx,yy,1,2,'#aaaaaa');
 }
 // The diagonal brace runs from the lower hinge to the outer upper corner.
 stroke([[150,154],[158,152]],'#aa5500');
 drawGardenGatePost(147,144,15);
 for(const yy of [145,153]){chip(149,yy,2,1,'#555555');chip(149,yy,1,1,'#aaaaaa')}
 // A short wooden peg carries the existing handbell handle.
 chip(146,124,4,1,'#aa5500');chip(146,124,1,1,'#aaaaaa');
 if(!pickupStillInScene('bell'))return;
 const frame=storyAction?.kind==='bellTaken'?storyAction.frame:0;
 const angle=frame?Math.sin(Math.min(frame,13)/13*Math.PI)*1.25:0;
 const q=(dx,dy)=>[148+Math.round(dx*Math.cos(angle)-dy*Math.sin(angle)),125+Math.round(dx*Math.sin(angle)+dy*Math.cos(angle))];
 const leaf=[[-2,0],[2,0],[3,5],[-3,5]].map(([a,b])=>q(a,b));
 x.fillStyle='#ffff55';
 // Native polygon drawing uses the existing integer-line painter.
 for(let yy=121;yy<135;yy++)for(let xx=141;xx<156;xx++)if(insidePolygon(xx+.5,yy+.5,leaf))x.fillRect(xx,yy,1,1);
 const edge=[q(-3,5),q(3,5)];millLinkLine(...edge[0],...edge[1],'#aa5500');
 if(pickupStillInScene('bell')){x.fillStyle='#aaaaaa';x.fillRect(147,129,2,2)}
}
function drawGardenGatePost(left,top,height){
 const chip=(xx,yy,w,h,color)=>{x.fillStyle=color;x.fillRect(xx,yy,w,h)};
 chip(left,top,4,height,'#000000');chip(left+1,top,2,height-1,'#aa5500');
 chip(left+1,top+1,1,3,'#ffff55');chip(left+2,top+8,1,3,'#555555');
 chip(left-1,top-2,6,2,'#000000');chip(left,top-2,4,1,'#aa5500');chip(left,top-1,4,1,'#aaaaaa');
}
function drawGardenGateBack(){
 drawGardenGatePost(147,120,15);
 // Weathered orchard fencing behind the clear path, with continuous rails
 // and capped uprights rather than isolated ladder-like strokes.
 const stroke=(a,b,color)=>millLinkLine(...a,...b,color);
 for(const yy of [123,130]){
  stroke([150,yy+1],[159,yy+1],'#000000');stroke([150,yy],[159,yy],'#aa5500');
 }
 for(const xx of [154,159]){
  x.fillStyle='#000000';x.fillRect(xx-1,119,2,16);
  x.fillStyle='#aa5500';x.fillRect(xx,120,1,14);
  x.fillStyle='#aaaaaa';x.fillRect(xx-1,119,2,1);x.fillRect(xx,121,1,2);
 }
}
function drawMerrinRose(px=60,py=204){
 if(!flags.roseGiven)return;
 const left=pictureX(px)-4,top=pictureY(py)-37;
 x.fillStyle='#00aa00';x.fillRect(left+5,top+15,1,3);
 x.fillStyle='#ff5555';x.fillRect(left+4,top+13,3,2);
 x.fillStyle='#aa0000';x.fillRect(left+5,top+14,1,1);
}
