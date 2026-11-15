// (probe, not in ALL) towns alone on their landmass, and whether a ferry reaches it (and how far its pier lands from the town)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); const out = [];
    for (const seed of [3393459147, 1947342953, 2659250257, 638757889, 3058033519, 777, 424242, 99]){ wgRegenerate(seed); const W = OW_COLS, comp = G.ow.comp, towns = Object.values(G.ow.townPositions).filter(Boolean);
      const per = {}; for (const t of towns){ const c = comp[t.y*W + t.x]; per[c] = (per[c]||0) + 1; }
      const lone = towns.filter(t=>per[comp[t.y*W + t.x]]===1).map(t=>{ const c = comp[t.y*W + t.x], f = (G.ow.ferries||[]).filter(f=>comp[f.a[1]*W + f.a[0]]===c || comp[f.b[1]*W + f.b[0]]===c); const pier = f.map(f=>comp[f.a[1]*W + f.a[0]]===c ? f.a : f.b);
        return { at:[t.x, t.y], ferries:f.length, pierDist:pier.map(p=>Math.round(Math.hypot(p[0]-t.x, p[1]-t.y))) }; });
      out.push({ seed, towns:towns.length, ferries:(G.ow.ferries||[]).length, lone }); }
    return out; });
  for (const w of r) console.log(JSON.stringify(w));
};
