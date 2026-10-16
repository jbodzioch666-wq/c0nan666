// RS-457: a cloak is pinned at the neck and shoulders - walking, its top stays laid on the shoulders and only the part below the shoulder blades
// swings out (the whole sheet used to swing from its top edge, lifting off the shoulders)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.gear.cape = rsMakeCape(30); rsSync && rsSync(); const e = m3dInstance({}, rsPlayerLook()), c = e.rig.cape;
    const snap = ()=>{ e.holder.updateMatrixWorld(true); const p = c.geometry.attributes.position, v = new THREE.Vector3(), top = [], hem = []; let lo = 0; for (let i=0;i<p.count;i++) lo = Math.min(lo, p.getY(i));
      for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i);   /* (in the body's own frame: the body leans as it walks, and the cloak with it) */ (p.getY(i) > lo*0.08 ? top : (p.getY(i) < lo*0.85 ? hem : [])).push(v.clone()); } return { top, hem }; };
    for (let i=0;i<4;i++) m3dPoseHumanoid(e.rig, 1, 0, 0, 0, 0, e); const a = snap();
    for (let i=0;i<4;i++) m3dPoseHumanoid(e.rig, 1, 1, 0, 0, 0, e); const b = snap();
    const md = (A, B)=>Math.max(...A.map((v, i)=>v.distanceTo(B[i])));
    return { rot:+c.rotation.x.toFixed(3), top:+md(a.top, b.top).toFixed(4), hem:+md(a.hem, b.hem).toFixed(3) }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rot===0, 'the cloak as a whole is never turned off its shoulders');
  A(r.top < 0.004 && r.hem > 0.05, 'walking, its top stays on the shoulders and its hem swings out');
};
