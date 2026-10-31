// FP-016: through your eyes your weapon and shield are put away out of a fight as your figure's are (sunk out of sight), drawn as a fight
// starts and up at once for a blow; and the shield in your left hand is its face out after chopping wood - the copy of a still (frozen,
// gfxAutoFreeze) figure's shield kept its matrix from its place on your back and showed edge on, as good as gone
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = []; const P = skP(); P.tools = P.tools || {}; P.tools.axe = 1;
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y) && o3Passable(x+1, y)){ G.owPos = { x, y }; break; } } setUi('playing');
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; window.__realFight = rsFightNow; window.__fightOn = false; rsFightNow = ()=>window.__fightOn ? G.ui==='playing' : window.__realFight(); });
  await wait(1500); await page.keyboard.press('o'); await wait(1500);
  A(await ev(()=>fpvLand()), 'through your eyes on the land');
  const st = ()=>ev(()=>{ const T = THREE, O = FPW.offG; let face = null; if (O){ O.updateMatrixWorld(true); O.traverse(o=>{ if (o.isMesh && o.userData.fpwShared && !face) face = new T.Vector3(0, -1, 0).applyQuaternion(o.getWorldQuaternion(new T.Quaternion())).z; }); }
    const hy = FPW.held ? FPW.held.getWorldPosition(new T.Vector3()).project(FPW.cam).y : null;
    return { away:+(FPW.away||0).toFixed(3), rig:FPW.rig.visible, arms:FPW.armGrp ? FPW.armGrp.visible : null, off:O ? O.visible : null, kind:FPW.offKind, face:face!=null ? +face.toFixed(2) : null, hy:hy!=null ? +hy.toFixed(2) : null, shK:fpwWorker().rig.shK, work:FPW.work }; });

  /* ---- out of a fight: put away, as your figure's are ---- */
  const s0 = await st(); A(s0.shK===1 && s0.away > 0.97 && !s0.rig && !s0.off && !s0.arms, 'out of a fight, weapon, shield and arms put away out of sight: ' + JSON.stringify(s0));
  /* ---- a fight: drawn, the shield's face out ---- */
  await ev(()=>{ window.__fightOn = true; }); await wait(250); const s1 = await st(); await wait(1000); const s2 = await st();
  A(s1.away > 0.05 && s1.away < 0.9 && s1.rig, 'coming up as it\'s drawn: ' + JSON.stringify(s1));
  A(s2.away < 0.02 && s2.rig && s2.off && s2.arms && s2.kind==='shield' && s2.face < -0.7, 'in a fight: the weapon up, the shield on your arm, its face out: ' + JSON.stringify(s2));
  /* ---- the fight over: down again ---- */
  await ev(()=>{ window.__fightOn = false; }); await wait(1500); const s3 = await st();
  A(s3.away > 0.97 && !s3.rig && !s3.off, 'the fight over: put away again: ' + JSON.stringify(s3));
  /* ---- a blow out of a fight: up at once ---- */
  const s4 = await ev(async ()=>{ FP.swing = 1; renderGame(); await new Promise(r=>requestAnimationFrame(r)); renderGame(); return { away:FPW.away, rig:FPW.rig.visible }; });
  A(s4.away===0 && s4.rig, 'a blow: up at once: ' + JSON.stringify(s4));
  await ev(()=>{ FP.swing = 0; FPW.atk = null; }); await wait(300);

  /* ---- chopping: the axe in your hands (the rig shown again for the work), then the shield on your arm, face out ---- */
  await ev(()=>{ window.__fightOn = true; }); await wait(1200);
  await ev(()=>{ G.gather = { o:{ k:'woodcutting', label:'w', at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0, last:'start' }; G.player.facing = 2; }); await wait(1500);
  const w = await ev(()=>({ work:FPW.work, rig:FPW.rig.visible, held:FPW.held && FPW.held.visible }));
  A(w.work==='axe' && w.rig && w.held, 'chopping: the axe in your hands: ' + JSON.stringify(w));
  /* (still a while: the figure's shield frozen where it hangs, as gfxAutoFreeze leaves it - its matrix turned, not its rotation) */
  await ev(()=>{ const r = fpwWorker().rig; r.shield.updateMatrix(); r.shield.matrix.multiply(new THREE.Matrix4().makeRotationX(1.3)); r.shield.matrixAutoUpdate = false; });
  await ev(()=>{ skStop(); G.gather = null; }); await wait(1200);
  const s5 = await st(); A(s5.kind==='shield' && s5.off && s5.face < -0.7, 'chopping done: the shield back on your arm, its face out: ' + JSON.stringify(s5));
  await ev(()=>{ const r = fpwWorker().rig; r.shield.matrixAutoUpdate = true; rsFightNow = window.__realFight; });
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
