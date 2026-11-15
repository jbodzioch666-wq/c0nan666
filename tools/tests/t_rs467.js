// RS-467: a shield is strapped to the forearm, as a real one is - the arm along its back, the fist near its top - and raised in a fight
// the forearm stands upright before the chest, the shield covering the body, its face to the foe and its point down
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, out = {};
    for (const [k, mk] of [['player', ()=>{ G.gear.offhand = rsMakeArmour('metal', 4, 'offhand'); rsSync && rsSync(); return m3dInstance({}, rsPlayerLook()); }], ['goblin', ()=>m3dInstance({}, m3dPortrait({ nm:'goblin' })) ], ['knight', ()=>m3dInstance({}, m3dPortrait({ nm:'knight' }))]]){
      const e = mk(), rig = e.rig, sh = rig.shield, L = rig.arms[1]; m3dPoseHumanoid(rig, 1, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      const inv = new T.Matrix4().copy(e.holder.matrixWorld).invert(), q = sh.getWorldQuaternion(new T.Quaternion()), hq = e.holder.getWorldQuaternion(new T.Quaternion()).invert(); q.premultiply(hq);
      const face = new T.Vector3(0, -1, 0).applyQuaternion(q), point = new T.Vector3(0, 0, -1).applyQuaternion(q), c = sh.getWorldPosition(new T.Vector3()).applyMatrix4(inv), chest = rig.torso.getWorldPosition(new T.Vector3()).applyMatrix4(inv);
      out[k] = { arm:sh.parent===L.el, faceZ:+face.z.toFixed(2), pointY:+point.y.toFixed(2), ahead:+(c.z - chest.z).toFixed(3), across:+Math.abs(c.x - chest.x).toFixed(3) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['player', 'goblin', 'knight']){ const s = r[k];
    A(s.arm, k+': the shield is strapped to the forearm');
    A(s.faceZ > 0.7 && s.pointY < -0.6, k+': raised, its face is to the foe and its point down');
    A(s.ahead > 0.08 && s.across < 0.16, k+': it covers the body'); }
};
