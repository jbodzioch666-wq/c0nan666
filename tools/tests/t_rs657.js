// RS-657: the town's hitches. (1) A cloak's forty settling steps, when a cloaked figure first comes near you, run a few milliseconds a
// frame instead of all in one frame (15-40ms a figure); stepped by hand, as the cloth tests do, they still settle at once. (2) The shadow
// passes' own programs (a depth and a distance material for plain, skinned and instanced casters) are linked in the prelink with the
// scene's, so a room's first torch shadow links none mid-walk (it took ~100ms in one frame)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V3.warmWait && !V3.prelink && performance.now() - t0 > 2000) break; }
    const out = {};
    /* (1) a cloaked figure beside you: its first frame settles a budgeted few steps, the rest over the next frames */
    { const pt = m3dPortrait({ nm:'warlord' }), e = m3dInstance({ nm:'warlord' }, pt), c = e.rig.cape; V3.world.add(e.holder); e.holder.position.copy(V3.player.g.position).add(new THREE.Vector3(0.6, 0, 0)); e.holder.updateMatrixWorld(true);
      m3dPoseHumanoid(e.rig, 0.7, 0, 0, 0, 0, e); const t1 = performance.now(); m3dCapeCloth(c, e.rig); const first = performance.now() - t1, u = c.userData, pre1 = u.pre;
      let frames = 0; while (u.pre > 0 && frames < 30){ await fr(1); m3dPoseHumanoid(e.rig, 0.7 + frames/60, 0, 0, 0, 0, e); m3dCapeCloth(c, e.rig); frames++; }
      const P = u.P, R = u.rest; let drop = 0; for (let i=0;i<P.length;i+=3) drop = Math.max(drop, Math.abs(P[i+1] - R[i+1]) + Math.abs(P[i+2] - R[i+2]));   /* (it has hung: no point still where it was cut) */
      out.cape = { first:+first.toFixed(1), pre1, frames, pre:u.pre, settled:!!u.P, drop:+drop.toFixed(3) };
      /* by hand, as the cloth tests step it: settled at once */
      const e2 = m3dInstance({ nm:'warlord' }, pt), c2 = e2.rig.cape; e2.holder.updateMatrixWorld(true); m3dPoseHumanoid(e2.rig, 0.7, 0, 0, 0, 0, e2); m3dCapeCloth(c2, e2.rig, 1/60); out.hand = { pre:c2.userData.pre, settled:!!c2.userData.P };
      V3.world.remove(e.holder); }
    /* (2) the shadow kinds: the stand-ins compiled, and a room's first shadow warm links no program */
    { const R = V3.renderer, sc = gfxShadowKinds(V3.scene); let kinds = 0, withProg = 0; sc.traverse(o=>{ if (o.material){ kinds++; const pr = R.properties.get(o.material); if (pr && pr.currentProgram) withProg++; } });
      const ws = gfxWarmShadows, log = []; window.gfxWarmShadows = function(r2){ const before = new Set(r2.info.programs), t1 = performance.now(); ws.apply(this, arguments); const fresh = r2.info.programs.filter(p=>!before.has(p)); log.push({ ms:+(performance.now() - t1).toFixed(0), fresh:fresh.length, keys:fresh.map(p=>{ const a = p.cacheKey.split(','); let best = null; sc.traverse(o=>{ const pr = o.material && r2.properties.get(o.material), kp = pr && pr.currentProgram; if (!kp) return; const b = kp.cacheKey.split(','), d = []; for (let j=0;j<Math.max(a.length, b.length);j++) if (a[j]!==b[j]) d.push(j + ':' + String(a[j]).slice(0, 30) + '|' + String(b[j]).slice(0, 30)); if (!best || d.length < best.length) best = d; }); return a[0] + ' vs nearest kind: ' + (best||[]).slice(0, 10).join(' '); }) }); };
      enterInterior('tavern'); setUi('playing'); const t2 = performance.now(); while (performance.now() - t2 < 20000){ await fr(1); if (!V3.warmWait && !V3.prelink && performance.now() - t2 > 1500) break; }
      window.gfxWarmShadows = ws; out.shadow = { kinds, withProg, log, prelink:!!gfxPscExt(R) }; }
    /* (3) folk made mid-play (the town's people queue, started over) stay unseen while the live warm-up links their programs, then show */
    { exitInterior(); setUi('playing'); const t3 = performance.now(); while (performance.now() - t3 < 20000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t3 > 1500) break; }
      for (const p of V3.villagers.slice()){ if (p.g.parent) p.g.parent.remove(p.g); if (p.plate) p.plate.remove(); } V3.villagers.length = 0; V3.plates = V3.plates.filter(q=>q.el.isConnected); M3D.tpl.clear(); V3.renderer.__warmKinds = null; V3.renderer.__warmSeen = null;   /* (their templates and the warm's memory forgotten, so the newcomers need a warm-up) */
      v3BuildPeople(V3.world); const u = { hidden:0, shownWhileWarm:0, frames:0, unveiled:0 };
      while (performance.now() - t3 < 40000){ await fr(1); u.frames++; if (V3.unveil){ for (const h of V3.unveil){ if (!h.visible) u.hidden++; } if (V3.warmWait || V3.prelink) u.shownWhileWarm += V3.unveil.filter(h=>h.visible).length; } if (!V3.peopleQ && !V3.unveil && !V3.warmWait && !V3.prelink) break; }
      u.visible = V3.villagers.filter(p=>p.g.visible).length; u.folk = V3.villagers.length; u.leftHidden = V3.villagers.filter(p=>!p.g.visible).length; out.unveil = u; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.cape.settled && r.cape.pre1 > 0 && r.cape.pre1 < 40 && r.cape.pre===0 && r.cape.frames >= 1 && r.cape.frames <= 30, 'the cloak settles over a few frames, not all in one: ' + JSON.stringify(r.cape));
  A(r.cape.first < 12, 'its first frame is budgeted (' + r.cape.first + 'ms)');
  A(r.cape.drop > 0.002, 'and it has hung by the end');
  A(r.hand.settled && !r.hand.pre, 'stepped by hand it settles at once');
  A(r.shadow.kinds >= 4 && r.shadow.withProg===r.shadow.kinds, 'the shadow passes\' stand-in kinds have their programs: ' + JSON.stringify(r.shadow));
  if (r.shadow.prelink) A(r.shadow.log.length >= 1 && r.shadow.log.every(l=>l.fresh===0), 'a room\'s first shadow warm links no program: ' + JSON.stringify(r.shadow.log));
  A(r.unveil.folk > 0 && r.unveil.leftHidden===0 && r.unveil.shownWhileWarm===0, 'folk made mid-play are kept unseen while their programs link, then all shown: ' + JSON.stringify(r.unveil));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
