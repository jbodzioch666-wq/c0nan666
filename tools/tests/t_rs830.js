// RS-830: a cube planet's corners keep their small seas open: a sea temple (generator 29) stands clear of them. Seed 777 used to put one 2.1 tiles from a corner
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); const w = [];
    for (const seed of [777, 424242, 31337, 2024]){ wgRegenerate(seed); const M = G.ow.map; let bad = 0, near = 9e9, temples = 0;
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (cubeFace(x, y) < 0) continue; const d = cubeCornerDist(x, y); if (d < 2.5 && M[x][y]!==OW_WATER) bad++; if (M[x][y]===OW_TEMPLE && owSeaSite(x, y)){ temples++; near = Math.min(near, d); } }
      w.push({ seed, ver:G.ow.genVer, bad, temples, near:+near.toFixed(2) }); }
    const k = (()=>{ wgRegenerate(777); const a = pmMapKey(); wgRegenerate(777); return a===pmMapKey(); })();
    return { w, same:k, ver:OW_GEN_VER }; });
  console.log(JSON.stringify(r)); const A = (c, m)=>{ if (!c) throw new Error(m + ' ' + JSON.stringify(r)); };
  A(r.ver >= 29 && r.w.every(q=>q.ver===r.ver), 'worlds on generator 29');
  A(r.w.every(q=>q.bad===0), 'no land or site in a corner sea');
  A(r.w.every(q=>q.temples > 0 && q.near >= 6), 'sea temples exist, clear of the corners');
  A(r.same, 'and the same seed still gives the same world');
};
