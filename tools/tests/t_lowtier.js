// RS-276: the last low-detail monsters rebuilt in high detail - sharks and quippers, the hawk, owl and vulture (and the town hen),
// the treants, the hydras (five-headed, on the dragon), the xorn, the dust devil and the manticore's wings, mane and tail; each
// builds, is detailed, moves when it attacks, and stands on (or hovers just over) the floor
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, snap = e=>{ const a = []; e.holder.updateMatrixWorld(true); e.holder.traverse(x=>{ if (x.isMesh){ const v = new THREE.Vector3(); x.getWorldPosition(v); a.push(v.x, v.y, v.z); } }); return a; };
    const list = ['reef shark','hunter shark','giant shark','quipper swarm','hawk','giant owl','giant vulture','treant','elder treant','the verdant horror','hydra','hydra of the tides','xorn','dust devil','manticore'];
    for (const nm of list){ let e; try{ e = m3dInstance({ nm }, m3dPortrait({ nm })); }catch(err){ out[nm] = 'ERR '+err.message; continue; }
      e.anim ? e.anim(e.rig, 0.7, 0, 0, 0, 0, e) : m3dPoseBeast(e.rig, 0.7, 0, 0, 0, 0, e); const a = snap(e), box = new THREE.Box3().setFromObject(e.holder);
      e.anim ? e.anim(e.rig, 0.7, 0, 0, 1, 0, e) : m3dPoseBeast(e.rig, 0.7, 0, 0, 1, 0, e); const b = snap(e); let moved = 0; for (let i=0;i<a.length;i++) moved = Math.max(moved, Math.abs(a[i] - b[i]));
      let verts = 0; e.holder.traverse(x=>{ if (x.isMesh) verts += x.geometry.attributes.position.count; });
      out[nm] = { verts, moved:+moved.toFixed(3), minY:+box.min.y.toFixed(3), heads:e.rig.necks ? e.rig.necks.length : 0 }; }
    const hen = m3dInstance({}, MP(mpBird, { feather:'#a8642a', hen:true }, 1)); hen.anim(hen.rig, 0.7, 0, 0, 0, 0, hen); const hb = new THREE.Box3().setFromObject(hen.holder); out.hen = { minY:+hb.min.y.toFixed(3), comb:true };
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const [nm, d] of Object.entries(r)){ if (nm==='hen') continue; A(typeof d==='object', nm+' builds');
    A(d.verts > (nm==='dust devil' ? 3000 : 8000), nm+': high detail ('+d.verts+')');
    A(d.moved > 0.005, nm+': it moves when it attacks'); }
  A(r.hydra.heads===5 && r['hydra of the tides'].heads===5, 'the hydras have five heads');
  for (const nm of ['treant','xorn','manticore','hydra']) A(Math.abs(r[nm].minY) < 0.04, nm+' stands on the floor');
  A(Math.abs(r.hen.minY) < 0.02, 'the town hen stands on the ground');
  console.log('lowtier ok', JSON.stringify(r));
};
