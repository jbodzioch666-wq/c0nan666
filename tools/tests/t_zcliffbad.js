// (probe, not in ALL) generator 13 cliff tiles that stand by a road, a pier, a site or a river - and what it is
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); wgRegenerate(1947342953); const W = OW_COLS, M = G.ow.map, out = [];
    const piers = (G.ow.ferries||[]).flatMap(f=>[f.a, f.b]);
    for (let x=1;x<W-1;x++) for (let y=1;y<OW_ROWS-1;y++){ if (!owCliffAt(x, y)) continue;
      if (G.ow.road[y*W + x]) out.push([x, y, 'road', G.ow.road[y*W + x]]); if (piers.some(p=>Math.abs(p[0]-x) <= 1 && Math.abs(p[1]-y) <= 1)) out.push([x, y, 'pier']);
      for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++){ const t = M[x+dx][y+dy]; if (t===OW_RIVER || OW_SITE_TILES.includes(t)) out.push([x, y, 'tile ' + t + ' at ' + (x+dx) + ',' + (y+dy)]); } }
    return out; });
  console.log(JSON.stringify(r));
};
