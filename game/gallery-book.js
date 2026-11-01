let bookAnimationTimer=0,bookAnimationFrame=null,bookAnimationFocused=true;
const bookCelCache=[];
function resetBookAnimation(){if(bookAnimationTimer)clearInterval(bookAnimationTimer);bookAnimationTimer=0;bookAnimationFrame=null}
function drawGalleryBook(){
 const frame=bookAnimationFrame===null?(flags.bookOpen?5:0):bookAnimationFrame;
 if(!bookCelCache[frame]){
  const data=galleryBookPicture,bytes=Uint8Array.from(atob(data.frames[frame]),c=>c.charCodeAt(0)),canvas=document.createElement('canvas');canvas.width=data.width;canvas.height=data.height;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(data.width,data.height);let n=0;
  for(let i=0;i<bytes.length;i+=2)for(let j=0;j<bytes[i];j++){if(bytes[i+1]===16){n+=4;continue}const color=EGA[bytes[i+1]];image.data[n++]=color[0];image.data[n++]=color[1];image.data[n++]=color[2];image.data[n++]=255}ctx.putImageData(image,0,0);bookCelCache[frame]=canvas;
 }
 x.drawImage(bookCelCache[frame],galleryBookPicture.left,galleryBookPicture.top);
}
function handleBookOpening(text){
 const match=text.match(/^(open|unfasten|close|shut)\s+(.+)$/);if(!match||objectId(match[2])!=='book')return false;
 if(room!==1){say('You do not see a book here.');return true}if(!nearObject('book'))return true;
 const opening=['open','unfasten'].includes(match[1]);
 if(bookAnimationTimer){say('The heavy cover is still moving.');return true}
 if(flags.bookOpen===opening){say(opening?'The book is already open.':'The book is already closed.');return true}
 stopWalking();flags.bookOpen=opening;bookAnimationFrame=opening?0:5;draw();
 const finish=()=>{resetBookAnimation();draw();if(room===1&&!popupOpen)say(opening?'The red cover settles open. Closely written pages lie before you.':'You close the heavy red cover.')};
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return true}
 bookAnimationTimer=setInterval(()=>{if(room!==1||!playing){resetBookAnimation();return}if(popupOpen||menuOpen||document.hidden||!bookAnimationFocused)return;bookAnimationFrame+=opening?1:-1;draw();if(bookAnimationFrame===(opening?5:0))finish()},100);
 return true;
}

window.addEventListener('blur',()=>{bookAnimationFocused=false});window.addEventListener('focus',()=>{bookAnimationFocused=true});
