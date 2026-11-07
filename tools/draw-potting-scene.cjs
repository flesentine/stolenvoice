// Shed proportions are authored against Elara's actual 40-native-pixel cel.
// Bench: work surface at y108, feet at y129 => 21 pixels, about waist height.
module.exports=function shed({fill,stroke,named=()=>{}}){
 const p=(name,pts,c,e=0)=>{named(name);fill(pts,c,e)};
 const l=(name,pts,c=0)=>{named(name);stroke(pts,c)};
 const r=(name,x,y,w,h,c,e=0)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
 p('Dark shed silhouette',[[0,0],[160,0],[160,168],[0,168]],0,null);
 // A shallow roof recedes toward the wall; its timbers do not all meet at
 // one exaggerated vanishing point. Paired rafters share a central ridge.
 p('Warm roof boarding',[[0,0],[160,0],[150,38],[10,38]],4,6);
 for(const y of [8,29]){
  l('Left roof board seam',[[5,y],[75,y+1]],6);
  l('Right roof board seam',[[85,y+1],[155,y]],6);
 }
 const leftRafters=[[[0,0],[6,0],[19,36],[14,36]],[[39,0],[44,0],[50,36],[46,36]]];
 for(const points of leftRafters){
  p('Left oak rafter',points,6,6);
  p('Right oak rafter',points.map(([x,y])=>[160-x,y]),6,6);
 }
 p('Central ridge timber',[[78,0],[82,0],[82,36],[78,36]],6,6);
 l('Left rafter underside',[[6,1],[18,35]],0);
 l('Right rafter underside',[[154,1],[142,35]],0);
 l('Ridge underside',[[82,1],[82,35]],0);
 l('Left restrained rafter light',[[3,2],[7,14]],14);
 l('Right restrained rafter light',[[157,2],[153,14]],14);
 l('Left inner rafter light',[[41,3],[43,13]],14);
 l('Right inner rafter light',[[119,3],[117,13]],14);
 // A transverse purlin makes the joinery legible and breaks the roof depth.
 p('Roof cross purlin',[[5,18],[155,18],[154,22],[6,22]],6,6);
 l('Purlin lower shadow',[[7,22],[153,22]],0);
 l('Purlin worn light',[[52,18],[70,18]],14);
 l('Purlin worn light',[[90,18],[108,18]],14);
 for(const x of [12,46,80,114,148])r('Purlin wooden peg',x,19,1,1,8,8);
 p('Cream plaster back wall',[[11,38],[149,38],[149,126],[11,126]],15);
 p('Left wall return',[[0,31],[11,39],[11,127],[0,144]],7);
 p('Right wall return',[[149,39],[160,31],[160,145],[149,126]],7);
 r('Eaves beam',8,36,144,5,6);l('Beam upper light',[[10,37],[65,37]],14);l('Beam upper light',[[95,37],[150,37]],14);l('Eaves center join',[[80,38],[80,40]],8);
 for(const x of [9,147]){r('Corner post',x,41,4,85,6);l('Corner light',[[x+1,44],[x+1,123]],14)}
 // Knee braces rise from the posts into the underside of the eaves beam.
 p('Left angle brace',[[12,58],[29,40],[34,40],[13,65]],6);
 l('Left brace joinery peg',[[12,61],[12,61]],8);
 l('Left brace joinery peg',[[31,41],[31,41]],8);
 p('Right angle brace',[[148,58],[131,40],[126,40],[147,65]],6);
 l('Right brace joinery peg',[[148,61],[148,61]],8);
 l('Right brace joinery peg',[[129,41],[129,41]],8);
 // Old limewash: a few shallow chips expose stone, with sparse hairline
 // settling cracks. Paint before fittings so every scar stays on the wall.
 for(const pts of [
  [[39,49],[46,49],[48,51],[46,53],[40,53],[41,51]],
  [[19,86],[24,85],[27,87],[26,90],[21,90],[21,88]],
  [[53,93],[58,93],[60,96],[58,98],[53,97],[54,95]],
  [[101,48],[107,48],[109,50],[106,52],[101,51]],
  [[141,94],[147,93],[148,97],[145,99],[141,98]],
  [[42,119],[47,117],[51,119],[51,127],[41,127]]
 ])p('Chipped limewash',pts,7,null);
 for(const pts of [
  [[39,53],[44,53]],[[21,90],[24,90]],[[54,97],[58,98]],
  [[103,51],[106,52]],[[145,99],[147,98]]
 ])l('Exposed stone lower edge',pts,8);
 for(const pts of [
  [[55,42],[55,48],[53,51],[54,55],[52,58]],
  [[54,51],[58,52],[60,54]],
  [[17,98],[19,101],[18,104],[21,106]],
  [[99,64],[102,67],[101,72],[103,75]],
  [[128,46],[127,50],[130,53],[129,57]],
  [[128,51],[124,53]],
  [[44,95],[44,99],[47,102]],
  [[115,114],[117,118],[116,123]]
 ])l('Fine plaster settling crack',pts,7);
 // Broken damp traces descend from the sill and the old shelf fixings.
 l('Old sill water trace',[[67,90],[67,94],[68,96],[68,99]],7);
 l('Old sill water trace',[[94,90],[94,93],[93,95]],7);
 for(const [x,y]of [[25,81],[47,80],[114,80],[136,79]]){
  l('Shelf fixing wear',[[x,y],[x,y+3]],7);
 }
 // Low window sill is just above the head of a person standing at the bench.
 r('Oak window reveal',66,56,30,32,6);r('Window shadow',69,59,24,25,0);
 r('Blue garden sky',70,60,22,23,9,9);
 p('Window cloud',[[71,65],[75,63],[78,64],[81,67],[87,67],[90,69],[71,69]],15,null);
 // Filled polygons omit their right edge; include the final glass column.
 p('Green garden view',[[70,80],[74,73],[78,77],[82,70],[87,75],[93,73],[93,84],[70,84]],2,null);
 l('Garden skyline contour',[[70,80],[74,73],[78,77],[82,70],[87,75],[92,73]],0);
 l('Distant tree shadow',[[80,81],[82,75],[84,80]],0);
 l('Window mullion',[[81,60],[81,83]],6);l('Window transom',[[70,71],[92,71]],6);
 r('Deep window sill',64,87,34,3,6);l('Sill top light',[[65,87],[96,87]],14);
 // Shelves are above the standing character's head, not at a giant's waist.
 for(const [x,y,w]of [[20,76,31],[111,75,28]]){
  r('Pot shelf',x,y,w,3,6);p('Shelf bracket',[[x+3,y+3],[x+7,y+3],[x+3,y+8]],6);
 }
 for(const [x,y,w,c]of [[24,69,5,4],[37,69,6,4],[114,68,6,4],[129,68,5,6]]){
  p('Hand-sized flowerpot',[[x,y],[x+w,y],[x+w-1,y+7],[x+1,y+7]],c);
  r('Pot rim',x-1,y,w+2,2,6);l('Pot highlight',[[x+1,y+3],[x+1,y+5]],12);
 }
 l('Shelf herb',[[117,67],[117,61],[114,59]],2);l('Shelf herb',[[117,64],[121,61]],2);
 // The wall tool rack is reachable, with ordinary-sized hanging tools.
 r('Tool peg rail',106,87,30,3,6);
 for(const x of [111,121,132])l('Iron peg',[[x,89],[x,92]],0);
 l('Trowel handle',[[111,92],[111,98]],6);p('Trowel blade',[[109,98],[113,98],[113,102],[111,105],[109,102]],8);l('Trowel edge',[[110,99],[110,102]],7);
 l('Pruning hook handle',[[121,92],[121,102]],6);l('Pruning hook',[[121,93],[125,93],[126,96]],8);
 l('Hanging small rake',[[132,92],[132,103]],6);l('Rake head',[[129,102],[135,102]],8);for(const x of [129,132,135])l('Rake tooth',[[x,102],[x,105]],8);
 // Flagstones meet furniture at the shared y126 ground plane.
 p('Flagstone floor',[[11,126],[149,126],[160,143],[160,168],[0,168],[0,143]],8);
 l('Back floor edge',[[12,127],[148,127]],0);
 for(const pts of [[[0,143],[51,143]],[[60,143],[112,143]],[[121,143],[159,143]],[[0,163],[45,163]],[[55,163],[107,163]],[[117,163],[159,163]],[[35,128],[24,142]],[[80,128],[79,142]],[[125,128],[139,142]],[[53,145],[45,162]],[[110,145],[119,162]]])l('Selected floor joints',pts,0);
 // Bench worktop y108 over feet y129. Both are in the character's scale.
 p('Bench contact shadow',[[55,127],[102,127],[106,132],[54,132]],0,null);
 p('Rear bench legs',[[62,111],[65,111],[65,127],[62,127]],6);
 p('Rear bench legs',[[95,110],[98,110],[98,127],[95,127]],6);
 p('Oak worktop',[[59,104],[98,104],[103,108],[100,112],[58,112],[56,108]],6);
 l('Worktop light edge',[[58,107],[100,107]],14);l('Back worktop edge',[[60,104],[98,104]],0);
 p('Left front leg',[[59,112],[63,112],[63,128],[64,130],[58,130],[59,126]],6);
 p('Right front leg',[[96,112],[100,112],[100,126],[102,130],[96,130]],6);
 l('Leg light',[[60,114],[60,127]],14);l('Leg light',[[98,114],[98,127]],14);
 r('Bench apron',63,112,33,4,6);l('Apron joint',[[65,114],[93,114]],0);
 r('Small tool drawer',74,113,15,7,6);r('Iron drawer pull',79,115,5,2,0);
 p('Lower bench shelf',[[63,123],[96,123],[98,126],[62,126]],6);l('Shelf edge',[[65,124],[94,124]],14);
 p('Small seed sack',[[68,123],[67,119],[69,117],[73,117],[75,120],[74,123]],6);l('Sack tie',[[69,119],[73,119]],14);
 p('Small pot on lower shelf',[[87,119],[93,119],[92,124],[88,124]],4);l('Pot lip',[[86,119],[94,119]],6);
 // Spare boards are about a standing person's height, not giant pillars.
 // Sawn lumber has constant width, parallel edges and square-cut ends.
 for(const [x,y]of [[18,97],[26,91],[34,101]]){
  r('Leaning spare board',x,y,5,126-y,6);
  // Restrained edge light, shaded thickness and a few visible grain marks.
  l('Board side face',[[x+4,y+2],[x+4,124]],8);
  l('Square cut end',[[x+1,y+1],[x+3,y+1]],14);
  l('Board edge light',[[x+1,y+3],[x+1,y+9]],14);
  l('Board lower edge light',[[x+1,118],[x+1,123]],14);
  const knot=y+Math.floor((126-y)*.57);
  l('Board grain',[[x+3,y+6],[x+3,y+9]],8);
  l('Board grain below knot',[[x+2,knot+5],[x+2,Math.min(123,knot+7)]],8);
  l('Board knot top',[[x+2,knot-1],[x+3,knot]],8);
  l('Board knot heart',[[x+2,knot],[x+2,knot]],0);
  l('Board knot lower',[[x+3,knot+1],[x+2,knot+2]],8);

 }
 // Wide native pixels require a taller profile for a rounded display silhouette.
 // The base stays on the same floor and inside its existing collision footprint.
 p('Barrel shadow',[[131,126],[145,126],[148,130],[129,130]],0,null);
 p('Small storage barrel',[[133,101],[142,101],[145,108],[146,117],[144,128],[132,128],[130,117],[131,108]],6);
 l('Barrel left wood light',[[133,105],[132,112],[132,119]],14);
 l('Barrel stave',[[136,105],[135,115],[136,126]],0);
 l('Barrel stave',[[141,105],[142,115],[141,126]],0);
 p('Barrel top',[[133,100],[137,98],[141,99],[143,102],[141,104],[134,104],[132,102]],6);
 l('Barrel top light',[[134,101],[137,100],[141,101]],14);
 l('Lid plank seam',[[136,102],[140,102]],6);
 p('Upper curved iron hoop',[[131,107],[134,108],[142,108],[145,107],[145,110],[142,111],[133,111],[131,110]],8,8);
 l('Upper hoop light',[[132,108],[135,109],[142,109],[144,108]],7);
 p('Lower curved iron hoop',[[131,120],[134,121],[142,121],[145,120],[145,123],[142,124],[134,124],[131,123]],8,8);
 l('Lower hoop light',[[132,121],[135,122],[142,122],[144,121]],7);
 p('Low terracotta floor pot',[[9,121],[16,121],[15,128],[11,128]],4);r('Pot lip',8,120,9,2,6);
 l('Doorway threshold',[[63,165],[97,165]],6);
};
