// (probe, not in ALL) a beast's ragdoll body balls after the atlas merge (ZMON, default wolf): what the body measure sees
module.exports = async page=>{
  const r = await page.evaluate(async ([nm, process_env_freeze])=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); FP.dt = 0.05; const out = {}, T = THREE;
    const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true }; const pt = m3dPortrait(m), e = m3dInstance(m, pt); const g = new THREE.Group(); g.add(e.holder); const r = e.rig;
    e.holder.updateMatrixWorld(true);
    out.rig = { body:r.body && (r.body.isMesh ? 'mesh' : r.body.type), chest:r.chest && (r.chest.isMesh ? 'mesh' : r.chest.type), bodyKids:r.body ? r.body.children.map(c=>(c.isMesh ? 'M' : 'G') + ':' + c.name + (c.visible ? '' : '(hid)')) : null, chestKids:r.chest ? r.chest.children.map(c=>(c.isMesh ? 'M' : 'G') + ':' + c.name + (c.visible ? '' : '(hid)')) : null };
    out.meshes = []; e.root.traverse(o=>{ if (!o.isMesh) return; const d = { n:o.name, sk:!!o.isSkinnedMesh, vis:o.visible, v:o.geometry.attributes.position.count, atlas:!!o.material.userData.atlas };
      if (o.isSkinnedMesh && o.skeleton){ const si = o.geometry.attributes.skinIndex, per = {}; for (let i=0;i<si.count;i++){ const b = o.skeleton.bones[si.getX(i)]; const k = b===r.body ? 'BODY' : b===r.chest ? 'CHEST' : (b.name || b.type) + (b.isMesh ? '*' : ''); per[k] = (per[k]||0) + 1; } d.per = per; d.bones = o.skeleton.bones.length; }
      out.meshes.push(d); });
    const s = e.root.scale.y || 1, hw = 0.05; const limbs = r.legs.map(L=>L.up).concat([r.neck, r.head, r.tail]);
    const W = (obj)=>{ const v = new T.Vector3(); obj.localToWorld(v); return e.holder.worldToLocal(v); };
    out.ball = { body:m3dBodyBall(e, [r.body], W(r.body), s, hw*1.6, limbs.concat([r.chest])), chest:m3dBodyBall(e, [r.chest], W(r.chest), s, hw*1.6, limbs), fallback:hw*1.6 };
    if (process_env_freeze){ for (let i=0;i<300;i++){ e.anim && e.anim(r, i/60, 0, 0, 0, 0, e); gfxAutoFreeze(g); } let fz = 0; g.traverse(o=>{ if (o.__afz) fz++; }); out.frozen = fz; }
    M3D.inst.set(m, e); m3dKill(m); for (let i=0;i<140;i++) m3dSweep(); e.holder.updateMatrixWorld(true);
    let low = 9; const v = new T.Vector3(); e.root.traverse(o=>{ if (!o.isMesh || !o.visible) return; const P = o.geometry.attributes.position; for (let i=0;i<P.count;i+=7){ v.fromBufferAttribute(P, i); if (o.isSkinnedMesh) o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); low = Math.min(low, v.y); } });
    out.low = +low.toFixed(3); out.kind = e.dkind; out.chain = e.chain ? { n:e.chain.p.length, rad:e.chain.r ? e.chain.r.slice(0, 6).map(x=>+x.toFixed(3)) : null, keys:Object.keys(e.chain) } : null;
    return out; }, [process.env.ZMON || 'wolf', !!process.env.ZFREEZE]);
  console.log(JSON.stringify(r, null, 1));
};
