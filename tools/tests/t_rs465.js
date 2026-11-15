// RS-465: two-handed weapons are swung with both hands - the left hand stays on the grip through the guard and the whole blow - and each
// has its own blow: a greatsword cleaves, a great axe or halberd chops, a spear or trident thrusts, a quarterstaff sweeps. A wizard's staff
// (and a spear with a shield) stay one-handed, and a quarterstaff is plain wood, without a wizard's motes
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, out = {};
    const make = (wk, basis, extra)=>{ const pt = m3dPortrait({ nm:'knight' }), o = Object.assign({}, pt.o, { weapon:wk, weaponBasis:basis, shield:null, swing:null, tome:null, offWeapon:null }, extra||{}); return m3dInstance({}, Object.assign({}, pt, { o })); };
    for (const [k, wk, basis] of [['greatsword','greatsword','Greatsword'], ['halberd','spear','Halberd'], ['spear','spear','Spear'], ['quarterstaff','staff','Quarterstaff'], ['greataxe','greataxe',''], ['trident','trident','']]){
      const e = make(wk, basis); let gap = 0, moved = 0; const p0 = new T.Vector3();
      for (let a=0;a<=1.001;a+=0.05){ const C = m3dAtkCurve(a); m3dPoseHumanoid(e.rig, 1, 0, C.wind, C.strike, 0, e); e.holder.updateMatrixWorld(true);
        const tw = e.rig.g2.clone().applyMatrix4(e.rig.arms[0].hand.matrixWorld), lh = e.rig.arms[1].hand.localToWorld(new T.Vector3(0, -0.04, 0)); gap = Math.max(gap, tw.distanceTo(lh));
        const hp = e.rig.arms[0].hand.getWorldPosition(new T.Vector3()); if (a===0) p0.copy(hp); else moved = Math.max(moved, hp.distanceTo(p0)); }
      out[k] = { two:!!e.rig.grip2, swing:e.rig.swing, gap:+gap.toFixed(3), moved:+moved.toFixed(3) }; }
    out.wizard = !!make('staff', 'Staff of Air').rig.grip2;
    out.spearShield = !!make('spear', 'Spear', { shield:{ col:'#5a3a20' } }).rig.grip2;
    G.gear.weapon = Object.assign(newItem(), { used:1, slot:'weapon', basis:'Quarterstaff', nm:'Quarterstaff', d1:1, d2:6 }); out.qsSwirl = rsPlayerLook().o.swirl || null;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const want = { greatsword:'cleave2', halberd:'chop2', spear:'thrust2', quarterstaff:'sweep2', greataxe:'chop2', trident:'thrust2' };
  for (const k in want){ A(r[k].two && r[k].swing===want[k], k+' is two-handed with its own blow'); A(r[k].gap < 0.01, k+': the left hand stays on the grip'); A(r[k].moved > 0.1, k+': the blow moves the weapon'); }
  A(!r.wizard && !r.spearShield, "a wizard's staff and a spear with a shield are one-handed");
  A(!r.qsSwirl, 'a quarterstaff has no motes');
};
