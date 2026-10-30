// RS-310: a robe bottom on a seated figure: the front of the skirt folds over onto the lap and covers the thighs, falls from the
// knees, nothing of it goes below the ground, and standing up again gives the skirt back its own shape
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const T = THREE, A = (c, m)=>{ if (!c) throw new Error('assert: '+m); }, out = {};
    for (const [race, fem] of [['Human', false], ['Human', true], ['Gnome', false], ['Dwarf', false], ['Halfling', true], ['Wood Elf', false]]){
      goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(x=>x[0]===race)); ccBegin(); if (fem){ G.player.look.body = 1; G.ccLookTouched = true; } if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
      for (const sl of ['head','chest','legs','arms','feet','cape','offhand','weapon']) G.gear[sl] = newItem(); G.gear.chest = rsMakeArmour('cloth', 2, 'chest'); G.gear.legs = rsMakeArmour('cloth', 2, 'legs');
      const e = m3dInstance({}, rsPlayerLook()), rig = e.rig, m = rig.skirt; A(m, race+': a robe bottom');
      m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); const stand0 = Float32Array.from(m.geometry.attributes.position.array);
      // sit, as at the campfire and on a town stool
      const k = 1; rig.hips.position.y = SEAT_H*k + 0.2*k; rig.legs.forEach(L=>{ L.hip.rotation.x = -1.5; L.knee.rotation.x = 1.45; }); m3dSkirtFollow(rig); e.holder.updateMatrixWorld(true);
      const p = m.geometry.attributes.position, v = new T.Vector3(), hips = rig.hips; let minY = 1e9, lapTop = -1e9, frontZ = -1e9;
      const thighTop = (()=>{ let t = -1e9; for (const L of rig.legs) L.hip.traverse(o=>{ if (o.isMesh && !o.parent.isBone){ const q = o.geometry.attributes.position; for (let i=0;i<q.count;i+=3){ v.fromBufferAttribute(q, i); o.localToWorld(v); hips.worldToLocal(v); if (v.z > 0.05 && v.z < 0.18 && v.y > t) t = v.y; } } }); return t; })();
      for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i); m.localToWorld(v); const w = v.clone(); hips.worldToLocal(v); minY = Math.min(minY, w.y); if (v.z > 0.05 && v.z < 0.18) lapTop = Math.max(lapTop, v.y); frontZ = Math.max(frontZ, v.z); }
      const k2 = race + (fem ? ' (f)' : ''); out[k2] = { minY:+minY.toFixed(3), lapTop:+lapTop.toFixed(3), thighTop:+thighTop.toFixed(3), frontZ:+frontZ.toFixed(3) };
      A(minY > -0.003, k2+': nothing below the ground: '+JSON.stringify(out[k2]));
      A(lapTop >= thighTop - 0.002, k2+': the lap is covered, the thighs under the cloth: '+JSON.stringify(out[k2]));
      A(frontZ > 0.18, k2+': the skirt reaches out over the knees: '+JSON.stringify(out[k2]));
      // stand up again: the skirt is its own shape once more
      rig.hips.position.y = rig.hipY; rig.legs.forEach(L=>{ L.hip.rotation.x = 0; L.knee.rotation.x = 0; }); m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e);
      const back = m.geometry.attributes.position.array; let dmax = 0; for (let i=0;i<back.length;i++) dmax = Math.max(dmax, Math.abs(back[i] - stand0[i])); out[k2].standBack = +dmax.toFixed(4);
      A(dmax < 1e-4, k2+': standing again gives the skirt back: '+dmax);
    }
    return out; });
  console.log(JSON.stringify(r));
};
