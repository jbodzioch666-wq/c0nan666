// RS-361: a serpent is sized by its footprint, not its height. Sized to a tall creature's height, a giant snake's coil
// stretched right across a pyramid's room (a tube thirty times its length); now a snake covers about a tile, a giant one
// two, a mythic serpent three. Tall creatures are sized as before
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    for (let i=0;i<200 && !(sk3Init() && SK3.ok);i++) await new Promise(r=>setTimeout(r, 50));
    const out = {}, T = THREE;
    const foot = (e)=>{ e.holder.updateMatrixWorld(true); const b = new T.Box3().setFromObject(e.holder), sz = b.getSize(new T.Vector3()); return { foot:+Math.max(sz.x, sz.z).toFixed(2), h:+sz.y.toFixed(2), k:+e.root.scale.x.toFixed(2) }; };
    const inst = (m)=>{ const pt = m3dPortrait(m); return pt ? m3dInstance(m, pt) : null; };
    out.snake = foot(inst({ nm:'giant constrictor snake', x:5, y:5, hp:10, maxHp:10, alive:true }));
    out.asp = foot(inst({ nm:'asp', x:5, y:5, hp:10, maxHp:10, alive:true }));
    out.apep = foot(inst({ nm:'Apep', baseNm:'giant constrictor snake', mythicBeastIdx:0, x:5, y:5, hp:10, maxHp:10, alive:true }));
    out.worm = foot(inst({ nm:'purple worm', x:5, y:5, hp:10, maxHp:10, alive:true }));
    out.ogre = foot(inst({ nm:'ogre', x:5, y:5, hp:10, maxHp:10, alive:true }));
    // a snake that keeps moving keeps its shape: the slither wave must not pile up in the coil's points
    { const e = inst({ nm:'giant constrictor snake', x:5, y:5, hp:10, maxHp:10, alive:true }); const f0 = foot(e).foot; for (let i=0;i<400;i++){ e.fol = 0; e.mvS = 1; e.wph = i*0.3; e.anim(e.rig, 1 + i*0.031, 1, 0, 0, 0, e); } out.drift = { before:f0, after:foot(e).foot }; }
    out.szK = { snake:monSizeK({ nm:'giant constrictor snake' }), apep:monSizeK({ nm:'Apep', baseNm:'giant constrictor snake', mythicBeastIdx:0 }) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.snake.foot <= 2.2 && r.snake.foot > 0.8, 'a giant snake covers about two tiles');
  A(!r.asp || (r.asp.foot <= 1.3 && r.asp.foot > 0.5), 'an asp covers about a tile');
  A(r.apep.foot <= 3.5, 'a mythic serpent covers about three tiles, not the room');
  A(r.ogre.h > 1.2, 'a tall creature is sized by height as before');
  A(r.drift.after < r.drift.before*1.25, 'four hundred frames of slithering leave the coil where it was: '+r.drift.before+' -> '+r.drift.after);
};
