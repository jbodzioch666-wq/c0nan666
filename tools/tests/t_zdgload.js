// (probe, not in ALL) how long a dungeon floor takes to come up from cold (a fresh page): load to the end of the shader warm-up, and the
// longest frame on the way. ZSAVE a save; ZNOPRE=1 turns off the parallel link (RS-571) to compare; ZKIND a site kind (dungeon)
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const prof = !!process.env.ZPROF, cdp = prof ? await page.context().newCDPSession(page) : null;
  if (cdp){ await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:500 }); }
  await page.exposeFunction('__zprofStart', async ()=>{ if (cdp) await cdp.send('Profiler.start'); }).catch(()=>{});
  const r = await page.evaluate(async ([txt, nopre, kind, noprep])=>{ window.__noWarmSlice = false; window.__zNoPrep = noprep; window.__noPrelink = nopre;
    if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); }
    setUi('playing'); saveCurrentGame = ()=>{};
    const OWK = { dungeon:OW_DUNGEON, temple:OW_TEMPLE, graveyard:OW_GRAVEYARD, castle:OW_CASTLE, mine:OW_MINE }[kind] || OW_DUNGEON;
    let dx=-1, dy=-1, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OWK){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd){ bd = d; dx = x; dy = y; } }
    G.interior = null; G.gameMode = 0; G.owPos = { x:dx, y:dy };
    const fr = []; let last = performance.now(), on = true; const loop = ()=>{ const t = performance.now(); fr.push(t - last); last = t; if (on) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    const ext = !!gfxPscExt(FPD.r || { getContext:()=>document.createElement('canvas').getContext('webgl2') });
    window.__preK = []; const gp0 = gfxPrelink; gfxPrelink = function(V, r){ const b = new Set(r.info.programs); const out = gp0.apply(this, arguments); for (const p of r.info.programs) if (!b.has(p)) window.__preK.push(p); return out; };
    await window.__zprofStart();
    window.__tl = []; for (const nm of ['o3Render', 'fpdRender', 'fpdPrepStep', 'fpdWarm', 'gfxPrelink', 'fpdBuild', 'v3Render', 'pmBuild', 'gfxCompileSliced', 'gfxWarmStep', 'isoSyncPlayer', 'm3dTemplate', 'o3Build', 'enterDungeonConfirm', 'loadLevel', 'generateLevel', 'dressLevel', 'saveLevelCache', 'saveCurrentGame', 'fpdWarm', 'isoSyncProps', 'isoSyncVeins', 'gfxFpdBuild']){ const f = window[nm]; if (typeof f!=='function') continue; window[nm] = function(){ const t = performance.now(); try{ return f.apply(this, arguments); } finally { const dt = performance.now() - t; if (dt > 50) window.__tl.push([nm, +dt.toFixed(0), +(t - window.__t0).toFixed(0)]); } }; }
    window.__t0 = performance.now(); if (window.__zNoPrep) fpdPrepStep = ()=>{ FPD.prep = null; return true; };
    const t0 = performance.now(); G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    // the floor is up when its build ran and the warm-up (and the parallel link) are both done
    while (performance.now() - t0 < 60000){ await new Promise(r=>setTimeout(r, 30)); if (FPD.mapRef===G.map && !FPD.prep && !FPD.warmWait && !FPD.prelink) break; }
    const up = performance.now() - t0; await new Promise(r=>setTimeout(r, 1500)); on = false;
    const during = fr.slice(1).sort((a,b)=>b-a);
    return { kind, ext, prelink:!nopre, up:+(up/1000).toFixed(2), worst:+during[0].toFixed(0), next:during.slice(1, 5).map(v=>+v.toFixed(0)), programs:FPD.r.info.programs.length, tl:window.__tl.slice(0, 30), pre:window.__preK.length, unused:window.__preK.filter(p=>p.usedTimes===0 || !FPD.r.info.programs.includes(p)).length, used1:window.__preK.map(p=>p.name+':'+p.usedTimes).slice(0, 50), late:FPD.r.info.programs.filter(p=>!window.__preK.includes(p)).map(p=>p.name) }; }, [txt, !!process.env.ZNOPRE, process.env.ZKIND || 'dungeon', !!process.env.ZNOPREP]);
  console.log('load', JSON.stringify(r));
  if (process.env.ZKEYS){ const keys = await page.evaluate(()=>FPD.r.info.programs.map(p=>{ let who = ''; FPD.scene.traverse(o=>{ if (who || !o.material) return; for (const m of [].concat(o.material)){ const mp = FPD.r.properties.get(m); if (mp && mp.currentProgram===p){ let q = o, path = []; while (q && q!==FPD.scene){ path.unshift(q.name || q.type); q = q.parent; } who = path.slice(-3).join('/') + ' ' + (m.name||''); } } }); return [p.name, p.usedTimes, who, p.cacheKey.length > 500 ? p.cacheKey.slice(0, 40) + '...' + p.cacheKey.slice(-260) : p.cacheKey]; }));
    fs.writeFileSync(process.env.ZKEYS, JSON.stringify(keys, null, 1)); console.log('keys', keys.length); }
  if (process.env.ZSHOT){ await page.evaluate(async ()=>{ G.mon.forEach(m=>{ if (m.alive && Math.hypot(m.x - G.player.x, m.y - G.player.y) > 6) return; }); for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }); await page.screenshot({ path: SHOTS + '/zdgload.png' }); }
  if (cdp){ const { profile } = await cdp.send('Profiler.stop'); const nodes = new Map(profile.nodes.map(n=>[n.id, n])), parent = new Map(); for (const n of profile.nodes) for (const c of (n.children||[])) parent.set(c, n.id);
    const self = new Map(), incl = new Map(); profile.samples.forEach((id, i)=>{ const dt = profile.timeDeltas[i]/1000, nm = nodes.get(id).callFrame.functionName || '(anon)'; self.set(nm, (self.get(nm)||0) + dt); const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); incl.set(f, (incl.get(f)||0) + dt); } });
    const top = (m, k)=>[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0, k).map(([f, v])=>f + ' ' + v.toFixed(0));
    console.log('self', JSON.stringify(top(self, 22))); console.log('incl', JSON.stringify(top(incl, 40)));
    /* the long tasks alone: runs of busy samples over 200ms, each with its top inclusive functions */
    let run = [], t = profile.startTime, t0r = 0; const longs = [];
    const flush = ()=>{ if (run.length){ const dur = (run[run.length-1][0] - t0r)/1000; if (dur > 200){ const inc = new Map(); for (const [, id] of run){ const seen = new Set(); for (let p = id; p!==undefined; p = parent.get(p)){ const f = nodes.get(p).callFrame.functionName || '(anon)'; if (seen.has(f)) continue; seen.add(f); inc.set(f, (inc.get(f)||0) + 1); } } longs.push([+dur.toFixed(0), [...inc.entries()].sort((a,b)=>b[1]-a[1]).slice(3, 22).map(([f, v])=>f + ' ' + (v*0.5).toFixed(0))]); } } run = []; };
    profile.samples.forEach((id, i)=>{ t += profile.timeDeltas[i]; const nm = nodes.get(id).callFrame.functionName; if (nm==='(idle)' || nm==='(program)' || nm==='(garbage collector)'){ if (nm==='(idle)') flush(); return; } if (!run.length) t0r = t; run.push([t, id]); }); flush();
    console.log('long', JSON.stringify(longs)); }
};
