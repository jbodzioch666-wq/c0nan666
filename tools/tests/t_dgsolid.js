// RS-369: a dungeon floor's refuse (barrels, crates, rubble, bones) is solid, and never laid where it would cut a way off.
// Chests are solid too: you bump one to open it, where it stands, and its lid swings up on its hinge and stays up. A click
// on a chest walks you up to it and opens it. Pyramids have no braziers
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999;
    const out = { floors:0, cut:[], solids:0, pyrBraz:0, chestTiles:0 };
    // every kind of site, a few floors each: nothing the floor could reach before its dressing is cut off by it
    for (const k of ['dungeon','castle','necro','temple','graveyard','mine','pyramid','lair']) for (const d of [1, 2, 4, 5]){
      G.siteKind = k; G.dgCache = {}; loadLevel(d, false); out.floors++;
      const bfs = (ok)=>{ const seen = new Set([p.x+','+p.y]), q = [[p.x, p.y]]; while (q.length){ const [x,y] = q.shift(); for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = x+a, ny = y+b, kk = nx+','+ny; if (seen.has(kk) || nx<0 || ny<0 || nx>=COLS || ny>=ROWS || !ok(nx, ny)) continue; seen.add(kk); q.push([nx, ny]); } } return seen; };
      const all = bfs((x,y)=>G.map[x][y]!==T_WALL), free = bfs((x,y)=>dgFree(x, y));
      for (const kk of all){ const [x,y] = kk.split(',').map(Number); if (dgSolid(x, y)) out.solids++; else if (!free.has(kk)) out.cut.push(k+d+':'+kk+':'+G.dungeonDeco[x][y]); }
      for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (k==='pyramid' && G.dungeonDeco[x][y]==='brazier') out.pyrBraz++; if (G.map[x][y]===T_VAULT || G.map[x][y]===T_CORRUPT_CHEST) out.chestTiles++; }
    }
    // a plain floor to try things on, at depth 1 (no mimics)
    G.siteKind = 'dungeon'; G.dgCache = {}; loadLevel(1, false); setUi('playing'); for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR && !G.dungeonDeco[x+i][y+j]) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    const D = G.dungeonDeco, clear = (x,y)=>{ G.map[x][y] = T_FLOOR; D[x][y] = ''; };
    for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; D[p.x+i][p.y+j] = ''; }   /* (an open room to try things in) */ FPD.mapRef = null;
    const x0 = p.x, y0 = p.y, tc = ()=>p.turnCount||0;
    // a barrel: in the way, no turn spent; a monster can't walk into it either; the click-path goes round it
    clear(x0+1, y0); D[x0+1][y0] = 'barrel'; let t0 = tc(); moveDir(1, 0);
    out.barrel = { moved:p.x!==x0 || p.y!==y0, turn:tc()-t0, pass:isoPassable(x0+1, y0) };
    { const m = newMonster(); Object.assign(m, { alive:1, x:x0+2, y:y0, hp:20, maxHp:20, nm:'rat', abilities:[] }); G.mon.push(m); out.barrel.mon = monStep(m, G.mon.length-1, -1, 0); m.alive = 0; G.mon = []; }
    D[x0+1][y0] = '';
    // a corrupted chest: bumped, it opens where it stands and stays there, open and solid
    clear(x0+1, y0); G.map[x0+1][y0] = T_CORRUPT_CHEST; const inv0 = pStats().itemsLooted; moveDir(1, 0);
    out.corrupt = { moved:p.x!==x0, tile:G.map[x0+1][y0]===T_FLOOR, deco:D[x0+1][y0], loot:pStats().itemsLooted - inv0, at:chestOpenedAt(x0+1, y0) > 0, solid:dgSolid(x0+1, y0) };
    // the lid: partly up a moment after, all the way up once it's done
    renderGame(); await new Promise(r=>setTimeout(r, 30)); renderGame();
    const lidOf = ()=>{ for (const [k, o] of ISO.props||[]) if (k.includes('chesto_c') && o.g.userData.hinge) return o.g.userData.hinge.rotation.x; return null; };
    CHEST_OPEN[G.depth+':'+(x0+1)+','+y0] = performance.now() - 150; renderGame(); out.lidMid = lidOf();
    CHEST_OPEN[G.depth+':'+(x0+1)+','+y0] = performance.now() - 3000; renderGame(); out.lidOpen = lidOf();
    // an iron chest needs its key; with it, it opens and the key is spent
    clear(x0-1, y0); D[x0-1][y0] = 'lchest'; skAdd('dkey', -skHave('dkey')); moveDir(-1, 0); out.lockedNoKey = D[x0-1][y0];
    skAdd('dkey', 1); moveDir(-1, 0); out.iron = { deco:D[x0-1][y0], key:skHave('dkey'), moved:p.x!==x0 };
    // a vault: the lock puzzle, then the open chest (or a jammed one)
    clear(x0+1, y0); clear(x0-1, y0);
    clear(x0, y0+1); G.map[x0][y0+1] = T_VAULT; moveDir(0, 1); out.vaultUi = G.ui; G.vault.solved = true; vaultFinish(); out.vault = { deco:D[x0][y0+1], tile:G.map[x0][y0+1]===T_FLOOR, moved:p.y!==y0 };
    clear(x0, y0-1); G.map[x0][y0-1] = T_VAULT; moveDir(0, -1); G.vault.attempt = G.vault.maxAttempts; vaultFinish(); out.jammed = { deco:D[x0][y0-1], solid:dgSolid(x0, y0-1) };
    // a click on a chest across the room: you walk up to it and open it
    let cx = null; for (const [a,b] of [[3,0],[-3,0],[0,3],[0,-3],[2,2],[-2,-2]]){ const x = x0+a, y = y0+b; if (G.map[x][y]===T_FLOOR && !D[x][y]){ cx = [x, y]; break; } }
    clear(cx[0], cx[1]); G.map[cx[0]][cx[1]] = T_CORRUPT_CHEST; setUi('playing');
    isoAct({ mon:null, gx:cx[0], gy:cx[1] }, false); out.click = { openAt:!!ISO.openAt, path:ISO.path.length };
    for (let i=0;i<20 && G.map[cx[0]][cx[1]]===T_CORRUPT_CHEST;i++){ ISO.nextStep = 0; isoTickPath0(performance.now() + 1e5); }
    out.click.opened = G.map[cx[0]][cx[1]]===T_FLOOR && D[cx[0]][cx[1]]==='chesto_c'; out.click.beside = Math.abs(p.x-cx[0]) + Math.abs(p.y-cx[1]);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.floors===32 && r.solids > 20, 'many floors, with solid refuse on them');
  A(r.cut.length===0, 'no floor has a way cut off by its dressing');
  A(r.pyrBraz===0, 'no braziers in a pyramid');
  A(!r.barrel.moved && r.barrel.turn===0 && !r.barrel.pass && !r.barrel.mon, 'a barrel stops you, costs no turn, and stops a monster and the click-path');
  A(!r.corrupt.moved && r.corrupt.tile && r.corrupt.deco==='chesto_c' && r.corrupt.loot===1 && r.corrupt.at && r.corrupt.solid, 'a corrupted chest opens where it stands and stays, solid');
  A(r.lidMid < -0.3 && r.lidMid > -1.8 && Math.abs(r.lidOpen + 1.95) < 0.02, 'its lid swings up and stays up');
  A(r.lockedNoKey==='lchest' && r.iron.deco==='chesto_i' && r.iron.key===0 && !r.iron.moved, 'an iron chest opens with its key');
  A(r.vaultUi==='vault' && r.vault.deco==='chesto_v' && r.vault.tile && !r.vault.moved, 'a vault opens from beside it');
  A(r.jammed.deco==='chests_v' && r.jammed.solid, 'a jammed vault stays shut and solid');
  A(r.click.openAt && r.click.opened && r.click.beside===1, 'a click on a chest walks you up to it and opens it');
};
