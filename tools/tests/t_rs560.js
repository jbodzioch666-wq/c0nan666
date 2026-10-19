// RS-560: rooms dressed by purpose. In a floor laid out as rooms, a few middle rooms are given a purpose (guard room, shrine, flooded
// hall, collapsed passage, store, roots) and furnished with the new decorations: weapon racks, benches, sacks, a shrine, a fallen
// column, rubble heaps, roots, flood water. The solid ones block and never cut a way off or sit on stairs; the first and last rooms are
// left alone; every new deco has a model and examine text
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = { kinds:{}, purposes:{}, bad:[], floors:0 }; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    const NEW = ['rack','column','roots','heap','flood','shrine','bench','sacks'], SOLID = ['rack','column','heap','shrine','bench','sacks'];
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    for (let f=0;f<8;f++){ G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); const R = G.genRooms; if (!R) continue; out.floors++;
      for (const r of R) out.purposes[r.k] = (out.purposes[r.k]||0) + 1;
      if (R[0].k!=='plain' || R[R.length-1].k!=='plain') out.bad.push('end room ' + R[0].k + '/' + R[R.length-1].k);
      for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const d = G.dungeonDeco[x][y]; if (!NEW.includes(d)) continue; out.kinds[d] = (out.kinds[d]||0) + 1;
        if (stairTile(x, y)) out.bad.push(d + ' on stairs');
        if (SOLID.includes(d)){ if (!dgSolid(x, y)) out.bad.push(d + ' not solid'); G.dungeonDeco[x][y] = ''; if (!dgRingOk(x, y)) out.bad.push(d + ' cuts a way off at ' + x + ',' + y); G.dungeonDeco[x][y] = d; }
        else if (dgSolid(x, y)) out.bad.push(d + ' solid'); } }
    /* every new deco builds a model, and has examine text */
    for (const d of NEW){ try{ const g = isoPropModel({ kind:'dress', d, rot:0, x:3, y:3 }); let n = 0; g.traverse(o=>{ if (o.isMesh) n++; }); if (n < 2) out.bad.push(d + ' thin model'); }catch(e){ out.bad.push(d + ' model: ' + e.message); } if (!EXAMINE_DECO[d]) out.bad.push(d + ' no text'); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.floors >= 6 && Object.keys(r.purposes).length >= 4, 'rooms get purposes');
  A(Object.keys(r.kinds).length >= 6, 'most of the new decorations show up over eight floors');
  A(r.bad.length===0, 'nothing out of place: ' + r.bad.join('; '));
};
