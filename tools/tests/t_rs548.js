// RS-548: a robe in one piece. Its cloth runs from the hem on up over the hips and waist to under the bust, laid just over the
// bodice as it is, its top edge tucked in under it - no seam round the hips where a bodice used to end and a skirt begin; the
// bodice below it is trimmed away and the lower piece at the hips is gone, so nothing shows through as the body turns; the cord
// is tied round the natural waist (it sat low on the hips, on the seam); and above the hips the cloth turns with the torso
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const robe = (race, fem, bd)=>{ const L = Object.assign(lookDefault(race), { body:fem }); L.bd = Object.assign(lookBodyDefault(L), bd || {}); const pt = rsPlayerLook({ race, look:L, bare:true }); pt.o.outfit = 'robe'; pt.o.cloth = '#3040a0'; pt.o.legWear = null; pt.o.cape = null;
      return m3dInstance({}, pt); };
    for (const [nm, race, fem, bd] of [['man', 'Human', 0], ['heavy', 'Human', 1, { frame:0.8, fat:0.8, hips:0.9 }], ['dancer', 'Dragonborn', 1, { frame:0.3, fat:0.15, waist:0.2, hips:0.55 }], ['elf', 'Wood Elf', 1]]){
      const e = robe(race, fem, bd), rig = e.rig, sk = rig.skirt, p = sk.geometry.attributes.position; let top = -9; for (let i=0;i<p.count;i++) top = Math.max(top, p.getY(i) + sk.position.y);
      let cord = null; rig.torsoIn.traverse(c=>{ if (c.name==='robeCord') cord = c; });
      /* how far the cloth stands off the bodice, just under its top edge, all round (tucked in at the very top) */
      const cm = rig.chestMesh, full = cm.geometry.userData.from || cm.geometry, q = full.attributes.position; let gap = 9;
      for (let i=0;i<p.count;i++){ const Y = p.getY(i) + sk.position.y; if (Math.abs(Y - (top - 0.06)) > 0.006) continue; const X = p.getX(i)*sk.scale.x, Z = p.getZ(i)*sk.scale.z, th = Math.atan2(X, Z); let br = 0;
        for (let j=0;j<q.count;j++){ const y2 = q.getY(j)*cm.scale.y + cm.position.y; if (Math.abs(y2 - Y) > 0.006) continue; const x2 = q.getX(j), z2 = q.getZ(j); let dt = Math.abs(Math.atan2(x2, z2) - th); if (dt > Math.PI) dt = Math.PI*2 - dt; if (dt < 0.12) br = Math.max(br, Math.hypot(x2, z2)); }
        if (br) gap = Math.min(gap, Math.hypot(X, Z) - br); }
      out[nm] = { top:+top.toFixed(3), cordY:cord ? +cord.geometry.parameters.path.points[0].y.toFixed(3) : null, pelvis:!!(rig.pelvisMesh && rig.pelvisMesh.visible), trimmed:!!cm.geometry.userData.robeCut, gap:+gap.toFixed(4), hold:sk.userData.hold };
      /* turned at the waist: the cloth above the hips turns with it */
      if (nm==='man'){ m3dPoseHumanoid(rig, 1, 0, 0, 0, 0, e); rig.torso.rotation.y = 0.5; e.holder.updateMatrixWorld(true); sk.userData.sig = 999; m3dSkirtFollow(rig); sk.userData.sig = 998; m3dSkirtFollow(rig); let a = 0, n = 0; const pq = sk.geometry.attributes.position;
        for (let i=0;i<p.count;i++){ const Y = p.getY(i) + sk.position.y; const b0 = sk.userData.base; if (!b0 || Math.abs(b0[i*3+1] + sk.position.y - (top - 0.03)) > 0.006) continue; const b1 = sk.userData.base; let da = Math.atan2(pq.getX(i), pq.getZ(i)) - Math.atan2(b0[i*3], b0[i*3+2]); da = Math.atan2(Math.sin(da), Math.cos(da)); a += da; n++; }
        out.turn = n ? +(a/n).toFixed(3) : null; } }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['man', 'heavy', 'dancer', 'elf']){ const q = r[k];
    A(q.top > 0.11, k + ': the robe\'s cloth runs up to under the bust');
    A(!q.pelvis && q.trimmed, k + ': no second piece at the hips, the bodice trimmed under the cloth');
    A(q.cordY >= 0.065 && q.cordY <= 0.09 && q.cordY < q.top - 0.02, k + ': the cord round the natural waist (RS-586: the middle of it, not up under the chest)');
    A(q.gap > -0.002 && q.gap < 0.012, k + ': the cloth lies just over the bodice');
    A(q.hold > 0.2, k + ': held to the body from the waist up, swinging below'); }
  A(r.turn > 0.3, 'above the hips the cloth turns with the torso');
};
