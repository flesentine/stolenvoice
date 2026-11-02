// Local word-prefix hints adjust touch boundaries only; keycaps never move.
function mobileKeyboardVocabulary(actions,objects,scenery){
 const phrases=[...actions,...Object.values(objects).flat(),...Object.values(scenery).flat(),
  'moon','merrin','rosella','the','a','an','at','to','with','using','on','in','into','from','over','under','through','out','of','my','your'];
 return [...new Set(phrases.flatMap(text=>text.toLowerCase().match(/[a-z]+/g)||[]))];
}
function mobileNextLetters(value,words,caret=value.length,selectionEnd=caret,actions=[]){
 if(caret!==selectionEnd||caret!==value.length)return{};
 const prefix=value.toLowerCase().match(/[a-z]+$/)?.[0];if(!prefix)return{};
 const counts={};
 const candidates=actions.length&&/^\s*[a-z]+$/i.test(value)?actions:words;
 for(const word of candidates)if(word.length>prefix.length&&word.startsWith(prefix)){
  const letter=word[prefix.length];counts[letter]=(counts[letter]||0)+1;
 }
 const maximum=Math.max(1,...Object.values(counts));
 return Object.fromEntries(Object.entries(counts).map(([letter,count])=>[letter,count/maximum]));
}
function mobileLetterAtPoint(x,y,keys,likely){
 const inside=key=>x>=key.left&&x<=key.right&&y>=key.top&&y<=key.bottom;
 const native=keys.find(inside);
 // Keep controls literal and protect deliberate key centers. Unlikely letters
 // lend a wider edge to valid command/noun continuations, never their center.
 if(native){
  const inset=native.letter&&!likely[native.letter]?0.3:0.2;
  const insetX=(native.right-native.left)*inset,insetY=(native.bottom-native.top)*inset;
  if(!native.letter||x>=native.left+insetX&&x<=native.right-insetX&&y>=native.top+insetY&&y<=native.bottom-insetY)return native.id;
 }
 let winner=native?.id??null,best=Infinity;
 for(const key of keys){
  if(!key.letter)continue;
  const width=key.right-key.left,height=key.bottom-key.top,weight=likely[key.letter]||0;
  const extra=weight?Math.min(14,Math.min(width,height)*.44)*(.6+.4*weight):0;
  if(x<key.left-extra||x>key.right+extra||y<key.top-extra||y>key.bottom+extra)continue;
  if(!inside(key)&&!weight)continue;
  const score=((x-(key.left+key.right)/2)/(width/2+extra))**2+((y-(key.top+key.bottom)/2)/(height/2+extra))**2;
  const ranked=score*(weight?(.65+.35*(1-weight)):2.5);
  if(ranked<best){best=ranked;winner=key.id;}
 }
 return winner;
}
