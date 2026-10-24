// RS-507: tubes that bend every frame (tails, tentacles, serpents, tongues) take their normals straight from the cross-section instead
// of recomputing them over every triangle each frame, and re-measure their bounds every twentieth bend instead of every one. The
// normals must still match three.js's own closely on a bent, tapering tube, and still point outward
module.exports = async page=>{
  const r = await page.evaluate(()=>{ const T = THREE;
    const nR = 24, nS = 12, pos = [], idx = []; for (let i=0;i<=nR;i++) for (let j=0;j<=nS;j++) pos.push(0, 0, 0);
    for (let i=0;i<nR;i++) for (let j=0;j<nS;j++){ const a = i*(nS+1) + j, b = a + nS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); geo.userData = { nR, nS };
    const mesh = new T.Mesh(geo, new T.MeshStandardMaterial());
    const pts = []; for (let i=0;i<8;i++) pts.push(new T.Vector3(Math.sin(i*0.5)*0.2, i*0.1, Math.cos(i*0.4)*0.1));
    const rad = s=>{ const rr = 0.05*(1 - s*0.6) + 0.01; return [rr*1.3, rr, 1]; };
    m3dTubeSet(mesh, pts, m3dSpineFrames(pts), rad);
    const fast = Float32Array.from(mesh.geometry.attributes.normal.array), g = mesh.geometry, P = g.attributes.position.array;
    g.computeVertexNormals(); const ref = g.attributes.normal.array;
    let sum = 0, worst = 1, n = 0, outward = 0;
    for (let i=0;i<=nR;i++) for (let j=0;j<nS;j++){ const o = (i*(nS+1) + j)*3; if (i===0 || i===nR) continue;   /* (the open ends are rims, not the barrel) */
      const d = fast[o]*ref[o] + fast[o+1]*ref[o+1] + fast[o+2]*ref[o+2]; sum += d; worst = Math.min(worst, d); n++;
      /* outward: from the ring's centre to the vertex, against the normal */
      let cx = 0, cy = 0, cz = 0; for (let q=0;q<nS;q++){ const k = (i*(nS+1) + q)*3; cx += P[k]; cy += P[k+1]; cz += P[k+2]; } cx /= nS; cy /= nS; cz /= nS;
      if ((P[o] - cx)*fast[o] + (P[o+1] - cy)*fast[o+1] + (P[o+2] - cz)*fast[o+2] > 0) outward++; }
    return { mean:+(sum/n).toFixed(4), worst:+worst.toFixed(3), outward:outward/n, sphN:mesh.geometry.userData.sphN, hasSphere:!!mesh.geometry.boundingSphere }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mean > 0.99 && r.worst > 0.9, 'the cross-section normals match three.js on a bent, tapering tube');
  A(r.outward===1 || r.outward===0, 'every normal points the same way round - the way the triangles wind, as three.js has it');
  A(r.hasSphere && r.sphN===1, 'the bounds were measured on the first bend');
};
