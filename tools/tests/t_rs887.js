// RS-887: the dungeon minimap with a floor's seen map kept from a floor of another size: it threw (reading '0' of undefined in
// fpDrawMinimap, every frame); now the seen map is fitted to the floor first (fpSeenFit), what was seen kept, in the minimap and the frame
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); await fr(20);
    for (const [k, dw, dh] of [['smaller', -9, -9], ['larger', 7, 5]]){ G.dungeonSeen = makeGrid(false, Math.max(4, COLS + dw), Math.max(4, ROWS + dh)); G.dungeonSeen[1][1] = true;
      let err = null; try{ fpDrawMinimap(new Set()); }catch(e){ err = String(e).slice(0, 160); }
      out[k] = { err, cols:G.dungeonSeen.length, rows:G.dungeonSeen[0].length, COLS, ROWS, kept:!!G.dungeonSeen[1][1] }; }
    return out; });
  console.log(JSON.stringify(r));
  for (const k of ['smaller', 'larger']){ const o = r[k]; A(!o.err, k + ': the minimap draws', o); A(o.cols===o.COLS && o.rows===o.ROWS && o.kept, k + ': the seen map fitted to the floor, what was seen kept', o); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
