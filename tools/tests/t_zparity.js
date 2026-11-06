// (probe, not in ALL) the same views on the fixed seed, for comparing two builds (e.g. three.js versions): the land at three spots, the
// spawn town's square, and a dungeon floor; shots/zpar_<view>_<ZTAG>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const tag = process.env.ZTAG || 'x';
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{}; G.weather = 'clear'; saveCurrentGame = ()=>{}; Math.random = (()=>{ let s = 99; return ()=>((s = (s*16807) % 2147483647) - 1)/2147483646; })(); });
  const shot = async (nm, setup, n)=>{ await page.evaluate(async ([setup, n])=>{ eval(setup); for (let i=0;i<(n||16);i++){ if (i===10){ setUi('playing'); const lc = document.getElementById('loadCard'); if (lc) lc.classList.remove('show'); } renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, [setup, n]); await page.screenshot({ path: SHOTS + '/zpar_' + nm + '_' + tag + '.png' }); };
  await shot('land1', `G.owPos = { x:98, y:116 }; G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*0.45); O3.win = null; O3.ppos = null;`);
  await shot('land2', `G.owPos = { x:126, y:47 }; O3.win = null; O3.ppos = null;`);
  await shot('dusk', `G.owPos = { x:23, y:55 }; G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*0.78); O3.win = null; O3.ppos = null;`);
  await shot('town', `G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*0.45); const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.x = tX(10); G.player.y = tY(12);`, 70);
  await shot('dungeon', `G.gameMode = 0; let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; } G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');`, 70);
};
