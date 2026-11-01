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
   const boxes={};for(const name of ['.screen','#input','.mobile-controls']){
    const box=await page.locator(name).boundingBox();assert(box&&box.width>0&&box.height>0,name+' visible');
    assert(box.x>=view.left-1&&box.y>=view.top-1,name+' remains below visible top');
    assert(box.x+box.width<=view.left+view.width+1&&box.y+box.height<=view.top+view.height+1,name+' fits above keyboard');boxes[name]=box;
   }return boxes;
  };
  await visible();await page.locator('#input').focus();
  await viewport(390,410,0);await visible(); // Android-style resize
  await viewport(390,410,175,0,'scroll');await visible(); // iOS-style focus pan
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-portrait.png'});
  await page.locator('#input').fill('look');await page.getByRole('button',{name:'Go',exact:true}).click();assert(await page.locator('#agi-message').isVisible());await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.setViewportSize({width:844,height:390});await viewport(844,390);
  let boxes=await visible();assert(boxes['.screen'].x+boxes['.screen'].width<=boxes['#input'].x,'landscape controls beside the game');assert(boxes['.screen'].height>350,'landscape uses available height');
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-landscape.png'});
  await page.locator('#input').focus();await viewport(844,175,140,0,'scroll');await visible();
  await page.screenshot({path:'/tmp/stolenvoice-keyboard-landscape-open.png'});
  await page.locator('#input').blur();await page.setViewportSize({width:390,height:844});await viewport(390,844);await visible();
  assert.deepEqual(errors,[]);console.log('PASS portrait keyboard resize, Safari viewport pan, parser submission, landscape side panel, landscape keyboard and rotation back.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
