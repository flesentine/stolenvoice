// Redraw of gallery-prompt-trial-v6b in the editor's native command format.
// Coordinates are chosen for each silhouette and plane; no raster is sampled.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
const commands=[];
const poly=(name,points,color,outline=0)=>commands.push({type:'polygon',name,points,color,outline});
const line=(name,points,color=0)=>commands.push({type:'line',name,points,color});
const box=(name,x,y,w,h,c,edge=0)=>poly(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c,edge);
poly('Dark room silhouette',[[0,0],[160,0],[160,168],[0,168]],0,null);
// Structure: a shallow red timber ceiling above warm gray stone.
poly('Back wall',[[13,15],[127,15],[131,108],[13,110]],7);
poly('Right return shadow',[[127,0],[160,0],[160,130],[128,112]],8);
poly('Red ceiling',[[11,0],[133,0],[126,18],[21,18]],4);
for(const [a,b,c,d]of [[16,22,34,38],[45,49,54,58],[94,99,88,92],[123,128,116,120]]){
 poly('Oak roof rib',[[a,0],[b,0],[d,24],[c,24]],6);
 line('Rib light edge',[[a+1,1],[c+1,21]],14);
 box('Carved corbel',c-1,19,7,4,6);poly('Corbel bracket',[[c,23],[c+5,23],[c+4,28],[c+1,27]],6);
}
line('Roof plank seam',[[24,6],[47,6]],0);line('Roof plank seam',[[51,13],[91,13]],0);line('Roof plank seam',[[98,6],[121,6]],0);
line('Rear cornice shadow',[[18,20],[122,20]],0);
// Tall pillars have a lit face and a restrained darker return.
for(const [x,w]of [[3,12],[124,11]]){
 box('Pillar dark return',x,0,w,119,8);
 box('Pillar light face',x+1,0,w-4,114,7);
 for(const y of [13,38,63,88])line('Pillar stone joint',[[x,y],[x+w-3,y],[x+w-2,y+2]],0);
 poly('Pillar capital',[[x-1,13],[x+w,13],[x+w+1,18],[x+w-1,21],[x-1,20]],7);
 line('Capital reveal',[[x,17],[x+w,17]],8);
 poly('Pillar plinth',[[x,107],[x+w-2,107],[x+w+2,114],[x+w+2,125],[x-3,125],[x-3,116]],7);
 poly('Plinth dark side',[[x+w-2,108],[x+w+2,114],[x+w+2,125],[x+w-2,123]],8);
 line('Plinth footing',[[x-2,124],[x+w+2,124]],0);
}
// Long unbroken wall planes get only selected broken joints.
for(const [x,y]of [[18,34],[42,27],[50,75],[93,90],[114,50]])line('Broken masonry joint',[[x,y],[x+6,y],[x+6,y+3]],8);
line('Wall footing',[[16,108],[122,108]],0);
// Far-right stair arch: the building has an actual passage, with steps inside.
poly('Stair arch surround',[[134,119],[134,28],[139,17],[148,7],[155,8],[160,14],[160,130]],7);
poly('Stair arch shadow',[[138,118],[138,33],[143,22],[151,15],[157,19],[160,27],[160,129]],0);
poly('High stair window',[[151,29],[154,26],[157,30],[157,53],[151,49]],9,null);
line('Arch inside light',[[136,109],[136,32],[142,21],[149,13]],8);
for(const [a,b]of [[137,31],[140,22],[145,16],[151,12]])line('Arch stone joint',[[a-2,b],[a+1,b+2]],8);
for(let i=0;i<7;i++){
 const x=137+i*2,y=126-i*10;
 poly('Ascending step '+(i+1),[[x,y],[159,y-1],[159,y+5],[x-1,y+5]],8);
 line('Step tread '+(i+1),[[x,y],[158,y-1]],7);
}
line('Stair front edge',[[134,129],[159,134]],0);
// Walking floor: one broad plane, with a few converging selected joints.
poly('Flagstone floor',[[15,111],[123,111],[133,125],[160,132],[160,168],[0,168],[0,126]],8);
for(const pts of [ [[0,130],[47,130]],[[104,130],[159,130]],[[0,145],[39,145]],[[116,145],[159,145]],[[0,164],[28,164]],[[134,164],[159,164]],[[24,112],[9,129]],[[48,112],[36,129]],[[102,112],[114,129]],[[120,113],[134,129]],[[27,131],[13,144]],[[129,131],[144,144]],[[23,147],[3,163]],[[139,147],[158,163]] ])line('Flagstone joint',pts,0);
// Separate plane shadows anchor each piece of furniture to the floor.
poly('Table contact shadow',[[20,118],[48,118],[51,122],[21,123]],0,null);
poly('Chair contact shadow',[[101,120],[121,120],[124,123],[122,125],[100,125],[98,123]],0,null);
poly('Mirror footing shadow',[[57,109],[88,109],[92,113],[54,113]],0,null);
// Runner widens toward the doorway; its detail budget is the border.
poly('Runner gold underlay',[[58,112],[86,112],[137,168],[20,168]],6);
poly('Purple runner',[[59,114],[85,114],[133,168],[24,168]],5,null);
line('Runner left woven border',[[58,113],[22,167]],14);
line('Runner right woven border',[[86,113],[135,167]],14);
// Distinctive oak mirror: slender columns, carved crest, dark glass.
const mirrorStart=commands.length;
poly('Mirror outer silhouette',[[56,109],[57,44],[60,39],[60,33],[64,33],[69,26],[71,20],[75,28],[79,32],[84,33],[84,39],[88,44],[89,109]],6);
poly('Mirror dark return',[[83,40],[87,44],[88,107],[84,108]],0,null);
poly('Mirror crest gold',[[60,40],[65,34],[69,29],[71,23],[74,30],[79,35],[85,41],[83,44],[77,37],[71,32],[65,38],[61,44]],14);
poly('Blue crest jewel',[[70,27],[73,27],[75,30],[73,33],[70,32],[68,30]],1);
line('Jewel glint',[[70,28],[71,28]],9);
poly('Mirror inner rim',[[61,45],[71,34],[83,45],[83,102],[61,102]],14);
poly('Recessed glass shadow',[[62,47],[71,36],[82,47],[82,101],[62,101]],0,null);
poly('Smoked silver mirror glass',[[63,48],[71,38],[81,48],[81,100],[63,100]],8,null);
poly('Upper silver reflection plane',[[64,49],[71,40],[74,44],[65,68]],7,null);
poly('Lower silver reflection plane',[[70,99],[80,85],[80,93],[76,99]],7,null);
// Side columns and restrained turned-oak details.
for(const x of [57,85]){
 box('Mirror column',x,43,3,63,6);
 line('Column lit edge',[[x+1,46],[x+1,102]],14);
 for(const y of [44,69,91,103])box('Column collar',x-1,y,5,2,6);
 poly('Column finial',[[x-1,39],[x+1,34],[x+3,39],[x+3,42],[x-1,42]],6);
 line('Finial highlight',[[x+1,37],[x+1,39]],14);
}
box('Mirror lower rail',57,103,31,5,6);line('Rail gold edge',[[59,104],[85,104]],14);
poly('Mirror foot',[[57,108],[88,108],[90,111],[55,111]],6);line('Foot light',[[57,109],[86,109]],14);
// Reflect the authored left half about native x72 using exact horizontal ink
// spans. This avoids polygon rasterization shifting one side by a pixel.
const mirrorSource=commands.splice(mirrorStart);
const glassHighlights=mirrorSource.filter(c=>c.name.includes('reflection plane'));
const mirrorInk=Agi.render([{type:'polygon',name:'Temporary transparent field',points:[[0,0],[160,0],[160,168],[0,168]],color:5,outline:null},...mirrorSource.filter(c=>!c.name.includes('reflection plane'))]);
for(let y=20;y<=111;y++){
 const ink=x=>mirrorInk[y*160+(x<=72?x:144-x)];
 for(let x=54;x<=90;){const color=ink(x),left=x;while(x<=90&&ink(x)===color)x++;if(color!==5)line('Symmetric mirror frame',[[left,y],[x-1,y]],color);}
}
commands.push(...glassHighlights);
// Matching tapestries, constructed row by row for exact pixel symmetry.
for(const cx of [26,104]){
 const top=25,body=44,tip=7;
 line('Banner rod',[[cx-9,top-3],[cx+9,top-3]],6);
 for(const side of [-1,1])box('Rod gold end',cx+side*9-1,top-4,2,2,14,14);
 line('Banner top shadow',[[cx-7,top-1],[cx+7,top-1]],0);
 for(let row=0;row<body+tip;row++){
  const half=row<body?6:6-(row-body),y=top+row;
  line('Banner narrow contour',[[cx-half-1,y],[cx+half+1,y]],0);
  line('Gold banner silhouette',[[cx-half,y],[cx+half,y]],14);
  if(row>0&&half>1)line('Blue banner field',[[cx-half+1,y],[cx+half-1,y]],1);
 }
 line('Banner point shadow',[[cx,top+body+tip],[cx,top+body+tip]],0);
 const emblem=['...e...','..eee..','...e...','e..e..e','ee.e.ee','.eeeee.','..eee..','...e...','..eee..','.e.e.e.'];
 for(let row=0;row<emblem.length;row++)for(let col=0;col<7;col++)if(emblem[row][col]==='e')line('Centered heraldic bird',[[cx-3+col,top+19+row],[cx-3+col,top+19+row]],14);
}
// Twin three-candle iron sconces stay readable at native resolution.
for(const x of [48,91]){
 line('Iron wall mount',[[x,58],[x,72]],0);line('Candle arm',[[x-4,61],[x,64],[x+4,61]],0);
 for(const [dx,top]of [[-3,52],[0,48],[3,52]]){
  line('Candle stem',[[x+dx,top],[x+dx,60]],15);
  poly('Small flame',[[x+dx,top-4],[x+dx+1,top-1],[x+dx,top],[x+dx-1,top-1]],14,null);
 }
}
// Book table: skewed top, carved apron, individual legs and a readable book.
poly('Rear table legs',[[24,99],[27,99],[27,117],[24,117]],6);
poly('Rear table legs',[[44,98],[47,98],[47,116],[44,116]],6);
poly('Table top',[[20,93],[43,90],[49,93],[46,97],[20,98]],6);
line('Top lit edge',[[21,93],[43,91],[48,93]],14);
poly('Carved table apron',[[21,98],[47,96],[47,103],[43,101],[40,104],[36,101],[31,105],[27,102],[23,105],[21,104]],6);
line('Apron arch',[[24,102],[27,99],[31,103],[35,99],[39,102],[43,98],[46,100]],0);
poly('Left front leg',[[21,103],[24,104],[24,119],[25,122],[20,122],[21,117]],6);
poly('Right front leg',[[43,101],[46,101],[46,117],[47,120],[42,120],[43,115]],6);
line('Left leg light',[[22,106],[22,118]],14);line('Right leg light',[[44,104],[44,116]],14);
poly('Closed red book',[[32,88],[43,87],[44,89],[43,93],[32,94]],4);
poly('Book pages',[[41,89],[44,89],[43,92],[41,93]],15);
line('Book gold clasp',[[34,89],[34,92]],14);line('Book upper edge',[[33,88],[42,88]],12);
// Front-facing chair. Inclusive native spans keep every paired detail exact.
const chairCX=111;
const chairSpan=(name,y,half,color)=>line(name,[[chairCX-half,y],[chairCX+half,y]],color);
for(let y=63;y<=103;y++){
 const half=y<70?Math.min(4,y-63):y===70?6:y===71?7:8;
 chairSpan('Chair outer back',y,half,0);
 if(half>0)chairSpan('Chair carved oak back',y,half-1,6);
}
for(const [y,half]of [[65,1],[66,2],[67,3],[68,2],[69,4],[70,5],[71,6]])chairSpan('Chair crest gold',y,half,14);
for(let y=74;y<=102;y++){
 const half=y===74?0:y===75?2:y===76?4:6;
 chairSpan('Purple chair back',y,half,5);
 if(y>=79&&y<=98)for(const side of [-1,1])line('Upholstery piping',[[chairCX+side*6,y],[chairCX+side*6,y]],13);
}
for(let y=103;y<=110;y++){chairSpan('Chair seat frame',y,10,0);if(y<110)chairSpan('Chair seat oak',y,9,6);}
for(let y=104;y<=107;y++)chairSpan('Purple chair cushion',y,7,y===104?13:5);
// Short, level arm pads lie inside the seat silhouette rather than jutting out.
for(const side of [-1,1]){
 const edge=chairCX+side*8;
 for(let y=98;y<=100;y++)line('Chair arm',[[edge-2,y],[edge+2,y]],y===98?0:6);
 line('Arm light',[[edge-1,99],[edge+1,99]],14);
 for(let y=101;y<=109;y++)line('Arm upright',[[edge-1,y],[edge+1,y]],6);
 for(let y=111;y<=121;y++){
  line('Chair front foot',[[edge-2,y],[edge+2,y]],0);
  line('Chair leg face',[[edge-1,y],[edge+1,y]],6);
  line('Chair leg light',[[edge,y],[edge,y]],14);
 }
 line('Chair front foot',[[edge-3,122],[edge+3,122]],0);
 line('Chair foot light',[[edge-2,121],[edge+2,121]],6);
}
chairSpan('Chair carved rail',111,5,6);chairSpan('Chair rail light',112,5,14);chairSpan('Chair rail shadow',113,4,0);
const project={format:'agi-picture-workshop',version:1,name:'Mirror gallery — drawn from reference',width:160,height:168,palette:Agi.palette,reference:'../assets/rooms/gallery-prompt-trial-v6b.png',notes:'Complete native-grid redraw. Reference used for composition only; no raster tracing or sampling.',commands};
Agi.project(project);
fs.writeFileSync(path.join(__dirname,'../assets/rooms/gallery-workshop-v1.json'),JSON.stringify(project,null,2)+'\n');
console.log('Saved gallery workshop project with '+commands.length+' native drawing commands.');
