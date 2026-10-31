// FP-013: walking forward through your eyes slides on round the corner of a wall (a doorway's jamb, the end of a gap) instead of being
// caught on it - the snag the probe zfpstuck found in towns - and walls still stop you, head on and at a slant.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; });
  await wait(1200);
  await page.keyboard.press('o'); await wait(800);
  A(await ev(()=>fpv()), 'through your eyes in the dungeon');
  /* a corner, in a frame of its own (E along the row, S across it, any of the eight ways round): you in the tile heading along E; the
     tile ahead and to the side (1,-1) a wall's end, the tile beside you (0,-1) open (a gap) */
  const spot = await ev(()=>{ G.mon.forEach(m=>{ m.alive = 0; }); const S = (x, y)=>fpmSolid(x, y), op = (x, y)=>tileAt(x, y)===T_FLOOR && !S(x, y);
    for (const E of [[1,0],[0,1],[-1,0],[0,-1]]) for (const sg of [1, -1]){ const N = [-E[1]*sg, E[0]*sg];
      for (let x=1; x<COLS-1; x++) for (let y=1; y<ROWS-1; y++){ const at = (i, j)=>[x + i*E[0] + j*N[0], y + i*E[1] + j*N[1]], O = (i, j)=>op(...at(i, j));
        if (O(0,0) && O(1,0) && O(2,0) && O(3,0) && O(0,-1) && S(...at(1,-1)) && O(0,1) && O(1,1) && O(2,1)) return { x, y, E, N }; } }
    return null; });
  A(spot, 'a wall\'s end beside a gap on this floor');
  /* walk: start at (sx,sy) in the spot's frame, held W at the angle a, for ms; where you end up */
  const walk = (sx, sy, a0, ms)=>ev(async ([Sp, sx, sy, a0, ms])=>{ const p = G.player, E = Sp.E, N = Sp.N; G.mon.forEach(m=>{ m.alive = 0; }); p.x = Sp.x; p.y = Sp.y;
    /* the frame's (u along E, v along N) to the world's, and back */
    const W = (u, v)=>[Sp.x + 0.5 + (u - 0.5)*E[0] + (v - 0.5)*N[0], Sp.y + 0.5 + (u - 0.5)*E[1] + (v - 0.5)*N[1]], L = (x, y)=>{ const dx = x - Sp.x - 0.5, dy = y - Sp.y - 0.5; return [dx*E[0] + dy*E[1] + 0.5, dx*N[0] + dy*N[1] + 0.5]; };
    const a = Math.atan2(Math.cos(a0)*E[1] + Math.sin(a0)*N[1], Math.cos(a0)*E[0] + Math.sin(a0)*N[0]), w0 = W(sx, sy);
    p.x = Math.floor(w0[0]); p.y = Math.floor(w0[1]); FPM.key = fpmKey(); FPM.map = G.map; FPM.x = w0[0]; FPM.y = w0[1]; FPM.follow = false; FPM.noT = 0; ISO.path = [];
    for (let k=0; k<3; k++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); FPM.x = w0[0]; FPM.y = w0[1]; FPM.follow = false; }
    FP.lookYaw = a; p.facing = fpvQuarter(a); FP.lookF = p.facing; p.faceDiag = null; if (FP.cam) FP.cam.a = a;
    ISO.held = ISO.held || new Set(); ISO.held.clear(); ISO.held.add('w'); let minPen = 9, maxPen = 0;
    const t0 = performance.now(); while (performance.now() - t0 < ms){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); if (FP.lookYaw==null){ FP.lookYaw = a; p.facing = fpvQuarter(a); FP.lookF = p.facing; } const pn = fpmPen(FPM.x, FPM.y); maxPen = Math.max(maxPen, pn); }
    ISO.held.clear(); const l = L(FPM.x, FPM.y), dx = p.x - Sp.x, dy = p.y - Sp.y; return { x:+l[0].toFixed(3), y:+l[1].toFixed(3), px:dx*E[0] + dy*E[1], py:dx*N[0] + dy*N[1], maxPen:+maxPen.toFixed(4), E, N }; }, [spot, sx, sy, a0, ms]);

  /* the snag: touching the wall's end (its corner at x+1, y) and heading east, a hair toward it */
  const r1 = await walk(0.818, 0.239, -0.03, 900);
  A(r1.x > 1.3 && r1.px >= 1, 'slid round the corner and on along the row: ' + JSON.stringify(r1));
  A(r1.maxPen < 0.002, 'never into the wall on the way: ' + JSON.stringify(r1));
  /* steeper: a quarter-turn's sixth into it, from further in the gap's mouth */
  const r2 = await walk(0.6, 0.25, -0.26, 1100);
  A(r2.x > 1.2, 'at a slant into the corner: carried round it: ' + JSON.stringify(r2));
  /* straight up into the wall beside the gap: stopped, not through it */
  const r3 = await walk(1.5, 0.6, -Math.PI/2, 800);
  A(r3.py===0 && r3.px===1 && r3.y >= 0.295 && r3.y < 0.32, 'walked into the wall head on: stopped a body\'s width off it: ' + JSON.stringify(r3));
  /* up through the gap itself: through */
  const r4 = await walk(0.5, 0.6, -Math.PI/2, 900);
  A(r4.py <= -1, 'up through the gap: ' + JSON.stringify(r4));
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
