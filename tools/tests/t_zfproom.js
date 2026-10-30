// probe: the first-person view inside town buildings (shots/zfproom-<key>.jpg)
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.player.clock = DAY_LENGTH*0.4; });
  await wait(1500); await page.keyboard.press('o'); await wait(600);
  for (const k of (process.env.ZROOMS || 'tavern,shop').split(',')){
    await ev(k=>{ if (G.interior) exitInterior && exitInterior(); enterInterior(k); setUi('playing'); }, k); await wait(2500);
    await ev(()=>{ const p = G.player; for (let d=4; d>0; d--) if (tileOpen(p.x, p.y-d)){ p.y -= d; break; } }); await wait(1500);
    for (const f of [0, 1, 2]){ await ev(f=>{ G.player.facing = f; FP.lookYaw = null; }, f); await wait(900);
      console.log(k, f, JSON.stringify(await ev(()=>({ int:G.interior && G.interior.key, x:G.player.x, y:G.player.y, cam:V3.cam.position.toArray().map(v=>+v.toFixed(2)), on:fpvTown() }))));
      await page.screenshot({ path:SHOTS + '/zfproom-' + k + '-' + f + '.jpg', type:'jpeg', quality:80 }); }
  }
};
