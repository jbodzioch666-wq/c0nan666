// (probe, not in ALL) the frames after each of several kills in a dungeon, with the real warm-up on: for each frame its interval and how
// long frameLoop ran on the CPU, so a long frame reads as script (cpu near the interval) or as the GPU / compositor (cpu small)
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 5000));
    const fl = frameLoop; window.__cpu = []; window.frameLoop = function(ts){ const t = performance.now(); try{ return fl.apply(this, arguments); } finally { window.__cpu.push(performance.now() - t); } }; });
  if (process.env.ZOFF) await page.evaluate(w=>{ if (w==='art') window.renderMiniMonsterArt = ()=>{}; if (w==='foe') window.noteFoe = ()=>{}; if (w==='splat') window.fxSplat = ()=>{}; if (w==='hud') window.renderHud = ()=>{}; if (w==='log') window.renderLog = ()=>{}; }, process.env.ZOFF);
  const cdp = await page.context().newCDPSession(page); const ev = []; cdp.on('Tracing.dataCollected', d=>ev.push(...d.value));
  const done = new Promise(r=>cdp.on('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { categories:'devtools.timeline,disabled-by-default-devtools.timeline,blink,gpu,v8,cc,viz,disabled-by-default-devtools.timeline.frame', transferMode:'ReportEvents' });
  for (let k=0;k<(+process.env.ZK||2);k++){
    const r = await page.evaluate(async ()=>{ const m = G.mon.find(m=>m.alive); if (!m) return null; m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m);
      window.__cpu.length = 0; const t0 = performance.now(); noteFoe(i); monsterDies(i); const kill = performance.now() - t0; const fr = []; let last = performance.now();
      for (let f=0; f<90; f++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(+(t - last).toFixed(1)); last = t; }
      const cpu = window.__cpu.map(x=>+x.toFixed(1)); const slow = []; fr.forEach((v, f)=>{ if (v > 14) slow.push([f, v, cpu[f]]); });
      return { kill:+kill.toFixed(1), slow, worst:Math.max(...fr), cpuWorst:Math.max(...cpu) }; });
    console.log('kill', k + 1, JSON.stringify(r)); await page.waitForTimeout(1500); }
  await cdp.send('Tracing.end'); await done;
  require('fs').writeFileSync(require('path').join(SHOTS, 'zkill-trace.json'), JSON.stringify(ev));
  /* the longest events on any thread, with their names */
  const X = ev.filter(e=>e.ph==='X' && e.dur > 8000).sort((a, b)=>b.dur - a.dur).slice(0, 40);
  const th = {}; for (const e of ev) if (e.ph==='M' && e.name==='thread_name') th[e.pid + ':' + e.tid] = e.args.name;
  for (const e of X) console.log((e.dur/1000).toFixed(1) + 'ms', th[e.pid + ':' + e.tid] || e.tid, e.name, JSON.stringify(e.args && (e.args.data || e.args)).slice(0, 160), ((e.ts - X[0].ts)/1000).toFixed(0));
};
