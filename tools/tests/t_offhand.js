// RS-295: what's in your off hand shows on your model - an off-hand blade in the left fist, held ready and swung behind the main hand, or a spell
// tome held up to read - and under a helmet the hair is a cap that fits inside it, so it doesn't poke out at the back (it did on wood elves)
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const start = race=>{ goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(x=>x[0]===race)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
      for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.gear.weapon = rsMakeWeapon(3, 3); };
    start('Human'); let it; do { it = rsMakeOffhand(30); } while (!it.offWeapon); G.gear.offhand = it;
    { const pt = rsPlayerLook(), e = m3dInstance({}, pt), rig = e.rig; m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); const a = rig.arms[1].sh.rotation.x; m3dPoseHumanoid(rig, 0.7, 0, 1, 0, 0, e);
      out.blade = { o:!!pt.o.offWeapon, inLeft:!!rig.offWpn && rig.arms[1].hand.children.includes(rig.offWpn), drawn:+(a - rig.arms[1].sh.rotation.x).toFixed(2) }; }
    G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand'); { const pt = rsPlayerLook(), e = m3dInstance({}, pt); out.tome = { o:!!pt.o.tome, held:!!e.rig.tome }; }
    G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); { const pt = rsPlayerLook(), e = m3dInstance({}, pt); out.shield = { shield:!!e.rig.shield, blade:!!e.rig.offWpn }; }
    for (const race of ['Wood Elf', 'Human', 'Dwarf']){ start(race); for (const tier of [1, 3, 6]){ G.gear.head = rsMakeArmour('metal', tier, 'head');
      const e = m3dInstance({}, rsPlayerLook()), h = e.rig.head; e.holder.updateMatrixWorld(true); let helm = null, cap = null;
      h.traverse(x=>{ if (x.isMesh && [...M3D.sculpt.entries()].some(([k, g])=>g===x.geometry && k.startsWith('helm|'))) helm = x; if (x.isMesh && x.geometry.type==='SphereGeometry' && x.material.userData.kind==='fur' && Math.abs(x.position.y - 0.088) < 0.001) cap = x; });
      if (!cap) continue; const loc = m=>{ m.updateMatrix(); return m.geometry.boundingBox ? m.geometry.boundingBox.clone().applyMatrix4(m.matrix) : (m.geometry.computeBoundingBox(), m.geometry.boundingBox.clone().applyMatrix4(m.matrix)); }, bc = loc(cap), bh = loc(helm);   // (in the head's own frame - a stooped head is tilted)
      out[race+tier] = { inside:bc.min.z >= bh.min.z - 0.001 && bc.max.y <= bh.max.y && bc.min.x >= bh.min.x - 0.001, c:[bc.min.x, bc.max.y, bc.min.z].map(v=>+v.toFixed(3)), h:[bh.min.x, bh.max.y, bh.min.z].map(v=>+v.toFixed(3)), helmKey:[...M3D.sculpt.entries()].find(([k, g])=>g===helm.geometry)[0] }; } }
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.blade.o && r.blade.inLeft && r.blade.drawn > 0.4, 'an off-hand blade in the left fist, drawn back as the main hand winds up');
  A(r.tome.o && r.tome.held, 'a tome held in the off hand');
  A(r.shield.shield && !r.shield.blade, 'a shield is still a shield');
  for (const k of Object.keys(r)) if (r[k].inside!==undefined) A(r[k].inside, k+': the hair under the helmet stays inside it');
  console.log('offhand ok', JSON.stringify(r));
};
