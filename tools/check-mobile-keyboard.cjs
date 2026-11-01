// NODE_PATH=<Playwright dependencies> node tools/check-mobile-keyboard.cjs [game URL]
const {chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]||'http://127.0.0.1:8766/stolen-voice.html');
 for(let i=0;i<2;i++)await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Skip intro',exact:true}).click();
 for(let i=0;i<4;i++)if(await page.locator('#agi-message').isVisible())await page.getByRole('button',{name:'Continue',exact:true}).click();
 const field=page.locator('#input'),panel=page.locator('#mobile-keyboard'),key=label=>panel.getByRole('button',{name:label,exact:true});
 const verify=async()=>{const boxes=await page.evaluate(()=>Object.fromEntries(['.screen','#input','#mobile-keyboard'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return[selector,{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}]})));for(const [selector,r]of Object.entries(boxes)){assert(r.height>0&&r.width>0,selector+' visible');assert(r.top>=0&&r.bottom<=windowSize.height+1,selector+' fits vertically');assert(r.left>=0&&r.right<=windowSize.width+1,selector+' fits horizontally')}assert(boxes['.screen'].bottom<=boxes['#mobile-keyboard'].top+1,'keyboard does not cover game')};
 let windowSize={width:390,height:844};const before=await page.evaluate(()=>({height:visualViewport.height,top:visualViewport.offsetTop}));await field.tap();assert(await field.evaluate(el=>el.readOnly&&el.inputMode==='none'));assert(await panel.isVisible());await verify();assert.deepEqual(await page.evaluate(()=>({height:visualViewport.height,top:visualViewport.offsetTop})),before,'own keyboard never changes browser viewport');
 for(const letter of ['L','O','O','K'])await key(letter).tap();await key('Space').tap();await key('X').tap();await key('Backspace').tap();assert.equal(await field.inputValue(),'look ');
 await key('123').tap();await key('1').tap();await key('Backspace').tap();await key('ABC').tap();await key('Enter').tap();assert(await page.locator('#agi-message').isVisible());assert(!(await panel.isVisible()));await page.getByRole('button',{name:'Continue',exact:true}).click();
 await field.tap();await field.pressSequentially('look');assert.equal(await field.inputValue(),'look','hardware keyboard edits readonly parser');await field.press('Enter');assert(await page.locator('#agi-message').isVisible());await page.getByRole('button',{name:'Continue',exact:true}).click();
 await field.tap();await page.screenshot({path:'/tmp/stolenvoice-own-keyboard-portrait.png'});
 windowSize={width:844,height:390};await page.setViewportSize(windowSize);await page.waitForTimeout(100);await verify();await page.screenshot({path:'/tmp/stolenvoice-own-keyboard-landscape.png'});
 await key('Hide').tap();assert(!(await panel.isVisible()));await field.tap();await key('Hide').tap();windowSize={width:390,height:844};await page.setViewportSize(windowSize);await field.tap();await verify();await key('Hide').tap();
 assert.deepEqual(errors,[]);console.log('PASS native keyboard suppressed, stable viewport, touch letters/space/numbers/backspace/Enter, hardware typing, hide/reopen and both rotations.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
