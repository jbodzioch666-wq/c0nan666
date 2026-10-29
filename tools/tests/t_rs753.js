// RS-753: a tail comes out through a robe to the ankles (rides a little higher behind, rotation.x 0.2) and hangs clear of it, a tiefling's as a dragonborn's (RS-752 had tucked them
// inside): past its root no part of it is inside the skirt, at any moment of its swish, which is the full swing again; under a cape it
// still has its caps for the cloth to drape over; without a robe the tiefling's tail is the old curve
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, out = {};
    const fig = (race, robe)=>{ G.player.race = race; for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem(); G.gear.weapon = rsMakeStaff(2);
      G.gear.chest = rsMakeArmour(robe ? 'cloth' : 'metal', 3, 'chest'); G.gear.legs = rsMakeArmour(robe ? 'cloth' : 'metal', 3, 'legs'); G.gear.cape = rsMakeCape(60, 'Saradomin Cape'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook({ race })), rg = e.rig; let inN = 0, tot = 0, swish = 0, far = 0;
      for (let k=0;k<12;k++){ m3dPoseHumanoid(rg, k*0.23, k%3===2 ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); if (rg.skirt) m3dSkirtFollow(rg); swish = Math.max(swish, Math.abs(rg.tail.rotation.z));
        if (!rg.skirt) continue; e.holder.updateMatrixWorld(true); const ax = new T.Vector3(), root = new T.Vector3(); rg.hips.getWorldPosition(ax); rg.tail.getWorldPosition(root); const ray = new T.Raycaster(), v = new T.Vector3(), d = new T.Vector3(); rg.skirt.material.side = T.DoubleSide;
        rg.tail.traverse(o=>{ if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i); o.localToWorld(v); if (v.distanceTo(root) < (race==='Dragonborn' ? 0.11 : 0.07)) continue;   /* (the root, coming out through the cloth: a dragon's is thick) */ far = Math.max(far, v.distanceTo(root));
          d.set(ax.x - v.x, 0, ax.z - v.z); const L = d.length(); if (L < 1e-4) continue; ray.set(v, d.normalize()); ray.far = L; tot++; if (!ray.intersectObject(rg.skirt, false).length) inN++; } }); }
      const pa = rg.tail.children[0].geometry.attributes.position; let zMin = 0; for (let i=0;i<pa.count;i++) zMin = Math.min(zMin, pa.getZ(i));
      return { skirt:!!rg.skirt, cape:!!rg.cape, caps:(rg.tail.userData.caps||[]).length, inN, tot, swish:+swish.toFixed(2), sz:+rg.tail.scale.z.toFixed(2), zMin:+zMin.toFixed(2) }; };
    out.tief = fig('Tiefling', true); out.drag = fig('Dragonborn', true); out.plate = fig('Tiefling', false);
    return out; });
  console.log(JSON.stringify(r));
  for (const k of ['tief', 'drag']){ const f = r[k]; A(f.skirt && f.tot > 100 && f.inN===0, k + ': past its root the tail is outside the robe: ' + JSON.stringify(f));
    A(f.swish > 0.25 && f.sz===1, k + ': the full swish, no tuck: ' + JSON.stringify(f)); A(f.cape && f.caps >= 4, k + ': caps for the cape: ' + JSON.stringify(f)); }
  A(r.plate.zMin > -0.22 && r.plate.zMin < -0.17 && r.plate.swish > 0.25 && !r.plate.skirt, 'without a robe the old curve: ' + JSON.stringify(r.plate));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
