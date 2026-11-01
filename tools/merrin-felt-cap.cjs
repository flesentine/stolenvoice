// Shared medieval felt bonnet, authored on the portrait's native grid.
module.exports=function(){
 const commands=[];
 const p=(name,points,color,outline=null)=>commands.push({type:'polygon',name,points,color,outline});
 const l=(name,points,color)=>commands.push({type:'line',name,points,color});
 // One continuous felt-cap contour: no independently resized brim or crown.
 p('Brown cap',[[43,83],[41,79],[40,69],[40,54],[42,43],[46,33],[52,24],[59,17],[66,12],[73,7],[79,4],[83,6],[85,12],[86,19],[86,25],[84,25],[83,21],[80,20],[76,22],[71,27],[66,33],[62,40],[59,48],[56,58],[55,68],[56,74],[53,79],[48,83]],6,0);
 p('Cap folded underside',[[42,71],[44,58],[49,43],[56,32],[62,25],[66,19],[65,26],[60,33],[56,42],[52,53],[50,65],[51,75],[47,80],[43,81]],4);
 l('Cap fold',[[46,54],[50,43],[56,33],[62,27]],4);
 l('Cap crown crease',[[72,17],[78,11],[81,12],[83,17]],4);
 l('Cap rim glint',[[57,54],[60,46],[66,37],[72,31],[79,25],[82,25]],14);
 return commands;
};
