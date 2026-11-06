// (probe, not in ALL) the user's save on an emulated phone with the CPU slowed 4x: frame times, the meter's split, and a CPU profile's top functions
const fs = require('fs');
module.exports = async page=>{
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const cdp = await page.context().newCDPSession(page);
  await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); setUi('playing'); for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }, txt);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:+(process.env.ZTHR || 4) });
  const walk = !!process.env.ZWALK;
  const stat = await page.evaluate(async walk=>{ SET.fps = true; PROF.t = {}; let n = 0, frames = []; const t0 = performance.now();
    while (performance.now() - t0 < 4000){ const a = performance.now(); renderGame(); frames.push(performance.now() - a); n++; if (walk && n % 12 === 0){ const p = G.player; for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1]]){ if (G.map[p.x+dx] && G.map[p.x+dx][p.y+dy]===T_FLOOR && !dgSolid(p.x+dx, p.y+dy)){ try{ moveDir(dx, dy); }catch(e){} break; } } } await new Promise(r=>requestAnimationFrame(r)); }
    frames.sort((a, b)=>a - b); const t = PROF.t; const out = { n, mode:G.gameMode, site:G.siteKind, depth:G.depth, phone:gfxPhone(), gfx:SET.gfx, ao:gfxAoOn('fpd'), post:gfxPostOn(), p50:+frames[frames.length>>1].toFixed(1), p90:+frames[Math.floor(frames.length*0.9)].toFixed(1), max:+frames[frames.length-1].toFixed(1), d3:+((t['3d']||0)/n).toFixed(2), game:+((t.game||0)/n).toFixed(2), res:RES.lvl, scale:resScale(), mons:G.mon.filter(m=>m.alive).length, props:ISO.props ? ISO.props.size : 0, mist:(FPD.mist||[]).length };
    const info = FPD.r.info.render; out.calls = info.calls; out.tris = info.triangles; return out; }, walk);
  console.log('stat', JSON.stringify(stat));
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 }); await cdp.send('Profiler.start');
  await page.evaluate(async walk=>{ const t0 = performance.now(); let n = 0; while (performance.now() - t0 < 3000){ renderGame(); n++; if (walk && n % 12 === 0){ const p = G.player; for (const [dx, dy] of [[1,0],[0,1],[-1,0],[0,-1]]){ if (G.map[p.x+dx] && G.map[p.x+dx][p.y+dy]===T_FLOOR && !dgSolid(p.x+dx, p.y+dy)){ try{ moveDir(dx, dy); }catch(e){} break; } } } await new Promise(r=>requestAnimationFrame(r)); } }, walk);
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map(), byId = new Map(profile.nodes.map(n=>[n.id, n])); const dt = profile.timeDeltas; const cnt = new Map(); for (const s of profile.samples) cnt.set(s, (cnt.get(s)||0) + 1);
  for (const n of profile.nodes){ const k = (n.callFrame.functionName || '(anon)') + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (cnt.get(n.id)||0)); }
  const total = profile.samples.length; console.log('top', JSON.stringify([...self.entries()].sort((a, b)=>b[1] - a[1]).slice(0, 30).map(([k, v])=>k + ' ' + (v/total*100).toFixed(1) + '%')));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
};
module.exports.mobile = true;
