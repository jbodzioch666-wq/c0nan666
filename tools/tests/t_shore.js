// RS-105: in 3D the water stays on the water - land ground stays above the wave tops, so no sea, lake or river shows through it
// RS-115: where two water tiles meet only at a corner, the corner stays under water (rivers join on the diagonal)
// RS-117: a river's banks sit at the calm water line, so a one-tile river fills its tile
// RS-116: waterfalls stand where a river leaves a cliff, flow downward, and have a sheet, foam, spray and mist
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
    const crest = O3_WATER_Y + 0.05; let land = 0, low = 0, worst = 9, edges = 0, lowEdge = 0, rivEdges = 0, highRiv = 0;
    const { x0, y0 } = O3.win;
    for (let x=x0+2;x<x0+O3_W-2;x++) for (let y=y0+2;y<y0+O3_W-2;y++){
      if (wet(x,y)) continue; land++;
      // the middle and the inner half of every land tile
      // (the quarter of a land tile that touches a corner where two water tiles meet diagonally dips to let the water through)
      const diagCorner = (cx, cz)=> (wet(cx-1, cz-1) && wet(cx, cz) && !wet(cx-1, cz) && !wet(cx, cz-1)) || (wet(cx, cz-1) && wet(cx-1, cz) && !wet(cx-1, cz-1) && !wet(cx, cz));
      for (const [a,b] of [[0.5,0.5],[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75]]){ if (a!==0.5 && diagCorner(x + (a>0.5 ? 1 : 0), y + (b>0.5 ? 1 : 0))) continue; const h = O3.heightAt(x+a, y+b); worst = Math.min(worst, h);
        // (beside a river the bank is at the calm water line, so a river's ripples may lap it; beside the sea or a lake the land clears the wave tops)
        const byRiver = a!==0.5 && [[0,0],[a>0.5?1:-1,0],[0,b>0.5?1:-1],[a>0.5?1:-1,b>0.5?1:-1]].some(([dx,dy])=>o3Tile(x+dx, y+dy)===OW_RIVER);
        if (h <= (byRiver ? O3_WATER_Y : crest)) low++; }
      // its edges with water
      // its edges with water: a sea or lake shore stands above the wave tops; a river bank (RS-117) sits just above the calm water, so the river fills its tile
      for (const [a,b,dx,dy] of [[0,0.5,-1,0],[1,0.5,1,0],[0.5,0,0,-1],[0.5,1,0,1]]) if (wet(x+dx, y+dy)){ edges++; const h = O3.heightAt(x+a, y+b), river = o3Tile(x+dx, y+dy)===OW_RIVER;
        if (river ? (h < O3_WATER_Y - 1e-6) : (h < crest - 1e-6)) lowEdge++; if (river){ rivEdges++; if (h > O3_WATER_Y + 0.02 && h < O3_WATER_Y + 0.14) highRiv++; } }
    }
    A(low===0, `land below the waves at ${low} points (lowest ${worst.toFixed(3)})`);
    A(lowEdge===0, `shore edges below the waves: ${lowEdge} of ${edges}`);
    A(edges > 10, 'there was a shore to check');
    A(highRiv===0, `river banks lifted to a shore: ${highRiv} of ${rivEdges}`);
    // and the water is still deep in the middle of water tiles
    let deep = 0, n = 0; for (let x=x0+2;x<x0+O3_W-2;x++) for (let y=y0+2;y<y0+O3_W-2;y++) if (wet(x,y)){ n++; if (O3.heightAt(x+0.5, y+0.5) < O3_WATER_Y - 0.09) deep++; }
    A(deep===n, `water tiles are under water: ${deep}/${n}`);
    let diag = 0, dry = 0; for (let x=x0+2;x<x0+O3_W-2;x++) for (let y=y0+2;y<y0+O3_W-2;y++) for (const [dx,dy] of [[1,1],[1,-1]]){
      if (wet(x,y) && wet(x+dx,y+dy) && !wet(x+dx,y) && !wet(x,y+dy)){ diag++; const cx = x + (dx>0 ? 1 : 0), cz = y + (dy>0 ? 1 : 0); if (O3.heightAt(cx, cz) > O3_WATER_Y - 0.05) dry++; } }
    A(dry===0, `diagonal water corners above the water: ${dry} of ${diag}`);
    return { at:best, land, edges, worst:+worst.toFixed(3), waterTiles:n, diag };
  });
  console.log(JSON.stringify(r));
  // a waterfall: find a river leaving a cliff, stand below it, and watch it flow
  const wf = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    for (const seed of [77, 11, 2024, 4242, 99, 123, 555, 9001]){
      G.ow.continent = 'continents'; wgRegenerate(seed); setUi('playing'); G.gameMode = 0; G.interior = null; G.ow.encounters = [];
      const m = G.ow.map; let at = null;
      for (let x=20;x<OW_COLS-20 && !at;x++) for (let y=20;y<OW_ROWS-20 && !at;y++){ if (m[x][y]!==OW_RIVER) continue; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (m[x+a][y+b]===OW_MOUNTAIN && [OW_RIVER, OW_WATER].includes(m[x-a][y-b])){ at = [x-a*2, y-b*2]; break; } }
      if (!at) continue; G.owPos = { x:at[0], y:at[1] }; O3.win = null; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
      const F = GFX.falls||[]; if (!F.length) continue;
      for (const f of F){ const a = Math.round(-Math.sin(f.g.rotation.y)), b = Math.round(-Math.cos(f.g.rotation.y)); /* (the frame's +z points away from the cliff) */
        A(f.sheets.length===2 && f.foam && f.spray.length && f.mist.length, 'a sheet, foam, spray and mist');
        A([OW_RIVER, OW_WATER].includes(o3Tile(f.tx - a, f.ty - b)) && [OW_MOUNTAIN, OW_MOUNTAINPASS].includes(o3Tile(f.tx + a, f.ty + b)), 'the river leaves a cliff and runs on'); }
      for (let i=0;i<F.length;i++) for (let j=i+1;j<F.length;j++) A(Math.abs(F[i].tx-F[j].tx) > 2 || Math.abs(F[i].ty-F[j].ty) > 2, 'falls are spread out');
      const o0 = F[0].sheets[0].material.map.offset.y; gfxWaterfallTick(F[0], 1); const o1 = F[0].sheets[0].material.map.offset.y; gfxWaterfallTick(F[0], 2); const o2 = F[0].sheets[0].material.map.offset.y;
      A(o2 > o1, 'the water flows down (the texture moves up the sheet)');
      return { seed, falls:F.length, drops:F.map(f=>+f.drop.toFixed(2)) };
    }
    return { none:true };
  });
  console.log(JSON.stringify(wf)); if (wf.none) throw new Error('no waterfall found in any test world');
  await page.waitForTimeout(400); await page.screenshot({ path: SHOTS+'/shot_shore.png', timeout:120000 }).catch(()=>{});
};
