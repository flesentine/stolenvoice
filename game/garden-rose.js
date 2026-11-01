// Readable native EGA rose: curled red petals, long stem and light leaves.
function drawGardenRose(){
 ellipse(273,201,13,3,'#000000');ellipse(273,200,10,2,'#aa5500');
 const cx=pictureX(273),base=pictureY(200);
 x.fillStyle='#55ff55';x.fillRect(cx-3,base-2,3,1);x.fillRect(cx+1,base-1,3,1);
 if(!pickupStillInScene('rose'))return;
 x.fillStyle='#00aa00';x.fillRect(cx,base-12,1,12);
 x.fillStyle='#55ff55';x.fillRect(cx-3,base-8,3,1);x.fillRect(cx-2,base-7,2,1);x.fillRect(cx+1,base-5,3,1);x.fillRect(cx+1,base-4,2,1);
 const petals=['..cc...','.cc4cc.','c4cc4c.','c44c4c.','.c44c..','..44...'];
 for(let row=0;row<petals.length;row++)for(let col=0;col<7;col++){const ink=petals[row][col];if(ink==='.')continue;x.fillStyle=ink==='c'?'#ff5555':'#aa0000';x.fillRect(cx-3+col,base-17+row,1,1)}
}
