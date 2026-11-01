// One measured outline/fill drawing on the native AGI grid. No per-feature resizing.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js');
module.exports=function(){
 const commands=[];
 const p=(name,points,color,outline=null)=>commands.push({type:'polygon',name,points,color,outline});
 const l=(name,points,color)=>commands.push({type:'line',name,points,color});
 const r=(name,x,y,w,h,color,outline=null)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],color,outline);
 // Quiet garden planes keep the face and hands readable.
 r('Clear blue sky',0,0,160,168,9);
 p('High cloud',[[92,23],[95,23],[98,19],[103,19],[106,23],[112,23],[114,20],[119,21],[122,26],[127,26],[129,29],[93,29]],15);
 p('Far cloud',[[133,13],[139,13],[143,9],[150,9],[153,13],[159,14],[159,19],[135,19]],15);
 p('Distant wooded hill',[[0,72],[9,67],[21,69],[31,63],[43,67],[55,61],[70,64],[82,59],[96,64],[112,60],[130,65],[148,59],[159,62],[159,103],[0,103]],3);
 // The tower sits on a continuous garden terrace, with its base behind the wall.
 p('Distant tower shade',[[139,29],[148,29],[148,85],[139,85]],8);
 r('Distant tower',136,29,9,55,7);
 l('Tower lit edge',[[137,31],[137,67]],15);
 p('Tower roof',[[133,30],[141,15],[150,30]],4,6);
 l('Tower flag pole',[[141,16],[141,9]],0);p('Tower pennant',[[142,9],[146,10],[145,12],[142,11]],1);
 r('Tower slit',140,36,2,8,0);l('Tower masonry',[[138,50],[141,50],[141,52]],8);
 p('Castle curtain',[[120,69],[120,56],[124,56],[124,59],[129,59],[129,56],[133,56],[133,69],[138,69],[138,84],[120,84]],7,8);
 // Separated cypresses: selective contours, rather than a black band of foliage.
 for(const [cx,base,height] of [[15,86,39],[29,88,45],[86,86,43],[99,88,41],[120,87,54],[154,91,51]]){
  // Colored, single-pixel edges keep distant foliage light and separate.
  p('Cypress green',[[cx-5,base],[cx-4,base-9],[cx-6,base-10],[cx-3,base-18],[cx-4,base-19],[cx-1,base-height+12],[cx,base-height],[cx+1,base-height+12],[cx+3,base-20],[cx+2,base-17],[cx+5,base-10],[cx+4,base-8],[cx+6,base]],2);
  l('Cypress shaded edge',[[cx,base-height],[cx-1,base-height+12],[cx-4,base-19],[cx-3,base-18],[cx-6,base-10],[cx-4,base-9]],1);
  l('Cypress light',[[cx+1,base-height+18],[cx+2,base-height+24]],10);
 }
 p('Left tree trunk',[[0,0],[5,0],[4,25],[11,16],[18,7],[20,7],[14,22],[5,36],[4,105],[0,105]],6);
 l('Tree trunk highlight',[[2,47],[2,98]],14);
 p('Upper leaves',[[0,0],[26,0],[24,6],[20,6],[19,11],[15,10],[11,16],[8,15],[6,21],[4,21],[0,28]],2);
 p('Garden wall',[[0,83],[159,83],[159,121],[0,121]],7,8);
 l('Wall coping light',[[0,84],[159,84]],15);l('Wall cap shadow',[[0,88],[159,88]],8);
 for(const yy of [100,113]){l('Stone course',[[0,yy],[159,yy]],8);for(let xx=(yy===100?12:24);xx<159;xx+=29)l('Stone joint',[[xx,yy-11],[xx,yy]],8)}
 p('Garden ground',[[0,118],[20,115],[37,119],[58,115],[85,119],[116,116],[159,119],[159,139],[0,139]],2);
 for(const [cx,cy]of [[12,111],[23,105],[145,109],[151,123],[132,131],[11,132]]){
  l('Flowering stem',[[cx,cy+8],[cx,cy]],2);
  p('Flower leaves',[[cx,cy+5],[cx-3,cy+2],[cx-3,cy+5],[cx,cy+7],[cx+3,cy+4],[cx+2,cy+7]],10);
  r('Flower petals',cx-2,cy-1,5,3,13);r('Flower petals',cx-1,cy-2,3,5,13);r('Flower center',cx,cy,1,1,14);
 }
 // Chest-up composition: larger features get real room on the native grid.
 p('Left sleeve',[[37,98],[28,104],[24,116],[22,139],[57,139],[62,128],[60,117],[52,111],[48,101]],7,0);
 p('Left sleeve shade',[[31,115],[35,119],[38,129],[42,133],[52,130],[56,131],[54,139],[28,139]],8);
 l('Left elbow fold',[[28,135],[33,129],[38,127]],8);
 p('Left sleeve highlight',[[29,112],[33,107],[36,108],[39,120],[37,126],[34,123]],15);
 p('Raised sleeve',[[94,97],[102,100],[108,107],[113,119],[118,119],[124,115],[129,120],[131,135],[129,139],[101,139],[98,125]],7,0);
 p('Raised sleeve shade',[[102,111],[107,116],[111,129],[117,128],[123,123],[126,124],[124,139],[105,139]],8);
 l('Raised elbow fold',[[108,138],[111,132],[117,130]],8);
 l('Raised sleeve light',[[102,104],[106,112],[108,122]],15);
 p('Tunic outline',[[36,98],[45,92],[56,86],[64,84],[81,84],[94,94],[97,103],[97,123],[100,139],[40,139],[40,123],[37,113],[34,103]],1,0);
 p('Tunic lit plane',[[43,99],[55,94],[68,106],[74,111],[83,99],[89,98],[91,115],[93,139],[59,139],[58,119],[49,113]],9);
 p('Tunic center blue',[[56,104],[69,114],[78,113],[86,104],[87,124],[90,139],[63,139],[62,126]],1);
 l('Left tunic fold',[[42,104],[46,109],[47,119]],1);
 l('Right tunic fold',[[89,116],[91,125],[89,132]],0);
 // A short connected neck below the rounded jaw, not a detached red patch.
 p('Neck',[[64,67],[76,72],[84,68],[84,80],[83,86],[86,91],[81,100],[77,107],[72,105],[69,99],[62,94],[58,90],[61,81]],12,4);
 p('Neck shade',[[63,71],[69,75],[76,78],[82,74],[81,79],[76,83],[70,81],[67,79],[65,83],[67,91],[65,88],[62,83]],4);
 l('Throat fold',[[82,87],[81,94],[80,98]],4);
 p('Linen collar',[[59,84],[61,88],[65,93],[71,97],[75,106],[77,109],[79,100],[82,94],[84,87],[87,90],[88,97],[84,101],[80,105],[78,114],[74,114],[71,107],[66,103],[60,101],[55,96],[55,91]],7,8);
 l('Left collar light',[[58,90],[61,96],[66,100],[71,102],[75,110]],15);
 l('Right collar light',[[85,93],[83,98],[79,104]],15);
 // The hair mass, ear and skin overlap in the same order as the reference.
 p('Silver hair',[[57,38],[54,43],[52,53],[53,63],[55,68],[54,75],[55,82],[54,88],[56,94],[60,98],[63,94],[64,88],[63,79],[64,69],[62,55],[63,46]],7,0);
 p('Hair curls shade',[[55,48],[57,46],[59,49],[58,54],[54,57],[55,61],[60,63],[61,69],[58,71],[57,77],[60,81],[61,88],[59,93],[56,91],[58,86],[57,80],[55,75],[57,70],[54,64],[53,58]],8);
 l('Temple curl glint',[[56,47],[59,49],[58,53],[55,54]],15);
 l('Lower curl glint',[[56,82],[58,85],[58,88]],15);
 p('Face outline',[[60,41],[63,33],[70,26],[77,20],[82,20],[84,25],[85,33],[86,40],[87,44],[87,48],[90,53],[89,57],[87,58],[87,64],[88,70],[89,75],[88,81],[84,87],[79,90],[74,87],[68,82],[64,75],[61,66],[59,57],[59,48]],12,4);
 p('Face light plane',[[62,41],[66,33],[72,29],[78,24],[81,24],[83,29],[84,37],[85,44],[86,49],[88,53],[87,55],[85,57],[86,65],[87,71],[87,77],[84,83],[79,86],[74,83],[69,79],[65,71],[63,63],[61,54]],12);
 p('Under jaw shade',[[62,66],[65,72],[69,79],[75,83],[80,86],[85,83],[84,87],[79,90],[74,87],[68,82],[64,75]],4);
 p('Near ear',[[61,68],[59,65],[57,66],[57,70],[60,75],[63,76],[64,74],[63,70]],12,4);
 l('Ear curl',[[59,68],[61,69],[60,71],[62,72]],4);
 p('Far silver temple',[[83,27],[85,26],[87,30],[87,36],[89,40],[88,44],[86,43],[85,38],[85,32]],7,8);
 l('Far curl light',[[85,29],[86,32],[86,36]],15);
 // Eyes share one upward gaze and retain their pupils through every vowel.
 l('Near silver brow',[[68,42],[70,38],[73,35],[75,35]],7);
 l('Far silver brow',[[81,33],[83,31],[85,32]],7);
 p('Near eye white',[[70,49],[71,44],[73,42],[75,43],[76,47],[75,52],[72,53]],15);
 l('Near upper lid',[[70,47],[72,42],[74,42],[76,44]],4);
 r('Near iris',73,43,2,5,1);r('Near pupil',74,43,1,5,0);r('Near eye glint',73,43,1,1,15);
 p('Far eye white',[[81,41],[82,36],[84,35],[86,37],[86,41],[84,43],[82,43]],15);
 l('Far upper lid',[[81,40],[82,36],[85,35],[86,37]],4);
 r('Far iris',83,36,2,5,1);r('Far pupil',84,36,1,5,0);r('Far eye glint',83,36,1,1,15);
 l('Near lower lid',[[70,54],[72,54]],4);
 // A gently rounded nose and short dark-red creases retain the kind expression.
 l('Nose bridge',[[79,47],[79,52],[80,55]],4);
 p('Nose tip',[[80,53],[83,52],[87,52],[89,54],[87,57],[83,59],[80,58],[79,55]],12);
 l('Nostril edge',[[81,58],[83,59],[86,57]],4);
 l('Near smile fold',[[77,59],[75,63],[75,66]],4);
 l('Far smile fold',[[87,59],[88,64],[88,68]],4);
 l('Cheek smile crease',[[66,63],[68,68],[70,70]],4);
 l('Warm smile',[[78,70],[81,74],[85,71],[87,68]],4);
 l('Smile teeth',[[79,69],[85,66]],15);
 l('Chin crease',[[82,80],[85,79]],4);
 commands.push(...require('./merrin-felt-cap.cjs')());
 // A slimmer open hand: narrow fingers, shallow knuckle steps and a
 // tapered palm keep the gesture relaxed rather than inflated.
 p('Raised hand',[[118,121],[118,115],[115,111],[111,108],[109,105],[109,103],[110,102],[112,103],[116,106],[118,106],[118,103],[116,99],[114,94],[114,92],[115,91],[116,92],[119,98],[121,100],[120,94],[119,87],[119,85],[120,84],[121,85],[122,89],[124,98],[124,92],[125,88],[126,87],[127,88],[128,92],[128,101],[130,97],[131,95],[132,96],[132,101],[131,106],[129,111],[127,115],[127,121],[124,125],[121,124]],12,4);
 l('Index web',[[119,102],[120,104]],4);
 l('Middle web',[[124,98],[124,102]],4);
 l('Ring web',[[128,101],[129,103]],4);
 l('Thumb palm fold',[[117,109],[120,111],[122,109]],4);
 p('Raised linen cuff',[[114,118],[118,124],[123,127],[128,123],[130,125],[129,137],[122,139],[117,133]],7,8);
 l('Cuff inner highlight',[[115,121],[120,128],[124,129],[128,126]],15);
 // The hand on his chest is supported by a wrist, with fingers resting together.
 p('Heart hand',[[59,139],[60,134],[63,130],[67,127],[69,121],[71,118],[73,118],[74,120],[73,123],[72,126],[77,124],[84,120],[88,118],[90,118],[91,120],[89,122],[92,121],[94,122],[94,124],[92,126],[94,126],[94,128],[91,131],[91,133],[88,136],[83,139]],12,4);
 l('Resting first fingers',[[83,125],[87,122],[89,121]],4);
 l('Resting second fingers',[[85,130],[89,127],[91,125]],4);
 l('Resting little finger',[[85,135],[89,132]],4);
 l('Resting thumb fold',[[68,130],[71,127]],4);
 r('Lyric reserve',0,139,160,29,0);
 const project={format:'agi-picture-workshop',version:1,name:'Merrin singing - measured redraw',room:'merrin-ending',width:160,height:168,palette:A.palette,reference:'../references/merrin-singing-reference-v4.png',notes:'Single native-coordinate outline/fill interpretation of reference v3. Every face detail and mouth cel shares the same untransformed coordinate system. One-pixel contours, grouped fingers, connected cuffs. No raster transfer.',commands};
 A.project(project);fs.writeFileSync(path.join(__dirname,'../assets/rooms/merrin-ending-workshop-v2.json'),JSON.stringify(project,null,2)+'\n');
 const pixels=A.render(commands),runs=[];for(let i=0;i<pixels.length;){let j=i+1;while(j<pixels.length&&pixels[j]===pixels[i]&&j-i<255)j++;runs.push(j-i,pixels[i]);i=j}return Buffer.from(runs).toString('base64');
};
