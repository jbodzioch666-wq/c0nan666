// RS-498: the cloth maths went fast without changing a fold - m3dFastNormals writes the very normals computeVertexNormals would
// (checked edge for edge on a deformed skirt and a settled cape), and the cape's bounding sphere is measured once, with room to
// billow, instead of every frame
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {};
    G.gear.cape = rsMakeCape(0, 'Black Cape'); G.gear.chest = rsMakeArmour('cloth', 2, 'chest'); G.gear.legs = rsMakeArmour('cloth', 2, 'legs'); G.player.rsLastType = 'melee';
    const e = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(e.holder); const r2 = e.rig;
    /* walk pose so the skirt folds, then a settled cape */
    r2.legs[0].hip.rotation.x = 0.5; r2.legs[1].hip.rotation.x = -0.4; r2.legs[0].knee.rotation.x = 0.3; r2.legs[1].knee.rotation.x = 0.15; e.holder.updateMatrixWorld(true);
    m3dSkirtFollow(r2); const cape = r2.cape; for (let i=0;i<30;i++) m3dCapeCloth(cape, r2, 1/60);
    const cmp = g=>{ const fast = Float32Array.from(g.attributes.normal.array); g.computeVertexNormals(); const ref = g.attributes.normal.array;
      let worst = 0; for (let i=0;i<ref.length;i+=3){ const d = fast[i]*ref[i] + fast[i+1]*ref[i+1] + fast[i+2]*ref[i+2]; worst = Math.max(worst, 1 - d); } return worst; };
    out.skirtDev = r2.skirt ? +cmp(r2.skirt.geometry).toExponential(1) : 'no skirt';
    out.capeDev = cape ? +cmp(cape.geometry).toExponential(1) : 'no cape';
    /* the cape's bounds: measured once, inflated, and left alone after */
    if (cape){ const u = m3dCapeOwn(cape); out.sphOnce = !!u.sph; const r0 = cape.geometry.boundingSphere.radius; for (let i=0;i<5;i++) m3dCapeCloth(cape, r2, 1/60); out.sphKept = cape.geometry.boundingSphere.radius===r0; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(typeof r.skirtDev==='number' && r.skirtDev < 1e-5, 'the skirt normals match computeVertexNormals');
  A(typeof r.capeDev==='number' && r.capeDev < 1e-5, 'the cape normals match computeVertexNormals');
  A(r.sphOnce && r.sphKept, 'the cape bounds are measured once and kept');
};
