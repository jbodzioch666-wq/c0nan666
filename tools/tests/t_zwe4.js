// (art probe, not in ALL) the kit heads' shape by height band: the centre profile (max z at |x| < 0.012), the width, for m and f; the eyes' and brows' bounds
module.exports = async page=>{ console.log(await page.evaluate(()=>{ const out = []; tpData();
  for (const S of ['m', 'f']){ const g = tpGeo(S + '.head'), P = g.attributes.position; g.computeBoundingBox(); const bb = g.boundingBox, rows = {};
    for (let i=0;i<P.count;i++){ const y = P.getY(i), x = P.getX(i), z = P.getZ(i), b = Math.floor(y*100); const r = rows[b] || (rows[b] = { zc:-9, w:0, zmax:-9, n:0 }); r.n++; if (Math.abs(x) < 0.012) r.zc = Math.max(r.zc, z); r.w = Math.max(r.w, Math.abs(x)); r.zmax = Math.max(r.zmax, z); }
    out.push(S + ' head ' + JSON.stringify(bb.min) + ' ' + JSON.stringify(bb.max) + ' verts ' + P.count);
    for (const b of Object.keys(rows).sort((a, c)=>c - a)) out.push('  y' + (b/100).toFixed(2) + ' zc' + rows[b].zc.toFixed(3) + ' zmax' + rows[b].zmax.toFixed(3) + ' w' + rows[b].w.toFixed(3) + ' n' + rows[b].n);
    for (const k of ['eyes', 'brows']){ const e = tpGeo(S + '.' + k); e.computeBoundingBox(); out.push(S + ' ' + k + ' ' + JSON.stringify(e.boundingBox.min) + ' ' + JSON.stringify(e.boundingBox.max) + ' verts ' + e.attributes.position.count); }
    const SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, D = TPB.data, bones = {}; for (let i=0;i<P.count;i++) for (let j=0;j<4;j++){ const w = SW.getComponent(i, j); if (w > 0.01) bones[D.bones[SI.getComponent(i, j)]] = (bones[D.bones[SI.getComponent(i, j)]]||0) + 1; } out.push(S + ' bones ' + JSON.stringify(bones)); }
  return out.join('\n'); })); };
