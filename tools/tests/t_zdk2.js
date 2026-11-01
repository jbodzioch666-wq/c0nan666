// (art probe, not in ALL) FP-022's kit props: a barrel, a crate, rubble, chains and a bench set on the floor round you, drawn and kit,
// shot close from the scene's own renderer into shots/zdk2_<name>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; PFX.camp = -1e9;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  const placed = await ev(()=>{ const p = G.player, kinds = ['barrel', 'crate', 'rubble', 'chains', 'bench'], out = []; let k = 0;
    for (let r=1; r<=2 && k<kinds.length; r++) for (let dx=-r; dx<=r && k<kinds.length; dx++) for (let dy=-r; dy<=r && k<kinds.length; dy++){ if (Math.max(Math.abs(dx), Math.abs(dy))!==r) continue; const x = p.x + dx, y = p.y + dy;
      if (tileAt(x, y)!==T_FLOOR || G.dungeonDeco[x][y]) continue; G.dungeonDeco[x][y] = kinds[k]; out.push(kinds[k] + '@' + dx + ',' + dy); k++; }
    return out; });
  console.log('placed', placed.join(' '));
  const shoot = (name, yaw, dist, h)=>ev(([name, yaw, dist, h])=>{ const T = THREE, e = ISO.player, p = new T.Vector3().setFromMatrixPosition(e.holder.matrixWorld), cv = FPD.r.domElement;
    const cam = new T.PerspectiveCamera(40, cv.width/cv.height, 0.01, 50), a = yaw; cam.position.set(p.x + Math.sin(a)*dist, p.y + h, p.z + Math.cos(a)*dist); cam.lookAt(p.x, p.y + 0.2, p.z);
    FPD.r.render(FPD.scene, cam); return cv.toDataURL('image/png'); }, [name, yaw, dist, h]).then(u=>fs.writeFileSync(SHOTS + '/zdk2_' + name + '.png', Buffer.from(u.split(',')[1], 'base64')));
  for (const mode of ['drawn', 'model']){ await ev(m=>{ SET.tpDungeon = m; }, mode); await wait(2500);
    const n = await ev(()=>{ let kit = 0, all = 0; for (const [k, o] of ISO.props){ if (!k.startsWith('dress:')) continue; all++; o.g.traverse(m=>{ if (m.isMesh && m.geometry.userData.mats) kit++; }); } return { all, kit }; }); console.log(mode, JSON.stringify(n));
    await shoot(mode + '_a', 0.6, 2.6, 1.6); await shoot(mode + '_b', 2.4, 2.6, 1.6); }
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
