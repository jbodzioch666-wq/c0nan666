// RS-288/289/291: a woman's skirts fit her hips - the tunic skirt and the robe bottom are gathered at the waist and a little
// squarer in section, the garment's hips and the thighs' tops sit inside them, and the skirt's waist turns with a stooped
// torso: posed, in the hips' frame, at every height round the hips and every direction, the skirt is outside the garment
// and the thighs - in every build, over plate, cloth or no legs, as a human, a wood elf (slight and stooped) and a half-orc
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = { pokes:[], checked:0 }, inv = new THREE.Matrix4(), v = new THREE.Vector3();
    for (const race of ['Human', 'Wood Elf', 'Half-Orc']){
      goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]===race)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
      for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.player.look.body = 1; G.player.look.beard = 0;
      for (const build of [0, 1, 2]) for (const legs of ['metal', 'cloth', 'none']){ G.player.look.build = build; G.gear.legs = legs==='none' ? newItem() : rsMakeArmour(legs, 2, 'legs');
        const e = m3dInstance({}, rsPlayerLook()), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); inv.copy(rig.hips.matrixWorld).invert();
        const skirt = rig.skirt || (()=>{ let sk = null; rig.hips.children.forEach(c=>{ if (c.isMesh && c.geometry.type==='CylinderGeometry' && c.geometry.parameters.height >= 0.24) sk = c; }); return sk; })();
        if (!skirt){ out.pokes.push([race, build, legs, 'no skirt']); continue; }
        const pts = mesh=>{ const p = mesh.geometry.attributes.position, a = []; for (let i=0;i<p.count;i++){ v.set(p.getX(i), p.getY(i), p.getZ(i)); mesh.localToWorld(v); v.applyMatrix4(inv); if (v.y > -0.12 && v.y < 0.03) a.push([v.x, v.y, v.z]); } return a; };
        const body = pts(rig.chestMesh).concat(...rig.legs.map(L=>pts(L.hip.children[0].children[0]))), sk = pts(skirt);
        for (const y0 of [0.0, -0.02, -0.04, -0.06, -0.08]) for (const [nm, ax, az] of [['side',1,0],['back',0,-1],['diag',0.7,-0.7],['diagF',0.7,0.7],['front',0,1]]){
          let g = 0, s = 0; for (const [x, y, z] of body) if (Math.abs(y - y0) < 0.006) g = Math.max(g, x*ax + z*az);
          for (const [x, y, z] of sk) if (Math.abs(y - y0) < 0.012) s = Math.max(s, x*ax + z*az);
          out.checked++; if (s <= g) out.pokes.push([race, build, legs, y0, nm, +g.toFixed(4), +s.toFixed(4)]); } } }
    return out; });
  if (r.pokes.length) throw new Error('the body pokes through her skirt :: '+JSON.stringify(r.pokes));
  console.log('skirt ok', r.checked, 'checks');
};
