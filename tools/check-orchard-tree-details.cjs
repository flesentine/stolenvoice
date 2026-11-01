const fs=require('fs'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const project=require('../assets/rooms/orchard-workshop-v1.json'),objects=require('./build-object-priorities.cjs')()[3],trees=objects.filter(o=>o.id.startsWith('Apple tree '));
const details=project.commands.filter(c=>['Apple clusters','Bark forks'].includes(c.name)),coverage=A.render(details.map(c=>({...c,color:0,outline:c.outline==null?null:0}))),owned=new Set();
for(const tree of trees)for(const [x,y,n]of tree.mask)for(let i=x;i<x+n;i++)owned.add(y*160+i);
let checked=0;for(let i=0;i<coverage.length;i++)if(coverage[i]===0){assert(owned.has(i),'tree detail must be opaque at '+i%160+','+Math.floor(i/160));checked++}
assert(checked>100,'apple stems, fruit, highlights, leaves and bark exercised');
const base=A.render(project.commands),views=require('../assets/rosella-walk-stable-face-v2.json').views;
function composite(y){const pixels=base.slice(),queue=objects.map(o=>({depth:o.depth,paint(){for(const [x,sy,n]of o.mask)for(let i=x;i<x+n;i++)pixels[sy*160+i]=base[sy*160+i]}})),actor=[];
 const rows=views.back[1],left=71,top=Math.round(y*.7)-39;for(let row=0;row<40;row++)for(let col=0;col<8;col++)if(rows[row][col]!=='.')actor.push([(top+row)*160+left+col,parseInt(rows[row][col],16)]);
 queue.push({depth:y,paint(){for(const [i,c]of actor)pixels[i]=c}});queue.sort((a,b)=>a.depth-b.depth).forEach(o=>o.paint());return{pixels,actor};}
const behind=composite(170),front=composite(190);let overlap=0;
for(const [i,c]of behind.actor)if(coverage[i]===0&&owned.has(i)){assert.equal(behind.pixels[i],base[i],'fruit/bark covers actor behind tree');overlap++}
assert(overlap>0,'reproduces actor hair intersecting apple detail');for(const [i,c]of front.actor)assert.equal(front.pixels[i],c,'actor in front remains opaque');
console.log('PASS '+checked+' opaque orchard apple/bark pixels and behind/front actor compositing; no holes punched by late tree details.');
