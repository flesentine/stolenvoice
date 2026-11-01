// Small rewards for curiosity. These observations never change puzzle state.
function handleSceneryReaction(text){
 if(/^(?:smell|sniff)$/.test(text)){
  say([
   'Rose perfume and freshly cut grass. Merrin takes his gardening very seriously.',
   'Candle wax and cool stone. The royal carpet contributes a faint smell of dust.',
   'Warm wood, potting earth and dry roots fill the little shed.',
   'Tart apples, sun-warmed straw and a faint sweetness from the hive.',
   'Cold water and wet stone, with the woody smell of the old bridge.',
   'Dry grain, dusty sacking and damp oak. It is unmistakably a mill.',
   'The air is cold and mineral-sharp, like rain on stone.',
   'Old oak and a little dust. The wind keeps the belfry air fresh.',
   'Flowers, ivy and sun-warmed plaster soften the castle air.'
  ][room]);return true;
 }
 const match=text.match(/^(smell|sniff|listen|knock|rap|tap|touch|feel)(?: (?:to|at|on|against|inside|of))? (.+)$/);
 if(!match)return false;
 const action={sniff:'smell',rap:'knock',tap:'knock',feel:'touch'}[match[1]]||match[1];
 const requested=noun(match[2]);let id=objectId(requested);
 if(action==='listen'&&id==='birds'){say(worldBirdsHere()?'Two bright little calls answer one another above the garden and rooftops. The high bell has company now.':'You hear no answering birdsong here.');return true}
 if(/^(?:old )?(?:mills?|watermill)(?: door| doorway| doorpost| door frame)?$/.test(requested))id='mill';
 if(/^(?:shed|workshop|potting shed)(?: door| doorway| doorpost)?$/.test(requested))id='shed';
 if(/^(?:cave|grotto)(?: entrance| mouth)?$/.test(requested))id='grotto';
 if(requested==='grain')id='sack';
 if(requested==='rock wall')id='wall';
 if(action==='listen'&&['hive','beehive','bee hive','straw hive'].includes(requested))id='bees';
 if(['door','doorway','doorpost','door frame','doorframe'].includes(requested))id=[4,5].includes(room)?'mill':[2,8].includes(room)?'shed':id;
 const reactions={
  smell:{
   apple:{3:'The apples have a sharp, green scent. A royal nose confirms that they are not quite ripe.'},
   honey:{3:'Warm straw and honey scent the air. The bees have every intention of keeping the honey.'},
   soil:{2:'Warm earth, dry roots and a little leaf mould. Merrin would probably call it an excellent vintage.'},
   herbs:{2:'The green shoots smell fresh and peppery. Their labels concern gardening, not luncheon.',8:'A clean, green scent rises from the window box when the breeze changes.'},
   flowers:{0:'The flowers smell sweetly of a garden that receives considerably more attention than most royal paperwork.',8:'The pink flowers have a light perfume. Merrin has chosen them for more than their colour.'},
   sack:{2:'Dry seed and dusty sacking. Nothing here improves your appetite.',5:'The grain smells dry and wholesome beneath the dusty sacking.'},
   stream:{4:'Cold water, wet stone and moss. The spray reaches your nose without the rest of you having to join it.',5:'Damp stone and wet oak mingle with the dry grain smell.'}
  },
  listen:{
   bees:{3:()=>flags.waxTaken?'The hive keeps up its busy hum. Its inhabitants seem quite satisfied with the arrangement.':'A restless buzz rises and falls as bees dart past the entrance. The low flights are worth watching.'},
   tree:{0:'Leaves rustle above the path. For once, nobody appears to be asking anything of you.',3:'Apple leaves whisper overhead. An occasional twig ticks against its neighbour.'},
   bridge:{4:()=>flags.bridgeFixed?'A rope creaks against sound wood. Beneath it, the stream does most of the talking.':flags.bridgePlankSlipped?'The hanging plank taps an uneven rhythm against the old timber. It certainly does not sound secure.':flags.bridgePlank?'The loose plank gives a small, dry creak. The stream supplies an unhelpfully cheerful accompaniment.':'Water rushes through the broken crossing. A splintered end knocks softly against its neighbour.'},
   mill:{4:()=>flags.wheelTurned?'Paddles slap the water and a steady wooden clatter comes from the mill.':'Water hisses beneath the motionless paddles. No answering machinery comes from inside.',5:()=>flags.wheelTurned?'The wheel, winding drum and pulley keep up a busy wooden conversation.':'Running water echoes through the stonework. The machinery itself is stubbornly quiet.'},
   grotto:{4:'Between rushes of water, you catch a distant drip from the cave mouth. It sounds much quieter in there.',6:()=>grottoSound()},
   stairs:{1:'A faint draught sighs down the belfry stairs. The old steps keep their opinions to themselves.',7:'Wind moves through the stair opening. Below it, the gallery is quiet.'},
   banner:{1:'The heavy banners barely stir. Their heraldic birds remain impressively discreet.',8:'A banner flaps against its pole, making a small, officious sort of noise.'}
  },
  knock:{
   mill:{4:()=>flags.wheelTurned?'You rap on the open mill doorway. The machinery answers with a clatter. Nobody else does.':'You knock on the mill doorpost. A hollow little echo answers from the quiet machinery.',5:'You tap the old oak doorframe. Dust shifts above you. You decide that is answer enough.'},
   shed:{8:()=>flags.workshopOpen?'You knock on the open door. It is a very polite thing to do to an empty workshop.':'You knock on the oak door. A flowerpot rattles inside, but nobody comes to open it.',2:'You tap the doorframe. A little potting dust falls on your sleeve. Merrin has left his mark on everything.'},
   barrel:{2:'You tap the barrel. The earth inside gives it a dull, unpromising thud. This is no royal wine cellar.'},
   wall:{1:'The stone returns a firm tap. You are reminded why castles seldom lose arguments.',6:'The cold rock gives a short, dull answer. The pool is the better listener.',7:'The thick tower wall absorbs your knock. It has heard centuries of bells.'}
  },
  touch:{
   tree:{0:'The bark is rough beneath your fingers. Merrin has carefully cleared the ivy from its lower trunk.',3:'The apple bark is ridged and warm on the sunny side. You leave the tree firmly rooted.'},
   grass:{0:'The clipped grass springs back under your hand. Someone else has done a great deal of work to make this look effortless.',3:'The coarse grass is cool beneath the apple trees. A dry leaf catches at your sleeve.',8:'The grass is soft beside the path. It would make an excellent place to avoid official duties.'},
   stream:{4:'You catch a little spray from the safety of the bank. The water is cold enough to discourage further introductions.'}
  }
 };
 const entry=reactions[action]?.[id];if(!entry)return false;
 const response=entry[room];
 if(!response){say('No '+requested+' can be found here.');return true}
 if(action==='knock'){
  if(id==='shed'&&room===8){if(!nearWorkshopDoor())return true}
  else if(id==='mill'&&room===4&&Math.hypot(player.x-85,player.y-150)>65){say('Walk closer to the mill doorway first.');return true}
  else if(hotspots[room][id]&&!nearObject(id))return true;
 }
 say(typeof response==='function'?response():response);return true;
}
