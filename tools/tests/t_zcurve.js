// (probe, not in ALL) a Planet's 3D land zoomed right out, with the curve (shots/zcurve-on.png) and without (zcurve-off.png)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    G.owMainZoomScale = OW_MAIN_ZOOM_MIN; for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await page.screenshot({ path: SHOTS + '/zcurve-on.png' });
  await page.evaluate(async ()=>{ window.__noCurve = true; for (let i=0;i<20;i++) await new Promise(r=>requestAnimationFrame(r)); });
  await page.screenshot({ path: SHOTS + '/zcurve-off.png' });
  console.log(JSON.stringify(await page.evaluate(()=>({ zoom:G.owMainZoomScale, k:o3CurveK(), min:OW_MAIN_ZOOM_MIN })))); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
