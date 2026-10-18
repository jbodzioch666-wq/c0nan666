// RS-340: a creature with several heads (the hydras, the King Black Dragon) keeps its necks and heads apart - through the
// whole of its idle sway, its wind-up and its strike - instead of clipping through one another (where they leave the body,
// at the root, they may meet - they grow from one shoulder)
module.exports = async page=>{
  await page.evaluate(()=>{ M3D_SKIN = false; if (M3D.tpl) M3D.tpl.clear(); });   // (the parts as built, not merged into skinned meshes - this test looks at them one by one)
  const r = await page.evaluate(()=>{
    const T = THREE, out = {};
    for (const nm of ['hydra', 'hydra of the tides', 'king black dragon']){
      const pt = m3dPortrait({ nm }), e = m3dInstance({ nm }, pt), rig = e.rig, N = rig.necks; let worstNeck = 1e9, worstHead = 1e9;
      const P = new T.Vector3();
      for (const [t, mv, wind, strike] of [[0,0,0,0],[0.7,0,0,0],[1.9,0,0,0],[3.3,1,0,0],[4.1,0,1,0],[5.2,0,0,1],[6.6,0,0.5,0],[8.4,1,0,0],[10.2,0,0,0],[12.9,0,0,0]]){
        e.anim(rig, t, mv, wind, strike, 0, e); e.holder.updateMatrixWorld(true);
        const inv = new T.Matrix4().copy(N[0].J[0].parent.parent.matrixWorld).invert(), loc = o=>o.getWorldPosition(new T.Vector3()).applyMatrix4(inv);   /* (in the body's own frame) */
        const pts = N.map(n=>n.J.slice(2).map(loc)), hd = N.map(n=>loc(n.head));
        for (let a=0;a<N.length;a++) for (let b=a+1;b<N.length;b++){
          for (const p of pts[a]) for (const q of pts[b]) worstNeck = Math.min(worstNeck, p.distanceTo(q));
          worstHead = Math.min(worstHead, hd[a].distanceTo(hd[b])); }
      }
      // in the body's frame too: how thick a neck segment is, how wide a head (their own geometry, at their own scale)
      const sg = N[0].J[2].children.find(c=>c.isMesh); sg.geometry.computeBoundingBox(); const nb = sg.geometry.boundingBox.getSize(new T.Vector3()).multiplyScalar(sg.scale.x);
      const hm = N[0].head.children.find(c=>c.isMesh); hm.geometry.computeBoundingBox(); const hs = hm.geometry.boundingBox.getSize(new T.Vector3()).multiplyScalar(N[0].head.scale.x);
      const nk = nb, hb = hs;
      out[nm] = { heads:N.length, neckGap:+(worstNeck / Math.max(nk.x, nk.y)).toFixed(2), headGap:+(worstHead / hb.x).toFixed(2) };
    }
    return out; });
  console.log(JSON.stringify(r));
  for (const k in r){ const v = r[k];
    if (v.neckGap < 1.05) throw new Error(`${k}: its necks pass through each other (closest ${v.neckGap} neck widths apart)`);
    if (v.headGap < 1.1) throw new Error(`${k}: its heads overlap (closest ${v.headGap} head widths apart)`); }
};
