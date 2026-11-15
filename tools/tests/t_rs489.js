// RS-489: a bow is drawn at an archer's pace - the swing runs slower and the arrow (and its hit) leaves at the loose - and the drawing
// elbow is drawn back along the arrow's line and level with the shoulder, not hanging down by the ribs
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.ranged = rsMakeBow(2); G.player.rsLastType = 'ranged'; rsSync && rsSync(); const T = THREE, out = {};
    for (const [k, mk] of [['player', ()=>m3dInstance({}, rsPlayerLook())], ['goblin', ()=>m3dInstance({}, m3dPortrait({ nm:'goblin archer' }))]]){
      const e = mk(), sc = new T.Scene(); sc.add(e.holder); m3dPoseHumanoid(e.rig, 1, 0, 1, 0, 0, e); e.holder.updateMatrixWorld(true); sc.onBeforeRender(); e.holder.updateMatrixWorld(true);
      const A = e.rig.arms[e.rig.bowLeft ? 0 : 1], s = A.sh.getWorldPosition(new T.Vector3()), el = A.el.getWorldPosition(new T.Vector3()), fw = new T.Vector3(0, 0, 1).applyQuaternion(e.holder.getWorldQuaternion(new T.Quaternion()));
      const f = A.hand.localToWorld(new T.Vector3(0, -0.04, 0)), ch = e.rig.head.localToWorld(new T.Vector3((e.rig.bowLeft ? -1 : 1)*0.05, -0.03, 0.07)), arm = s.distanceTo(el);
      const piv = e.rig.bowPiv; piv.updateWorldMatrix(true, true); const bw = m3dBowParts(e.rig), ad = new T.Vector3(1, 0, 0).transformDirection(bw.arrow.matrixWorld);
      out[k] = { inLine:+f.clone().sub(el).normalize().dot(ad).toFixed(3), up:+((el.y - s.y)/arm).toFixed(2), toCheek:+f.distanceTo(ch).toFixed(3), bow:rigIsBow(e) }; }
    /* the timing: your swing lasts over a second with a bow, and the arrow waits for the loose */
    const me = m3dInstance({}, rsPlayerLook()), keep = ISO.player; ISO.player = me;
    FP.swing = 1; let n = 0; while (FP.swing > 0 && n < 400){ FP.swing = Math.max(0, FP.swing - 0.01*(rigIsBow(ISO.player) ? BOW_RATE : 1.8)); n++; } out.swingS = +(n*0.01).toFixed(2);
    const on = ISO.on, ok = FPD.ok, ss = ISO.shots; ISO.on = true; FPD.ok = true; ISO.shots = []; isoShot({ x:G.player.x + 3, y:G.player.y }, 'arrow', '#fff', 0); out.lag = +(-ISO.shots[0].t).toFixed(2);
    ISO.shots = []; isoShot({ x:G.player.x + 3, y:G.player.y }, 'spell', '#fff', 0); out.spellLag = +(-ISO.shots[0].t).toFixed(3); out.castFire = +CAST_FIRE.toFixed(3); FP.cast = 0;
    ISO.on = on; FPD.ok = ok; ISO.shots = ss; ISO.player = keep;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['player', 'goblin']){ const o = r[k];
    A(o.bow, k+': is holding a bow');
    A(o.inLine > 0.85, k+': the drawing forearm is back along the arrow');
    A(Math.abs(o.up) < 0.2, k+': the drawing elbow is level with the shoulder');
    A(o.toCheek < 0.03, k+': the hand still at the cheek'); }
  A(r.swingS > 1, 'the bow shot takes over a second');
  A(r.lag > 0.4 && r.lag < 0.5 && r.spellLag === r.castFire, 'the arrow leaves at the loose, a spell as the staff comes forward (RS-703)');
};
