// RS-628: on a Planet world the map is the globe at every zoom: the chart, with everything on it, drawn for the land facing you and laid
// over the sphere; clicks, taps and hovers traced through the sphere to the chart's own handlers. Other sizes keep the flat chart.
// Shots: shots/rs628-open.png, shots/rs628-near.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const raf = 'const raf = ()=>new Promise(r=>requestAnimationFrame(r));';
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)); goToCharCreate(); ccBegin(); const out = {};
    confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; for (let i=0;i<30;i++) await raf();
    toggleOwZoom(); for (let i=0;i<10;i++) await raf(); out.flatOther = !owGlobeOn(); toggleOwZoom();
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; for (let i=0;i<60;i++) await raf();
    toggleOwZoom(); for (let i=0;i<90;i++) await raf();
    const f = globeFacing(); out.open = { on:owGlobeOn(), pa:GLOBE.pa, zs:+owZoomScale().toFixed(2), facing:Math.abs(f.x - G.owPos.x) <= 1 && Math.abs(f.y - G.owPos.y) <= 1 };
    const rect = canvas.getBoundingClientRect(), k = canvas.width/rect.width, client = (tx, ty)=>{ const s = globeTileScreen(tx, ty); return s ? { clientX:rect.left + s.x/k, clientY:rect.top + s.y/k } : null; };
    /* a town, found where it shows on the globe */
    { const sp = G.ow.spawnPos, c = client(sp.x, sp.y), t = c && owTownAtClient(c); out.town = !!(t && t.x===sp.x && t.y===sp.y); }
    /* a pin, dropped where you click on the globe */
    { mapSetMode('pin'); for (let i=0;i<5;i++) await raf(); const tx = G.owPos.x + 4, ty = G.owPos.y + 2, c = client(tx, ty), n0 = (pinsP()||[]).length;
      canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX:c.clientX, clientY:c.clientY, isPrimary:true, pointerType:'mouse', button:0, bubbles:true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX:c.clientX, clientY:c.clientY, isPrimary:true, pointerType:'mouse', button:0, bubbles:true }));
      for (let i=0;i<5;i++) await raf(); const p = G.pinEdit; out.pin = !!p && p.i===-1 && Math.abs(p.x - tx) <= 1 && Math.abs(p.y - ty) <= 1; out.pinAt = p && [p.x, p.y, tx, ty]; pinClose(); mapSetMode('look'); }   /* (a click in pin mode opens a new pin there) */
    /* something else moves the map (the search does this): the globe turns there */
    { const to = { x:(G.owPos.x + 120) % OW_COLS, y:Math.round(OW_ROWS*0.4) }; G.owZoomCenter = { x:to.x, y:to.y }; for (let i=0;i<150;i++) await raf(); const g = globeFacing(); out.turns = Math.abs(g.x - to.x) <= 2 && Math.abs(g.y - to.y) <= 2; }
    const wheel = dy=>canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:dy, bubbles:true, cancelable:true }));
    /* in to the chart's nearest, out to the whole world */
    for (let i=0;i<30;i++){ wheel(-100); await raf(); } for (let i=0;i<120;i++) await raf(); out.nearZs = +owZoomScale().toFixed(2); out.nearPa = GLOBE.pa;
    return out; });
  await page.screenshot({ path: SHOTS + '/rs628-near.png' });
  const r2 = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    const wheel = dy=>canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:dy, bubbles:true, cancelable:true }));
    for (let i=0;i<30;i++){ wheel(100); await raf(); } for (let i=0;i<120;i++) await raf(); out.farPa = GLOBE.pa; out.farDist = +GLOBE.dist.toFixed(1);
    GLOBE.distGoal = globeZsDist(1.6); for (let i=0;i<120;i++) await raf();
    /* turning it by dragging: the frame rate */
    const rc = canvas.getBoundingClientRect(), cx = rc.left + rc.width/2, cy = rc.top + rc.height/2;
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX:cx, clientY:cy, isPrimary:true, pointerType:'mouse', button:0, bubbles:true }));
    const fr = []; let l = performance.now(); for (let i=0;i<90;i++){ window.dispatchEvent(new PointerEvent('pointermove', { clientX:cx + i*4, clientY:cy, isPrimary:true, pointerType:'mouse', bubbles:true })); await raf(); const t = performance.now(); fr.push(t - l); l = t; }
    window.dispatchEvent(new PointerEvent('pointerup', { clientX:cx + 360, clientY:cy, isPrimary:true, pointerType:'mouse', button:0, bubbles:true })); fr.sort((a, b)=>a - b);
    out.drag = { med:+fr[45].toFixed(1), p90:+fr[81].toFixed(1) }; return out; });
  await page.screenshot({ path: SHOTS + '/rs628-open.png' });
  Object.assign(r, r2); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.flatOther, 'another size keeps the flat chart');
  A(r.open.on && r.open.pa > 0.99 && r.open.facing && Math.abs(r.open.zs - 2.2) < 0.05, 'on a planet the map opens as the globe, turned to you, with the chart laid over it');
  A(r.town, 'a town is found where it shows on the globe');
  A(r.pin, 'a new pin opens where you click on the globe');
  A(r.turns, 'moving the map elsewhere turns the globe there');
  A(r.nearZs > 7.5 && r.nearPa > 0.99, 'it zooms in to the chart\'s nearest');
  A(r.farPa===0 && r.farDist > 9, 'and out to the whole world, the clean globe');
  A(r.drag.med < 14, 'turning it stays smooth: ' + JSON.stringify(r.drag));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
