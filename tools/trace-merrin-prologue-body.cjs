// Manual closed-shape trace of merrin-polishing-body-medieval-v3.png (1536x1024).
// Fit anchors: the accepted neck, broad rear shoulder, and mirror contact point.
module.exports=function traceMerrinBody(stage=0,cel=0,part='all'){
 const base=[],front=[];let target=base;
 const wipe=stage<2?[0,-1,-2,-2,-1,0,1,0][cel]:0;
 const point=([x,y],move=false)=>[
  Math.round(40+(x-550)*(x<550?.095:.061)),
  Math.round(91+y*.074+(move?wipe*Math.max(0,Math.min(1,(x-600)/400)):0))
 ];
 const p=(name,points,color,move=false)=>target.push({type:'polygon',name,points:points.map(v=>point(v,move)),color,outline:0});
 const l=(name,points,color=0,move=false)=>target.push({type:'line',name,points:points.map(v=>point(v,move)),color});
 const native=(name,points,color,outline=0)=>target.push({type:'polygon',name,points,color,outline});
 // The upper back joins the profile's existing sloping neck, not a second neck.
 const tunic=[[445,0],[652,65],[689,74],[758,110],[798,150],[838,230],[877,329],[829,353],[822,478],[875,596],[867,616],[859,624],[860,650],[908,1024],[219,1024],[251,871],[283,740],[312,669],[315,629],[280,614],[277,594],[294,490],[289,450],[263,440],[247,422],[254,325],[234,244],[236,182],[251,139],[270,111]].map(v=>point(v));tunic[0]=[31,80];
 native('Traced work tunic',tunic,1);
 l('Traced tunic shoulder fold',[[425,175],[473,220],[516,250]]);
 l('Traced tunic side fold',[[312,589],[347,617]]);
 p('Traced waist apron',[[315,621],[389,615],[433,638],[624,650],[859,622],[870,655],[910,1024],[389,1024],[390,675],[316,659]],6);
 p('Traced apron waist tape',[[315,621],[384,614],[440,630],[655,640],[859,620],[860,659],[674,678],[444,663],[315,662]],6);
 p('Traced left apron tie',[[354,658],[392,683],[357,944],[304,902]],6);
 p('Traced right apron tie',[[409,676],[432,721],[458,905],[398,893]],6);
 p('Traced cloth waist knot',[[393,611],[434,651],[395,689],[351,655]],6);
 l('Traced apron fold',[[439,693],[475,1024]],4);
 target=front;
 // Adapt only the neckline to the accepted head's base; no pointed dress collar.
 native('Plain linen neck binding',[[31,80],[34,84],[39,90],[44,94],[47,94],[47,97],[45,100],[44,106],[41,100],[37,95],[33,91],[29,87]],7);
 if(stage<3){
  p('Traced bent linen sleeve',[[325,385],[382,353],[453,321],[505,301],[544,300],[569,326],[592,355],[606,369],[635,370],[650,390],[697,395],[761,379],[842,353],[923,323],[959,318],[993,306],[1011,327],[1039,344],[1049,380],[1047,408],[1011,433],[996,470],[975,492],[936,524],[872,559],[798,589],[710,616],[642,626],[595,625],[552,611],[506,586],[459,558],[421,528],[383,486],[352,444]],7,true);
  p('Traced elbow shadow',[[659,405],[612,471],[584,515],[605,563],[630,505]],8,true);
  p('Traced forearm lower fold',[[642,626],[710,616],[798,589],[872,559],[936,524],[976,492],[987,456],[910,489],[827,538],[742,584]],8,true);
  l('Traced elbow fold',[[536,473],[619,392]],8,true);
  l('Traced inner elbow fold',[[620,519],[659,410]],8,true);
  // Cloth is behind the fingers. Both follow the same wrist motion.
  p('Traced polishing cloth',[[1122,86],[1160,108],[1204,87],[1231,88],[1256,116],[1260,144],[1267,165],[1276,199],[1280,274],[1292,352],[1307,462],[1260,509],[1257,543],[1236,570],[1208,543],[1172,510],[1141,488],[1140,441],[1119,405],[1135,355],[1151,292],[1167,225],[1148,161]],15,true);
  l('Traced cloth long fold',[[1224,118],[1217,238],[1211,363],[1258,452],[1305,462]],7,true);
  l('Traced cloth lower fold',[[1211,363],[1213,493],[1256,543]],7,true);
  p('Traced polishing hand',[[1005,303],[1032,277],[1053,231],[1081,167],[1120,138],[1154,115],[1188,111],[1213,118],[1231,134],[1238,160],[1235,184],[1230,209],[1220,240],[1200,260],[1185,280],[1162,305],[1135,330],[1106,348],[1075,361],[1052,381]],12,true);
  l('Traced index separation',[[1123,167],[1208,123]],4,true);
  l('Traced middle separation',[[1148,188],[1227,158]],4,true);
  l('Traced lower finger separation',[[1169,229],[1233,187]],4,true);
 }else{
  // Manual trace of merrin-hand-over-chest-v1.png; same source-space fit.
  // The low elbow and continuous cuff/wrist keep the palm below the neckline.
  p('Chest gesture linen sleeve',[[281,378],[332,348],[397,321],[459,312],[494,315],[512,372],[592,326],[625,298],[650,299],[678,314],[696,339],[708,358],[704,383],[683,411],[670,471],[644,509],[602,545],[555,580],[505,608],[474,619],[451,616],[425,603],[392,575],[362,541],[334,502],[309,460]],7);
  p('Chest gesture lower sleeve shade',[[474,619],[505,608],[555,580],[602,545],[644,509],[670,471],[622,449],[584,508],[533,563]],8);
  l('Chest gesture elbow fold',[[425,487],[492,380]],8);
  l('Chest gesture forearm fold',[[480,487],[501,406]],8);
  native('Chest gesture plain cuff',[[43,114],[45,113],[49,116],[50,118],[48,121],[47,119],[44,117],[42,116]],7);
  // Author at native resolution: four staggered fingertip lobes and a low thumb.
  // Avoid source-coordinate rounding merging the tips and creases together.
  native('Hand resting over chest',[[44,112],[44,108],[45,105],[46,103],[48,100],[49,100],[50,101],[49,104],[52,100],[54,97],[55,96],[56,97],[56,99],[57,98],[58,99],[58,101],[59,101],[60,102],[60,104],[60,105],[61,106],[60,108],[58,111],[56,113],[53,115],[50,116],[48,118],[44,114]],12);
  target.push({type:'line',name:'Chest thumb separation',points:[[47,108],[49,105]],color:4});
  target.push({type:'line',name:'Chest upper finger separation',points:[[51,106],[56,100]],color:4});
  target.push({type:'line',name:'Chest middle finger separation',points:[[53,109],[58,103]],color:4});
  target.push({type:'line',name:'Chest lower finger separation',points:[[56,110],[59,107]],color:4});
 }
 return part==='base'?base:part==='front'?front:[...base,...front];
};
