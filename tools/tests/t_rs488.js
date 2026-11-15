// RS-488: the bow is held in the left hand and drawn with the right; the arrow lies on the bow hand's thumb beside the grip; and the
// bow arm is raised at the foe itself - you at the nearest monster in front, an archer at you - a little higher the further it is
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.ranged = rsMakeBow(2); G.player.rsLastType = 'ranged'; rsSync && rsSync(); const T = THREE, out = {}, keepP = ISO.player, keepM = G.mon;
    const shoot = (e, sc)=>{ m3dPoseHumanoid(e.rig, 1, 0, 1, 0, 0, e); e.holder.updateMatrixWorld(true); sc.onBeforeRender(); e.holder.updateMatrixWorld(true); };
    const aimDir = e=>{ const A = e.rig.arms[e.rig.bowLeft ? 1 : 0]; return A.hand.getWorldPosition(new T.Vector3()).sub(A.sh.getWorldPosition(new T.Vector3())).normalize(); };
    try{
      /* you, aiming at a goblin up on a ledge off to the side */
      const me = m3dInstance({}, rsPlayerLook()), sc = new T.Scene(); sc.add(me.holder); me.holder.position.set(5.5, 0, 5.5); ISO.player = me;
      const p = G.player; p.x = 5; p.y = 5; p.facing = 2; p.faceDiag = null; const fv = FACING_VECT[2];
      const gob = { x:5 + fv[0]*5 + (fv[0] ? 0 : 1), y:5 + fv[1]*5 + (fv[1] ? 0 : 1), alive:true, nm:'goblin' }, ge = m3dInstance({}, m3dPortrait({ nm:'goblin' })); sc.add(ge.holder); ge.holder.position.set(gob.x + 0.5, 1.2, gob.y + 0.5); M3D.inst.set(gob, ge); G.mon = [gob];
      me.holder.rotation.y = Math.atan2(fv[0], fv[1]); shoot(me, sc);
      const bw = me.rig._bw || me.rig.bowPiv.children[0].userData.bow, sp = me.rig.arms[1].sh.getWorldPosition(new T.Vector3()), tgt = ge.holder.getWorldPosition(new T.Vector3()); tgt.y += ge.H*0.55*ge.holder.scale.y;
      const want = tgt.clone().sub(sp).normalize(), got = aimDir(me);
      out.left = !!me.rig.bowLeft; let o = me.rig.bowPiv; while (o && o !== me.rig.arms[1].hand && o !== me.rig.arms[0].hand) o = o.parent; out.inLeft = o === me.rig.arms[1].hand;
      out.aimErr = +(Math.acos(Math.min(1, want.dot(got)))*180/Math.PI).toFixed(1); out.aimUp = +got.y.toFixed(3);
      /* the arrow lies along the bow hand's thumb: its line passes the rest point, which sits at the fist */
      const ar = bw.arrow, nock = ar.getWorldPosition(new T.Vector3()), dir = new T.Vector3(1, 0, 0).transformDirection(ar.matrixWorld), rest = bw.arc.localToWorld(new T.Vector3(0, bw.R*0.07, (bw.arc.worldToLocal(ar.getWorldPosition(new T.Vector3())).z < 0 ? -1 : 1)*bw.R*0.05)), fist = me.rig.arms[1].hand.getWorldPosition(new T.Vector3());
      const off = rest.clone().sub(nock), lineMiss = off.clone().sub(dir.clone().multiplyScalar(off.dot(dir))).length();
      out.arrow = ar.visible; out.lineMiss = +lineMiss.toFixed(3); out.restToFist = +rest.distanceTo(fist).toFixed(3);
      /* with nothing in front, straight ahead */
      G.mon = []; shoot(me, sc); const fw = new T.Vector3(0, 0, 1).applyQuaternion(me.holder.getWorldQuaternion(new T.Quaternion())); out.freeErr = +(Math.acos(Math.min(1, fw.dot(aimDir(me))))*180/Math.PI).toFixed(1);
      /* a goblin archer down in a pit aims up at you */
      const ar2 = m3dInstance({}, m3dPortrait({ nm:'goblin archer' })); sc.add(ar2.holder); ar2.holder.position.set(5.5, -1.5, 9.5); ar2.holder.rotation.y = Math.PI; shoot(ar2, sc);
      const sp2 = ar2.rig.arms[ar2.rig.bowLeft ? 1 : 0].sh.getWorldPosition(new T.Vector3()), mp = me.holder.getWorldPosition(new T.Vector3()); mp.y += 0.4*me.holder.scale.y;
      out.monErr = +(Math.acos(Math.min(1, mp.sub(sp2).normalize().dot(aimDir(ar2))))*180/Math.PI).toFixed(1); out.monUp = +aimDir(ar2).y.toFixed(3);
    } finally { ISO.player = keepP; G.mon = keepM; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.left && r.inLeft, 'the bow is in the left hand');
  A(r.arrow && r.lineMiss < 0.01 && r.restToFist < 0.09, 'the arrow lies on the bow hand, beside the grip');
  A(r.aimErr < 12 && r.aimUp > 0.1, 'the bow arm is raised at the goblin on the ledge');
  A(r.freeErr < 15, 'with no foe in front, the bow points straight ahead');
  A(r.monErr < 12 && r.monUp > 0.2, 'an archer in a pit aims up at you');
};
