// (art probe, not in ALL) the sculpted townsfolk in each race's town: close shots of two people per race, model and drawn,
// into shots/ztf2_<race>_<mode>_<i>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9; });
  const races = await ev(()=>{ const o = {}; for (const t of townList()){ const f = townFlavorAt(t.x, t.y); if (f && !o[f.race]) o[f.race] = { x:t.x, y:t.y }; } return o; });
  console.log('races', Object.keys(races).join(' '));
  const shoot = (name, idx)=>ev(([idx])=>{ const T = THREE, all = [...(V3.villagers||[]), ...(V3.npcs||[])].filter(p=>p.e && p.e.rig && p.e.rig.arms && p.g.visible && p.g.parent && !(p.v && p.v.animal)), p = all[idx]; if (!p) return null;
    p.g.updateMatrixWorld(true); const c = new T.Vector3().setFromMatrixPosition(p.e.holder.matrixWorld), s = p.e.holder.matrixWorld.getMaxScaleOnAxis(), cv = V3.renderer.domElement, cam = new T.PerspectiveCamera(30, cv.width/cv.height, 0.05, 200), a = (p.yaw||0) + 0.5, d = 2.2;
    cam.position.set(c.x + Math.sin(a)*d, c.y + 0.9, c.z + Math.cos(a)*d); cam.lookAt(c.x, c.y + 0.45, c.z); V3.renderer.render(V3.scene, cam); return cv.toDataURL('image/png'); }, [idx]).then(u=>{ if (u) fs.writeFileSync(SHOTS + '/ztf2_' + name + '.png', Buffer.from(u.split(',')[1], 'base64')); });
  for (const r in races){ for (const mode of ['model', 'drawn']){
    await ev(([t, m])=>{ tpFolkOn = m==='model' ? ()=>!!tpData() : ()=>false; V3.mapRef = null; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; }, [races[r], mode]); await wait(3000);
    for (let i=0;i<2;i++) await shoot(r + '_' + mode + '_' + i, i); } }
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
