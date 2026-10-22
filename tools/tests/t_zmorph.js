// (probe, not in ALL) the globe <-> chart change slowed down (6 s): shots/zmorph-in-<k>.png going in, zmorph-out-<k>.png going out, and
// zmorph-flat3d.png (the sheet fully flat, without the chart over it) beside zmorph-chart.png, to see that they line up
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    toggleOwZoom(); G.owZoomScale = OW_ZOOM_MIN; for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r)); window.__morphS = 6; });
  await page.screenshot({ path: SHOTS + '/zmorph-chart.png' });
  await page.evaluate(()=>globeOpen());
  for (let k=0;k<6;k++){ await page.screenshot({ path: SHOTS + '/zmorph-out-' + k + '.png' }); await page.waitForTimeout(1050); }
  await page.waitForTimeout(800);
  const st = await page.evaluate(()=>({ M:!!GLOBE.M, globe:G.owGlobe, dist:+GLOBE.dist.toFixed(2), near:+globeNearDist().toFixed(2) })); console.log('after out', JSON.stringify(st));
  /* the flat sheet alone */
  await page.evaluate(async ()=>{ const M = GLOBE.M; window.__freeze = true; });
  await page.evaluate(()=>globeClose());
  for (let k=0;k<6;k++){ await page.screenshot({ path: SHOTS + '/zmorph-in-' + k + '.png' }); await page.waitForTimeout(1050); }
  await page.waitForTimeout(800);
  const st2 = await page.evaluate(()=>({ M:!!GLOBE.M, globe:G.owGlobe, zs:G.owZoomScale })); console.log('after in', JSON.stringify(st2));
  /* the sheet fully flat with nothing over it: turned off the chart's fade */
  await page.evaluate(async ()=>{ globeOpen(); GLOBE.M.t0 = -1e9; GLOBE.M.dir = 1; GLOBE.M.t0 = performance.now() - 6000*0.999; const gr = window.globeRender; });
  await page.evaluate(async ()=>{ const M = GLOBE.M; for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); });
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
