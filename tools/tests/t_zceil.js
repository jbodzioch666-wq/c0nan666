// probe: looking up in first person - a dungeon, the field, rooms in town (shots/zceil-*.jpg)
module.exports = async page=>{ const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const up = async (name, pt)=>{ await ev(pt=>{ const p = G.player; FP.lookF = p.facing; FP.lookYaw = fpvYawNow(); FP.pitch = pt; }, pt); await wait(700); await ev(pt=>{ FP.lookYaw = fpvYawNow(); FP.pitch = pt; }, pt); await wait(100); await page.screenshot({ path:SHOTS + '/zceil-' + name + '.jpg', type:'jpeg', quality:80 }); };
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; G.player.wildWarned = 1;
    if (G.gameMode!==3){ const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); } G.player.clock = DAY_LENGTH*0.4; });
  await wait(1200); await page.keyboard.press('o'); await wait(500);
  for (const k of (process.env.ZROOMS || 'tavern,smith,temple,bank').split(',')){
    await ev(k=>{ if (G.interior) exitInterior(); if (k==='tavern_up'){ enterInterior('tavern'); townBench('stairs'); } else if (k==='cellar'){ enterInterior('shop'); townBench('cellar'); } else enterInterior(k); setUi('playing'); const p = G.player; for (let d=4; d>0; d--) if (tileOpen(p.x, p.y-d)){ p.y -= d; break; } }, k); await wait(2200);
    await up(k, 0.75); }
  await ev(()=>{ if (G.interior) exitInterior(); setUi('playing'); }); await wait(800);
  await ev(()=>{ const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; }); await wait(2000);
  await up('dungeon', 0.75);
};
