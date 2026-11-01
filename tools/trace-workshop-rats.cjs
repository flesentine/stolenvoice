// Hand trace of workshop-rat-dance-imagegen-v2.png, not raster reduction.
// 11 native rows: pointed profile, round ears, contiguous haunch and fine tail.
module.exports=function(){
 const front=[
  '....7...7....',
  '...7c7.7c7...',
  '....77777....',
  '....70707....',
  '.....7c7.....',
  '...c77777c...',
  '.....777.....',
  '....77877....',
  '....77877....',
  '.....787.....',
  '.....c.c.....'
 ];
 const left=[
  '......7......',
  '.....7c7.....',
  '....7077.....',
  '...c7777.....',
  '......77.....',
  '...c7777.....',
  '....7777.....',
  '....77787....',
  '...777787....',
  '....7777.....',
  '....c..c.....'
 ];
 const edit=(rows,dots)=>{const a=rows.map(r=>[...r]);for(const[x,y,ink]of dots)a[y][x]=ink;return a.map(r=>r.join(''))};
 const tail=[[9,8,'7'],[10,7,'7'],[11,7,'7'],[12,6,'7']];
 const frontTail=[[9,8,'7'],[10,9,'7'],[11,9,'7'],[12,8,'7']];
 const back=front.map(row=>row.replace(/[0c]/g,'7'));
 const leftStep=edit(left,[...tail,[7,10,'.'],[8,9,'c']]);
 const leftSpin=edit(left,[...tail,[4,10,'.'],[3,9,'c'],[3,5,'7'],[3,4,'c']]);
 const frontRaised=edit(front,[...frontTail,[3,5,'7'],[9,5,'7'],[3,4,'7'],[9,4,'7'],[2,3,'c'],[10,3,'c']]);
 const backSpin=edit(back,[...tail,[7,10,'.'],[8,9,'c'],[5,10,'c']]);
 const settled=edit(front,[...frontTail,[3,5,'.'],[9,5,'.'],[5,6,'c'],[7,6,'c']]);
 return{front:edit(front,frontTail),left:leftStep,back:edit(back,tail),right:leftStep.map(row=>[...row].reverse().join('')),frontRaised,leftSpin,backSpin,settled};
};
