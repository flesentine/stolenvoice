// Complete authored gallery picture. Coordinates are native AGI pixels.
module.exports=function gallery({fill,stroke}){
  // Entire scene is authored here. No generated pixels remain beneath it.
  const box=(x,y,w,h,color,edge=0)=>fill([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color,edge);
  fill([[0,0],[160,0],[160,168],[0,168]],0);
  // Deep side returns and the three broad vault bays.
  fill([[0,0],[160,0],[145,28],[14,28]],1);
  fill([[0,15],[14,30],[14,106],[0,126]],1);
  fill([[145,28],[160,14],[160,112],[145,105]],1);
  fill([[14,27],[145,27],[145,106],[14,106]],7,0);
  fill([[142,31],[145,31],[145,106],[142,104]],8);
  // A few structural lines describe the vaulted ceiling, without texture.
  for(const points of [
   [[5,0],[10,0],[17,11],[23,27],[20,28],[13,12]],
   [[43,0],[48,0],[34,13],[25,27],[21,27],[31,12]],
   [[75,0],[79,0],[64,12],[58,26],[55,26],[61,11]],
   [[81,0],[85,0],[99,11],[105,26],[102,26],[96,13]],
   [[112,0],[117,0],[128,12],[139,27],[135,27],[125,14]],
   [[150,0],[155,0],[147,13],[141,28],[137,27],[143,12]]
  ])fill(points,8,0);
  stroke([[7,0],[15,12],[21,25]],7);stroke([[46,0],[33,13],[24,25]],7);
  stroke([[77,0],[63,12],[57,25]],7);stroke([[83,0],[97,12],[103,25]],7);
  stroke([[115,0],[127,13],[137,25]],7);stroke([[153,0],[145,13],[139,25]],7);
  box(13,25,134,4,8);stroke([[14,25],[146,25]],7);
  box(14,29,132,3,7);stroke([[15,32],[145,32]],0);
  // Sparse carved cornice teeth; these are architecture, not surface noise.
  for(let xx=28;xx<134;xx+=6)box(xx,29,2,2,8,8);
  // Stone piers have a light face and a single dark return.
  for(const left of [14,134]){
   box(left,32,11,73,8);box(left,32,8,73,7);
   for(const yy of [45,65,84])stroke([[left,yy],[left+7,yy],[left+8,yy+2]],8);
   box(left-2,27,15,5,7);stroke([[left-1,28],[left+11,28]],15);
   fill([[left-1,32],[left+11,32],[left+9,35],[left+1,35]],8,0);
   box(left-2,103,15,4,7);stroke([[left-1,104],[left+11,104]],15);
  }
  // Broad stone bays, interrupted by only a few chosen broken joints.
  for(const [left,top]of [[28,44],[50,88],[102,43],[104,91]])
   stroke([[left,top],[left+7,top],[left+7,top+4]],8);
  stroke([[26,98],[60,98]],8);stroke([[100,98],[117,98]],8);
  // Foreshortened flagstones stay broad and quiet.
  fill([[14,107],[145,107],[160,124],[160,168],[0,168],[0,124]],8,0);
  stroke([[14,109],[145,109]],7);
  for(const points of [ [[2,124],[52,124]],[[109,124],[159,124]],
   [[0,144],[49,144]],[[113,144],[159,144]],[[0,165],[43,165]],[[120,165],[159,165]],
   [[29,110],[17,123]],[[51,110],[43,123]],[[111,110],[119,123]],[[135,110],[148,123]],
   [[30,126],[8,143]],[[131,126],[152,143]],[[31,146],[4,165]],[[131,146],[158,165]]
  ])stroke(points,0);
  // A dark stairwell is a visible route, rather than a row of floating bars.
  fill([[147,109],[159,93],[160,93],[160,149],[146,149]],0);
  for(let step=0;step<7;step++){
   const left=146+step*2,top=145-step*6;
   fill([[left,top],[160,top],[160,top+4],[left-1,top+4]],8,0);
   stroke([[left,top],[159,top]],7);
  }
  stroke([[146,149],[146,124],[159,105]],6);
  // Oak-and-gold mirror: silhouette, shadow face, mouldings, then glass.
  fill([[60,25],[60,19],[66,18],[72,12],[80,7],[89,13],[95,19],[101,20],[101,96],[60,96]],6,0);
  fill([[64,21],[70,17],[80,10],[90,17],[97,22]],14,0);
  fill([[69,21],[80,13],[92,21]],6,0);
  stroke([[73,20],[76,17],[79,20]],14);stroke([[83,19],[86,17],[89,20]],14);
  fill([[79,13],[82,16],[81,20],[78,19],[77,16]],4,0);
  stroke([[79,14],[79,16]],12);
  box(61,25,39,70,6);box(64,28,32,62,14);
  box(67,31,26,56,6);box(69,33,23,52,0);
  box(70,34,21,50,1,1);
  // Preserve the exact live-effect window used by the game.
  box(72,36,17,46,1,1);
  stroke([[62,27],[62,93],[97,93]],0);
  stroke([[65,29],[65,88]],15);stroke([[66,89],[94,89]],14);
  for(const [cx,cy]of [[65,29],[94,29],[65,89],[94,89]]){
   fill([[cx,cy-2],[cx+2,cy],[cx,cy+2],[cx-2,cy]],14,6);
   stroke([[cx,cy-1],[cx,cy]],15);
  }
  function banner(left){
   stroke([[left-2,34],[left+13,34]],6);
   fill([[left,36],[left+11,36],[left+11,82],[left+5,78],[left,82]],14,0);
   fill([[left+2,38],[left+9,38],[left+9,78],[left+5,75],[left+2,78]],1);
   stroke([[left+5,52],[left+5,63]],14);stroke([[left+2,57],[left+8,57]],14);
   stroke([[left+3,59],[left+5,54],[left+7,59]],14);
  }
  banner(38);banner(113);
  function candles(left){
   stroke([[left,63],[left,74]],0);stroke([[left-3,68],[left+3,68]],6);
   for(const dx of [-2,2]){
    stroke([[left+dx,56],[left+dx,64]],15);
    stroke([[left+dx,53],[left+dx,55]],14);
   }
  }
  candles(29);candles(55);candles(105);
  // Runner: simple filled cloth with deliberately chosen motifs.
  fill([[69,111],[90,111],[114,168],[46,168]],6,0);
  fill([[70,113],[89,113],[110,168],[50,168]],5);
  stroke([[69,112],[48,167]],14);stroke([[90,112],[112,167]],14);
  for(const [y,r]of [[119,3],[133,4],[153,6]]){
   fill([[80,y-r],[80+r,y],[80,y+r],[80-r,y]],13,14);
   stroke([[80,y-1],[80,y+1]],14);
  }
  // Table and closed red book. Furniture remains within its priority masks.
  fill([[25,108],[26,130],[30,130],[31,109]],6,0);
  fill([[52,108],[52,130],[56,130],[57,108]],6,0);
  fill([[28,109],[31,115],[36,111],[41,115],[47,110],[52,114],[55,109]],6,0);
  fill([[24,102],[56,102],[58,105],[56,109],[24,109]],6,0);
  stroke([[25,103],[55,103]],14);stroke([[28,112],[28,128]],14);
  stroke([[54,112],[54,128]],14);
  fill([[34,99],[47,97],[49,99],[48,104],[34,104]],4,0);
  fill([[45,100],[49,99],[48,103],[45,104]],15);
  stroke([[36,99],[45,98]],14);stroke([[37,100],[37,103]],14);
  // High-backed chair: individual crest, upholstered panels, arms and feet.
  fill([[121,88],[121,84],[125,83],[127,78],[130,74],[133,80],[137,84],[139,87],[139,113],[121,113]],6,0);
  fill([[126,83],[130,77],[134,84],[131,83],[130,86],[129,83]],14,0);
  box(122,89,16,25,6);box(124,91,12,20,5);
  stroke([[125,93],[125,108]],13);stroke([[137,91],[137,112]],0);
  fill([[118,112],[122,110],[137,110],[140,113],[137,119],[120,119]],6,0);
  fill([[122,112],[136,112],[137,116],[121,116]],5,0);
  stroke([[123,113],[134,113]],13);
  for(const left of [118,138]){
   box(left,108,2,12,6);stroke([[left,108],[left+2,108]],14);
   box(left+1,119,2,12,6);box(left,130,4,2,6);
  }
  stroke([[122,120],[122,129]],14);stroke([[138,120],[138,129]],0);

};
