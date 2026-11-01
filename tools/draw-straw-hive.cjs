// Rounded, woven straw skep at the established stump position (native EGA).
module.exports=function({fill,stroke,named=()=>{}}){
 named('Straw hive');
 const line=(points,color)=>stroke(points,color);
 const cx=103;
 const widths=[1,3,4,5,6,6,7,7,8,8,8,8,8,8,8,8,8,8,7,7];
 for(let row=0;row<widths.length;row++){
  const y=104+row,half=widths[row];
  line([[cx-half,y],[cx+half,y]],6);
  if(half>1)line([[cx-half+1,y],[cx+half-1,y]],14);
  if(half>=6)line([[cx+half-2,y],[cx+half-1,y]],6);
 }
 // Coiled straw bands curve around the rounded basket, rather than projecting
 // like a bell lip. Each coil follows the side contour and dips at its center.
 for(const [y,half]of [[108,5],[111,6],[114,7],[117,7],[120,7]]){
  line([[cx-half,y],[cx-half+2,y+1],[cx+half-2,y+1],[cx+half,y]],6);
 }
 for(const [x,y]of [[101,106],[99,109],[98,113],[97,116]])line([[x,y],[x+1,y]],15);
 // Short stitches make the material readable without filling it with noise.
 for(const [x,y]of [[104,109],[100,113],[105,116],[98,119]])line([[x,y],[x+1,y+1]],6);
 // Small arched bee entrance cut into the lowest coil.
 line([[103,118],[103,119]],0);
 for(let y=120;y<=122;y++)line([[102,y],[104,y]],0);
 line([[100,123],[106,123]],6);
};
