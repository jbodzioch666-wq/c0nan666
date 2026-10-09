// RS-271: frogs, toads and crocodiles rebuilt in high detail - a frog's sticky tongue shoots out to strike, a toad is warty,
// a crocodile has teeth along both jaws that gape, a crested tail and four clawed legs; ammit wears a mane, the sacred crocodile
// a gold collar; the shambling mound (RS-272) is a shaggy swamp shambler with a trunk and the will-o'-wisp a flame of colour
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['giant frog','giant toad','giant crocodile','sacred crocodile','ammit']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig; e.anim(rig, 0.7, 0, 0, 0, 0, e);
      let verts = 0, teeth = 0; e.holder.traverse(x=>{ if (x.isMesh){ verts += x.geometry.attributes.position.count; } });
      const j0 = rig.jaw ? rig.jaw.rotation.x : 0; e.anim(rig, 0.7, 0, 1, 0, 0, e); const gape = rig.jaw ? rig.jaw.rotation.x - j0 : 0;
      e.anim(rig, 0.7, 0, 0, 1, 0, e); const tongue = rig.tongue ? rig.tongue.visible : null, bite = rig.jaw ? rig.jaw.rotation.x - j0 : 0;
      e.holder.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(e.holder);
      out[nm] = { frog:!!rig.frog, verts, gape:+gape.toFixed(2), bite:+bite.toFixed(2), tongue, legs:rig.legs.length, tail:(rig.tail||[]).length, minY:+box.min.y.toFixed(3) };
    }
    const m = m3dInstance({ nm:'shambling mound' }, m3dPortrait({ nm:'shambling mound' })); let strandV = 0; m.holder.traverse(x=>{ if (x.isMesh) strandV += x.geometry.attributes.position.count; }); out.strands = strandV; out.trunk = !!m.rig.trunk && m.rig.tendrils.length===2 && m.rig.arms.length===2;
    const w = m3dInstance({ nm:'will-o-wisp' }, m3dPortrait({ nm:'will-o-wisp' })); w.anim(w.rig, 0.7, 0, 0, 0, 0, w); const wb = new THREE.Box3().setFromObject(w.rig.outer); const ws = wb.getSize(new THREE.Vector3()); out.flame = +(ws.y/ws.x).toFixed(2);
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r['giant frog'].bite > 0.5 && r['giant toad'].bite > 0.5, 'RS-273: a frog opens its mouth as its tongue shoots out');
  A(r['giant frog'].frog && r['giant frog'].tongue===true && r['giant frog'].verts > 15000, 'a high-detail frog whose tongue shoots out');
  A(r['giant toad'].verts > r['giant frog'].verts, 'a warty toad');
  for (const nm of ['giant crocodile','sacred crocodile','ammit']) A(r[nm].frog && r[nm].legs===4 && r[nm].tail===9 && r[nm].gape > 0.5 && Math.abs(r[nm].minY) < 0.02, nm+': four legs, a crested tail, jaws that gape, on the ground');
  A(r.ammit.verts > r['sacred crocodile'].verts, "ammit's mane");
  A(r.strands > 60000 && r.trunk, 'the shambling mound: a shaggy coat of strands, a trunk, two tendrils and two arms');
  A(r.flame > 1.3, "the will-o'-wisp burns as a tall flame");
  console.log('frog ok', JSON.stringify(r));
};
