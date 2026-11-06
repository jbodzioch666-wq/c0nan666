// (probe, not in ALL; RS-758) where the Lost Cities stand, over ZN worlds (default 12): the tile's land and jungle round it
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(async n=>{ goToCharCreate(); ccBegin(); const out = [];
    for (let sd=1; sd<=n; sd++){ wgRegenerate(sd*7919); const m = G.ow.map;
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (m[x][y]!==OW_TEMPLE || owSeaSite(x, y)) continue; let j = 0, l = 0, k = {}; for (let dx=-2;dx<=2;dx++) for (let dy=-2;dy<=2;dy++){ const q = owNbG(x, y, dx, dy); if (!q) continue; const t = m[q[0]][q[1]]; if (!OW_LAND_KEY[t]) continue; l++; k[OW_LAND_KEY[t]] = (k[OW_LAND_KEY[t]]||0) + 1; if (wgBioAt(q[0], q[1])===2) j++; }
        out.push({ sd, y, H:OW_ROWS, jung:+(j/l).toFixed(2), land:k }); } }
    return out; }, +(process.env.ZN || 12));
  for (const o of r) console.log(JSON.stringify(o));
  console.log('in jungle: ' + r.filter(o=>o.jung >= 0.7).length + ' of ' + r.length);
};
