// RS-346: every creature in the bestiary has a 3D model that walks, fights and dies. For each one: moving changes its
// pose (sampled over a stride, so a hop or a slow beat still counts), a wind-up or a strike changes it, and when it's
// killed it topples over (RS-371: rolls onto its side or back as a ragdoll, slumps into a puddle, thins away or falls apart). Serpents slither, oozes heave, floaters lean and bob, crawling eyes and ropers roll, and the
// crocodiles lunge into the bite.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    for (let i=0;i<200 && !(sk3Init() && SK3.ok);i++) await new Promise(r=>setTimeout(r, 50));
    const undead = new Map(); for (const e of MONSTER_LEVELS) if (e && e.nm) undead.set(e.nm, !!e.undead);
    const names = [...new Set([...MONSTER_PORTRAIT_KEYS, ...undead.keys()])];
    const snap = (root)=>{ root.updateMatrixWorld(true); const a = [], v = new THREE.Vector3(); root.traverse(o=>{ if (o.isMesh && o.geometry && o.geometry.attributes.position){ const P = o.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/24)); if (o.isSkinnedMesh) o.skeleton.update(); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i); if (o.isSkinnedMesh) o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); a.push(v.x, v.y, v.z); } } }); return a; };   /* (RS-379: a skinned mesh's vertices are moved by its joints on the card; here they're moved the same way by hand) */
    const diff = (a, b)=>{ let d = 0; for (let i=0;i<Math.min(a.length, b.length);i++) d = Math.max(d, Math.abs(a[i]-b[i])); return d; };
    const out = { n:names.length, noModel:[], noWalk:[], noFight:[], noDeath:[], errs:[], kinds:{} };
    const keepDt = FP.dt; FP.dt = 0.05;
    for (const nm of names){
      const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true, undead:!!undead.get(nm) };
      try{
        let e, kind;
        if (sk3Wanted(m)){ e = sk3Instance(m); kind = 'skeleton'; }
        else { const pt = m3dPortrait(m); if (pt){ e = m3dInstance(m, pt); kind = e.anim ? 'sculpted' : e.beast ? 'beast' : 'humanoid'; } }
        if (!e){ out.noModel.push(nm); continue; }
        out.kinds[kind] = (out.kinds[kind]||0) + 1;
        const rg = e.rig, pose = (t, mv, wind, strike)=>{ e.fol = 0; e.mvS = mv;
          if (kind==='skeleton') sk3Pose(t, mv, strike, 0, e.seed||0, rg, mv ? t*9 : 0);
          else if (e.anim) e.anim(rg, t, mv, wind, strike, 0, e); else if (e.beast) m3dPoseBeast(rg, t, mv, wind, strike, 0, e); else m3dPoseHumanoid(rg, t, mv, wind, strike, 0, e);
          return snap(e.holder); };
        let walk = 0, fight = 0;
        for (const t of [1.0, 1.13, 1.27, 1.41, 1.58]){ e.wph = t*9; const still = pose(t, 0, 0, 0); e.wph = t*9; walk = Math.max(walk, diff(pose(t, 1, 0, 0), still)); fight = Math.max(fight, diff(pose(t, 0, 1, 0), still), diff(pose(t, 0, 0, 1), still)); }
        if (walk < 0.012) out.noWalk.push(nm+' '+walk.toFixed(3));
        if (fight < 0.02) out.noFight.push(nm+' '+fight.toFixed(3));
        // killed: it topples
        FPD.scene && FPD.scene.add(e.holder); if (!e.holder.parent){ const g = new THREE.Group(); g.add(e.holder); }
        M3D.inst.set(m, e); m3dKill(m); for (let i=0;i<140;i++) m3dSweep();   /* (RS-371: a ragdoll takes a moment longer to settle than the old scripted topple) */
        /* (RS-371) fallen: on its side or back - or, for an ooze, slumped into a puddle; a ghost thinned away; a skeleton in pieces */
        const fell = e.dkind==='ooze' ? (e.s0 && e.root.scale.y < e.s0.y*0.3 ? 2 : 0) : e.dkind==='ghost' ? (!e.holder.parent ? 2 : 0) : e.dkind==='bones' ? (e.parts && e.parts.length >= 8 ? 2 : 0)
          : e.chain ? Math.acos(Math.max(-1, Math.min(1, e.chain.upY)))   /* (RS-376: a two-legged body, a chain of joints) */
          : e.rd ? Math.acos(Math.max(-1, Math.min(1, new THREE.Vector3(0, 1, 0).applyQuaternion(e.rd.q).y))) : Math.abs(e.root.rotation.x) + Math.abs(e.root.rotation.z);
        if (!(fell > 1)) out.noDeath.push(nm+' '+fell.toFixed(2)+' '+e.dkind+' '+(e.chain ? 'chain/'+e.chain.rest.toFixed(2)+'/'+e.chain.upY.toFixed(2) : e.rd ? 'rd'+(e.rd.shoves||0)+'/'+e.rd.rest.toFixed(2)+'/'+e.dying.toFixed(2) : 'nord'));
        if (e.holder.parent) e.holder.parent.remove(e.holder); M3D.live.delete(e);
      }catch(err){ out.errs.push(nm+': '+String(err).slice(0, 120)); }
    }
    FP.dt = keepDt;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg+' '+JSON.stringify(r)); };
  A(r.n > 150 && r.errs.length===0, 'every creature builds without an error');
  A(r.noModel.length===0, 'every creature has a 3D model');
  A(r.noWalk.length===0, 'every creature moves when it walks');
  A(r.noFight.length===0, 'every creature moves when it winds up or strikes');
  A(r.noDeath.length===0, 'every creature topples when it dies');
};
