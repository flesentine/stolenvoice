// Four classic AGI choices. PSG music and timed story sequences keep their beat.
const agiSpeeds={slow:{label:'Slow',walk:220,ambient:720},normal:{label:'Normal',walk:110,ambient:360},fast:{label:'Fast',walk:55,ambient:180},fastest:{label:'Fastest',walk:30,ambient:98}};
const AGI_SPEED_KEY='stolen-voice-agi-speed';
let gameSpeed='normal';
try{const savedSpeed=localStorage.getItem(AGI_SPEED_KEY);if(Object.hasOwn(agiSpeeds,savedSpeed))gameSpeed=savedSpeed}catch{}
function speedTiming(){return agiSpeeds[gameSpeed]}
function speedMenuItems(){return Object.entries(agiSpeeds).map(([key,value])=>[(key===gameSpeed?'* ':'  ')+value.label,()=>setGameSpeed(key)])}
function setGameSpeed(speed){
 if(!Object.hasOwn(agiSpeeds,speed))return;
 gameSpeed=speed;try{localStorage.setItem(AGI_SPEED_KEY,speed)}catch{}
 const menu=menus.find(menu=>menu.name==='Speed');if(menu)menu.items=speedMenuItems();
 if(walkTimer){clearInterval(walkTimer);walkTimer=0;if(walkDirection)walkTimer=setInterval(walkTick,speedTiming().walk)}
 if(animationTimer){clearInterval(animationTimer);animationTimer=0;if(playing)startBackgroundAnimation()}
 if(menuOpen)paintMenu();else draw();
}
function speedCommand(text){
 const match=text.match(/^(?:(?:set )?speed )?(slow|normal|fast|fastest)$/);
 if(!match)return false;
 setGameSpeed(match[1]);say('Speed: '+speedTiming().label+'.');return true;
}
