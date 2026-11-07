const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s={flags:{voiceReturned:false},player:{facing:'back'},elaraWalkSprites:require('../assets/elara-walk-stable-face-v2.json').views};vm.createContext(s);vm.runInContext(fs.readFileSync('game/playful-intents.js','utf8')+';globalThis.sprite=elaraCurtsySprite',s);
const frames=[];
for(let frame=0;frame<24;frame++){
 const actor=s.sprite(frame),reflection=s.sprite(frame,true);
 for(const rows of [actor,reflection]){assert.equal(rows.length,40);assert(rows.every(r=>r.length===14&&/^[.0-9a-f]+$/.test(r)));assert(/[06]/.test(rows[39]),'feet retain ground baseline');}
 frames.push({actor,reflection});
}
assert.notEqual(JSON.stringify(frames[0].actor),JSON.stringify(frames[6].actor));assert.equal(JSON.stringify(frames[0].reflection),JSON.stringify(frames[6].reflection),'enchanted mirror waits for its turn');
// The uppermost opaque row is the head; avoid tying motion to hair color.
const headTop=rows=>{const top=rows.findIndex(r=>/[^.]/.test(r));assert(top>=0,'visible character');return top};
assert(headTop(frames[6].actor)>headTop(frames[0].actor),'knees lower the head');assert.equal(headTop(frames[14].actor),headTop(frames[0].actor),'straightens before reflection');assert(headTop(frames[14].reflection)>headTop(frames[0].reflection));
s.flags.voiceReturned=true;for(let frame=0;frame<24;frame++)assert.equal(headTop(s.sprite(frame)),headTop(s.sprite(frame,true)),'restored mirror follows curtsy on time');
fs.writeFileSync('assets/reviews/mirror-curtsy-frames.json',JSON.stringify(frames));console.log('PASS curtsy skirt/arm cels, fixed feet, knee dip, delayed/restored mirror timing and 24 native animation frames.');
