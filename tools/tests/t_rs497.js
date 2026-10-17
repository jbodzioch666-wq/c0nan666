// RS-497: the dye works (and barber's chair) figure zooms - the mouse wheel, a two-finger pinch, or the + and - buttons - from the whole
// figure in to the face; dragging up and down while zoomed in moves the view up and down you (as if you held the picture); zoomed right out it frames you as before
const path = require('path'), shots = path.join(__dirname, 'shots');
module.exports = async page=>{
  await page.setViewportSize({ width:1600, height:1100 });
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('metal', 3, 'chest'); openDyeWorks(); await new Promise(r=>setTimeout(r, 600)); });
  const cam = ()=>page.evaluate(()=>({ z:+LP.zoom.toFixed(2), cz:+LP.cam.position.z.toFixed(3), ty:+(LP.panY==null ? lpAimY() : LP.panY).toFixed(3), f:LP.f }));
  const out = { start:await cam() };
  const cv = await page.$('#lpSlot canvas'), b = await cv.boundingBox();
  await page.mouse.move(b.x + b.width/2, b.y + b.height/2); for (let i=0;i<6;i++){ await page.mouse.wheel(0, -200); await page.waitForTimeout(40); }
  await page.waitForTimeout(200); out.wheel = await cam(); await page.screenshot({ path:path.join(shots, 'zoom497_in.png'), clip:b });
  /* drag up while zoomed: the view moves down you */
  await page.mouse.move(b.x + b.width/2, b.y + b.height*0.8); await page.mouse.down(); await page.mouse.move(b.x + b.width/2, b.y + b.height*0.3, { steps:8 }); await page.mouse.up(); await page.waitForTimeout(150); out.panned = await cam();
  await page.screenshot({ path:path.join(shots, 'zoom497_pan.png'), clip:b });
  /* the buttons */
  await page.locator('.lpzoom .btn').nth(1).click({ timeout:5000 }); out.minus = await cam();
  for (let i=0;i<12;i++) await page.locator('.lpzoom .btn').nth(1).click({ timeout:5000 }); out.out = await cam();
  await page.locator('.lpzoom .btn').nth(0).click({ timeout:5000 }); out.plus = await cam();
  /* a pinch: two pointers spread apart */
  out.pinch = await page.evaluate(async ()=>{ LP.zoom = 1; LP.panY = null; const cv = LP.r.domElement, r = cv.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
    const ev = (t, id, x)=>cv.dispatchEvent(new PointerEvent(t, { pointerId:id, clientX:x, clientY:cy, bubbles:true, pointerType:'touch' }));
    ev('pointerdown', 1, cx - 20); ev('pointerdown', 2, cx + 20); for (let i=1;i<=10;i++){ ev('pointermove', 1, cx - 20 - i*6); ev('pointermove', 2, cx + 20 + i*6); } ev('pointerup', 1, cx - 80); ev('pointerup', 2, cx + 80); return +LP.zoom.toFixed(2); });
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.start.z===1 && Math.abs(out.start.cz - 2.05*out.start.f) < 0.01, 'starts framed as before');
  A(out.wheel.z > 2 && out.wheel.cz < out.start.cz*0.5 && out.wheel.ty > out.start.ty, 'the wheel zooms in, toward the face');
  A(out.panned.ty < out.wheel.ty - 0.05, 'dragging up while zoomed moves the view down you, as if you held the picture');
  A(out.minus.z < out.wheel.z && out.out.z===1 && out.plus.z > 1.3, 'the + and - buttons zoom, and right out frames you whole');
  A(out.pinch > 2, 'a pinch zooms in');
};
