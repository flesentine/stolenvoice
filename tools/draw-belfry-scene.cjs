// A working belfry: recessed masonry, timber truss and a clear bell mechanism.
// Bell/rope interaction and the left staircase retain their native positions.
module.exports=function belfry({fill,stroke,named=()=>{}}){
 const Agi=require('../editor/agi-picture.js'),supportInk=[];let captureSupport=false;
 const p=(name,pts,c,e=0)=>{if(captureSupport)supportInk.push({type:'polygon',name,points:pts,color:c,outline:e});named(name);fill(pts,c,e)};
 const l=(name,pts,c=0)=>{if(captureSupport)supportInk.push({type:'line',name,points:pts,color:c});named(name);stroke(pts,c)};
 const r=(name,x,y,w,h,c,e=0)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
 p('Dark tower silhouette',[[0,0],[160,0],[160,168],[0,168]],0,null);
 // Red roof boarding and stout crossing timbers replace the empty ceiling.
 p('Red roof underside',[[0,0],[160,0],[150,20],[79,29],[10,20]],4);
 p('Left roof shadow',[[0,0],[12,0],[69,26],[56,25]],0,null);
 p('Right roof shadow',[[149,0],[160,0],[101,26],[90,26]],0,null);
 for(const pts of [[[5,0],[13,0],[77,28],[69,28]],[[48,0],[54,0],[82,28],[76,28]],[[112,0],[118,0],[89,28],[83,28]],[[151,0],[159,0],[99,28],[91,28]]])p('Oak roof rafter',pts,6);
 l('Rafter lit edge',[[11,1],[72,26]],14);l('Rafter lit edge',[[52,1],[79,26]],14);l('Rafter lit edge',[[116,1],[86,26]],14);
 l('Roof boarding joint',[[25,6],[48,17]],0);l('Roof boarding joint',[[131,9],[110,19]],0);
 // Side returns turn the wall into a space rather than a flat gray backdrop.
 p('Tower back wall',[[7,28],[153,28],[153,126],[7,126]],7);
 p('Left wall return',[[0,21],[7,29],[7,126],[0,139]],8);
 p('Right wall return',[[153,29],[160,21],[160,138],[153,126]],8);
 // A small number of large, irregular stones describe the construction.
 for(const pts of [[[8,39],[32,39]],[[44,41],[66,41]],[[97,40],[124,40]],[[136,39],[153,39]],[[9,63],[32,63]],[[44,64],[63,64]],[[105,63],[123,63]],[[138,63],[153,63]],[[8,86],[31,86]],[[45,86],[60,86]],[[107,86],[123,86]],[[136,86],[153,86]],[[8,108],[31,108]],[[44,109],[63,109]],[[104,109],[122,109]],[[137,108],[153,108]]])l('Broken stone course',pts,8);
 for(const [x,y]of [[29,32],[48,46],[117,44],[147,45],[27,69],[53,91],[115,91]])l('Selected block joint',[[x,y],[x,y+5],[x+3,y+6]],8);
 // Shallow wall bays give the lancets real depth and a distinct stone frame.
 function window(x,y,w,h,village){
  p('Recessed window shadow',[[x-4,y+h+2],[x-4,y+9],[x+w/2,y-5],[x+w+4,y+9],[x+w+4,y+h+2]],0);
  p('Stone window surround',[[x-3,y+h],[x-3,y+8],[x+w/2,y-3],[x+w+3,y+8],[x+w+3,y+h]],8);
  p('Window sky opening',[[x,y+h],[x,y+10],[x+w/2,y],[x+w,y+10],[x+w,y+h]],9);
  l('Window lit reveal',[[x-2,y+h-2],[x-2,y+9],[x+w/2,y-2]],7);
  l('Window dark reveal',[[x+w/2+1,y-1],[x+w+2,y+9],[x+w+2,y+h]],0);
  p('Cloud beyond window',[[x+1,y+25],[x+4,y+23],[x+7,y+19],[x+10,y+20],[x+12,y+24],[x+w-1,y+26],[x+1,y+27]],15,null);
  p('Distant blue hills',[[x,y+h],[x,y+h-17],[x+4,y+h-22],[x+8,y+h-18],[x+12,y+h-23],[x+w,y+h-16],[x+w,y+h]],1,null);
  p('Distant green fields',[[x,y+h],[x,y+h-9],[x+5,y+h-15],[x+9,y+h-12],[x+w,y+h-17],[x+w,y+h]],2,null);
  l('Sunlit field strip',[[x+1,y+h-5],[x+w-1,y+h-8]],10);
  // Three small village silhouettes give each view its own landmark.
  if(village==='cottage'){
   r('Village cottage chimney',x+4,y+h-16,1,5,8,null);
   r('Village cottage plaster',x+4,y+h-9,6,4,7,null);
   for(let row=0;row<5;row++)l('Village cottage red roof',[[x+7-row,y+h-14+row],[x+7+row,y+h-14+row]],4);
   l('Village cottage door',[[x+7,y+h-7],[x+7,y+h-5]],6);
   l('Village cottage window',[[x+5,y+h-8],[x+5,y+h-8]],1);
  }else if(village==='chapel'){
   r('Village chapel tower',x+4,y+h-15,5,10,7,null);
   // Center each native scanline over the five-pixel tower. A clean apex
   // and level eaves keep this tiny roof from looking skewed or detached.
   for(let row=0;row<7;row++){
    const half=Math.floor(row/2);
    l('Village chapel slate spire',[[x+6-half,y+h-22+row],[x+6+half,y+h-22+row]],8);
   }
   l('Village chapel level eaves',[[x+3,y+h-15],[x+9,y+h-15]],8);
   l('Village chapel belfry slit',[[x+6,y+h-13],[x+6,y+h-11]],1);
   r('Village chapel nave',x+10,y+h-9,6,4,7,null);
   p('Village chapel nave roof',[[x+9,y+h-9],[x+13,y+h-13],[x+17,y+h-9]],6,null);
   l('Village chapel door',[[x+13,y+h-7],[x+13,y+h-5]],8);
  }else{
   r('Village barn plaster',x+3,y+h-9,10,4,7,null);
   p('Village barn hipped thatch',[[x+2,y+h-9],[x+5,y+h-14],[x+10,y+h-14],[x+14,y+h-9]],6,null);
   l('Village barn roof light',[[x+5,y+h-13],[x+9,y+h-13]],14);
   l('Village barn timber',[[x+3,y+h-8],[x+13,y+h-8]],6);
   l('Village barn doors',[[x+7,y+h-7],[x+7,y+h-5],[x+9,y+h-5],[x+9,y+h-7]],6);
  }
  for(const [a,b]of [[x-2,y+20],[x+w,y+41],[x-2,y+61]])l('Window voussoir joint',[[a,b],[a+3,b]],0);
  p('Deep stone sill',[[x-4,y+h],[x+w+4,y+h],[x+w+3,y+h+4],[x-5,y+h+4]],8);
  l('Sill light',[[x-2,y+h+1],[x+w+2,y+h+1]],7);
 }
 window(8,43,16,69,'cottage');window(59,39,23,73,'chapel');window(141,43,17,69,'barn');
 // Major support timbers, shoulders and black iron straps explain the load.
 r('Head beam',0,25,160,6,6);l('Head beam light',[[2,26],[157,26]],14);
 captureSupport=true;
 for(const x of [126]){
  p('Vertical oak support',[[x,30],[x+6,30],[x+7,125],[x,125]],6);
  l('Post light edge',[[x+1,33],[x+2,121]],14);
  p('Post stone socket',[[x-2,122],[x+8,122],[x+10,126],[x-3,126]],8);
  for(const y of [31,116]){r('Black iron post strap',x-1,y,8,3,0);r('Strap bolt',x+1,y+1,1,1,7,7);r('Strap bolt',x+5,y+1,1,1,7,7)}
 }
 // Knee brace connects the head beam's underside to the post below it.
 // Both ends bear on timber; nothing terminates in the window opening.
 p('Right knee brace',[[112,30],[117,30],[129,43],[126,47]],6);
 l('Brace edge',[[115,32],[126,44]],14);
 l('Brace upper peg',[[116,32],[116,33]],8);
 l('Brace lower peg',[[127,43],[127,44]],8);
 captureSupport=false;
 // Mirror finished native ink, including outlines and highlights. Reflecting
 // polygon coordinates alone can give one edge an extra rasterized pixel.
 const supportPixels=Agi.render([{type:'polygon',name:'Temporary field',points:[[0,0],[160,0],[160,168],[0,168]],color:5,outline:null},...supportInk]);
 for(let y=30;y<=126;y++)for(let x=30;x<=62;){
  const color=supportPixels[y*160+168-x],left=x;
  while(x<=62&&supportPixels[y*160+168-x]===color)x++;
  if(color!==5)l('Mirrored left oak support',[[left,y],[x-1,y]],color);
 }

 // An unlit storm lantern belongs to a bell ringer, and breaks the left bay.
 l('Lantern wall hook',[[48,68],[48,63],[51,61]],0);
 p('Lantern cap',[[45,72],[48,68],[51,72],[51,74],[45,74]],6);
 r('Lantern iron body',45,74,6,12,0);
 r('Unlit blue lantern glass',46,76,4,7,3,3);
 l('Lantern glass reflection',[[46,76],[46,80]],11);
 l('Lantern crossbar',[[45,81],[51,81]],0);r('Lantern foot',45,85,6,2,6);
 // Painted guild plaque adds restrained royal blue to the other wall bay.
 // Center every native scanline on x116; polygon edge rounding can otherwise
 // make tiny heraldic designs visibly heavier on one side.
 for(let y=56;y<=74;y++){
  l('Bell-ringers guild plaque',[[111,y],[121,y]],0);
  if(y>56)l('Plaque oak frame',[[112,y],[120,y]],6);
 }
 for(const [y,half]of [[75,4],[76,3],[77,2],[78,0]]){
  l('Plaque pointed base',[[116-half,y],[116+half,y]],0);
  if(half>0)l('Plaque oak frame',[[117-half,y],[115+half,y]],6);
 }
 for(let y=58;y<=72;y++)l('Blue plaque face',[[113,y],[119,y]],1);
 for(const [y,half]of [[73,3],[74,2],[75,1],[76,0]])l('Blue plaque point',[[116-half,y],[116+half,y]],1);
 for(const [y,half]of [[62,0],[63,0],[64,0],[65,1],[66,1],[67,1],[68,2],[69,3],[70,3],[71,0]])l('Tiny gold bell emblem',[[116-half,y],[116+half,y]],14);
 l('Plaque hanging pin',[[116,53],[116,56]],0);
 // Bell suspension joins the main beam; each dark part has a purpose.
 r('Bell axle',75,28,26,5,6);l('Axle light',[[77,29],[99,29]],14);
 for(const x of [81,94]){r('Bell iron bearing strap',x,25,3,12,0);r('Bearing bolt',x+1,27,1,2,7,7);r('Bearing bolt',x+1,34,1,2,7,7)}
 // Keep the established bell silhouette and rope location for the puzzle.
 p('Great bell silhouette',[[81,37],[95,37],[100,42],[101,57],[104,68],[112,79],[111,89],[67,89],[65,80],[72,70],[76,57],[77,43]],6);
 p('Bell lit bronze plane',[[82,40],[91,40],[95,45],[94,57],[98,69],[107,79],[70,79],[77,68],[81,56]],14,null);
 p('Bell shadow return',[[95,41],[99,44],[99,57],[103,70],[110,79],[105,79],[99,68],[95,56]],6,null);
 l('Bell restrained highlight',[[82,45],[82,55]],15);l('Bell moulding',[[77,69],[99,69]],6);
 for(const x of [81,86,91])l('Bell cast inscription',[[x,61],[x+2,62]],6);
 p('Bell dark mouth',[[67,81],[77,78],[99,78],[111,82],[109,89],[71,89]],0,6);
 l('Bell mouth lip',[[69,82],[108,82]],14);l('Bell lower return',[[72,88],[107,88]],6);
 p('Bell clapper',[[85,88],[91,88],[94,92],[91,96],[86,95],[83,92]],6);
 l('Bell clapper',[[91,95],[91,95]],6); // Close the one-pixel lower-edge notch.
 l('Short frayed bell rope',[[88,96],[88,113],[86,118]],6);l('Rope light',[[89,97],[89,112]],14);
 // Floor remains unobstructed; one pair of cleats sits on the support post.
 r('Wooden floor',0,126,160,42,6,6);
 for(const pts of [[[0,145],[159,145]],[[0,163],[159,163]],[[47,126],[35,144]],[[74,126],[70,144]],[[106,126],[113,144]],[[138,126],[154,144]],[[53,146],[49,162]],[[95,146],[101,162]]])l('Floor board joint',pts,0);
 for(const pts of [[[16,132],[21,135],[25,135]],[[41,151],[38,154],[38,158]],[[64,130],[63,135],[65,138]],[[91,150],[94,154],[93,158]],[[123,134],[129,138],[132,138]],[[144,151],[149,155],[150,158]]])l('Warm timber grain',pts,4);
 for(const pts of [[[18,134],[20,135]],[[61,134],[61,137]],[[127,135],[130,137]]])l('Worn floor light',pts,14);
 for(const [x,y]of [[31,143],[70,143],[115,143],[49,162],[101,162]])r('Floor nail head',x,y,1,1,8,8);
 l('Selected timber knot',[[79,134],[82,135],[85,134]],0);l('Selected timber knot',[[117,154],[121,154]],0);
 r('Bell-rope cleat',125,106,9,2,0);r('Cleat peg',128,103,2,7,6);l('Cleat lit edge',[[128,104],[128,108]],14);
 // The stair opening and balustrade are legible and in the same exit zone.
 p('Left stair opening',[[0,168],[0,140],[20,140],[20,146],[16,146],[16,154],[10,154],[10,162],[5,162],[5,168]],0);
 l('Descending tread',[[1,142],[18,142]],8);l('Descending tread',[[1,152],[13,152]],8);l('Descending tread',[[1,161],[8,161]],8);
 for(const [x,y]of [[3,122],[15,118]]){r('Stair newel post',x,y,3,22,6);r('Newel cap',x-1,y-1,5,3,6);l('Newel highlight',[[x+1,y+3],[x+1,y+19]],14)}
 p('Sloped oak handrail',[[0,130],[19,117],[22,120],[1,134]],6);l('Handrail light',[[1,130],[19,118]],14);
};
