// (probe, not in ALL) the shadow passes' programs (RS-657): which programs a room's first shadow warm (gfxWarmShadows) still links, with
// their cache keys against the stand-in kinds' (gfxShadowKinds) - the key segments that differ. ZSAVE a save
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing');
    G.interior = null; const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const t0 = performance.now(); while (performance.now() - t0 < 30000){ await new Promise(r=>setTimeout(r, 50)); if (!V3.warmWait && !V3.prelink && performance.now() - t0 > 3000) break; }
    await new Promise(r=>setTimeout(r, 1000));
    const R = V3.renderer, out = { townProgs:R.info.programs.length, kinds:[] };
    /* the kinds' programs, as the prelink made them */
    const K = gfxShadowKinds(); const kprogs = []; for (const p of R.info.programs) if (/Depth|Distance/.test(p.name)) kprogs.push(p);
    out.kinds = kprogs.map(p=>p.name + ' used ' + p.usedTimes);
    out.shadowKeyed = R.info.programs.filter(p=>/depth|distanceRGBA/i.test(p.cacheKey)).map(p=>'[' + p.name + '] used ' + p.usedTimes + ' ' + p.cacheKey.slice(0, 120));
    out.kindMats = []; K.traverse(o=>{ if (o.material){ const pr = R.properties.get(o.material); out.kindMats.push(o.type + ' ' + o.material.type + ' prog:' + !!(pr && pr.currentProgram) + (pr && pr.currentProgram ? ' key ' + pr.currentProgram.cacheKey.slice(0, 100) : '')); } });
    out.prelinkRan = !!(V3.prelink || V3.__prelinkSeen); out.noPrelink = !!window.__noPrelink; out.ext = !!gfxPscExt(R);
    /* into the tavern, its warm-up watched */
    const ws = gfxWarmShadows, log = []; window.gfxWarmShadows = function(r2, scene, cam){ const before = new Set(r2.info.programs), t1 = performance.now(); ws.apply(this, arguments); const dt = performance.now() - t1; const fresh = r2.info.programs.filter(p=>!before.has(p)); log.push({ ms:+dt.toFixed(0), fresh:fresh.map(p=>p.name), keys:fresh.map(p=>p.cacheKey) }); };
    const pl = gfxPrelink, plog = []; window.gfxPrelink = function(V, r2, scene, cam){ const n0 = r2.info.programs.length; let res, err = null; try{ res = pl.apply(this, arguments); }catch(e){ err = String(e); } plog.push({ res, err, progs:r2.info.programs.length - n0, fog:!!scene.fog, kIn:!!gfxShadowKinds.sc }); return res; };
    enterInterior('tavern'); setUi('playing');
    const t2 = performance.now(); while (performance.now() - t2 < 20000){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); if (!V3.warmWait && !V3.prelink && performance.now() - t2 > 1500) break; }
    window.gfxWarmShadows = ws; window.gfxPrelink = pl; out.plog = plog; out.fogTown = null;
    out.kindMats2 = []; K.traverse(o=>{ if (o.material){ const pr = R.properties.get(o.material); out.kindMats2.push(o.type + '/' + o.material.type + ' key ' + (pr && pr.currentProgram ? pr.currentProgram.cacheKey.split(',').slice(0, 6).join(',') + ' ...' + pr.currentProgram.cacheKey.split(',').slice(-3).join(',') : 'none')); } });
    out.log = log.map(l=>({ ms:l.ms, fresh:l.fresh, keys:l.keys.map(k=>k.slice(0, 160)) }));
    /* the keys: against the kind of the same material name */
    const kkeys = []; for (const p of R.info.programs) if (/^(depth|distanceRGBA),/.test(p.cacheKey)) kkeys.push(['prog used ' + p.usedTimes, p.cacheKey]); K.traverse(o=>{ if (o.material){ const pr = R.properties.get(o.material); if (pr && pr.currentProgram) kkeys.push([o.type + '/' + o.material.type + '/' + o.material.side, pr.currentProgram.cacheKey]); } });
    out.diff = []; for (const l of log) l.keys.forEach((k, i)=>{ const a = k.split(','); let best = null; for (const [lab, kk] of kkeys){ const b = kk.split(','); if (b[0]!==a[0]) continue; const d = []; for (let j=0;j<Math.max(a.length, b.length);j++) if (a[j]!==b[j]) d.push(j + ':' + String(a[j]).slice(0, 50) + '|' + String(b[j]).slice(0, 50)); if (!best || d.length < best[1].length) best = [lab, d]; } out.diff.push(best ? [best[0], best[1].slice(0, 14)] : ['none', a.slice(0, 8)]); });
    return out; }, txt);
  console.log(JSON.stringify({ plog:r.plog, log:r.log.map(l=>({ ms:l.ms, n:l.fresh.length })), diff:r.diff, kinds2:r.kindMats2.slice(0, 3) }));
};
