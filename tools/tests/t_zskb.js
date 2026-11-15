// (probe, not in ALL) where the robe's back is behind the tail's root, per race: hips-local z of the skirt's back at the root's height
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); const T = THREE, out = {};
    for (const race of ['Tiefling', 'Dragonborn']){ G.player.race = race; for (const k of ['cape','chest','legs']) G.gear[k] = newItem(); G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); G.gear.legs = rsMakeArmour('cloth', 3, 'legs'); rsSync && rsSync();
      const e = m3dInstance({}, rsPlayerLook({ race })), rg = e.rig; e.holder.updateMatrixWorld(true); const inv = new T.Matrix4().copy(rg.hips.matrixWorld).invert(), v = new T.Vector3(), tp = rg.tail.position.clone();
      const pa = rg.skirt.geometry.attributes.position, rows = {};
      for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa, i); rg.skirt.localToWorld(v); v.applyMatrix4(inv); if (Math.abs(v.x) > 0.03 || v.z > 0) continue; const k = (Math.round(v.y*50)/50).toFixed(2); rows[k] = Math.min(rows[k] ?? 0, +v.z.toFixed(3)); }
      out[race] = { tail:[tp.x, tp.y, tp.z].map(a=>+a.toFixed(3)), rows }; }
    return out; });
  console.log(JSON.stringify(r));
};
