// (probe, not in ALL) the land's colours in each view: on a Planet (or ZTIER), stood in the middle of a desert, a tundra, a grassland and a
// forest - the 3D land with its minimap (shots/zbiome-<kind>.png), the globe's chart close in (zbiome-<kind>-map.png); and the globe right out
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async t=>{ goToCharCreate(); ccBegin(); setWorldSizeTier(t); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null;
    for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); }, process.env.ZTIER || 'planet');
  const kinds = Object.fromEntries(Object.entries({ desert:'OW_DESERT', tundra:'OW_TUNDRA', grass:'OW_GRASS', forest:'OW_FOREST' }).filter(([k])=>!process.env.ZKINDS || process.env.ZKINDS.split(',').includes(k)));   /* (ZKINDS=desert,tundra to choose) */
  for (const [k, c] of Object.entries(kinds)){
    const r = await page.evaluate(async c=>{ const T = window[c] !== undefined ? window[c] : eval(c), W = OW_COLS, H = OW_ROWS, m = G.ow.map; let at = null;
      for (let x=3; x<W - 3 && !at; x+=2) for (let y=3; y<H - 3 && !at; y+=2){ if (m[x][y]!==T || (owCube() && cubeFace(x, y) < 0)) continue; let ok = true; for (let i=-3;i<=3 && ok;i++) for (let j=-3;j<=3 && ok;j++) if (m[x + i][y + j]!==T) ok = false; if (ok) at = [x, y]; }
      if (!at) return { none:true };
      G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 12); for (let i=0;i<180;i++) await new Promise(r=>requestAnimationFrame(r));
      return { at, t:m[at[0]][at[1]], bio:typeof wgBioAt==='function' ? wgBioAt(at[0], at[1]) : null }; }, c);
    console.log(k, JSON.stringify(r)); if (r.none) continue;
    await page.screenshot({ path: SHOTS + '/zbiome-' + k + '.png' });
    await page.evaluate(async ()=>{ toggleOwZoom(); G.owZoomScale = 5; for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); if (window.GLOBE && GLOBE.distGoal) GLOBE.dist = GLOBE.distGoal; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); });
    await page.screenshot({ path: SHOTS + '/zbiome-' + k + '-map.png' });
    await page.evaluate(async ()=>{ toggleOwZoom(); for (let i=0;i<10;i++) await new Promise(r=>requestAnimationFrame(r)); });
  }
  await page.evaluate(async ()=>{ owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; toggleOwZoom(); G.owZoomScale = OW_ZOOM_MIN; for (let i=0;i<3;i++) await new Promise(r=>requestAnimationFrame(r)); if (window.GLOBE && GLOBE.distGoal) GLOBE.dist = GLOBE.distGoal; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await page.screenshot({ path: SHOTS + '/zbiome-globe.png' });
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
