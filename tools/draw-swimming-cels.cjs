// Preserve the exact existing Rosella head. Animate only the water around it.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..'),out=path.join(root,'assets/swimming'),sprites={};
const walk=JSON.parse(fs.readFileSync(path.join(root,'assets/rosella-walk-stable-face-v2.json'),'utf8')).views;
for(const direction of ['left','right','back','front']){sprites[direction]=[];for(let frame=0;frame<4;frame++){
 const commands=[],rows=walk[direction][0];
 for(let y=0;y<14;y++)for(let x=0;x<8;x++)if(rows[y][x]!=='.')commands.push({type:'brush',name:'Original Rosella head',points:[[72+x,67+y]],size:1,color:parseInt(rows[y][x],16)});
 commands.push({type:'line',name:'Left ripple',points:[[67+frame,81],[70+frame,81]],color:11},{type:'line',name:'Right ripple',points:[[79,82],[82,82]],color:11},{type:'line',name:'Waterline',points:[[72,83],[78,83]],color:9});
 const project={format:'agi-picture-workshop',version:1,name:'Rosella swimming '+direction+' '+(frame+1),room:'swim-'+direction+'-'+frame,width:160,height:168,palette:A.palette,spriteRegion:[64,64,24,20],reference:'Existing Rosella walking sprite, head rows 0-13',commands};A.project(project);fs.writeFileSync(path.join(out,direction+'-'+frame+'.json'),JSON.stringify(project,null,2)+'\n');
 const bg={type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:5,outline:null},pixels=A.render([bg,...commands]),raw=[];for(let y=64;y<84;y++)for(let x=64;x<88;x++)raw.push(pixels[y*160+x]===5?16:pixels[y*160+x]);const runs=[];for(let i=0;i<raw.length;){let end=i+1;while(end<raw.length&&raw[end]===raw[i]&&end-i<255)end++;runs.push(end-i,raw[i]);i=end}sprites[direction].push(Buffer.from(runs).toString('base64'));
}}
fs.writeFileSync(path.join(root,'game/swimming-pictures.js'),'const swimmingPictures='+JSON.stringify(sprites)+';\n');console.log('Built sixteen water cels using the original Rosella head pixels.');
