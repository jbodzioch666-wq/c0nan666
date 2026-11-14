// (probe, not in ALL) RS-505's walk with a CPU profile of its build slices and the slowest slice's own parts timed
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
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 }); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:500 }); await cdp.send('Profiler.start');
  const r = await page.evaluate(async ()=>{
    const best = 40, dirX = G.owPos.x < OW_COLS/2 ? 1 : -1;   /* (the position is driven straight across the map - what the land rebuild answers to) */
    let loadWarms = 0, slices = 0, worstSlice = 0, builds = 0; const oc = gfxCompileSliced; gfxCompileSliced = function(V, r2, sc, cam, grp, live){ if (V===O3 && !live) loadWarms++; return oc.apply(this, arguments); };
    const sw = o3BuildSwap; let swapMs = 0; o3BuildSwap = function(){ const t = performance.now(); try{ return sw.apply(this, arguments); } finally { swapMs = Math.max(swapMs, performance.now() - t); } }; window.__swapMs = ()=>swapMs;
    const os = o3BuildSlice; o3BuildSlice = function(){ const t = performance.now(); try{ return os.apply(this, arguments); } finally { slices++; worstSlice = Math.max(worstSlice, performance.now() - t); } };
    const ob = o3BuildStart; o3BuildStart = function(){ builds++; return ob.apply(this, arguments); };
    const x0 = G.owPos.x, d = []; let last = performance.now(); const t0 = last, steps = ()=>Math.abs(G.owPos.x - x0);
    await new Promise(res=>{ const f = t=>{ d.push(t - last); last = t; if (d.length % 5===0 && steps() < best){ G.owPos.x += dirX; G.player.turnCount = (G.player.turnCount||0) + 1; }
      renderGame(); if (t - t0 < 50000 && steps() < best) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    for (let i=0;i<40 && O3.pend;i++){ await new Promise(r2=>requestAnimationFrame(r2)); renderGame(); }
    gfxCompileSliced = oc; o3BuildSlice = os; o3BuildStart = ob;
    d.shift(); d.sort((a, b)=>a-b);
    o3BuildSwap = sw; return { swapMs:Math.round(window.__swapMs()), best, walked:steps(), builds, slices, worstSlice:Math.round(worstSlice), loadWarms, p95:Math.round(d[Math.floor(d.length*0.95)]) }; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
  const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n=>[n.id, n]));
  for (let i=0;i<profile.samples.length;i++){ const n = byId.get(profile.samples[i]), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (dt[i]||0)); }
  console.log([...self.entries()].sort((a, b)=>b[1] - a[1]).slice(0, 25).map(([k, v])=>'  ' + k + ' ' + (v/1000).toFixed(0)).join(String.fromCharCode(10)));
  console.log(JSON.stringify(Object.assign(r0, r)));
};
