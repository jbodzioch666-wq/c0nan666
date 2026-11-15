// (probe, not in ALL) the first kill and the first raised minion of a session, with the real warm-up on: the longest frames after each,
// what was sculpted (m3dSculpt keys and the skeleton's build), how many shader programs were compiled, and a CPU profile of each
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 5000));
    window.__sculpts = []; const os = m3dSculpt; window.m3dSculpt = function(key){ const had = M3D.sculpt && M3D.sculpt.has(key + (M3D_COARSE!==1 ? '|c' + M3D_COARSE : '')); const t = performance.now(); try{ return os.apply(this, arguments); } finally { if (!had) window.__sculpts.push([String(key).slice(0, 50), +(performance.now() - t).toFixed(1)]); } };
    const ob = sk3Build; window.sk3Build = function(){ const t = performance.now(); try{ return ob.apply(this, arguments); } finally { window.__sculpts.push(['sk3Build', +(performance.now() - t).toFixed(1)]); } }; });
  const cdp = await page.context().newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval:200 });
  const measure = async (label, act)=>{ await cdp.send('Profiler.start');
    const r = await page.evaluate(async ([label, act])=>{ window.__sculpts.length = 0; const R = FPD.r, p0 = R.info.programs.length;
      new Function(act)(); const fr = [], rebuilds = []; let last = performance.now(), ft0 = FPD.ftile; for (let i=0;i<(window.__nfr||150);i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(+(t - last).toFixed(1)); last = t; { const mi = R.info.memory, key = mi.textures + '/' + mi.geometries + '/' + R.info.programs.length; if (key!==window.__mk){ (window.__mlog = window.__mlog || []).push([i, fr[i], key]); window.__mk = key; } } if (FPD.ftile!==ft0){ const diff = []; if (ft0) for (let k=0;k<ft0.length;k++) if (ft0[k]!==FPD.ftile[k]) diff.push(k + ':' + ft0[k] + '>' + FPD.ftile[k]); rebuilds.push({ frame:i, ms:fr[i], diff:diff.slice(0, 6) }); ft0 = FPD.ftile; } }
      const ml = (window.__mlog||[]).slice(); window.__mlog = []; return { label, ml, rebuilds, worstAt:fr.indexOf(Math.max(...fr)), worst:Math.max(...fr), first8:fr.slice(0, 8), slow:fr.filter(x=>x > 30).length, programs:R.info.programs.length - p0, sculpts:window.__sculpts.slice(0, 12) }; }, [label, act]);
    const { profile } = await cdp.send('Profiler.stop'); if (!r) return; const self = new Map(), dt = profile.timeDeltas, byId = new Map(profile.nodes.map(n=>[n.id, n]));
    for (let i=0;i<profile.samples.length;i++){ const n = byId.get(profile.samples[i]), k = n.callFrame.functionName + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k)||0) + (dt[i]||0)); }
    r.top = [...self.entries()].filter(e=>!/idle/.test(e[0])).sort((a, b)=>b[1] - a[1]).slice(0, 16).map(([k, v])=>k + ' ' + (v/1000).toFixed(1)); console.log(JSON.stringify(r)); };
  if (process.env.ZNOKILL) await page.evaluate(()=>{ window.m3dKill = ()=>{}; });   /* (no death animation: is it the corpse?) */
  if (process.env.ZNOSFX) await page.evaluate(()=>{ window.sfx = ()=>{}; window.audEnv = ()=>{}; });
  if (process.env.ZPRE) await page.evaluate(async w=>{ if (w==='drop') xpDrop('attack', 3); if (w==='track') xpTrack('attack', 3); if (w==='tk') tkOnXp('attack', 3); if (w==='render') renderGame(); for (let i=0;i<240;i++) await new Promise(r=>requestAnimationFrame(r)); }, process.env.ZPRE);
  if (process.env.ZPREXP) await page.evaluate(async ()=>{ for (const k of ['attack','strength','defence','hitpoints','magic','ranged','slayer']) skGainXP(k, 1); for (let i=0;i<240;i++) await new Promise(r=>requestAnimationFrame(r)); });   /* (the XP tracker already up) */
  if (process.env.ZNFR) await page.evaluate(n=>{ window.__nfr = n; }, +process.env.ZNFR);
  if (process.env.ZACH) await page.evaluate(()=>{ G.player.achievements = ACHIEVEMENTS.map(a=>a.id); });
  await measure('first kill', `const m = G.mon.find(m=>m.alive); m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m); noteFoe(i); monsterDies(i);`);
  await page.waitForTimeout(1500);
  await measure('second kill', `const m = G.mon.find(m=>m.alive); m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m); noteFoe(i); monsterDies(i);`);
  await page.waitForTimeout(1500);
  await measure('first skeleton raised', `G.player.skills.necromancy = SK_XP[60]; rsSync && rsSync(); skAdd(RS_BONES[0][0], 5); necroRaise('skeleton');`);
  await page.waitForTimeout(1500);
  await measure('first ghost raised', `necroRaise('ghost');`);
};
