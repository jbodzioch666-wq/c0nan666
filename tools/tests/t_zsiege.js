// (art probe, not in ALL) a siege at the spawn town: the field before its gate, then the streets; shots/zsiege_field.png, zsiege_streets.png.
// ZRAID=1 starts a raid instead (straight into the streets)
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const step = async (n)=>{ for (let i=0;i<(n||6);i++){ await page.evaluate(()=>renderGame()); await page.waitForTimeout(40); } };
  const raid = !!process.env.ZRAID;
  const r = await page.evaluate(async ([raid, city])=>{ window.__zcity = city; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player; p.hp = p.maxHp = 99999; G.player.clock = Math.round(DAY_LENGTH*0.45);
    let t = G.ow.spawnPos; if (window.__zcity){ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN){ G.owPos = { x, y }; try{ if (townInfo().style.walled){ t = { x, y }; x = OW_COLS; break; } }catch(e){} } } const key = t.x+','+t.y, e = wevP(); e.dyn = e.dyn.filter(d=>d.kind!=='siege');
    G.gameMode = 0; G.owPos = { x:t.x, y:t.y };
    if (raid){ const d = { id:++e.seq, kind:'raid', key, x:t.x, y:t.y, camp:'goblin' }; siegeRaidStart(d); }
    else { const d = { id:++e.seq, kind:'siege', key, x:t.x, y:t.y, camp:'orc', until:wevTurn() + DAY_LENGTH }; e.dyn.push(d); wevSiegeFight(d); }
    return { mode:G.gameMode, theme:G.arenaTheme, cols:COLS, rows:ROWS, at:[t.x, t.y], walled:G.townLy && G.townLy.info.style.walled }; }, [raid, !!process.env.ZCITY]);
  console.log('siege', JSON.stringify(r));
  await step(30); await page.screenshot({ path: SHOTS + '/zsiege_' + (process.env.ZCITY ? 'city_' : '') + (raid ? 'raid' : 'field') + '.png' });
  if (!raid){ await page.evaluate(()=>{ siegeWarStreets(G.siegeWar); }); await step(30); await page.screenshot({ path: SHOTS + '/zsiege_streets.png' });
    const sq = await page.evaluate(()=>{ const at = siegeNear(tX(10), tY(12), 4); if (at){ G.player.x = at[0]; G.player.y = at[1]; } return at; }); console.log('square', JSON.stringify(sq)); await step(40); await page.screenshot({ path: SHOTS + '/zsiege_square.png' }); }
};
