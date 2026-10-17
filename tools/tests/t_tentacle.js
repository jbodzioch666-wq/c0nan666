// RS-269: tentacled monsters rebuilt in high detail - a sculpted mantle, eye-orb or stalagmite, and arms, eye-stalks and
// tendrils that are each one smooth tapering tube; they writhe, the front arms lash out when it attacks, and each figure
// bends its own arms
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant octopus','the kraken','tentacled horror','aberration','chosen of the deep','avatar of the depths',"the drowned god's herald",'roper']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig, list = rig.arms.length ? rig.arms : rig.stalks || rig.tend, tb = list[0].tb;
      e.anim(rig, 0.7, 0, 0, 0, 0, e); const p0 = list.map(A=>A.tb.geometry.attributes.position.array.slice());
      e.anim(rig, 0.7, 0, 0, 1, 0, e); let moved = 0; list.forEach((A, i)=>{ const p1 = A.tb.geometry.attributes.position.array; for (let j=0;j<p1.length;j+=7) moved = Math.max(moved, Math.abs(p1[j] - p0[i][j])); });
      const e2 = m3dInstance({ nm }, m3dPortrait({ nm })); e2.anim(e2.rig, 2.0, 1, 0, 0, 0, e2);
      e.holder.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(e.holder); let verts = 0, gold = 0; e.holder.traverse(x=>{ if (x.isMesh){ verts += x.geometry.attributes.position.count; if (x.material.metalness > 0.5) gold++; } });
      out[nm] = { tent:!!rig.tentacled, limbs:list.length, verts, moved:+moved.toFixed(3), own:(e2.rig.arms.length ? e2.rig.arms : e2.rig.stalks || e2.rig.tend)[0].tb.geometry!==tb.geometry, minY:+box.min.y.toFixed(3), crown:gold > 0 };
    }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r)){
    A(d.tent && d.verts > 12000, nm+': high detail');
    A(d.moved > 0.02, nm+': its arms lash when it attacks');
    A(d.own, nm+': each figure bends its own arms'); }
  A(r['giant octopus'].limbs===8 && r['the kraken'].limbs===10 && r["the drowned god's herald"].limbs===12 && r.roper.limbs===6, 'the right number of arms');
  A(r["the drowned god's herald"].crown && !r['the kraken'].crown, 'the herald wears a golden crown');
  A(r['giant octopus'].minY > -0.03, 'the octopus sits on the floor');
  console.log('tentacle ok', JSON.stringify(r));
};
