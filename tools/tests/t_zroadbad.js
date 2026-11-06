// (probe, not in ALL) road points that land on a mountain or the water, and where in their chain they sit
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = []; const road = G.ow.road;
    for (let cy=40; cy<OW_ROWS; cy+=90) for (let cx=40; cx<OW_COLS; cx+=90){ for (const c of o3RoadChains(cx - 48, cy - 48, 96, 5)) c.p.forEach(([x, z], i)=>{ const tx = Math.floor(x), ty = Math.floor(z), t = G.ow.map[tx] && G.ow.map[tx][ty]; if (road[ty*OW_COLS + tx]) return; if (t===OW_MOUNTAIN || t===OW_WATER || t===OW_RIVER) out.push({ i, n:c.p.length, t, lane:!!c.lane, x:+x.toFixed(2), z:+z.toFixed(2), first:c.pts[0], last:c.pts[c.pts.length-1] }); }); }
    return out.slice(0, 12); });
  for (const x of r) console.log(JSON.stringify(x));
};
