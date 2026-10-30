// FP-003: free movement in the first-person view. Held keys walk you smoothly any way you look, between tiles too; each tile
// crossed is a step (a turn); walls and creatures stop you a body's width short; walking into a creature strikes it; A walks
// aside; looking at an angle with the mouse walks you at that angle; your facing stays.
// Shot: shots/fp003-walk.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), frames = n=>ev(async n=>{ const t = performance.now() + n*20; for (let i=0; i<n || performance.now() < t; i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);
  const hold = async (k, ms)=>{ await page.keyboard.down(k); await ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms); await page.keyboard.up(k); await frames(3); };   /* (by the clock: the frames here run 30 to 40 ms) */
  await ev(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await frames(50);
  /* a run of plain floor: four tiles ahead and a wall after them, floor to the left */
  const at = await ev(()=>{ const p = G.player, ok = (x, y)=>tileAt(x, y)===T_FLOOR && isoPassable(x, y) && !(G.dungeonDeco && G.dungeonDeco[x] && G.dungeonDeco[x][y]);
    let best = null, bd = 1e9;
    for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++) for (let f=0; f<4; f++){ const F = FACING_VECT[f], L = FACING_VECT[(f+3)%4]; let good = true;
      for (let k=0; k<=4 && good; k++) good = ok(x+F[0]*k, y+F[1]*k) && ok(x+F[0]*k+L[0], y+F[1]*k+L[1]);
      good = good && tileAt(x+F[0]*5, y+F[1]*5)===T_WALL; const d = Math.hypot(x - p.x, y - p.y); if (good && d < bd){ bd = d; best = [x, y, f]; } }
    p.x = best[0]; p.y = best[1]; p.facing = best[2]; return { x:p.x, y:p.y, f:p.facing, F:FACING_VECT[p.facing], L:FACING_VECT[(p.facing+3)%4] }; });
  await ev(()=>{ window.__steps = 0; const t0 = tryMove; window.tryMove = (...a)=>{ window.__steps++; return t0(...a); }; });
  await page.keyboard.press('o'); await frames(30);
  const st = ()=>ev(()=>({ x:FPM.x, y:FPM.y, px:G.player.x, py:G.player.y, f:G.player.facing, t:window.__steps||0, cx:FPD.cam.position.x, cz:FPD.cam.position.z, fpv:fpv() }));
  const s0 = await st(); A(s0.fpv && Math.abs(s0.x - (at.x+0.5)) < 0.01 && Math.abs(s0.y - (at.y+0.5)) < 0.01, 'starts in the middle of the tile');
  /* a walk to the floor three tiles ahead: you glide there smoothly, never back, and end in the tile's middle */
  { const pt = await ev(at=>{ const v = new THREE.Vector3(at.x + at.F[0]*3 + 0.5, 0.02, at.y + at.F[1]*3 + 0.5).project(FPD.cam), r = canvas.getBoundingClientRect(); return { x:r.left + (v.x*0.5+0.5)*r.width, y:r.top + (-v.y*0.5+0.5)*r.height }; }, at);
    await ev(at=>{ ISO.path = isoFindPath(at.x + at.F[0]*3, at.y + at.F[1]*3) || []; ISO.nextStep = 0; }, at);   /* (FP-004: a click on the floor is a swing now - a walk to a spot comes from the minimap or a tap) */
    const tr = await ev(async F=>{ const out = []; const end = performance.now() + 2500; while (performance.now() < end){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); out.push(FPM.x*F[0] + FPM.y*F[1]); } return out; }, at.F);
    let back = 0; for (let i=1;i<tr.length;i++) back = Math.max(back, tr[i-1] - tr[i]);
    const e = await st(); A((e.px - at.x)*at.F[0] + (e.py - at.y)*at.F[1]===3, 'the walk took you three tiles: ' + JSON.stringify([e.px - at.x, e.py - at.y, at.F, await ev(()=>[ISO.path.length, G.ui, FPM.follow])])); A(back < 0.01, 'gliding there, never back: ' + back.toFixed(3));
    A(Math.abs(e.x - (e.px + 0.5)) < 0.03 && Math.abs(e.y - (e.py + 0.5)) < 0.03, 'in the middle of the tile at the end');
    await ev(at=>{ const p = G.player; p.x = at.x; p.y = at.y; FPM.x = at.x + 0.5; FPM.y = at.y + 0.5; FPM.follow = false; ISO.path = []; }, at); await frames(10); }
  const s0b = await st();
  /* a short hold: part of a tile, no step */
  await hold('w', 100); const s1 = await st(); const d1 = (s1.x - s0b.x)*at.F[0] + (s1.y - s0b.y)*at.F[1];
  A(d1 > 0.1 && d1 < 0.5 && s1.px===at.x && s1.py===at.y, 'a short hold walks part of a tile: ' + d1.toFixed(3) + ' tile, still on ' + [s1.px, s1.py]);
  A(Math.abs((s1.x - s0b.x)*at.L[0] + (s1.y - s0b.y)*at.L[1]) < 0.01, 'straight ahead');
  A(Math.abs(s1.cx - (s1.x - at.F[0]*0.14)) < 0.02 && Math.abs(s1.cz - (s1.y - at.F[1]*0.14)) < 0.02, 'the camera where you are, eyes a little back');
  /* hold on: tiles crossed are steps, then the wall stops you */
  await hold('w', 2600); const s2 = await st(); const tiles = (s2.px - at.x)*at.F[0] + (s2.py - at.y)*at.F[1];
  A(tiles===4, 'walked on to the last tile before the wall: ' + tiles); A(s2.t - s1.t >= 4, 'each tile a step: ' + (s2.t - s1.t) + ' steps');
  { const wall = (at.x + at.F[0]*5 + 0.5) - at.F[0]*0.5, wallY = (at.y + at.F[1]*5 + 0.5) - at.F[1]*0.5, gap = at.F[0] ? Math.abs(wall - s2.x) : Math.abs(wallY - s2.y);
    A(gap > 0.26 && gap < 0.38, 'stopped a body\'s width short of the wall: ' + gap.toFixed(3)); }
  A(s2.f===at.f, 'still facing the same way');
  const shot = await ev(async ()=>{ renderGame(); await new Promise(r=>requestAnimationFrame(r)); return FPD.r.domElement.toDataURL('image/jpeg', 0.8); });
  /* S back a way, then A aside */
  await hold('s', 650); const s3 = await st(); A((s3.px - at.x)*at.F[0] + (s3.py - at.y)*at.F[1] < 4, 'S walked back');
  await hold('a', 300); const s4 = await st(); A(s4.px===s3.px+at.L[0] && s4.py===s3.py+at.L[1], 'A walked aside into the next tile: ' + [s4.px - s3.px, s4.py - s3.py]); A(s4.f===at.f, 'facing kept');
  /* looking 45 degrees right with the mouse: W walks the diagonal */
  const box = await ev(()=>{ const r = canvas.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height*0.45 }; });
  await page.mouse.move(box.x, box.y); await page.mouse.down({ button:'right' }); for (let i=1; i<=10; i++) await page.mouse.move(box.x + 174.5*i/10, box.y); await page.mouse.up({ button:'right' }); await frames(5);
  const s5 = await st(); await hold('w', 160); const s6 = await st(); const R = [-at.L[0], -at.L[1]], mf = (s6.x - s5.x)*at.F[0] + (s6.y - s5.y)*at.F[1], mr = (s6.x - s5.x)*R[0] + (s6.y - s5.y)*R[1];
  A(mf > 0.1 && mr > 0.1 && Math.abs(mf - mr) < 0.12, 'walked the way you look, half ahead and half right: ' + [mf.toFixed(3), mr.toFixed(3)]);
  /* a goblin ahead: you stop short of it and strike it */
  await page.keyboard.press('z'); await page.keyboard.press('x'); await frames(30);
  const g = await ev(()=>{ const p = G.player, F = FACING_VECT[p.facing]; FPM.x = p.x + 0.5; FPM.y = p.y + 0.5;
    let k = 2; while (k > 0 && !isoPassable(p.x + F[0]*k, p.y + F[1]*k)) k--;
    if (k < 1) return null; const m = newMonster(); G.mon.push(m); Object.assign(m, { alive:1, x:p.x + F[0]*k, y:p.y + F[1]*k, hp:9999, maxHp:9999, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin', col:'#8f8', art:null, abilities:[] }); window.__hits = 0; const f0 = fight; window.fight = (...a)=>{ window.__hits++; return f0(...a); };
    return { k, mx:m.x, my:m.y }; }); A(g, 'room for a goblin ahead');
  await hold('w', 3200); const s7 = await st(), hits = await ev(()=>window.__hits);
  A(!(s7.px===g.mx && s7.py===g.my), 'the goblin stops you'); A(hits >= 1, 'walking into it strikes it: ' + hits + ' blows');
  { const gap = Math.max(Math.abs(s7.x - (g.mx + 0.5)), Math.abs(s7.y - (g.my + 0.5))); A(gap > 0.6, 'a body\'s width short of its tile: ' + gap.toFixed(3)); }
  fs.writeFileSync(SHOTS + '/fp003-walk.jpg', Buffer.from(shot.split(',')[1], 'base64'));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
