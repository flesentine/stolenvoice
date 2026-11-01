// Optional character memories, separate from quest flags, inventory and points.
const merrinMemoryKinds=['snail','river','tree','dance','sing','bow'];
let merrinMemories={seen:[],mentioned:[]};
function rememberMerrin(kind){if(merrinMemoryKinds.includes(kind)&&!merrinMemories.seen.includes(kind))merrinMemories.seen.push(kind)}
function savedMerrinMemory(){return {seen:[...merrinMemories.seen],mentioned:[...merrinMemories.mentioned]}}
function readMerrinMemory(value){
 if(value===undefined)return {seen:[],mentioned:[]};
 if(!value||!['seen','mentioned'].every(key=>Array.isArray(value[key])&&value[key].length<=merrinMemoryKinds.length&&value[key].every(kind=>merrinMemoryKinds.includes(kind)))||value.mentioned.some(kind=>!value.seen.includes(kind)))throw Error('invalid Merrin memories');
 return {seen:[...new Set(value.seen)],mentioned:[...new Set(value.mentioned)]};
}
function merrinRecollection(){
 const kind=merrinMemoryKinds.find(key=>merrinMemories.seen.includes(key)&&!merrinMemories.mentioned.includes(key));
 if(!kind)return '';
 merrinMemories.mentioned.push(kind);
 return {
  snail:'When you mention the little snail trophy, Merrin holds up one proud finger, then makes a very slow racing gesture. First place, apparently.',
  river:'Merrin eyes your dripping hem. He points toward the river, then firmly shakes his head.',
  tree:'Merrin plucks an apple leaf from your hair, looks toward the orchard, and raises one eyebrow.',
  dance:'Merrin tries your courtly step again. His knee clicks. He looks accusingly at a flowerpot.',
  sing:'Merrin taps out the tune you sang earlier. He stops just before the note he cannot make.',
  bow:'Merrin adjusts his cap and returns your earlier bow. This time he keeps one hand firmly on his hat.'
 }[kind];
}
function merrinFinalMemory(){
 const kind=merrinMemoryKinds.find(key=>merrinMemories.seen.includes(key));
 return {
  snail:'"Sir Creep-a-lot won fairly. The other snails simply failed to enter."',
  river:'"Leave the watering to me, Highness. You have brought this garden back to life."',
  tree:'"Next time, ask the tree politely. The apples have delicate nerves."',
  dance:'"Another dance, Highness? Perhaps after my knees forget the last one."',
  sing:'"You kept the tune alive when I could not. Shall we try it together?"',
  bow:'"A fine bow, Highness. I have been practising keeping my cap on."'
 }[kind]||'';
}
function talkMerrin(){
 if(flags.voiceReturned&&flags.voiceArrivalSeen){finishGame();return}
 const text=flags.voiceReturned?'Merrin watches the golden voice with wide eyes. It is almost home.':
  flags.bellRung?'A very familiar complaint rises from your satchel. Merrin pats his chest, points at the jar, and nods so hard his hat slips.':
  flags.echoCaught?'Merrin listens to the thin repetition of his name. His face brightens, then falls. He shakes his head and touches his throat. An echo is not quite his voice.':
  flags.roseGiven?'Merrin touches the rose in his coat and smiles his thanks. He points toward the workshop, then makes a turning motion with his fingers. Finally he points anxiously toward the castle mirror.':
  '"Ding!" Merrin tries again. He grimaces, traces a rectangle in the air, and mouths his name with exaggerated care: M-e-r-r-i-n.';
 const memory=flags.voiceReturned?'':merrinRecollection();
 say(text+(memory?'\n\n'+memory:''));
}
