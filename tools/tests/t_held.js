// RS-207: staves and bows are held - upright with the arm low, tipped back over the shoulder on an overhead wind-up; a staff's
// orbs circle its head, not the hand; the shield sits past the fingertips; leaving a dungeon puts you beside its entrance
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    const up = (e, wind)=>{ const sc = new T.Scene(); sc.add(e.holder); m3dPoseHumanoid(e.rig, 0, 0, wind, 0, 0, e); sc.updateMatrixWorld(true); sc.onBeforeRender(); sc.updateMatrixWorld(true);
      let root = e.rig.weapon; while (root && !(root.userData && root.userData.modelRoot)) root = root.parent;
      const qr = new T.Quaternion(), qw = new T.Quaternion(); root.getWorldQuaternion(qr); e.rig.weapon.parent.getWorldQuaternion(qw);
      const v = new T.Vector3(0, 1, 0).applyQuaternion(qr.invert().multiply(qw)); sc.remove(e.holder); return v.toArray().map(x=>+x.toFixed(2)); };
    for (const nm of ['orc shaman','goblin archer']){
      const e = m3dInstance({ nm }, monsterPortraitFor(nm));
      out[nm] = { rest:up(e, 0), wind:up(e, 1) };
      if (nm==='orc shaman') A(out[nm].rest[2] > 0.2 && out[nm].rest[1] > 0.8, nm+': the staff tips forward at rest, like a blade '+JSON.stringify(out[nm]));
      else A(out[nm].rest[1] > 0.95, nm+': upright at rest '+JSON.stringify(out[nm]));
      if (nm==='orc shaman') A(out[nm].wind[2] < -0.5, nm+': tipped back on the wind-up '+JSON.stringify(out[nm]));
      else A(out[nm].wind[1] > 0.9, nm+': a bow stays upright at full draw (the arm is held out, not overhead) '+JSON.stringify(out[nm]));
    }
    const mg = M3D.meta.get(m3dHumanoid({ weapon:'staff', swirl:'#c0a0ff', skin:'#c89070' })).rig;
    A(mg.swirl && mg.swirl.parent===mg.weapon.parent && mg.swirl.position.y > 0.1, 'the orbs circle the staff head '+(mg.swirl && mg.swirl.position.y));
    const kc = m3dInstance({ nm:'kobold chieftain' }, monsterPortraitFor('kobold chieftain'));
    out.shieldY = kc.rig.shield ? kc.rig.shield.position.y : null; A(out.shieldY!==null && out.shieldY <= -0.075, 'the shield is past the fingertips');
    // in and out of a dungeon by its way out: beside the entrance, not on it
    let dx=-1, dy=-1; for (let x=1;x<OW_COLS-1 && dx<0;x++) for (let y=1;y<OW_ROWS-1;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0;
    const P = G.player, ex = G.genStart; let w = null;
    for (const [ddx,ddy] of [[0,1],[1,0],[0,-1],[-1,0]]) if (G.map[ex.x+ddx][ex.y+ddy]===T_FLOOR){ w = [ddx,ddy]; break; }
    P.x = ex.x+w[0]; P.y = ex.y+w[1]; tryMove(-w[0], -w[1]);
    out.out = [G.gameMode, G.owPos.x-dx, G.owPos.y-dy, G.ow.map[G.owPos.x][G.owPos.y]];
    A(G.gameMode===0 && Math.max(Math.abs(G.owPos.x-dx), Math.abs(G.owPos.y-dy)) >= 1 && !OW_SITE_TILES.includes(G.ow.map[G.owPos.x][G.owPos.y]), 'out beside the entrance '+JSON.stringify(out.out));
    return out; });
  console.log(JSON.stringify(r));
};
// RS-208: the sculpted skeletons too - a skeleton mage's staff tips back on the wind-up and forward on the cut
const base = module.exports;
module.exports = async page=>{
  await base(page);
  const r = await page.evaluate(async ()=>{
    try{ sk3Build(); }catch(e){} for (let i=0;i<150 && !SK3.ok;i++) await new Promise(r=>setTimeout(r, 200));
    const T = THREE, e = sk3Instance({ nm:'skeleton mage' }), sc = new T.Scene(); sc.add(e.holder);
    const piv = e.rig.ups[0], tip = atk=>{ sk3Pose(0.3, 0, atk, 0, e.seed||0, e.rig, 0); sc.updateMatrixWorld(true); sc.onBeforeRender(); sc.updateMatrixWorld(true);
      let root = piv; while (!(root.userData && root.userData.modelRoot)) root = root.parent;
      const qa = new T.Quaternion(), qb = new T.Quaternion(); root.getWorldQuaternion(qa); piv.getWorldQuaternion(qb);
      return new T.Vector3(0, 1, 0).applyQuaternion(qa.invert().multiply(qb)).toArray().map(x=>+x.toFixed(2)); };
    return { rest:tip(0), wind:tip(0.34), cut:tip(0.55), arch:sk3Instance({ nm:'skeleton archer' }).rig.ups[0].userData.tip0 }; });
  console.log('skeleton', JSON.stringify(r));
  if (!(r.rest[2] > 0.2 && r.rest[1] > 0.8)) throw new Error('skeleton staff tipped forward at guard '+JSON.stringify(r));
  if (!(r.wind[2] < -0.5)) throw new Error('skeleton staff tips back on the wind-up '+JSON.stringify(r));
  if (!(r.cut[2] > 0.4)) throw new Error('skeleton staff leans forward on the cut '+JSON.stringify(r));
  if (r.arch!==1.3) throw new Error('skeleton bow follows the arm too');
};
