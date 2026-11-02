// Browser regression: NODE_PATH=<Playwright dependencies> node tools/check-mobile-viewport.cjs [game URL]
// A virtual visualViewport reproduces keyboard resize AND Safari pan separately.
const {chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>Object.defineProperty(window,'visualViewport',{value:Object.assign(new EventTarget(),{width:390,height:844,offsetTop:0,offsetLeft:0})}));
  await page.goto(process.argv[2]||'http://127.0.0.1:8766/stolen-voice.html');
  await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('button',{name:'Skip intro',exact:true}).click();
  for(let i=0;i<4;i++)if(await page.locator('#agi-message').isVisible())await page.getByRole('button',{name:'Continue',exact:true}).click();
  const viewport=async(width,height,top=0,left=0,event='resize')=>{await page.evaluate(v=>{Object.assign(window.visualViewport,v);window.visualViewport.dispatchEvent(new Event(v.event))},{width,height,offsetTop:top,offsetLeft:left,event});await page.waitForTimeout(50)};
  const visible=async()=>{
   const view=await page.evaluate(()=>({width:visualViewport.width,height:visualViewport.height,top:visualViewport.offsetTop,left:visualViewport.offsetLeft}));
   const boxes={};for(const name of ['.screen','.mobile-controls','#mobile-keyboard']){
    const box=await page.locator(name).boundingBox();assert(box&&box.width>0&&box.height>0,name+' visible');
    assert(box.x>=view.left-1&&box.y>=view.top-1,name+' remains below visible top');
    assert(box.x+box.width<=view.left+view.width+1&&box.y+box.height<=view.top+view.height+1,name+' fits above keyboard');boxes[name]=box;
   }
   const toolbar=boxes['.mobile-controls'],scene=boxes['.screen'],keyboard=boxes['#mobile-keyboard'];
   assert(toolbar.y+toolbar.height<=scene.y+1,'toolbar stays above play viewport');
   const center=scene.y+scene.height/2,expected=view.width<600?(toolbar.y+toolbar.height+keyboard.y)/2:(toolbar.y+toolbar.height+view.top+view.height)/2;
   assert(Math.abs(center-expected)<=1,'play viewport is centered in available space');
   assert((await page.locator('.mobile-controls button').first().evaluate(el=>getComputedStyle(el).fontFamily)).includes('Sierra AGI'),'controls use original game font');
   return boxes;
  };
  await visible();assert(await page.locator('#input').isHidden());
  await viewport(390,560,0);await visible(); // Android-style resize
  await viewport(390,560,100,0,'scroll');await visible(); // iOS-style focus pan
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-portrait.png'});
  await page.keyboard.type('look');await page.locator('#mobile-keyboard').getByRole('button',{name:'Enter',exact:true}).click();assert(await page.locator('#agi-message').isVisible());await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.setViewportSize({width:844,height:390});await viewport(844,390);
  let boxes=await visible();assert(boxes['.mobile-controls'].y+boxes['.mobile-controls'].height<=boxes['.screen'].y+1,'landscape controls stay above the game');assert(boxes['.screen'].height>250,'landscape uses available height');
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-landscape.png'});
  assert(await page.locator('#input').isHidden());await viewport(844,340,40,0,'scroll');await visible();
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-landscape-open.png'});
  await page.locator('#input').blur();await page.setViewportSize({width:390,height:844});await viewport(390,844);await visible();
  assert.deepEqual(errors,[]);console.log('PASS top pixel-font toolbar, centered portrait/landscape play viewport, resize/pan, parser submission and rotation back.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
