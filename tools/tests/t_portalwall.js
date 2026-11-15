// RS-185: the way out of a dungeon (the portal) and the stairs stand against a wall, never across a passage - in every kind
// of site, including a mine whose way in lay under a pile of gold, and the castle and graveyard surfaces
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false;
    const out = { n:0, bad:[] };
    const walk = (x,y)=>G.map[x] && G.map[x][y]!==undefined && G.map[x][y]!==T_WALL;
    const comps = (skip)=>{ const seen = new Set(); let c = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (!walk(x,y) || (x===skip[0]&&y===skip[1]) || seen.has(x+','+y)) continue; c++; const q=[[x,y]]; seen.add(x+','+y); while(q.length){ const [a,b]=q.pop(); for (const [dx,dy] of FACING_VECT){ const nx=a+dx, ny=b+dy, k=nx+','+ny; if (!walk(nx,ny) || (nx===skip[0]&&ny===skip[1]) || seen.has(k)) continue; seen.add(k); q.push([nx,ny]); } } } return c; };
    for (let w=0; w<4; w++){
      goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
      for (const kind of [OW_DUNGEON, OW_MINE, OW_CASTLE, OW_NECROTOWER, OW_TEMPLE, OW_GRAVEYARD, OW_LAIR]){
        const sites = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===kind) sites.push([x,y]);
        for (const [sx,sy] of sites.slice(0, 3)){
          G.gameMode = 0; G.pendingDungeon = { x:sx, y:sy }; try{ enterDungeonConfirm(); }catch(e){ out.bad.push('enter '+kind+' '+e.message); continue; } setUi('playing');
          for (let d=1; d<=Math.min(3, G.dungeonMaxDepth); d++){
            if (d>1){ try{ loadLevel(d, false); }catch(e){ out.bad.push('load '+e.message); break; } }
            const base = comps([-1,-1]);
            for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const t = G.map[x][y]; if (t!==T_EXIT && t!==T_STAIRSU && t!==T_STAIRSD) continue; out.n++;
              const w2 = stairWallDir(x,y) || portalWallDir(x,y), cut = comps([x,y]) > base;
              if (!w2 || cut) out.bad.push({ site:G.siteKind, d, t:t===T_EXIT?'exit':t===T_STAIRSU?'up':'down', x, y, wall:!!w2, cut, nb:[[0,-1],[1,0],[0,1],[-1,0]].map(([a,b])=>G.map[x+a][y+b]===T_WALL?'W':'.').join('') }); }
          }
          G.gameMode = 0;
        }
      }
    }
    return out; });
  console.log(JSON.stringify(r));
  if (!(r.n > 100 && r.bad.length===0)) throw new Error('assert: every portal and stair backs onto a wall and leaves the way past it open '+JSON.stringify(r));
};
