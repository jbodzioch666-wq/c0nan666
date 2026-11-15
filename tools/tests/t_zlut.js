// probe (RS-670): a Planet's frame lookups, every face: does each stored tile land on its own frame tile and come back (o3L then o3G),
// and does any pair of stored tiles land on one frame tile (the later one overwriting the first in the lookup)? Lists the clashes
// with their corner distance. No land is built.
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    const W = OW_COLS, H = OW_ROWS, m = G.ow.map, out = { size:W + 'x' + H, N:cubeN(), faces:[] }, f0 = O3F.face;
    for (let X=0;X<6;X++){ o3FrameSet(X); const L = o3FrameLut(X), seen = new Map(); let bad = 0, clash = 0, landBad = 0; const ex = [];
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (cubeFace(x, y) < 0) continue; const li = L.g2l[y*W + x]; if (li < 0){ bad++; continue; }
        if (seen.has(li)){ clash++; const o = seen.get(li); if (m[x][y]!==OW_WATER || m[o[0]][o[1]]!==OW_WATER) landBad++; if (ex.length < 8) ex.push({ a:o, b:[x, y], li:[li % W, (li/W)|0], cd:+cubeCornerDist(x, y).toFixed(2), ta:m[o[0]][o[1]], tb:m[x][y] }); } else seen.set(li, [x, y]);
        const g = o3G(li % W, (li/W)|0); if (!g || g[0]!==x || g[1]!==y){ /* (the lookup's own back-mapping disagrees) */ } }
      let back = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (cubeFace(x, y) < 0) continue; const l = o3L(x, y); if (!l){ back++; continue; } const g = o3G(l[0], l[1]); if (!g || g[0]!==x || g[1]!==y) back++; }
      out.faces.push({ X, unmapped:bad, clash, landClash:landBad, roundTripBad:back, ex }); }
    o3FrameSet(f0); return out; });
  console.log(JSON.stringify(r)); };
