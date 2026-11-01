// (art probe, not in ALL) numbers for the races' sculpted townsfolk: the body's bones and parts, and in each race's town (the model forced on)
// the model's height, head and feet against the drawn figure's
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9; tpFolkOn = ()=>!!tpData(); });
  console.log(await ev(()=>{ const D = TPB.data; return 'BONES ' + D.bones.map((b, i)=>b + '<' + (D.parent[i] < 0 ? '-' : D.bones[D.parent[i]])).join(' ') + '\nPARTS ' + Object.keys(D.parts).map(k=>k + ':' + D.parts[k].inv + ':' + (D.parts[k].n || D.parts[k].pos && D.parts[k].pos.length/3 || '?')).join(' '); }));
  const races = await ev(()=>{ const o = {}; for (const t of townList()){ const f = townFlavorAt(t.x, t.y); if (f && !o[f.race]) o[f.race] = { x:t.x, y:t.y }; } return o; });
  for (const r of (process.env.ZR ? process.env.ZR.split(',') : Object.keys(races))){
    await ev(t=>{ V3.mapRef = null; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; }, races[r]); await wait(2500);
    console.log(r, await ev(()=>{ const T = THREE, D = TPB.data, all = [...(V3.villagers||[]), ...(V3.npcs||[])].filter(p=>p.e && p.e.tp && !(p.v && p.v.animal)).slice(0, 3), W = o=>new T.Vector3().setFromMatrixPosition(o.matrixWorld), out = [];
      for (const p of all){ const e = p.e, tp = e.tp; p.g.updateMatrixWorld(true); const hw = W(e.holder), hs = e.holder.matrixWorld.getMaxScaleOnAxis(), bb = new T.Box3(); for (const m of tp.hide) if (m.geometry){ m.visible = true; bb.expandByObject(m); m.visible = false; }
        const mb = new T.Box3(); for (const m of tp.meshes){ m.computeBoundingBox && m.computeBoundingBox(); const g = m.geometry; g.computeBoundingBox(); }   /* (a skinned mesh's bounds are its bind pose - take the bones instead) */
        const by = D.bones.map((b, i)=>W(tp.bones[i]).y - hw.y); const head = W(tp.bones[D.bones.indexOf('Head')]).y - hw.y, dhead = W(e.rig.head).y - hw.y, foot = Math.min(...['ball_l', 'ball_r', 'foot_l', 'foot_r'].map(n=>D.bones.indexOf(n)).filter(i=>i >= 0).map(i=>by[i]));
        out.push({ look:p.v ? (p.v.look|0) : 'npc', st:(e.stature||p.stature||'?'), hs:+hs.toFixed(3), root:+tp.root.scale.x.toFixed(3), drawnTop:+((bb.max.y - hw.y)/hs).toFixed(3), drawnFoot:+((bb.min.y - hw.y)/hs).toFixed(3), head:+(head/hs).toFixed(3), dhead:+(dhead/hs).toFixed(3), foot:+(foot/hs).toFixed(3), bulk:e.o && e.o.bulk, hsc:e.o && e.o.headScale, kit:tp.kit }); }
      return JSON.stringify(out); })); }
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
