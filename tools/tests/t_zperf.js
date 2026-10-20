// (probe, not in ALL) frame cost while walking, in each view, with a save (ZSAVE): the land, the save's town (or the spawn town), and a
// dungeon floor. For each: the spread of frame intervals (capped by the screen's refresh), the CPU time of a frame (renderGame and the
// loop around it), the GPU time (the game's own timer queries), draw calls and triangles, and a CPU profile's top functions.
// ZVIEWS=land,town,dungeon picks views; ZSECS the walk's length (default 12)
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), views = (process.env.ZVIEWS || 'land,town,dungeon').split(','), secs = +(process.env.ZSECS || 12);
  await page.evaluate(([w, naf, nvc])=>{ window.__zwarm = w; window.__noAutoFreeze = naf; window.__noVegCull = nvc; }, [+(process.env.ZWARM||0), !!process.env.ZNOAF, !!process.env.ZNOVC]);
  await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing'); }, txt);
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 });
  for (const view of views){
    await page.evaluate(async view=>{
      G.interior = null; const t = G.ow.spawnPos;
      if (view==='land'){ G.gameMode = 0; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing'); }
      else if (view==='town'){ G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.x = tX(10); G.player.y = tY(13); }
      else { G.gameMode = 0; let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd){ bd = d; dx = x; dy = y; } }
        G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(m=>{ m.alive = 0; }); }
      // let it load and settle
      const t0 = performance.now(); while (performance.now() - t0 < 30000){ await new Promise(r=>setTimeout(r, 50)); const V = G.gameMode===3 ? V3 : G.gameMode===0 ? O3 : FPD; if (!V.warmWait && !V.prelink && !(V===FPD && FPD.prep) && performance.now() - t0 > 3000) break; }
      await new Promise(r=>setTimeout(r, 1500 + (+window.__zwarm||0)*1000));
    }, view);
    await cdp.send('Profiler.start');
    const r = await page.evaluate(async ([view, secs])=>{
      SET.fps = true; PROF.t = {}; PROF.gpuN = 0; window.profText = window.profText || (()=>'');
      const fr = [], cpu = []; let last = performance.now(), on = true, calls = 0, tris = 0, nInfo = 0;
      const rg = renderGame; renderGame = function(){ const t = performance.now(); try{ return rg.apply(this, arguments); } finally { cpu.push(performance.now() - t); } };
      const loop = ()=>{ const t = performance.now(); fr.push(t - last); last = t; try{ const R = G.gameMode===3 ? V3.renderer : G.gameMode===0 ? O3.renderer : FPD.r; if (R){ calls += R.info.render.calls; tris += R.info.render.triangles; nInfo++; } }catch(e){} if (on) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
      // walk: a step every 220ms, round a square, turning where it's blocked
      const dirs = [[1,0],[0,1],[-1,0],[0,-1]]; let di = 0, n = 0; const t0 = performance.now();
      while (performance.now() - t0 < secs*1000){ const p = G.gameMode===0 ? G.owPos : G.player, x0 = p.x, y0 = p.y; try{ tryMove(dirs[di][0], dirs[di][1]); }catch(e){} const p2 = G.gameMode===0 ? G.owPos : G.player; n++;
        if ((p2.x===x0 && p2.y===y0) || n % 6===0) di = (di + 1) % 4; if (G.ui!=='playing') setUi('playing'); await new Promise(r=>setTimeout(r, 220)); }
      on = false; renderGame = rg; SET.fps = false; for (let i=0;i<4;i++){ await new Promise(r=>setTimeout(r, 16)); try{ gfxGpuPoll(); }catch(e){} }
      const q = (a, p)=>{ const s = a.slice().sort((x,y)=>x-y); return +s[Math.floor(s.length*p)].toFixed(2); };
      const g = PROF.gpuN || 1;
      return { cpuSeq:cpu.slice(100, 160).map(v=>Math.round(v)), view, mode:G.gameMode, frames:fr.length, fps:+(fr.length/secs).toFixed(0), ivP50:q(fr, 0.5), ivP99:q(fr, 0.99), ivMax:+Math.max(...fr).toFixed(0), cpuP50:q(cpu, 0.5), cpuP90:q(cpu, 0.9), cpuP99:q(cpu, 0.99), gpu:+((PROF.t.gpu||0)/g).toFixed(2), gpuParts:Object.fromEntries(Object.entries(PROF.t).filter(([k])=>k.startsWith('g_')).map(([k, v])=>[k, +(v/g).toFixed(2)])), calls:Math.round(calls/(nInfo||1)), tris:Math.round(tris/(nInfo||1)), px:(()=>{ try{ const R = G.gameMode===3 ? V3.renderer : G.gameMode===0 ? O3.renderer : FPD.r; const v = R.getDrawingBufferSize(new THREE.Vector2()); return [v.x, v.y]; }catch(e){ return null; } })() };
    }, [view, secs]);
    const { profile } = await cdp.send('Profiler.stop');
    const nodes = new Map(profile.nodes.map(n=>[n.id, n])), self = new Map(); let tot = 0;
    profile.samples.forEach((id, i)=>{ const dt = profile.timeDeltas[i]/1000, nm = nodes.get(id).callFrame.functionName || '(anon)'; self.set(nm, (self.get(nm)||0) + dt); tot += dt; });
    /* the slow stretches: runs of busy samples (no idle between) over 12ms, each with its top inclusive functions */
    { const parent = new Map(); for (const n of profile.nodes) for (const c of (n.children||[])) parent.set(c, n.id);
      let run = [], t = profile.startTime, t0r = 0; const longs = [], agg = new Map(); const skip = new Set(['(root)', '(program)', '(garbage collector)', 'frameLoop', 'renderGame', 'w', '(anon)']);
      const flush = ()=>{ if (run.length){ const dur = (run[run.length-1][0] - t0r)/1000; if (dur > 12){ const inc = new Map(); for (const [, id] of run){ const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); inc.set(f, (inc.get(f)||0) + 0.2); } }
        for (const [f, v] of inc) if (!skip.has(f)) agg.set(f, (agg.get(f)||0) + v); longs.push(+dur.toFixed(0)); } } run = []; };
      profile.samples.forEach((id, i)=>{ t += profile.timeDeltas[i]; const nm = nodes.get(id).callFrame.functionName; if (nm==='(idle)'){ flush(); return; } if (!run.length) t0r = t; run.push([t, id]); }); flush();
      r.slow = { n:longs.length, durs:longs.sort((a,b)=>b-a).slice(0, 12), top:[...agg.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 28).map(([f, v])=>f + ' ' + v.toFixed(0)) }; }
    r.topSelf = [...self.entries()].filter(([f])=>f!=='(idle)' && f!=='(program)').sort((a,b)=>b[1]-a[1]).slice(0, 14).map(([f, v])=>f + ' ' + (v/r.frames).toFixed(2));   /* (ms a frame) */
    console.log('perf', JSON.stringify(r));
  }
};
