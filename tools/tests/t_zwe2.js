// (art probe, not in ALL) the sculpted body's bind frames: which local axis of the spine, neck and head bones points where, and the body's forward
module.exports = async page=>{ console.log(await page.evaluate(()=>{ const T = THREE, D = tpData(), out = [];
  const W0 = TPB.inv[D.parts['m.peasant.Body'].inv].map(m=>m.clone().invert());
  for (const n of ['pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'Head', 'clavicle_r', 'upperarm_r']){ const i = D.bones.indexOf(n), m = W0[i], x = new T.Vector3(), y = new T.Vector3(), z = new T.Vector3(); m.extractBasis(x, y, z); const p = new T.Vector3().setFromMatrixPosition(m);
    out.push(n + ' p' + p.toArray().map(v=>v.toFixed(3)) + ' x' + x.toArray().map(v=>v.toFixed(2)) + ' y' + y.toArray().map(v=>v.toFixed(2)) + ' z' + z.toArray().map(v=>v.toFixed(2))); }
  const g = tpGeo('m.eyes'); g.computeBoundingBox(); out.push('eyes ' + JSON.stringify(g.boundingBox)); const h = tpGeo('m.head'); h.computeBoundingBox(); out.push('head ' + JSON.stringify(h.boundingBox));
  const b = tpGeo('m.peasant.Body'); b.computeBoundingBox(); out.push('body ' + JSON.stringify(b.boundingBox)); out.push('parts ' + Object.keys(D.parts).filter(k=>/^m\./.test(k)).join(' '));
  return out.join('\n'); })); };
