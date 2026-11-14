// (art probe, not in ALL) the jungle on the land: the jungle tile (BIO 2) nearest the start, or ZBIOV's, from two zooms and two turns.
// ZBIOV=-1 stands by the first Lost City instead (RS-756). ZSEED for the world. Shots: shots/zjungle_<zoom>_<rot>.png
module.exports = async page=>{ page.setDefaultTimeout(0);
  const at = await page.evaluate(async ([seed, bv])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    let best = null, bd = 1e9, n = 0; const m = G.ow.map;
    for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (wgBioAt(x, y)!==bv) continue; n++; let all = true; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (wgBioAt(x+i, y+j)!==bv || !OW_LAND_KEY[m[x+i][y+j]]) all = false; if (!all) continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = { x, y }; } }
    if (+bv < 0){ best = null; for (let x=0;x<OW_COLS && !best;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && !owSeaSite(x, y)){ const q = owNbG(x, y, 0, 2); best = { x:q[0], y:q[1] }; break; } }   /* ZBIOV=-1: by the Lost City (RS-756) */
    if (!best) return { n };
    G.gameMode = 0; setUi("playing"); G.owPos = best; owReveal(best.x, best.y, 10); O3.win = null; await fr(150); return { n, at:best, t:m[best.x][best.y], gen:G.ow.genVer }; }, [+(process.env.ZSEED || 12345), +(process.env.ZBIOV || 2)]);
  console.log(JSON.stringify(at));
  if (!at.at) return;
  for (const [z, r] of [[7, 0], [14, 0], [7, 2]]){ await page.evaluate(([z, r])=>{ O3.dist = z; ISO.rot = r; }, [z, r]); await page.waitForTimeout(1800); await page.screenshot({ path: SHOTS + '/zjungle_' + z + '_' + r + '.png' }); }
};
