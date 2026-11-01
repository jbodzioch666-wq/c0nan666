// (art probe, not in ALL) FP-024's sculpted monsters: a goblin, a goblin archer, a kobold, an imp and a lesser demon stood round you below
// ground, drawn and model, shot close from the scene's own renderer into shots/zmk1_<name>.png; ZM_FIGHT=1 sets the goblin on you
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const TAG = process.env.ZM_TAG || '', FIGHT = !!process.env.ZM_FIGHT;
  await ev(()=>{ window.__noLock = true; window.__noWarmSlice = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; PFX.camp = -1e9;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1000);
  const placed = await ev(FIGHT=>{ const p = G.player, names = ['goblin', 'goblin archer', 'kobold', 'imp', 'lesser demon'], out = []; let k = 0;
    for (let r=1; r<=2 && k<names.length; r++) for (let dx=-r; dx<=r && k<names.length; dx++) for (let dy=-r; dy<=r && k<names.length; dy++){ if (Math.max(Math.abs(dx), Math.abs(dy))!==r) continue; const x = p.x + dx, y = p.y + dy;
      if (tileAt(x, y)!==T_FLOOR || G.mon.some(m=>m.x===x && m.y===y)) continue; const m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x, y, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:names[k], baseNm:names[k], col:'#8f8', art:null, abilities:[], speed:0, stunTurns:FIGHT ? 0 : 99, style:names[k]==='goblin archer' ? 'ranged' : undefined }); out.push(names[k] + '@' + dx + ',' + dy); k++; }
    if (FIGHT){ ISO.fighting = G.mon[0]; rsFightNow = ()=>true; } return out; }, FIGHT);
  console.log('placed', placed.join(' '));
  const shoot = (name, mi, yaw, dist, h)=>ev(([name, mi, yaw, dist, h])=>{ const T = THREE, m = G.mon[mi], e = M3D.inst.get(m); if (!e) return null; const p = new T.Vector3().setFromMatrixPosition(e.holder.matrixWorld), cv = FPD.r.domElement;
    const cam = new T.PerspectiveCamera(30, cv.width/cv.height, 0.01, 50); cam.position.set(p.x + Math.sin(yaw)*dist, p.y + h, p.z + Math.cos(yaw)*dist); cam.lookAt(p.x, p.y + 0.28, p.z);
    FPD.r.render(FPD.scene, cam); return cv.toDataURL('image/png'); }, [name, mi, yaw, dist, h]).then(u=>{ if (u) fs.writeFileSync(SHOTS + '/zmk1_' + TAG + name + '.png', Buffer.from(u.split(',')[1], 'base64')); });
  for (const mode of ['drawn', 'model']){ await ev(m=>{ SET.tpMon = m; }, mode); await wait(2000);
    const info = await ev(()=>G.mon.map(m=>{ const e = M3D.inst.get(m); return m.nm + ':' + (e ? (e.tp ? 'tp' + e.tp.meshes.length + (e.tp.hide.filter(x=>x.visible).length ? '!' : '') : 'drawn') : 'none'); })); console.log(mode, info.join(' '));
    for (let i=0;i<5;i++){ const nm = ['goblin', 'archer', 'kobold', 'imp', 'demon'][i]; await shoot(mode + '_' + nm, i, 0.9, 2.4, 1.0); } }
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
