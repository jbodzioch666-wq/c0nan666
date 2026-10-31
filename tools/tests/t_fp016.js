// FP-016: through your eyes your weapon and shield are put away out of a fight as your figure's are, drawn as a fight starts; and the
// shield in your left hand is its face out after chopping wood (a frozen figure's shield - gfxAutoFreeze - showed edge on, as good as
// gone). FP-017: the weapon and shield are the figure's own, mirrored: put away they sit on its hip and back, out of the view
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    G.player.clock = DAY_LENGTH*0.4; const t = townList()[0]; G.interior = null; G.gameMode = 0; G.mon = []; const P = skP(); P.tools = P.tools || {}; P.tools.axe = 1;
    for (const [dx, dy] of [[0,6],[6,0],[0,-6],[-6,0],[7,7],[-7,-7]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y) && o3Passable(x+1, y)){ G.owPos = { x, y }; break; } } setUi('playing');
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; window.__realFight = rsFightNow; window.__fightOn = false; rsFightNow = ()=>window.__fightOn ? G.ui==='playing' : window.__realFight(); });
  await wait(1500); await page.keyboard.press('o'); await wait(1500);
  A(await ev(()=>fpvLand()), 'through your eyes on the land');
  const st = ()=>ev(()=>{ const T = THREE, e = fpwWorker(), r = e.rig, O = FPW.offG, cam = fpwMirrorCam(); FPW.scene.updateMatrixWorld(true); e.holder.updateWorldMatrix(true, true); cam.updateMatrixWorld(); const V = cam.matrixWorldInverse;
    const faceOf = (o, M)=>{ let f = null; o.traverse(q=>{ if (q.isMesh && !f){ const n = new T.Vector3(0, -1, 0).applyQuaternion(q.getWorldQuaternion(new T.Quaternion())); if (M) n.transformDirection(M); f = [+n.x.toFixed(2), +n.y.toFixed(2), +n.z.toFixed(2)]; } }); return f; };
    const pr = (o, v, M)=>{ const w = o.localToWorld(v.clone()); if (M) w.applyMatrix4(M); const b = w.z > 0; w.project(FPW.cam); return { x:+w.x.toFixed(2), y:+w.y.toFixed(2), behind:b }; };
    const tipV = new T.Vector3(0, FPW.info ? FPW.info.tipY : 0.5, 0), tip = FPW.weaponG ? pr(FPW.weaponG, tipV) : null, fTip = r.weapon ? pr(r.weapon, tipV, V) : null, sh = O ? pr(O.userData.mir[0].c, new T.Vector3()) : null;
    return { mir:!!(FPW.mir && FPW.mir.wp), shK:r.shK, sheathed:r.sheathed, kind:FPW.offKind, face:O ? faceOf(O) : null, fFace:r.shield ? faceOf(r.shield, V) : null, tip, fTip, sh, work:FPW.work }; });
  const out = o=>!o || o.behind || o.y < -1 || Math.abs(o.x) > 1, near = (a, b)=>a && b && Math.abs(a.x - b.x) < 0.06 && Math.abs(a.y - b.y) < 0.06 && a.behind===b.behind, same = (a, b)=>a && b && Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.1;

  /* ---- out of a fight: put away, as your figure's are - on the hip and the back, out of the view ---- */
  const s0 = await st(); A(s0.mir && s0.shK===1 && s0.sheathed, 'out of a fight the figure\'s weapon is put away: ' + JSON.stringify(s0));
  A(out(s0.tip) && out(s0.sh), 'the sword on your hip and the shield on your back, out of sight: ' + JSON.stringify(s0));
  /* ---- a fight: drawn, the shield's face out ---- */
  await ev(()=>{ window.__fightOn = true; }); await wait(250); const s1 = await st(); await wait(1200); const s2 = await st();
  A(s1.shK > 0.02 && s1.shK < 0.98, 'drawing: ' + JSON.stringify(s1));
  A(s2.shK===0 && !s2.sheathed && near(s2.tip, s2.fTip) && s2.kind==='shield' && same(s2.face, s2.fFace), 'in a fight: the sword in hand where the figure holds it, the shield on your arm as the figure carries it: ' + JSON.stringify(s2));
  /* ---- the fight over: put away again ---- */
  await ev(()=>{ window.__fightOn = false; }); await wait(1500); const s3 = await st();
  A(s3.shK===1 && out(s3.tip) && near(s3.tip, s3.fTip), 'the fight over: put away again: ' + JSON.stringify(s3));

  /* ---- chopping: the axe in your hands, then the shield on your arm again, face out ---- */
  await ev(()=>{ window.__fightOn = true; }); await wait(1200);
  await ev(()=>{ G.gather = { o:{ k:'woodcutting', label:'w', at:{ x:G.owPos.x + 1, y:G.owPos.y } }, iv:900000, next:performance.now()+600000, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0, last:'start' }; G.player.facing = 2; }); await wait(1500);
  const w = await ev(()=>({ work:FPW.work, rig:FPW.rig.visible, held:FPW.held && FPW.held.visible }));
  A(w.work==='axe' && w.rig && w.held, 'chopping: the axe in your hands: ' + JSON.stringify(w));
  /* (still a while: the figure's shield frozen where it hangs, as gfxAutoFreeze leaves it - its matrix turned, not its rotation) */
  await ev(()=>{ const r = fpwWorker().rig; r.shield.updateMatrix(); r.shield.matrix.multiply(new THREE.Matrix4().makeRotationX(1.3)); r.shield.matrixAutoUpdate = false; });
  await ev(()=>{ skStop(); G.gather = null; }); await wait(1200);
  const s5 = await st(); A(s5.kind==='shield' && !s5.work && same(s5.face, s5.fFace), 'chopping done: the shield back on your arm, as the figure carries it (not edge on from a frozen matrix): ' + JSON.stringify(s5));
  await ev(()=>{ const r = fpwWorker().rig; r.shield.matrixAutoUpdate = true; rsFightNow = window.__realFight; });
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
