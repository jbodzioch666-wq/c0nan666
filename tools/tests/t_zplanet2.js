// (probe, not in ALL) what the tiles are at a few points of a planet (ZSEED, ZPTS=x:y,...), with elevation details
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); });
  const r = await page.evaluate(([seed, pts])=>{ setWorldSizeTier('planet'); wgRegenerate(seed);
    let cl = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (owCliffAt(x, y)) cl++; const nb = (x, y)=>[[1,0],[-1,0],[0,1],[0,-1]].map(([a, b])=>G.ow.map[x+a][y+b]).join(""); return [{ cliffs:cl, n150:nb(150,125), c150:owCliffAt(150,125), WATER:OW_WATER }].concat(pts.map(([x, y])=>({ x, y, t:G.ow.map[x][y], bio:wgBioAt(x, y), col:wgPreviewColor(G.ow.map[x][y], x, y), orog:+OW_PLANET_OROG[y*OW_COLS + x].toFixed(2) })).concat([{ MTN:OW_MOUNTAIN, GRASS:OW_GRASS, pockets:G.ow.pocketsFilled }])); }, [+(process.env.ZSEED||2659250257), (process.env.ZPTS||'150:125,60:110,390:110,250:140').split(',').map(p=>p.split(':').map(Number))]);
  console.log(JSON.stringify(r));
};
