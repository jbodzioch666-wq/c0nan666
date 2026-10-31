// FP-011: in a fight through your eyes the weapon faces the way it's held - a blade's edge, an axe's bit and a hammer's face to the
// front in line with your knuckles, the wrist turning the edge to lead a slash - and the left hand carries your own shield (its back to
// you, your fist on its grip), your tome or an off-hand weapon. Shots: shots/fp011-shield.jpg, shots/fp011-slash.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; }); });
  await page.keyboard.press('o'); await wait(800);
  A(await ev(()=>fpv()), 'through your eyes in the dungeon');
  const gear = (wi, off, P)=>ev(([wi, off, P])=>{ G.gear.weapon = wi==='fists' ? newItem() : rsMakeWeapon(3, wi); G.gear.weapon.used = wi!=='fists';
    G.gear.offhand = !off ? newItem() : off==='kite' ? rsMakeArmour('metal', 3, 'offhand') : off==='tome' ? rsMakeArmour('cloth', 2, 'offhand') : (()=>{ const w = RS_WEAPONS[0], m = RS_METALS[3], it = rsItem('offhand'); it.nm = m[0] + ' Off-hand ' + w[0]; it.basis = w[1]; it.rsCol = m[5]; it.offWeapon = 1; return it; })();
    G.gear.offhand.used = !!off; window.__fpwP = P; FPW.wkey = ''; }, [wi, off, P]);
  /* which way the head's +x (the edge, the bit, the face: the way the models are made) points, in the view */
  const edge = ()=>ev(()=>{ const T = THREE, wg = FPW.weaponG.children[0], a = wg.localToWorld(new T.Vector3(0, 0.4, 0)), b = wg.localToWorld(new T.Vector3(0.1, 0.4, 0)).sub(a).normalize(); return { x:b.x, y:b.y, z:b.z, style:FPW.style }; });

  /* ---- the edge to the front ---- */
  for (const [wi, nm] of [[2, 'sword'], [7, 'battleaxe'], [6, 'warhammer'], [9, 'two-handed sword']]){ await gear(wi, null, 0); await wait(400);
    const e = await edge(); A(e.z < -0.8, 'the ' + nm + '\'s edge to the front, in line with your knuckles: ' + JSON.stringify(e)); }
  /* ---- a slash: the wrist turns the edge to lead it across ---- */
  await gear(2, null, 0.45); await wait(400);
  { const e = await edge(); A(Math.abs(e.z) < 0.5, 'slashing, the edge turned to lead the blade across you: ' + JSON.stringify(e)); }
  await page.screenshot({ path:SHOTS + '/fp011-slash.jpg', type:'jpeg', quality:82 });
  await gear(7, null, 0.58); await wait(400);
  { const e = await edge(); A(e.z < -0.5, 'chopping, the axe comes down bit first: ' + JSON.stringify(e)); }

  /* ---- a shield on your left arm, its back to you ---- */
  await gear(2, 'kite', 0); await wait(900);
  const sh = await ev(()=>{ const T = THREE, O = FPW.offG; if (!O) return { none:true, kind:FPW.offKind }; O.updateMatrixWorld(true); let face = null, n = 0;
    O.traverse(o=>{ if (o.isMesh && o.userData.fpwShared && !face){ face = new T.Vector3(0, -1, 0).applyQuaternion(o.getWorldQuaternion(new T.Quaternion())); } if (o.isMesh) n++; });
    const c = new T.Box3().setFromObject(O).getCenter(new T.Vector3()).project(FPW.cam), r = fpwWorker().rig;
    return { kind:FPW.offKind, face:face && face.z, sx:c.x, sy:c.y, arms:FPW.arms.length, fig:!!(r && r.shield), same:r && r.shield ? (()=>{ let g = null; r.shield.traverse(o=>{ if (o.isMesh && !g) g = o.geometry; }); let h = null; O.traverse(o=>{ if (o.isMesh && o.userData.fpwShared && !h) h = o.geometry; }); return g===h; })() : false }; });
  A(sh.kind==='shield' && sh.fig, 'your figure\'s shield in your left hand: ' + JSON.stringify(sh));
  A(sh.same, 'the same shield as your figure carries: ' + JSON.stringify(sh));
  A(sh.face < -0.7, 'its face out to the front, its back to you: ' + JSON.stringify(sh));
  A(sh.sx < -0.2 && sh.sy < 0, 'held low on the left: ' + JSON.stringify(sh));
  A(sh.arms===2, 'your sword hand and your shield hand: ' + JSON.stringify(sh));
  await page.screenshot({ path:SHOTS + '/fp011-shield.jpg', type:'jpeg', quality:82 });
  /* the shield's own model is shared with your figure's: changing weapons leaves the figure's shield whole */
  await gear(7, 'kite', 0); await wait(600);
  A(await ev(()=>{ const r = fpwWorker().rig; let ok = false; r.shield.traverse(o=>{ if (o.isMesh && o.geometry.attributes.position.count > 100) ok = true; }); return ok && FPW.offKind==='shield'; }), 'the figure keeps its shield');
  /* a spear with a shield is held in one hand; fists with a shield keep only the right fist up */
  await gear(4, 'kite', 0); await wait(600);
  A(await ev(()=>FPW.arms.length===2 && FPW.offKind==='shield'), 'a spear one-handed beside the shield');
  await gear('fists', 'kite', 0); await wait(600);
  A(await ev(()=>FPW.arms.length===2 && !FPW.leftFist && FPW.offKind==='shield'), 'one fist up and the shield');
  /* ---- a tome and an off-hand weapon ---- */
  await gear(2, 'tome', 0); await wait(900);
  A(await ev(()=>FPW.offKind==='tome' && !!FPW.offG), 'your tome open in your left hand');
  await gear(2, 'dagger', 0); await wait(600);
  const ow = await ev(()=>{ const c = new THREE.Box3().setFromObject(FPW.offG).getCenter(new THREE.Vector3()).project(FPW.cam); return { kind:FPW.offKind, sx:c.x, arms:FPW.arms.length }; });
  A(ow.kind==='weapon' && ow.sx < -0.1 && ow.arms===2, 'an off-hand dagger in your left hand: ' + JSON.stringify(ow));
  /* ---- nothing in the left hand beside a two-handed weapon, and nothing left behind ---- */
  await gear(9, 'kite', 0); await wait(600);
  A(await ev(()=>!FPW.offG && !FPW.offKind), 'no shield beside a two-handed sword');
  await gear(2, null, 0); await wait(400);
  A(await ev(()=>!FPW.offG && FPW.arms.length===1), 'the left hand empty again');
  await ev(()=>{ delete window.__fpwP; });
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
