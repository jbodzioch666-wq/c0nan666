// (probe, not in ALL) a road junction on the open land, with its signpost, close up. Shot: shots/zsign.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    for (let i=0;i<300 && !O3.rmask;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    /* a junction: a road tile with three road neighbours */
    const W = OW_COLS, rd = G.ow.road; let best = null, bd = 1e9; for (let x=2;x<W-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (!rd[y*W + x] || G.ow.map[x][y]===OW_TOWN) continue; let n = 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (rd[(y+dy)*W + x + dx]) n++; if (n < 3) continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = { x, y }; } }
    if (!best) return { none:true }; G.owPos = { x:best.x + 1, y:best.y + 1 }; O3.win = null; for (let i=0;i<400;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    let posts = 0; (O3.world||O3.scene).traverse(o=>{ if (o.isInstancedMesh && o.material && /rpost/.test(o.material.name || o.material.userData.wgKey || '')) posts += o.count; });
    return { at:best, posts }; });
  await page.waitForTimeout(800); await page.screenshot({ path: SHOTS + '/zsign.png' });
  console.log(JSON.stringify(r));
};
