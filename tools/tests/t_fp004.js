// FP-004: shooter combat in the first-person view. The weapon is in your hands; a left click on a creature within reach strikes it,
// held it strikes again on the beat, a click within the beat does nothing more; a click at the air swings at nothing (no turn);
// a creature out of reach isn't struck with a blade; with a bow it's shot from your eyes, and a shot at a wall flies there and
// spends nothing; shift-click still examines.
// Shots: shots/fp004-weapon.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms), frames = n=>ev(async n=>{ const t = performance.now() + n*20; for (let i=0; i<n || performance.now() < t; i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await frames(50);
  /* plain floor with four more tiles ahead */
  const at = await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2];
    window.__ex = 0; const x0 = examineSay; window.examineSay = (...a)=>{ window.__ex++; return x0(...a); }; window.__fights = 0; const f0 = fight; window.fight = (...a)=>{ window.__fights++; return f0(...a); };
    window.__ticks = 0; const t0 = tickMonsters; window.tickMonsters = (...a)=>{ window.__ticks++; return t0(...a); };
    return { x:p.x, y:p.y, F:FACING_VECT[p.facing] }; });
  await page.keyboard.press('o'); await frames(30);
  const goblin = k=>ev(([at, k])=>{ G.mon.forEach(m=>{ m.alive = 0; }); const m = newMonster(); G.mon.push(m);
    Object.assign(m, { alive:1, x:at.x + at.F[0]*k, y:at.y + at.F[1]*k, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0 }); }, [at, k]);
  /* where the goblin's middle is on the screen */
  const aimAt = ()=>ev(()=>{ const m = G.mon.find(m=>m.alive), e = M3D.inst.get(m), r = canvas.getBoundingClientRect();
    const v = e && e.holder ? e.holder.position.clone() : new THREE.Vector3(m.x+0.5, 0, m.y+0.5); v.y += e && e.H ? e.H*0.75 : 0.5;   /* (its chest: with FP-006's wider view an adjacent goblin's middle sits behind the quick bar) */ v.project(FPD.cam);
    return { x:r.left + (v.x*0.5+0.5)*r.width, y:r.top + (-v.y*0.5+0.5)*r.height, model:!!(e && e.holder) }; });
  const st = ()=>ev(()=>({ fights:window.__fights, ticks:window.__ticks, swing:FP.swing||0, atk:!!FPW.atk, fpw:FPW.ok, shots:(ISO.shots||[]).map(s=>[s.kind, s.m ? s.m.nm : null, +s.x0.toFixed(2), +s.y0.toFixed(2)]), px:G.player.x, py:G.player.y }));
  await goblin(1); await frames(40); const g1 = await aimAt(); A(g1.model, 'the goblin has a model');
  /* the weapon in your hands */
  const w0 = await st(); A(w0.fpw, 'the weapon view runs');
  const shot = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return c.toDataURL('image/jpeg', 0.8); });
  fs.writeFileSync(SHOTS + '/fp004-weapon.jpg', Buffer.from(shot.split(',')[1], 'base64'));
  const weaponPx = await ev(()=>{ const c = FPW.cv, g = document.createElement('canvas'); g.width = c.width; g.height = c.height; const x = g.getContext('2d'); x.drawImage(c, 0, 0); const d = x.getImageData(0, 0, g.width, g.height).data; let n = 0; for (let i=3; i<d.length; i+=16) if (d[i] > 0) n++; return n / (d.length/16); });
  A(weaponPx > 0.01 && weaponPx < 0.5, 'the weapon and hands drawn in the view: ' + (weaponPx*100).toFixed(1) + '% of it');
  /* a click on it: a blow, the weapon swung */
  await page.mouse.click(g1.x, g1.y); await frames(3); const s1 = await st();
  A(s1.fights===1, 'a click on the goblin strikes it: ' + s1.fights); A(s1.atk || s1.swing > 0, 'the weapon swings');
  A(s1.px===at.x && s1.py===at.y, 'you stay where you are');
  await page.mouse.click(g1.x, g1.y); await frames(3); A((await st()).fights===1, 'a click within the beat does nothing more');
  /* held: again on the beat */
  await wait(1300); await page.mouse.move(g1.x, g1.y); await page.mouse.down(); await wait(2800); await page.mouse.up(); const s2 = await st();   /* (by the clock: the frames here run 30 to 40 ms) */
  A(s2.fights >= 3 && s2.fights <= 4, 'held, it strikes on the beat: ' + s2.fights + ' blows');
  /* at the air: a swing at nothing, no turn */
  await wait(1300); const t0 = (await st()).ticks; const r = await ev(()=>{ const c = canvas.getBoundingClientRect(); return { x:c.left + c.width*0.5, y:c.top + c.height*0.12 }; });
  await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); }); await frames(5);
  await page.mouse.click(r.x, r.y); await frames(3); const s3 = await st();
  A(s3.fights===s2.fights && s3.ticks===t0, 'a swing at the air strikes nothing and takes no turn'); A(s3.atk || s3.swing > 0, 'but the weapon swings');
  /* out of reach with a blade: not struck */
  await goblin(3); await wait(1400); const g3 = await aimAt(); await page.mouse.click(g3.x, g3.y); await frames(3); const s4 = await st();
  A(s4.fights===s3.fights, 'a goblin three tiles off isn\'t struck with a blade');
  /* a bow: shot from your eyes */
  await ev(()=>{ const P = G.player, bow = rsMakeBow(0, false); bow.used = true; G.gear.ranged = bow; G.gear.ammo = rsMakeAmmo(0); P.arrows = 50; P.rangedMode = 'bow'; });
  await wait(1400); const g5 = await aimAt(); const a0 = await ev(()=>rangedAmmoN(G.gear.ranged));
  await page.mouse.click(g5.x, g5.y); await ev(async ()=>{ const t = performance.now() + 1500; while (performance.now() < t && !(ISO.shots||[]).some(s=>s.m)){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }); const s5 = await st(), fpm = await ev(()=>[FPM.x, FPM.y]);   /* (the arrow is loosed a beat after the draw) */
  const arrow = s5.shots.find(x=>x[0]==='arrow' && x[1]==='goblin');
  A(arrow, 'the goblin three tiles off is shot: ' + JSON.stringify(s5.shots)); A(Math.abs(arrow[2] - fpm[0]) < 0.02 && Math.abs(arrow[3] - fpm[1]) < 0.02, 'from your eyes');
  A(await ev(()=>rangedAmmoN(G.gear.ranged)) < a0, 'an arrow spent');
  /* at the wall: it flies there, nothing spent, no turn */
  await wait(1400); await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); ISO.shots = []; }); await frames(5);
  const a1 = await ev(()=>rangedAmmoN(G.gear.ranged)), t1 = (await st()).ticks; await ev(()=>{ window.__wild = 0; const l0 = isoShotLand; window.isoShotLand = s=>{ if (!s.m) window.__wild++; return l0(s); }; });
  await page.mouse.click(r.x, r.y + 60); await wait(1100); const s6 = await st(); s6.wild = await ev(()=>window.__wild);
  A(s6.wild===1, 'a shot at nothing flies and lands: ' + s6.wild); A(await ev(()=>rangedAmmoN(G.gear.ranged))===a1 && s6.ticks===t1, 'spending nothing and taking no turn');
  /* shift-click examines */
  await goblin(1); await wait(1400); const g7 = await aimAt(); const f7 = (await st()).fights;
  await page.keyboard.down('Shift'); await page.mouse.click(g7.x, g7.y); await page.keyboard.up('Shift'); await frames(3);
  A((await st()).fights===f7, 'shift-click doesn\'t strike'); A(await ev(()=>window.__ex) >= 1, 'shift-click examines');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
