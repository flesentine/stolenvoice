// The wheel powers a grain hoist. The cupboard is ordinary hinged furniture.
let cabinetMotion=0,cabinetTimer=0,cabinetReleasePhase=0,cabinetFocused=true,millAction=null,hoistMotion=0,millActionMessage='';
function resetMillCabinet(){
 if(cabinetTimer)clearInterval(cabinetTimer);
 cabinetTimer=0;cabinetMotion=0;cabinetReleasePhase=0;millAction=null;hoistMotion=0;millActionMessage='';
}
function finishMillAction(){
 const kind=millAction,message=millActionMessage;
 if(cabinetTimer)clearInterval(cabinetTimer);cabinetTimer=0;millAction=null;millActionMessage='';
 if(kind==='hoist'){hoistMotion=12;playGameSound('hoistRaised')}else cabinetMotion=kind==='close'?0:6;
 draw();if(message)say(message);
}
function startMillAction(kind,message){
 resetMillCabinet();stopWalking();millAction=kind;millActionMessage=message;cabinetMotion=kind==='close'?6:kind==='door'?1:0;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finishMillAction();return}
 cabinetTimer=setInterval(()=>{
  if(room!==5||!playing){resetMillCabinet();return}
  if(popupOpen||menuOpen||document.hidden||!cabinetFocused)return;
  if(kind==='hoist')hoistMotion++;else cabinetMotion+=kind==='close'?-1:1;
  if((kind==='hoist'&&hoistMotion>=12)||(kind==='door'&&cabinetMotion>=6)||(kind==='close'&&cabinetMotion<=0)){finishMillAction();return}draw();
 },95);draw();
}
function startGrainHoist(message){startMillAction('hoist',message)}
function closeMillCabinet(){startMillAction('close','You close the cupboard door.')}
function openMillCabinet(){startMillAction('door',flags.jarTaken?'The cupboard door swings open. Its measuring shelf is empty.':'You open the cupboard. An empty glass measuring jar stands on the shelf.')}
function millLinkLine(ax,ay,bx,by,color){
 x.fillStyle=color;
 const dx=Math.abs(bx-ax),dy=-Math.abs(by-ay),sx=ax<bx?1:-1,sy=ay<by?1:-1;
 let error=dx+dy;
 for(;;){x.fillRect(ax,ay,1,1);if(ax===bx&&ay===by)break;const twice=2*error;if(twice>=dy){error+=dy;ax+=sx}if(twice<=dx){error+=dx;ay+=sy}}
}
function drawGrainHoist(){
 const box=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 const rise=flags.wheelTurned?Math.round((millAction==='hoist'?hoistMotion:12)*56/12):0;
 // The diagonal drive rope ends at an overhead pulley, not the cupboard.
 millLinkLine(88,67,111,32,'#aa5500');millLinkLine(89,67,112,32,'#ffff55');
 box(112,25,25,3,'#aa5500');box(113,25,23,1,'#ffff55');
 box(120,28,9,8,'#555555');box(122,27,5,10,'#aaaaaa');box(123,30,3,4,'#000000');
 millLinkLine(124,35,124,93-rise,'#aa5500');
 // A small cleat shows why the raised load stays safely at the loft.
 box(136,36,2,10,'#aa5500');box(134,38,6,1,'#ffff55');
 const shape=[[121,92],[127,92],[128,97],[132,103],[134,120],[130,126],[116,126],[112,120],[114,103],[119,97]];
 for(let yy=92;yy<=126;yy++)for(let xx=112;xx<=134;xx++)if(insidePolygon(xx+.5,yy+.5,shape)){
  x.fillStyle=xx>130?'#555555':'#aaaaaa';x.fillRect(xx,yy-rise,1,1);
 }
 // Curved shoulders, tied neck, two seams and a small wheat stamp.
 for(let i=0;i<shape.length;i++)millLinkLine(shape[i][0],shape[i][1]-rise,shape[(i+1)%shape.length][0],shape[(i+1)%shape.length][1]-rise,'#aa5500');
 box(119,97-rise,10,2,'#aa5500');box(120,97-rise,7,1,'#ffff55');
 millLinkLine(116,103-rise,115,118-rise,'#ffffff');
 for(let yy=100;yy<121;yy+=4)box(129,yy-rise,1,2,'#aa5500');
 millLinkLine(123,102-rise,123,116-rise,'#aa5500');
 for(const yy of [106,110,114]){millLinkLine(123,yy-rise,120,yy-2-rise,'#aa5500');millLinkLine(123,yy-rise,126,yy-2-rise,'#aa5500')}
}
function drawMillCabinet(){
 const stage=millAction==='close'?cabinetMotion:flags.cabinetOpen?(cabinetMotion?Math.min(6,cabinetMotion):6):0;
 // Coordinates below are native picture pixels, independent of walking scale.
 const box=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 // Warm, recessed timber back and side returns rather than an empty void.
 box(115,78,16,27,'#aa0000');box(115,78,1,25,'#555555');box(116,78,14,2,'#555555');
 for(const bx of [117,122,127])box(bx,81,1,21,'#aa5500');
 box(118,85,1,3,'#555555');box(126,94,1,4,'#555555');
 // A solid shelf supports the jar; its base touches the shelf's top row.
 box(116,103,14,2,'#aa5500');box(116,103,14,1,'#ffff55');
 if(stage===6&&pickupStillInScene('jarTaken')){
  box(119,102,9,1,'#555555');
  box(121,87,4,2,'#aaaaaa');box(121,89,4,2,'#00aaaa');
  box(120,91,6,12,'#00aaaa');box(121,92,1,9,'#55ffff');box(122,102,3,1,'#55ffff');
 }
 const width=[16,15,13,10,7,4,2][stage],edge=131-width;
 box(edge,78,width,27,'#aa5500');box(edge,78,1,27,'#000000');box(edge+1,79,Math.max(1,width-2),1,'#ffff55');box(edge+1,103,Math.max(1,width-2),1,'#000000');
 if(width>7){box(edge+3,82,width-5,1,'#555555');box(edge+3,82,1,17,'#555555');box(edge+3,99,width-5,1,'#000000');box(edge+2,91,1,3,'#000000')}
 box(131,83,2,3,'#555555');box(131,99,2,3,'#555555');
 drawGrainHoist();
}

window.addEventListener('blur',()=>{cabinetFocused=false});window.addEventListener('focus',()=>{cabinetFocused=true});
