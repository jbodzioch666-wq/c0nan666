// probe: through your eyes in the Peddler's shop, hold W into the desk (the counter opens the shop) with a real keyboard's repeats,
// let go, close the shop, and watch whether you keep walking. Several approaches (straight, at the ends, slanted, from the side) and
// ways of letting go (in the menu, after closing it). Prints a line per case; KEEPS when you walked on with no key down.
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1500);
  await ev(()=>{ enterInterior('shop'); setUi('playing'); }); await wait(1500);
  await page.keyboard.press('o'); await wait(1000);
  const st = ()=>ev(()=>({ ui:G.ui, x:+FPM.x.toFixed(3), y:+FPM.y.toFixed(3), px:G.player.x, py:G.player.y, held:[...(ISO.held||[])], hk:[...HELD_KEYS], follow:FPM.follow, path:(V3.path||[]).length, ipath:(ISO.path||[]).length, yaw:+fpvYawNow().toFixed(2), f:G.player.facing }));
  const cases = JSON.parse(process.env.ZD_CASES || '[[10,9,null,"menu"],[10,9,null,"after"],[9,8,null,"menu"],[11,8,null,"after"],[9,9,-1.2,"menu"],[11,9,-2.0,"after"],[8,7,0,"menu"],[12,7,3.14,"after"],[10,8,-1.0,"after"],[10,8,-2.2,"menu"]]');
  for (const [cx, cy, yaw, up] of cases){
    await ev(()=>{ if (G.ui!=='playing') setUi('playing'); ISO.held && ISO.held.clear(); });
    await ev(([cx, cy, yaw])=>{ const p = G.player; p.x = cx; p.y = cy; p.facing = 0; p.faceDiag = null; FPM.key = null; FP.lookYaw = null;
      if (yaw!=null){ FP.lookYaw = yaw; p.facing = fpvQuarter(yaw); FP.lookF = p.facing; } }, [cx, cy, yaw]); await wait(600);
    if (yaw!=null) await ev(yaw=>{ FP.lookYaw = yaw; G.player.facing = fpvQuarter(yaw); FP.lookF = G.player.facing; }, yaw);
    const s0 = await st();
    /* hold W: a real keyboard repeats the key-down every ~33 ms */
    await page.keyboard.down('w'); let s = null, t0 = Date.now();
    while (Date.now() - t0 < 4000){ await page.keyboard.down('w'); await wait(35); s = await st(); if (s.ui!=='playing') break; }
    const opened = s.ui;
    for (let i=0; i<12; i++){ await page.keyboard.down('w'); await wait(35); }   /* (still held a moment in the menu) */
    if (up==='menu'){ await page.keyboard.up('w'); await wait(200); await page.keyboard.press('Escape'); }
    else { await page.keyboard.press('Escape'); for (let i=0; i<6; i++){ await page.keyboard.down('w'); await wait(35); } await page.keyboard.up('w'); }
    await wait(300); const a = await st(); await wait(1500); const b = await st();
    const moved = Math.hypot(b.x - a.x, b.y - a.y);
    console.log(moved > 0.05 || b.held.length ? 'KEEPS' : 'ok', JSON.stringify({ start:[cx, cy, yaw, up], opened, s0:[s0.x, s0.y, s0.yaw], a, b, moved:+moved.toFixed(3) }));
  }
};
