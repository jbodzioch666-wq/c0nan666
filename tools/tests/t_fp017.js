// FP-017: a fight through your eyes is your own figure's fight seen from its head - the weapon in your hands is the figure's own model,
// where its hand holds it, swung as it swings (guard, drawn back over the shoulder, cut); the shield is the figure's, carried lower and
// to the left so the foe is seen past it, the left fist on its back; the eyes go up into the head while the weapon is out and the view
// dips to a short foe; out of a fight the weapon is put away on the hip, out of sight; the hidden figure stands where your free walk
// has you and faces where you look; a foe struck off the middle of the view turns the view to it
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  const place = k=>ev(k=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f], L = FACING_VECT[(f+3)%4]; let good = true; for (let kk=0; kk<=3 && good; kk++) good = ok(x+F[0]*kk, y+F[1]*kk) && ok(x+F[0]*kk+L[0], y+F[1]*kk+L[1]);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; p.faceDiag = null; FP.lookYaw = null; FP.pitch = 0; FP.turnTo = null; G.mon.forEach(m=>{ m.alive = 0; });
    const F = FACING_VECT[p.facing], L = FACING_VECT[(p.facing+3)%4], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0]*k[0] + L[0]*k[1], y:p.y + F[1]*k[0] + L[1]*k[1], hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0 }); return m.nm; }, k);
  await place([1, 0]);
  await ev(()=>{ G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = rsMakeArmour('metal', 3, 'offhand'); G.gear.offhand.used = true; FPW.wkey = ''; if (!SET.fpView) fpvToggle();
    window.__realFight = rsFightNow; rsFightNow = ()=>G.ui==='playing' && G.mon.some(m=>m.alive); });
  await wait(1500);
  const pin = v=>ev(async v=>{ const t = performance.now() + 300; while (performance.now() < t){ FP.swing = v; renderGame(); await new Promise(r=>requestAnimationFrame(r)); } FP.swing = v; renderGame(); }, v);
  const st = ()=>ev(()=>{ const T = THREE, e = ISO.player, r = e.rig, out = { mir:!!(FPW.mir && FPW.mir.wp), shK:r.shK, pitch:+(FP.pitch||0).toFixed(2), off:FPW.offKind, camY:+FPD.cam.position.y.toFixed(3), eyeY:+fpwEyeOf(e).y.toFixed(3), eyeOff:+FPD.cam.position.distanceTo(fpwEyeOf(e)).toFixed(3), face:e.face, yaw:fpvYawNow(), pos:[e.pos.x, e.pos.y], fpm:[FPM.x, FPM.y] };
    FPW.scene.updateMatrixWorld(true); e.holder.updateWorldMatrix(true, true);
    const pr = (o, cam, v)=>{ const w = o.localToWorld(v.clone()); const z = cam===FPW.cam ? w.z : w.clone().applyMatrix4(cam.matrixWorldInverse).z; w.project(cam); return [+w.x.toFixed(3), +w.y.toFixed(3), z < 0]; };
    out.hands = FPW.mir ? FPW.mir.hands.map(h=>pr(h, FPW.cam, new T.Vector3())) : null;
    const tip = new T.Vector3(0, FPW.info ? FPW.info.tipY : 0.5, 0); out.tip = FPW.weaponG ? pr(FPW.weaponG, FPW.cam, tip) : null; out.figTip = r.weapon ? pr(r.weapon, FPD.cam, tip) : null;
    out.sameGeo = !!(FPW.weaponG && r.weapon && (()=>{ let a = null, b = null; r.weapon.traverse(o=>{ if (o.isMesh && !a) a = o.geometry; }); FPW.weaponG.traverse(o=>{ if (o.isMesh && !b) b = o.geometry; }); return a && a===b; })());
    if (FPW.offG){ const c = new T.Box3().setFromObject(FPW.offG), cn = c.getCenter(new T.Vector3()).project(FPW.cam), top = new T.Vector3((c.min.x + c.max.x)/2, c.max.y, (c.min.z + c.max.z)/2).project(FPW.cam); out.shield = [+cn.x.toFixed(2), +cn.y.toFixed(2), +top.y.toFixed(2)];
      let a = null, b = null; r.shield.traverse(o=>{ if (o.isMesh && !a) a = o.geometry; }); FPW.offG.traverse(o=>{ if (o.isMesh && !b) b = o.geometry; }); out.shieldGeo = a && a===b;
      const sb = r.shield.userData.fpwBack, bk = new T.Vector3(0, sb||0, 0).applyMatrix4(r.shield.matrixWorld).applyMatrix4(FPD.cam.matrixWorldInverse), lh = FPW.mir.hands[1].getWorldPosition(new T.Vector3()); out.lhOnBack = +bk.distanceTo(lh).toFixed(3); }
    return out; });

  /* ---- the figure's own sword in your hand, your eyes in its head ---- */
  await pin(0); const g0 = await st();
  A(g0.mir && g0.sameGeo, 'the weapon in your hands is your figure\'s own model: ' + JSON.stringify(g0));
  A(g0.shK===0 && g0.eyeOff < 0.06, 'the sword out, your eyes in the figure\'s head: ' + JSON.stringify(g0));
  A(g0.pitch < -0.12 && g0.pitch > -0.75, 'the view dips to the goblin before you: ' + g0.pitch);
  A(g0.tip && g0.tip[2] && g0.tip[0] > 0 && g0.tip[0] < 1 && Math.abs(g0.tip[1]) < 1, 'the sword at guard in sight on the right: ' + JSON.stringify(g0.tip));
  A(Math.abs(g0.tip[0] - g0.figTip[0]) < 0.06 && Math.abs(g0.tip[1] - g0.figTip[1]) < 0.06, 'its tip where the figure\'s own would be seen from its head: ' + JSON.stringify([g0.tip, g0.figTip]));
  /* ---- the figure's shield, low and left, the fist on its back ---- */
  A(g0.off==='shield' && g0.shieldGeo, 'your figure\'s shield on your left arm: ' + JSON.stringify(g0));
  A(g0.shield[0] < -0.2 && g0.shield[1] < -0.3 && g0.shield[2] > -1 && g0.shield[2] < 0.3, 'carried low and to the left, its top rim in sight, the goblin past it: ' + JSON.stringify(g0.shield));
  A(g0.lhOnBack < 0.05, 'the left fist on the middle of its back: ' + g0.lhOnBack);
  /* ---- the swing is the figure's: back over the shoulder, then the cut ---- */
  await pin(0.62); const g1 = await st(); await pin(0.5); const g2 = await st();
  A(g1.hands[0][1] > g0.hands[0][1] + 0.3, 'drawn back and up over the shoulder: ' + JSON.stringify([g0.hands[0], g1.hands[0]]));
  A(g2.hands[0][1] < g1.hands[0][1] - 0.5 && g2.hands[0][0] > g1.hands[0][0], 'the cut: the hand down and across to the right: ' + JSON.stringify([g1.hands[0], g2.hands[0]]));
  for (const g of [g1, g2]) A(Math.abs(g.tip[0] - g.figTip[0]) < 0.08 && Math.abs(g.tip[1] - g.figTip[1]) < 0.08, 'the blade where the figure\'s is through the swing: ' + JSON.stringify([g.tip, g.figTip]));
  await pin(0);

  /* ---- where you walk, your figure stands; where you look, it faces ---- */
  await page.keyboard.down('w'); await wait(220); await page.keyboard.up('w'); await wait(200); const w1 = await st();
  A(Math.abs(w1.pos[0] - w1.fpm[0]) < 0.01 && Math.abs(w1.pos[1] - w1.fpm[1]) < 0.01, 'the hidden figure where your free walk has you: ' + JSON.stringify([w1.pos, w1.fpm]));
  { const want = Math.atan2(Math.cos(w1.yaw), Math.sin(w1.yaw)); let d = w1.face - want; d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); A(d < 0.05, 'facing where you look: ' + [w1.face, want]); }

  /* ---- the fight over: put away, out of sight, the eyes back down ---- */
  await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); FP.swing = 0; }); await wait(1800); const s1 = await st();
  A(s1.shK===1, 'the goblin dead, the sword put away: ' + s1.shK);
  A(!s1.tip[2] || s1.tip[1] < -1 || Math.abs(s1.tip[0]) > 1, 'the sword on your hip, out of sight: ' + JSON.stringify(s1.tip));
  A(s1.hands.every(h=>!h[2] || h[1] < -1), 'your hands down at your sides: ' + JSON.stringify(s1.hands));
  A(Math.abs(s1.camY - 0.62) < 0.03 && s1.eyeOff > 0.04 && Math.abs(s1.pitch) < 0.08, 'the eyes back at their own height, the view level: ' + JSON.stringify([s1.camY, s1.eyeOff, s1.pitch]));

  /* ---- a foe struck at off the middle of the view: the view turns to it ---- */
  await place([2, 1]); await wait(1200);   /* (two ahead and one to the left: a tile's diagonal neighbour is outside the view) */
  const aim = await ev(()=>{ const m = G.mon.find(m=>m.alive), e = M3D.inst.get(m), r = canvas.getBoundingClientRect(); const v = e.holder.position.clone(); v.y += e.H*0.7; v.project(FPD.cam); return { x:r.left + (v.x*0.5+0.5)*r.width, y:r.top + (-v.y*0.5+0.5)*r.height, nx:v.x, dbg:[m.x, m.y, G.player.x, G.player.y, G.player.facing, +FP.cam.a.toFixed(2), FP.lookYaw, FP.turnTo, G.mon.filter(m=>m.alive).length] }; });
  A(aim.nx < -0.25 && aim.nx > -1, 'the goblin stands to the left of the middle, in view: ' + aim.nx.toFixed(2) + ' ' + JSON.stringify(aim.dbg));
  const y0 = await ev(()=>fpvYawNow()); await page.mouse.click(aim.x, aim.y); await wait(700);
  const t1 = await ev(()=>{ const m = G.mon.find(m=>m.alive), q = FP.monPos.get(m), want = Math.atan2(q.y - FPM.y, q.x - FPM.x); let d = want - fpvYawNow(); d = Math.atan2(Math.sin(d), Math.cos(d)); return { d:+d.toFixed(2), yaw:fpvYawNow(), turned:FP.turnTo==null }; });
  A(Math.abs(t1.d) < 0.12 && Math.abs(t1.yaw - y0) > 0.2, 'struck, the view turned to it: ' + JSON.stringify([y0, t1]));
  await ev(()=>{ rsFightNow = window.__realFight; });
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
