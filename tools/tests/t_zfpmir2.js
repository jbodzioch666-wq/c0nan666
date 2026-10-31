// probe: the fight through your eyes as your figure's own (FP-017): in a dungeon with a goblin before you, the weapon ZF_W (an
// RS_WEAPONS index, or fists), the off hand ZF_OFF (kite|tome|dagger|none), a screenshot at each pinned point of the swing in ZF_P
// (FP.swing values, 1 the start, about 0.54 the blow, 0 at guard) to tools/tests/out/zfpmir2-<n>.png; ZF_GUARD=1 holds the guard with
// no swing; ZF_SHEATH=1 out of a fight. Prints where the weapon's tip and each hand sit in the view
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(([wi, off])=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; });
    const F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0], y:p.y + F[1], hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0 });
    if (wi!=='keep'){ G.gear.weapon = wi==='fists' ? newItem() : rsMakeWeapon(3, +wi); G.gear.weapon.used = wi!=='fists'; }
    if (off!=='keep') G.gear.offhand = off==='none' ? newItem() : off==='kite' ? rsMakeArmour('metal', 3, 'offhand') : off==='tome' ? rsMakeArmour('cloth', 2, 'offhand') : (()=>{ const w = RS_WEAPONS[0], mt = RS_METALS[3], it = rsItem('offhand'); it.nm = mt[0] + ' Off-hand ' + w[0]; it.basis = w[1]; it.rsCol = mt[5]; it.offWeapon = 1; return it; })();
    if (off!=='keep') G.gear.offhand.used = off!=='none'; FPW.wkey = ''; if (!SET.fpView) fpvToggle(); }, [process.env.ZF_W || '2', process.env.ZF_OFF || 'kite']);
  if (process.env.ZF_SG) await ev(v=>{ window.__zShieldG = v; }, JSON.parse(process.env.ZF_SG));
  if (process.env.ZF_EYE) await ev(v=>{ window.__zFightEye = v; }, JSON.parse(process.env.ZF_EYE));
  await wait(1200);
  const st = ()=>ev(()=>{ const T = THREE, e = ISO.player, r = e.rig, out = { wpn:G.gear.weapon && G.gear.weapon.used ? G.gear.weapon.nm : null, fight:rsFightNow(), aud:audInFight(), efight:e.fight, pitch:+(FP.pitch||0).toFixed(2), mir:!!(FPW.mir && FPW.mir.wp), shK:r.shK, sheathed:r.sheathed, swing:+(FP.swing||0).toFixed(2), off:FPW.offKind, offVis:FPW.offG && FPW.offG.visible, face:+(e.face||0).toFixed(2), cam:+(FP.cam ? FP.cam.a : 0).toFixed(2), pos:[+e.pos.x.toFixed(2), +e.pos.y.toFixed(2)], fpm:[+FPM.x.toFixed(2), +FPM.y.toFixed(2)] };
    FPW.scene.updateMatrixWorld(true); const pr = o=>{ const v = o.getWorldPosition(new T.Vector3()); const z = v.z; v.project(FPW.cam); return [+v.x.toFixed(2), +v.y.toFixed(2), z < 0 ? 'front' : 'behind']; };
    out.hands = (FPW.mir ? FPW.mir.hands : FPW.arms.map(a=>a.h)).map(pr);
    if (FPW.weaponG && FPW.info){ const tip = new T.Vector3(0, FPW.info.tipY, 0); FPW.weaponG.localToWorld(tip); const z = tip.z; tip.project(FPW.cam); out.tip = [+tip.x.toFixed(2), +tip.y.toFixed(2), z < 0 ? 'front' : 'behind']; }
    if (FPW.offG){ const c = new T.Box3().setFromObject(FPW.offG).getCenter(new T.Vector3()); const z = c.z; c.project(FPW.cam); out.offAt = [+c.x.toFixed(2), +c.y.toFixed(2), z < 0 ? 'front' : 'behind']; }
    return out; });
  const sheath = process.env.ZF_SHEATH==='1'; if (sheath) await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); });
  if (!sheath && !process.env.ZF_NOFIGHT) await ev(()=>{ ISO.fighting = G.mon[0]; window.__realFight = rsFightNow; rsFightNow = ()=>G.ui==='playing'; });
  await wait(1200); console.log('REST', JSON.stringify(await st())); await page.screenshot({ path:'tools/tests/out/zfpmir2-' + (process.env.ZF_TAG||'') + 'rest.png' });
  if (sheath || process.env.ZF_GUARD==='1') return;
  const P = JSON.parse(process.env.ZF_P || '[1,0.8,0.62,0.54,0.45,0.25]');
  for (let i=0;i<P.length;i++){ await ev(async v=>{ const t = performance.now() + 250; while (performance.now() < t){ FP.swing = v; renderGame(); await new Promise(r=>requestAnimationFrame(r)); } FP.swing = v; renderGame(); }, P[i]);
    console.log('P' + i + ' swing ' + P[i], JSON.stringify(await st())); await page.screenshot({ path:'tools/tests/out/zfpmir2-' + i + '.png' }); }
  if (process.env.ZF_ISO!=='1') return;
  /* the same from above, close in, for a reference */
  await ev(()=>{ fpvToggle(); ISO.dist = 7; }); await wait(800);
  for (let i=0;i<P.length;i++){ await ev(async v=>{ const t = performance.now() + 250; while (performance.now() < t){ FP.swing = v; renderGame(); await new Promise(r=>requestAnimationFrame(r)); } FP.swing = v; renderGame(); }, P[i]);
    await page.screenshot({ path:'tools/tests/out/zfpmir2-iso' + i + '.png' }); }
};
