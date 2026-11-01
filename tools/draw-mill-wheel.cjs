// Rotating timber rim and spokes; ellipse compensates for wide AGI pixels.
function gearOutline(cx,cy,root,outer,teeth,phase,squash){
 const points=[];
 for(let tooth=0;tooth<teeth;tooth++)for(const [part,r]of [[0,root],[.2,outer],[.65,outer],[.85,root]]){
  const angle=phase+(tooth+part)*Math.PI*2/teeth;points.push([Math.round(cx+Math.cos(angle)*r*squash),Math.round(cy+Math.sin(angle)*r)]);
 }return points;
}
function wheel({fill,stroke},phase=0){
 fill(gearOutline(59,71,26,29,16,phase,.76),6,0);
 const inner=[];for(let i=0;i<32;i++){const a=i*Math.PI/16;inner.push([Math.round(59+Math.cos(a)*18),Math.round(71+Math.sin(a)*24)])}fill(inner,0,0);
 for(let spoke=0;spoke<8;spoke++){
  const angle=phase+spoke*Math.PI/4;
  const q=(r,offset=0)=>[Math.round(59+Math.cos(angle+offset)*r*.76),Math.round(71+Math.sin(angle+offset)*r)];
  fill([q(4,-.09),q(25,-.035),q(25,.035),q(4,.09)],6,6);
  stroke([q(8),q(24)],14);
 }
 // Fixed bearing remains centered as the timber rotates behind it.
 fill([[55,66],[62,66],[64,72],[62,77],[56,77],[53,72]],6,0);
 fill([[57,69],[61,69],[61,74],[57,74]],7,8);
}
wheel.gear=function({fill,stroke},phase=0){
 fill(gearOutline(86,71,8,10,8,-phase*2,.65),6,0);
 for(let i=0;i<4;i++){const a=-phase*2+i*Math.PI/2;stroke([[86,71],[Math.round(86+Math.cos(a)*5),Math.round(71+Math.sin(a)*7)]],0)}
 fill([[85,70],[87,70],[87,72],[85,72]],7,8);
};
module.exports=wheel;
