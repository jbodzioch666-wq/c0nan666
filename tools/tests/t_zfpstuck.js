// probe: walk about in first person with W held, every way, and report each time the walk stops with no wall or creature ahead
// (a snag). ZS_MODE=dgn|town|land, ZS_N trials (default 120), ZS_MS each (default 1400). Prints SNAG lines with the state.
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const mode = process.env.ZS_MODE || 'dgn', N = +(process.env.ZS_N || 120), MS = +(process.env.ZS_MS || 1400);
  await ev(mode=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    if (mode==='dgn'){ const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; }
    else if (mode==='town'){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); enterVillage(); setUi('playing'); G.interior = null; G.player.clock = DAY_LENGTH*0.4; }
    else if (mode==='land'){ const t = townList()[0]; G.interior = null; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; setUi('playing'); G.player.clock = DAY_LENGTH*0.4;
      for (const [dx, dy] of [[2,0],[-2,0],[0,2],[0,-2],[3,0],[-3,0],[0,3],[0,-3],[3,3],[-3,-3]]){ const x = t.x+dx, y = t.y+dy; if (G.ow.map[x] && G.ow.map[x][y]!==OW_WATER && o3Passable(x, y) && !owSiteKindAt(x, y)){ G.owPos = { x, y }; break; } } }
  }, mode);
  await wait(mode==='land' ? 3000 : 1500);
  await page.keyboard.press('o'); await wait(900);
  console.log('start', JSON.stringify(await ev(()=>({ gm:G.gameMode, fpv:fpv(), ui:G.ui }))));
  let snags = 0;
  for (let i=0; i<N; i++){
    const r = await ev(async ([MS, seed])=>{ const p = G.player; if (G.mon) G.mon.forEach(m=>{ if (G.gameMode!==3) m.alive = 0; }); G.player.hp = G.player.maxHp;
      if (G.ui!=='playing') setUi('playing');
      const yaw = (seed*2.399963) % (Math.PI*2); FP.lookYaw = yaw; p.facing = fpvQuarter(yaw); FP.lookF = p.facing; p.faceDiag = null;
      ISO.held = ISO.held || new Set(); ISO.held.clear(); ISO.held.add('w');
      const t0 = performance.now(); let still = 0, last = null, out = null, lastT = t0, x0 = FPM.x, y0 = FPM.y;
      while (performance.now() - t0 < MS){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const now = performance.now();
        if (FP.lookYaw==null){ FP.lookYaw = yaw; p.facing = fpvQuarter(yaw); FP.lookF = p.facing; }
        const pos = [FPM.x, FPM.y], d = last ? Math.hypot(pos[0] - last[0], pos[1] - last[1]) : 1; last = pos;
        if (d < 0.0015) still += now - lastT; else still = 0; lastT = now;
        if (still > 500 && !out){ const a = fpvYawNow(), h = fpmHere(), ahead = [FPM.x + Math.cos(a)*(FPM_R + 0.08), FPM.y + Math.sin(a)*(FPM_R + 0.08)];
          /* a wall: anything solid within the body's reach ahead, either side of straight on */
          let wall = false; for (const da of [-0.5, -0.25, 0, 0.25, 0.5]){ const ax = FPM.x + Math.cos(a + da)*(FPM_R + 0.06), ay = FPM.y + Math.sin(a + da)*(FPM_R + 0.06), tx = Math.floor(ax), ty = Math.floor(ay); if ((tx!==h[0] || ty!==h[1]) && fpmSolid(tx, ty)) wall = true; }
          const nb = []; for (let j=-1;j<=1;j++){ let row = ''; for (let i2=-1;i2<=1;i2++) row += fpmSolid(h[0]+i2, h[1]+j) ? '#' : '.'; nb.push(row); }
          out = { wall, a:+a.toFixed(3), yaw:+yaw.toFixed(3), fx:+FPM.x.toFixed(3), fy:+FPM.y.toFixed(3), here:h, follow:FPM.follow, no:[FPM.noX, FPM.noY, Math.round(FPM.noT - now)], spd:+(FPM.spd||0).toFixed(3), held:[...ISO.held], ui:G.ui, gm:G.gameMode, gather:!!G.gather, sleep:!!G.sleepFx, key:FPM.key===fpmKey(), glide:(()=>{ const g = fpmGlide(); return g ? [+g.x.toFixed(3), +g.y.toFixed(3)] : null; })(), nb, pen:+fpmPen(FPM.x, FPM.y).toFixed(4), penA:+fpmPen(ahead[0], ahead[1]).toFixed(4) }; }
      }
      ISO.held.clear(); return { moved:+Math.hypot(FPM.x - x0, FPM.y - y0).toFixed(2), out }; }, [MS, i + 1]);
    if (r.out && !r.out.wall && r.out.ui==='playing' && r.out.key){ snags++; console.log('SNAG', i, JSON.stringify(r)); }
  }
  console.log('done snags', snags, 'of', N);
};
