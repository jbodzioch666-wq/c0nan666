// World layout across the sizes (RS-640): for each world size, a few seeds of the game's own generator - how much land, how many towns
// and sites, how far any land is from a town (steps, walking round water and mountains, over a planet's face edges), how far each town
// is from the next, and how far the start is from its nearest dungeons. For comparing a Planet's spacing with the other sizes.
//   node tools/sim/run.js world            (ZSEEDS=1,2,3 and ZTIERS=medium,planet to choose)
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const tiers = (process.env.ZTIERS || 'medium,large,xlarge,planet').split(','), seeds = (process.env.ZSEEDS || '777,424242,31337').split(',').map(Number);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); });
  const rows = [];
  for (const tier of tiers) for (const seed of seeds){
    const r = await page.evaluate(([tier, seed])=>{
      setWorldSizeTier(tier); const t0 = performance.now(); wgRegenerate(seed); const ms = performance.now() - t0;
      const W = OW_COLS, H = OW_ROWS, M = G.ow.map, cube = owCube(), face = (x, y)=>!cube || cubeFace(x, y) >= 0;
      const walk = t=>t!==OW_WATER && t!==OW_MOUNTAIN, towns = [], sites = []; let land = 0;
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (!face(x, y)) continue; const t = M[x][y]; if (t!==OW_WATER) land++; if (t===OW_TOWN) towns.push([x, y]); else if (OW_SITE_TILES.includes(t)) sites.push([x, y]); }
      const bfs = (src, stopAt)=>{ const d = new Int32Array(W*H).fill(-1), q = []; for (const [x, y] of src){ d[y*W + x] = 0; q.push(y*W + x); }
        for (let h=0; h<q.length; h++){ const j = q[h], x = j % W, y = (j/W)|0; if (stopAt && stopAt(x, y, d[j])) return { d, hit:[x, y, d[j]] };
          for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nb = owNb(x, y, dx, dy); if (!nb) continue; const k = nb[1]*W + nb[0]; if (d[k] >= 0 || !walk(M[nb[0]][nb[1]])) continue; d[k] = d[j] + 1; q.push(k); } }
        return { d }; };
      /* how far any land is from a town */
      const { d } = bfs(towns), ds = []; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const v = d[y*W + x]; if (v >= 0 && face(x, y)) ds.push(v); } ds.sort((a, b)=>a - b);
      const q = p=>ds.length ? ds[Math.floor(ds.length*p)] : -1;
      /* how far each town is from the next (on foot; -1 when it's on another landmass) */
      const tt = towns.map(([x, y])=>{ const r = bfs([[x, y]], (u, v, dd)=>dd > 0 && M[u][v]===OW_TOWN); return r.hit ? r.hit[2] : -1; }).filter(v=>v >= 0).sort((a, b)=>a - b);
      /* the start's nearest dungeons */
      const sp = G.ow.spawnPos, ds2 = []; { const r = bfs([[sp.x, sp.y]]); for (const [x, y] of sites) if (M[x][y]===OW_DUNGEON){ const v = r.d[y*W + x]; if (v >= 0) ds2.push(v); } } ds2.sort((a, b)=>a - b);
      return { tier, seed, ms:Math.round(ms), size:W + 'x' + H, land, towns:towns.length, sites:sites.length, landPerTown:Math.round(land/Math.max(1, towns.length)), landPerSite:Math.round(land/Math.max(1, sites.length)),
        toTown:{ med:q(0.5), p90:q(0.9), max:ds.length ? ds[ds.length - 1] : -1, reach:+(ds.length/Math.max(1, land)).toFixed(2) }, townGap:{ med:tt.length ? tt[tt.length >> 1] : -1, n:tt.length },
        dungeons3:ds2.slice(0, 3), encounters:(G.ow.encounters||[]).length,
        /* (RS-686) sites crowded together: how many have another site or town within 4 tiles, and the most sites (not towns) within 8 of one */
        crowd:(()=>{ const all = sites.concat(towns); let near4 = 0, pack = 0; for (const [x, y] of sites){ if (all.some(([a, b])=>(a!==x || b!==y) && Math.hypot(a - x, b - y) < 4)) near4++; pack = Math.max(pack, sites.filter(([a, b])=>Math.hypot(a - x, b - y) <= 8).length); } const kinds = {}, gy = sites.filter(([x, y])=>M[x][y]===OW_GRAVEYARD); for (const [x, y] of sites){ const k = TILE_SITE_KIND[M[x][y]] || M[x][y]; kinds[k] = (kinds[k]||0) + 1; } let gpack = 0; for (const [x, y] of gy) gpack = Math.max(gpack, gy.filter(([a, b])=>Math.hypot(a - x, b - y) <= 12).length); return { near4, pack, gpack, kinds }; })() };
    }, [tier, seed]);
    rows.push(r); console.log(JSON.stringify(r));
  }
  /* the averages per size */
  const avg = (rs, f)=>+(rs.reduce((a, r)=>a + f(r), 0)/rs.length).toFixed(1);
  for (const tier of tiers){ const rs = rows.filter(r=>r.tier===tier);
    console.log(`${tier.padEnd(7)} land ${avg(rs, r=>r.land)}  towns ${avg(rs, r=>r.towns)}  land/town ${avg(rs, r=>r.landPerTown)}  land/site ${avg(rs, r=>r.landPerSite)}  to a town: median ${avg(rs, r=>r.toTown.med)} p90 ${avg(rs, r=>r.toTown.p90)}  reachable ${avg(rs, r=>r.toTown.reach)}  town gap ${avg(rs, r=>r.townGap.med)}  start to 3rd dungeon ${avg(rs, r=>r.dungeons3[2]||0)}  roamers ${avg(rs, r=>r.encounters)}  sites by another within 4 ${avg(rs, r=>r.crowd.near4)}  most within 8 ${avg(rs, r=>r.crowd.pack)}  graveyards ${avg(rs, r=>r.crowd.kinds.graveyard||0)} (most within 12 of one ${avg(rs, r=>r.crowd.gpack)})`); }
};
