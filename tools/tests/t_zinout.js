// (probe, not in ALL) into a building and back out on the fixed seed: shots/zio_<step>_<ZTAG>.png (in, out at once, out 3s later),
// with timings of each frame round the doors
module.exports = async page=>{
  page.setDefaultTimeout(0); const tag = process.env.ZTAG || 'now', out = {};
  if (process.env.ZREAL) await page.evaluate(()=>{ window.__noWarmSlice = false; });   /* (as the game runs: the sliced warm-up on) */
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } });
  await page.screenshot({ path: SHOTS + '/zio_town_' + tag + '.png' });
  const frames = async (n)=>page.evaluate(async n=>{ const f = []; let last = performance.now(); for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now(); f.push(Math.round(now - last)); last = now; } return f; }, n);
  out.key = await page.evaluate(()=>{ const k = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]) || Object.keys(ROOM_LAYOUT)[0]; enterInterior(k); return k; });
  out.inF = await frames(90); await page.screenshot({ path: SHOTS + '/zio_in_' + tag + '.png' });
  out.inside = await page.evaluate(()=>({ interior:!!G.interior, px:[G.player.x, G.player.y] }));
  await page.evaluate(()=>exitInterior()); out.outF = await frames(20); await page.screenshot({ path: SHOTS + '/zio_out_' + tag + '.png' });
  out.out2F = await frames(150); await page.screenshot({ path: SHOTS + '/zio_out2_' + tag + '.png' });
  out.errs = await page.evaluate(()=>(window.__errs||[]).slice(0, 5));
  console.log(JSON.stringify(out));
};
