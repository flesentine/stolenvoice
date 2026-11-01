/* Shared locked-grid renderer for the editor, exports and game asset build. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AgiPicture=factory()})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const width=160,height=168;
 const palette=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
 function color(n){if(!Number.isInteger(n)||n<0||n>15)throw Error('Choose one of the 16 EGA colors.');return n}
 function point(p,edge=false){if(!Array.isArray(p)||p.length!==2||!p.every(Number.isInteger)||p[0]<0||p[1]<0||p[0]>(edge?160:159)||p[1]>(edge?168:167))throw Error('Drawing coordinates must stay on the 160 × 168 grid.');return p}
 function validate(command){
  if(!command||typeof command!=='object')throw Error('Invalid drawing command.');
  color(command.color);
  if(['line','polygon','brush'].includes(command.type)){
   if(!Array.isArray(command.points)||command.points.length<(command.type==='polygon'?3:1)||command.points.length>20000)throw Error('Invalid drawing points.');
   command.points.forEach(p=>point(p,command.type==='polygon'));
   if(command.type==='polygon'&&command.outline!==null&&command.outline!==undefined)color(command.outline);
   if(command.type==='brush'&&![1,2,3].includes(command.size||1))throw Error('Brush size must be 1, 2 or 3 native pixels.');
  }else if(command.type==='flood')point(command.seed);else throw Error('Unknown drawing command: '+command.type);
 }
 function project(value){
  if(!value||value.width!==width||value.height!==height||!Array.isArray(value.commands)||value.commands.length>20000)throw Error('This editor opens 160 × 168 AGI drawing projects.');
  value.commands.forEach(validate);return value;
 }
 function render(commands,limit=commands.length){
  const pixels=new Uint8Array(width*height);pixels.fill(15);
  function dot(x,y,c,size=1){const offset=Math.floor(size/2);for(let yy=y-offset;yy<y-offset+size;yy++)for(let xx=x-offset;xx<x-offset+size;xx++)if(xx>=0&&xx<width&&yy>=0&&yy<height)pixels[yy*width+xx]=c}
  function segment(a,b,c,size=1){let [x,y]=a;const [xx,yy]=b,dx=Math.abs(xx-x),dy=-Math.abs(yy-y),sx=x<xx?1:-1,sy=y<yy?1:-1;let e=dx+dy;for(;;){dot(x,y,c,size);if(x===xx&&y===yy)break;const twice=e*2;if(twice>=dy){e+=dy;x+=sx}if(twice<=dx){e+=dx;y+=sy}}}
  function lines(points,c,closed=false,size=1){dot(...points[0],c,size);for(let i=1;i<points.length;i++)segment(points[i-1],points[i],c,size);if(closed)segment(points[points.length-1],points[0],c)}
  for(let i=0;i<Math.min(limit,commands.length);i++){
   const command=commands[i];validate(command);if(command.hidden)continue;
   const {type,color:c,points}=command;
   if(type==='line'||type==='brush')lines(points,c,false,type==='brush'?command.size||1:1);
   else if(type==='polygon'){
    for(let y=0;y<height;y++){
     const xs=[],scan=y+.5;
     for(let a=0,b=points.length-1;a<points.length;b=a++){
      const u=points[a],v=points[b];if((u[1]>scan)!==(v[1]>scan))xs.push(u[0]+(scan-u[1])*(v[0]-u[0])/(v[1]-u[1]));
     }
     xs.sort((a,b)=>a-b);
     for(let a=0;a+1<xs.length;a+=2)for(let x=Math.max(0,Math.ceil(xs[a]-.5));x<Math.min(width,xs[a+1]-.5);x++)pixels[y*width+x]=c;
    }
    if(command.outline!==null&&command.outline!==undefined)lines(points,command.outline,true);
   }else if(type==='flood'){
    const start=command.seed[1]*width+command.seed[0],original=pixels[start];if(original===c)continue;
    const queue=[start];pixels[start]=c;
    for(let head=0;head<queue.length;head++){
     const n=queue[head],x=n%width,y=Math.floor(n/width);
     for(const k of [x>0?n-1:-1,x<width-1?n+1:-1,y>0?n-width:-1,y<height-1?n+width:-1])if(k>=0&&pixels[k]===original){pixels[k]=c;queue.push(k)}
    }
   }
  }
  return pixels;
 }
 function rgba(pixels){const data=new Uint8ClampedArray(width*height*4);for(let n=0;n<pixels.length;n++){const hex=palette[pixels[n]];data[n*4]=parseInt(hex.slice(1,3),16);data[n*4+1]=parseInt(hex.slice(3,5),16);data[n*4+2]=parseInt(hex.slice(5,7),16);data[n*4+3]=255}return data}
 return{width,height,palette,validate,project,render,rgba};
});
