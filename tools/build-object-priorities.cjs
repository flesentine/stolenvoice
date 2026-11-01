// Compile visible native-pixel masks and independent ground footprints.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
module.exports=function(){
 const definitions={};
 const add=(room,project,id,commands,footprint,base)=>{if(!commands.length)throw Error('Missing priority object '+id);(definitions[room]??=[]).push({id,art:project.room,commands:new Set(commands),footprint,base})};
 for(const [room,art]of [[1,'gallery'],[2,'potting'],[3,'orchard'],[4,'bridge'],[6,'grotto'],[7,'belfry'],[8,'courtyard']]){
  const project=JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/'+art+'-workshop-v1.json')));project.room=art;const cmds=art==='gallery'?project.commands.filter(c=>!['Closed red book','Book pages','Book gold clasp','Book upper edge'].includes(c.name)):project.commands;
  if([3,4].includes(room))for(const name of new Set(cmds.map(c=>c.name))){
   if(!/^(Rock|Bank stone|Fir|Apple tree) /.test(name))continue;
   const group=cmds.filter(c=>c.name===name),points=group.flatMap(c=>c.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),base=Math.max(...ys);
   let foot;
   if(/^(Fir|Apple tree)/.test(name)){const [x,y]=name.match(/(\d+),(\d+)/).slice(1).map(Number);foot=[[x-3,y-2],[x+4,y-2],[x+4,base],[x-3,base]]}
   else foot=[[left+2,base-4],[right-2,base-4],[right-1,base-1],[right-4,base],[left+3,base]];
   add(room,project,name,group,foot,base);
  }
  if(room===3){
   // These finishing strokes are authored after all three trees. They still
   // belong to the nearest tree, rather than cutting holes in its mask.
   const trees=definitions[room].filter(o=>o.id.startsWith('Apple tree '));
   for(const command of cmds.filter(c=>['Apple clusters','Bark forks'].includes(c.name))){
    const cx=command.points.reduce((n,p)=>n+p[0],0)/command.points.length;
    const distance=tree=>Math.abs(Number(tree.id.match(/(\d+),/)[1])-cx);
    trees.reduce((a,b)=>distance(a)<distance(b)?a:b).commands.add(command);
   }
  }
  if(room===4){
   add(room,project,'bridge-decking',cmds.filter(c=>['Bridge decking','Bridge edge timbers'].includes(c.name)),[],127);
   for(const [i,support]of cmds.filter(c=>c.name==='Bridge supports').entries()){
    const baseline=Math.max(...support.points.map(point=>point[1]));
    add(room,project,'bridge-supports-'+(i===0?'left':'right'),[support],[],baseline);
   }
  }
  if(room===4)for(const name of new Set(cmds.map(c=>c.name))){if(!name.startsWith('Bridge post '))continue;const [x,y]=name.match(/(\d+),(\d+)/).slice(1).map(Number),base=y+(x===40||x===119?23:15);add(room,project,name,cmds.filter(c=>c.name===name),[[x,base-2],[x+3,base-2],[x+3,base],[x,base]],base);}
  if(room===1){
   const tableStart=cmds.findIndex(c=>c.name==='Rear table legs'),chairStart=cmds.findIndex(c=>c.name==='Chair outer back');
   add(room,project,'book-table',cmds.slice(tableStart,chairStart),[[20,115],[50,115],[50,124],[20,124]],124);
   add(room,project,'gallery-chair',cmds.slice(chairStart),[[101,119],[121,119],[121,122],[101,122]],122);
  }
  if(room===7){
   const starts=cmds.map((c,i)=>c.name==='Stair newel post'?i:-1).filter(i=>i>=0),railStart=cmds.findIndex(c=>c.name==='Sloped oak handrail');
   if(starts.length!==2||railStart<0)throw Error('Belfry stair railing commands missing');
   for(const [i,start]of starts.entries()){
    const points=cmds[start].points,left=Math.min(...points.map(p=>p[0])),right=Math.max(...points.map(p=>p[0])),base=Math.max(...points.map(p=>p[1]));
    add(room,project,'belfry-stair-post-'+i,cmds.slice(start,starts[i+1]??railStart),[[left,base-2],[right,base-2],[right,base],[left,base]],base);
   }
   // Project the rail down to the floor between its two newel feet. A thin
   // diagonal barrier stops walking through it without sealing the stair end.
   add(room,project,'belfry-stair-handrail',cmds.filter(c=>['Sloped oak handrail','Handrail light'].includes(c.name)),[[0,144],[22,137],[23,140],[0,147]],144);
  }
  if(room===2){
   const start=cmds.findIndex(c=>c.name==='Bench contact shadow'),end=cmds.findIndex(c=>c.name==='Leaning spare board');
   add(room,project,'potting-bench',cmds.slice(start,end),[[58,125],[102,125],[102,130],[58,130]],130);
   // Include the front contact row: rounding y=185 to native row 130
   // otherwise lets her feet enter the barrel while it still paints in front.
   add(room,project,'storage-barrel',cmds.filter(c=>/^(Barrel|Small storage barrel|Upper curved|Upper hoop|Lower curved|Lower hoop|Lid plank)/.test(c.name)),[[132,123],[144,123],[146,126],[145,130],[131,130],[130,126]],130);
  }
  if(room===6){
   const shapes=cmds.filter(c=>c.name==='Low stalagmites');
   for(let i=0;i<shapes.length;i+=2){const group=shapes.slice(i,i+2),points=group[0].points,left=Math.min(...points.map(p=>p[0])),right=Math.max(...points.map(p=>p[0])),base=Math.max(...points.map(p=>p[1]));add(room,project,'stalagmite-'+i,group,[[left+1,base-2],[right-1,base-2],[right,base],[left,base]],base)}
  }
  if(room===8){
   add(room,project,'raised-planter',cmds.filter(c=>/^(Raised oak planter|Planter |Flower stem|Flower leaves|Garden flowers)/.test(c.name)),[[50,114],[95,114],[94,118],[50,118]],118);
   // Each pier begins a separate consecutive group of authored shapes.
   const starts=cmds.map((c,i)=>c.name==='Gateway pier'?i:-1).filter(i=>i>=0);
   for(const [index,start]of starts.entries()){
    let end=start+1;while(end<cmds.length&&!['Gateway pier','Sunlit grass blades','Lawn grass','Lawn flower'].includes(cmds[end].name))end++;
    const x=index===0?7:132;
    add(room,project,'gate-pier-'+index,cmds.slice(start,end),[[x,164],[x+17,164],[x+17,168],[x,168]],168);
   }
  }
  // Ownership is determined in drawing order. Later walls/branches hide the
  // earlier object mask, avoiding rectangular or color-key foreground patches.
  const owner=new Int16Array(160*168).fill(-1);
  for(const command of cmds){
   const id=(definitions[room]||[]).findIndex(d=>d.commands.has(command));
   const coverage=A.render([{...command,color:0,outline:command.outline==null?null:0}]);
   for(let n=0;n<coverage.length;n++)if(coverage[n]===0)owner[n]=id;
  }
  for(const [index,definition]of (definitions[room]||[]).entries()){
   // Posts are solid wood. Later rail/grass strokes must not punch
   // transparent holes in their shafts or replace the post surface.
   if(definition.id.startsWith('Bridge post ')){
    const shapes=cmds.filter(c=>c.name===definition.id),ink=A.render(shapes),coverage=A.render(shapes.map(c=>({...c,color:0,outline:c.outline==null?null:0})));
    definition.ink=[];
    for(let n=0;n<coverage.length;n++)if(coverage[n]===0){owner[n]=index;definition.ink.push([n,ink[n]])}
   }
   definition.mask=[];
   for(let y=0;y<168;y++)for(let x=0;x<160;){if(owner[y*160+x]!==index){x++;continue}const left=x;while(x<160&&owner[y*160+x]===index)x++;definition.mask.push([left,y,x-left])}
   definition.depth=Math.ceil(definition.base/0.7);delete definition.commands;delete definition.base;
  }
 }
 // Fully hidden objects have no ground footprint in the visible scene.
 for(const room of Object.keys(definitions))definitions[room]=definitions[room].filter(o=>o.mask.reduce((n,run)=>n+run[2],0)>=8);
 return definitions;
};
