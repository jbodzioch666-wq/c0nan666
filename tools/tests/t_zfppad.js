// probe: the d-pad's up held and let go through your eyes in the Peddler's shop (and on the shop floor away from the desk)
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.interior = null; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1500); await ev(()=>{ enterInterior('shop'); setUi('playing'); }); await wait(1500);
  await page.keyboard.press('o'); await wait(1000);
  const st = ()=>ev(()=>({ ui:G.ui, x:+FPM.x.toFixed(3), y:+FPM.y.toFixed(3), held:[...(ISO.held||[])] }));
  for (const [cx, cy, ms] of [[10,12,300],[10,9,2000]]){
    await ev(([cx, cy])=>{ if (G.ui!=='playing') setUi('playing'); const p = G.player; p.x = cx; p.y = cy; p.facing = 0; FPM.key = null; FP.lookYaw = null; ISO.held && ISO.held.clear(); }, [cx, cy]); await wait(500);
    const btn = await page.$('.dpad [data-dir="up"]'); const vis = btn && await btn.isVisible();
    await ev(()=>{ const b = document.querySelector('.dpad [data-dir="up"]'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true, pointerId:7, isPrimary:true })); });
    await wait(ms); const s1 = await st();
    await ev(()=>{ const b = document.querySelector('.dpad [data-dir="up"]'); b.dispatchEvent(new PointerEvent('pointerup', { bubbles:true, pointerId:7, isPrimary:true })); });
    if (s1.ui!=='playing') await ev(()=>setUi('playing'));
    await wait(200); const a = await st(); await wait(1500); const b = await st();
    console.log('pad', JSON.stringify({ start:[cx, cy], visible:vis, held:s1, a, b, moved:+Math.hypot(b.x - a.x, b.y - a.y).toFixed(3) }));
  }
};
