// RS-490: a crossbow is a crossbow - its own model (tiller, prod, stirrup, nut, lever, string, bolt) in its metal's colour - and is
// shot as one: shouldered with the butt at the right shoulder, the right hand on the grip and the left under the fore-end, aimed
// along the bolt at the foe; loosed (string forward, bolt gone, nose kicking up), then lowered and spanned with a fresh bolt
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.ranged = rsMakeCrossbow(3); G.player.rsLastType = 'ranged'; rsSync && rsSync(); const T = THREE, out = {}, keepP = ISO.player, keepM = G.mon;
    try{
      const lk = rsPlayerLook();
      const me = m3dInstance({}, lk), sc = new T.Scene(); sc.add(me.holder); me.holder.position.set(5.5, 0, 5.5); ISO.player = me; const rg = me.rig, piv = rg.xbPiv, xb = piv && piv.children[0];
      out.wk = rg.wk; { const want = new T.Color(G.gear.ranged.rsCol).lerp(new T.Color(0xffffff), 0.15); let hit = false; xb.traverse(o=>{ if (o.isMesh && o.material && o.material.metalness > 0.5){ const c = o.material.color, hs = {}, hw = {}; c.getHSL(hs); want.getHSL(hw); if (Math.abs(hs.h - hw.h) < 0.03 && Math.abs(hs.l - hw.l) < 0.08) hit = true; } }); out.col = hit; } out.parts = ['xbStrL', 'xbStrR', 'xbStrRest', 'xbBolt'].every(n=>piv && piv.getObjectByName(n));
      const p = G.player; p.x = 5; p.y = 5; p.facing = 2; p.faceDiag = null; const fv = FACING_VECT[2];
      const gob = { x:5 + fv[0]*5 + (fv[0] ? 0 : 1), y:5 + fv[1]*5 + (fv[1] ? 0 : 1), alive:true, nm:'goblin' }, ge = m3dInstance({}, m3dPortrait({ nm:'goblin' })); sc.add(ge.holder); ge.holder.position.set(gob.x + 0.5, 0.8, gob.y + 0.5); M3D.inst.set(gob, ge); G.mon = [gob];
      me.holder.rotation.y = Math.atan2(fv[0], fv[1]);
      const pose = (w, s)=>{ m3dPoseHumanoid(rg, 1, 0, w, s, 0, me); me.holder.updateMatrixWorld(true); sc.onBeforeRender(); me.holder.updateMatrixWorld(true);
        const vis = n=>{ let o = piv.getObjectByName(n); while (o && o.visible) o = o.parent===piv ? null : o.parent; return !o; };
        return { spanned:vis('xbStrL'), loosed:vis('xbStrRest'), bolt:vis('xbBolt') }; };
      out.rest = pose(0, 0);
      out.aim = pose(1, 0);
      { const nose = xb.localToWorld(new T.Vector3(0, 0.05, 0.6)), butt = xb.localToWorld(new T.Vector3(0, 0.02, -0.37)), ax = nose.clone().sub(butt).normalize();
        const tgt = ge.holder.getWorldPosition(new T.Vector3()); tgt.y += ge.H*0.55*ge.holder.scale.y; const want = tgt.sub(butt).normalize(), S = me.holder.scale.y;
        const sh = rg.arms[0].sh.getWorldPosition(new T.Vector3()), fing = i=>rg.arms[i].hand.localToWorld(new T.Vector3(0, -0.04, 0));
        out.aimErr = +(Math.acos(Math.min(1, ax.dot(want)))*180/Math.PI).toFixed(1); out.up = +ax.y.toFixed(2);
        out.buttToShoulder = +(butt.distanceTo(sh)/S).toFixed(3);
        out.rightOnGrip = +(fing(0).distanceTo(xb.localToWorld(new T.Vector3(0, 0, 0)))/S).toFixed(3);
        out.leftUnderFore = +(fing(1).distanceTo(xb.localToWorld(new T.Vector3(0, -0.035, 0.4)))/S).toFixed(3); }
      out.kick = pose(0, 0.95); { const n = xb.localToWorld(new T.Vector3(0, 0, 0.6)), b = xb.localToWorld(new T.Vector3(0, 0, -0.37)); out.kickUp = +n.sub(b).normalize().y.toFixed(2); }
      out.respan = pose(0, 0.2); out.reloaded = pose(0, 0.05);
      /* the bolt flies at the loose */
      const on = ISO.on, ok = FPD.ok, ss = ISO.shots; ISO.on = true; FPD.ok = true; ISO.shots = []; isoShot({ x:G.player.x + 3, y:G.player.y }, 'bolt', '#fff', 0); out.lag = +(-ISO.shots[0].t).toFixed(2); ISO.on = on; FPD.ok = ok; ISO.shots = ss;
      /* put away on the back */
      rsSheath(me, false, 1, 1, 0); out.away = rg.weapon.parent===rg.torso ? 'back' : 'other';
    } finally { ISO.player = keepP; G.mon = keepM; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.wk==='xbow' && r.parts && r.col, 'you hold a crossbow, in its metal, with its string and bolt');
  A(r.rest.spanned && r.rest.bolt && !r.rest.loosed, 'carried spanned with a bolt in');
  A(r.aim.spanned && r.aim.bolt, 'aimed, spanned and loaded');
  A(r.aimErr < 8 && r.up > 0.05, 'aimed along the bolt at the goblin on the ledge');
  A(r.buttToShoulder < 0.12, 'the butt in the shoulder');
  A(r.rightOnGrip < 0.05 && r.leftUnderFore < 0.04, 'the right hand on the grip, the left under the fore-end');
  A(r.kick.loosed && !r.kick.bolt && !r.kick.spanned && r.kickUp > r.up + 0.05, 'loosed: string forward, bolt gone, the nose kicking up');
  A(r.respan.spanned && !r.respan.bolt && r.reloaded.bolt, 'then spanned again and a fresh bolt laid in');
  A(r.lag > 0.4 && r.lag < 0.5, 'the bolt leaves at the loose');
  A(r.away==='back', 'put away on the back');
};
