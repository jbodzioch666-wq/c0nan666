// (probe, not in ALL; RS-762) where a tucked tail goes inside the robe over a stride: the inside points by pose, height and distance from the root
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, race = 'Tiefling'; G.player.race = race; for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem(); G.gear.weapon = rsMakeStaff(2);
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); G.gear.cape = rsMakeCape(60, 'Saradomin Cape'); rsSync && rsSync();
    const e = m3dInstance({}, rsPlayerLook({ race })), rg = e.rig, hits = [];
    for (let k=0;k<12;k++){ m3dPoseHumanoid(rg, k*0.23, k%3===2 ? 1 : 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); m3dSkirtFollow(rg); e.holder.updateMatrixWorld(true);
      const ax = new T.Vector3(), root = new T.Vector3(), v = new T.Vector3(), d = new T.Vector3(), ray = new T.Raycaster(); rg.hips.getWorldPosition(ax); rg.tail.getWorldPosition(root); rg.skirt.material.side = T.DoubleSide; const Hi = rg.hips.matrixWorld.clone().invert();
      rg.tail.traverse(o=>{ if (!o.isMesh) return; const pa = o.geometry.attributes.position; for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i); o.localToWorld(v); const dr = v.distanceTo(root); if (dr < 0.07) continue;
        d.set(ax.x - v.x, 0, ax.z - v.z); const L = d.length(); ray.set(v, d.normalize()); ray.far = L; if (!ray.intersectObject(rg.skirt, false).length){ const h = v.clone().applyMatrix4(Hi); hits.push([k, +dr.toFixed(2), +h.y.toFixed(2), +h.z.toFixed(2)]); } } }); }
    const by = {}; for (const h of hits){ const key = 'k' + h[0] + ' y' + h[2]; by[key] = (by[key]||0) + 1; } return { n:hits.length, by, sample:hits.slice(0, 12) }; });
  console.log(JSON.stringify(r));
};
