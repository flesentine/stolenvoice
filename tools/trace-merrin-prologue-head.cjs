// Hand-traced closed shapes from assets/references/merrin-profile-approved-v3.png.
// Face, hair and collar follow the reference; the cap is a medieval felt adaptation.
// Source coordinates refer to that 1312x1199 reference, not a sampled bitmap.
// Half horizontal scaling preserves its proportions with AGI's wide display pixels.
module.exports=function traceMerrinHead(stage=0,cel=0){
 const commands=[];
 const point=([x,y])=>[Math.round(25+(x-330)*.0475),Math.round(18+(y-110)*.095)];
 const p=(name,points,color,outline=0)=>commands.push({type:'polygon',name,points:points.map(point),color,outline});
 const l=(name,points,color)=>commands.push({type:'line',name,points:points.map(point),color});
 // One continuous face/neck shape avoids a detached jaw or long neck column.
 p('Traced face and neck',[[709,300],[912,303],[923,348],[933,395],[929,415],[920,438],[924,458],[942,488],[968,520],[988,547],[995,564],[991,580],[979,588],[957,593],[937,592],[933,612],[936,636],[933,655],[923,669],[927,689],[923,706],[931,742],[926,765],[916,780],[898,788],[875,794],[826,794],[784,790],[765,805],[750,826],[743,850],[748,877],[757,906],[760,930],[750,939],[734,923],[711,900],[676,882],[633,865],[587,843],[545,819],[503,791],[474,771],[450,755],[461,715],[461,674],[509,647],[567,613],[615,535],[641,537],[656,495],[678,453],[695,411],[707,371]],12);
 p('Traced jaw shadow',[[611,697],[639,724],[678,746],[728,767],[777,785],[810,790],[772,814],[748,842],[713,818],[674,787],[640,751]],4,null);
 // Short, broad hair masses; no texture or independently invented curls.
 p('Traced gray hair',[[346,398],[409,360],[483,334],[573,316],[674,299],[709,302],[706,350],[696,382],[681,408],[698,388],[700,412],[689,440],[674,456],[656,496],[647,482],[638,536],[617,535],[599,501],[576,460],[548,436],[523,430],[497,437],[477,454],[461,482],[455,514],[461,555],[477,589],[500,619],[515,640],[500,668],[484,690],[463,705],[461,731],[440,718],[419,691],[407,663],[388,646],[370,619],[359,587],[349,563],[342,535],[338,505],[338,463]],7);
 p('Traced ear',[[518,435],[495,442],[478,460],[466,487],[463,517],[468,548],[482,577],[502,603],[525,625],[548,636],[570,632],[586,616],[593,599],[607,569],[616,535],[600,502],[580,469],[551,442]],12,null);
 l('Traced ear outer fold',[[495,499],[504,475],[522,462],[541,461],[559,473],[574,495],[581,517]],4);
 l('Traced ear inner fold',[[580,508],[560,510],[548,526],[549,548],[560,563],[576,568]],4);
 l('Traced hair part',[[451,365],[424,388],[401,416],[382,451]],8);
 p('Traced eyebrow',[[794,416],[810,391],[832,372],[850,362],[907,359],[905,373],[897,387],[853,393],[823,404]],7,null);
 p('Traced eye white',[[820,469],[837,446],[857,433],[879,429],[875,484],[846,480]],15,null);
 p('Traced eye pupil',[[870,437],[877,438],[880,453],[879,470],[874,481],[867,479],[864,466],[865,449]],0,null);
 l('Traced upper lid',[[820,469],[836,445],[856,433],[885,428]],0);
 l('Traced eye crease',[[769,484],[792,478]],4);
 l('Traced cheek crease',[[759,524],[779,504],[800,494]],4);
 l('Traced smile fold',[[823,581],[802,601],[788,628],[784,658]],4);
 l('Traced nostril',[[896,549],[891,562],[895,579],[904,587]],4);
 const blink=(stage<2&&cel===5)||(stage===4&&cel===1);
 if(blink){
  p('Traced blink fill',[[806,420],[898,420],[899,492],[806,492]],12,null);
  l('Traced closed eyelid',[[822,457],[851,470],[883,454]],4);
 }
 if(stage>=3)l('Traced worried brow',[[804,405],[841,409],[879,394]],4);
 const singing=stage<2||(stage===3&&cel<3)||(stage===4&&cel<3);
 if(singing&&cel%4!==3){
  const mouth=cel%3===2?[[860,637],[901,635],[924,650],[921,681],[899,699],[870,685],[854,661]]:[[831,639],[875,629],[927,639],[929,663+cel%2*13],[906,696],[856,685],[829,663]];
  p('Traced singing mouth',mouth,0,null);
  if(cel%3!==2)l('Traced upper teeth',[[869,641],[916,644]],15);
  l('Traced lower lip',[[870,709],[915,704]],4);
 }else l('Traced resting smile',[[828,639],[858,649],[895,654],[922,652],[934,647]],4);
 // New generated bonnet reference hand-traced as four closed EGA shapes.
 const cap=require('./trace-merrin-prologue-cap.cjs')();
 // Keep the ear in front of the bonnet's low rear lobe.
 const earNames=new Set(['Traced ear','Traced ear outer fold','Traced ear inner fold']);
 const ear=commands.filter(c=>earNames.has(c.name));
 for(let n=commands.length-1;n>=0;n--)if(earNames.has(commands[n].name))commands.splice(n,1);
 commands.push(...cap,...ear);
 // Trace the collar into the existing polishing pose; no arm changes.
 p('Traced left linen collar',[[441,738],[424,737],[405,757],[382,821],[578,1007],[666,924],[698,938],[721,939],[689,905],[638,878],[581,846],[528,810],[484,774],[455,750]],15);
 p('Traced right linen collar',[[755,825],[778,846],[807,893],[840,983],[769,932],[724,939],[745,907],[747,853]],15);
 return commands;
};
