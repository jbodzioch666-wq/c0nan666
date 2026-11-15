// (probe, not in ALL) what a creature's parts carry into the atlas mesh (ZMON, default giant spider)
module.exports = async page=>{
  const r = await page.evaluate(nm=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true }, pt = m3dPortrait(m), e = m3dInstance(m, pt), out = { drawn:[...m3dAtlas().drawn], kinds:M3D_PAT_KINDS, meshes:[] };
    e.root.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry, mx = g.attributes.aMix, uv = g.attributes.uv, d = { sk:!!o.isSkinnedMesh, atlas:!!o.material.userData.atlas, v:g.attributes.position.count, map:!!o.material.map, mapUuid:o.material.map && o.material.map.uuid.slice(0, 6), rep:o.material.map && o.material.map.repeat.toArray() };
      if (mx){ const t = {}; for (let i=0;i<mx.count;i++){ const k = mx.getZ(i); t[k] = (t[k]||0) + 1; } d.tiles = t; }
      if (uv){ let a = Infinity, b = -Infinity; for (let i=0;i<uv.count;i+=5){ a = Math.min(a, uv.getX(i)); b = Math.max(b, uv.getX(i)); } d.uvX = [+a.toFixed(2), +b.toFixed(2)]; }
      out.meshes.push(d); });
    out.patUuids = {}; for (const k in M3D.pat) out.patUuids[k] = M3D.pat[k].map.uuid.slice(0, 6);
    const at = m3dAtlas(); out.atlasPx = []; const cx = at.mx; for (const i of [0, 3, 8]){ const x = (i % 4)*288 + 144, y = Math.floor(i/4)*288 + 144, p = cx.getImageData(x, y, 4, 1).data; out.atlasPx.push([i, ...p.slice(0, 8)]); }
    return out; }, process.env.ZMON || 'giant spider');
  console.log(JSON.stringify(r));
};
