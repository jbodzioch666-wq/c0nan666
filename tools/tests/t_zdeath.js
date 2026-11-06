// (probe, not in ALL) what a monster's death costs a frame: each of a floor's monsters killed by your blow in turn, the frame times
// for two seconds after each, the slowest frames, and a CPU profile over the deaths
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 }); await cdp.send('Profiler.start');
  const r = await page.evaluate(async ()=>{ const out = [], p = G.player;
    for (const m of G.mon){ if (!m.alive) continue; if (out.length >= 5) break;
      /* bring it beside you, seen, and let it settle */
      m.x = p.x + 1; m.y = p.y; m.ai = 'idle'; for (let i=0;i<40;i++) await new Promise(r=>requestAnimationFrame(r));
      const before = []; let last = performance.now(); for (let i=0;i<30;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); before.push(t - last); last = t; }
      m.hp = 1; G.player.facing = 1; moveDir(1, 0); if (m.alive){ m.hp = 0; const i = G.mon.indexOf(m); noteFoe(i); monsterDies(i); }
      const fr = []; last = performance.now(); for (let i=0;i<120;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(+(t - last).toFixed(1)); last = t; }
      const e = [...M3D.live].find(x=>x.dying >= 0);
      out.push({ nm:m.nm, before:+(before.reduce((a, b)=>a + b, 0)/before.length).toFixed(1), worst:Math.max(...fr), first10:fr.slice(0, 10), slow:fr.filter(x=>x > 25).length, kind:e ? (e.rd ? 'ragdoll' : e.chain ? 'chain' : e.parts ? 'parts' : e.dkind || 'topple') : '?' });
      for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r)); }
    return out; });
  const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n=>[n.id, n]));
  for (let i=0;i<profile.samples.length;i++){ const n = byId.get(profile.samples[i]), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (dt[i]||0)); }
  for (const x of r) console.log(JSON.stringify(x));
  console.log([...self.entries()].sort((a, b)=>b[1] - a[1]).slice(0, 24).map(([k, v])=>'  ' + k + ' ' + (v/1000).toFixed(0)).join('\n'));
};
