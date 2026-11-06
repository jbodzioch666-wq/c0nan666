// (probe, not in ALL) a creature killed N times (ZMON, default bear): how far its body tips over each time
module.exports = async page=>{
  const r = await page.evaluate(async nm=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); FP.dt = 0.05; const out = [];
    for (let k=0;k<8;k++){ const m = { nm, x:5, y:5, hp:10, maxHp:10, alive:true }; const pt = m3dPortrait(m), e = m3dInstance(m, pt); const g = new THREE.Group(); g.add(e.holder);
      M3D.inst.set(m, e); m3dKill(m); for (let i=0;i<140;i++) m3dSweep();
      out.push(e.chain ? +Math.acos(Math.max(-1, Math.min(1, e.chain.upY))).toFixed(2) : e.rd ? +Math.acos(new THREE.Vector3(0,1,0).applyQuaternion(e.rd.q).y).toFixed(2) : 'other:' + e.dkind); M3D.inst.delete(m); }
    return out; }, process.env.ZMON || 'bear');
  console.log('tip', JSON.stringify(r));
};
