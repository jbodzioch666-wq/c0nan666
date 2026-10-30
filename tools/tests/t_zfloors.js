// (probe, not in ALL) going down floor by floor: the wall time, the longest main-thread task and the fresh programs of each floor, with
// a CPU profile's long runs (over 200ms) and their top inclusive functions, so a freeze on a deeper floor can be laid at a function.
// ZFLOORS how many floors below the first (default 5)
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:500 });
  await page.evaluate(()=>{ window.__noWarmSlice = 0; });
  await cdp.send('Profiler.start');
  const r = await page.evaluate(async nf=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    const lt = []; new PerformanceObserver(l=>{ for (const e of l.getEntries()) lt.push([Math.round(e.duration), e.startTime]); }).observe({ entryTypes:['longtask'] });
    window.__tl = []; for (const nm of ['fpdRender', 'fpdPrepStep', 'fpdWarm', 'gfxPrelink', 'fpdBuild', 'gfxCompileSliced', 'gfxWarmStep', 'm3dTemplate', 'm3dTemplateTry', 'loadLevel', 'generateLevel', 'dressLevel', 'saveLevelCache', 'gfxFpdBuild', 'fpdMaterial', 'gfxPadLights', 'fpdWarmDone', 'sk3Init', 'm3dSculpt', 'gfxWarmShadows', 'gfxWarmRender', 'gfxWarmAo', 'gfxPrelink', 'gfxCompileSliced', 'fpdWarmDone', 'isoSyncPlayer', 'm3dPlayerBuild']){ const f = window[nm]; if (typeof f!=='function') continue; window[nm] = function(){ const t = performance.now(); try{ return f.apply(this, arguments); } finally { const dt = performance.now() - t; if (dt > 40) window.__tl.push([nm, +dt.toFixed(0), +(t - window.__t0).toFixed(0)]); } }; }
    const enter = async ()=>{ const t0 = performance.now(); window.__t0 = t0; renderGame(); let n = 0; while ((FPD.warmWait || FPD.prep || FPD.prelink) && n++ < 4000){ await new Promise(r3=>requestAnimationFrame(r3)); renderGame(); }
      for (let i=0;i<4;i++){ renderGame(); await new Promise(r3=>setTimeout(r3, 30)); }
      const mine = lt.filter(e=>e[1] >= t0 - 5); return { ms:Math.round(performance.now() - t0), task:Math.max(0, ...mine.map(e=>e[0])), tasks:mine.map(e=>e[0]), tl:window.__tl.splice(0), depth:G.depth, theme:FPD.theme, mons:[...new Set(G.mon.filter(m=>m.alive).map(m=>m.name))].slice(0, 12), progs:FPD.r.info.programs.length }; };
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const floors = [await enter()];
    for (let f=0;f<nf;f++){ saveLevelCache(G.depth); loadLevel(G.depth+1, false); setUi('playing'); floors.push(await enter()); }
    return floors; }, +(process.env.ZFLOORS || 5));
  for (const f of r) console.log(JSON.stringify(f));
  const { profile } = await cdp.send('Profiler.stop'); const nodes = new Map(profile.nodes.map(n=>[n.id, n])), parent = new Map(); for (const n of profile.nodes) for (const c of (n.children||[])) parent.set(c, n.id);
  let run = [], t = profile.startTime, t0r = 0; const longs = [];
  const flush = ()=>{ if (run.length){ const dur = (run[run.length-1][0] - t0r)/1000; if (dur > 200){ const inc = new Map(); for (const [, id] of run){ const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); inc.set(f, (inc.get(f)||0) + 1); } } longs.push([+dur.toFixed(0), [...inc.entries()].sort((a,b)=>b[1]-a[1]).slice(3, 26).map(([f, v])=>f + ' ' + (v*0.5).toFixed(0))]); } } run = []; };
  profile.samples.forEach((id, i)=>{ t += profile.timeDeltas[i]; const nm = nodes.get(id).callFrame.functionName; if (nm==='(idle)' || nm==='(program)' || nm==='(garbage collector)'){ if (nm==='(idle)') flush(); return; } if (!run.length) t0r = t; run.push([t, id]); }); flush();
  for (const l of longs) console.log('long', JSON.stringify(l));
};
