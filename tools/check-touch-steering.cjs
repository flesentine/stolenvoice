// NODE_PATH=<Playwright dependencies> node tools/check-touch-steering.cjs
const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync('stolen-voice.html','utf8').replace(/\}\)\(\);\s*<\/script>/,'globalThis.steerQA={get player(){return {...player}},get room(){return room},get held(){return touchPointerId},get destination(){return touchDestination},place(r,x,y){stopWalking();room=r;player={x,y,step:1,facing:"front"};draw()},message(){say("Steering interruption")}};})();</script>');
 await page.route('**/stolen-voice.html',route=>route.fulfill({body:html,contentType:'text/html'}));await page.goto('http://127.0.0.1:8766/stolen-voice.html');
 for(let i=0;i<2;i++)await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Skip intro',exact:true}).click();
 for(let i=0;i<4;i++)if(await page.locator('#agi-message').isVisible())await page.getByRole('button',{name:'Continue',exact:true}).click();
 const cdp=await page.context().newCDPSession(page);let point;
 const finger=async(type,x,y)=>{
  if(x!==undefined){const b=await page.locator('#game').boundingBox();point={x:b.x+x/320*b.width,y:b.y+(8+y*.7)/200*b.height,id:1}}
  await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[point]});
 };
 const actor=()=>page.evaluate(()=>steerQA.player);
 await page.evaluate(()=>steerQA.place(2,160,220));await finger('touchStart',245,220);await page.waitForTimeout(380);assert((await actor()).x>165,'holding walks without more touch events');
 const right=await actor();await finger('touchMove',100,220);await page.waitForTimeout(380);assert((await actor()).x<right.x,'dragging redirects while still held');
 await finger('touchEnd');const stopped=await actor();await page.waitForTimeout(350);assert.deepEqual(await actor(),stopped,'lifting stops');assert.equal(await page.evaluate(()=>steerQA.held),null);
 await page.evaluate(()=>steerQA.place(2,160,220));await finger('touchStart',165,220);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>steerQA.destination),null,'arrives at finger');assert.notEqual(await page.evaluate(()=>steerQA.held),null,'arrival retains hold');
 await finger('touchMove',220,220);await page.waitForTimeout(350);assert((await actor()).x>170,'drag resumes after arrival');await finger('touchEnd');
 await page.evaluate(()=>steerQA.place(2,245,210));await finger('touchStart',276,180);await page.waitForTimeout(1400);const blocked=await actor();assert.notEqual(await page.evaluate(()=>steerQA.held),null,'solid barrel does not swallow gesture');await finger('touchMove',210,220);await page.waitForTimeout(400);assert((await actor()).x<blocked.x,'can steer away from barrel');await finger('touchEnd');
 await page.evaluate(()=>steerQA.place(2,160,220));await finger('touchStart',240,220);await page.evaluate(()=>steerQA.message());const modalActor=await actor();await finger('touchMove',100,220);await page.waitForTimeout(250);assert.deepEqual(await actor(),modalActor);assert.equal(await page.evaluate(()=>steerQA.held),null,'popup ends gesture');await finger('touchEnd');await page.getByRole('button',{name:'Continue',exact:true}).click();
 await finger('touchStart',240,220);const pointer=await page.evaluate(()=>steerQA.held);await page.locator('#game').dispatchEvent('pointercancel',{pointerId:pointer,pointerType:'touch'});const cancelled=await actor();await page.waitForTimeout(250);assert.deepEqual(await actor(),cancelled,'cancel stops');await finger('touchEnd');
 await page.evaluate(()=>steerQA.place(0,300,201));await finger('touchStart',316,201);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>steerQA.room),3);assert.equal(await page.evaluate(()=>steerQA.held),null,'room change clears old gesture');await finger('touchEnd');
 // The black surround is a relative pad; touching it alone never teleports or walks.
 const black=await page.locator('#game').boundingBox(),pad={x:black.x+black.width/2,y:black.y+black.height+36};
 const padFinger=async(type,x=pad.x,y=pad.y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 await page.evaluate(()=>steerQA.place(2,160,220));await padFinger('touchStart');await page.waitForTimeout(180);assert.equal((await actor()).x,160,'thumb pad starts neutral');
 await padFinger('touchMove',pad.x+45,pad.y);await page.waitForTimeout(250);assert((await actor()).x>165,'black-space drag walks right');
 const padRight=await actor();await padFinger('touchMove',pad.x-45,pad.y-20);await page.waitForTimeout(250);const diagonal=await actor();assert(diagonal.x<padRight.x&&diagonal.y<padRight.y,'black-space pad redirects diagonally');
 await padFinger('touchMove');const neutral=await actor();await page.waitForTimeout(200);assert.deepEqual(await actor(),neutral,'return to thumb origin stops stride');
 await padFinger('touchMove',pad.x+45,pad.y);await page.waitForTimeout(150);await padFinger('touchEnd');const padStopped=await actor();await page.waitForTimeout(200);assert.deepEqual(await actor(),padStopped,'thumb lift stops');assert.equal(await page.evaluate(()=>steerQA.held),null);
 await padFinger('touchStart');await padFinger('touchMove',pad.x+45,pad.y);await page.evaluate(()=>steerQA.message());await padFinger('touchEnd');assert.equal(await page.evaluate(()=>steerQA.held),null,'popup clears pad');assert(await page.locator('#agi-message').isVisible(),'captured gesture does not dismiss new popup');
 await page.touchscreen.tap(pad.x,pad.y);assert(!(await page.locator('#agi-message').isVisible()),'black-space popup tap still dismisses');
 await padFinger('touchStart');await padFinger('touchMove',pad.x+45,pad.y);await page.setViewportSize({width:844,height:500});assert.equal(await page.evaluate(()=>steerQA.held),null,'rotation cancels pad');await padFinger('touchEnd');
 await page.waitForTimeout(150);const landscapeCanvas=await page.locator('#game').boundingBox(),landscapeShell=await page.locator('.shell').boundingBox(),landscapePad={x:landscapeCanvas.x+landscapeCanvas.width/2,y:(landscapeCanvas.y+(await page.locator('.mobile-controls').boundingBox()).height)/2};
 await page.evaluate(()=>steerQA.place(2,160,220));await padFinger('touchStart',landscapePad.x,landscapePad.y);await padFinger('touchMove',landscapePad.x+35,landscapePad.y+10);await page.waitForTimeout(250);assert((await actor()).x>165,'landscape black margin also steers after dragging into scene '+JSON.stringify({landscapeCanvas,landscapeShell,landscapePad,actor:await actor(),held:await page.evaluate(()=>steerQA.held)}));await padFinger('touchEnd');
 assert.equal(await page.locator('#game').evaluate(el=>getComputedStyle(el).touchAction),'none');assert.deepEqual(errors,[]);
 const desktop=await browser.newPage({viewport:{width:1280,height:800}});await desktop.route('**/stolen-voice.html',route=>route.fulfill({body:html,contentType:'text/html'}));await desktop.goto('http://127.0.0.1:8766/stolen-voice.html');
 await desktop.locator('#start').click();await desktop.locator('#start').click();await desktop.keyboard.press('Escape');for(let i=0;i<4;i++)if(await desktop.locator('#agi-message').isVisible())await desktop.keyboard.press('Enter');
 await desktop.evaluate(()=>steerQA.place(2,160,220));await desktop.locator('#game').click({position:{x:700,y:450}});await desktop.waitForTimeout(250);assert.equal((await desktop.evaluate(()=>steerQA.player)).x,160,'desktop click does not steer');await desktop.keyboard.press('ArrowRight');await desktop.waitForTimeout(200);await desktop.keyboard.press('ArrowRight');assert((await desktop.evaluate(()=>steerQA.player)).x>160,'desktop arrows still walk');
 console.log('PASS black-space relative thumb pad, neutral/diagonal/lift/modal/rotation/landscape behavior plus real scene touch hold, drag/lift/cancel, arrival resume, solid barrel, popup/room interruption and unchanged desktop controls.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
