// RS-621: world generator 12 - roads along the valleys and the low ground, round the hills (they ran straight over them); a ferry to an
// island lands near the town it serves; and a signpost where three roads or more meet, with an arm down each
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { ver:OW_GEN_VER, w:[] };
    let eg = null; const og = wgGenerate; window.wgGenerate = function(seed, elev){ eg = elev; return og.apply(this, arguments); };
    for (const seed of [1947342953, 2659250257, 777, 99]){ const row = { seed };
      for (const v of [11, 12]){ G.ow.genVer = v; wgRegenerate(seed); const W = OW_COLS; let n = 0, se = 0; for (let i=0;i<W*OW_ROWS;i++) if (G.ow.road[i]){ n++; se += eg[i % W][(i/W)|0]; }
        const comp = G.ow.comp, towns = Object.values(G.ow.townPositions).filter(Boolean), per = {}; for (const t of towns){ const c = comp[t.y*W + t.x]; per[c] = (per[c]||0) + 1; }
        const pier = []; for (const t of towns){ const c = comp[t.y*W + t.x]; if (per[c]!==1) continue; for (const f of G.ow.ferries||[]) for (const p of [f.a, f.b]) if (comp[p[1]*W + p[0]]===c) pier.push(Math.hypot(p[0] - t.x, p[1] - t.y)); }
        row['e' + v] = se/n; row['p' + v] = pier.length ? pier.reduce((a, b)=>a + b, 0)/pier.length : 0; }
      out.w.push(row); }
    window.wgGenerate = og; G.ow.genVer = OW_GEN_VER; wgRegenerate(1947342953);
    /* the signposts, out on the land */
    confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; for (let i=0;i<400 && !O3.rmask;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const W = OW_COLS, rd = G.ow.road; let best = null, bd = 1e9; for (let x=2;x<W-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (!rd[y*W + x] || G.ow.map[x][y]===OW_TOWN) continue; let k = 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (rd[(y+dy)*W + x + dx]) k++; if (k >= 3){ const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = { x, y }; } } }
    if (best){ G.owPos = { x:best.x, y:best.y }; O3.win = null; O3.signposts = 0; for (let i=0;i<400 && !O3.signposts;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }
    out.posts = O3.signposts || 0; out.junction = !!best; out.at = best; out.win = O3.win && [O3.win.x0, O3.win.y0];
    { const m = O3.rmask, ends = new Map(); if (m) for (const c of m.chains){ if (c.p.length < 3) continue; for (const p of [c.p[0], c.p[c.p.length - 1]]){ const k = Math.round(p[0]*2) + ',' + Math.round(p[1]*2); ends.set(k, (ends.get(k)||0) + 1 + (c.lane ? 100 : 0)); } }
      out.ends = [...ends.entries()].filter(e=>e[1] >= 2).slice(0, 12); out.chains = m ? m.chains.length : -1; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const avg = k=>r.w.reduce((s, w)=>s + w[k], 0)/r.w.length;
  A(r.ver===12, 'new worlds are made by generator 12');
  A(avg('e12') < avg('e11') - 0.02 && r.w.every(w=>w.e12 <= w.e11 + 0.005), 'the roads keep to lower ground: ' + avg('e11').toFixed(3) + ' -> ' + avg('e12').toFixed(3));
  A(avg('p12') < avg('p11'), 'an island ferry lands nearer its town: ' + avg('p11').toFixed(1) + ' -> ' + avg('p12').toFixed(1));
  A(!r.junction || r.posts > 0, 'a signpost where the roads meet');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
