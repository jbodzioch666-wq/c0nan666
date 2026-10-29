// (probe, not in ALL) the willow's shadow on open ground, the sun high and then lower: the woodcutting willow (o3NodeTree) and, if
// the 3D land has one, a scenery willow's own instanced mesh. Shot: shots/zwillow.png, from above and from the side
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    for (let i=0;i<200 && !(O3.scene);i++) await new Promise(r=>requestAnimationFrame(r)); for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    const T = THREE, info = {}, trees = [];
    const node = o3NodeTree('willow'); trees.push(['node', node]); const n1 = o3NodeTree('willow'); n1.traverse(o=>{ if (o.isMesh && o.material.shadowSide===2){ o.material = o.material.clone(); o.material.shadowSide = null; } }); trees.push(['node, one-sided shadow', n1]);
    let deco = null; O3.scene && O3.scene.traverse(o=>{ if (!deco && o.isInstancedMesh && o.userData.kind==='willow') deco = o; });
    info.deco = !!deco; info.decoParts = [];
    if (deco){ const g = new T.Group(); deco.parent.children.forEach(o=>{ if (o.isInstancedMesh && o.userData.kind==='willow'){ const m = new T.Mesh(o.geometry, o.material); m.castShadow = true; g.add(m); info.decoParts.push({ side:o.material.side, shadowSide:o.material.shadowSide, alpha:!!o.material.alphaMap }); } }); trees.push(['deco', g]); }
    node.traverse(o=>{ if (o.isMesh && o.geometry.type==='SphereGeometry' || (o.isMesh && o.material.shadowSide===2)) info.node = { side:o.material.side, shadowSide:o.material.shadowSide, alpha:!!o.material.alphaMap }; });
    const W = 320, H = 320, cv = document.createElement('canvas'); cv.width = W*4; cv.height = H*trees.length; const R = gfxThreeR(new T.WebGLRenderer({ canvas:cv, antialias:true })); R.setSize(W*4, H*trees.length, false); R.setScissorTest(true);
    R.shadowMap.enabled = true; R.shadowMap.type = O3.r ? O3.r.shadowMap.type : T.PCFSoftShadowMap; R.outputColorSpace = T.SRGBColorSpace;
    trees.forEach(([nm, tr], row)=>{ [[0.3, 4, 0.2, 'top'], [2.5, 3, 1.2, 'top'], [0.3, 4, 0.2, 'side'], [2.5, 3, 1.2, 'side']].forEach(([lx, ly, lz, view], k)=>{
      const sc = new T.Scene(); sc.background = new T.Color('#88aacc'); sc.add(new T.HemisphereLight(0xffffff, 0x404040, 0.5));
      const dl = new T.DirectionalLight(0xffffff, 2.5); dl.position.set(lx, ly, lz).multiplyScalar(2); dl.castShadow = true; dl.shadow.mapSize.set(1024, 1024); Object.assign(dl.shadow.camera, { left:-3, right:3, top:3, bottom:-3, near:0.1, far:30 }); dl.shadow.camera.updateProjectionMatrix(); sc.add(dl);
      const gr = new T.Mesh(new T.PlaneGeometry(8, 8), new T.MeshStandardMaterial({ color:0x88aa66 })); gr.rotation.x = -Math.PI/2; gr.receiveShadow = true; sc.add(gr);
      const t2 = tr.clone(); sc.add(t2); const bb = new T.Box3().setFromObject(t2), hh = bb.max.y;
      const cam = new T.PerspectiveCamera(40, 1, 0.01, 50); if (view==='top'){ cam.position.set(0.01, hh*3.2, 0.01); } else { cam.position.set(hh*1.6, hh*1.2, hh*2.2); } cam.lookAt(0, view==='top' ? 0 : hh*0.4, 0);
      R.setViewport(k*W, (trees.length - 1 - row)*H, W, H); R.setScissor(k*W, (trees.length - 1 - row)*H, W, H); R.render(sc, cam); }); });
    return { info, shot:cv.toDataURL('image/png') }; });
  require('fs').writeFileSync(SHOTS + '/zwillow.png', Buffer.from(r.shot.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info));
};
