// Sierra-style text selection first; an object's native cel appears on Enter.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AgiInventoryWindow=factory()})(typeof globalThis==='object'?globalThis:this,function(){
 function displayName(name){return name.charAt(0).toUpperCase()+name.slice(1)}
 function writer(pixels,width,height,font){
  const dot=(x,y,c)=>{if(x>=0&&y>=0&&x<width&&y<height)pixels[y*width+x]=c};
  const text=(value,left,top,color)=>[...value].forEach((letter,col)=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(font[letter.charCodeAt(0)*8+y]&(128>>x))dot(left+col*8+x,top+y,color)});
  return{dot,text};
 }
 function renderList(items,font,index=0,{touch=false}={}){
  const width=288,height=Math.max(104,items.length*12+56),pixels=new Uint8Array(width*height).fill(15),{dot,text}=writer(pixels,width,height,font);
  // Match the white message windows: inset red rule, thin native edges.
  for(let xx=2;xx<width-2;xx++){dot(xx,2,4);dot(xx,height-3,4)}
  for(let yy=2;yy<height-2;yy++){dot(2,yy,4);dot(3,yy,4);dot(width-4,yy,4);dot(width-3,yy,4)}
  text('You are carrying:',Math.floor((width-17*8)/2),12,0);
  items.forEach((name,row)=>{
   const y=36+row*12;
   if(row===index)for(let yy=y-1;yy<y+9;yy++)for(let xx=20;xx<width-20;xx++)dot(xx,yy,0);
   text(displayName(name),28,y,row===index?15:0);
  });
  const help=touch?'TAP: examine  ESC: return':'ENTER: examine  ESC: return';
  text(help,Math.floor((width-help.length*8)/2),height-18,0);
  return{width,height,pixels,left:16,top:Math.floor((200-height)/2)};
 }
 function paintItem(name,pictures,dot,left,top){
  const encoded=pictures[name];if(!encoded)throw Error('Missing inventory picture: '+name);
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));let offset=0;
  for(let run=0;run<bytes.length;run+=2)for(let n=0;n<bytes[run];n++,offset++){const x=left+offset%32*2,y=top+Math.floor(offset/32);dot(x,y,bytes[run+1]);dot(x+1,y,bytes[run+1])}
 }
 function renderItem(name,font,pictures,messageWindow){
  const drawing=messageWindow.render(Array(6).fill(' '.repeat(20)),font),{width,height,pixels}=drawing,{dot,text}=writer(pixels,width,height,font);
  text(displayName(name),Math.floor((width-name.length*8)/2),8,0);
  paintItem(name,pictures,dot,Math.floor((width-64)/2),24);
  return{...drawing,left:Math.floor((320-width)/2),top:Math.floor((200-height)/2)};
 }
 function renderDescription(name,description,font,pictures,messageWindow,{showHelp=true}={}){
  const lines=messageWindow.wrap(description,30);
  // Longer future descriptions retain the ordinary paged message flow.
  if(lines.length>12)return null;
  const width=280,height=(showHelp?88:72)+lines.length*8,pixels=new Uint8Array(width*height).fill(15),{dot,text}=writer(pixels,width,height,font);
  for(let x=2;x<width-2;x++){dot(x,2,4);dot(x,height-3,4)}
  for(let y=2;y<height-2;y++){dot(2,y,4);dot(3,y,4);dot(width-4,y,4);dot(width-3,y,4)}
  text(displayName(name),Math.floor((width-name.length*8)/2),10,0);
  lines.forEach((line,index)=>text(line,20,26+index*8,0));
  paintItem(name,pictures,dot,Math.floor((width-64)/2),34+lines.length*8);
  if(showHelp)text('ENTER/ESC: return',Math.floor((width-16*8)/2),height-18,0);
  return{width,height,pixels,left:20,top:Math.floor((200-height)/2)};
 }
 return{render:renderList,renderList,renderItem,renderDescription,displayName};
});
let inventoryOpen=false,inventoryView='list',inventoryIndex=0;
function paintInventory(){
 const name=inv[inventoryIndex],description=inventoryView==='item'?inventoryItemDescription(objectId(name)):'';
 const touch=window.matchMedia('(hover: none) and (pointer: coarse)').matches;
 const drawing=inventoryView==='item'?(AgiInventoryWindow.renderDescription(name,description,agiFont,inventoryPictures,AgiMessageWindow,{showHelp:false})||AgiInventoryWindow.renderItem(name,agiFont,inventoryPictures,AgiMessageWindow)):AgiInventoryWindow.renderList(inv,agiFont,inventoryIndex,{touch});
 paintInventoryDrawing(drawing);
 msg.textContent=inventoryView==='item'?AgiInventoryWindow.displayName(name)+'\n\n'+description:'You are carrying:\n'+inv.map(AgiInventoryWindow.displayName).join('\n')+'\nSelected: '+AgiInventoryWindow.displayName(inv[inventoryIndex])+'. Use Up and Down to select, Enter to examine, Escape to return.';
 textPopup.setAttribute('aria-label',inventoryView==='item'?'Inventory object':'Inventory');
 document.querySelector('#agi-message-help').textContent=inventoryView==='item'?'Tap, Enter or Escape returns to the list.':touch?'Tap an item to examine it. Escape returns to the game.':'Use Up and Down to select. Enter examines. Escape returns to the game.';
}
function inventoryTouchTap(event){
 if(!inventoryOpen||inventoryView!=='list'||!window.matchMedia('(hover: none) and (pointer: coarse)').matches||event.pointerType==='mouse')return false;
 const bitmap=document.querySelector('#agi-message-picture'),rect=bitmap.getBoundingClientRect();
 const x=(event.clientX-rect.left)*bitmap.width/rect.width,y=(event.clientY-rect.top)*bitmap.height/rect.height;
 const row=Math.floor((y-35)/12);
 if(x<20||x>=bitmap.width-20||y<35||row<0||row>=inv.length)return false;
 event.preventDefault();event.stopPropagation();inventoryIndex=row;inventoryView='item';paintInventory();return true;
}
function paintInventoryDrawing(drawing){
 const bitmap=document.querySelector('#agi-message-picture'),windowEl=document.querySelector('#agi-message-window');bitmap.width=drawing.width;bitmap.height=drawing.height;
 const context=bitmap.getContext('2d'),image=context.createImageData(drawing.width,drawing.height);
 for(let n=0;n<drawing.pixels.length;n++){const color=EGA[drawing.pixels[n]];image.data[n*4]=color[0];image.data[n*4+1]=color[1];image.data[n*4+2]=color[2];image.data[n*4+3]=255}
 context.putImageData(image,0,0);windowEl.style.maxWidth='100%';windowEl.style.left=(drawing.left/320*100)+'%';windowEl.style.top=(drawing.top/200*100)+'%';windowEl.style.width=(drawing.width/320*100)+'%';windowEl.style.aspectRatio=drawing.width+'/'+(drawing.height*1.2);
}
function showInventoryDescription(id,description){
 const name=carriedItems().find(item=>objectId(item)===id);
 const drawing=name&&inventoryPictures[name]?AgiInventoryWindow.renderDescription(name,description,agiFont,inventoryPictures,AgiMessageWindow,{showHelp:false}):null;
 say(name?AgiInventoryWindow.displayName(name)+'\n\n'+description:description);
 if(drawing){agiMessagePages=[];paintInventoryDrawing(drawing)}
}
function showInventory(){
 if(!inv.length){say('You are carrying nothing.');return}
 say('You are carrying:\n\n'+inv.map(AgiInventoryWindow.displayName).join('\n'));agiMessagePages=[];inventoryOpen=true;inventoryView='list';inventoryIndex=0;paintInventory();
}
function closeInventoryView(){
 if(inventoryView==='item'){inventoryView='list';paintInventory();return}
 inventoryOpen=false;document.querySelector('#agi-message-window').style.maxWidth='';textPopup.setAttribute('aria-label','Game message');document.querySelector('#agi-message-help').textContent='Press Enter, Space or Escape to continue.';closeMessage();
}
function inventoryKey(event){
 if(event.repeat&&['Enter','Escape',' ','Tab'].includes(event.key))return;
 if(['Escape','Tab'].includes(event.key)){closeInventoryView();return}
 if(['Enter',' '].includes(event.key)){if(inventoryView==='item')closeInventoryView();else{inventoryView='item';paintInventory()}return}
 if(inventoryView!=='list')return;
 if(['ArrowDown','ArrowRight'].includes(event.key))inventoryIndex=(inventoryIndex+1)%inv.length;
 else if(['ArrowUp','ArrowLeft'].includes(event.key))inventoryIndex=(inventoryIndex+inv.length-1)%inv.length;
 else if(event.key==='Home')inventoryIndex=0;
 else if(event.key==='End')inventoryIndex=inv.length-1;
 else return;
 paintInventory();
}
