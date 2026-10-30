// (probe, not in ALL) the roads on the open land: a shot over a stretch of road near the start, and one close in
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.mon = []; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.3; G.weather = 'clear';
    const sp = G.ow.spawnPos; let best = null, bn = 0;
    for (let x=sp.x-25; x<=sp.x+25; x++) for (let y=sp.y-25; y<=sp.y+25; y++){ if (!(wgRoadAt(x, y)===1)) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (wgRoadAt(x+i, y+j)===1) n++; if (n > bn && G.ow.map[x][y]!==OW_TOWN){ bn = n; best = { x, y }; } }
    if (best) G.owPos = best; for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    return { at:best, n:bn }; });
  console.log(JSON.stringify(r));
  await page.screenshot({ path: SHOTS + '/zroad-far.png' });
  await page.evaluate(async ()=>{ O3.dist = 7; for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } });
  await page.screenshot({ path: SHOTS + '/zroad-near.png' });
  /* by a town's gate, where the old paving is */
  await page.evaluate(async ()=>{ O3.dist = 9; const sp = G.ow.spawnPos; let best = null, bd = 1e9; for (let x=sp.x-30; x<=sp.x+30; x++) for (let y=sp.y-30; y<=sp.y+30; y++){ if (wgRoadAt(x, y)!==1) continue; let t = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (G.ow.map[x+i] && G.ow.map[x+i][y+j]===OW_TOWN) t = 1; const d = Math.hypot(x - sp.x, y - sp.y); if (t && d < bd && d > 1){ bd = d; best = { x, y }; } }
    if (best) G.owPos = best; for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } });
  await page.screenshot({ path: SHOTS + '/zroad-town.png' });
};
