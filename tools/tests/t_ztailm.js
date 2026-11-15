// (probe, not in ALL; RS-762) the robe's back and the cape's hem in the hips' frame, for the tail's path under a cape
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear();
    const T = THREE, out = {};
    for (const [nm, tier, cape] of [['c3', 3, 60], ['c0', 0, 60], ['c4', 4, 60]]){ const p = G.player; p.race = 'Tiefling'; for (const k of ['weapon','offhand','ranged','cape','chest','legs']) G.gear[k] = newItem();
      G.gear.chest = rsMakeArmour('cloth', tier, 'chest'); G.gear.legs = rsMakeArmour('cloth', tier, 'legs'); G.gear.cape = rsMakeCape(cape, 'Saradomin Cape'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook({ race:'Tiefling' })), rg = e.rig; m3dPoseHumanoid(rg, 0, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); m3dSkirtFollow(rg); e.holder.updateMatrixWorld(true);
      const Hi = rg.hips.matrixWorld.clone().invert(), v = new T.Vector3(), sk = {}, cp = {}; let cMin = 9, cMax = -9;
      const scan = (m, bins, fn)=>{ const pa = m.geometry.attributes.position; for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i).applyMatrix4(m.matrixWorld).applyMatrix4(Hi); if (Math.abs(v.x) > 0.04) continue; fn(v); } };
      scan(rg.skirt, sk, v=>{ const k = Math.round(v.y*20)/20; if (v.z < 0 && (sk[k]===undefined || v.z < sk[k])) sk[k] = +v.z.toFixed(3); });
      if (rg.cape) scan(rg.cape, cp, v=>{ cMin = Math.min(cMin, v.y); cMax = Math.max(cMax, v.y); const k = Math.round(v.y*20)/20; if (cp[k]===undefined || v.z > cp[k]) cp[k] = +v.z.toFixed(3); });
      const caps = (rg.tail.userData.caps||[]).map(c=>{ const w = new T.Vector3(c[0].x, c[0].y, c[0].z); rg.tail.localToWorld(w); w.applyMatrix4(Hi); return [+w.y.toFixed(3), +w.z.toFixed(3)]; }); out[nm] = { caps, tailRot:rg.tail.rotation.x, skirtPar:rg.skirt.parent===rg.hips, skirt:sk, cape:cp, cMin:+cMin.toFixed(3), cMax:+cMax.toFixed(3), tailPos:rg.tail.position.toArray().map(n=>+n.toFixed(3)), hipsW:+new T.Vector3().setFromMatrixPosition(rg.hips.matrixWorld).y.toFixed(3) }; }
    return out; });
  console.log(JSON.stringify(r));
};
