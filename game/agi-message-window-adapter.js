// Native bitmap placement follows the game's 320x200 display coordinate grid.
let agiMessagePages=[];
function messageLines(text){return AgiMessageWindow.wrap(Array.isArray(text)?text.join('\n'):text)}
function paintTextWindow(text,bitmap,windowEl){
 const drawing=AgiMessageWindow.render(text,agiFont),{width,height,left,top,pixels}=drawing;
 bitmap.width=width;bitmap.height=height;
 const context=bitmap.getContext('2d'),image=context.createImageData(width,height);
 for(let n=0;n<pixels.length;n++){
  const shade=pixels[n]===15?255:pixels[n]===4?170:0;
  image.data[n*4]=shade;image.data[n*4+1]=pixels[n]===15?255:0;image.data[n*4+2]=pixels[n]===15?255:0;image.data[n*4+3]=255;
 }
 context.putImageData(image,0,0);
 windowEl.style.position='absolute';windowEl.style.left=(left/320*100)+'%';windowEl.style.top=(top/200*100)+'%';
 windowEl.style.width=(width/320*100)+'%';windowEl.style.aspectRatio=width+'/'+(height*1.2);
}
function say(text){
 const pages=AgiMessageWindow.pages(text);agiMessagePages=pages.slice(1);showMessagePage(pages[0]);
}
