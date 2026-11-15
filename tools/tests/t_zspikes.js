// (probe, not in ALL) the town's slow frames while walking (ZSAVE a save; ZSECS the walk, default 10; ZVIEW town|land|dungeon): every
// v3/o3/m3d/gfx/fpd function is wrapped, and for each frame over 16ms the probe prints the wrapped calls that took over 2ms inside it
// (inclusive, so a caller and its callee both show), with the frame's total - what each spike is made of
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), secs = +(process.env.ZSECS || 10), view = process.env.ZVIEW || 'town';
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:300 }); await cdp.send('Profiler.start');
  const r = await page.evaluate(async ([txt, secs, view])=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing');
    G.interior = null; const t = G.ow.spawnPos;
    if (view==='land'){ G.gameMode = 0; G.owPos = { x:t.x, y:t.y + 3 }; setUi('playing'); }
    else if (view==='town'){ G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.x = tX(10); G.player.y = tY(13); }
    const t0 = performance.now(); while (performance.now() - t0 < 30000){ await new Promise(r=>setTimeout(r, 50)); const V = G.gameMode===3 ? V3 : G.gameMode===0 ? O3 : FPD; if (!V.warmWait && !V.prelink && !(V===FPD && FPD.prep) && performance.now() - t0 > 3000) break; }
    await new Promise(r=>setTimeout(r, 1500));
    /* wrap */
    const names = Object.getOwnPropertyNames(window).filter(n=>/^(v3|o3|m3d|gfx|fpd|fp|town|sk3|iso)[A-Za-z0-9_]*$/.test(n) && typeof window[n]==='function' && !/^(renderGame|gfxRender|gfxRenderInner|v3Render|o3Render|fpdRender)$/.test(n));
    let cur = null; const W = new Map();
    for (const n of names){ const f = window[n]; if (f.prototype && Object.keys(f.prototype).length) continue; const w = function(){ const t = performance.now(); try{ return f.apply(this, arguments); } finally { const dt = performance.now() - t; if (cur && dt > 2) cur.push([n, +dt.toFixed(1)]); } }; W.set(n, f); window[n] = w; }
    /* the driver's link waits: a getProgramParameter that blocks is a program asked for before its link was done */
    const stalls = [], gp = WebGL2RenderingContext.prototype.getProgramParameter; WebGL2RenderingContext.prototype.getProgramParameter = function(prog, pname){ const t = performance.now(), v = gp.call(this, prog, pname); const dt = performance.now() - t; if (dt > 4) stalls.push([+dt.toFixed(0), pname, prog, +((t - tw)/1000).toFixed(1)]); return v; };
    const spikes = []; let frames = 0, last = performance.now(), on = true; const R0 = view==='town' ? V3.renderer : view==='land' ? O3.renderer : FPD.r, progs0 = new Set(R0.info.programs);
    const rg = renderGame; renderGame = function(){ const t = performance.now(); cur = []; try{ return rg.apply(this, arguments); } finally { const dt = performance.now() - t; frames++; if (dt > 16) spikes.push({ ms:+dt.toFixed(0), at:+((t - tw)/1000).toFixed(1), in:cur.slice(0, 14) }); cur = null; } };
    const tw = performance.now();
    /* the walk: back and forth */
    const dirs = view==='town' ? [[0,-1],[1,0],[0,1],[-1,0]] : [[0,1],[1,0],[0,-1],[-1,0]]; let k = 0, step = 0;
    const walker = setInterval(()=>{ if (!on) return; try{ const dd = dirs[k % 4]; if (view==='dungeon'){ if (G.player) handlePlayingKey(dd[1] > 0 ? 'ArrowDown' : dd[1] < 0 ? 'ArrowUp' : dd[0] > 0 ? 'ArrowRight' : 'ArrowLeft'); } else moveDir(dd[0], dd[1]); }catch(e){} if (++step % 12===0) k++; }, 220);
    await new Promise(r=>setTimeout(r, secs*1000)); on = false; clearInterval(walker);
    renderGame = rg; for (const [n, f] of W) window[n] = f; WebGL2RenderingContext.prototype.getProgramParameter = gp;
    /* programs made during the walk: each with its shader and a material drawn with it, if one is still in the scene */
    const sc = view==='town' ? V3.scene : view==='land' ? O3.scene : FPD.scene, fresh = R0.info.programs.filter(p=>!progs0.has(p)).map(p=>{ let who = ''; sc.traverse(o=>{ if (who || !o.material) return; for (const m of [].concat(o.material)){ const pr = R0.properties.get(m); if (pr && pr.currentProgram===p) who = (o.name || o.type) + '/' + m.type + (m.name ? ':' + m.name : '') + (m.userData && m.userData.atlas ? ' atlas' : ''); } }); return p.cacheKey.split(',')[0] + ' used ' + p.usedTimes + ' ' + who; });
    const who = p=>{ let w = ''; sc.traverse(o=>{ if (w || !o.material) return; for (const m of [].concat(o.material)){ const pr = R0.properties.get(m); if (pr && pr.currentProgram===p) w = (o.name || o.type) + '/' + m.type + (m.name ? ':' + m.name : ''); } }); return w; };
    const stallList = stalls.map(([dt, pn, prog, at])=>{ const p = R0.info.programs.find(q=>q.program===prog); return dt + 'ms @' + at + 's ' + (p ? p.cacheKey.split(',')[0] + ' ' + who(p) : 'program gone'); });
    return { view, frames, spikes, fresh, stalls:stallList }; }, [txt, secs, view]);
  console.log('link stalls', JSON.stringify(r.stalls));
  console.log('fresh programs', JSON.stringify(r.fresh));
  console.log('frames', r.frames, 'spikes', r.spikes.length, 'view', r.view);
  for (const s of r.spikes) console.log(s.ms + 'ms @' + s.at + 's  ' + s.in.map(([n, d])=>n + ' ' + d).join(' | '));
  /* the CPU profile's busy runs over 30ms, each with its top inclusive functions - for the spikes the wrappers can't see (three's own compiles, GC) */
  const { profile } = await cdp.send('Profiler.stop'); const nodes = new Map(profile.nodes.map(n=>[n.id, n])), parent = new Map(); for (const n of profile.nodes) for (const c of (n.children||[])) parent.set(c, n.id);
  let run = [], t = profile.startTime, t0r = 0; const longs = [];
  const flush = ()=>{ if (run.length){ const dur = (run[run.length-1][0] - t0r)/1000; if (dur > 30){ const inc = new Map(); for (const [, id] of run){ const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); inc.set(f, (inc.get(f)||0) + 1); } } longs.push([+dur.toFixed(0), [...inc.entries()].sort((a,b)=>b[1]-a[1]).slice(2, 24).map(([f, v])=>f + ' ' + (v*0.3).toFixed(0))]); } } run = []; };
  profile.samples.forEach((id, i)=>{ t += profile.timeDeltas[i]; const nm = nodes.get(id).callFrame.functionName; if (nm==='(idle)' || nm==='(program)' || nm==='(garbage collector)'){ if (nm==='(idle)') flush(); return; } if (!run.length) t0r = t; run.push([t, id]); }); flush();
  for (const l of longs) console.log('busy', JSON.stringify(l));
};
