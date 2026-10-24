// RS-505: a long walk on the open land no longer ends each land rebuild in a freeze. The rebuild starts 13 tiles before the land's
// edge would show (it was 4) and speeds up as you near it (6ms a frame, up to 40); and a build sliced over a walk no longer
// sets off a whole-scene loading warm-up when it ends. Here the position crosses 40 tiles, one every five frames, at a quarter
// of this machine's speed (a phone's pace)
module.exports = async page=>{
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  const cdp = await page.context().newCDPSession(page);
  const r0 = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; const wait = ms=>new Promise(r2=>setTimeout(r2, ms));
    for (let i=0;i<30;i++){ renderGame(); await wait(40); }
    let n = 0; while (O3.warmWait && n++ < 900){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); }
    await wait(1500);
    const reach = o3Reach(), hurry = Math.max(8, O3_W/2 - reach); return { reach, hurry }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
  const r = await page.evaluate(async ()=>{
    const best = 40, dirX = G.owPos.x < OW_COLS/2 ? 1 : -1;   /* (the position is driven straight across the map - what the land rebuild answers to) */
    let loadWarms = 0, slices = 0, worstSlice = 0, builds = 0; const oc = gfxCompileSliced; gfxCompileSliced = function(V, r2, sc, cam, grp, live){ if (V===O3 && !live) loadWarms++; return oc.apply(this, arguments); };
    const os = o3BuildSlice; o3BuildSlice = function(){ const t = performance.now(); try{ return os.apply(this, arguments); } finally { slices++; worstSlice = Math.max(worstSlice, performance.now() - t); } };
    const ob = o3BuildStart; o3BuildStart = function(){ builds++; return ob.apply(this, arguments); };
    const x0 = G.owPos.x, d = []; let last = performance.now(); const t0 = last, steps = ()=>Math.abs(G.owPos.x - x0);
    await new Promise(res=>{ const f = t=>{ d.push(t - last); last = t; if (d.length % 5===0 && steps() < best){ G.owPos.x += dirX; G.player.turnCount = (G.player.turnCount||0) + 1; }
      renderGame(); if (t - t0 < 50000 && steps() < best) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    for (let i=0;i<40 && O3.pend;i++){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); }
    gfxCompileSliced = oc; o3BuildSlice = os; o3BuildStart = ob;
    d.shift(); d.sort((a, b)=>a-b);
    return { best, walked:steps(), builds, slices, worstSlice:Math.round(worstSlice), loadWarms, p95:Math.round(d[Math.floor(d.length*0.95)]) }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
  console.log(JSON.stringify(Object.assign(r0, r)));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(Object.assign(r0, r))); };
  A(r.walked >= 25 && r.builds >= 1, 'walked far enough to rebuild the land');
  A(r.loadWarms===0, 'no whole-scene loading warm-up mid-walk');
  A(r.worstSlice < 250, 'no land-build slice froze the walk (the hurry used to finish the build in one frame, ~1s)');
};
