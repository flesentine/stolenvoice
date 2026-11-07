// Rebuild the runtime title picture from its editable native-grid commands.
const fs=require('fs'),A=require('../editor/agi-picture.js'),project=JSON.parse(fs.readFileSync('assets/opening/opening-workshop-v2.json'));
const pixels=A.render(project.commands),runs=[];
for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}
fs.writeFileSync('game/opening-picture.js','const openingPicture='+JSON.stringify(Buffer.from(runs).toString('base64'))+';\nconst openingPennants=[];\nconst openingCloudSky='+JSON.stringify(Array.from(pixels.entries()).filter(([i,c])=>(c===1||c===14)&&i%160>=45&&i%160<=90&&Math.floor(i/160)<32).map(([i])=>i))+';\n');
