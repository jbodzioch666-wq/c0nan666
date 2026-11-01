// (art probe, not in ALL) the kit's parts: each one's texture, bones (by weight) and bounds
module.exports = async page=>{ console.log(await page.evaluate(()=>{ const D = tpData(), out = [];
  for (const k in D.parts){ const g = tpGeo(k), P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, bones = {}; for (let i=0;i<P.count;i++) for (let j=0;j<4;j++){ const w = SW.getComponent(i, j); if (w > 0.2) bones[D.bones[SI.getComponent(i, j)]] = (bones[D.bones[SI.getComponent(i, j)]]||0) + 1; }
    g.computeBoundingBox(); const b = g.boundingBox; out.push(k + ' tex=' + D.parts[k].tex + ' n=' + P.count + ' y' + b.min.y.toFixed(2) + '..' + b.max.y.toFixed(2) + ' x' + b.max.x.toFixed(2) + ' z' + b.min.z.toFixed(2) + '..' + b.max.z.toFixed(2) + ' ' + Object.entries(bones).sort((a, c)=>c[1] - a[1]).slice(0, 8).map(([n, c])=>n + ':' + c).join(',')); }
  out.push('tex ' + Object.keys(D.tex).join(' ')); return out.join('\n'); })); };
