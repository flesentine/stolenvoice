// Retain Sierra tap-to-walk controls; a held arrow pair adds diagonal steering.
let heldWalkArrows=new Set(),walkArrowChord=false;
const walkArrowNames={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
function heldArrowDirection(){
 const dx=Number(heldWalkArrows.has('ArrowRight'))-Number(heldWalkArrows.has('ArrowLeft'));
 const dy=Number(heldWalkArrows.has('ArrowDown'))-Number(heldWalkArrows.has('ArrowUp'));
 return dx&&dy?(dy<0?'n':'s')+(dx<0?'w':'e'):dx?(dx<0?'left':'right'):dy?(dy<0?'up':'down'):null;
}
function handleWalkArrow(event){
 if(!walkArrowNames[event.key])return false;
 if(event.repeat||heldWalkArrows.has(event.key))return true;
 heldWalkArrows.add(event.key);const keys=new Set(heldWalkArrows),chord=keys.size>1,direction=heldArrowDirection();
 if(!direction)stopWalking();else if(!chord||walkDirection!==direction)toggleWalk(direction);
 heldWalkArrows=keys;walkArrowChord=chord;return true;
}
walkStops.add(()=>{heldWalkArrows.clear();walkArrowChord=false});
document.addEventListener('keyup',event=>{
 if(!heldWalkArrows.has(event.key))return;
 heldWalkArrows.delete(event.key);if(!walkArrowChord)return;
 const keys=new Set(heldWalkArrows),direction=heldArrowDirection();
 if(!direction||!playing||popupOpen||menuOpen){stopWalking();return}
 if(walkDirection!==direction)toggleWalk(direction);
 heldWalkArrows=keys;walkArrowChord=true;
});
