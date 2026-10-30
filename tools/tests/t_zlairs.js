// (probe, not in ALL) RS-733: where the dragon lairs go over sizes and seeds, generator 24 against 25 - each lair's depth in its
// range (8 ways, the lair counted as mountain), its range's size, and its pass's length
module.exports = async page=>{ page.setDefaultTimeout(0);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); });
  const tiers = (process.env.ZTIERS || 'small,medium,large,xlarge,planet').split(','), seeds = (process.env.ZSEEDS || '777,424242,31337').split(',').map(Number);
  for (const tier of tiers) for (const gv of [24, 25]){ const rows = [];
    for (const seed of seeds){ const r = await page.evaluate(([tier, seed, gv])=>{ setWorldSizeTier(tier); G.ow.genVer = gv; wgRegenerate(seed);
        const W = OW_COLS, H = OW_ROWS, M = G.ow.map, isM = (x,y)=>{ const t = M[x] && M[x][y]; return t===OW_MOUNTAIN || t===OW_LAIR || t===OW_MOUNTAINPASS; }, out = [];
        for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (M[x][y]!==OW_LAIR) continue;
          let d = 4; for (let r=1;r<=3 && d===4;r++) for (let i=-r;i<=r && d===4;i++) for (let j=-r;j<=r;j++){ if (Math.max(Math.abs(i),Math.abs(j))!==r) continue; const nb = owNbG(x, y, i, j), t = nb && M[nb[0]][nb[1]]; if (t!==OW_MOUNTAIN && t!==OW_LAIR){ d = r; break; } }
          const seen = new Set([x*H+y]), st = [[x,y]]; let n = 0, pass = 0; while (st.length && n < 5000){ const [cx, cy] = st.pop(); n++; if (M[cx][cy]===OW_MOUNTAINPASS) pass++;
            for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nb = owNbG(cx, cy, dx, dy); if (!nb || !isM(nb[0], nb[1])) continue; const k = nb[0]*H + nb[1]; if (seen.has(k)) continue; seen.add(k); st.push(nb); } }
          out.push({ d, range:n, pass }); }
        return out; }, [tier, seed, gv]); rows.push(...r); }
    const avg = k=>(rows.reduce((a, r)=>a + r[k], 0)/Math.max(1, rows.length)).toFixed(1);
    console.log(`${tier} gen${gv}: ${rows.length} lairs, depth ${rows.map(r=>r.d).join('')} (avg ${avg('d')}), range avg ${avg('range')} min ${Math.min(...rows.map(r=>r.range))}, pass avg ${avg('pass')} max ${Math.max(...rows.map(r=>r.pass))}`); }
};
