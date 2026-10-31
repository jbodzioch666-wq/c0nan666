// FP-012: a bow or a crossbow through your eyes - held in your left fist with an arrow nocked, drawn back to your jaw and loosed with
// your figure's shot (the arrow leaving at BOW_LOOSE), the next arrow fetched and nocked; a crossbow raised to your cheek, kicking at the
// loose, spanned and loaded again; put away for your melee weapon when you strike with it. Shots: shots/fp012-draw.jpg, shots/fp012-xbow.jpg
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const shot = async nm=>{ const d = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; const g = c.getContext('2d'); g.drawImage(FPD.cv, 0, 0, c.width, c.height); g.drawImage(canvas, 0, 0); return c.toDataURL('image/jpeg', 0.82); });
    require('fs').writeFileSync(SHOTS + '/' + nm, Buffer.from(d.split(',')[1], 'base64')); };
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y); let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f]; let good = true; for (let k=0; k<=5 && good; k++) good = ok(x+F[0]*k, y+F[1]*k);
      const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; G.mon.forEach(m=>{ m.alive = 0; });
    /* a sword in hand, a willow shortbow and arrows ready, the last blow a melee one */
    G.gear.weapon = rsMakeWeapon(3, 2); G.gear.weapon.used = true; G.gear.offhand = newItem(); G.gear.ranged = rsMakeBow(2, false); G.gear.ranged.used = true;
    G.gear.ammo = newItem(); G.player.arrows = 0; addArrows(40, 2); G.player.rsLastType = 'melee'; G.player.rangedMode = 'bow'; FPW.bowOut = null; });
  await page.keyboard.press('o'); await wait(800);
  A(await ev(()=>fpv()), 'through your eyes in the dungeon');
  const st = ()=>ev(()=>{ const B = FPW.bow; return { style:FPW.style, kind:B && B.kind, t:B && B.t, p:B && B.p, d:B && B.d, arrow:!!(B && B.arrow && B.arrow.visible), arms:(FPW.arms||[]).length, bowOut:FPW.bowOut }; });
  A((await st()).style==='blade1', 'the sword in hand while your last blow was a melee one: ' + JSON.stringify(await st()));

  /* ---- a shot at a goblin: the bow comes up, is drawn, loosed with the arrow, and loaded again ---- */
  await ev(()=>{ const p = G.player, F = FACING_VECT[p.facing], m = newMonster(); G.mon.push(m);
    Object.assign(m, { alive:1, x:p.x + F[0]*4, y:p.y + F[1]*4, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[], speed:0 });
    window.__arrowsBefore = G.player.arrows; G.foeRef = m; window.__logs = []; const lm = logMsg; window.logMsg = (t, k)=>{ window.__logs.push(t); return lm(t, k); }; rangedAttack(m); });
  /* follow the shot frame by frame */
  const trace = await ev(async ()=>{ const out = [], t0 = performance.now(); while (performance.now() - t0 < 2200){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const B = FPW.bow, s = (ISO.shots||[]).find(s=>s.kind==='arrow');
      out.push({ ms:Math.round(performance.now() - t0), kind:B && B.kind, p:B ? +(B.p||0).toFixed(3) : null, d:B ? +(B.d||0).toFixed(3) : null, arrow:!!(B && B.arrow.visible), fly:s ? +s.t.toFixed(3) : null }); } return out; });
  const k = trace.find(f=>f.kind==='bow'); A(k, 'the bow in your hands for the shot: ' + JSON.stringify(trace.slice(0, 3)) + ' log: ' + JSON.stringify(await ev(()=>window.__logs)));
  const drawn = trace.filter(f=>f.d > 0.95); A(drawn.length, 'drawn to the full: max ' + Math.max(...trace.map(f=>f.d||0)));
  const BL = await ev(()=>BOW_LOOSE*BOW_RATE);
  const firstLoose = trace.find(f=>f.p > BL + 0.002);
  A(firstLoose && !firstLoose.arrow && firstLoose.d===0, 'loosed at BOW_LOOSE: the string back, the arrow gone from it: ' + JSON.stringify(firstLoose));
  A(drawn.every(f=>f.p < BL && f.arrow), 'the arrow on the string while it is drawn');
  const flyAtLoose = trace.find(f=>f.fly!==null && f.fly >= 0); A(flyAtLoose && Math.abs(flyAtLoose.ms - firstLoose.ms) < 160, 'the arrow flies as it is loosed: flight ' + JSON.stringify(flyAtLoose) + ' loose ' + JSON.stringify(firstLoose));
  const end = trace[trace.length - 1]; A(end.p===0 && end.arrow, 'the next arrow nocked and the bow lowered after: ' + JSON.stringify(end));
  A(trace.some(f=>f.p > 0.8 && f.p < 0.97 && f.arrow), 'the next arrow brought up in your fingers');
  /* the pose at full draw: the arrow's head just past the bow, pointing out in front of you near the crosshair */
  await ev(()=>{ window.__fpwP = 0.33; }); await wait(300);
  const aim = await ev(()=>{ const T = THREE, B = FPW.bow; B.root.updateMatrixWorld(true); const a = B.arrow, n = a.localToWorld(new T.Vector3(0, 0, 0)), h = a.localToWorld(new T.Vector3(0, 0, -0.75));
    const hp = h.clone().project(FPW.cam), dir = h.clone().sub(n).normalize(), g = B.inner.localToWorld(new T.Vector3()).project(FPW.cam);
    return { hx:hp.x, hy:hp.y, dz:dir.z, gx:g.x, gy:g.y, nz:n.z }; });
  A(aim.dz < -0.95, 'the arrow points out in front of you: ' + JSON.stringify(aim));
  A(Math.abs(aim.hx) < 0.2 && Math.abs(aim.hy) < 0.25, 'its head near the crosshair: ' + JSON.stringify(aim));
  A(aim.gx < 0 && aim.gx > -0.4, 'the bow held just left of the middle: ' + JSON.stringify(aim));
  await shot('fp012-draw.jpg');
  await ev(()=>{ delete window.__fpwP; });

  /* ---- a melee blow puts the bow away ---- */
  await wait(500); await ev(()=>{ sfx('hit'); }); await wait(300);
  A((await st()).style==='blade1' && !(await st()).kind, 'a blow with your sword: the sword back in hand: ' + JSON.stringify(await st()));

  /* ---- with no melee weapon, the bow is out; no arrows, none nocked ---- */
  await ev(()=>{ G.gear.weapon = newItem(); FPW.bowOut = null; G.player.rsLastType = 'melee'; G.player.arrows = 0; }); await wait(400);
  { const s = await st(); A(s.kind==='bow' && !s.arrow, 'no melee weapon: the bow in hand, empty with no arrows: ' + JSON.stringify(s)); }
  await ev(()=>{ G.player.arrows = 20; }); await wait(300);
  A((await st()).arrow, 'arrows again: one nocked');
  /* the arrowhead in the arrows' colour; a magic longbow and a yew longbow longer than a shortbow */
  const look = await ev(()=>{ const B = FPW.bow; let c = null; B.arrow.traverse(o=>{ if (o.isMesh && o.material.metalness > 0.5 && !c) c = '#' + o.material.color.getHexString(); });
    const h = ()=>{ const b = new THREE.Box3(); for (const l of FPW.bow.limbs) b.expandByObject(l.m); return b.max.y - b.min.y; }; const short = h();
    G.gear.ranged = rsMakeBow(4, true); G.gear.ranged.used = true; fpwSetWeapon(); return { c, want:'#' + m3dCol(shotCol(G.gear.ranged)).lerp(new THREE.Color(0xffffff), 0.1).getHexString(), short, long:h() }; });
  A(look.c===look.want, 'the arrowhead in the arrows\' colour: ' + JSON.stringify(look));
  A(look.long > look.short*1.2, 'a longbow taller than a shortbow: ' + JSON.stringify(look));

  /* ---- a crossbow: raised, loosed, spanned and loaded again ---- */
  await ev(()=>{ G.gear.ranged = rsMakeCrossbow(3); G.gear.ranged.used = true; G.gear.ammo = newItem(); G.player.arrows = 0; let at = 0; for (let t=0; t<40; t++) if (ammoKind(t)==='bolt'){ at = t; break; } addArrows(30, at + 2); });
  await wait(500);
  const xb = P=>ev(P=>{ window.__fpwP = P; fpwDraw(); const B = FPW.bow, x = B.xb; B.root.updateMatrixWorld(true); const c = B.model.localToWorld(new THREE.Vector3(0, 0, 0)).project(FPW.cam), n = x.bolt.parent.localToWorld(new THREE.Vector3(0, 0.054, 0.7)).project(FPW.cam);
    return { kind:B.kind, spanned:x.L.visible, rest:x.rest.visible, bolt:x.bolt.visible, cx:c.x, cy:c.y, nx:n.x, ny:n.y, arms:FPW.arms.length }; }, P);
  const x0 = await xb(0), x1 = await xb(0.33), x2 = await xb(0.5), x3 = await xb(0.97);
  A(x0.kind==='xbow' && x0.spanned && x0.bolt && x0.arms===2, 'the crossbow in both hands, spanned and loaded: ' + JSON.stringify(x0));
  A(x0.cx > 0.1 && x0.cy < -0.3, 'held low on the right at rest: ' + JSON.stringify(x0));
  A(Math.abs(x1.nx) < 0.1 && x1.ny < 0 && x1.ny > -0.35, 'raised to sight down it, its nose under the crosshair: ' + JSON.stringify(x1));
  A(!x2.spanned && x2.rest && !x2.bolt, 'loosed: the string straight across, the bolt gone: ' + JSON.stringify(x2));
  A(x3.spanned && x3.bolt, 'spanned and loaded again: ' + JSON.stringify(x3));
  await xb(0.33); await shot('fp012-xbow.jpg');
  await ev(()=>{ delete window.__fpwP; });

  /* ---- thrown weapons and wands keep your melee hands ---- */
  await ev(()=>{ G.gear.ranged = rsMakeThrown('dart', 2, 20); G.gear.ranged.used = true; }); await wait(300);
  { const s = await st(); A(!s.kind && s.style==='fists', 'darts are thrown, not drawn: ' + JSON.stringify(s)); }
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
