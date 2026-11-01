// Upgrade the seven remaining scenes and save locked-grid workshop projects.
// Reference images guide composition only; none are read or sampled here.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
const base=require('./agi-room-scenes.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/rooms');
const names={potting:'The Potting Shed',orchard:'The Old Orchard',bridge:'The Broken Bridge',mill:'The Old Watermill',grotto:'The Echo Grotto',belfry:'The Castle Belfry',courtyard:'The Castle Courtyard'};
function collect(room){
 const commands=[];let section='Structure';
 const named=label=>section=label;
 function clipSegment(a,b){
  let [x,y]=a,[xx,yy]=b,dx=xx-x,dy=yy-y,t0=0,t1=1;
  const ps=[-dx,dx,-dy,dy],qs=[x,159-x,y,167-y];
  for(let i=0;i<4;i++){if(ps[i]===0){if(qs[i]<0)return null;continue}const t=qs[i]/ps[i];if(ps[i]<0)t0=Math.max(t0,t);else t1=Math.min(t1,t);if(t0>t1)return null}
  return[[Math.round(x+t0*dx),Math.round(y+t0*dy)],[Math.round(x+t1*dx),Math.round(y+t1*dy)]];
 }
 function stroke(points,color=0){
  let chain=[];
  function flush(){if(chain.length){commands.push({type:'line',name:section,points:chain,color});chain=[]}}
  for(let i=1;i<points.length;i++){
   const clipped=clipSegment(points[i-1],points[i]);if(!clipped){flush();continue}
   if(chain.length&&chain[chain.length-1].join(',')!==clipped[0].join(','))flush();
   if(!chain.length)chain.push(clipped[0]);chain.push(clipped[1]);
  }
  flush();
 }
 function fill(points,color,outline=0){
  let shape=points.map(p=>p.map(Math.round));
  for(const [axis,bound,greater]of [[0,0,true],[0,160,false],[1,0,true],[1,168,false]]){
   const result=[];
   for(let i=0,j=shape.length-1;i<shape.length;j=i++){
    const a=shape[j],b=shape[i],ina=greater?a[axis]>=bound:a[axis]<=bound,inb=greater?b[axis]>=bound:b[axis]<=bound;
    if(ina!==inb){const t=(bound-a[axis])/(b[axis]-a[axis]);result.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])}
    if(inb)result.push(b);
   }
   shape=result;if(!shape.length)return;
  }
  shape=shape.map(p=>p.map(Math.round));shape=shape.filter((p,i)=>!i||p.join(',')!==shape[i-1].join(','));
  if(shape.length<3)return;
  commands.push({type:'polygon',name:section,points:shape,color,outline:Number.isInteger(outline)?outline:null});
 }
 const p=fill,l=stroke,r=(x,y,w,h,c,e=0)=>fill([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,e);
 if(room==='belfry'){require('./draw-belfry-scene.cjs')({fill,stroke,named});return commands}
 if(room==='potting'){require('./draw-potting-scene.cjs')({fill,stroke,named});return commands}
 if(room==='courtyard'){require('./draw-courtyard-scene.cjs')({fill,stroke,named});

  return commands}

 base(room,{fill,stroke,named});
 if(room==='belfry'){require('./draw-belfry-scene.cjs')({fill,stroke,named});return commands}
 if(room==='potting'){
  named('Workbench footing');p([[47,122],[126,122],[132,127],[45,127]],0,null);
  named('Oak trestle legs');
  p([[49,79],[55,79],[56,123],[50,123]],6);p([[119,79],[125,79],[126,123],[120,123]],6);
  l([[51,82],[52,120]],14);l([[121,82],[122,120]],14);
  named('Bench mortise joints');for(const x of [51,121]){r(x-1,82,5,3,6);r(x-1,114,5,3,6);l([[x,83],[x+2,83]],0)}
  named('Lower shelf and seed sacks');p([[54,111],[119,111],[122,116],[54,117]],6);l([[56,112],[117,112]],14);
  p([[74,109],[73,102],[75,99],[81,99],[84,103],[83,110]],6);l([[75,103],[81,103]],14);l([[78,105],[78,108]],0);
  p([[87,111],[86,106],[89,102],[94,102],[97,106],[96,111]],6);l([[88,106],[95,106]],0);
  named('Drawer hardware');r(71,80,24,14,6);r(74,83,18,8,6);l([[80,87],[86,87]],0);r(78,86,2,2,8);r(87,86,2,2,8);
  named('Back-wall hanging pegs');r(103,32,32,3,6);for(const x of [108,120,131])l([[x,34],[x,39]],0);
  named('Garden trowel');l([[108,38],[108,47]],6);p([[106,47],[110,47],[110,51],[108,54],[106,51]],8);l([[107,48],[107,51]],7);
  named('Pruning hook');l([[120,37],[120,48]],6);l([[120,39],[124,39],[125,42]],8);
  named('Twine peg shadow');l([[131,36],[131,40]],8);
  named('Herb pot on shelf');p([[114,43],[120,43],[119,51],[115,51]],4);r(113,42,8,2,6);
  l([[116,42],[116,37],[113,35]],2);l([[117,42],[119,36],[122,36]],2);l([[117,39],[121,39]],10);
  named('Storage barrel');p([[132,95],[147,95],[150,105],[148,123],[133,123],[131,108]],6);
  for(const x of [136,141,146])l([[x,99],[x-1,119]],0);
  p([[132,95],[146,94],[148,97],[146,100],[133,100]],6);l([[134,96],[146,96]],14);
  for(const y of [101,116]){r(132,y,17,3,8);l([[133,y],[148,y]],7)}
  named('Roof carpentry');for(const [x,y]of [[11,30],[148,30],[81,26]]){r(x,y,3,2,8);l([[x+1,y],[x+1,y+1]],0)}
  named('Threshold stones');l([[61,163],[99,163]],0);l([[63,165],[97,165]],6);
 }else if(room==='orchard'){
  named('Winding orchard path');
  p([[0,137],[12,135],[40,141],[65,139],[88,132],[96,131],[99,134],[89,138],[65,146],[42,150],[12,142],[0,145]],6,null);
  p([[0,138],[13,137],[40,143],[65,141],[88,134],[95,133],[89,136],[64,144],[42,147],[12,140],[0,142]],14,null);
  p([[124,135],[143,132],[160,132],[160,142],[143,140],[124,141]],14,null);
  named('Orchard path beyond hive');
  p([[95,132],[111,130],[125,130],[141,132],[160,132],[160,142],[140,139],[124,137],[110,137],[98,138]],6,null);
  p([[96,134],[111,132],[125,132],[141,134],[160,134],[160,139],[140,137],[124,135],[111,135],[98,136]],14,null);
  named('Apple clusters');
  for(const [x,y]of [[8,48],[29,62],[15,78],[54,75],[67,64],[75,77],[107,79],[127,83]]){
   // Taller native silhouette compensates for AGI's double-width pixels.
   // Two shoulders, a stem notch and a tapered base read as a single apple.
   l([[x,y],[x,y-2],[x+1,y-3]],6);
   p([[x-2,y+1],[x-1,y],[x,y+1],[x+1,y],[x+2,y+1],[x+2,y+4],[x+1,y+6],[x,y+5],[x-1,y+6],[x-2,y+4]],4,null);
   l([[x-1,y+1],[x-1,y+3]],12);
   l([[x,y+1],[x,y+2]],12);
   l([[x+1,y-2],[x+2,y-2]],10);
  }
  named('Bark forks');l([[17,104],[20,99],[20,90]],0);l([[16,115],[18,112]],0);l([[58,114],[58,103],[55,100]],0);l([[119,113],[120,108]],0);
  named('Hive stump and roots');p([[98,123],[108,123],[109,134],[106,132],[103,136],[101,131],[97,134]],6);l([[100,126],[101,132]],0);l([[106,125],[106,130]],14);
  require('./draw-straw-hive.cjs')({fill,stroke,named});
  require('./draw-blackthorn.cjs')({fill,stroke,named});


 }else if(room==='bridge'){
  named('Mill entrance');r(37,66,12,29,0);r(36,64,14,3,6);l([[37,68],[37,94]],7);l([[49,68],[49,94]],8);l([[37,95],[49,95]],7);
  named('Mill stone foundation');p([[6,88],[11,88],[14,94],[33,94],[36,90],[53,90],[54,96],[7,96]],8);l([[7,90],[11,90]],7);
  for(const [x,y]of [[29,87],[47,89]])l([[x,y],[x+5,y],[x+5,y+3]],0);
  named('Mill terracotta roof');
  // A continuous tiled cap replaces the black wedge across the right slope.
  p([[3,49],[23,29],[46,46],[44,49],[23,35],[8,51]],4,6);
  named('Mill roof eave shadow');l([[8,51],[23,35],[41,49]],8);
  named('Mill roof ridge');l([[4,48],[23,29],[45,46]],6);
  named('Mill tile courses');
  for(const pts of [[[8,46],[17,37]],[[13,44],[22,35]],[[26,35],[31,39]],[[34,40],[40,44]]])l(pts,6);
  named('Mill selected tile lights');l([[9,47],[13,43]],12);l([[18,37],[21,34]],12);l([[36,43],[39,45]],12);
  // The chimney is drawn after the tiles, with a narrow flashing collar.
  named('Mill chimney flashing');p([[27,37],[31,37],[34,42],[30,42]],8,8);
  named('Mill chimney');p([[28,30],[32,30],[32,40],[28,37]],7,8);
  named('Mill chimney shaded return');p([[31,31],[32,31],[32,39],[31,38]],8,null);
  named('Mill chimney cap');p([[27,29],[33,29],[33,31],[27,31]],8,8);l([[28,29],[32,29]],7);
  named('Mill chimney mortar');l([[28,34],[30,34]],8);
  named('Porch roof tile seam');l([[33,63],[42,57],[53,64]],6);
  named('Mill race');p([[9,89],[14,88],[18,95],[30,99],[44,99],[49,102],[29,103],[16,99],[12,96]],1,null);
  l([[11,91],[16,97],[29,101],[42,101]],11);l([[14,91],[18,96],[26,99]],9);
  named('Bridge edge timbers');l([[43,125],[70,124]],0);l([[82,124],[121,125]],0);l([[45,126],[69,126]],6);l([[84,126],[120,127]],6);
  named('Bridge lashings');for(const [x,y]of [[41,110],[51,103],[112,103],[120,110]]){l([[x-1,y],[x+3,y]],14);l([[x,y+2],[x+3,y+2]],6)}
  named('Foreground foliage frame');p([[0,3],[5,7],[3,11],[10,13],[7,18],[15,21],[11,28],[4,25],[0,28]],0);p([[0,5],[3,9],[1,13],[7,14],[5,19],[11,22],[8,25],[0,22]],2,null);
  named('Selected bank stones');for(const [x,y]of [[58,107],[106,103],[51,145],[124,150]]){named('Bank stone '+x+','+y);p([[x,y],[x+3,y-4],[x+7,y-3],[x+9,y+1],[x+4,y+3]],8);l([[x+2,y-2],[x+5,y-2]],7)}
 }else if(room==='mill'){
  named('Red roof oak ribs');l([[8,0],[67,16]],6);l([[51,0],[79,16]],6);l([[110,0],[88,16]],6);l([[151,0],[96,16]],6);
  named('Warm wall repair');l([[9,30],[14,30],[14,34]],6);l([[112,31],[118,31],[118,34]],6);
  named('Hoist beam sockets');r(111,25,3,4,8);r(135,25,3,4,8);
  named('Grain sacks by wall');p([[139,121],[138,108],[140,103],[145,104],[148,111],[149,121]],14,6);l([[140,107],[145,107]],6);l([[144,112],[145,118]],6);
  named('Red grain bin');p([[143,119],[143,113],[155,113],[156,123],[143,123]],4,6);l([[144,114],[154,114]],12);
  named('Mill floor wood grain');
  for(const pts of [[[10,136],[18,134],[24,135]],[[42,151],[48,149],[56,150]],[[81,135],[89,134],[98,135]],[[116,147],[123,145],[131,146]],[[137,160],[145,158],[152,159]]])l(pts,4);
  named('Mill floor worn light');for(const pts of [[[31,130],[36,130]],[[65,143],[69,142]],[[110,157],[114,156]]])l(pts,14);
  named('Mill floor peg');for(const [x,y]of [[28,137],[69,153],[114,138],[149,149]])r(x,y,1,1,8,8);
  named('Mill foundation and wheel pit');
  p([[34,111],[85,111],[92,117],[91,124],[34,124]],7);p([[34,111],[85,111],[89,115],[35,115]],8);
  l([[35,115],[90,115]],0);for(const x of [44,57,71,84])l([[x,116],[x,123]],0);
  named('Water beneath wheel');p([[42,107],[77,107],[83,111],[84,114],[40,114]],3);l([[44,110],[55,110]],11);l([[62,112],[78,112]],11);
  named('Oak axle');p([[58,66],[86,66],[89,69],[87,75],[61,76]],6);l([[63,67],[86,67]],14);l([[65,73],[85,73]],0);
  named('Small meshing gear');require('./draw-mill-wheel.cjs').gear({fill,stroke});
  named('Bearing cap');p([[54,65],[62,65],[65,71],[62,78],[55,78],[52,72]],6);r(56,68,5,7,8);l([[57,69],[60,69]],15);
  named('Cabinet crown');p([[111,78],[111,75],[115,72],[130,72],[135,76],[135,79]],6);l([[114,75],[131,75]],14);
  named('Iron hinges');r(131,84,3,4,8);r(131,99,3,4,8);l([[132,85],[132,87]],0);l([[132,100],[132,102]],0);
  named('Cabinet plinth and feet');p([[112,108],[135,108],[137,112],[111,112]],6);l([[114,109],[133,109]],14);r(113,112,3,14,6);r(131,112,3,14,6);l([[112,126],[117,126]],0);l([[130,126],[135,126]],0);
  named('Carpentry pegs');for(const [x,y]of [[31,22],[97,22],[151,22],[41,103],[82,103]]){r(x,y,2,2,8);l([[x,y],[x+1,y]],7)}
  named('Door threshold');p([[3,123],[20,123],[24,126],[2,126]],7);l([[4,124],[19,124]],15);
  named('Floor repairs');l([[12,146],[17,143],[22,144]],8);l([[103,156],[111,156],[114,153]],8);
 }else if(room==='grotto'){
  // Rebuild the cave floor and pool as deliberately chosen planes. The near
  // pool lip is above the dry-foot walk mask; characters no longer stand in it.
  named('Dry grotto floor');p([[6,122],[29,118],[55,120],[70,111],[112,111],[136,121],[151,126],[145,140],[128,144],[116,157],[83,164],[45,157],[26,145],[6,140]],7);
  named('Pool reflected floor shadow');p([[64,115],[80,118],[111,117],[128,122],[116,127],[86,125],[72,122]],8,null);
  named('Cave vault layering');p([[39,0],[58,0],[57,17],[66,34],[61,55],[51,67],[43,56],[49,36],[42,21]],8);p([[47,3],[54,3],[52,21],[59,34],[54,51],[49,47],[52,34],[45,19]],7,null);
  p([[109,0],[130,0],[123,22],[126,41],[115,62],[109,52],[116,35],[114,20]],8);l([[120,5],[118,20],[121,34],[115,48]],0);
  named('Left buttress facets');p([[14,65],[23,53],[34,65],[31,88],[41,105],[37,120],[24,125],[17,111],[19,90]],8);p([[22,59],[29,65],[26,87],[32,103],[28,119],[22,113],[23,89]],7,null);l([[21,82],[26,88],[25,99]],0);
  named('Right buttress facets');p([[137,63],[146,53],[151,72],[146,91],[151,107],[143,124],[132,122],[130,109],[136,91]],8);p([[144,60],[147,72],[141,92],[145,108],[139,120],[134,116],[140,91]],7,null);l([[139,87],[143,94],[140,103]],0);
  named('Left mineral seam');l([[23,64],[25,73],[23,81],[26,91],[25,105]],3);l([[24,77],[24,80]],11);
  named('Right mineral seam');l([[144,68],[142,79],[144,90],[139,104]],3);l([[142,85],[143,88]],11);
  named('Pool-lit cave facet');p([[51,81],[54,88],[52,102],[55,109],[53,113],[49,105]],1,null);p([[128,83],[126,94],[129,103],[126,111],[123,105],[125,94]],1,null);
  named('Pool shadow');p([[60,104],[71,96],[95,93],[122,96],[138,103],[139,109],[127,115],[99,117],[76,113]],0,null);
  named('Mineral rim');p([[60,102],[72,94],[94,92],[121,95],[136,101],[138,107],[125,113],[100,115],[78,111],[65,106]],7,8);
  named('Pool dark edge');p([[64,102],[75,96],[95,95],[120,97],[133,102],[134,106],[123,110],[101,112],[80,108],[69,105]],3,null);
  named('Still pool');p([[69,102],[78,98],[96,97],[118,99],[129,102],[130,105],[121,108],[102,110],[83,106],[73,104]],11,null);
  named('Sparse water marks');l([[82,100],[91,100]],1);l([[109,103],[121,103]],9);l([[92,107],[99,107]],3);
  named('Mineral rim glints');l([[74,95],[82,94],[92,94]],15);l([[126,99],[131,101]],15);l([[104,114],[114,114]],15);
  named('Rim broken seams');l([[69,99],[72,101]],8);l([[125,110],[128,109]],8);l([[95,113],[98,114]],8);
  named('Dry stone cracks');for(const pts of [[[33,133],[39,136],[44,135]],[[66,148],[73,151],[78,149]],[[110,139],[119,137],[124,139]],[[84,158],[94,157]]])l(pts,8);
  named('Exit passage');
  // A full-height opening, with a broad floor-level threshold.
  p([[6,123],[6,98],[9,90],[17,80],[24,87],[28,96],[29,123]],0);
  p([[9,120],[9,99],[12,92],[17,86],[22,92],[25,99],[26,120]],1,null);
  l([[7,122],[28,122]],7);
  named('Low stalagmites');for(const [x,y,w,h]of [[45,118,11,26],[119,118,10,23],[27,127,8,18]]){p([[x,y],[x+2,y-h+7],[x+w/2,y-h],[x+w-2,y-h+8],[x+w,y]],8);l([[x+w/2,y-h+5],[x+w/2-1,y-4]],7)}
 }else if(room==='belfry'){
  named('Bell axle and iron straps');r(76,24,24,5,6);l([[78,25],[98,25]],14);r(81,20,3,14,0);r(94,20,3,14,0);
  for(const [x,y]of [[82,22],[95,22],[82,30],[95,30]])r(x,y,1,2,7,7);
  named('Timber head joints');for(const x of [36,127]){r(x,24,5,3,6);r(x,117,5,3,6);r(x+1,25,2,1,8,8)}
  named('Bell silhouette');p([[81,34],[95,34],[100,39],[101,56],[104,67],[112,78],[111,88],[67,88],[65,79],[72,69],[76,56],[77,40]],6);
  named('Bell lit plane');p([[82,37],[91,37],[95,42],[94,56],[98,68],[107,78],[70,78],[77,67],[81,55]],14,null);
  named('Bell dark return');p([[95,38],[99,41],[99,56],[103,69],[110,78],[105,78],[99,67],[95,55]],6,null);
  l([[82,42],[82,54]],15);l([[77,68],[99,68]],6);
  named('Bell lip');p([[67,80],[77,77],[99,77],[111,81],[109,88],[71,88]],0,6);l([[69,81],[108,81]],14);l([[72,87],[107,87]],6);
  named('Bell inscription');for(const x of [81,86,91])l([[x,60],[x+2,61]],6);
  named('Clapper and frayed rope');p([[85,87],[91,87],[94,91],[91,95],[86,94],[83,91]],6);l([[88,95],[88,113],[86,118]],6);l([[89,96],[89,112]],14);
  named('Window sills');for(const [x,y,w]of [[6,114,21],[57,114,28],[139,114,20]]){p([[x,y],[x+w,y],[x+w-1,y+3],[x-1,y+3]],8);l([[x+1,y],[x+w-1,y]],7)}
  named('Stair rail joinery');r(3,124,3,3,6);r(15,120,3,3,6);l([[4,125],[4,140]],14);
  named('Floor edge shadow');l([[42,125],[123,125]],0);l([[145,125],[159,125]],0);

 }

 return commands;
}
const roomFlag=process.argv.indexOf('--room'),only=roomFlag>=0?process.argv[roomFlag+1]:null;
if(roomFlag>=0&&!names[only])throw Error('Choose a valid room name');
for(const [room,name]of Object.entries(names)){
 if(only&&room!==only)continue;
 const target=path.join(out,room+'-workshop-v1.json');
 if(fs.existsSync(target)&&!process.argv.includes('--force')){console.log('Preserved existing '+room+' project (use --force to regenerate).');continue}
 const commands=collect(room),project={format:'agi-picture-workshop',version:1,room,name,width:160,height:168,palette:Agi.palette,reference:'../assets/rooms/'+room+'-reference-v2.png',notes:'Complete authored line-and-fill picture; no raster sampling. Scene layout preserves game exits and hotspots.',...(room==='potting'?{scaleGuide:{foot:[79,134],height:40,benchTop:108,benchFoot:129}}:{}),commands};
 Agi.project(project);fs.writeFileSync(target,JSON.stringify(project,null,2)+'\n');console.log(room+': saved '+commands.length+' editable commands');
}
