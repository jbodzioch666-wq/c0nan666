// (probe, not in ALL) a Planet world in the 3D overworld: time to the first land, frame times walking, a shot (shots/zplanet3d.png)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(t=>{ window.__ztier = t; }, process.env.ZTIER||'planet');
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier(window.__ztier||'planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    G.gameMode = 0; G.interior = null; const t0 = performance.now(); let first = 0; for (let i=0;i<400;i++){ await new Promise(r=>requestAnimationFrame(r)); if (!first && O3.win) first = performance.now() - t0; }
    const fr = []; let l = performance.now(); for (let i=0;i<240;i++){ if (i % 20===0){ const d = [[1,0],[0,1],[-1,0],[0,-1]].find(([a, b])=>{ const t = G.ow.map[G.owPos.x + a] && G.ow.map[G.owPos.x + a][G.owPos.y + b]; return t!==undefined && t!==OW_WATER && t!==OW_MOUNTAIN; }); if (d) tryMove(d[0], d[1]); }
      await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - l); l = t; } fr.sort((a, b)=>a - b);
    return { first:+first.toFixed(0), med:+fr[120].toFixed(1), p95:+fr[228].toFixed(1), worst:+fr[239].toFixed(1), at:G.owPos }; });
  await page.screenshot({ path: SHOTS + '/zplanet3d.png' }); console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
