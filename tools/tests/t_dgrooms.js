// RS-407: the plain dungeons are rooms and corridors - rooms whole rectangles, corridors a tile wide through the rock between
// (never along a room's wall, never side by side, no pillars), every room with a doorway: an open arch, or an oak door that
// blocks sight until you or a monster push it open, which takes a turn; a click-walk carries on through it
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; dgCarveCloset = ()=>false;
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 4);
    const out = { kind:G.siteKind, floors:0, bad:[], doors:0, arches:0, rooms:[] };
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
    for (let i=0;i<14;i++){ G.dgCache = {}; loadLevel(1 + (i%4), false, false); const c = check(); out.floors++; out.doors += c.doors; out.arches += c.arches; out.rooms.push(c.rooms); for (const b of c.bad) out.bad.push('floor '+i+': '+b); }
    // a shut door: it blocks sight; pushing it open takes a turn; then you walk through
    loadLevel(1, false, false); setUi('playing'); const D = G.dungeonDeco, p = G.player;
    let dr = null; for (let x=1;x<COLS-1 && !dr;x++) for (let y=1;y<ROWS-1;y++) if (D[x][y]==='door'){ dr = { x, y, ax:W(x-1,y) ? 0 : 1, ay:W(x-1,y) ? 1 : 0 }; break; }
    if (dr){ G.mon = []; p.x = dr.x - dr.ax; p.y = dr.y - dr.ay; const bx = dr.x + dr.ax, by = dr.y + dr.ay, t0 = p.turnCount||0;
      out.door = { shutSight:hasLineOfSight(p.x, p.y, bx, by), shutShot:shotRay(p.x, p.y, bx, by) };
      tryMove(dr.ax, dr.ay); out.door.opened = D[dr.x][dr.y]==='dooro'; out.door.stayed = p.x===dr.x - dr.ax && p.y===dr.y - dr.ay; out.door.openSight = hasLineOfSight(p.x, p.y, bx, by);
      tryMove(dr.ax, dr.ay); out.door.through = p.x===dr.x && p.y===dr.y;
      // a monster shoves one open on its way
      let dr2 = null; for (let x=1;x<COLS-1 && !dr2;x++) for (let y=1;y<ROWS-1;y++) if (D[x][y]==='door'){ dr2 = { x, y, ax:W(x-1,y) ? 0 : 1, ay:W(x-1,y) ? 1 : 0 }; break; }
      if (dr2){ const m = newMonster(); m.alive = 1; m.x = dr2.x + dr2.ax; m.y = dr2.y + dr2.ay; m.nm = 'rat'; G.mon = [m]; p.x = 1; p.y = 1; monStep(m, 0, -dr2.ax, -dr2.ay); out.monDoor = { opened:D[dr2.x][dr2.y]==='dooro', moved:m.x===dr2.x && m.y===dr2.y }; G.mon = []; }
      // a click-walk goes on through a door it had to push open
      let dr3 = null; for (let x=1;x<COLS-1 && !dr3;x++) for (let y=1;y<ROWS-1;y++) if (D[x][y]==='door'){ dr3 = { x, y, ax:W(x-1,y) ? 0 : 1, ay:W(x-1,y) ? 1 : 0 }; break; }
      if (dr3){ p.x = dr3.x - dr3.ax; p.y = dr3.y - dr3.ay; p.hp = effMaxHp(); setUi('playing'); ISO.path = [[dr3.x, dr3.y], [dr3.x + dr3.ax, dr3.y + dr3.ay]]; ISO.target = null; ISO.fighting = null;
        for (let k=0;k<6 && ISO.path.length;k++){ ISO.nextStep = 0; isoTickPath(performance.now()); } out.walk = { at:[p.x - dr3.x, p.y - dr3.y], opened:D[dr3.x][dr3.y]==='dooro', pathLeft:ISO.path.length }; }
      // the door's state goes with the floor into the save
      saveLevelCache(G.depth); const enc = dgCacheDecode(dgCacheEncode())[G.dungeonSlot+'_'+G.depth]; out.saved = enc && enc.dungeonDeco[dr.x][dr.y]==='dooro';
    }
    // the doorways as models
    out.models = {}; for (const d of ['door', 'dooro', 'arch']){ let n = 0; isoPropModel({ x:0, y:0, kind:'dress', d, rot:0 }).traverse(o=>{ if (o.isMesh) n++; }); out.models[d] = n; }
    // and a named site still lays out the old way
    G.siteKind = 'lair'; G.dgCache = {}; loadLevel(1, false, false); out.lairRooms = G.genRooms.length; out.lairKinds = [...new Set(G.genRooms.map(r=>r.k))]; G.siteKind = 'dungeon';
    // in view: stand beside a shut door for the shot
    G.dgCache = {}; loadLevel(1, false, false); { let dd = null; for (let x=1;x<COLS-1 && !dd;x++) for (let y=1;y<ROWS-1;y++) if (G.dungeonDeco[x][y]==='door'){ dd = { x, y, ax:W(x-1,y) ? 0 : 1, ay:W(x-1,y) ? 1 : 0 }; break; }
      if (dd){ G.player.x = dd.x - dd.ax; G.player.y = dd.y - dd.ay; } G.mon.forEach(m=>{ m.alive = 0; }); }
    FPD.mapRef = null; for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    return out;
  });
  console.log(JSON.stringify(r));
  await page.screenshot({ path:`${S}/dgrooms-a.png`, timeout:150000 });
  await page.evaluate(async ()=>{ viewRotate(1); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path:`${S}/dgrooms-b.png`, timeout:150000 });
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.kind==='dungeon' && r.floors===14 && r.bad.length===0, 'every floor is rooms and corridors with doorways: '+r.bad.slice(0, 8).join('; '));
  A(r.doors > 5 && r.arches > 5 && Math.min(...r.rooms) >= 5, 'doors and arches both, and plenty of rooms');
  A(r.door && !r.door.shutSight && !r.door.shutShot && r.door.opened && r.door.stayed && r.door.openSight && r.door.through, 'a shut door blocks sight and takes a turn to open, then you walk through');
  A(!r.monDoor || (r.monDoor.opened && r.monDoor.moved), 'a monster shoves a door open on its way');
  A(r.walk && r.walk.opened && r.walk.pathLeft===0 && Math.abs(r.walk.at[0])+Math.abs(r.walk.at[1])===1, 'the click-walk opened the door, went through and finished its path');
  A(r.saved, 'an opened door stays open in the save');
  A(r.models.door >= 10 && r.models.dooro >= 10 && r.models.arch === 1, 'the doorways are modelled: frame and planked door, or an empty arch');
  A(r.lairRooms >= 2 && r.lairKinds.length >= 1, 'a named site still lays out the old way');
};
