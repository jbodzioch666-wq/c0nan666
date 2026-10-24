// (probe, not in ALL) RS-628's globe map: shots at the zoom it opens on, zoomed in, nearest, the whole world, and up north (shots/zglobe2-<name>.png); frame times
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async seen=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; if (seen){ owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; } for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    toggleOwZoom(); for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); }, !!process.env.ZSEEN);
  const shot = async (nm, f)=>{ const r = await page.evaluate(async f=>{ if (f) new Function(f)(); for (let i=0;i<90;i++) await new Promise(r=>requestAnimationFrame(r));
      const fr = []; let l = performance.now(); for (let i=0;i<40;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - l); l = t; } fr.sort((a, b)=>a - b);
      return { pa:+GLOBE.pa.toFixed(2), zs:+owZoomScale().toFixed(2), dist:+GLOBE.dist.toFixed(2), med:+fr[20].toFixed(1), worst:+fr[39].toFixed(1) }; }, f);
    await page.screenshot({ path: SHOTS + '/zglobe2-' + nm + '.png' }); console.log(nm, JSON.stringify(r)); };
  await shot('open');
  await shot('in', 'GLOBE.distGoal = globeZsDist(3);');
  await shot('nearest', 'GLOBE.distGoal = globeMinDist();');
  await shot('world', 'GLOBE.distGoal = 7;');
  await shot('north', 'GLOBE.distGoal = globeZsDist(2); G.owZoomCenter = { x:G.owPos.x, y:Math.round(OW_ROWS*0.2) };');
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
