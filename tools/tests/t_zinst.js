// (probe, not in ALL) what an instance of your figure costs, piece by piece
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const T = THREE, out = {}, tm = (k, f)=>{ const t0 = performance.now(); const v = f(); out[k] = +(performance.now() - t0).toFixed(1); return v; };
    const pt = rsPlayerLook(); const tpl = tm('template', ()=>m3dTemplate(pt));
    const e = tm('instance1', ()=>m3dInstance({}, pt)); tm('instance2', ()=>m3dInstance({}, pt));
    const root = e.root; let sm = null; root.traverse(o=>{ if (o.isSkinnedMesh && o.material.userData.atlas) sm = o; });
    tm('clone', ()=>tpl.clone(true)); tm('box', ()=>new T.Box3().setFromObject(root)); tm('box2', ()=>new T.Box3().setFromObject(root));
    if (sm){ sm.boundingBox = null; tm('smBox', ()=>sm.computeBoundingBox()); sm.boundingSphere = null; tm('smSphere', ()=>sm.computeBoundingSphere()); out.smVerts = sm.geometry.attributes.position.count; }
    tm('prune', ()=>gfxPruneCasters(root, 0.1)); tm('matClone', ()=>{ root.traverse(o=>{ if (o.isMesh) o.material.clone(); }); });
    return out; });
  console.log(JSON.stringify(r));
};
