// (probe, not in ALL) a Planet world's globe: shots from several turns (shots/zglobe-<n>.png), with the whole map seen (ZSEEN=1) or as at the start
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async seen=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    if (seen){ owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; }
    toggleOwZoom(); for (let i=0;i<20;i++) await new Promise(r=>requestAnimationFrame(r)); globeOpen(); const t0 = performance.now(); for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r));
    return { on:owGlobeOn(), ms:+(performance.now() - t0).toFixed(0), planet:owIsPlanet(), size:OW_COLS + 'x' + OW_ROWS, at:G.owPos }; }, !!process.env.ZSEEN);
  console.log(JSON.stringify(r));
  for (let n=0;n<4;n++){ await page.waitForTimeout(300); await page.screenshot({ path: SHOTS + '/zglobe-' + n + '.png' });
    await page.evaluate(n=>{ if (n===2) globeFace(0, OW_ROWS/2 - 20); else globeTurn(1.4, [0.5, -0.6, 0.1, 0][n]); GLOBE.vyaw = GLOBE.vpitch = 0; }, n); }
  const f = await page.evaluate(async ()=>{ const fr = []; let l = performance.now(); for (let i=0;i<60;i++){ globeTurn(0.02, 0); await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - l); l = t; } fr.sort((a, b)=>a - b); return { med:+fr[30].toFixed(1), worst:+fr[59].toFixed(1) }; });
  console.log('frames', JSON.stringify(f)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
