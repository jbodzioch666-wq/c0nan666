// RS-379: every creature template - monsters, the beasts of the open land, your own figure - is skinned into one mesh per
// material once, at the template, so every copy of it is cheap: a copy binds the skinned meshes to its own joints. One
// skeleton per figure; the meshes keep frustum culling, with one generous sphere round the whole figure; a weapon or shield
// is baked into a mesh or two inside its own group, so it still flies from a dead hand; spiders and beetles are skinned too
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { per:{} }, names = ['human knight','goblin warrior','wolf','bear','black dragon wyrmling','giant spider','giant scorpion','tomb scarab','giant constrictor snake','kobold','ogre'];
    const mon = nm=>Object.assign(newMonster(), { alive:1, x:5, y:5, hp:20, maxHp:20, nm, sym:'s', col:'#fff', art:null, abilities:[] });
    for (const nm of names){ const m = mon(nm), pt = m3dPortrait(m); if (!pt){ out.per[nm] = { noPortrait:true }; continue; }
      const tpl = m3dTemplate(pt), meta = M3D.meta.get(tpl), rig = meta.rig, sms = [], skels = new Set(); let meshes = 0, culled = 0, sphOk = 0;
      tpl.traverse(o=>{ if (!o.isMesh) return; meshes++; if (o.isSkinnedMesh){ sms.push(o); skels.add(o.skeleton); if (o.frustumCulled) culled++; const bs = o.geometry.boundingSphere, bb = o.geometry.boundingBox; if (bs && bb && bs.radius >= bb.getBoundingSphere(new T.Sphere()).radius*1.1) sphOk++; } });
      const propMeshes = {}; for (const k of ['weapon','shield']) if (rig && rig[k] && rig[k].isObject3D){ let n = 0, merged = 0; rig[k].traverse(o=>{ if (o.isMesh){ n++; if (o.userData.merged) merged++; } }); propMeshes[k] = [n, merged]; }
      /* a copy has a skeleton of its own, one for all its skinned meshes, whose bones are the copy's own joints */
      const e = m3dInstance(m, pt), cs = new Set(), own = new Set(); e.root.traverse(o=>own.add(o)); let bonesOwn = true, nSm = 0; e.root.traverse(o=>{ if (o.isSkinnedMesh){ nSm++; cs.add(o.skeleton); if (o.skeleton.bones.some(b=>!own.has(b))) bonesOwn = false; } });
      const tplSkel = [...skels][0], copySkel = [...cs][0];
      /* and its vertices follow a joint that turns: read back through the bones on the CPU */
      let moved = 0; if (copySkel && nSm){ const list = [...own].filter(o=>o.isSkinnedMesh), v = new T.Vector3(), snap = ()=>{ const a = []; for (const sm of list){ const P = sm.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/200)); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i); sm.boneTransform(i, v); a.push(v.clone()); } } return a; };
        e.holder.updateMatrixWorld(true); copySkel.update(); const before = snap();
        for (const b of copySkel.bones) b.rotation.z += 0.4; e.holder.updateMatrixWorld(true); copySkel.update();
        const after = snap(); for (let k=0;k<before.length;k++) if (after[k].distanceTo(before[k]) > 1e-4) moved++;
        /* the copy's culling sphere follows its joints: with the joints turned, every skinned vertex still lies inside it, and it is no bigger than it need be */
        FP.t += 0.01; let outside = 0, loose = 0, follows = 0; list.forEach((sm, j)=>{ const bs = sm.geometry.boundingSphere, P = sm.geometry.attributes.position, st = Math.max(1, Math.floor(P.count/400)); for (let i=0;i<P.count;i+=st){ v.fromBufferAttribute(P, i); sm.boneTransform(i, v); if (v.distanceTo(bs.center) > bs.radius + 1e-3) outside++; }
          const tb = sms[j].geometry.boundingSphere; if (bs.radius > tb.radius*1.05 + 0.02) loose++; if (bs.center.distanceTo(tb.center) > 1e-3 || Math.abs(bs.radius - tb.radius) > 1e-3) follows++; });   /* (no bigger than the template's standing sphere, and not that sphere: its own, moved with the joints) */
        out.per[nm+'|sphere'] = { outside, loose, follows, n:list.length }; for (const b of copySkel.bones) b.rotation.z -= 0.4; }
      out.per[nm] = { meshes, skinned:sms.length, parts:meta.skinnedParts||0, skeletons:skels.size, culled, sphOk, propMeshes, copySkeletons:cs.size, copyOwnSkeleton:copySkel!==tplSkel, bonesOwn, moved, bones:tplSkel ? tplSkel.bones.length : 0 }; }
    /* your own figure, the same way */
    { const pt = rsPlayerLook(), e = m3dInstance({}, pt); let sm = 0, n = 0; e.root.traverse(o=>{ if (o.isMesh){ n++; if (o.isSkinnedMesh) sm++; } }); out.player = { meshes:n, skinned:sm }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const [nm, q] of Object.entries(r.per)){
    if (nm.endsWith('|sphere')){ A(q.outside===0 && q.loose===0 && q.follows===q.n, nm+': the culling sphere holds every posed vertex, follows the joints and is no bigger than the standing one: '+JSON.stringify(q)); continue; }
    A(!q.noPortrait, nm+' has a model');
    A(q.skinned >= 1 && q.parts >= 8 && q.meshes <= 18, nm+' is skinned into a few meshes: '+q.meshes+' meshes, '+q.skinned+' skinned, '+q.parts+' parts folded in');
    A(q.skeletons===1 && q.copySkeletons===1 && q.copyOwnSkeleton && q.bonesOwn, nm+': one skeleton for the figure, and a copy gets one of its own on its own joints');
    A(q.culled===q.skinned && q.sphOk===q.skinned, nm+': the skinned meshes are still frustum-culled, by one generous sphere');
    A(q.moved > 0, nm+': a copy\'s skinned vertices follow its joints');
    for (const [k, [n, merged]] of Object.entries(q.propMeshes)) A(n <= 4 && merged >= 1, nm+': its '+k+' is baked into a mesh or two ('+n+' meshes, '+merged+' merged)'); }
  A(r.per['human knight'].propMeshes.shield && r.per['giant spider'].skinned >= 1 && r.per['tomb scarab'].skinned >= 1, 'the knight carries a shield; spiders and beetles are skinned too');
  A(r.player.skinned >= 1 && r.player.meshes <= 18, 'your own figure is skinned too: '+JSON.stringify(r.player));
};
