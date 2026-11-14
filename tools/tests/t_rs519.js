// RS-519: the duergar scouts carry crossbows - drawn and posed as one, shooting bolts at the loose - and an Archer made before RS-491
// gets the leather quiver the kit now starts with, once: worn if the cape slot is free, else in the bag; never twice, never to others
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {};
    const e = m3dInstance({ nm:'duergar scout' }, m3dPortrait({ nm:'duergar scout' })); out.xbow = e.rig.wk==='xbow' && !!e.rig.xbPiv;
    /* its shot is a bolt, at the loose */
    const m = { nm:'duergar scout', x:G.player.x + 3, y:G.player.y, alive:1 }; M3D.inst.set(m, e); const on = ISO.on, ok = FPD.ok, ss = ISO.shots; ISO.on = true; FPD.ok = true; ISO.shots = [];
    isoMonShot(m, 'arrow', '#d8c8a0'); out.shot = ISO.shots[0] ? [ISO.shots[0].kind, +(-ISO.shots[0].t).toFixed(2)] : null; ISO.on = on; FPD.ok = ok; ISO.shots = ss;
    try{ const c = document.createElement('canvas'); c.width = c.height = 64; mpWeapon(c.getContext('2d'), 'xbow', 32, 32, 0.3, 1, {}); out.drawn2d = true; }catch(err){ out.drawn2d = String(err); }
    /* an old Archer: no quiver, a free cape slot */
    const p = G.player; p.kit = 'Archer'; delete p.rsQuiverGift; G.gear.cape = newItem(); G.inv = G.inv.filter(it=>!(it.basis==='Quiver'));
    rsMigrateAll(); out.worn = G.gear.cape && G.gear.cape.nm; rsMigrateAll(); out.once = G.inv.filter(it=>it.basis==='Quiver').length===0;
    /* one wearing a cape: the quiver goes in the bag */
    delete p.rsQuiverGift; G.gear.cape = rsMakeCape(0, 'Red Cape'); rsMigrateAll(); out.bag = G.inv.some(it=>it.basis==='Quiver') && G.gear.cape.nm==='Red Cape';
    /* a warrior gets none */
    G.inv = G.inv.filter(it=>it.basis!=='Quiver'); p.kit = 'Warrior'; delete p.rsQuiverGift; G.gear.cape = newItem(); rsMigrateAll(); out.warrior = !(G.gear.cape && G.gear.cape.used) && !G.inv.some(it=>it.basis==='Quiver');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.xbow && r.drawn2d===true, 'the duergar scout carries a crossbow, in 3D and in its portrait');
  A(r.shot && r.shot[0]==='bolt' && r.shot[1] > 0.4, 'it shoots bolts, at the loose');
  A(r.worn==='Leather Quiver' && r.once, 'an old Archer is given a quiver, worn, once');
  A(r.bag, 'one already wearing a cape finds it in the bag');
  A(r.warrior, 'no quiver for a warrior');
};
