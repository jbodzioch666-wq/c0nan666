// (probe, not in ALL) a browser trace over the first kill of a session: the longest events on the main thread and the GPU, named
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 5000)); });
  const cdp = await page.context().newCDPSession(page), events = [];
  cdp.on('Tracing.dataCollected', d=>{ for (const e of d.value) events.push(e); });
  await cdp.send('Tracing.start', { traceConfig:{ includedCategories:['devtools.timeline', 'disabled-by-default-devtools.timeline', 'gpu', 'v8', 'blink', 'cc', 'toplevel'] } });
  const r = await page.evaluate(async ()=>{ const m = G.mon.find(m=>m.alive); m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m); noteFoe(i); monsterDies(i);
    const fr = []; let last = performance.now(); for (let i=0;i<40;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(+(t - last).toFixed(1)); last = t; } return fr; });
  const done = new Promise(res=>cdp.once('Tracing.tracingComplete', res)); await cdp.send('Tracing.end'); await done;
  console.log('frames', JSON.stringify(r));
  const long = events.filter(e=>e.ph==='X' && e.dur > 20000).sort((a, b)=>b.dur - a.dur).slice(0, 30);
  for (const e of long) console.log(((e.dur)/1000).toFixed(1) + 'ms', e.cat, e.name, e.tid, JSON.stringify(e.args && e.args.data ? Object.fromEntries(Object.entries(e.args.data).slice(0, 4)) : {}).slice(0, 160));
};
