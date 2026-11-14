// (probe, not in ALL) what raised minions cost a frame in a dungeon: frame times, GPU timers, draw calls, lights and shadow casters with
// none, then ZN (default 4) of kind ZK (default ghost) beside you; and what each minion's figure is made of
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 4000)); });
  const snap = nm=>page.evaluate(async nm=>{ SET.fps = true; PROF.t = {}; PROF.gpuN = 0; const fr = []; let last = performance.now();
    for (let i=0;i<180;i++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - last); last = t; gfxGpuPoll(); }
    fr.sort((a, b)=>a - b); const n = fr.length, R = FPD.r; R.info.autoReset = false; R.info.reset(); renderGame(); const calls = R.info.render.calls, tris = R.info.render.triangles; R.info.autoReset = true;
    let lights = 0, casters = 0, transp = 0; FPD.scene.traverse(o=>{ if (o.isLight && o.visible && o.intensity > 0) lights++; if (o.isMesh && o.visible && o.castShadow) casters++; if (o.isMesh && o.visible && o.material && o.material.transparent) transp++; });
    return { nm, med:+fr[n>>1].toFixed(1), p90:+fr[Math.floor(n*0.9)].toFixed(1), cpu3d:+((PROF.t['3d']||0)/n).toFixed(2), gpu:PROF.gpuN ? +(PROF.t.gpu/PROF.gpuN).toFixed(2) : null, sh:PROF.gpuN ? +((PROF.t.g_shadow||0)/PROF.gpuN).toFixed(2) : null, sc:PROF.gpuN ? +((PROF.t.g_scene||0)/PROF.gpuN).toFixed(2) : null, calls, tris, progs:R.info.programs.length, lights, casters, transp }; }, nm);
  console.log(JSON.stringify(await snap('none')));
  const info = await page.evaluate(async ([k, n])=>{ const L = necroMinions(); for (let i=0;i<n;i++){ const def = NECRO_MINIONS.find(d=>d.k===k) || NECRO_MINIONS[0]; const m = { k:def.k, nm:'your ' + def.nm, col:def.col, atkBonus:1, dmg1:1, dmg2:2, turnsLeft:9999, reach:def.reach||1, drain:0, ghost:def.k==='ghost' }; L.push(m); necroPlace(m); }
    for (let i=0;i<240;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 2000));
    const out = []; for (const m of L){ const px = necroProxy(m), e = M3D.inst.get(px); if (!e){ out.push('no figure'); continue; } let meshes = 0, tris = 0, tr = 0, cast = 0, lights = 0, skinned = 0; const mats = new Set();
      e.holder.traverse(o=>{ if (o.isLight) lights++; if (!o.isMesh) return; meshes++; if (o.isSkinnedMesh) skinned++; if (o.castShadow) cast++; const g = o.geometry; tris += Math.round((g.index ? g.index.count : g.attributes.position.count)/3); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const mm of ms){ mats.add(mm.type + (mm.transparent ? ' T' + (+mm.opacity).toFixed(2) : '') + (mm.depthWrite===false ? ' noDW' : '') + (mm.side===2 ? ' 2side' : '')); if (mm.transparent) tr++; } });
      out.push({ meshes, skinned, tris, transparent:tr, cast, lights, mats:[...mats].slice(0, 6), merged:!!e.merged }); } return { kinds:NECRO_MINIONS.map(d=>d.k), out:out.slice(0, 2) }; }, [process.env.ZK || 'ghost', +(process.env.ZN || 4)]);
  console.log(JSON.stringify(info));
  for (let i=0;i<3;i++) console.log(JSON.stringify(await snap('with minions ' + i)));
  await page.screenshot({ path: SHOTS + '/zminion-' + (process.env.ZK || 'ghost') + '.png' });
};
