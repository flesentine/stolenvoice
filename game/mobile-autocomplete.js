// Parser action vocabulary, ordered so common short prefixes have useful defaults.
const mobileActionWords=[
 'take','talk','look','load','use','open','close','climb','give','get','go',
 'put','pick','place','read','ring','repair','restore','save','say','seal',
 'tie','turn','touch','cut','curtsy','dance','jump','kiss','kick','fart','eat','enter',
 'examine','exit','inspect','inventory','help','hint','listen','leave',
 'oil','offer','hold','raise','lift','remove','unlock',
 'shut','sit','sing','swim','smell','taste','shake','show','speak','shout',
 'search','secure','fasten','fix','bind','lash','mend','attach','apply','catch',
 'capture','collect','trap','bottle','scoop','fill','stopper','cork','plug',
 'polish','flatter','bow','wait','walk','push','pull','press','drop','stop',
 'trim','prune','clip','lubricate','grease','set','lay','fit','add','reinforce',
 'tether','anchor','strap','stabilize','insert','slide','position','hand',
 'greet','ask','question','knock','tap','strike','sound','blow','bless',
 'wipe','clean','pour','hit','move','pluck','bite','try','sniff','rap','feel',
 'buff','compliment','praise','make','rattle','replace','lower','leap','hop',
 'dive','wade','bathe','hook','retrieve','grab','dip','dunk','immerse',
 'chime','play','flick','tilt','tip','invert','unhook','shift','drag','tug',
 'untie','release','answer','reply','solve','guess','ascend','descend','call',
 'l','x','i','inv','n','s','e','w','u','d','ne','nw','se','sw'
];
function mobileActionCompletion(value,caret=value.length,selectionEnd=caret){
 if(caret!==selectionEnd||caret!==value.length)return null;
 const match=value.match(/^(\s*)([a-z]+)$/i);if(!match)return null;
 const prefix=match[2].toLowerCase();
 if(mobileActionWords.includes(prefix))return null;
 const word=mobileActionWords.find(word=>word.startsWith(prefix));
 return word?{word,start:match[1].length,end:caret}:null;
}
