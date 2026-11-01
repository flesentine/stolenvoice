// Same courtyard underpainting, with the open door leaf replaced by a closed leaf.
const fs=require('fs'),path=require('path'),Agi=require('../editor/agi-picture.js');
module.exports=function(stage=0){const project=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/rooms/courtyard-workshop-v1.json'),'utf8'));
const commands=project.commands.filter(c=>c.name!=='Open oak door'&&!(c.name.startsWith('Door ')&&!c.name.startsWith('Doorframe')));
const p=(name,points,color,outline=null)=>commands.push({type:'polygon',name,points,color,outline}),l=(name,points,color)=>commands.push({type:'line',name,points,color});
// A dim glimpse of the actual workshop, behind the swinging door leaf.
// Restrict every detail to the opening so the facade and sill stay intact.
p('Workshop interior back wall',[[28,59],[40,59],[40,87],[28,87]],8);
p('Workshop interior left return',[[26,58],[28,60],[28,86],[26,95]],0);
p('Workshop interior floor',[[28,86],[39,86],[40,95],[27,95]],6);
l('Workshop floor board seam',[[32,87],[30,95]],0);
l('Workshop floor board seam',[[36,87],[37,95]],0);
l('Workshop back skirting',[[28,85],[39,85]],0);
p('Shadowed pot shelf',[[29,70],[39,70],[39,72],[29,72]],6);
l('Shelf underside',[[29,73],[39,73]],0);
l('Shelf bracket',[[38,73],[38,77],[36,73]],0);
p('Small clay pot',[[29,66],[33,66],[32,69],[30,69]],4,0);
l('Pot rim',[[29,65],[33,65]],6);
l('Pot stem',[[31,64],[31,62]],2);
l('Pot leaf',[[31,63],[29,62]],2);
l('Hanging tool handle',[[37,61],[37,66]],6);
p('Hanging trowel silhouette',[[36,66],[38,66],[38,68],[37,69],[36,68]],0);
l('Trowel edge',[[38,66],[38,68]],7);
// The right hinge stays at x41; the free edge swings through edge-on.
const free=[26,27,30,34,38,41,45,48,50][stage],dip=[0,0,1,2,3,4,4,4,4][stage];
const point=(u,v)=>[Math.round(41+(free-41)*u),Math.round(58+v+dip*u)];
const quad=(name,u0,v0,u1,v1,c)=>p(name,[point(u0,v0),point(u1,v0),point(u1,v1),point(u0,v1)],c);
p('Closed workshop door',[point(0,0),point(1,0),point(1,37),point(0,37)],6,8);
if(Math.abs(free-41)>2){
 for(const u of [.25,.5,.75])l('Oak plank seams',[point(u,1),point(u,36)],8);
 l('Door lit edge',[point(.05,1),point(.95,1)],14);
 for(const v of [7,30]){
  l('Iron cross strap',[point(.05,v),point(.95,v)],8);
  for(const u of [.12,.88])l('Strap pin',[point(u,v),point(u,v)],7);
 }
 quad('Lock plate',.77,17,.94,21,7);
 l('Keyhole',[point(.85,19),point(.85,20)],0);
 l('Ring handle',[point(.8,14),point(.92,14),point(.92,15),point(.8,15),point(.8,14)],7);
}
for(const v of [8,31])l('Fixed hinge pins',[[41,58+v],[41,60+v]],7);
if(stage===8)fs.writeFileSync(path.join(__dirname,'../assets/rooms/courtyard-open-door-workshop-v2.json'),JSON.stringify({...project,commands},null,2)+'\n');
if(stage===0)fs.writeFileSync(path.join(__dirname,'../assets/rooms/courtyard-closed-door-workshop-v1.json'),JSON.stringify({...project,commands},null,2)+'\n');
const pixels=Agi.render(commands),runs=[];for(let i=0;i<pixels.length;){let end=i+1;while(end<pixels.length&&pixels[end]===pixels[i]&&end-i<255)end++;runs.push(end-i,pixels[i]);i=end}return Buffer.from(runs).toString('base64');};
