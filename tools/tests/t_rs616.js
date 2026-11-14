// RS-616: on a phone the roads are painted into the ground as on a computer (worn paths and old roads, smooth curves) - they were the
// old strips stepping from tile to tile; the rest of the painted ground stays off there. And the frame it takes. Shot: shots/rs616-phone.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    G.gameMode = 0; G.interior = null;
    /* stand on a road */
    let best = null, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (wgRoadAt(x, y)){ const d = Math.abs(x - G.owPos.x) + Math.abs(y - G.owPos.y); if (d < bd && d > 2){ bd = d; best = { x, y }; } }
    if (best) G.owPos = best;
    for (let i=0;i<400 && !(O3.rmask && O3.land);i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    let ribbon = 0; if (O3.wgGrp) O3.wgGrp.traverse(o=>{ if (o.isMesh && o.geometry.attributes.rd) ribbon++; });
    const land = O3.land, key = land && land.material.customProgramCacheKey ? land.material.customProgramCacheKey() : '';
    const fr = []; let last = performance.now(); for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - last); last = t; } fr.sort((a, b)=>a - b);
    return { phone:gfxPhone(), paint:gfxPaintOn(), roads:gfxRoadPaintOn(), mask:!!O3.rmask, key, ribbon, onRoad:!!best, med:+fr[60].toFixed(1) }; });
  await page.screenshot({ path: SHOTS + '/rs616-phone.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.phone && !r.paint, 'on a phone, the painted ground otherwise off');
  A(r.roads && r.mask && /R/.test(r.key), 'the roads painted into the ground: ' + r.key);
  A(r.ribbon === 0, 'no old strips');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
module.exports.mobile = true;
