// RS-443: the town's cobbles are a fine layer of their own over the paved tiles - a 1024px texture four tiles across, laid in irregular courses,
// made once a look and reused - not the ground's few pixels a tile in one grid; the compass rose lies over it, painted fine
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const towns = townList().filter(t=>townInfo(t.x, t.y).race!=='halfling'), go = t=>{ G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing'); renderGame(); };
    go(towns[0]); const m = V3.cobbles, tex = m && m.material.map, img = tex && tex.image;
    let paved = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (/^(path|pier|gate|waypoint|stash|questgiver|npc|lamp|pbench)$/.test(G.villageDeco[x][y]||'')) paved++;
    const out = { has:!!m, quads:m ? m.geometry.index.count/6 : 0, paved, size:img ? img.width : 0, wrap:tex && tex.wrapS===THREE.RepeatWrapping, rose:!!V3.world.getObjectByName('compassRose') };
    /* (not one grid per tile: the four tiles of the texture's first row differ) */
    if (img){ const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), q = img.width/4, sums = [];
      for (let i=0;i<4;i++){ x.clearRect(0,0,64,64); x.drawImage(img, i*q, 0, q, q, 0, 0, 64, 64); const d = x.getImageData(0,0,64,64).data; sums.push(d); }
      let diff = 0; for (let k=0;k<sums[0].length;k+=4) diff += Math.abs(sums[0][k] - sums[1][k]); out.tileDiff = Math.round(diff/(64*64)); }
    if (towns[1]){ go(towns[1]); out.reused = V3.cobbles && V3.cobbles.material.map===tex || (townInfo(towns[1].x, towns[1].y).theme!==townInfo(towns[0].x, towns[0].y).theme); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.has && r.quads===r.paved && r.paved > 50, 'every paved tile is laid with the fine cobbles');
  A(r.size >= 512 && r.wrap, 'a fine texture, running on across the tiles');
  A(r.tileDiff > 15, 'each tile of it laid differently, not one grid repeated');
  A(r.rose && r.reused !== false, 'the compass rose over it, and the texture made once and reused');
};
