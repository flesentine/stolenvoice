'use strict';
const $=id=>document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x)),library=JSON.parse($('project-library').textContent);
let activeRoom='gallery',initial=library.gallery,storeKey='stolen-voice-agi-workshop-v1';
let project=clone(initial),history=[],future=[],selected=-1,pen=0,tool='line',draft=[],dragging=false,hover=null,timer=null,referenceObject=null;
const canvas=$('picture'),context=canvas.getContext('2d'),cursor=$('cursor'),cursorContext=cursor.getContext('2d');
const heroGuide=JSON.parse($('hero-guide-data').textContent);
const names=['Black','Blue','Green','Cyan','Red','Magenta','Brown','Light gray','Dark gray','Light blue','Light green','Light cyan','Light red','Light magenta','Yellow','White'];
const hints={line:'Drag between two native pixels to draw a line.',outline:'Click successive corners to draw a connected outline. Enter finishes it; Escape cancels.',polygon:'Click the corners of a closed filled shape. Enter fills it; Escape cancels.',flood:'Click an enclosed area to flood-fill it with the selected EGA color.',brush:'Drag to paint. Brush size is measured in native pixels.'};
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error)}
function persist(){try{localStorage.setItem(storeKey,JSON.stringify(project))}catch{message('Browser storage is unavailable. Use Save JSON to keep your drawing.')}}
function stop(){if(timer){clearInterval(timer);timer=null}$('play').textContent='Play drawing'}
function remember(){stop();history.push(JSON.stringify(project));if(history.length>80)history.shift();future=[]}
function setReference(){
 if(referenceObject)URL.revokeObjectURL(referenceObject);referenceObject=null;
 const value=project.reference||'';
 const guide=project.scaleGuide?.foot||[80,145];$('hero-x').value=guide[0];$('hero-y').value=guide[1];
 if(/^\.\.\/assets\/rooms\/[a-z0-9._-]+\.png$/i.test(value)){$('reference').src=value}else{$('reference').removeAttribute('src');$('show-reference').checked=false}
 $('reference').hidden=!$('show-reference').checked;
}
function all(){stop();$('steps').max=project.commands.length;$('steps').value=project.commands.length;paint()}
function showCommands(){
 const list=$('commands'),scroll=list.scrollTop;list.replaceChildren();
 project.commands.forEach((command,index)=>{
  const button=document.createElement('button');button.textContent=(index+1)+'. '+(command.hidden?'[hidden] ':'')+(command.name||command.type)+' · '+command.color;button.setAttribute('aria-pressed',String(index===selected));button.addEventListener('click',()=>select(index));list.append(button);
 });
 list.scrollTop=scroll;
 $('project-name').textContent=project.name||'Untitled picture';
}
function select(index){selected=index;showCommands();$('command-editor').value=index<0?'':JSON.stringify(project.commands[index],null,2);paintCursor()}
function changed(){draft=[];showCommands();if(selected>=project.commands.length)selected=project.commands.length-1;$('command-editor').value=selected<0?'':JSON.stringify(project.commands[selected],null,2);persist();all()}
function tempCommand(){
 if(!draft.length)return null;
 let points=draft.slice();if(hover&&!dragging&&['outline','polygon'].includes(tool))points.push(hover);
 if(tool==='polygon'&&points.length>=3)return{type:'polygon',points,color:pen,outline:0};
 return{type:tool==='brush'?'brush':'line',points,color:pen,size:Number($('brush-size').value)};
}
function paint(){
 const limit=Number($('steps').value),commands=project.commands.slice(0,limit),temp=tempCommand();if(temp)commands.push(temp);
 const pixels=AgiPicture.render(commands);context.putImageData(new ImageData(AgiPicture.rgba(pixels),160,168),0,0);
 $('step-label').textContent=limit+' / '+project.commands.length;paintCursor();
}
function paintCursor(){
 cursorContext.clearRect(0,0,160,168);
 if($('show-hero').checked){
  const gx=Math.max(4,Math.min(155,Number($('hero-x').value))),gy=Math.max(39,Math.min(167,Number($('hero-y').value)));
  for(let y=0;y<40;y++)for(let x=0;x<8;x++){const ink=heroGuide.rows[y][x];if(ink!=='.'){cursorContext.fillStyle=heroGuide.colors[parseInt(ink,16)];cursorContext.fillRect(gx-4+x,gy-39+y,1,1)}}
 }
 if(selected>=0){const command=project.commands[selected],points=command.points||[command.seed];if(points?.length){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);cursorContext.strokeStyle='#ffff55';cursorContext.setLineDash([1,1]);cursorContext.strokeRect(Math.min(...xs)-.5,Math.min(...ys)-.5,Math.max(...xs)-Math.min(...xs)+1,Math.max(...ys)-Math.min(...ys)+1);cursorContext.setLineDash([])}}
 if(hover){const [x,y]=hover;cursorContext.fillStyle='#ffffff';cursorContext.fillRect(x-2,y,1,1);cursorContext.fillRect(x+2,y,1,1);cursorContext.fillRect(x,y-2,1,1);cursorContext.fillRect(x,y+2,1,1);$('coordinates').textContent=x+', '+y}
}
function append(command){try{AgiPicture.validate(command);remember();project.commands.push(command);selected=project.commands.length-1;changed();message('Added '+command.type+' in '+names[command.color]+'.')}catch(e){message(e.message,true)}}
function finish(){
 if(!draft.length)return;
 const minimum=tool==='polygon'?3:2;if(draft.length<minimum){message('Add '+minimum+' or more points before finishing.',true);return}
 append({type:tool==='polygon'?'polygon':'line',name:tool==='polygon'?'Filled shape':'Outline',points:draft.slice(),color:pen,...(tool==='polygon'?{outline:0}:{})});
}
function locationOf(event){const rect=cursor.getBoundingClientRect();return[Math.max(0,Math.min(159,Math.floor((event.clientX-rect.left)/rect.width*160))),Math.max(0,Math.min(167,Math.floor((event.clientY-rect.top)/rect.height*168)))]}
function chooseTool(value){tool=value;draft=[];dragging=false;document.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===tool)));$('hint').textContent=hints[tool];paint()}
AgiPicture.palette.forEach((color,index)=>{const button=document.createElement('button');button.className='swatch';button.style.backgroundColor=color;button.title=index+' · '+names[index]+' '+color;button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(index===pen));button.addEventListener('click',()=>{pen=index;document.querySelectorAll('.swatch').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));$('pen-label').textContent='Pen '+index+' · '+names[index];paint()});$('palette').append(button)});
const label=document.createElement('output');label.id='pen-label';label.textContent='Pen 0 · Black';$('palette').append(label);const coordinates=document.createElement('output');coordinates.id='coordinates';coordinates.textContent='0, 0';$('palette').append(coordinates);
document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>chooseTool(button.dataset.tool)));
cursor.addEventListener('pointerdown',event=>{
 if(event.button!==0)return;stop();all();cursor.focus();const point=locationOf(event);hover=point;
 if(event.altKey){$('show-hero').checked=true;$('hero-x').value=point[0];$('hero-y').value=Math.max(39,point[1]);paintCursor();message('Moved Rosella\'s 40-pixel scale guide. The guide is not exported.');return}
 if(tool==='flood'){append({type:'flood',name:'Flood fill',seed:point,color:pen});return}
 if(tool==='outline'||tool==='polygon'){draft.push(point);paint();return}
 dragging=true;cursor.setPointerCapture(event.pointerId);draft=tool==='line'?[point,point]:[point];paint();
});
cursor.addEventListener('pointermove',event=>{
 hover=locationOf(event);
 if(dragging){if(tool==='line')draft[1]=hover;else if(draft[draft.length-1]?.join(',')!==hover.join(','))draft.push(hover);paint()}
 else if(draft.length)paint();else paintCursor();
});
function endStroke(event){if(!dragging)return;dragging=false;const points=draft.slice();if(cursor.hasPointerCapture(event.pointerId))cursor.releasePointerCapture(event.pointerId);if(points.length)append({type:tool==='brush'?'brush':'line',name:tool==='brush'?'Brush stroke':'Line',points,color:pen,...(tool==='brush'?{size:Number($('brush-size').value)}:{})})}
cursor.addEventListener('pointerup',endStroke);cursor.addEventListener('pointercancel',()=>{dragging=false;draft=[];paint()});cursor.addEventListener('pointerleave',()=>{if(!dragging){hover=null;paintCursor()}});
$('show-hero').onchange=paintCursor;$('hero-x').oninput=paintCursor;$('hero-y').oninput=paintCursor;
$('finish').onclick=finish;$('cancel').onclick=()=>{draft=[];dragging=false;paint();message('Unfinished stroke cancelled.')};
function undo(){if(!history.length)return;stop();future.push(JSON.stringify(project));project=JSON.parse(history.pop());selected=-1;draft=[];setReference();showCommands();$('command-editor').value='';persist();all()}
function redo(){if(!future.length)return;stop();history.push(JSON.stringify(project));project=JSON.parse(future.pop());selected=-1;draft=[];setReference();showCommands();$('command-editor').value='';persist();all()}
$('undo').onclick=undo;$('redo').onclick=redo;
$('show-reference').onchange=()=>{$('reference').hidden=!$('show-reference').checked};$('reference-opacity').oninput=()=>{$('reference').style.opacity=Number($('reference-opacity').value)/100};$('show-grid').onchange=()=>{$('grid').hidden=!$('show-grid').checked};$('zoom').onchange=()=>{$('stage').style.width=$('zoom').value+'px'};
$('reference-file-button').onclick=()=>$('reference-file').click();$('reference-file').onchange=event=>{const file=event.target.files[0];if(!file)return;if(referenceObject)URL.revokeObjectURL(referenceObject);referenceObject=URL.createObjectURL(file);$('reference').src=referenceObject;$('show-reference').checked=true;$('reference').hidden=false;message('Local reference loaded for this visit. It will not be included in exported artwork.')};
$('steps').oninput=()=>{stop();draft=[];paint()};$('all').onclick=all;$('play').onclick=()=>{if(timer){stop();return}draft=[];if(Number($('steps').value)>=project.commands.length)$('steps').value=0;$('play').textContent='Pause';timer=setInterval(()=>{let next=Number($('steps').value)+1;$('steps').value=Math.min(next,project.commands.length);paint();if(next>=project.commands.length)stop()},90)};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('save-json').onclick=()=>download(new Blob([JSON.stringify({...project,room:activeRoom},null,2)],{type:'application/json'}),activeRoom+'-agi-picture.json');
$('save-png').onclick=()=>{const output=document.createElement('canvas');output.width=160;output.height=168;output.getContext('2d').putImageData(new ImageData(AgiPicture.rgba(AgiPicture.render(project.commands)),160,168),0,0);output.toBlob(blob=>download(blob,activeRoom+'-160x168.png'),'image/png');message('Exported the full native picture, without the reference, grid or cursor.')};
function openProject(value){AgiPicture.project(value);remember();project=clone(value);project.palette=[...AgiPicture.palette];selected=-1;draft=[];setReference();$('command-editor').value='';changed()}
$('import').onclick=()=>$('project-file').click();$('project-file').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{openProject(JSON.parse(await file.text()));message('Opened '+file.name)}catch(e){message(e.message,true)}event.target.value=''};
$('room-choice').onchange=event=>{
 persist();stop();activeRoom=event.target.value;initial=clone(library[activeRoom]);
 storeKey=activeRoom==='gallery'?'stolen-voice-agi-workshop-v1':'stolen-voice-agi-workshop-v1-'+activeRoom;
 project=clone(initial);history=[];future=[];draft=[];selected=-1;
 try{const saved=localStorage.getItem(storeKey);if(saved)project=AgiPicture.project(JSON.parse(saved))}catch{}
 project.palette=[...AgiPicture.palette];setReference();$('command-editor').value='';showCommands();all();message('Opened '+project.name+'. Each room has its own browser autosave.');
};
$('reset').onclick=()=>{openProject(initial);message('Original room reopened. Undo restores your previous drawing.')};
$('new').onclick=()=>{openProject({format:'agi-picture-workshop',version:1,name:'Untitled picture',width:160,height:168,palette:AgiPicture.palette,commands:[]});message('New white picture. Undo restores the previous drawing.')};
function editSelected(change){if(selected<0){message('Select a drawing command first.',true);return}try{const command=change(clone(project.commands[selected]));AgiPicture.validate(command);remember();project.commands[selected]=command;changed()}catch(e){message(e.message,true)}}
$('apply').onclick=()=>editSelected(()=>JSON.parse($('command-editor').value));$('apply-color').onclick=()=>editSelected(command=>({...command,color:pen}));$('hide').onclick=()=>editSelected(command=>({...command,hidden:!command.hidden}));
$('delete').onclick=()=>{if(selected<0)return;remember();project.commands.splice(selected,1);selected=-1;changed()};
function move(direction){const next=selected+direction;if(selected<0||next<0||next>=project.commands.length)return;remember();[project.commands[selected],project.commands[next]]=[project.commands[next],project.commands[selected]];selected=next;changed()}
$('up').onclick=()=>move(-1);$('down').onclick=()=>move(1);
document.addEventListener('keydown',event=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();return}
 if(event.key==='Enter'){event.preventDefault();finish()}else if(event.key==='Escape'){$('cancel').click()}
});
try{const saved=localStorage.getItem(storeKey);if(saved){const value=JSON.parse(saved);AgiPicture.project(value);project=value;project.palette=[...AgiPicture.palette];message('Restored your autosaved editor project. Reopen room loads the supplied redraw.')}}catch{message('Loaded the supplied gallery. Browser autosave is unavailable or invalid.')}
setReference();showCommands();all();chooseTool('line');
