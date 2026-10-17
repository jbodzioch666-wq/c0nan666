// RS-305: a robe is two garments that meet at the belt line. The robe top is a bodice that ends in a flat hem at the belt,
// with no pelvis or seat of its own; the robe bottom's waist rises to that hem and takes its exact oval, so the two flow into
// one line under the sash - on every race, man or woman, broad or slight, and on a one-piece robe too
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const T = THREE, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    const start = (race, fem)=>{ goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(x=>x[0]===race)); ccBegin(); if (fem){ G.player.look.body = 1; G.ccLookTouched = true; } if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
      for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.gear.chest = rsMakeArmour('cloth', 2, 'chest'); G.gear.legs = rsMakeArmour('cloth', 2, 'legs'); };
    const ring = (mesh, pick)=>{ const p = mesh.geometry.attributes.position, base = mesh.userData.base, sc = mesh.scale, ps = mesh.position; let ys = [];   /* (the mesh as built, in its parent's frame - before the skirt's deformer tilts its waist with the torso) */
      for (let i=0;i<p.count;i++){ const x = base ? base[i*3] : p.getX(i), y = base ? base[i*3+1] : p.getY(i), z = base ? base[i*3+2] : p.getZ(i); ys.push([x*sc.x + ps.x, y*sc.y + ps.y, z*sc.z + ps.z]); }
      const sel = ys.filter(pick); return { n:sel.length, x:Math.max(...sel.map(q=>Math.abs(q[0]))), z:Math.max(...sel.map(q=>Math.abs(q[2]))), y:sel.length ? Math.max(...sel.map(q=>q[1])) : null, yMin:sel.length ? Math.min(...sel.map(q=>q[1])) : null }; };
    for (const [race, fem] of [['Human', false], ['Human', true], ['Halfling', false], ['Gnome', false], ['Dwarf', false], ['Wood Elf', true], ['High Elf', false]]){
      start(race, fem); const pt = rsPlayerLook(), e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      A(rig.skirt && rig.chestMesh, race+': a robe bottom and a bodice');
      // the bodice: its hem is flat at the belt line, nothing of it below
      const bod = ring(rig.chestMesh, q=>true), hem = ring(rig.chestMesh, q=>q[1] < 0.012);
      // the skirt's waist: its topmost ring, in the hips' frame
      const top = ring(rig.skirt, q=>true), waist = ring(rig.skirt, q=>q[1] > top.y - 0.004);
      const sash = rig.torso.children.find(c=>c.isMesh && c.geometry.type==='TorusGeometry' && Math.abs(c.position.y - 0.012) < 0.002);
      const k = race + (fem ? ' (f)' : ''); out[k] = { bodMin:+bod.yMin.toFixed(3), hemX:+hem.x.toFixed(3), hemZ:+hem.z.toFixed(3), waistY:+top.y.toFixed(3), waistX:+waist.x.toFixed(3), waistZ:+waist.z.toFixed(3), sash:!!sash, fem:!!pt.o.fem };
      A(!!pt.o.fem===fem, k+': the figure is '+(fem ? 'a woman' : 'a man'));
      A(bod.yMin > -0.012, k+': the bodice ends at the belt line, not below: '+bod.yMin);
      A(top.y > 0.008 && top.y < 0.03, k+': the skirt rises to the belt line: '+top.y);
      A(Math.abs(waist.x - hem.x) < 0.012 && Math.abs(waist.z - hem.z) < 0.012, k+': the skirt waist takes the bodice hem oval: '+JSON.stringify(out[k]));
      A(sash, k+': a sash at the belt line'); }
    // a one-piece robe (a townsperson) meets the same way, and a robe top over plate legs keeps its bodice and sash
    { const e = m3dInstance({}, m3dPortrait({ nm:'cult acolyte' })), rig = e.rig; out.onePiece = { skirt:!!rig.skirt, bod:rig.chestMesh ? +ring(rig.chestMesh, q=>true).yMin.toFixed(3) : null }; A(out.onePiece.skirt && out.onePiece.bod > -0.012, 'a one-piece robe meets at the belt line too: '+JSON.stringify(out.onePiece)); }
    start('Human', false); G.gear.legs = rsMakeArmour('metal', 2, 'legs'); { const e = m3dInstance({}, rsPlayerLook()), rig = e.rig; out.plateLegs = { skirt:!!rig.skirt, sash:!!rig.torso.children.find(c=>c.isMesh && c.geometry.type==='TorusGeometry' && Math.abs(c.position.y - 0.012) < 0.002), bod:+ring(rig.chestMesh, q=>true).yMin.toFixed(3) }; }
    A(!out.plateLegs.skirt && out.plateLegs.sash && out.plateLegs.bod > -0.012, 'a robe top over plate legs: bodice and sash, no skirt: '+JSON.stringify(out.plateLegs));
    return out; });
  console.log(JSON.stringify(r));
};
