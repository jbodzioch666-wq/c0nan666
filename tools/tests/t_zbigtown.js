// probe: full-size towns on the land seen through your eyes from a few distances (shots/zbigtown-<n>.jpg). ZBT_N towns
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.4; });
  await wait(1000); await page.keyboard.press('o'); await wait(400);
  const towns = await ev(()=>townList().slice(0, +(window.ZBT_N || 3)).map(t=>[t.x, t.y]));
  for (const [i, [tx, ty]] of towns.entries()){
    for (const back of [3, 7]){
      const ok = await ev(([tx, ty, back])=>{ G.interior = null; G.gameMode = 0; G.owPos = { x:tx, y:ty }; setUi('playing'); renderGame(); const l = o3L(tx, ty), f = o3TownFoot(l[0], l[1]);
        for (const ex of [0, 0.4, -0.4, 0.8, -0.8, 1.3, -1.3, 2, -2, 2.7, -2.7, 3.14]){ const a = f.ga + ex, x = f.cx + Math.cos(a)*(f.r + back), z = f.cz + Math.sin(a)*(f.r + back), g = o3G(Math.floor(x), Math.floor(z));
          if (g && o3Passable(g[0], g[1]) && o3Tile(Math.floor(x), Math.floor(z))!==OW_WATER){ G.owPos = { x:g[0], y:g[1] }; FPM.x = x; FPM.y = z; FPM.key = fpmKey(); FPM.follow = false; const b = Math.atan2(f.cz - z, f.cx - x); G.player.facing = fpvQuarter(b); FP.lookF = G.player.facing; FP.lookYaw = b; FP.pitch = 0.05; return { r:f.r, open:f.open, tier:townTier(tx, ty), race:(townFlavorAt(tx, ty)||{}).race }; } }
        return null; }, [tx, ty, back]);
      await wait(2500); await ev(([tx, ty])=>{ const l = o3L(tx, ty), f = o3TownFoot(l[0], l[1]); FP.lookF = G.player.facing; FP.lookYaw = Math.atan2(f.cz - FPM.y, f.cx - FPM.x); }, [tx, ty]); await wait(300);
      console.log(i, back, JSON.stringify(ok));
      await page.screenshot({ path:SHOTS + '/zbigtown-' + i + '-' + back + '.jpg', type:'jpeg', quality:80 }); } }
};
