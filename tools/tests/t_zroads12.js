// (probe, not in ALL) the same worlds under generators 11 and 12: how high and how steep the roads run, how long they are, and how far an
// island's ferry pier lands from its town
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); const out = [];
    let elevGrab = null; const og = wgGenerate; window.wgGenerate = function(seed, elev){ elevGrab = elev; return og.apply(this, arguments); };
    for (const seed of [3393459147, 1947342953, 2659250257, 638757889, 777, 99]) for (const v of [11, 12]){ G.ow.genVer = v; wgRegenerate(seed); const W = OW_COLS, H = OW_ROWS, e = elevGrab;
      let n = 0, se = 0, ss = 0; for (let i=0;i<W*H;i++){ if (!G.ow.road[i]) continue; const x = i % W, y = (i/W)|0; n++; se += e[x][y]; let sl = 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = x + dx, w = y + dy; if (u>=0 && w>=0 && u<W && w<H) sl = Math.max(sl, Math.abs(e[u][w] - e[x][y])); } ss += sl; }
      const comp = G.ow.comp, towns = Object.values(G.ow.townPositions).filter(Boolean), per = {}; for (const t of towns){ const c = comp[t.y*W + t.x]; per[c] = (per[c]||0) + 1; }
      let pier = []; for (const t of towns){ const c = comp[t.y*W + t.x]; if (per[c]!==1) continue; for (const f of G.ow.ferries||[]){ for (const p of [f.a, f.b]) if (comp[p[1]*W + p[0]]===c) pier.push(Math.hypot(p[0] - t.x, p[1] - t.y)); } }
      out.push({ seed, v, roadTiles:n, elev:+(se/n).toFixed(3), slope:+(ss/n).toFixed(4), pierAvg:pier.length ? +(pier.reduce((a, b)=>a + b, 0)/pier.length).toFixed(1) : null, pierMax:pier.length ? Math.round(Math.max(...pier)) : null }); }
    window.wgGenerate = og; G.ow.genVer = OW_GEN_VER; return out; });
  for (const w of r) console.log(JSON.stringify(w));
};
