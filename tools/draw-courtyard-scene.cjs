// Color and shape composition for the service courtyard, on the locked grid.
// Door thresholds remain (32,95) and (128,95); green ground is walkable.
module.exports=function courtyard({fill,stroke,named=()=>{}}){
 const p=(name,points,color,outline=0)=>{named(name);fill(points,color,outline)};
 const l=(name,points,color=0)=>{named(name);stroke(points,color)};
 const r=(name,x,y,w,h,c,e=0)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
 p('Blue sky',[[0,0],[160,0],[160,168],[0,168]],9,null);
 for(const [x,y]of [[26,15],[94,9]])p('White cloud',[[x,y],[x+5,y-3],[x+8,y-8],[x+13,y-8],[x+17,y-2],[x+22,y-2],[x+27,y+2],[x,y+2]],15,null);
 // Sunlit stone planes and sparse joints, inspired by the original AGI castle.
 // Dark grey is reserved for recesses and narrow structural returns.
 p('Receding curtain wall',[[0,44],[92,25],[160,16],[160,113],[0,113]],7,null);
 p('Curtain wall return',[[155,18],[160,16],[160,113],[155,110]],8,null);
 p('Parapet underside',[[0,47],[92,28],[160,19],[160,21],[92,30],[0,49]],8,null);
 for(const [x,y]of [[0,39],[16,36],[32,33],[48,30],[64,27],[80,24],[96,21],[112,18],[128,15],[144,12]]){
  r('Battlement',x,y,8,8,7,null);
  l('Merlon lower return',[[x,y+8],[x+7,y+8]],8);
 }
 // A few disconnected masonry marks suggest blocks without a brick grid.
 for(const [x,y,w]of [[111,32,6],[137,27,7],[62,88,7],[74,103,6],[145,92,5]]){
  l('Stone joint',[[x,y],[x+w,y],[x+w,y+2]],8);
 }
 for(const pts of [[[98,27],[105,26]],[[122,23],[128,22]],[[143,20],[150,19]]])l('Parapet worn edge',pts,15);
 // One narrow arrow loop gives the broad upper plane a readable scale.
 r('Arrow loop recess',143,33,3,10,8,null);
 l('Arrow loop interior',[[144,34],[144,40]],0);
 l('Arrow loop lower edge',[[144,42],[145,42]],15);
 // A small cut-stone turret, with a centered tiled cap and recessed lancet.
 p('Turret',[[66,17],[78,17],[78,33],[66,33]],7,8);
 p('Turret dark facet',[[76,18],[78,18],[78,32],[76,32]],8,null);
 l('Turret left stone light',[[67,19],[67,29]],15);
 l('Turret masonry joint',[[68,21],[70,21]],8);
 l('Turret masonry joint',[[73,30],[75,30],[75,31]],8);
 l('Turret masonry joint',[[68,27],[69,27]],8);
 // Small pointed window has a stone reveal and a sill, rather than a black box.
 p('Turret window recess',[[70,28],[70,23],[72,20],[74,23],[74,28]],8,null);
 l('Turret slit crown',[[72,22],[72,23]],0);
 for(let y=24;y<=27;y++)l('Turret slit',[[71,y],[73,y]],0);
 l('Turret window sill',[[70,29],[74,29]],15);
 l('Turret base course',[[65,33],[79,33]],8);
 l('Turret base light',[[66,32],[75,32]],7);
 // Inclusive spans make the roof's silhouette exactly symmetric about x72.
 for(let y=3;y<=16;y++){
  const half=Math.floor((y-3)*12/13);
  l('Red turret roof outline',[[72-half,y],[72+half,y]],6);
  if(half>0)l('Red turret roof',[[73-half,y],[71+half,y]],4);
 }
 l('Turret roof eave',[[60,17],[84,17]],6);
 l('Turret eave shadow',[[62,18],[82,18]],8);
 for(const pts of [[[69,8],[71,9]],[[65,12],[68,12]],[[75,12],[77,13]]])l('Turret tile joint',pts,6);
 l('Turret tile glint',[[68,9],[69,8]],12);
 l('Flagstaff',[[72,0],[72,3]],0); // Cloth is painted by the live pennant animation.
 // One-pixel contour around a filled leaf mass, with selected dark creases.
 // Avoid the old wide black inset between two offset silhouettes.
 p('Ivy silhouette along wall',[[0,37],[8,39],[12,35],[22,38],[27,34],[36,36],[42,33],[50,37],[56,34],[65,39],[73,36],[81,40],[89,39],[94,43],[99,42],[105,47],[108,54],[104,58],[108,65],[103,70],[105,78],[99,83],[102,91],[98,101],[93,106],[86,103],[88,95],[83,89],[86,81],[79,76],[81,68],[74,64],[67,65],[61,60],[54,63],[48,57],[39,61],[32,55],[25,57],[18,51],[9,54],[0,50]],2);
 p('Green wall ivy',[[0,39],[8,42],[13,39],[21,42],[27,38],[36,40],[42,37],[49,41],[56,38],[65,43],[73,40],[81,44],[88,43],[94,47],[99,46],[103,51],[101,56],[104,62],[100,68],[102,75],[97,80],[99,87],[96,96],[92,101],[89,99],[91,92],[87,87],[90,79],[83,75],[85,66],[77,61],[69,62],[61,56],[54,59],[48,53],[39,57],[32,51],[25,53],[18,47],[10,50],[0,47]],2,null);
 for(const pts of [[[8,43],[12,42],[16,44]],[[47,41],[52,43],[56,41]],[[72,46],[76,45],[80,47]],[[95,55],[99,54]],[[91,83],[94,81]],[[60,53],[63,54]]])l('Selected ivy light',pts,10);
 l('Ivy hanging fold',[[103,56],[101,61],[103,65]],0);
 l('Ivy lower fold',[[98,83],[96,88],[98,91]],0);
 // Overlapping leaf fans interrupt the large green curtain, following its drape.
 for(const pts of [
 [[3,43],[9,40],[15,43],[20,42],[18,45],[11,46],[6,45]],
 [[30,40],[35,38],[42,40],[48,39],[46,43],[39,44],[34,42]],
 [[54,43],[61,41],[67,44],[72,43],[69,47],[62,48],[57,46]],
 [[76,46],[82,44],[90,47],[97,47],[98,51],[91,52],[85,50],[80,51]],
 [[86,57],[92,54],[99,57],[99,61],[94,64],[88,62]],
 [[89,70],[94,67],[99,70],[98,74],[94,77],[90,75]],
 [[90,86],[95,83],[98,86],[96,91],[92,94],[90,91]]
 ])p('Ivy leaf fan',pts,10,null);
 for(const pts of [[[18,46],[23,44],[27,45]],[[47,48],[51,46],[57,48]],[[75,53],[81,51],[85,53]],[[88,64],[92,66],[94,65]],[[90,78],[94,80],[97,78]],[[91,96],[94,95]]])l('Ivy overlapping seam',pts,2);
 l('Exposed ivy stem',[[83,57],[86,65],[85,72],[88,79]],6);
 // Ivy follows the wall behind the hanging cloth, trailing below its point.
 p('Trailing ivy behind banner',[[99,74],[103,76],[106,79],[105,82],[108,85],[106,88],[107,91],[104,94],[103,98],[100,97],[98,94],[100,91],[97,88],[98,84],[96,81]],2,2);
 p('Trailing ivy leaf light',[[101,84],[104,83],[106,85],[104,87],[101,86]],10,null);
 p('Trailing ivy lower leaf',[[100,91],[103,90],[105,92],[103,94],[100,93]],10,null);
 // Cream plaster and red tiles separate the gardener's building from stone.
 // One centered roof, a square timber frame and a properly inset doorway.
 p('Shed side shadow',[[50,61],[56,64],[56,101],[50,101]],6,8);
 p('Shed plaster face',[[7,61],[29,40],[51,61],[51,101],[7,101]],15,8);
 p('Shed tiled roof silhouette',[[2,59],[29,34],[56,59],[53,62],[29,40],[5,62]],6,null);
 p('Red shed tiles',[[3,59],[29,35],[55,59],[53,60],[29,38],[5,61]],4,null);
 l('Single shed eave contour',[[5,62],[29,40],[53,62]],0);
 l('Roof ridge highlight',[[4,58],[29,35],[54,58]],6);
 // Tile courses follow each slope; short joints replace the old checkerboard.
 for(const side of [-1,1]){
  for(const d of [7,14,21]){
   const x=29+side*d,y=39+Math.round(d*.87);
   l('Selected tile seams',[[x,y],[x+side*3,y+2]],6);
  }
 }
 l('Sunlit tile edge',[[14,51],[19,47]],12);
 for(const x of [8,48]){
  r('Shed corner timber',x,62,2,39,6,null);
  l('Timber lit edge',[[x,64],[x,99]],14);
 }
 l('Gable tie beam',[[10,61],[48,61]],6);
 // Small fitted knee braces end on the uprights and tie beam.
 p('Left diagonal brace',[[10,62],[15,62],[10,69]],6,null);
 p('Right diagonal brace',[[43,62],[48,62],[48,69]],6,null);
 r('Shed window frame',13,66,8,13,6,null);
 r('Blue shed window',14,67,6,10,1,null);
 l('Window crossbar',[[14,72],[20,72]],14);
 l('Window sill',[[12,79],[22,79]],6);
 p('Window flower box',[[13,80],[21,80],[20,83],[14,83]],6,null);
 l('Window herb',[[16,80],[16,77]],2);l('Window herb',[[19,80],[20,77]],2);
 l('Plaster repair seam',[[17,88],[20,88],[20,90]],7);
 // Door uses final native coordinates; scaling a small leaf had distorted it.
 r('Shed door dark reveal',25,56,17,40,0,null);
 r('Shed door lintel',24,54,19,3,6,0);
 l('Doorframe light',[[25,58],[25,95]],7);
 l('Doorframe right return',[[42,58],[42,95]],8);
 p('Open oak door',[[43,59],[50,63],[50,97],[43,95]],6,8);
 l('Door free edge light',[[50,64],[50,95]],14);
 for(const x of [45,48])l('Door plank seam',[[x,65],[x,94]],8);
 for(const y of [67,87]){
  l('Door iron hinge',[[43,y],[49,y+2]],8);
  l('Door hinge pin',[[43,y-1],[43,y+2]],7);
 }
 l('Door latch plate',[[48,77],[48,81]],8);
 l('Door ring handle',[[48,78],[49,78],[49,80],[48,80]],0);
 // Garden pots stand against the wall, clear of the approach.
 for(const [x,y,c]of [[6,94,4],[49,95,6]]){
  p('Terracotta pot',[[x,y],[x+7,y],[x+6,y+10],[x+2,y+10]],c);
  r('Pot lip',x-1,y,9,2,6);l('Pot shine',[[x+2,y+3],[x+2,y+7]],12);
  l('Potted shoots',[[x+3,y],[x+3,y-7],[x,y-10]],2);l('Potted shoots',[[x+3,y-3],[x+7,y-8]],2);
 }
 // A royal entrance with a red gable, blue drapery and gold heraldry.
 p('Gallery gatehouse face',[[112,56],[129,36],[146,55],[146,112],[112,112]],7,8);
 p('Gatehouse shadow',[[142,56],[146,55],[146,112],[142,109]],8,null);
 p('Gallery red gable',[[111,55],[129,34],[148,54],[145,58],[129,39],[114,58]],4,6);
 l('Gable eave',[[113,55],[129,37],[146,55]],6);
 p('Blue entrance valance',[[116,54],[129,43],[141,54],[141,61],[135,58],[129,61],[122,58],[116,61]],1,null);
 l('Valance gold lower edge',[[117,59],[122,57],[129,60],[135,57],[140,59]],14);
 p('Entrance dark arch',[[119,96],[119,72],[122,64],[129,59],[136,64],[139,72],[139,96]],0);
 p('Arch stone surround',[[115,96],[115,71],[119,62],[129,55],[139,62],[143,71],[143,96],[139,96],[139,72],[136,65],[129,60],[122,65],[119,72],[119,96]],8,8);
 l('Arch left lit edge',[[116,94],[116,72],[120,64],[128,58]],7);
 for(const pts of [[[117,78],[120,78]],[[138,78],[142,78]],[[120,63],[122,66]],[[136,64],[139,62]]])l('Arch voussoir seam',pts,0);
 p('Blue carpet inside gallery',[[122,91],[137,91],[139,96],[120,96]],1,null);
 p('Royal shield',[[126,47],[132,47],[132,53],[129,57],[126,53]],14,6);
 p('Royal shield field',[[127,48],[131,48],[131,53],[129,55],[127,53]],1,null);
 l('Shield gold tree',[[129,49],[129,53]],14);l('Shield gold tree',[[127,51],[131,51]],14);
 // Matching, pixel-symmetric banners on either side of the royal arch.
 for(const x of [100,150]){
  const y=50,cx=x+4;
  l('Banner rod',[[x-1,y-2],[x+9,y-2]],6);
  // Horizontal native spans keep the tapered border symmetric after rasterizing.
  for(let row=0;row<=34;row++){
   const half=row<30?4:34-row;
   l('Banner gold border',[[cx-half,y+row],[cx+half,y+row]],14);
   if(row>0&&half>0)l('Banner blue field',[[cx-half+1,y+row],[cx+half-1,y+row]],1);
  }
  l('Heraldic bird body',[[cx,y+10],[cx,y+22]],14);
  for(const side of [-1,1]){
   l('Heraldic bird wing',[[cx+side*3,y+11],[cx+side*3,y+13],[cx,y+16]],14);
   l('Heraldic bird feet',[[cx,y+20],[cx+side*2,y+23],[cx+side*3,y+23]],14);
  }
 }
 // Replacing the enormous gray apron with a garden lawn gives this outdoor
 // room daylight, depth and a different identity from the indoor gallery.
 p('Courtyard lawn',[[0,101],[25,96],[40,96],[54,106],[104,106],[120,96],[140,96],[160,104],[160,168],[0,168]],2,null);
 p('Warm rear paving',[[0,101],[25,97],[40,97],[54,108],[105,108],[121,97],[140,97],[160,105],[160,117],[128,114],[106,120],[48,120],[19,113],[0,115]],6,null);
 for(const pts of [[[1,108],[25,108]],[[42,112],[54,112]],[[106,112],[118,112]],[[143,108],[158,108]],[[16,103],[17,107]],[[149,110],[148,115]]])l('Paving joints',pts,0);
 p('Left door threshold',[[25,96],[40,96],[42,99],[24,99]],7);l('Threshold light',[[26,97],[39,97]],15);
 p('Gallery threshold',[[119,96],[139,96],[142,99],[117,99]],7);l('Threshold light',[[120,97],[138,97]],15);
 // Distinct worn paving slabs break the earthen apron near the thresholds.
 for(const pts of [ [[1,103],[12,103],[15,107],[2,107]],[[15,108],[25,109],[28,112],[17,112]],[[141,102],[152,104],[154,107],[141,106]],[[125,111],[135,109],[142,111],[133,114]] ]){
  p('Worn courtyard paving stone',pts,7,8);
 }
 // The yellow fork retains the exact entrance and return paths.
 p('Golden forked path',[[29,98],[36,98],[69,126],[84,129],[116,106],[126,99],[135,99],[113,119],[91,137],[89,168],[49,168],[57,139],[51,128]],14,null);
 for(const [x,y]of [[37,103],[52,120],[87,138],[65,151],[73,162],[112,111]])l('Selected path wear',[[x,y],[x+2,y]],6);
 // The planted bed remains in its original collision footprint.
 p('Raised oak planter',[[51,111],[92,111],[95,114],[94,118],[50,118]],6,6);
 l('Planter upper edge',[[52,112],[92,112]],14);l('Planter return',[[92,113],[94,115],[94,117]],0);
 for(const x of [61,75,87])l('Planter plank joint',[[x,114],[x,117]],0);
 p('Planter dark soil',[[53,110],[91,110],[93,113],[52,113]],0,null);
 for(const [x,y]of [[57,107],[68,106],[80,107],[88,108]]){
  l('Flower stem',[[x,111],[x,y-2]],2);l('Flower leaves',[[x-3,y+2],[x,y+3],[x+3,y]],10);
  p('Garden flowers',[[x-2,y-2],[x,y-3],[x+2,y-2],[x+2,y],[x,y+1],[x-2,y]],12,null);r('Flower center',x,y-1,1,1,14,14);
 }
 // Cut-stone gate piers: a slim shaded return and a symmetric carved cap.
 for(const x of [7,132]){
  p('Gateway pier',[[x,143],[x+2,140],[x+14,140],[x+17,143],[x+17,168],[x,168]],8,null);
  p('Pier light face',[[x+1,144],[x+12,144],[x+12,168],[x+1,168]],7,null);
  l('Pier bevel light',[[x+1,145],[x+1,167]],15);
  p('Pier coping slab',[[x-1,140],[x+1,138],[x+15,138],[x+18,141],[x+17,144],[x,144]],8,null);
  l('Pier coping top',[[x+1,139],[x+14,139],[x+16,141]],7);
  l('Pier coping lip',[[x,142],[x+16,142]],7);
  p('Pier stone finial',[[x+1,137],[x+2,134],[x+5,131],[x+8,130],[x+11,131],[x+14,134],[x+15,137]],7,8);
  p('Finial shadow face',[[x+8,132],[x+11,133],[x+14,136],[x+8,136]],8,null);
  l('Pier finial glint',[[x+3,134],[x+6,132],[x+8,132]],15);
  // Staggered joints and one chipped corner suggest masonry, not a plain cylinder.
  l('Pier masonry joint',[[x+2,151],[x+11,151]],8);
  l('Pier masonry joint',[[x+7,152],[x+7,158],[x+12,158]],8);
  l('Pier worn corner',[[x+11,163],[x+10,164],[x+10,166]],8);
  // A single climbing stem with separate leaves keeps the stone face readable.
  l('Pier ivy stem',[[x+2,167],[x+3,161],[x+1,156],[x+4,151],[x+3,146]],6);
  for(const [dx,y,side]of [[3,147,-1],[3,151,1],[1,155,-1],[2,159,1],[3,163,-1],[2,167,1]]){
   p('Pier ivy leaf',[[x+dx,y],[x+dx+side*3,y-2],[x+dx+side*4,y],[x+dx+side*2,y+2]],2,null);
   l('Pier leaf vein',[[x+dx,y],[x+dx+side*2,y]],10);
  }
 }
 // Small broken blades suggest sunlit grass without broad neon puddles.
 for(const [x,y]of [[4,122],[28,138],[34,161],[113,129],[149,121],[112,154]]){
  l('Sunlit grass blades',[[x,y+1],[x+1,y-1],[x+3,y],[x+5,y-2]],10);
  l('Sunlit grass blades',[[x+7,y+2],[x+8,y],[x+10,y+1]],10);
  l('Sunlit grass blades',[[x+12,y],[x+14,y-1]],10);
 }
 // A handful of lawn tufts and flower heads, with a quiet open foreground.
 for(const [x,y]of [[9,127],[33,151],[116,143],[153,126]])l('Lawn grass',[[x,y],[x+1,y-3],[x+3,y],[x+4,y-2]],0);
 for(const [x,y]of [[3,139],[151,154],[35,164]]){p('Lawn flower',[[x,y-2],[x+2,y],[x,y+2],[x-2,y]],13,null);r('Flower center',x,y,1,1,14,14)}
};
