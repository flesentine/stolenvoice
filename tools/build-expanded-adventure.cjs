// Build the expanded standalone adventure from the preserved short edition.
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
require('./draw-prologue-closeup.cjs');
let html=read('stolen-voice-short.html');
// Static metadata is available to link-preview crawlers without running the game.
html=html.replace('<head>',()=>'<head>\n'+read('game/share-metadata.html'));
html=html.replace('</style>',()=>read('game/mobile-controls.css').replace('__MOBILE_KEYBOARD_BEZEL__','data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/ui/keyboard-case-v1.png')).toString('base64'))+'\n</style>');
html=html.replace('for(const left of [119,174])','for(const left of [118,174])');
const stableRosella=require('./build-rosella-stable-face.cjs')();
html=html.replace(/const rosellaWalkSprites=\{[^\n]+\};/,()=> 'const rosellaWalkSprites='+JSON.stringify(stableRosella)+';');
html=html.replace(/const rosellaSprites=\{[^\n]+\};/,()=> 'const rosellaSprites='+JSON.stringify(Object.fromEntries(Object.entries(stableRosella).map(([direction,cels])=>[direction,cels[1]])))+';');
require('./render-opening-jingle.cjs');
html=html.replace(/const openingJingleWave='[^']*';/,()=>"const openingJingleWave='"+fs.readFileSync(path.join(root,'assets/stolen-voice-opening-tandy.wav')).toString('base64')+"';");
// A user gesture starts the score while the title art stays on screen.
html=html.replace("document.querySelector('#start').onclick=()=>{\n playOpeningJingle();", "document.querySelector('#start').onclick=()=>{\n if(prologueActive){advancePrologue();return}\n if(!titleMusicStarted){titleMusicStarted=true;titleFrame=0;playOpeningJingle();paintOpening();return}\n startPrologue();return;\n playOpeningJingle();");
const story=read('game/expanded-story.js'),world=read('game/expanded-world.js'),parser=read('game/expanded-parser.js'),pictures=read('game/room-pictures.js');
// Rasterize only the authored hive/stump commands to derive exact coverage.
const AgiPicture=require('../editor/agi-picture.js');
const orchard=JSON.parse(read('assets/rooms/orchard-workshop-v1.json'));
const hiveCommands=orchard.commands.filter(c=>['Hive stump and roots','Straw hive'].includes(c.name));
if(!hiveCommands.length)throw Error('Orchard foreground commands missing');
const coverage=AgiPicture.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null},...hiveCommands]);
const hiveMask=[];
for(let y=0;y<168;y++)for(let x=0;x<160;){if(coverage[y*160+x]===3){x++;continue}const left=x;while(x<160&&coverage[y*160+x]!==3)x++;hiveMask.push([left,y,x-left])}
require('./draw-inventory-objects.cjs');
require('./draw-swimming-cels.cjs');
const prologueCandleUnder=AgiPicture.render(JSON.parse(read('assets/rooms/prologue-closeup-workshop-v1.json')).commands.filter(c=>!['Candle flame','Orange flame body','Yellow flame heart','Steady flame heart'].includes(c.name)));
const prologueCandlePatch=[];for(let y=25;y<=35;y++)for(let x=5;x<=8;x++)prologueCandlePatch.push(prologueCandleUnder[y*160+x]);
const objectPriorityData=require('./build-object-priorities.cjs')();
require('./build-book-animation.cjs')();
require('./build-bell-animation.cjs');
require('./build-thorn-animation.cjs');
const kickHive=AgiPicture.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null},...orchard.commands.filter(c=>c.name==='Straw hive')]);
const kickUnder=AgiPicture.render(orchard.commands.filter(c=>c.name!=='Straw hive'));
// Isolate the connected skep; legacy commands sharing its name also contain
// scattered distant pixels that must not rotate with the straw body.
const occupied=[],kickSeen=new Set(),kickPending=[113*160+103];
while(kickPending.length){const i=kickPending.pop();if(kickSeen.has(i)||kickHive[i]===3)continue;kickSeen.add(i);occupied.push(i);const x=i%160,y=Math.floor(i/160);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])if(x+dx>=0&&x+dx<160&&y+dy>=0&&y+dy<168)kickPending.push((y+dy)*160+x+dx)}
const kickLeft=Math.min(...occupied.map(i=>i%160)),kickTop=Math.min(...occupied.map(i=>Math.floor(i/160))),kickRight=Math.max(...occupied.map(i=>i%160)),kickBottom=Math.max(...occupied.map(i=>Math.floor(i/160)));
const hiveKickArtwork={left:kickLeft,top:kickTop,width:kickRight-kickLeft+1,height:kickBottom-kickTop+1,pixels:[],underlay:occupied.map(i=>[i%160,Math.floor(i/160),kickUnder[i]])};
for(let y=kickTop;y<=kickBottom;y++)for(let x=kickLeft;x<=kickRight;x++)hiveKickArtwork.pixels.push(kickHive[y*160+x]===3?16:kickHive[y*160+x]);
const priority='const merrinEndingPicture='+JSON.stringify(require('./draw-merrin-portrait.cjs')())+';\n'+'const workshopDoorPictures='+JSON.stringify(Array.from({length:9},(_,i)=>require('./build-workshop-door.cjs')(i)))+';\n'+read('game/workshop-door.js')+read('game/mill-sluice.js')+read('game/mill-sluice-music.js')+read('game/lost-harmony.js')+read('game/hive-minigame.js')+'const hiveKickArtwork='+JSON.stringify(hiveKickArtwork)+';\n'+'const hiveKickCels='+read('assets/rooms/hive-kick-cels.json')+';\n'+read('game/hive-disaster.js')+read('game/merrin-ending.js')+read('game/book-pictures.js')+read('game/gallery-book.js')+read('game/bell-pictures.js')+read('game/bell-pull.js')+read('game/pickup-animation.js')+read('game/thorn-pictures.js')+read('game/thorn-cutting.js')+read('game/story-effects.js')+'const objectPriorityData='+JSON.stringify(objectPriorityData)+';\nconst orchardHiveMask='+JSON.stringify(hiveMask)+';\n'+read('game/room-priority.js');
require('./build-wheel-animation.cjs');
require('./build-water-animation.cjs');
// Recover the real underpainting for each candle, without its static flame.
const galleryProject=JSON.parse(read('assets/rooms/gallery-workshop-v1.json'));
const candleUnderlay=AgiPicture.render(galleryProject.commands.filter(c=>c.name!=='Small flame'));
const candlePatches=galleryProject.commands.filter(c=>c.name==='Small flame').map(c=>{
 const bottom=c.points.reduce((a,b)=>b[1]>a[1]?b:a),left=bottom[0]-2,top=bottom[1]-5,width=5,height=6,pixels=[];
 for(let y=top;y<top+height;y++)for(let x=left;x<left+width;x++)pixels.push(candleUnderlay[y*160+x]);
 return{left,top,width,pixels,wick:bottom};
});
const candles='const galleryCandlePatches='+JSON.stringify(candlePatches)+';\n'+read('game/gallery-candlelight.js');
const storyHeader=story.slice(0,story.indexOf('function carriedItems'));
html=html.replace(/let room=0,inv=\[\],score=0,scored=\{\},flags=\{[^\n]+?\},player=/,storyHeader+"let room=0,inv=[],score=0,scored={},flags={...flagDefaults},player=");
const map=JSON.parse(read('assets/stolen-voice-map.json'));
html=html.replace(/const rooms=\[[^\n]+?\];/, 'const rooms='+JSON.stringify(map.rooms.map(room=>room.name))+';');
html=html.replace(/const walkFloors=\[[^\n]+?\],inventoryNames=\[[^\n]+?\];/,'const inventoryNames=["rose","silver bell","oil flask","twine","wooden plank","rusty shears","pruning shears","beeswax","glass jar","echo jar","sealed echo","voice jar"];');
let start=html.indexOf('function helpText(){'),end=html.indexOf('function renderItems(){',start);
html=html.slice(0,start)+pictures+read('game/wheel-pictures.js')+read('game/water-pictures.js')+read('game/river-water.js')+read('game/human-puzzles.js')+priority+read('game/swimming-pictures.js')+read('game/swimming.js')+read('game/mill-cabinet.js')+read('game/tandy-sound.js')+read('game/world-life.js')+world+story.slice(story.indexOf('function carriedItems'))+html.slice(end);
// Remove the short adventure's movement functions (the world module owns them).
start=html.indexOf('function changeRoom(nextRoom){');end=html.indexOf('function norm(',start);
if(start<0||end<0)throw Error('Short movement anchors missing');
html=html.slice(0,start)+html.slice(end);
start=html.indexOf('function norm(');end=html.indexOf('const history=[];',start);
html=html.slice(0,start)+read('game/inventory-pictures.js')+'\n'+read('game/inventory-window.js')+'\n'+read('game/expanded-scenery.js')+'\n'+read('game/take-responses.js')+'\n'+read('game/climb-commands.js')+'\n'+read('game/parser-feedback.js')+'\n'+read('game/scenery-reactions.js')+'\n'+read('game/merrin-memory.js')+'\n'+read('game/optional-secret.js')+'\n'+read('game/apple-prank.js')+'\n'+read('game/bee-sting.js')+'\n'+read('game/window-jump.js')+'\n'+'const barrelPrankCels='+JSON.stringify(require('./trace-barrel-prank.cjs')())+';\n'+read('game/barrel-prank.js')+'\n'+read('game/chair-rest.js')+'\n'+'const workshopRatCels='+JSON.stringify(require('./trace-workshop-rats.cjs')())+';\n'+read('game/rosella-dance.js')+'\n'+read('game/rosella-footing.js')+read('game/royal-raspberry.js')+read('game/playful-intents.js')+'\n'+read('game/parser-intents.js')+'\n'+parser+html.slice(end);
html=html.replace('if(room===0)garden();else gallery();','if(room===0)garden();else if(room===1)gallery();else drawExpandedRoom();queueRoomObjects();drawWorldLife();');
html=html.replace('scoreText=`SCORE ${score}/20`','scoreText=`SCORE ${score}/${MAX_SCORE}`');
html=html.replace("'Score: '+score+' of 20'","'Score: '+score+' of '+MAX_SCORE");
html=html.replace('SCORE 0/20','SCORE 0/100');
html=html.replace("if(['Enter',' '].includes(event.key)&&!event.repeat)location.reload();","if(['Enter',' '].includes(event.key)&&!event.repeat)advanceMerrinEnding();");
// Ambient scenery holds still while the page is hidden or unfocused.
html=html.replace('if(!popupOpen&&!menuOpen){animationFrame=', 'if(!popupOpen&&!menuOpen&&!document.hidden&&waterAnimationFocused){animationFrame=');
// The pool name has a longer independent cycle than six-frame scenery.
html=html.replace('animationFrame=(animationFrame+1)%6;draw()', 'animationFrame=(animationFrame+1)%6;echoMistFrame=(echoMistFrame+1)%24;riverWaterFrame=(riverWaterFrame+1)%12;tickWorldLife();draw()');
// Replace the garden's static cloth while preserving its fixed flagstaffs.
html=html.replace(/ const flag=\(cx,top\)=>\{[\s\S]*?\n };\n const slit=/,' const flag=drawCastlePennant;\n const slit=');
html=html.replace('function garden(){',()=>read('game/castle-pennants.js')+'\nfunction garden(){');
// The narrow right rear tower spans native columns 130..138. Its roof
// peak and fixed flagstaff share native column 134, centered on both faces.
if(!html.includes('roof(266,29,8,45)')||!html.includes('flag(266,20)'))throw Error('Rear turret centering anchors missing');
html=html.replace('roof(266,29,8,45)','roof(268,29,8,45)').replace('flag(266,20)','flag(268,20)');
// The moat continues around the castle and out of the right-hand picture edge.
// Extend its two banks together; keep the bell and walking lawn in place.
html=html.replace('[168,149],[301,144],[296,161]', '[168,149],[320,143],[320,160]');
html=html.replace('[166,151],[298,146],[294,158]', '[166,151],[320,145],[320,157]');
html=html.replace('[266,151,19]]', '[266,151,19],[303,150,11]]');
// Make the garden pickup legible without changing its position or reach.
const roseStart=html.indexOf('prop(201,()=>{\n ellipse(273,201');
const roseEnd=html.indexOf('prop(165,()=>{',roseStart);
if(roseStart<0||roseEnd<0)throw Error('Garden rose drawing anchors missing');
html=html.slice(0,roseStart)+'prop(201,drawGardenRose);\n'+html.slice(roseEnd);
html=html.replace('function garden(){',()=>read('game/garden-rose.js')+'\nfunction garden(){');
// The small handbell can be lifted from its peg and tilted by hand.
const handBellStart=html.indexOf('prop(165,()=>{'),handBellEnd=html.indexOf('});',handBellStart)+3;
if(handBellStart<0)throw Error('Garden bell drawing anchor missing');
html=html.slice(0,handBellStart)+'prop(188,drawGardenGateBack);prop(216,drawGardenBell);'+html.slice(handBellEnd);
// Visible side paths and the right-hand stairway match their exit zones.
html=html.replace(' // Merrin and the two garden puzzle objects remain in their original places.',
` poly([[267,190],[320,190],[320,211],[269,204]],'#aa5500');poly([[275,194],[320,194],[320,207],[275,201]],'#ffff55');
 // Merrin and the two garden puzzle objects remain in their original places.`);
