// RS-410: tapping a movement key (or clicking) faster than you walk never puts you ahead of your figure - it used to run two or
// three tiles in front and then jump to you; a step is held until the figure catches up. In the dungeon, on the land and in
// town. And the dusk light fades into moonlight instead of switching in one frame
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const wait = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    const run = async (mode, figure, logical, press, frames)=>{
      let maxLag = 0, maxJump = 0, prev = null; const start = logical();
      for (let i=0;i<frames;i++){ G.player.hp = effMaxHp(); if (i % 2===0 && i < frames - 16) press(); renderGame(); await wait(16);
        const f = figure(), l = logical(); if (!f) continue; const lag = Math.hypot(f[0]-l[0]-0.5, f[1]-l[1]-0.5); maxLag = Math.max(maxLag, lag);
        if (prev) maxJump = Math.max(maxJump, Math.hypot(f[0]-prev[0], f[1]-prev[1])); prev = f; }
      const end = logical(); return { mode, moved:Math.abs(end[0]-start[0]) + Math.abs(end[1]-start[1]), maxLag:+maxLag.toFixed(2), maxJump:+maxJump.toFixed(2), buffered:!!G.moveBuf };
    };
    const dirOf = (ok, x, y)=>{ for (const d of [[1,0],[-1,0],[0,1],[0,-1]]){ let n = 0; for (let k=1;k<=6;k++) if (ok(x+d[0]*k, y+d[1]*k)) n++; else break; if (n >= 6) return d; } return null; };
    const find = (ok, x0, y0, R)=>{ for (let r=0;r<=R;r++) for (let x=x0-r;x<=x0+r;x++) for (let y=y0-r;y<=y0+r;y++){ if (Math.max(Math.abs(x-x0), Math.abs(y-y0))!==r || !ok(x,y)) continue; const d = dirOf(ok, x, y); if (d) return { x, y, d }; } return null; };
    // the land
    G.gameMode = 0; G.interior = null; o3Pref = true; for (let i=0;i<4;i++){ renderGame(); await wait(30); }
    { const okL = (x,y)=>o3Passable(x,y) && G.ow.map[x][y]!==OW_WATER && !OW_SITE_TILES.includes(G.ow.map[x][y]) && !wgPoiAt(x,y), f = find(okL, G.owPos.x, G.owPos.y, 30), d = f.d; G.owPos = { x:f.x, y:f.y }; O3.ppos = null; renderGame();
      for (let i=0;i<4;i++){ renderGame(); await wait(30); }
      const key = d[0]===1 ? 'ArrowRight' : d[0]===-1 ? 'ArrowLeft' : d[1]===1 ? 'ArrowDown' : 'ArrowUp';
      viewRotDir = v=>v;   /* (the camera's turn left out: the key walks straight along the grid) */
      out.land = await run('land', ()=>O3.ppos && [O3.ppos.x, O3.ppos.z], ()=>[G.owPos.x, G.owPos.y], ()=>handlePlayingKey(key), 44); }
    // the dungeon
    { let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
      G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(m=>{ m.alive = 0; });
      let d = null; for (let x=1;x<COLS-1 && !d;x++) for (let y=1;y<ROWS-1 && !d;y++) if (isoPassable(x,y)){ const v = dirOf((a,b)=>isoPassable(a,b) && G.map[a][b]===T_FLOOR && !G.dungeonDeco[a][b], x, y); if (v){ d = v; G.player.x = x; G.player.y = y; } }
      if (ISO.player) ISO.player.pos = null; for (let i=0;i<4;i++){ renderGame(); await wait(30); }
      out.dungeon = await run('dungeon', ()=>ISO.player && ISO.player.pos && [ISO.player.pos.x - 0.5 + 0.5, ISO.player.pos.y], ()=>[G.player.x, G.player.y], ()=>isoStep(d), 44);
      dgFinish(false); }
    // town
    { G.gameMode = 0; enterVillage(); setUi('playing'); for (let i=0;i<4;i++){ renderGame(); await wait(30); }
      const okT = (a,b)=>a>0 && b>0 && a<COLS-1 && b<ROWS-1 && G.map[a][b]===T_FLOOR, f = find(okT, G.player.x, G.player.y, 40), d = f.d; G.player.x = f.x; G.player.y = f.y;
      (G.villageNpcs||[]).length = 0; for (let i=0;i<6;i++){ renderGame(); await wait(30); }
      const key = d[0]===1 ? 'ArrowRight' : d[0]===-1 ? 'ArrowLeft' : d[1]===1 ? 'ArrowDown' : 'ArrowUp';
      out.town = await run('town', ()=>V3.player && V3.player.g && [V3.player.g.position.x, V3.player.g.position.z], ()=>[G.player.x, G.player.y], ()=>handlePlayingKey(key), 44); }
    // the dusk light: no jump from one frame to the next as the moonlight comes in
    { G.gameMode = 0; G.interior = null; setUi('playing'); let worst = 0, prev = null;
      for (let ph = 0.70; ph <= 0.80; ph += 0.0025){ G.player.clock = DAY_LENGTH*9 + DAY_LENGTH*ph; o3ApplyTime(); gfxO3Light(); const c = O3.sun.color, h = O3.hemi.color, v = [c.r*O3.sun.intensity, c.g*O3.sun.intensity, c.b*O3.sun.intensity, h.r, h.g, h.b];
        if (prev) worst = Math.max(worst, ...v.map((x,i)=>Math.abs(x - prev[i]))); prev = v; }
      out.duskStep = +worst.toFixed(3); }
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['land', 'dungeon', 'town']){ const o = r[k];
    A(o.moved >= 3, k+': rapid presses still walk you along');
    A(o.maxLag <= 1.8, k+': you never get more than a step ahead of your figure (it used to run on to 2.5 and snap)');
    A(o.maxJump <= 1.6, k+': the figure never jumps to catch up (a slow software frame glides further; a snap was 2.5 and up)'); }
  A(r.duskStep < 0.08, 'the dusk light changes smoothly: '+r.duskStep);
};
