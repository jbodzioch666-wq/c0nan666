// RS-540: hair that moves. Each hair card knows how far below the head each part of it hangs (hairW: nothing at the crown, most
// at the ends); the shader carries those parts by the figure's own sway; the sway trails the head on a spring (back as it sets
// off, settling once it stops); each figure in the world sways on its own; and the shader compiles on the GPU
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const mk = ()=>{ const L = Object.assign(lookDefault('Human'), { body:0, hair:2 }), pt = rsPlayerLook({ race:'Human', look:L, bare:true }); return m3dInstance({}, pt); };
    const e = mk(), e2 = mk(); let hair = null; e.root.traverse(o=>{ if (o.name==='hair') hair = o; });
    const W = hair.geometry.attributes.hairW, P = hair.geometry.attributes.position; let top = 0, low = 0;
    for (let i=0;i<P.count;i++){ if (P.getY(i) > 0.13) top = Math.max(top, W.getX(i)); if (P.getY(i) < -0.05) low = Math.max(low, W.getX(i)); }
    out.wTop = top; out.wLow = low;
    /* the GPU compiles it, and the uniform is this figure's own */
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x404040, 1)); sc.add(e.holder); sc.add(e2.holder); e2.holder.position.x = 3;
    const R = new THREE.WebGLRenderer(), cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50); cam.position.set(0, 1, 4); cam.lookAt(0, 0.6, 0); R.setSize(64, 64);
    const errs = []; const ce = console.error; console.error = (...a)=>{ errs.push(a.join(' ').slice(0, 200)); ce.apply(console, a); };
    try{ R.render(sc, cam); } finally { console.error = ce; }
    out.errs = errs; out.compiled = !!(R.properties.get(hair.material).uniforms && R.properties.get(hair.material).uniforms.uHairSw===hair.material.userData.hsw);
    /* walking forward: the ends trail behind, then settle */
    let t = 10; const sw = ()=>hair.material.userData.hsw.value; m3dHairSway(e.rig, t); m3dHairSway(e2.rig, t); let h2 = null; e2.root.traverse(o=>{ if (o.name==='hair') h2 = o; }); const z2 = h2.material.userData.hsw.value.z, base = sw().clone();
    let back = 0; for (let i=0;i<20;i++){ t += 1/60; e.holder.position.z += 0.03; e.holder.updateMatrixWorld(true); m3dHairSway(e.rig, t); m3dHairSway(e2.rig, t); back = Math.min(back, sw().z - base.z); }
    out.back = back; let hair2 = null; e2.root.traverse(o=>{ if (o.name==='hair') hair2 = o; }); out.other = hair2.material.userData.hsw.value.z - z2; out.own = hair2.material!==hair.material;
    for (let i=0;i<120;i++){ t += 1/60; e.holder.updateMatrixWorld(true); m3dHairSway(e.rig, t); }
    out.settled = Math.hypot(sw().x - base.x, sw().y - base.y, sw().z - base.z);
    R.dispose(); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.wTop === 0 && r.wLow > 0.7, 'the crown holds still, the ends move');
  A(r.compiled && r.errs.length === 0, 'the hair shader compiles with its sway');
  A(r.back < -0.008, 'walking forward, the ends trail behind');
  A(r.own && Math.abs(r.other) < 0.002, 'another figure standing still does not sway with it');
  A(r.settled < 0.006, 'stopped, it settles');
};
