// Dispatch complete authored room pictures; no raster reference is sampled.
const scene=require('./agi-room-scenes.cjs');
const gallery=require('./agi-gallery-scene.cjs');
module.exports=function draw(name,pen){
 if(name==='gallery'){gallery(pen);return}
 if(!scene(name,pen))throw Error('Unknown room drawing: '+name);
};
