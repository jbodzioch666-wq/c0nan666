// (probe, not in ALL) the tavern's lights round the hooded figure's corner (t_rs382 failing on lampFar): every main lamp's position and
// its distance from the corner, the candles, and the room's layout entries near it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing'); for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const h = G.villageNpcs.find(n=>n.service==='hooded'), lamps = V3.lamps.map(l=>({ main:!!l.main, p:l.p.map(v=>+v.toFixed(2)), d:+Math.hypot(l.p[0] - 5.5, l.p[2] - 11.5).toFixed(2), kind:l.kind, k:Object.keys(l).join(',') }));
    const lights = []; V3.world.traverse(o=>{ if (o.isPointLight) lights.push({ i:+o.intensity.toFixed(2), dist:+o.distance.toFixed(2), p:[+o.position.x.toFixed(2), +o.position.y.toFixed(2), +o.position.z.toFixed(2)], d:+Math.hypot(o.position.x - 6.5, o.position.z - 10.5).toFixed(2) }); });
    return { at:h && [h.x, h.y], COLS, ROWS, lamps, lights, deco:(G.villageDeco||[]).length ? [5,6,7].map(x=>[9,10,11,12].map(y=>G.villageDeco[x] && G.villageDeco[x][y])) : null }; });
  console.log(JSON.stringify(r, null, 1));
};
