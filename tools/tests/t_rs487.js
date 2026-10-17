// RS-487: a bow shot as an archer makes it, for you and for archers alike: the bow arm straight at the mark, the string drawn back to the
// cheek with an arrow nocked on it (the string bends to the fingers), then loosed - the arrow gone, the string straight, the hand flown back
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.ranged = rsMakeBow(2); G.player.rsLastType = 'ranged'; rsSync && rsSync(); const T = THREE, out = {};
    for (const [k, mk] of [['player', ()=>m3dInstance({}, rsPlayerLook())], ['goblin', ()=>m3dInstance({}, m3dPortrait({ nm:'goblin archer' }))]]){
      const e = mk(), sc = new T.Scene(); sc.add(e.holder); const o = out[k] = {};
      const pose = (w, s)=>{ m3dPoseHumanoid(e.rig, 1, 0, w, s, 0, e); e.holder.updateMatrixWorld(true); sc.onBeforeRender(); e.holder.updateMatrixWorld(true); const bw = e.rig._bw;
        const fing = e.rig.arms[1].hand.localToWorld(new T.Vector3(0, -0.04, 0)), cheek = e.rig.head.localToWorld(new T.Vector3(0.05, -0.03, 0.07)), sh = e.rig.arms[0].sh.getWorldPosition(new T.Vector3()), hand = e.rig.arms[0].hand.getWorldPosition(new T.Vector3());
        const aim = hand.clone().sub(sh).normalize(), fw = new T.Vector3(0, 0, 1).applyQuaternion(e.holder.getWorldQuaternion(new T.Quaternion()));
        return { drawn:!!(bw && bw.top.visible), straight:!!(bw && bw.str.visible), arrow:!!(bw && bw.arrow.visible), toCheek:+fing.distanceTo(cheek).toFixed(3), aimDeg:+(Math.acos(Math.min(1, aim.dot(fw)))*180/Math.PI).toFixed(1), behind:+(cheek.z - fing.z).toFixed(3) }; };
      o.rest = pose(0, 0); o.draw = pose(1, 0); o.loose = pose(0, 0.7); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['player', 'goblin']){ const o = r[k];
    A(!o.rest.drawn && o.rest.straight && !o.rest.arrow, k+': at rest the string is straight, no arrow');
    A(o.draw.drawn && !o.draw.straight && o.draw.arrow, k+': drawn, the string bends back and an arrow is nocked');
    A(o.draw.toCheek < 0.06, k+': the string is drawn to the cheek');
    A(o.draw.aimDeg < 20, k+': the bow arm points at the mark');
    A(!o.loose.arrow && o.loose.straight && o.loose.behind > 0, k+': loosed, the arrow is gone, the string straight, the hand flown back past the cheek'); }
};
