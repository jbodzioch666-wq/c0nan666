// (probe, not in ALL) what the land's road mask costs: tracing the roads into chains, and painting them into the mask
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const W = O3_W, M = 5, x0 = G.owPos.x - W/2, y0 = G.owPos.y - W/2, out = [];
    for (let k=0;k<3;k++){ const t0 = performance.now(); const ch = o3RoadChains(x0, y0, W, M); const t1 = performance.now(); o3RoadMask(x0, y0, W, M); const t2 = performance.now(); out.push({ chains:+(t1 - t0).toFixed(1), all:+(t2 - t1).toFixed(1), n:ch.length, S:Math.round((W + 2*M)*O3_RM_PX) }); }
    return out; });
  console.log(JSON.stringify(r));
};