html=html.replace('// High-backed chair: carved oak, upholstered panel, arms, and splayed legs.',
`// Right-hand staircase to the belfry, with a reachable trigger at its upper end.
poly([[286,160],[320,137],[320,215],[286,215]],'#000000');
for(let step=0;step<8;step++){const left=286+step*2,top=204-step*7;rect(left,top,34-step*2,5,'#aa5500');line(left,top,left+32-step*2,top,'#aaaaaa')}
// High-backed chair: carved oak, upholstered panel, arms, and splayed legs.`);
html=html.replace('Merrin opens his mouth to greet you. A tiny bell chimes instead of words! He points at his throat, then toward the enchanted mirror inside the castle.', 'Merrin opens his mouth to greet you. A tiny bell chimes instead of words! He touches his throat and points anxiously toward the castle.');
// Replace the short edition's gallery drawing with its traced successor.
start=html.indexOf('function gallery(){');end=html.indexOf('// Direct indexed conversion',start);
if(start<0||end<0)throw Error('Gallery drawing anchors missing');
html=html.slice(0,start)+candles+'\n'+read('game/gallery-room.js')+'\n'+html.slice(end);
// Apply the DOS/EGA message renderer only to the expanded adventure.
start=html.indexOf('function messageLines(text){');end=html.indexOf('function say(text){',start);
if(start<0||end<0)throw Error('Message-window anchors missing');
html=html.slice(0,start)+read('game/agi-message-window.js')+'\n'+read('game/agi-message-window-adapter.js')+'\n'+html.slice(end).replace('function say(text){','function showMessagePage(text){');
html=html.replace('popupOpen=true;msg.textContent=text;',"popupOpen=true;msg.textContent=Array.isArray(text)?text.join('\\n'):text;");
html=html.replace('if(!popupOpen)return;\n if(introSequence', 'if(!popupOpen)return;\n if(restoreFocus&&agiMessagePages.length){showMessagePage(agiMessagePages.shift());return}\n if(!restoreFocus)agiMessagePages=[];\n if(introSequence');
// Ground the ordinary standing/walking sprite with per-shoe contact shadows.
html=html.replace(" ellipse(px,py+1,7,1,'#000000');\n const facing=rosellaSprites", " const facing=rosellaSprites");
html=html.replace(' const rows=rosellaWalkSprites[facing][player.step%4];\n const left=pictureX(px)-4,top=pictureY(py)-39;', ' const rows=rosellaWalkSprites[facing][player.step%4];\n drawRosellaContactShadow(px,py,rows);\n const left=pictureX(px)-4,top=pictureY(py)-39;');
// Swimming shares existing keyboard controls, modal pause and the Sierra popup.
html=html.replace('function hero(px,py){','function hero(px,py){\n if(drawBridgeFallHero())return;\n if(swimState.active||swimState.dead){drawSwimming(px,py);return}\n if(drawBellPullHero(px,py))return;\n if(drawStoryHero(px,py))return;');
html=html.replace('if(!popupOpen)return;\n if(restoreFocus', 'if(hiveDisaster?.dead&&restoreFocus&&!agiMessagePages.length){retryHiveDisaster();return}\n if(swimState.dead){retryAfterDrowning();return}\n if(!popupOpen)return;\n if(restoreFocus');
html=html.replace(" if(!popupOpen||event.isComposing)return;", " if((swimState.dead||hiveDisaster?.dead)&&['F7','r','R'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat){if(event.key==='F7'){if(hiveDisaster?.dead)retryHiveDisaster();else retryAfterDrowning();restoreGame()}else location.reload()}return}\n if(!popupOpen||event.isComposing)return;");
html=html.replace(" const draft=input.value.slice(-38);", " if(swimState.active)blitText(screen,'Swim to shore! '+Math.ceil(swimState.remaining/1000),0,176,'#ffff55');\n const draft=input.value.slice(-38);");
// Story payoffs paint on the same native scene after normal object priorities.
html=html.replace(' presentEgaFrame();',' drawStoryEffects();\n presentEgaFrame();');
html=html.replace('prop(204,()=>gardener(60,204));','prop(204,()=>{if(!drawMerrinKissDance(60,204)){gardener(60,204);drawMerrinRecovery(60,204);drawMerrinRose()}});');
html=html.replace('function closeMessage(restoreFocus=true){','function closeMessage(restoreFocus=true){\n if(restoreFocus)advanceChairRestMessage();\n if(storyAction&&![\'voiceFollow\',\'chairRest\'].includes(storyAction.kind)&&restoreFocus)finishStoryEffect(false);');
html=html.replace(' if(!popupOpen||event.isComposing)return;'," if(bellAction?.stage==='jar'&&!event.isComposing&&['Enter',' ','Escape'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat){const message=bellAction.message;resetBellPull();draw();say(message)}return}\n if(storyAction&&!(['voiceFollow','chairRest'].includes(storyAction.kind)&&popupOpen)&&!event.isComposing&&['Enter',' ','Escape'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)finishStoryEffect();return}\n if(!popupOpen||event.isComposing)return;");
// The mechanical close-up owns modal input while its troughs are selected.
html=html.replace("textPopup.addEventListener('click',()=>closeMessage());", "textPopup.addEventListener('click',event=>{if(millSluiceOpen){event.preventDefault();event.stopPropagation();millSluiceClick(event);return}closeMessage()});");
html=html.replace('function closeMessage(restoreFocus=true){', 'function closeMessage(restoreFocus=true){\n if(millSluiceOpen&&restoreFocus){closeMillSluice();return}\n if(!restoreFocus){millSluiceOpen=false;if(millSluiceTimer)clearInterval(millSluiceTimer);millSluiceTimer=0;}');
html=html.replace(' if(!popupOpen||event.isComposing)return;', ' if(millSluiceOpen&&!event.isComposing){event.preventDefault();event.stopImmediatePropagation();millSluiceKey(event);return}\n if(!popupOpen||event.isComposing)return;');
// Lost Harmony owns the same native modal surface, including pointer input.
html=html.replace("event=>{if(millSluiceOpen)", "event=>{if(harmonyOpen){event.preventDefault();event.stopPropagation();harmonyClick(event);return}if(millSluiceOpen)");
html=html.replace('function closeMessage(restoreFocus=true){', 'function closeMessage(restoreFocus=true){\n if(harmonyOpen&&restoreFocus){closeHarmony();return}\n if(!restoreFocus)resetHarmony();');
html=html.replace(' if(!popupOpen||event.isComposing)return;', ' if(harmonyOpen&&!event.isComposing){event.preventDefault();event.stopImmediatePropagation();harmonyKey(event);return}\n if(!popupOpen||event.isComposing)return;');
// Inventory consumes modal navigation before the ordinary message dismiss keys.
// Once the witnessed reunion's last message is dismissed, Merrin sings.
html=html.replace(' popupFocus=null;\n}', ' popupFocus=null;\n if(restoreFocus&&playing&&room===0&&flags.voiceReturned&&flags.voiceArrivalSeen&&!flags.complete)finishGame();\n}');
html=html.replace('function closeMessage(restoreFocus=true){', 'function closeMessage(restoreFocus=true){\n if(inventoryOpen&&restoreFocus){closeInventoryView();return}\n if(!restoreFocus)inventoryOpen=false;');
html=html.replace(' if(!popupOpen||event.isComposing)return;', ' if(inventoryOpen&&!event.isComposing){event.preventDefault();event.stopImmediatePropagation();inventoryKey(event);return}\n if(!popupOpen||event.isComposing)return;');
html=html.replace("else if(introSequence||document.querySelector('#intro'))","else if(prologueActive)resumePrologueScore();\n else if(introSequence||document.querySelector('#intro'))");
html=html.replace("if(!soundEnabled)stopOpeningJingle();","if(!soundEnabled){stopOpeningJingle();stopGameSound()}");
const titleStart=html.indexOf("paintTextWindow('ROSELLA AND THE STOLEN VOICE");
const titleEnd=html.indexOf('\n',titleStart);
if(titleStart<0||titleEnd<0)throw Error('Short title anchors missing');
html=html.slice(0,titleStart)+read('game/opening-picture.js')+read('game/opening-screen.js')+read('game/prologue-score.js')+read('game/prologue-closeup-picture.js')+'const prologueCandlePatch='+JSON.stringify(prologueCandlePatch)+';\n'+read('game/opening-prologue.js')+'\nstartOpening();'+html.slice(titleEnd);
html=html.replace(" if(document.querySelector('#intro')){", " if(document.querySelector('#intro')){\n  if(prologueActive&&event.key==='F2'){event.preventDefault();soundEnabled=!soundEnabled;if(soundEnabled)resumePrologueScore();else stopGameSound();return}\n  if(prologueActive&&event.key==='Escape'){event.preventDefault();finishPrologue();return}");
// Classic Speed menu and parser aliases share one persisted preference.
html=html.replace('const menus=[',read('game/agi-speed.js')+'\nconst menus=[');
html=html.replace("{name:'Help',x:152", "{name:'Speed',x:144,items:speedMenuItems()},\n {name:'Help',x:208");
html=html.replace('setInterval(walkTick,110)', 'setInterval(walkTick,speedTiming().walk)');
html=html.replace('const moveSteps=',read('game/arrow-chords.js')+'\nconst moveSteps=');
html=html.replace('if(!event.repeat)toggleWalk(direction);c.focus();return', 'if(!handleWalkArrow(event)&&!event.repeat)toggleWalk(direction);c.focus();return');
html=html.replace('if(!animationTimer&&!reduceMotion)', 'if(!orchardBeeTimer&&!reduceMotion)orchardBeeTimer=setInterval(tickOrchardBees,90);if(!animationTimer&&!reduceMotion)');
html=html.replace('},360);', '},speedTiming().ambient);');
html=html.replace('TAB: inventory. ESC: menus.', 'TAB: inventory. ESC: menus/speed.');

