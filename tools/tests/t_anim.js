// RS-172: animation - strides set off and settle smoothly (RS-175: at the old steady pace),
// creatures look where they walk, and a monster swings whenever it strikes at you, hit or miss
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const wait = ()=>new Promise(r=>setTimeout(r, 6)), out = {};
    // the stride: walk a figure a tile and a half at two speeds - the leg cycles match the ground, not the time taken
    const e = m3dInstance({}, rsPlayerLook()); FPD.scene.add(e.holder);
    const walk = async (dist, n)=>{ const w0 = e.wph||0; for (let i=0;i<=n;i++){ e.holder.position.set(5 + dist*i/n, 0, 5); e.holder.updateMatrixWorld(true); m3dPoseHumanoid(e.rig, FP.t, 1, 0, 0, 0, e); await wait(); } return (e.wph||0) - w0; };
    await walk(0, 1);
    // (RS-175) the legs keep a steady beat while walking - the old pace, about 9 radians a second, however far it goes
    const t0 = performance.now(), slow = await walk(1.5, 30), secs = (performance.now() - t0)/1000;
    out.stride = { rate:+(slow/secs).toFixed(2) };
    { const w0 = e.wph; for (let i=0;i<6;i++){ m3dPoseHumanoid(e.rig, FP.t, 0, 0, 0, 0, e); await new Promise(r=>setTimeout(r, 20)); } out.stillAdv = +(e.wph - w0).toFixed(3); }
    // standing still while "walking" (a preview) still steps on the clock
    { const w0 = e.wph; for (let i=0;i<6;i++){ m3dPoseHumanoid(e.rig, FP.t, 1, 0, 0, 0, e); await new Promise(r=>setTimeout(r, 20)); } out.treadmill = +(e.wph - w0).toFixed(3); }
    FPD.scene.remove(e.holder);
    // setting off and stopping ease in and out
    { const f = {}; const a = [m3dEaseMv(f, 1, 0.016), m3dEaseMv(f, 1, 0.016)]; for (let i=0;i<40;i++) m3dEaseMv(f, 1, 0.016); const top = f.mvS; const b = m3dEaseMv(f, 0, 0.016);
      out.ease = { first:+a[0].toFixed(2), second:+a[1].toFixed(2), top, stop1:+b.toFixed(2) }; }
    // a creature walking away from you looks where it's going; standing, it turns to you
    const m = G.mon.find(o=>o.alive && m3dPortrait(o) && !sk3Wanted(o));
    if (m){ const p = G.player; m.x = p.x + 3; m.y = p.y; const me = m3dInstance(m, m3dPortrait(m)); FPD.scene.add(me.holder); const keepDt = FP.dt; FP.dt = 0.05;
      const pos = { x:m.x - 0.5, y:m.y + 0.5, mv:1 };   // mid-step east, away from you
      for (let i=0;i<40;i++) m3dPose(me, pos, m, 1, 0);
      out.faceWalk = +me.face.toFixed(2); out.wantWalk = +Math.atan2(1, 0).toFixed(2);
      const still = { x:m.x + 0.5, y:m.y + 0.5, mv:0 }; for (let i=0;i<60;i++) m3dPose(me, still, m, 0, 0);
      out.faceStill = +me.face.toFixed(2); out.wantStill = +Math.atan2(p.x + 0.5 - still.x, p.y + 0.5 - still.y).toFixed(2);
      // it strikes at you and misses: it still swings
      p.hp = p.maxHp = 9999; p.ac = 999; const idx = G.mon.indexOf(m); m.x = p.x + 1; m.y = p.y;
      FP.t += 0.5; monsterStrikesPlayer(idx, 'lunges', 'lunges at'); m3dPose(me, { x:m.x + 0.5, y:m.y + 0.5, mv:0 }, m, 0, 0);
      out.swing = +me.atk.toFixed(2); FP.dt = keepDt; FPD.scene.remove(me.holder); }
    // RS-173: a blow in three beats - a quick release, then a follow-through that eases back
    { const c = x=>m3dAtkCurve(x); out.curve = { windGone:c(0.5).wind, peak:+c(0.52).strike.toFixed(2), late:+c(0.75).strike.toFixed(2), fol:+Math.max(...[0.55,0.6,0.65,0.7,0.75].map(x=>c(x).fol)).toFixed(2), done:c(0.99).strike + c(0.99).fol < 0.05 }; }
    // and the follow-through shows on the figure
    { const f = m3dInstance({}, rsPlayerLook()); f.fol = 0; m3dPoseHumanoid(f.rig, 1, 0, 0, 0.5, 0, f); const a0 = f.rig.arms[0].sh.rotation.x, t0 = f.rig.torso.rotation.y;
      f.fol = 1; m3dPoseHumanoid(f.rig, 1, 0, 0, 0.5, 0, f); out.folPose = { arm:+(f.rig.arms[0].sh.rotation.x - a0).toFixed(2), torso:+(f.rig.torso.rotation.y - t0).toFixed(2) }; }
    // hit reactions: as big as the blow, rocking back and settling
    { const react = fr=>{ const h = {}; m3dHitReact(h, 100, 100, 0.016); m3dHitReact(h, 100 - fr*100, 100, 0.016); let peak = 0, low = 0, end = 0; for (let i=0;i<100;i++){ const v = m3dHitReact(h, 100 - fr*100, 100, 0.016); peak = Math.max(peak, v); low = Math.min(low, v); end = v; } return { peak:+peak.toFixed(2), low:+low.toFixed(2), end }; };
      out.hit = { light:react(0.03), heavy:react(0.3) }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.stride.rate > 6.5 && r.stride.rate < 10, 'the legs step at the old steady pace while walking');
  A(r.stillAdv===0, 'standing still, the legs rest');
  A(r.treadmill > 0.1, 'a figure walking on the spot still steps');
  A(r.ease.first > 0.05 && r.ease.first < 0.4 && r.ease.second > r.ease.first && r.ease.top===1 && r.ease.stop1 > 0.7, 'the stride swells as it sets off and settles as it stops');
  A(r.curve.windGone===0 && r.curve.peak > 0.95 && r.curve.late > 0.3 && r.curve.fol > 0.5 && r.curve.done, 'a swing winds up, releases fast, follows through and eases back');
  A(r.folPose.arm > 0.2 && r.folPose.torso < -0.2, 'the follow-through carries the arm on and turns the shoulders');
  A(r.hit.heavy.peak===0 && r.hit.light.peak===0, 'no hit reactions (RS-175: taken out)');
  if (r.faceWalk!==undefined){
    const ang = (a, b)=>Math.abs(Math.atan2(Math.sin(a-b), Math.cos(a-b)));
    A(ang(r.faceWalk, r.wantWalk) < 0.15, 'a creature walking off looks where it goes');
    A(ang(r.faceStill, r.wantStill) < 0.15, 'standing, it turns to face you');
    A(r.swing > 0.15, 'a monster swings when it strikes at you, even on a miss');
  }
};
