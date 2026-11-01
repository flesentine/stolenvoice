// Native prop/art proof only; no browser or game screenshot.
const fs=require('fs'),vm=require('vm'),path=require('path'),sharp=require('sharp'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
const base=A.render(JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/mill-workshop-v1.json'))).commands),colors=A.palette;let pixels;
const s={flags:{wheelTurned:false,cabinetOpen:false,jarTaken:false},window:{addEventListener(){}},x:{fillStyle:'',fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<160&&yy>=0&&yy<168)pixels[yy*160+xx]=colors.indexOf(this.fillStyle)}},insidePolygon(px,py,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>py)!==(p[j][1]>py)&&px<(p[j][0]-p[i][0])*(py-p[i][1])/(p[j][1]-p[i][1])+p[i][0])inside=!inside;return inside}};
vm.createContext(s);vm.runInContext(fs.readFileSync(path.join(root,'game/mill-cabinet.js'),'utf8')+';globalThis.art={drawMillCabinet,set(action,motion,door){millAction=action;hoistMotion=motion;cabinetMotion=door}};',s);
const width=68*4,height=108,raw=Buffer.alloc(width*height*3);
for(let f=0;f<4;f++){
 pixels=base.slice();s.flags.wheelTurned=f>0;s.flags.cabinetOpen=f===3;s.art.set(f===1?'hoist':null,f===1?6:12,f===3?6:0);s.art.drawMillCabinet();
 for(let y=0;y<height;y++)for(let x=0;x<68;x++){const c=colors[pixels[(y+21)*160+x+73]];for(let k=0;k<3;k++)raw[(y*width+f*68+x)*3+k]=parseInt(c.slice(1+k*2,3+k*2),16)}
}
sharp(raw,{raw:{width,height,channels:3}}).resize(width*4,height*3,{fit:'fill',kernel:'nearest'}).png().toFile(path.join(root,'assets/reviews/playwright-hoist-proof.png')).then(()=>console.log('Saved four native hoist/cupboard source-art details.'));
