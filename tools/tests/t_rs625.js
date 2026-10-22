// RS-625: the Planet world size (generator 14). The land is made on a sphere by drifting plates and laid flat: about a third land, ranges where
// plates meet, deserts in the dry belts about 30 degrees, tundra toward the poles, open sea down the seam and ice-bound sea at the poles. It
// saves and loads as itself and has its own world code. On the world map, zooming right out shows it as a globe you can turn. Other sizes
// come out as before (generator 14 only keeps sea cliffs off lake shores). Shots: shots/rs625-globe.png, shots/rs625-chart.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { w:[] };
    /* another size: generator 14 lays the same land as 13 */
    { G.ow.genVer = 13; wgRegenerate(777); const a = pmMapKey(); G.ow.genVer = OW_GEN_VER; wgRegenerate(777); out.sameOther = a===pmMapKey(); out.notPlanet = !owIsPlanet(); }
    setWorldSizeTier('planet'); out.size = OW_COLS + 'x' + OW_ROWS;
    for (const seed of [777, 424242]){ const t0 = performance.now(); wgRegenerate(seed); const ms = performance.now() - t0, W = OW_COLS, H = OW_ROWS, M = G.ow.map, k1 = pmMapKey();
      const c = {}, lat = {}; let seamWet = true, poleWet = true, oM = 0, nM = 0, oL = 0, nL = 0;
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = M[x][y], b = Math.abs(y + 0.5 - H/2)/(H/2); c[t] = (c[t]||0) + 1; (lat[t] = lat[t] || []).push(b);
        if ((x < 3 || x > W - 4) && t!==OW_WATER) seamWet = false; if ((y < 3 || y > H - 4) && t!==OW_WATER) poleWet = false;
        if (t!==OW_WATER){ const o = OW_PLANET_OROG[y*W + x]; if (t===OW_MOUNTAIN){ oM += o; nM++; } else { oL += o; nL++; } } }
      const N = W*H, pc = t=>(c[t]||0)/N, mean = t=>(lat[t]||[]).reduce((a, b)=>a + b, 0)/Math.max(1, (lat[t]||[]).length);
      wgRegenerate(seed); const same = pmMapKey()===k1;
      out.w.push({ seed, ms:+ms.toFixed(0), planet:owIsPlanet(), plates:G.ow.plates, land:+(1 - pc(OW_WATER)).toFixed(3), mtn:+pc(OW_MOUNTAIN).toFixed(3), desert:+pc(OW_DESERT).toFixed(3), tundra:+pc(OW_TUNDRA).toFixed(3), forest:+pc(OW_FOREST).toFixed(3),
        desertLat:+mean(OW_DESERT).toFixed(2), tundraLat:+mean(OW_TUNDRA).toFixed(2), seamWet, poleWet, push:[+(oM/Math.max(1, nM)).toFixed(2), +(oL/Math.max(1, nL)).toFixed(2)], same, towns:skTowns().length }); }
    out.code = worldCode(); const wc = worldCodeParse(out.code); out.codeOk = !!wc && wc.size==='planet' && wc.seed===(G.ow.seed>>>0);
    out.preview = (()=>{ setUi('worldPreview'); const cv = document.getElementById('worldPreviewCanvas'); return cv ? cv.width + 'x' + cv.height : null; })();
    /* play it: save and load it back, the same world */
    confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; const key = pmMapKey(), seed = G.ow.seed;
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); out.loaded = OW_COLS===432 && OW_ROWS===216 && G.ow.seed===seed && pmMapKey()===key && owIsPlanet();
    setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{}; for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    out.o3 = !!(O3 && O3.win);
    /* the globe: zoom right out, and in again */
    toggleOwZoom(); G.owZoomScale = OW_ZOOM_MIN; for (let i=0;i<10;i++) await new Promise(r=>requestAnimationFrame(r));
    const wheel = dy=>canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:dy, bubbles:true, cancelable:true }));
    wheel(100); out.globeOn = owGlobeOn(); for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r));
    for (let i=0;i<400 && GLOBE.M;i++) await new Promise(r=>requestAnimationFrame(r));
    out.facing = (()=>{ const f = globeFacing(), v = chartView(OW_ZOOM_MIN, owZoomCenter()), cx = v.camFX + v.vW/2 - 0.5, cy = v.camFY + v.vH/2 - 0.5; return Math.abs(f.x - cx) <= 2 && Math.abs(f.y - cy) <= 2; })();   /* (RS-626: turned to the chart's middle, so it rolls up out of it) */
    { const y0 = GLOBE.yaw, rc = canvas.getBoundingClientRect(), cx = rc.left + rc.width/2, cy = rc.top + rc.height/2;
      canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX:cx, clientY:cy, isPrimary:true, pointerType:'mouse', button:0, bubbles:true }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX:cx + 120, clientY:cy, isPrimary:true, pointerType:'mouse', bubbles:true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientX:cx + 120, clientY:cy, isPrimary:true, pointerType:'mouse', button:0, bubbles:true })); out.turned = Math.abs(GLOBE.yaw - y0) > 0.2; }
    { const t = [0.3, 0.6], p = [100, 30]; globeFace(p[0], p[1]); const f = globeFacing(); out.faceRound = Math.abs(f.x - p[0]) <= 1 && Math.abs(f.y - p[1]) <= 1; globeFace(G.owPos.x, G.owPos.y); }
    const fr = []; let l = performance.now(); for (let i=0;i<60;i++){ GLOBE.yaw += 0.01; await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - l); l = t; } fr.sort((a, b)=>a - b); out.globeMs = +fr[30].toFixed(1);
    out.btn = !!document.querySelector('.mt-b[title="see the whole planet"]');
    return out; });
  await page.screenshot({ path: SHOTS + '/rs625-globe.png' });
  const r2 = await page.evaluate(async ()=>{ for (let i=0;i<40 && G.owGlobe && !GLOBE.M;i++){ canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:-100, bubbles:true, cancelable:true })); await new Promise(r=>requestAnimationFrame(r)); }
    for (let i=0;i<600 && G.owGlobe;i++) await new Promise(r=>requestAnimationFrame(r)); for (let i=0;i<10;i++) await new Promise(r=>requestAnimationFrame(r));
    return { back:!G.owGlobe && owMapOpen(), center:G.owZoomCenter }; });
  await page.screenshot({ path: SHOTS + '/rs625-chart.png' });
  Object.assign(r, r2); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sameOther && r.notPlanet, 'another size comes out as it did');
  A(r.size==='432x216' && r.w.every(w=>w.planet), 'Planet is a world twice as wide as tall, made by generator 14');
  A(r.w.every(w=>w.plates && w.plates.n >= 14 && w.plates.n <= 20 && w.plates.cont >= 3), 'fourteen to twenty plates, some with continents');
  A(r.w.every(w=>w.land > 0.28 && w.land < 0.42), 'about a third of it land');
  A(r.w.every(w=>w.mtn > 0.01 && w.mtn < 0.08 && w.push[0] > w.push[1]*2), 'ranges, where the plates push hardest');
  A(r.w.every(w=>w.desert > 0.02 && w.desertLat > 0.15 && w.desertLat < 0.6), 'deserts, in the dry belts');
  A(r.w.every(w=>w.tundra > 0.002 && w.tundraLat > w.desertLat + 0.15), 'tundra, toward the poles');
  A(r.w.every(w=>w.forest > 0.03), 'forests');
  A(r.w.every(w=>w.seamWet && w.poleWet), 'open sea down the seam and at the poles');
  A(r.w.every(w=>w.same && w.towns >= 20), 'the same seed makes the same planet, with its towns');
  A(r.w.every(w=>w.ms < 6000), 'made in a few seconds: ' + r.w.map(w=>w.ms));
  A(r.codeOk && /^W/.test(r.code), 'its world code: ' + r.code);
  A(r.preview==='864x432', 'the preview is as wide as the world');
  A(r.loaded, 'saved and loaded, the same planet');
  A(r.globeOn && r.facing, 'zoomed right out, the world map is a globe, turned to the land the chart showed');
  A(r.turned && r.faceRound, 'dragging turns it; it can be turned to any place');
  A(r.globeMs < 25, 'the globe turns smoothly: ' + r.globeMs);
  A(r.btn, 'a Globe button on the map');
  A(r.back, 'zooming in opens the chart again');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
