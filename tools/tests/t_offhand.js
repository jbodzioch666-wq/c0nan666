// RS-295 (RS-299: a staff and a tome go together): what's in your off hand shows on your model - an off-hand blade in the left fist, held ready and swung behind the main hand, or a spell
// tome held up to read - and under a helmet the hair is a cap that fits inside it, so it doesn't poke out at the back (it did on wood elves)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const start = race=>{ goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(x=>x[0]===race)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
      for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.gear.weapon = rsMakeWeapon(3, 3); };
    start('Human'); let it; do { it = rsMakeOffhand(30); } while (!it.offWeapon); G.gear.offhand = it;
    { const pt = rsPlayerLook(), e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); const a = rig.arms[1].sh.rotation.x; m3dPoseHumanoid(rig, 0.7, 0, 1, 0, 0, e);
      out.blade = { o:!!pt.o.offWeapon, inLeft:!!rig.offWpn && rig.arms[1].hand.children.includes(rig.offWpn), drawn:+(a - rig.arms[1].sh.rotation.x).toFixed(2) }; }
    { const e = m3dInstance({}, rsPlayerLook()), rig = e.rig, w = rig.arms[0].hand.children.find(c=>c.type==='Group' && c!==rig.arms[0].hand.children[0]); out.edge = { main:+rig.weapon.rotation.y.toFixed(3), off:+rig.offWpn.rotation.y.toFixed(3), hilt:+rig.weapon.position.z.toFixed(3) }; }   /* (RS-296) */
    G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); { const pt = rsPlayerLook(), e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const n = new THREE.Vector3(0, 1, 0).transformDirection(rig.tome.matrixWorld), tp = rig.tome.getWorldPosition(new THREE.Vector3()), hp = rig.head.getWorldPosition(new THREE.Vector3()), hd = rig.arms[1].hand.getWorldPosition(new THREE.Vector3());
      out.tome = { o:!!pt.o.tome, held:!!rig.tome, facesReader:+n.dot(hp.clone().add(new THREE.Vector3(0, 0.08, 0)).sub(tp).normalize()).toFixed(2), handNear:+hd.distanceTo(tp).toFixed(3) }; }
    { const w0 = G.gear.weapon; G.gear.weapon = rsMakeStaff(1); const pt = rsPlayerLook(), e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e);   /* (RS-299: a mage's staff and tome together - the staff in the right hand alone) */
      out.staffTome = { o:!!pt.o.tome, staff:rig.wk==='staff', held:!!rig.tome, twoHand:!!rig.twoHand }; G.gear.weapon = w0; }
    G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); { const pt = rsPlayerLook(), e = m3dInstance({}, pt); out.shield = { shield:!!e.rig.shield, blade:!!e.rig.offWpn }; }
    for (const race of ['Wood Elf', 'Human', 'Dwarf']){ start(race); for (const tier of [1, 3, 6]){ G.gear.head = rsMakeArmour('metal', tier, 'head');
      const e = m3dInstance({}, rsPlayerLook()), h = e.rig.head; e.holder.updateMatrixWorld(true); let helm = null, cap = null;
      h.traverse(x=>{ if (x.isMesh && [...M3D.sculpt.entries()].some(([k, g])=>g===x.geometry && k.startsWith('helm|'))) helm = x; if (x.isMesh && x.geometry.type==='SphereGeometry' && x.material.userData.kind==='fur' && Math.abs(x.position.y - 0.088) < 0.001) cap = x; });
      if (!cap) continue; const loc = m=>{ m.updateMatrix(); return m.geometry.boundingBox ? m.geometry.boundingBox.clone().applyMatrix4(m.matrix) : (m.geometry.computeBoundingBox(), m.geometry.boundingBox.clone().applyMatrix4(m.matrix)); }, bc = loc(cap), bh = loc(helm);   // (in the head's own frame - a stooped head is tilted)
      out[race+tier] = { inside:bc.min.z >= bh.min.z - 0.001 && bc.max.y <= bh.max.y && bc.min.x >= bh.min.x - 0.001, c:[bc.min.x, bc.max.y, bc.min.z].map(v=>+v.toFixed(3)), h:[bh.min.x, bh.max.y, bh.min.z].map(v=>+v.toFixed(3)), helmKey:[...M3D.sculpt.entries()].find(([k, g])=>g===helm.geometry)[0] }; } }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.blade.o && r.blade.inLeft && r.blade.drawn > 0.4, 'an off-hand blade in the left fist, drawn back as the main hand winds up');
  A(r.tome.o && r.tome.held && r.tome.facesReader > 0.7 && r.tome.handNear < 0.12, 'a tome held open on the off hand, its pages facing the reader');
  A(r.staffTome.o && r.staffTome.staff && r.staffTome.held && !r.staffTome.twoHand, 'a staff and a tome are carried together: '+JSON.stringify(r.staffTome));
  A(Math.abs(r.edge.main + Math.PI/2) < 0.01 && Math.abs(r.edge.off + Math.PI/2) < 0.01 && r.edge.hilt > 0.02, 'RS-296: blades edge-forward in both hands, slid up so the fist is on the grip');
  A(r.shield.shield && !r.shield.blade, 'a shield is still a shield');
  for (const k of Object.keys(r)) if (r[k].inside!==undefined) A(r[k].inside, k+': the hair under the helmet stays inside it');
  console.log('offhand ok', JSON.stringify(r));
};
