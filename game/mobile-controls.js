// Touch destinations use ordinary movement: no teleport, pathfinding or puzzle bypass.
let touchDestination=null,touchPointerId=null,touchMoving=false;
walkStops.add(()=>{touchDestination=null;if(!touchMoving)touchPointerId=null});
function pauseTouchStride(){
 // Reaching a finger or a solid edge pauses walking without ending the hold.
 touchMoving=true;try{stopWalking()}finally{touchMoving=false}
}
function touchWalkTick(){
 if(walkDirection!=='touch')return false;
 if(!touchDestination||!playing||popupOpen||menuOpen){stopWalking();return true}
 const target=touchDestination,dx=target.x-player.x,dy=target.y-player.y;
 if(Math.abs(dx)<.5&&Math.abs(dy)<.5){pauseTouchStride();return true}
 const factor=Math.min(1,5/Math.max(Math.abs(dx),Math.abs(dy)*5/3));
 const before={x:player.x,y:player.y,room};
 touchMoving=true;try{movePlayer(dx*factor,dy*factor)}finally{touchMoving=false}
 // Sliding against a solid edge can leave a subpixel remainder on one axis.
 // Treat that as blocked instead of animating forever against the obstacle.
 if(room!==before.room||popupOpen||menuOpen||!playing||bridgeFall)stopWalking();
 else if(Math.hypot(player.x-before.x,player.y-before.y)<.1)pauseTouchStride();
 return true;
}
function installMobileControls(){
 const mobile=window.matchMedia('(hover: none) and (pointer: coarse)');
 // Desktop retains its hidden parser and original arrow-key controls.
 if(!mobile.matches)return;
 const form=document.querySelector('#form'),shell=document.querySelector('.shell');
 const controls=document.createElement('nav');controls.className='mobile-controls';controls.setAttribute('aria-label','Touch game controls');
 const makeButton=(label,action,parent=controls)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('pointerdown',event=>event.preventDefault());button.addEventListener('click',()=>{keyboard.release();action();sync()});parent.append(button);return button};
 input.placeholder='Type a command…';input.setAttribute('enterkeyhint','send');input.setAttribute('autocorrect','off');
 const go=makeButton('Go',()=>form.requestSubmit(),form);
 const next=makeButton('Continue',()=>{
  input.blur();
  if(prologueActive){advancePrologue();return}
  const start=document.querySelector('#start');if(start){start.click();return}
  const ending=document.querySelector('.screen>.overlay[aria-modal="true"]');if(ending){advanceMerrinEnding();return}
  if(popupOpen){if(hiveOpen)reachHive();else closeMessage();return}
  stopWalking();
 });
 const skip=makeButton('Skip intro',()=>{if(prologueActive)finishPrologue()});
 const actions=[['Items',()=>command('inventory')],['Help',()=>command('help')],['Save',()=>saveGame()],['Restore',()=>restoreGame()]].map(([label,fn])=>makeButton(label,()=>{input.blur();if(playing&&!popupOpen&&!menuOpen){stopWalking();fn()}}));
 makeButton('Sound',()=>{soundEnabled=!soundEnabled;if(!soundEnabled){stopOpeningJingle();stopGameSound()}else if(prologueActive)resumePrologueScore();draw()});
 const tip=document.createElement('p');tip.className='mobile-tip';tip.textContent='Hold and drag on the scene to guide Rosella. Lift to stop.';controls.append(tip);shell.append(controls);
 const keyboard=installMobileKeyboard(input,form,shell,()=>playing&&!popupOpen&&!menuOpen&&!document.querySelector('#intro')&&!document.querySelector('.screen>.overlay[aria-modal="true"]'),()=>sync());
 const sync=()=>{const intro=!!document.querySelector('#intro'),label=intro||popupOpen?'Continue':'Stop';if(next.textContent!==label)next.textContent=label;if(skip.hidden===prologueActive)skip.hidden=!prologueActive;go.disabled=!playing||popupOpen||menuOpen;actions.forEach(b=>b.disabled=!playing||popupOpen||menuOpen);keyboard.refresh()};
 new MutationObserver(sync).observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','inert']});sync();
 const resize=()=>{
  const viewport=window.visualViewport,style=document.documentElement.style;
  style.setProperty('--mobile-height',(viewport?.height||window.innerHeight)+'px');
  style.setProperty('--mobile-width',(viewport?.width||window.innerWidth)+'px');
  style.setProperty('--mobile-top',(viewport?.offsetTop||0)+'px');
  style.setProperty('--mobile-left',(viewport?.offsetLeft||0)+'px');
 };
 // Keyboard focus can pan Safari without resizing the layout viewport.
 window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);
 window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);input.addEventListener('focus',()=>{stopWalking();resize()});resize();
 // Submission leaves the keyboard in its permanent slot.
 form.addEventListener('submit',()=>{input.blur();if(popupOpen)popupFocus=c});
 const canGuide=()=>mobile.matches&&playing&&!popupOpen&&!menuOpen&&!prologueActive&&!document.querySelector('.screen>.overlay[aria-modal="true"]');
 const guideTo=event=>{
  const rect=c.getBoundingClientRect(),px=(event.clientX-rect.left)*320/rect.width,py=(event.clientY-rect.top)*200/rect.height;
  touchDestination={x:Math.max(4,Math.min(316,px)),y:(Math.max(8,Math.min(175.9,py))-8)/.7};
  if(walkDirection!=='touch'){
   walkDirection='touch';walkTick();
   if(walkDirection)walkTimer=setInterval(walkTick,speedTiming().walk);
  }
 };
 c.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='touch'||event.isPrimary===false||!canGuide())return;
  const rect=c.getBoundingClientRect(),py=(event.clientY-rect.top)*200/rect.height;
  if(py>=176){stopWalking();input.focus();return}
  if(py<8)return;
  event.preventDefault();keyboard.release();stopWalking();
  touchPointerId=event.pointerId;c.setPointerCapture(event.pointerId);guideTo(event);
 });
 c.addEventListener('pointermove',event=>{
  if(event.pointerId!==touchPointerId)return;
  event.preventDefault();if(!canGuide()){stopWalking();return}guideTo(event);
 });
 const releaseGuide=event=>{
  if(event.pointerId!==touchPointerId)return;
  stopWalking();if(c.hasPointerCapture(event.pointerId))c.releasePointerCapture(event.pointerId);
 };
 for(const type of ['pointerup','pointercancel','lostpointercapture'])c.addEventListener(type,releaseGuide);
}
