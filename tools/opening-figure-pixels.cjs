// Anatomy is authored as native pixel clusters, not interpolated polygons.
// Reference landmarks were measured on opening-grid-reference.png at 160x168.
module.exports=function figurePixels(){
 const commands=[];
 function stamp(name,left,top,rows){
  rows.forEach((row,y)=>{for(let x=0;x<row.length;){if(row[x]==='.'){x++;continue}const ink=row[x];if(!/^[0-9a-f]$/.test(ink))throw Error('Invalid ink: '+name);let end=x+1;while(end<row.length&&row[end]===ink)end++;if(left+x<0||left+end>160||top+y<0||top+y>=168)throw Error('Pixel outside grid: '+name);commands.push({type:'brush',name,size:1,color:parseInt(ink,16),points:end===x+1?[[left+x,top+y]]:[[left+x,top+y],[left+end-1,top+y]]});x=end}});
 }
 function spans(name,top,rows,color,outline=true){
  const mask=new Set();rows.forEach(([a,b],y)=>{for(let xx=a;xx<=b;xx++)mask.add(xx+','+(top+y))});
  const border=new Set();if(outline)for(const key of mask){const [xx,y]=key.split(',').map(Number);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(!mask.has((xx+dx)+','+(y+dy)))border.add((xx+dx)+','+(y+dy))}
  function emit(points,ink){const byRow=new Map();for(const key of points){const [xx,y]=key.split(',').map(Number);if(xx<0||xx>=160||y<0||y>=168)continue;if(!byRow.has(y))byRow.set(y,[]);byRow.get(y).push(xx)}for(const [y,xs]of byRow){xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;){let j=i+1;while(j<xs.length&&xs[j]===xs[j-1]+1)j++;commands.push({type:'brush',name,size:1,color:ink,points:j===i+1?[[xs[i],y]]:[[xs[i],y],[xs[j-1],y]]});i=j}}}
  emit(border,0);emit(mask,color);
 }
 // Throat-reaching pose measured at display aspect (each logical pixel is
 // twice as wide as it is tall). A taller palm avoids the old flat mitten.
 // Four stepped fingertip lobes descend along the right edge; the thumb
 // rises independently on the left and joins the heel below the knuckles.
 // The forearm rises diagonally from the lower-left sleeve into the heel
 // of the palm. Paint it first so the wrist sits inside the cuff opening.
 spans('Merrin resting forearm',149,[
  [17,21],[15,22],[14,22],[13,22],[12,21],[11,20],
  [10,19],[9,18],[8,17],[7,16],[6,15],[5,14],
  [4,13],[3,12],[2,11],[1,10],[0,9],[0,8],[0,7]
 ],7);
 stamp('Merrin wrist cuff',12,151,[
  '....ff7', '...ff77','..ff77.','.ff77..','ff77...'
 ]);
 spans('Merrin resting hand silhouette',118,[
  [30,31],[29,32],[28,32],[27,32],[26,31],[25,30],
  [24,33],[23,34],[22,34],[21,33],[21,32],[21,31],
  [20,33],[20,35],[20,35],[20,34],[20,33],[19,32],
  [19,33],[19,34],[18,34],[17,33],[16,32],[15,31],
  [15,31],[15,30],[15,29],[15,27],[15,25],[15,24],
  [15,23],[16,22],[17,21],[18,20]
 ],12,false);
 stamp('Merrin resting thumb',17,125,[
  '..cc..','..ccc.','..ccc.','..ccc.','..ccc.',
  '..ccc.','.cccc.','.ccccc','.ccccc','cccccc',
  'cccccc','cccccc','.ccccc'
 ]);
 stamp('Merrin resting finger separations',24,128,[
  '.....4...', '....4....','...4.....',
  '.........','.........','......4..','.....4...',
  '....4....','.........','.........','.........',
  '......4..','.....4...'
 ]);
 stamp('Merrin thumb web',20,133,[
  '4....','.4...','..4..','.....'
 ]);
 // Rosella's waist is at y122, not y131. The skirt occupies the lower half
 // of her figure, matching the generated reference's adult proportions.
 spans('Rosella pixel skirt',122,[
  [136,142],[136,143],[136,143],[135,144],[135,144],[135,145],
  [135,145],[135,145],[134,146],[134,146],[134,146],[134,147],
  [134,147],[134,148],[133,148],[133,148],[133,149],[133,149],
  [133,149],[133,150],[133,150],[133,150],[132,151],[132,151],
  [132,151],[132,152],[132,152],[132,153],[132,153],[132,154],
  [132,154],[132,155],[132,155],[132,156],[132,156],[132,157],
  [132,158],[132,158],[132,159],[133,159],[133,159],[133,159],
  [133,159],[134,159],[134,159],[134,159]
 ],1);
 // Thin brush folds follow the skirt's weight and flare. They never cross
 // into the bodice, so there is one clear waist and no detached torso.
 stamp('Rosella skirt near fold',134,125,[
  '..99','..99','..99','..99','..99','..99','..99','..99',
  '..99','..99','..99','..99','..999','..999','...99','...99',
  '...99','...99','...999','....99','....99','....999','.....99','.....99',
  '.....999','......99','......999','.......99','.......999','........99',
  '........999','.........99','.........999','..........99','..........999',
  '...........99','...........999','............99','............999',
  '.............99','.............999','..............99'
 ]);
 stamp('Rosella underskirt glimpse',131,137,[
  '..f','..f','..f','..f','.ff','.ff','.ff','.ff','.ff','.ff',
  '.ff','.ff','.ff','.ff','.ff','.ff','.ff','.ff','..f','..f',
  '..ff','..ff','..ff','..ff','...f','...ff','...ff','...ff',
  '....f','....ff','....ff'
 ]);
 // A joined palm and three-pixel forearm touch the frame;
 // the forearm has one elbow, ending inside the puffed linen sleeve.
 stamp('Rosella reaching hand',122,98,[
  '.ccc','ccccc','ccccc','.cccc','.cccc','..ccc','..cccc','...ccc',
  '...cccc','....ccc','.....ccc','......cc','.......cc'
 ]);
 stamp('Rosella shoulders and bodice',126,105,[
  '...00000......',
  '..0ff777000...',
  '.0fffffff110..',
  '.0fffffff1110.',
  '0fffffff71110.',
  '0ffffff771110.',
  '0ffffff711110.',
  '.0ffff7119110.',
  '.0fff71199110.',
  '..0f771199110.',
  '...0771199110.',
  '....0011991110',
  '.....011991110',
  '......01991110',
  '.......1191110',
  '........191110',
  '.........11110',
  '..........1110'
 ]);
 stamp('Rosella far cuff and hand',139,118,[
  '00.......','0ff0.....','0fff0....','0ffff0...',
  '.0fff0...','..0fff0..','...cccc..','...cccc..',
  '....ccc..','....cccc.','.....ccc.','.....ccc.',
  '......ccc','......ccc','.......cc'
 ]);
 stamp('Rosella profile and neck',131,94,[
  '..cccc..','.cccccc.','.cccccc.','ccccccc.','.cccccc.',
  '.c0cccc.','ccccccc.','.cccccc.','..ccccc.','...cccc.',
  '...ccc..','...ccc..','...ccc..','....cc..'
 ]);
 stamp('Rosella hair clusters',131,89,[
  '..6666..........',
  '.6eeeee6........',
  '6eeeeeee6.......',
  '6eefeeeee6......',
  '6efeeeeee6......',
  '.6eeeeeee6......',
  '...6eeeee6......',
  '....6eeee6......',
  '....6eeee6......',
  '....6eeee6......',
  '....6eeee6......',
  '....6eeee6......',
  '....6eeee6......',
  '.....6eee6......',
  '.....6eee6......',
  '.....6eee66.....',
  '.....6eeee6.....',
  '.....6eeee66....',
  '.....6eeeeee6...',
  '.....611eeee6...',
  '.....6111eee66..',
  '......11eeeee6..',
  '......6eeeeee6..',
  '......6eeeeee66.',
  '.......6ee6eee6.',
  '.......6eee6ee6.',
  '........6eeee6..',
  '.........6eee6..',
  '..........666...'
 ]);
 return commands;
};
