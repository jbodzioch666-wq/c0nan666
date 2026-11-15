// RS-423: a shut tome is only the shut book - the open book's pages, merged into the tome when the figure was put together, had
// stayed showing inside it; and open, it's only the open book
const S = require('./shotlib');
module.exports = async page=>{
  await S.install(page);
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, shots = {};
    const shows = (rig, nm)=>{ let n = 0, stray = 0; rig.tome.traverse(o=>{ if (!o.isMesh) return; for (let q = o; q; q = q.parent){ if (!q.visible) return; if (q===rig.tome) break; }
      let inPart = false; for (let q = o.parent; q && q!==rig.tome; q = q.parent) if (q.name===nm) inPart = true; n++; if (!inPart) stray++; }); return { n, stray }; };
    for (const [nm, w] of [['tome', null], ['staffTome', rsMakeStaff(1)]]){
      G.gear.weapon = w || newItem(); G.gear.offhand = rsMakeArmour('cloth', 3, 'offhand');
      const e = m3dInstance({}, rsPlayerLook()), rig = e.rig;
      e.fight = true; for (let i=0;i<20;i++) m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); const open = shows(rig, 'tomeOpen');
      e.fight = false; for (let i=0;i<20;i++) m3dPoseHumanoid(rig, 0.7, 0, 0, 0, 0, e); const shut = shows(rig, 'tomeClosed');
      e.holder.updateMatrixWorld(true); const tp = rig.tome.getWorldPosition(new THREE.Vector3());
      shots[nm] = __shot(e.holder, { yaws:[0.4, 1.2], w:360, h:420, focus:tp, span:0.35 });
      out[nm] = { open, shut }; }
    return { out, shots }; });
  for (const k in r.shots) S.save(r.shots[k], 'rs423_' + k);
  console.log(JSON.stringify(r.out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r.out)); };
  for (const k of ['tome', 'staffTome']){
    A(r.out[k].shut.n > 0 && r.out[k].shut.stray===0, k + ': shut, only the shut book shows - none of the open one inside it');
    A(r.out[k].open.n > 0 && r.out[k].open.stray===0, k + ': open, only the open book shows'); }
};
