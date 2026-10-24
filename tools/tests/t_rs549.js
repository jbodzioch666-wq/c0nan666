// RS-549: jerkins, hauberks and tunics as one garment over any build - they drape over a heavy body's belly to the belt instead
// of clinging to every roll; a woman's hauberk stands off her thighs (they came through it) and its riding splits are shallow
// notches; a tunic's skirt is its top's cloth. And a cloak hangs outside what the body wears - a robe's cloth and cord, a stooped
// wood elf's bent back - where they used to push out through it
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const fig = (race, fem, outfit, bd, cape)=>{ const L = Object.assign(lookDefault(race), { body:fem }); L.bd = Object.assign(lookBodyDefault(L), bd || {}); const pt = rsPlayerLook({ race, look:L, bare:true }); pt.o.outfit = outfit; pt.o.cloth = '#6a4a2a'; pt.o.legWear = null; pt.o.cape = cape || null;
      return M3D.meta.get(m3dBuilders().get(pt.paint)(pt.o)).rig; };
    /* the belly's roll: how far the front stands out at the belly against just under the ribs */
    const prof = rig=>{ const p = rig.chestMesh.geometry.attributes.position; const f = y=>{ let z = -1; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) - y) < 0.005 && Math.abs(p.getX(i)) < 0.012) z = Math.max(z, p.getZ(i)); return z; }; return { rib:+f(0.15).toFixed(4), belly:+f(0.08).toFixed(4), lower:+f(0.04).toFixed(4) }; };
    out.jerkin = prof(fig('Human', 1, 'leather', { frame:0.8, fat:0.8, hips:0.9 }));
    { const rig = fig('Human', 1, 'chain'), m = rig.pelvisMesh, p = m.geometry.attributes.position; let fz = -1; for (let i=0;i<p.count;i++) if (Math.abs(p.getY(i) + 0.08) < 0.006 && Math.abs(Math.abs(p.getX(i)) - 0.05) < 0.012) fz = Math.max(fz, p.getZ(i));
      const th = rig.legs[0].hip.children[0].children[0], tp = th.geometry.attributes.position; let tz = -1; th.updateWorldMatrix(true, false); m.updateWorldMatrix(true, false); const inv = m.matrixWorld.clone().invert(), v = new THREE.Vector3();
      for (let i=0;i<tp.count;i++){ v.set(tp.getX(i), tp.getY(i), tp.getZ(i)).applyMatrix4(th.matrixWorld).applyMatrix4(inv); if (Math.abs(v.y + 0.08) < 0.006) tz = Math.max(tz, v.z); }
      out.mail = { skirt:+fz.toFixed(4), thigh:+tz.toFixed(4) }; }
    { const L = Object.assign(lookDefault('Human'), { body:0 }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); pt.o.outfit = 'shirt'; pt.o.cloth = '#6a4a2a'; const rig = M3D.meta.get(m3dBuilders().get(pt.paint)(pt.o)).rig; let sk = null; rig.hips.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='CylinderGeometry') sk = c; });
      out.tunic = sk ? { rep:sk.material.map ? sk.material.map.repeat.x : 0 } : null; }
    for (const [nm, race, fem, outfit] of [['elfRobe', 'Wood Elf', 1, 'robe'], ['manRobe', 'Human', 0, 'robe'], ['jerkinCape', 'Human', 1, 'leather']]){ const rig = fig(race, fem, outfit, null, '#3a4a2a'); out[nm] = { cleared:m3dCapeClear(rig, rig.torsoIn) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.jerkin.belly - r.jerkin.rib < 0.03 && r.jerkin.lower >= r.jerkin.belly - 0.02, 'a heavy jerkin drapes from the chest over the belly - no roll standing out');
  A(r.mail.skirt > r.mail.thigh + 0.002, 'a woman\'s hauberk stands off her thighs in front');
  A(r.tunic && r.tunic.rep > 5, 'a tunic\'s skirt in its top\'s weave');
  for (const k of ['elfRobe', 'manRobe', 'jerkinCape']) A(r[k].cleared === 0, k + ': the cloak already hangs clear of all the body wears (nothing left to push out)');
};
