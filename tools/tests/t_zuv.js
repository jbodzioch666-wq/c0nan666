// (probe, not in ALL) how the robe's pieces map their weave: a few vertices of the bodice, a sleeve and the skirt, position against uv
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); G.player.look.body = 1; const e = m3dInstance({}, rsPlayerLook()), rig = e.rig, out = {};
    const samp = (m, nm)=>{ if (!m) return; const g = m.geometry.userData.from || m.geometry, p = g.attributes.position, uv = g.attributes.uv; const rows = [];
      for (let i=0;i<p.count;i+=Math.max(1, Math.floor(p.count/6))) rows.push([+p.getX(i).toFixed(3), +p.getY(i).toFixed(3), +p.getZ(i).toFixed(3), uv ? +uv.getX(i).toFixed(3) : null, uv ? +uv.getY(i).toFixed(3) : null]);
      const mt = m.material; out[nm] = { n:p.count, type:g.type, mat:mt && mt.type, map:!!(mt && mt.map), rep:mt && mt.map ? [mt.map.repeat.x, mt.map.repeat.y] : null, col:mt && mt.color ? '#' + mt.color.getHexString() : null, vc:!!(mt && mt.vertexColors), scale:[m.scale.x, m.scale.y, m.scale.z].map(v=>+v.toFixed(3)), rows }; };
    samp(rig.chestMesh, 'bodice'); samp(rig.skirt, 'skirt');
    let sl = null; rig.arms[0].sh.traverse(o=>{ if (!sl && o.isMesh && o.material && o.material.map && o.geometry.attributes.position.count > 200) sl = o; }); samp(sl, 'sleeve');
    return out; });
  for (const k in r) console.log(k, JSON.stringify(r[k]));
};
