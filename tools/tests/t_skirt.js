// RS-288: a woman's skirts fit her hips - the tunic skirt and the robe bottom are gathered at the waist, a little squarer in
// section for the corners of the hips, and the garment's hips are cut to sit inside them: at every height round the hips,
// sideways, behind and on the diagonal, the skirt is outside the garment, in every build, over plate legs, cloth legs or none
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.player.look.body = 1; G.player.look.beard = 0;
    const out = { pokes:[], checked:0 };
    for (const build of [0, 1, 2]) for (const legs of ['metal', 'cloth', 'none']){ G.player.look.build = build; G.gear.legs = legs==='none' ? newItem() : rsMakeArmour(legs, 2, 'legs');
      const e = m3dInstance({}, rsPlayerLook()), rig = e.rig; let skirt = null; rig.hips.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='CylinderGeometry' && c.geometry.parameters.height >= 0.24) skirt = c; });
      if (!skirt){ out.pokes.push([build, legs, 'no skirt']); continue; }
      const gp = rig.chestMesh.geometry.attributes.position, sp = skirt.geometry.attributes.position;
      for (const y0 of [0.0, -0.02, -0.04, -0.06]) for (const [nm, ax, az] of [['side',1,0],['back',0,-1],['diag',0.7,-0.7],['diagF',0.7,0.7]]){
        let g = 0, s = 0; for (let i=0;i<gp.count;i++){ const y = gp.getY(i); if (Math.abs(y - y0) < 0.006){ const d = gp.getX(i)*ax + gp.getZ(i)*az; g = Math.max(g, d); } }
        for (let i=0;i<sp.count;i++){ const y = sp.getY(i)*skirt.scale.y + skirt.position.y; if (Math.abs(y - y0) < skirt.geometry.parameters.height/10*0.55){ const d = sp.getX(i)*skirt.scale.x*ax + sp.getZ(i)*skirt.scale.z*az; s = Math.max(s, d); } }
        out.checked++; if (s <= g) out.pokes.push([build, legs, y0, nm, +g.toFixed(4), +s.toFixed(4)]); } }
    return out; });
  if (r.pokes.length) throw new Error('the garment pokes through her skirt :: '+JSON.stringify(r.pokes));
  console.log('skirt ok', r.checked, 'checks');
};
