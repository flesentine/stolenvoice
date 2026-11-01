// The orchard lies east of the castle: its side wall recedes off the left.
module.exports=function({fill,stroke,named=()=>{}}){
 const p=(name,points,color,outline=null)=>{named(name);fill(points,color,outline)};
 const l=(name,points,color)=>{named(name);stroke(points,color)};
 const r=(name,x,y,w,h,c)=>p(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);
 // Far mountains rise behind the wooded foothills, with quiet colored edges.
 p('Distant mountain range',[[30,81],[45,62],[55,47],[62,55],[76,29],[84,40],[91,52],[103,38],[111,46],[124,24],[133,37],[143,54],[151,43],[160,58],[160,108],[30,108]],1);
 p('Western mountain lit face',[[45,62],[55,47],[59,56],[54,64],[58,68],[48,79],[66,96],[30,96]],9);
 p('Central mountain lit face',[[59,80],[76,29],[80,43],[76,50],[81,55],[74,63],[78,71],[68,83],[77,98],[48,98]],9);
 p('Eastern mountain lit face',[[103,67],[124,24],[128,36],[123,43],[128,49],[120,57],[124,63],[116,73],[120,87],[94,98]],9);
 p('Western summit snow',[[50,54],[55,47],[60,54],[57,53],[55,56],[53,53]],15);
 p('Central summit snow',[[69,45],[76,29],[83,42],[79,40],[77,46],[75,41],[72,46]],15);
 p('Eastern summit snow',[[116,40],[124,24],[133,37],[128,35],[126,41],[123,36],[120,42]],15);
 p('Secondary summit snow',[[99,43],[103,38],[108,43],[104,42],[102,45]],7);
 l('Central rock seam',[[81,49],[85,55],[85,62]],1);
 l('Eastern rock seam',[[131,45],[135,53],[138,56]],1);
 // A wooded ridge continues toward the stream, behind the nearer apple trees.
 p('Distant woodland ridge',[[35,87],[45,79],[55,81],[64,72],[74,74],[83,64],[93,67],[104,58],[116,60],[125,54],[136,60],[145,56],[160,63],[160,120],[35,120]],1);
 p('Orchard woodland crowns',[[39,104],[43,91],[51,88],[54,79],[61,75],[67,77],[72,69],[80,65],[86,68],[91,61],[99,59],[104,63],[109,55],[117,51],[123,55],[127,64],[135,61],[141,66],[148,63],[155,67],[160,72],[160,126],[39,123]],3);
 for(const [x,y]of [[66,81],[82,73],[99,69],[116,60],[133,57],[150,63],[144,85],[110,85]])
  l('Woodland scattered leaf light',[[x-3,y+2],[x,y],[x+4,y+2]],2);
 // Low stone connects the glimpse of a corner tower to the castle off-screen.
 p('Castle left bank',[[0,85],[13,85],[27,91],[42,101],[48,115],[0,118]],2);
 p('Castle side wall',[[0,49],[9,49],[9,52],[15,52],[15,55],[22,55],[22,58],[29,58],[29,61],[36,61],[36,101],[0,94]],7);
 p('Castle wall return',[[29,60],[36,61],[36,101],[29,98]],8);
 l('Castle wall coping',[[0,51],[8,51],[8,54],[15,54],[15,57],[22,57],[22,60],[29,60]],15);
 r('Left corner tower shadow',4,30,15,53,8);
 r('Left corner tower stone',5,31,11,51,7);
 l('Tower moonlit edge',[[6,33],[6,70]],15);
 // Match the garden's steep red cones, black rim and shaded right return.
 p('Left corner tower roof outline',[[11,11],[19,31],[3,31]],0);
 p('Left corner tower red roof',[[11,14],[17,29],[5,29]],4);
 p('Left corner tower roof shadow',[[11,15],[17,29],[15,29]],0);
 l('Tower roof selected tiles',[[13,25],[14,26]],6);
 r('Corner tower arrow slit',10,38,2,8,0);
 l('Castle pennant staff',[[11,4],[11,11]],0);
 p('Castle gold pennant',[[12,4],[12,7],[17,7],[16,5]],14);
 named('Structure');
};
