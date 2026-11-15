// (probe, not in ALL; RS-769) a river beside you by day and by night: shots/zriver_day.png, zriver_night.png (ZSEED, default 12345)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async seed=>{ goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.weather = 'clear';
    const m = G.ow.map, p = G.owPos; let best = null, bd = 1e9;
    for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (m[x][y]!==OW_RIVER) continue; let n = 0; for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++) if (m[x+a][y+b]===OW_RIVER) n++; if (n < 7) continue; const d = Math.hypot(x - p.x, y - p.y); if (d < bd){ bd = d; best = { x, y }; } }
    let st = null; for (const [a, b] of DIR8){ const t = m[best.x + a*2] && m[best.x + a*2][best.y + b*2]; if (t===OW_GRASS || t===OW_FOREST){ st = { x:best.x + a*2, y:best.y + b*2 }; break; } }
    G.owPos = st || { x:best.x + 2, y:best.y }; owReveal(G.owPos.x, G.owPos.y, 8); return { best, at:G.owPos }; }, +(process.env.ZSEED || 12345));
  console.log(JSON.stringify(r));
  for (const [nm, h] of [['day', 0.45], ['night', 0.85]]){
    await page.evaluate(async h=>{ G.player.clock = DAY_LENGTH*h; for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, h);
    await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/zriver_' + nm + '.png' }); }
  if (errs.length) console.log('errors: ' + errs.join(' | '));
};
