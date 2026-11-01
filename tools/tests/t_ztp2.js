// (art probe, not in ALL) FP-021's sculpted figure below ground: close shots of the figure from a few sides, standing, walking, in a fight,
// drawn and model, into shots/ztp2_<name>.png. ZT_W='sword'|'staff'|'none', ZT_OUT='plate'|'leather'|'robe'|'shirt', ZT_FEM=1
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const fs = require('fs');
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const W = process.env.ZT_W || 'sword', FEM = !!process.env.ZT_FEM, BARE = !!process.env.ZT_BARE, OUT = process.env.ZT_OUT || '';
  await ev(([W, FEM, BARE])=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; PFX.camp = -1e9; G.player.hp = G.player.maxHp = 99999;
    if (FEM){ G.player.look = Object.assign({}, G.player.look||{}, { body:1 }); }
    if (BARE){ G.gear.head = newItem(); G.gear.chest = newItem(); G.gear.legs = newItem(); }
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0;
    if (W==='sword'){ G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; }
    else if (W==='none'){ G.gear.weapon = newItem(); G.gear.offhand = newItem(); } }, [W, FEM, BARE]);
  await wait(1200);
  const shoot = (name, yaw, dist, h, fov, ly)=>ev(([name, yaw, dist, h, fov, ly])=>{ const T = THREE, e = ISO.player, p = new T.Vector3().setFromMatrixPosition(e.holder.matrixWorld), cv = FPD.r.domElement;
    const cam = new T.PerspectiveCamera(fov || 30, cv.width/cv.height, 0.01, 50), a = e.face + yaw; cam.position.set(p.x + Math.sin(a)*dist, p.y + h, p.z + Math.cos(a)*dist); cam.lookAt(p.x, p.y + (ly!=null ? ly : Math.min(h*0.55, 0.35)), p.z);
    FPD.r.render(FPD.scene, cam); return cv.toDataURL('image/png'); }, [name, yaw, dist, h, fov, ly]).then(u=>fs.writeFileSync(SHOTS + '/ztp2_' + (process.env.ZT_TAG || '') + name + '.png', Buffer.from(u.split(',')[1], 'base64')));
  const set = async (mode, fight)=>{ await ev(([mode, fight])=>{ SET.tpBody = mode; ISO.lookKey = ''; ISO.fighting = null; if (fight){ const p = G.player, F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0]*3, y:p.y + F[1]*3, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0, stunTurns:99 }); ISO.fighting = m; rsFightNow = ()=>true; } }, [mode, fight]); await wait(1500); };
  for (const mode of ['drawn', 'model']){
    await set(mode, false); await ev(()=>{ PFX.camp = -1e9; });
    const info = await ev(()=>{ const e = ISO.player; return { tp:!!e.tp, kit:e.tp && e.tp.kit, hide:e.tp && e.tp.hide.length, wUp:e.tp && +e.tp.wUp.toFixed(2), wLeg:e.tp && +e.tp.wLeg.toFixed(2) }; }); console.log(mode, JSON.stringify(info));
    await shoot(mode + '_front', 0, 2.2, 0.9); await shoot(mode + '_side', Math.PI/2, 2.2, 0.9); await shoot(mode + '_back', Math.PI*0.85, 2.2, 0.9); await shoot(mode + '_iso', Math.PI*0.25, 5, 4.5, 25); await shoot(mode + '_face', 0.35, 0.9, 0.9, 22, 0.8); await shoot(mode + '_faceside', Math.PI/2, 1.1, 0.75, 22, 0.7);
  }
  await set('model', true); await shoot('model_fight', 0.5, 2.2, 0.9); await ev(()=>{ FP.swing = 0.6; }); await wait(250); await shoot('model_swing', 0.5, 2.2, 0.9);
  console.log('wUp', await ev(()=>ISO.player.tp && ISO.player.tp.wUp));
  if (errs.length) console.log('ERRS', errs.join(' | '));
};
