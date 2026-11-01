const fs=require('fs'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const project=JSON.parse(fs.readFileSync('assets/rooms/courtyard-workshop-v1.json')),p=A.render(project.commands);
for(let row=0;row<=34;row++){
 const half=row<30?4:34-row,y=50+row;
 for(const cx of [104,154])for(let d=0;d<=half;d++)assert.equal(p[y*160+cx-d],p[y*160+cx+d],`banner ${cx}, row ${y}, offset ${d}`);
 for(let dx=-half;dx<=half;dx++)assert.equal(p[y*160+104+dx],p[y*160+154+dx],'matching pair');
}
for(const c of project.commands.filter(c=>c.name==='Battlement')){assert.equal(c.color,7);assert.equal(c.outline,null)}
for(const [x,y]of [[120,30],[143,32],[151,88]])assert.equal(p[y*160+x],7);
assert(p.every(c=>c<16));
console.log('PASS symmetric banner pixels, matching pair, unoutlined light stone battlements and sunlit wall samples.');
