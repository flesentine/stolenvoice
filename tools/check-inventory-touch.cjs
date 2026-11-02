// NODE_PATH=<Playwright dependencies> node tools/check-inventory-touch.cjs [game URL]
const {chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const mobile of [true,false]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]||'http://127.0.0.1:8766/stolen-voice.html');
  if(mobile){for(let i=0;i<2;i++)await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Skip intro',exact:true}).click()}else{await page.locator('#start').click();await page.locator('#start').click();await page.keyboard.press('Escape')}
  for(let i=0;i<4;i++)if(await page.locator('#agi-message').isVisible())await page.keyboard.press('Enter');
  await page.keyboard.type('xyzzy inventory');await page.keyboard.press('Enter');while(await page.locator('#agi-message').isVisible())await page.keyboard.press('Enter');
  const open=async()=>{if(mobile)await page.getByRole('button',{name:'Items',exact:true}).click();else await page.keyboard.press('Tab')};
  const rowPoint=async index=>page.locator('#agi-message-picture').evaluate((canvas,index)=>{const r=canvas.getBoundingClientRect();return{x:r.left+100/canvas.width*r.width,y:r.top+(40+index*12)/canvas.height*r.height}},index);
  await open();const names=(await page.locator('#message').textContent()).match(/You are carrying:\n([\s\S]*?)\nSelected:/)[1].split('\n');assert(names.length>=9);
  if(mobile){
   for(const viewport of [{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.waitForTimeout(100);
    for(let row=0;row<names.length;row++){
     const point=await rowPoint(row);await page.touchscreen.tap(point.x,point.y);
     assert.equal(await page.locator('#agi-message').getAttribute('aria-label'),'Inventory object');assert((await page.locator('#message').textContent()).startsWith(names[row]+'\n\n'),'tapped '+names[row]+' opens its description');assert.equal(await page.locator('#agi-message-picture').getAttribute('width'),'280');
     if(row===names.length-1)await page.screenshot({path:'/tmp/stolenvoice-inventory-touch-'+viewport.width+'.png'});
     const detail=await page.locator('#agi-message-picture').boundingBox();await page.touchscreen.tap(detail.x+detail.width/2,detail.y+detail.height/2);assert.equal(await page.locator('#agi-message').getAttribute('aria-label'),'Inventory');
    }
   }
   const footer=await page.locator('#agi-message-picture').boundingBox();await page.touchscreen.tap(footer.x+footer.width/2,footer.y+footer.height-10);assert(!(await page.locator('#agi-message').isVisible()),'footer still returns to game');
  }else{
   const point=await rowPoint(2);await page.mouse.click(point.x,point.y);assert(!(await page.locator('#agi-message').isVisible()),'desktop click behavior unchanged');await open();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert((await page.locator('#message').textContent()).startsWith(names[1]+'\n\n'),'desktop keyboard still examines');await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);console.log('PASS '+(mobile?'all nine inventory rows by real touch in portrait/landscape, descriptions/art, detail return and list exit':'desktop click unchanged and keyboard selection/examine retained'));await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
