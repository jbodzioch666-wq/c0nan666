// RS-433: a treasure map's X and a clue scroll's dig or search spot are marked - on the world map, the minimap and the ground itself - and
// standing there and reading it digs up the casket (they only lifted the fog round the spot, so there was nothing to find it by)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }; G.gameMode = 0; G.mon = [];
    G.inv = G.inv.filter(it=>it && !it.tmap && !it.clue);
    const mp = sqTreasureMap(); addToInventory(mp); const idx = G.inv.indexOf(mp); sqMapRead(idx); setUi('playing');
    out.marks = trailMarks().map(m=>[m.x, m.y, m.k]); out.at = [mp.mx, mp.my];
    await frames(6); const pool = O3.trailPool || [], g = pool.find(x=>x.visible);
    out.land = g ? [Math.floor(g.position.x), Math.floor(g.position.z)] : null;
    // the minimap and the world map draw it without error
    let err = null; try{ renderMiniMap(); G.owZoomedOut = true; renderGame(); G.owZoomedOut = false; renderGame(); }catch(e){ err = String(e); } out.err = err;
    // go there and dig
    const g0 = G.player.gold; G.owPos = { x:mp.mx, y:mp.my }; sqMapRead(G.inv.indexOf(mp)); out.dug = G.player.gold > g0 && !G.inv.includes(mp);
    // a clue scroll: read, its first marked step shows; there, it moves on
    let cl = null; for (let t=0; t<30; t++){ const c = mkClue(); c.trail = sqClueNew(); if (c.trail.steps[0].x!==undefined){ cl = c; break; } }
    if (cl){ addToInventory(cl); sqClueRead(G.inv.indexOf(cl)); setUi('playing'); const st = cl.trail.steps[0]; out.clue = { mark:trailMarks().some(m=>m.x===st.x && m.y===st.y), k:st.k };
      G.owPos = { x:st.x, y:st.y }; sqClueRead(G.inv.indexOf(cl)); setUi('playing'); out.clue.moved = cl.trail.i===1 || !G.inv.includes(cl); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.marks.length===1 && r.marks[0][0]===r.at[0] && r.marks[0][1]===r.at[1], 'the treasure map\'s X is marked where it points');
  A(r.land && r.land[0]===r.at[0] && r.land[1]===r.at[1], 'and on the ground itself');
  A(!r.err, 'the minimap and the world map draw it');
  A(r.dug, 'standing on the X and reading it digs up the casket');
  A(r.clue && r.clue.mark && r.clue.moved, 'a clue scroll\'s spot is marked too, and reading it there moves the trail on');
};
