// RS-105: in 3D the water stays on the water - land ground stays above the wave tops, so no sea, lake or river shows through it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    o3Pref = true; G.gameMode = 0; G.owZoomedOut = false; G.player.wildWarned = 1;
    // stand by the sea: the land tile with the most water around it, near the middle
    let best = null, bs = -1; for (let x=40;x<OW_COLS-40;x++) for (let y=40;y<OW_ROWS-40;y++){ const t = G.ow.map[x][y]; if (t===OW_WATER || t===OW_RIVER || t===OW_MOUNTAIN || OW_SITE_TILES.includes(t)) continue;
      let w = 0; for (let a=-3;a<=3;a++) for (let b=-3;b<=3;b++){ const u = G.ow.map[x+a][y+b]; if (u===OW_WATER || u===OW_RIVER) w++; } if (w > bs && w < 30){ bs = w; best = [x,y]; } }
    G.owPos = { x:best[0], y:best[1] }; O3.win = null; renderGame(); for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    A(O3.win && O3.heightAt, '3D built');
    const wet = (x,y)=>{ const t = o3Tile(x,y); return t===OW_WATER || t===OW_RIVER; };
    const crest = O3_WATER_Y + 0.05; let land = 0, low = 0, worst = 9, edges = 0, lowEdge = 0;
    const { x0, y0 } = O3.win;
    for (let x=x0+2;x<x0+O3_W-2;x++) for (let y=y0+2;y<y0+O3_W-2;y++){
      if (wet(x,y)) continue; land++;
      // the middle and the inner half of every land tile
      for (const [a,b] of [[0.5,0.5],[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75]]){ const h = O3.heightAt(x+a, y+b); worst = Math.min(worst, h); if (h <= crest) low++; }
      // its edges with water
      for (const [a,b,dx,dy] of [[0,0.5,-1,0],[1,0.5,1,0],[0.5,0,0,-1],[0.5,1,0,1]]) if (wet(x+dx, y+dy)){ edges++; if (O3.heightAt(x+a, y+b) < crest - 1e-6) lowEdge++; }
    }
    A(low===0, `land below the waves at ${low} points (lowest ${worst.toFixed(3)})`);
    A(lowEdge===0, `shore edges below the waves: ${lowEdge} of ${edges}`);
    A(edges > 10, 'there was a shore to check');
    // and the water is still deep in the middle of water tiles
    let deep = 0, n = 0; for (let x=x0+2;x<x0+O3_W-2;x++) for (let y=y0+2;y<y0+O3_W-2;y++) if (wet(x,y)){ n++; if (O3.heightAt(x+0.5, y+0.5) < O3_WATER_Y - 0.09) deep++; }
    A(deep===n, `water tiles are under water: ${deep}/${n}`);
    return { at:best, land, edges, worst:+worst.toFixed(3), waterTiles:n };
  });
  console.log(JSON.stringify(r));
  await page.waitForTimeout(400); await page.screenshot({ path: SHOTS+'/shot_shore.png', timeout:120000 }).catch(()=>{});
};
