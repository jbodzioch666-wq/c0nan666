// (art probe, not in ALL) the open land on a fixed world seed, at named kinds of place and hours, into shots/zow_<name>.png;
// ZOW_GPU=1 also prints the card's ms per frame at each. ZOW='[["name", "kind", clockFrac, "weather", dist], ...]'
module.exports = async page=>{
  const sets = process.env.ZOW ? JSON.parse(process.env.ZOW) : [['grass', 'grass', 0.5], ['forest', 'forest', 0.5], ['river', 'river', 0.5], ['coast', 'coast', 0.5], ['swamp', 'swamp', 0.5], ['volcano', 'volcano', 0.5], ['desert', 'desert', 0.5], ['tundra', 'tundra', 0.5], ['grass_dusk', 'grass', 0.78], ['forest_night', 'forest', 1.02]];
  const seed = +(process.env.ZSEED || 12345);
  if (process.env.ZOW_GPU) await page.evaluate(()=>{ window.__zowGpuWant = true; });
  await page.evaluate(async seed=>{ goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = true; G.gameMode = 0; weatherSync = ()=>{}; window.__zowGpu = !!window.__zowGpuWant;
    window.__findKind = kind=>{ if (kind[0]==='@') return kind.slice(1).split(',').map(Number);   /* ('@x,y': that tile) */ const W = OW_COLS, H = OW_ROWS, M = G.ow.map, best = []; const T = { grass:OW_GRASS, forest:OW_FOREST, swamp:OW_SWAMP, desert:OW_DESERT, tundra:OW_TUNDRA, river:OW_RIVER }[kind];
      if (kind==='volcano'){ const lm = owLandmark('volcano'); return lm ? [lm.x + 4, lm.y + 3] : [W/2|0, H/2|0]; }
      for (let x=24;x<W-24;x++) for (let y=24;y<H-24;y++){ const t = M[x][y]; let sc = 0;
        if (kind==='lake'){ if (t!==OW_WATER) continue; let l = 0; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = M[x+a][y+b]; if (u!==OW_WATER && u!==OW_RIVER) l++; } if (l < 3 || o3Hash(x, y, 430) > 0.6) continue; let g = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++){ const u = M[x+i][y+j]; if (u===OW_GRASS || u===OW_FOREST) g++; } sc = g; }
        else if (kind==='coast'){ if (t!==OW_GRASS) continue; let w = 0, g = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++){ const u = M[x+i][y+j]; if (u===OW_WATER) w++; else if (u===OW_GRASS || u===OW_FOREST) g++; } if (w < 10 || g < 20) continue; sc = Math.min(w, g); }
        else if (kind==='falls'){ if (t!==OW_RIVER) continue; let ok = false; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = M[x+a][y+b], o = M[x-a][y-b]; if ((u===OW_MOUNTAIN || u===OW_MOUNTAINPASS) && (o===OW_RIVER || o===OW_WATER)) ok = true; } if (!ok) continue; let mt = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (M[x+i][y+j]===OW_MOUNTAIN) mt++; sc = mt; }
        else if (kind==='river'){ if (t!==OW_RIVER) continue; let r = 0, g = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++){ const u = M[x+i][y+j]; if (u===OW_RIVER) r++; else if (u===OW_GRASS || u===OW_FOREST) g++; } if (r < 5 || g < 30) continue; sc = g; }
        else { if (t!==T || wgBioAt(x, y)) continue; let n = 0; for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++) if (M[x+i][y+j]===T) n++; if (n < 45) continue; sc = n + (wgRoadAt(x, y) ? 0 : 0); }
        best.push([sc, x, y]); }
      best.sort((a, b)=>b[0] - a[0]); return best.length ? [best[0][1], best[0][2]] : [W/2|0, H/2|0]; }; }, seed);
  for (const [nm, kind, clk, wx, dist] of sets){
    const r = await page.evaluate(async ([kind, clk, wx, dist])=>{ const [x, y] = __findKind(kind); G.owPos = { x, y }; G.player.clock = G.player.turnCount = Math.round(DAY_LENGTH*(clk==null ? 0.5 : clk)); G.weather = wx || 'clear'; O3.win = null; O3.ppos = null; if (dist) O3.dist = dist;
      for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
      let gpu = null; if (window.__zowGpu){ SET.fps = true; window.profText = ()=>''; PROF.t = {}; PROF.gpuN = 0; for (let i=0;i<90;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } gfxGpuPoll(); const n = PROF.gpuN || 1; gpu = { gpu:+((PROF.t.gpu||0)/n).toFixed(2), sh:+((PROF.t.g_shadow||0)/n).toFixed(2), sc:+((PROF.t.g_scene||0)/n).toFixed(2), post:+((PROF.t.g_post||0)/n).toFixed(2), n }; }
      return { at:[x, y], tile:G.ow.map[x][y], bio:wgBioAt(x, y), gpu }; }, [kind, clk, wx, dist]);
    console.log(nm, JSON.stringify(r));
    await page.screenshot({ path: SHOTS + '/zow_' + nm + '.png', timeout:120000 });
  }
};
