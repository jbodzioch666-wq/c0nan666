// probe (RS-651; RS-652: a barrow with a stair, unless ZB_ANY=1): the barrow from the four camera turns, close up, then the walk in. Shots: shots/zbarrow-r0..3.png, zbarrow-w*.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const at = await page.evaluate(async (process_pit)=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    for (const s of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0]]){ const q = owNb(s.x, s.y, dx, dy); if (!q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
      setUi('playing'); G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(120); moveDir(-dx, -dy); await fr(90); if (G.owPos.x===s.x && G.owPos.y===s.y){ const PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y); if (!process_pit || (g && g.userData.pit)){ setUi('playing'); return s; } break; } }
    return null; }, !process.env.ZB_ANY);
  if (!at) throw new Error('no barrow');
  const zoom = +(process.env.ZB_DIST || 7);
  for (let r = 0; r < 4; r++){
    await page.evaluate(([r, z])=>{ ISO.rot = r; O3.dist = z; }, [r, zoom]); await page.waitForTimeout(1600);
    await page.screenshot({ path: SHOTS + '/zbarrow-r' + r + '.png' });
  }
  await page.evaluate(([z])=>{ ISO.rot = 0; O3.dist = z; }, [zoom]); await page.waitForTimeout(1500);
  await page.evaluate(()=>{ G.pendingDungeonModifier = null; enterDungeonConfirm(); });
  for (const [i, ms] of [[0, 350], [1, 450], [2, 400], [3, 350]]){ await page.waitForTimeout(ms); await page.screenshot({ path: SHOTS + '/zbarrow-w' + i + '.png' }); }
};
