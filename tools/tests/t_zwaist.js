// (probe, not in ALL) a woman's body under a robe: the bodice's and the pelvis's breadth and depth by height, and the robe's cloth there
module.exports = async page=>{
  const r = await page.evaluate(async ZW=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.player.look.body = 1; G.player.look.bd = { waist:ZW }; const L = rsPlayerLook(), e = m3dInstance({}, L), rig = e.rig, out = { waistW:L.o.waistW };
    const prof = (m, nm)=>{ if (!m) return; const g = m.geometry.userData.from || m.geometry, q = g.attributes.position, rows = {};
      for (let i=0;i<q.count;i++){ const Y = q.getY(i)*m.scale.y + m.position.y, k = Math.round(Y*50)/50, X = Math.abs(q.getX(i)*m.scale.x + m.position.x), Z = Math.abs(q.getZ(i)*m.scale.z + m.position.z); const r0 = rows[k] || (rows[k] = [0, 0]); if (X > r0[0]) r0[0] = X; if (Z > r0[1]) r0[1] = Z; }
      out[nm] = Object.keys(rows).map(Number).sort((a, b)=>a - b).filter(k=>k > -0.1 && k < 0.33).map(k=>k.toFixed(2) + ':' + rows[k].map(v=>v.toFixed(3)).join('/')).join(' '); };
    prof(rig.chestMesh, 'bodice'); prof(rig.pelvisMesh, 'pelvis'); prof(rig.skirt, 'skirt'); out.skirtY0 = rig.skirt.position.y; out.pelvisVis = rig.pelvisMesh && rig.pelvisMesh.visible;
    return out; }, +(process.env.ZW || 0.5));
  for (const k in r) console.log(k, JSON.stringify(r[k]));
};
