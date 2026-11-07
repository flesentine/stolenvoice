// Source-art proof sheet, not a browser/gameplay screenshot.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),sharp=require('sharp'),root=path.resolve(__dirname,'..');
const project=JSON.parse(fs.readFileSync(path.join(root,'assets/opening/opening-workshop-v1.json'))),pixels=A.render(project.commands),font=fs.readFileSync(path.join(root,'assets/fonts/alder-pixel-8x8.bin')),rgb=Buffer.alloc(320*200*3);
const dot=(x,y,c)=>{const col=A.palette[c].slice(1);for(let k=0;k<3;k++)rgb[(y*320+x)*3+k]=parseInt(col.slice(k*2,k*2+2),16)};
for(let y=0;y<168;y++)for(let x=0;x<160;x++){dot(x*2,y+20,pixels[y*160+x]);dot(x*2+1,y+20,pixels[y*160+x]);}
function text(str,y,c){const left=(320-str.length*8)/2;for(let i=0;i<str.length;i++)for(let row=0;row<8;row++)for(let bit=0;bit<8;bit++)if(font[str.charCodeAt(i)*8+row]&(128>>bit))dot(left+i*8+bit,y+row,c)}
text('ELARA',1,14);text('AND THE STOLEN VOICE',10,15);text('PRESS ENTER FOR MUSIC',192,15);
sharp(rgb,{raw:{width:320,height:200,channels:3}}).resize(960,600,{fit:'fill',kernel:'nearest'}).png().toFile(path.join(root,'assets/opening/opening-art-proof.png')).then(()=>console.log('Saved opening source-art proof.'));
