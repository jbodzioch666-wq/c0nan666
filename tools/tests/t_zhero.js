// (probe, not in ALL) your figure in the spawn town's square close up, sculpted on a given grid (ZPC, default 1): shots/zhero_<ZPC>.png
// and its triangle count
module.exports = async page=>{
  const pc = +(process.env.ZPC || 1);
  const r = await page.evaluate(async pc=>{ M3D_PLAYER_COARSE = pc; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); G.player.x = tX(10); G.player.y = tY(12); G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*0.45);
    for (let i=0;i<70;i++){ if (i===10){ setUi('playing'); const lc = document.getElementById('loadCard'); if (lc) lc.classList.remove('show'); } renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    let tr = 0; const P = V3.player && (V3.player.g || V3.player.holder || V3.player); if (P && P.traverse) P.traverse(o=>{ if (o.isMesh && o.geometry){ const g = o.geometry; tr += (g.index ? g.index.count : g.attributes.position.count)/3; } });
    return { pc, tris:Math.round(tr) }; }, pc);
  console.log('hero', JSON.stringify(r));
  await page.screenshot({ path: SHOTS + '/zhero_' + pc + '.png', clip:{ x:500, y:250, width:400, height:400 } });
};
