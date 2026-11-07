// Isolated character/prop proof sheet, not a game or browser screenshot.
const fs=require('fs'),vm=require('vm'),path=require('path'),sharp=require('sharp'),root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('stolen-voice-short.html'),sprites=JSON.parse(source.match(/const elaraWalkSprites=(\{[^\n]+\});/)[1]),colors=JSON.parse(source.match(/const elaraColors=(\[[^\n]+\]);/)[1]),merrin=JSON.parse(source.match(/const merrinSprite=(\[[^\n]+\]);/)[1]),font=fs.readFileSync(path.join(root,'assets/fonts/alder-pixel-8x8.bin')),pictures=vm.runInNewContext(read('game/inventory-pictures.js')+';inventoryPictures');
let pixels;
const s={player:{x:80,y:100,step:0,facing:'right'},room:6,flags:{jarTaken:true,jarSealed:true,bellRung:false},animationFrame:0,bellAction:null,elaraWalkSprites:sprites,elaraColors:colors,inventoryPictures:pictures,pictureX:x=>Math.round(x/2),pictureY:y=>Math.round(y*.7),atob:b=>Buffer.from(b,'base64').toString('binary'),window:{addEventListener(){}},ellipse(px,py,w){s.x.fillStyle='#000000';s.x.fillRect(Math.round(px/2)-3,Math.round(py*.7),7,1)},x:{fillStyle:'',fillRect(x,y,w,h){const c=colors.indexOf(this.fillStyle);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<160&&yy>=0&&yy<168)pixels[yy*160+xx]=c}}};vm.createContext(s);vm.runInContext(read('game/gallery-room.js')+read('game/story-effects.js')+';globalThis.art={set(kind,frame){storyAction=kind?{kind,frame,total:14}:null},drawStoryHero,drawBellJar,drawMerrinRecovery};',s);
const cells=[['Open jar','echoCaught',0],['Echo caught','echoCaught',12],['Voice jar','voiceOffered',4],['Emptied jar','voiceReturned',8],['Bell answers','bell',9],['Merrin recovers','voiceArrival',13]],board=Buffer.alloc(360*180*3);
for(let i=0;i<cells.length;i++){
 const [title,kind,frame]=cells[i];pixels=new Uint8Array(160*168).fill(8);s.art.set(kind,frame);
 if(kind==='bell'){
  s.art.set(null,0);s.room=7;s.flags.bellRung=true;s.bellAction={stage:'jump',frame,outcome:'voice'};
  const rows=sprites.front[0],left=36,top=31;for(let y=0;y<40;y++)for(let x=0;x<8;x++)if(rows[y][x]!=='.')pixels[(top+y)*160+left+x]=parseInt(rows[y][x],16);s.art.drawBellJar();
 }else if(kind==='voiceArrival'){
  for(let y=0;y<38;y++)for(let x=0;x<8;x++)if(merrin[y][x]!=='.')pixels[(33+y)*160+36+x]=parseInt(merrin[y][x],16);s.art.drawMerrinRecovery(80,100);
 }else s.art.drawStoryHero(80,100);
 const ox=i%3*120,oy=Math.floor(i/3)*90;
 const dot=(x,y,c)=>{const rgb=colors[c].slice(1);for(let k=0;k<3;k++)board[((oy+y)*360+ox+x)*3+k]=parseInt(rgb.slice(k*2,k*2+2),16)};
 for(let y=0;y<72;y++)for(let x=0;x<60;x++){const c=pixels[(y+12)*160+x+20];dot(x*2,y,c);dot(x*2+1,y,c)}
 for(let col=0;col<title.length;col++)for(let row=0;row<8;row++)for(let bit=0;bit<8;bit++)if(font[title.charCodeAt(col)*8+row]&(128>>bit))dot(col*8+bit,78+row,15);
}
sharp(board,{raw:{width:360,height:180,channels:3}}).resize(1080,648,{fit:'fill',kernel:'nearest'}).png().toFile(path.join(root,'assets/reviews/story-effect-cels-proof.png')).then(()=>console.log('Saved isolated Elara/jar/Merrin source-art proof.'));
