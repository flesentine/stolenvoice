// Contact under each planted shoe, rather than one detached wide oval.
function drawRosellaContactShadow(px,py,rows){
 const left=pictureX(px)-4,y=pictureY(py)+1;
 for(let col=0;col<8;col++)if(['0','6','e'].includes(rows[39][col])){
  const xx=left+col;if(xx<0||xx>=160||y<0||y>=168)continue;
  x.fillStyle='#000000';x.fillRect(xx,y,1,1);
 }
}
