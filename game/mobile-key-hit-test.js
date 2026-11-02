// Local word-prefix hints adjust touch boundaries only; keycaps never move.
function mobileKeyboardVocabulary(actions,objects,scenery){
 const phrases=[...actions,...Object.values(objects).flat(),...Object.values(scenery).flat(),
  'moon','merrin','rosella','the','a','an','at','to','with','using','on','in','into','from','over','under','through','out','of','my','your'];
 return [...new Set(phrases.flatMap(text=>text.toLowerCase().match(/[a-z]+/g)||[]))];
}
function mobileNextLetters(value,words,caret=value.length,selectionEnd=caret){
 if(caret!==selectionEnd||caret!==value.length)return{};
 const prefix=value.toLowerCase().match(/[a-z]+$/)?.[0];if(!prefix)return{};
 const counts={};
 for(const word of words)if(word.length>prefix.length&&word.startsWith(prefix)){
  const letter=word[prefix.length];counts[letter]=(counts[letter]||0)+1;
 }
 const maximum=Math.max(1,...Object.values(counts));
 return Object.fromEntries(Object.entries(counts).map(([letter,count])=>[letter,count/maximum]));
}
function mobileLetterAtPoint(x,y,keys,likely){
 const inside=key=>x>=key.left&&x<=key.right&&y>=key.top&&y<=key.bottom;
 const native=keys.find(inside);
 // Controls and the central 60% of every letter always keep their real key.
 if(native){
  const insetX=(native.right-native.left)*.2,insetY=(native.bottom-native.top)*.2;
  if(!native.letter||x>=native.left+insetX&&x<=native.right-insetX&&y>=native.top+insetY&&y<=native.bottom-insetY)return native.id;
 }
 let winner=native?.id??null,best=Infinity;
 for(const key of keys){
  if(!key.letter)continue;
  const width=key.right-key.left,height=key.bottom-key.top,weight=likely[key.letter]||0;
  const extra=weight?Math.min(7,Math.min(width,height)*.18)*(.45+.55*weight):0;
  if(x<key.left-extra||x>key.right+extra||y<key.top-extra||y>key.bottom+extra)continue;
  if(!inside(key)&&!weight)continue;
  const score=((x-(key.left+key.right)/2)/(width/2+extra))**2+((y-(key.top+key.bottom)/2)/(height/2+extra))**2;
  if(score<best){best=score;winner=key.id;}
 }
 return winner;
}
