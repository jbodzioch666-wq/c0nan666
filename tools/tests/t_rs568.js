// RS-568: the catacombs under a graveyard are laid out as the plain dungeons are (RS-407) - burial chambers that are whole
// rectangles, passages a tile wide through the rock between them, no stray pillars or ragged walls, every chamber with a doorway,
// all of it reachable - and still catacombs: niche-lined walls, bones and candles along them. The graveyard's plot above is unchanged
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; dgCarveCloset = ()=>false;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_GRAVEYARD){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 5);
    const out = { kind:G.siteKind, floors:0, bad:[], doors:0, arches:0, rooms:[], bones:0, themes:[] };
    const W = (x,y)=>x<0||y<0||x>=COLS||y>=ROWS||G.map[x][y]===T_WALL;
    const check = ()=>{
      const R = G.genRooms, D = G.dungeonDeco, bad = [], inRoom = (x,y)=>R.some(r=>x>=r.x && x<r.x+r.w && y>=r.y && y<r.y+r.h);
      for (const r of R) for (let x=r.x;x<r.x+r.w;x++) for (let y=r.y;y<r.y+r.h;y++) if (G.map[x][y]===T_WALL) bad.push('wall in room '+x+','+y);
      for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_WALL && !W(x-1,y) && !W(x+1,y) && !W(x,y-1) && !W(x,y+1)) bad.push('pillar '+x+','+y);
      for (let x=1;x<COLS-2;x++) for (let y=1;y<ROWS-2;y++) if (![[0,0],[1,0],[0,1],[1,1]].some(([i,j])=>W(x+i,y+j) || inRoom(x+i,y+j))) bad.push('wide corridor '+x+','+y);
      let doors = 0, arches = 0; const roomDoors = R.map(()=>0);
      for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++){ const d = D[x][y];
        if (d!=='door' && d!=='arch'){ if (!W(x,y) && !inRoom(x,y) && [[1,0],[-1,0],[0,1],[0,-1]].some(([i,j])=>inRoom(x+i,y+j))) bad.push('corridor opens straight into a room '+x+','+y); continue; }
        d==='door' ? doors++ : arches++;
        const ns = W(x,y-1) && W(x,y+1) && !W(x-1,y) && !W(x+1,y), ew = W(x-1,y) && W(x+1,y) && !W(x,y-1) && !W(x,y+1);
        if (!(ns || ew)) bad.push('doorway not set in a wall '+x+','+y);
        const ri = R.findIndex(r=>(x>=r.x && x<r.x+r.w && (y===r.y-1 || y===r.y+r.h)) || (y>=r.y && y<r.y+r.h && (x===r.x-1 || x===r.x+r.w))); if (ri < 0) bad.push('doorway off any room '+x+','+y); else roomDoors[ri]++; }
      roomDoors.forEach((k,i)=>{ if (!k) bad.push('room '+i+' has no doorway'); });
      const seen = new Set([G.genStart.x+','+G.genStart.y]), q = [[G.genStart.x, G.genStart.y]]; while (q.length){ const [x,y] = q.shift(); for (const [i,j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X = x+i, Y = y+j, k = X+','+Y; if (W(X,Y) || seen.has(k)) continue; seen.add(k); q.push([X,Y]); } }
      let open = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (!W(x,y)) open++;
      if (seen.size!==open) bad.push('unreachable tiles '+(open-seen.size));
      return { bad, doors, arches, rooms:R.length };
    };
    for (let i=0;i<12;i++){ G.dgCache = {}; loadLevel(2 + (i%4), false, false); const c = check(); out.floors++; out.doors += c.doors; out.arches += c.arches; out.rooms.push(c.rooms); for (const b of c.bad) out.bad.push('floor '+i+': '+b);
      for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.dungeonDeco[x][y]==='bones' || G.dungeonDeco[x][y]==='candles') out.bones++; const th = fpTheme().key; if (!out.themes.includes(th)) out.themes.push(th); }
    G.dgCache = {}; loadLevel(1, false, false); out.plot = { kind:G.siteKind, crypt:G.dungeonDeco.flat().includes('cryptDoor'), graves:G.dungeonDeco.flat().filter(d=>d==='grave').length };
    return out;
  });
  console.log(JSON.stringify(Object.assign({}, r, { bad:r.bad.slice(0, 12) })));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(Object.assign({}, r, { bad:r.bad.slice(0, 12) }))); };
  A(r.kind==='graveyard', 'in a graveyard');
  A(r.bad.length===0, 'the catacombs are whole chambers and passages, no pillars, every chamber with a doorway, all reachable');
  A(r.rooms.every(n=>n >= 4) && r.doors + r.arches >= r.floors*4, 'several chambers on every floor, with doorways: arches and doors');
  A(r.themes.length===1 && r.themes[0]==='catacomb' && r.bones > r.floors*3, 'still catacombs - niche walls, bones and candles: ' + r.themes.join(','));
  A(r.plot.crypt && r.plot.graves > 5, 'the graveyard above is its open plot, with the crypt down');
};
