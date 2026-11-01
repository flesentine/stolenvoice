// Native cover-turn cels, composited over the real table/wall underpainting.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
module.exports=function(){
 const project=JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/gallery-workshop-v1.json'))),bookNames=['Closed red book','Book pages','Book gold clasp','Book upper edge'],under=project.commands.filter(c=>!bookNames.includes(c.name)),book=project.commands.filter(c=>bookNames.includes(c.name));
 const p=(points,color,outline=0)=>({type:'polygon',points,color,outline}),l=(points,color)=>({type:'line',points,color});
 const right=[p([[32,89],[42,88],[44,90],[43,94],[32,95]],4),p([[33,89],[42,89],[43,90],[42,93],[33,94]],15,null),l([[34,91],[40,90]],7)];
 // The fully open spread is built from one leaf mirrored about native x33.
 // Cover-turn cels remain asymmetric while the left cover is in motion.
 const leaf=[p([[33,89],[40,87],[43,88],[44,90],[43,94],[33,96]],4),p([[34,89],[40,88],[42,89],[43,90],[42,93],[34,95]],15,null),l([[35,91],[40,91]],7),l([[35,93],[39,93]],7)];
 const reflect=command=>({...command,points:command.points.map(([x,y])=>[66-x,y])});
 const spread=[...leaf,...leaf.map(reflect),l([[33,89],[33,96]],6)];
 const covers=[null,[[32,88],[41,83],[42,85],[33,94]],[[32,88],[34,79],[35,81],[33,94]],[[32,88],[28,81],[27,84],[33,94]],[[32,88],[25,85],[24,89],[33,94]],[[32,89],[25,87],[23,90],[24,94],[32,96]]];
 const encode=pixels=>{const runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}return Buffer.from(runs).toString('base64')};
 const background=encode(A.render(under));
 const frames=[];for(let frame=0;frame<6;frame++){
  let cel=book;if(frame){cel=[...right,p(covers[frame],4),l([covers[frame][0],covers[frame][1]],12)];if(frame===5)cel=spread;}
  const full=A.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null},...cel]),pixels=[];for(let y=78;y<97;y++)for(let x=22;x<47;x++){
   // Reflect the rasterized leaf too: polygon edge tie-breaking can otherwise
   // leave the two geometric halves a native pixel apart.
   const sampleX=frame===5&&x<33?66-x:x,ink=full[y*160+sampleX];pixels.push(ink===3?16:ink);
  }
  const runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}frames.push(Buffer.from(runs).toString('base64'));
 }
 fs.writeFileSync(path.join(root,'game/book-pictures.js'),'const galleryBookBackground='+JSON.stringify(background)+';\nconst galleryBookPicture='+JSON.stringify({left:22,top:78,width:25,height:19,frames})+';\n');
};
