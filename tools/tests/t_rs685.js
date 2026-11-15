// RS-685: a woman's hips no longer bulge over her legs. Her pelvis was sculpted wider than the tops of her (slimmer) thighs, so it
// ended in a ledge where the legs came out and her underclothes, which cover the pelvis, read as puffy shorts; now the pelvis tapers
// into the thighs, her briefs are cut high at the leg, and a jerkin's skirt and a breastplate's lames follow her hips in. A man's
// figure is as it was. (Before: her ledge 0.0058, a jerkin's 0.0055, a breastplate's 0.0056; her briefs as low at the sides as the middle)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, out = {};
    const build = (fem, fam)=>{ for (const sl of Object.keys(G.gear)) G.gear[sl] = newItem(); if (fam){ G.gear.legs = rsMakeArmour(fam, 1, 'legs'); G.gear.chest = rsMakeArmour(fam, 1, 'chest'); }
      const L = Object.assign(lookDefault('Human'), { body:fem }), pt = rsPlayerLook({ race:'Human', look:L }), root = m3dBuilders().get(pt.paint)(pt.o); return { o:pt.o, rig:M3D.meta.get(root).rig }; };
    /* the widest the pelvis goes at the tops of the thighs, against the thighs' own outer edge there (in the hips' frame) */
    const ledge = rig=>{ const pv = rig.pelvisMesh.geometry.attributes.position, band = (y, y0)=>Math.abs(y - y0) < 0.006; let px = 0, tx = 0;
      for (let i=0;i<pv.count;i++) if (band(pv.getY(i), -0.075)) px = Math.max(px, Math.abs(pv.getX(i)));
      for (const lg of rig.legs){ const m = lg.hip.children[0].children[0]; lg.hip.updateMatrix(); m.updateMatrix(); const p = m.geometry.attributes.position, v = new T.Vector3();
        for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i).applyMatrix4(m.matrix).applyMatrix4(lg.hip.matrix); if (band(v.y, -0.075)) tx = Math.max(tx, Math.abs(v.x)); } }
      return +(px - tx).toFixed(4); };
    { const { o, rig } = build(1, null); out.fem = { under:!!o.under, ledge:ledge(rig) };
      let br = null; rig.pelvisMesh.traverse(c=>{ if (c.name==='under') br = c; });
      if (br){ const p = br.geometry.attributes.position; let mid = 9, side = 9; for (let i=0;i<p.count;i++){ const x = Math.abs(p.getX(i)), y = p.getY(i); if (x < 0.015) mid = Math.min(mid, y); if (x > 0.06) side = Math.min(side, y); } out.fem.briefs = { mid:+mid.toFixed(3), side:+side.toFixed(3) }; } }
    out.male = { ledge:ledge(build(0, null).rig) };
    out.femLeather = { ledge:ledge(build(1, 'hide').rig) }; out.femPlate = { ledge:ledge(build(1, 'metal').rig) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.fem.under && r.fem.briefs, 'out of armour she is in her underclothes');
  A(r.fem.ledge < 0.002, 'her hips taper into her thighs - no ledge where the legs come out');
  A(r.fem.briefs.side - r.fem.briefs.mid > 0.03, 'her briefs cut high at the leg, not down the thighs like shorts');
  A(r.femLeather.ledge < 0.002 && r.femPlate.ledge < 0.002, 'a jerkin and a breastplate follow her hips in');
  A(r.male.ledge < 0, 'a man\'s figure as before');
};
