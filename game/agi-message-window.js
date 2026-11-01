// DOS/EGA AGI message-window geometry, independently implemented from the
// coordinate behavior documented by ScummVM's AGI text and graphics modules.
// This module paints native 320x200 display pixels (not 160-wide PIC pixels).
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AgiMessageWindow=factory()})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const columns=30,maxRows=20;
 function plain(text){return String(text).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/\r\n?/g,'\n').replace(/[^\x20-\x7e\n]/g,'?')}
 function wrap(text,width=columns){
  const input=plain(text),lines=[''];
  let read=0;
  while(read<input.length){
   if(input[read]==='\n'){lines.push('');read++;continue}
   // Words carry their preceding space, so explicit spacing is preserved.
   let end=read;if(input[end]===' ')end++;
   while(end<input.length&&input[end]!==' '&&input[end]!=='\n')end++;
   let word=input.slice(read,end);read=end;
   if(lines[lines.length-1].length+word.length>=width){
    if(word[0]===' ')word=word.slice(1);
    lines.push('');
   }
   while(word.length>width){lines[lines.length-1]+=word.slice(0,width);word=word.slice(width);lines.push('')}
   lines[lines.length-1]+=word;
  }
  return lines;
 }
 function normalized(text){return Array.isArray(text)?text.flatMap(line=>wrap(line)):wrap(text)}
 function pages(text){const lines=normalized(text),result=[];for(let n=0;n<lines.length;n+=maxRows)result.push(lines.slice(n,n+maxRows));return result.length?result:[['']]}
 function layout(text){
  const lines=normalized(text);
  if(lines.length>maxRows)throw Error('Long messages must be divided into AGI windows.');
  const count=Math.max(1,...lines.map(line=>line.length)),rows=Math.max(1,lines.length);
  const textColumn=Math.trunc((40-count)/2),startRow=Math.trunc((19-rows)/2)+1;
  return{lines,columns:count,rows,width:count*8+20,height:rows*8+10,left:textColumn*8-10,top:startRow*8+3,textX:10,textY:5};
 }
 function render(text,font){
  const box=layout(text),{width:w,height:h}=box,pixels=new Uint8Array(w*h);pixels.fill(15);
  const rect=(x,y,width,height,color)=>{for(let row=y;row<y+height;row++)for(let col=x;col<x+width;col++)if(col>=0&&col<w&&row>=0&&row<h)pixels[row*w+col]=color};
  // EGA's vertical frame edges occupy one low-resolution picture pixel,
  // which is two display pixels; horizontal edges occupy one scanline.
  rect(2,1,w-4,1,4);rect(2,h-2,w-4,1,4);
  rect(2,2,2,h-4,4);rect(w-4,2,2,h-4,4);
  if(!font||font.length<2048)throw Error('An 8x8 AGI bitmap font is required.');
  box.lines.forEach((line,row)=>[...line].forEach((character,col)=>{
   const start=character.charCodeAt(0)*8;
   for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(font[start+y]&(128>>x))rect(10+col*8+x,5+row*8+y,1,1,0);
  }));
  return{...box,pixels};
 }
 return{plain,wrap,pages,layout,render,columns,maxRows};
});
