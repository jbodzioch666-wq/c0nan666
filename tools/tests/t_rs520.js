// RS-520: a creature kind never seen before is built over frames without the frame-long hitches. A sculpt is itself spread
// over frames (its parts splatted a layer at a time, then meshed a layer at a time), and the build runs once as a survey
// rather than every frame - so at a phone's pace no try goes long, the build runs a handful of times, and the shape made in
// slices is the very one made in one go
module.exports = async page=>{
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; for (let i=0;i<10;i++){ renderGame(); await new Promise(r2=>setTimeout(r2, 40)); } });
  const cdp = await page.context().newCDPSession(page);
  const r = await page.evaluate(()=>{ const out = {};
    /* the same sculpt, made in slices and in one go, is the same shape */
    const key = 'rs520probe', b = [[-0.2, -0.1, -0.15], [0.2, 0.4, 0.15]], build = P=>{ P.add(SDF.ell([0, 0.1, 0], [0.15, 0.2, 0.1]), 0.03, 1); P.add(SDF.sph([0.08, 0.3, 0.05], 0.06), 0.02, 2); P.sub(SDF.sph([0, 0, 0.09], 0.05), 0.01); };
    const one = m3dSculpt(key + 'a', b, 0.004, build); let tries = 0, sl = null; M3D.sculptN = 0;
    while (!sl && tries++ < 5000){ M3D_BUDGET = performance.now() + 0.3; M3D.sculptN = 0; try{ sl = m3dSculpt(key + 'b', b, 0.004, build); }catch(e){ if (e!==M3D_YIELD) throw e; } finally { M3D_BUDGET = 0; } }
    const A1 = one.attributes.position.array, A2 = sl.attributes.position.array; let same = A1.length===A2.length && one.index.count===sl.index.count; if (same) for (let i=0;i<A1.length;i++) if (A1[i]!==A2[i]){ same = false; break; }
    out.same = same; out.sliceTries = tries; return out; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:4 });
  const r2 = await page.evaluate(async ()=>{ const out = {};
    /* a kind never built, none of its sculpts made or kept: built a few ms a frame */
    const nm = 'hobgoblin', pt = m3dPortrait({ nm }); M3D_COARSE = 1.7; M3D_LOOSE = true; const key = m3dTplKey(pt); M3D_COARSE = 1; M3D_LOOSE = false;
    M3D.tpl.delete(key); M3D.sculpt.clear(); SCULPT_DB.map.clear(); const db = SCULPT_DB.db; SCULPT_DB.db = null;
    const B = m3dBuilders(), f0 = B.get(pt.paint); let runs = 0; B.set(pt.paint, function(){ runs++; return f0.apply(this, arguments); });
    let done = null, n = 0; const d = [];
    while (!done && n++ < 3000){ await new Promise(r=>requestAnimationFrame(r)); const t0 = performance.now(); M3D_COARSE = 1.7; M3D_LOOSE = true;
      const s0 = M3D_TRY.get(key), stg = !s0 ? 'survey' : s0.raw ? 'skin' : s0.jobs && s0.jobs.length ? 'jobs' : 'build'; try{ done = m3dTemplateTry(pt, t0 + 6); } finally { M3D_COARSE = 1; M3D_LOOSE = false; } const dd = performance.now() - t0; d.push(dd); out.stages = out.stages || {}; out.stages[stg] = Math.max(out.stages[stg]||0, Math.round(dd)); }
    B.set(pt.paint, f0); SCULPT_DB.db = db; d.sort((a, b)=>a - b);
    out.done = !!done; out.frames = n; out.runs = runs; out.worst = Math.round(d[d.length-1]); out.p90 = Math.round(d[Math.floor(d.length*0.9)]);
    out.skinned = !!(done && M3D.meta.get(done) && M3D.meta.get(done).skinned > 0); return out; });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate:1 });
  Object.assign(r, r2); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.same && r.sliceTries > 3, 'a sculpt made in slices is the very shape made in one go');
  A(r.done && r.skinned, 'the new kind is built, and skinned');
  A(r.runs <= 6, 'its build ran as a survey and once for real (or a few times) - not once a frame');
  A(r.p90 < 12, 'nearly every try keeps to the few ms it is given');
  A(r.worst < 70, 'and no try comes near the old 80-110ms at a phone\'s pace');
};
