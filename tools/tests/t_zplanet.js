// (probe, not in ALL) Planet worlds: generation time, land and terrain shares, plates, and each one's preview saved as shots/zplanet-<seed>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const seeds = (process.env.ZSEEDS||'777,1947342953,2659250257').split(',').map(Number);
  await page.evaluate(n=>{ window.__ZNOLAT = n; goToCharCreate(); ccBegin(); }, !!process.env.ZNOLAT);
  for (const seed of seeds){
    const r = await page.evaluate(seed=>{ G.worldSizeTier = 'planet'; OW_COLS = 432; OW_ROWS = 216; recomputeWorldSizeConstants(); G.ow.townPositions = {}; G.ow.townFlavor = {}; G.ow.siteMoves = {};
      window.__planetDbg = []; window.__noLat = !!window.__ZNOLAT; const t0 = performance.now(); wgRegenerate(seed); const D = window.__planetDbg; window.__planetDbg = null; const q = (i, f)=>{ const a = D.filter(f||(()=>1)).map(v=>v[i]).sort((a, b)=>a - b); return [0.1, 0.5, 0.9].map(k=>+(a[Math.floor(a.length*k)]||0).toFixed(2)); }; const ms = performance.now() - t0; setUi('worldPreview'); renderWorldPreviewMap();
      const c = {}; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const t = G.ow.map[x][y]; c[t] = (c[t]||0) + 1; } const N = OW_COLS*OW_ROWS, pc = k=>+(100*(c[k]||0)/N).toFixed(1);
      const cv = document.getElementById('worldPreviewCanvas');
      return { seed, ms:+ms.toFixed(0), planet:owIsPlanet(), plates:G.ow.plates, size:OW_COLS + 'x' + OW_ROWS, water:pc(OW_WATER), mtn:pc(OW_MOUNTAIN), desert:pc(OW_DESERT), tundra:pc(OW_TUNDRA), forest:pc(OW_FOREST), swamp:pc(OW_SWAMP), grass:pc(OW_GRASS), river:pc(OW_RIVER), towns:skTowns().length, T:q(0), M:q(1), E:q(2), T30:q(0, v=>Math.abs(v[3]-0.33)<0.06), M30:q(1, v=>Math.abs(v[3]-0.33)<0.06), Teq:q(0, v=>v[3]<0.1), Meq:q(1, v=>v[3]<0.1), img:cv.toDataURL() }; }, seed);
    require('fs').writeFileSync(require('path').join(SHOTS, 'zplanet-' + seed + '.png'), Buffer.from(r.img.split(',')[1], 'base64')); delete r.img; console.log(JSON.stringify(r)); }
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
