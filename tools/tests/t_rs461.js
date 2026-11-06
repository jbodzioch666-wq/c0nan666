// RS-461: a town full of cloaks keeps its frame rate - only you and folk within a few steps of you wear simulated cloth; the rest swing
// their cloaks the old cheap way, and folk away from you refold their robes every other frame (a tiefling town, its folk all cloaked,
// had spent 33ms a frame on cloth)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const P = V3.player, k = P.e.holder.scale.y*(P.e.H||1), pt = m3dPortrait({ nm:'knight' }), mk = d=>{ const e = m3dInstance({}, Object.assign({}, pt, { o:Object.assign({}, pt.o, { cape:'#6a2a2a' }) })); P.g.parent.add(e.holder); P.e.holder.updateMatrixWorld(true); const w = new THREE.Vector3(); P.e.holder.getWorldPosition(w); e.holder.position.copy(P.g.parent.worldToLocal(w.clone())).add(new THREE.Vector3(d, 0, 0)); e.holder.updateMatrixWorld(true); return e; };
    const near = mk(0.5*k), far = mk(12*k), out = {};
    const fc = far.rig.cape, a0 = Float32Array.from(fc.geometry.attributes.position.array);
    for (let i=0;i<6;i++){ m3dPoseHumanoid(near.rig, 1 + i*0.3, 1, 0, 0, 0, near); m3dPoseHumanoid(far.rig, 1 + i*0.3, 1, 0, 0, 0, far); }
    out.nearCloth = !!near.rig.cape.userData.P; out.farCloth = !!fc.userData.P; out.heroOn = m3dClothOn(P.e.rig) || !P.e.rig.cape;
    let mv = 0; const a1 = fc.geometry.attributes.position.array; for (let i=0;i<a1.length;i++) mv = Math.max(mv, Math.abs(a1[i] - a0[i])); out.farSwings = +mv.toFixed(4);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.nearCloth && r.heroOn, 'you and folk beside you wear cloth');
  A(!r.farCloth, 'folk across the square do not');
  A(r.farSwings > 0.005, 'but their cloaks still swing as they walk');
};
