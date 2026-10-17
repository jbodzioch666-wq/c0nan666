// RS-263: the wolf rebuilt in high detail - a sculpted body with a ruff, a head with a black nose, glowing eyes, tall ears and a jaw
// that opens on its fangs to bite, four legs standing on their paws, and a bushy jointed tail; jackals, hellhounds and werewolves
// share it, and since RS-278 so do the town dogs (short legs)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    for (const nm of ['wolf', 'dire wolf', 'winter wolf', 'winter wolf alpha', 'jackal', 'hellhound', 'werewolf']){
      const e = m3dInstance({ nm }, m3dPortrait({ nm })), rig = e.rig;
      e.anim(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(e.holder), jaw0 = rig.jaw.rotation.x, hx0 = rig.legs[0].up.rotation.x;
      let verts = 0, teeth = 0; e.holder.traverse(x=>{ if (x.isMesh){ verts += x.geometry.attributes.position.count; if (x.geometry.type==='ConeGeometry' && x.material.userData.hex==='#f0e8d4') teeth++; } });
      e.anim(rig, 0.7, 0, 0, 1, 0, e); const jaw1 = rig.jaw.rotation.x, reach = rig.legs[0].up.rotation.x < hx0 - 0.3;
      e.anim(rig, 0.7, 1, 0, 0, 0, e);
      out[nm] = { wolf:!!rig.wolf, beast:e.beast, legs:rig.legs.length, fronts:rig.legs.filter(L=>L.fz > 0).length, ears:rig.ears.length, tail:rig.tailJ.length, verts, teeth,
        bites:jaw1 > jaw0 + 0.4, reach, minY:+(box.min.y/(box.max.y - box.min.y)).toFixed(3), long:(()=>{ const s = box.getSize(new THREE.Vector3()); return s.z > s.y; })() };
    }
    const dog = m3dInstance({ nm:'dog' }, MP(mpBeast, { head:'canine', fur:'#8a6a42', tail:'stub', legs:'short', len:0.75 }, 1));
    out.dog = !!dog.rig.wolf && dog.beast;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const nm of ['wolf', 'dire wolf', 'winter wolf', 'winter wolf alpha', 'jackal', 'hellhound', 'werewolf']){ const w = r[nm];
    A(w.wolf && w.beast, nm+': uses the sculpted wolf, and still moves like a beast');
    A(w.legs===4 && w.fronts===2 && w.ears===2 && w.tail===4, nm+': four legs, two ears, a jointed tail');
    A(w.verts > 40000, nm+': high detail ('+w.verts+' vertices)');
    A(w.teeth >= 20, nm+': a mouthful of teeth');
    A(w.bites && w.reach, nm+': it opens its jaw and reaches out with its forelegs to bite');
    A(Math.abs(w.minY) < 0.03, nm+': it stands on its paws');
    A(w.long, nm+': longer than it is tall'); }
  A(r.dog===true, 'a town dog is the sculpted wolf too');
  console.log('wolf ok', JSON.stringify(r));
};
