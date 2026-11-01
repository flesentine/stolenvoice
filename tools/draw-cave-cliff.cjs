// The cave is a human-scale opening in an offscreen rocky escarpment.
module.exports=function({fill,stroke,named=()=>{}}){
 const p=(name,points,color)=>{named(name);fill(points,color,null)};
 const l=(name,points,color)=>{named(name);stroke(points,color)};
 p('Cliff continuous silhouette',[[125,48],[129,33],[134,28],[133,19],[142,10],[149,12],[155,6],[160,8],[160,112],[150,109],[139,102],[133,93],[131,73],[126,65]],8);
 p('Cliff upper sunlit plane',[[129,46],[133,34],[139,30],[137,21],[144,14],[150,17],[156,10],[160,11],[160,23],[151,25],[147,32],[138,34],[135,46]],7);
 p('Cliff broken middle ledge',[[128,52],[137,45],[144,43],[150,35],[160,31],[160,37],[153,40],[148,48],[140,48],[134,54]],7);
 p('Cliff left sloping face',[[132,60],[138,52],[145,50],[142,60],[137,65],[136,79],[139,89],[136,91],[133,81]],7);
 l('Cliff upper strata',[[142,25],[150,22],[156,23],[159,21]],8);
 l('Cliff fractured seam',[[151,14],[148,19],[150,22]],8);
 l('Cliff middle bedding',[[143,38],[149,38],[154,35]],8);
 l('Cliff narrow fissure',[[136,37],[137,41],[134,46]],0);
 // An open recess, not a freestanding stone arch perched above the path.
 p('Cave recessed reveal',[[139,99],[139,72],[143,61],[149,55],[155,60],[160,72],[160,100]],7);
 p('Cave deep interior',[[142,98],[142,73],[146,64],[150,60],[154,66],[157,75],[157,98]],0);
 p('Cave right rock return',[[154,64],[160,73],[160,99],[157,98],[157,75]],8);
 l('Cave left lip',[[140,96],[140,74],[144,64],[149,58]],15);
 l('Cave roof fracture',[[151,57],[151,61],[154,64]],8);
 l('Cave sill',[[141,99],[157,99]],7);
 // Broad ledge meets the mouth and descends into the existing far-bank trail.
 p('Cave access ledge',[[140,99],[157,99],[160,103],[160,108],[151,108],[143,105],[137,104]],7);
 l('Ledge lower shadow',[[140,104],[150,108],[159,108]],8);
 p('Far bank climbing trail',[[160,122],[148,120],[140,109],[137,103],[140,100],[149,100],[152,102],[145,103],[146,108],[151,114],[160,113]],14);
 l('Trail worn edge',[[149,118],[143,109],[140,104]],6);
 l('Cave threshold light',[[143,99],[154,99]],15);
 p('Cliff foot slab',[[155,110],[158,108],[160,110],[160,113],[155,113],[152,111]],8);
 named('Structure');
};