// Hive close-up owns its modal input and is cleared on restore/restart.
html=html.replace('event=>{if(harmonyOpen)', 'event=>{if(hiveOpen){event.preventDefault();event.stopPropagation();reachHive();return}if(harmonyOpen)');
html=html.replace('function closeMessage(restoreFocus=true){', 'function closeMessage(restoreFocus=true){\n if(hiveOpen&&restoreFocus){closeHive();return}\n if(!restoreFocus)resetHive();');
html=html.replace(' if(harmonyOpen&&!event.isComposing)', ' if(hiveOpen&&!event.isComposing){event.preventDefault();event.stopImmediatePropagation();hiveKey(event);return}\n if(harmonyOpen&&!event.isComposing)');
html=html.replace('function walkTick(){','function walkTick(){\n if(touchWalkTick())return;');
html=html.replace('startOpening();',()=>read('game/browser-interactions.js')+'\n'+read('game/mobile-keyboard.js')+'\n'+read('game/mobile-controls.js')+'\ninstallMobileControls();\nstartOpening();');
require('./lib/write-standalone.cjs')(path.join(root,'stolen-voice.html'),html,[
 'command','saveGame','restoreGame','showHive','showMillSluice',
 'swimmingShoreRoute','startPrologue','finishGame'
]);

console.log('Built '+map.rooms.length+'-room adventure with courtyard and connected doorways.');
