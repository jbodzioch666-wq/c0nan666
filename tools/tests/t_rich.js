// RS-179: rich spots (a sparkling gold vein, an ancient oak, a legendary fishing spot) never turn up on a road, a site or a point of interest
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
    // stand on a road, where they'd be most likely to land on one
    const roads = []; for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++) if (wgRoadAt(x, y)) roads.push([x, y]);
    let made = 0, onRoad = 0, onSite = 0, gold = 0;
    for (let i=0;i<150;i++){ const [x, y] = roads[i*7 % roads.length]; G.owPos = { x, y }; G.ow.rich = []; G.ow.richNext = 0; richTick();
      for (const s of G.ow.rich){ made++; if (s.type==='goldvein') gold++; if (wgRoadAt(s.x, s.y)) onRoad++; if (OW_SITE_TILES.includes(G.ow.map[s.x][s.y]) || wgPoiAt(s.x, s.y)) onSite++; } }
    G.ow.rich = [];
    return { roads:roads.length, made, gold, onRoad, onSite };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.roads > 0 && r.made > 50, 'rich spots turn up');
  A(r.onRoad===0 && r.onSite===0, 'never on a road, a site or a point of interest');
};
