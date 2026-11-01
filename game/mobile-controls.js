// Touch destinations use ordinary movement: no teleport, pathfinding or puzzle bypass.
let touchDestination=null;
walkStops.add(()=>{touchDestination=null});
function touchWalkTick(){
 if(walkDirection!=='touch')return false;
 if(!touchDestination||!playing||popupOpen||menuOpen){stopWalking();return true}
 const target=touchDestination,dx=target.x-player.x,dy=target.y-player.y;
 if(Math.abs(dx)<.5&&Math.abs(dy)<.5){stopWalking();return true}
 const factor=Math.min(1,5/Math.max(Math.abs(dx),Math.abs(dy)*5/3));
 const before={x:player.x,y:player.y,room};
 movePlayer(dx*factor,dy*factor);
 // Sliding against a solid edge can leave a subpixel remainder on one axis.
 // Treat that as blocked instead of animating forever against the obstacle.
 if(room!==before.room||Math.hypot(player.x-before.x,player.y-before.y)<.1)stopWalking();
 return true;
}
function installMobileControls(){
 const mobile=window.matchMedia('(hover: none) and (pointer: coarse)');
 // Desktop retains its hidden parser and original arrow-key controls.
 if(!mobile.matches)return;
 const form=document.querySelector('#form'),shell=document.querySelector('.shell');
 const controls=document.createElement('nav');controls.className='mobile-controls';controls.setAttribute('aria-label','Touch game controls');
 const makeButton=(label,action,parent=controls)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{keyboard.hide();action();sync()});parent.append(button);return button};
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
 const tip=document.createElement('p');tip.className='mobile-tip';tip.textContent='Tap a destination to walk. Type commands below.';controls.append(tip);shell.append(controls);
 const keyboard=installMobileKeyboard(input,form,shell);
 const sync=()=>{const intro=!!document.querySelector('#intro'),label=intro||popupOpen?'Continue':'Stop';if(next.textContent!==label)next.textContent=label;if(skip.hidden===prologueActive)skip.hidden=!prologueActive;go.disabled=!playing||popupOpen||menuOpen;actions.forEach(b=>b.disabled=!playing||popupOpen||menuOpen)};
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
 // Hide the keyboard after submission; messages and minigames remain tappable.
 form.addEventListener('submit',()=>{input.blur();if(popupOpen)popupFocus=c});
 c.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='touch'||!mobile.matches||!playing||popupOpen||menuOpen||prologueActive||document.querySelector('.screen>.overlay[aria-modal="true"]'))return;
  const rect=c.getBoundingClientRect(),px=(event.clientX-rect.left)*320/rect.width,py=(event.clientY-rect.top)*200/rect.height;
  if(py>=176){stopWalking();input.focus();return}
  if(py<8)return;
  event.preventDefault();keyboard.hide();stopWalking();
  touchDestination={x:Math.max(4,Math.min(316,px)),y:(py-8)/.7};walkDirection='touch';walkTick();
  if(walkDirection)walkTimer=setInterval(walkTick,speedTiming().walk);
 });
}
