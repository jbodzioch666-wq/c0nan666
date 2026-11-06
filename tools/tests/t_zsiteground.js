// (probe, not in ALL; RS-766) where the terrain-bound sites land: pyramids (desert? in a rarer biome? desert round them), mines (a
// mountain beside, open land across), dragon lairs (mountain neighbours). ZSIZES (default small,medium,large,planet), ZN seeds each
module.exports = async page=>{ page.setDefaultTimeout(0);
  const sizes = (process.env.ZSIZES || 'small,medium,large,planet').split(','), N = +(process.env.ZN || 4);
  const r = await page.evaluate(async ([sizes, N])=>{ goToCharCreate(); ccBegin(); const out = {};
    for (const sz of sizes){ const o = out[sz] = { pyr:[], mine:[], lair:[], desertTiles:0, desertFree:0 };
      for (let k=0;k<N;k++){ setWorldSizeTier(sz); wgRegenerate(1000 + k*7919); if (G.ui==='worldPreview') confirmWorldPreview();
        const m = G.ow.map; let dt = 0, df = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_DESERT){ dt++; if (!wgBioAt(x, y)) df++; }
        o.desertTiles += dt; o.desertFree += df;
        for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const t = m[x][y]; if (t!==OW_PYRAMID && t!==OW_MINE && t!==OW_LAIR) continue;
          let des = 0, mtn = 0, n = 0, orth = 0, side = false;
          for (const [dx, dy] of DIR8){ const q = owNbG(x, y, dx, dy); if (!q) continue; const u = m[q[0]][q[1]]; n++; if (u===OW_DESERT) des++; if (u===OW_MOUNTAIN) mtn++; }
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a = owNbG(x, y, dx, dy), b = owNbG(x, y, -dx, -dy); if (a && m[a[0]][a[1]]===OW_MOUNTAIN){ orth++; if (b && ![OW_WATER, OW_MOUNTAIN, OW_RIVER].includes(m[b[0]][b[1]])) side = true; } }
          let m2 = 0; for (let dx=-2;dx<=2;dx++) for (let dy=-2;dy<=2;dy++){ const q = owNbG(x, y, dx, dy); if (q && m[q[0]][q[1]]===OW_MOUNTAIN) m2++; }
          const rec = { seed:k, x, y, bio:BIO[wgBioAt(x, y)]?.id || '', des, mtn, orth, side, m2, land:owBiomeOf(x, y) };
          (t===OW_PYRAMID ? o.pyr : t===OW_MINE ? o.mine : o.lair).push(rec); } } }
    return out; }, [sizes, N]);
  for (const [sz, o] of Object.entries(r)){
    const p = o.pyr, mi = o.mine, l = o.lair;
    console.log(`== ${sz}: desert tiles ${o.desertTiles} (${o.desertFree} outside a rarer biome)`);
    console.log(`  pyramids ${p.length}: in desert-ish land (owBiomeOf desert) ${p.filter(q=>q.land==='desert').length}, in a rarer biome ${p.filter(q=>q.bio).length} [${p.filter(q=>q.bio).map(q=>q.bio).join(',')}], desert neighbours avg ${(p.reduce((s, q)=>s + q.des, 0)/Math.max(1, p.length)).toFixed(1)}, none ${p.filter(q=>!q.des).length}`);
    console.log(`  mines ${mi.length}: a mountain beside with land across ${mi.filter(q=>q.side).length}, no mountain within 1 ${mi.filter(q=>!q.mtn).length}, within 2 ${mi.filter(q=>!q.m2).length}`);
    console.log(`  lairs ${l.length}: mountain neighbours (of 8) ${l.map(q=>q.mtn).join(',')}, within 2 (of 24) ${l.map(q=>q.m2).join(',')}`);
  }
};
