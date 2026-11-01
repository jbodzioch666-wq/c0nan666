// (art probe, not in ALL) FP-025's sculpted townsfolk: the game's view of a town square, drawn and model, and close shots of the first
// few people from the town's own renderer, into shots/ztf1_<name>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.interior = null; });
  await wait(3000);
  const info = ()=>ev(()=>{ const all = [...(V3.villagers||[]), ...(V3.npcs||[])]; return { folk:all.length, tp:all.filter(p=>p.e && p.e.tp).length, humans:all.filter(p=>p.e && p.e.rig && p.e.rig.arms).length, shown:all.filter(p=>p.e && p.e.tp && p.e.tp.hide.some(m=>m.visible)).length }; });
  const shoot = (name, idx, yaw, dist, h)=>ev(([name, idx, yaw, dist, h])=>{ const T = THREE, all = [...(V3.villagers||[]), ...(V3.npcs||[])].filter(p=>p.e && p.e.rig && p.e.rig.arms && p.g.visible && p.g.parent), p = all[idx]; if (!p) return null;
    p.g.updateMatrixWorld(true); const c = new T.Vector3().setFromMatrixPosition(p.e.holder.matrixWorld), cv = V3.renderer.domElement, cam = new T.PerspectiveCamera(30, cv.width/cv.height, 0.05, 200), a = (p.yaw||0) + yaw;
    cam.position.set(c.x + Math.sin(a)*dist, c.y + h, c.z + Math.cos(a)*dist); cam.lookAt(c.x, c.y + 0.45, c.z); V3.renderer.render(V3.scene, cam); return cv.toDataURL('image/png'); }, [name, idx, yaw, dist, h]).then(u=>{ if (u) fs.writeFileSync(SHOTS + '/ztf1_' + name + '.png', Buffer.from(u.split(',')[1], 'base64')); });
  for (const mode of ['drawn', 'model']){ await ev(m=>{ setSetting('tpFolk', m); }, mode); await wait(4000); console.log(mode, JSON.stringify(await info()));
    await page.screenshot({ path:SHOTS + '/ztf1_' + mode + '_town.png' }); for (let i=0;i<4;i++) await shoot(mode + '_' + i, i, 0.5, 2.2, 0.9); }
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
