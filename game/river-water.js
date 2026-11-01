// A twelve-cel current cycle continues independently of the six-cel wheel.
let riverWaterFrame=0;
const riverWaterCache=[];
let waterAnimationFocused=true;
function drawRiverWater(){
 if(room!==4)return;
 const frame=riverWaterFrame%riverWaterPictures.frames.length;
 if(!riverWaterCache[frame]){
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=168;
  const context=canvas.getContext('2d'),image=context.createImageData(160,168),bytes=Uint8Array.from(atob(riverWaterPictures.frames[frame]),c=>c.charCodeAt(0));let n=0;
  for(let i=0;i<bytes.length;i+=2)for(let j=0;j<bytes[i];j++){
   const ink=bytes[i+1];if(ink!==16){const rgb=EGA[ink];image.data[n*4]=rgb[0];image.data[n*4+1]=rgb[1];image.data[n*4+2]=rgb[2];image.data[n*4+3]=255}n++;
  }
  context.putImageData(image,0,0);riverWaterCache[frame]=canvas;
 }
 x.drawImage(riverWaterCache[frame],0,0);
}
window.addEventListener('blur',()=>{waterAnimationFocused=false});window.addEventListener('focus',()=>{waterAnimationFocused=true});
