// RS-476: magic staves finer each grade, in their element's colour - a battlestaff's orb in a cup of prongs and a band on the shaft; a
// mystic staff's tall gold claws, bigger orb and gold spiral; a master's or the ancient staff's horned crown and circling rune stones -
// all set on the staff's own tip
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { g:[] }, tris = o=>{ let n = 0; o.traverse(x=>{ if (x.isMesh && x.geometry) n += (x.geometry.index ? x.geometry.index.count : x.geometry.attributes.position.count)/3; }); return Math.round(n); };
    for (let g=0; g<4; g++){ G.gear.weapon = rsMakeStaffOf(g, g===3 ? null : 'water'); rsSync && rsSync(); const L = rsPlayerLook(), e = m3dInstance({}, L); m3dPoseHumanoid(e.rig, 1, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const w = e.rig.weapon, bx = new T.Box3().setFromObject(w); let orb = null; w.traverse(o=>{ if (o.isMesh && o.material && o.material.transparent && o.material.opacity===0.95) orb = o; });
      const tip = orb ? orb.getWorldPosition(new T.Vector3()) : null, a0 = e.rig.staffOrbit ? e.rig.staffOrbit.rotation.y : null; if (e.rig.staffOrbit) m3dPoseHumanoid(e.rig, 2, 0, 0, 0, 0, e);
      out.g.push({ grade:L.o.staffGrade, tris:tris(w), orb:!!orb, onTip:tip ? +(bx.max.y - tip.y).toFixed(3) : null, orbits:a0!==null && e.rig.staffOrbit.rotation.y!==a0 }); }
    G.gear.weapon = Object.assign(newItem(), { used:1, slot:'weapon', basis:'Quarterstaff', nm:'Quarterstaff', d1:1, d2:6 }); rsSync && rsSync(); out.melee = rsPlayerLook().o.staffGrade===undefined;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const g = r.g; A(g.every((x, i)=>x.grade===i), 'each staff knows its grade');
  A(!g[0].orb && g[1].orb && g[2].orb && g[3].orb, 'an orb from the battlestaff up');
  for (let i=1;i<4;i++) A(g[i].tris > g[i-1].tris, 'finer each grade, '+i);
  A(g.slice(1).every(x=>x.onTip !== null && x.onTip < 0.12), 'set on the staff\'s own tip');
  A(g[3].orbits && !g[2].orbits, 'the top grade\'s rune stones circle the orb');
  A(r.melee, 'a melee quarterstaff is left plain');
};
