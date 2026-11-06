// (probe, not in ALL) generator 13's sea cliffs: how many per world, and one close up (ZSEED). Shot: shots/zcliff.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async seed=>{ goToCharCreate(); ccBegin(); const counts = [];
    for (const s of [3393459147, 1947342953, 2659250257, 777, 99]){ wgRegenerate(s); counts.push([s, G.ow.cliffN]); }
    wgRegenerate(seed); confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    const W = OW_COLS; let best = null, bd = 1e9; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++) if (owCliffAt(x, y)){ const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = { x, y }; } }
    if (!best) return { counts, none:true };
    let st = null; for (let r=1;r<4 && !st;r++) for (let dx=-r;dx<=r && !st;dx++) for (let dy=-r;dy<=r;dy++){ const x = best.x + dx, y = best.y + dy; if (o3Passable && o3Passable(x, y) && !owCliffAt(x, y) && G.ow.map[x][y]!==OW_WATER){ st = { x, y }; break; } }
    G.owPos = st || best; O3.win = null; for (let i=0;i<400;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    return { counts, at:best, stand:G.owPos, h:+O3.heightAt(best.x + 0.5, best.y + 0.5).toFixed(2) }; }, +(process.env.ZSEED || 1947342953));
  await page.waitForTimeout(900); await page.screenshot({ path: SHOTS + '/zcliff.png' });
  for (const rot of [1, 2, 3]){ await page.evaluate(async rot=>{ ISO.rot = rot; if (G.player) G.player.viewRot = rot; for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, rot); await page.screenshot({ path: SHOTS + '/zcliff' + rot + '.png' }); }
  console.log(JSON.stringify(r));
};
