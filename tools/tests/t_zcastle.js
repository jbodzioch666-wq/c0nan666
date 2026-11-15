// (probe, not in ALL) castle floors from rooms: many made, each checked whole; ZMAP prints some as text
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; let cs = null; for (let x=0;x<OW_COLS && !cs;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE){ cs = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const out = { bad:[], maps:[], kinds:{}, made:0, fallback:0, max:G.dungeonMaxDepth }; const of = castlePlanFallback; castlePlanFallback = function(){ out.fallback++; return of.apply(this, arguments); };
    const txt = ()=>{ const L = []; for (let y=0;y<ROWS;y++){ let s = ''; for (let x=0;x<COLS;x++){ const t = G.map[x][y], dd = G.dungeonDeco[x][y]; s += t===T_WALL ? '#' : t===T_STAIRSU ? '<' : t===T_STAIRSD ? '>' : t===T_EXIT ? 'E' : t===T_VAULT ? 'V' : t===T_GOLD ? '$' : dd==='door' ? '+' : dd==='arch' ? "'" : dd==='throne' ? 'T' : dd ? 'o' : G.mon.some(m=>m.x===x && m.y===y) ? 'm' : '.'; } L.push(s); } return L.join(String.fromCharCode(10)); };
    for (const mx of [1, 2, 4, 6]) for (let d=1; d<=mx; d++) for (let rep=0; rep<6; rep++){ G.dungeonMaxDepth = mx; G.depth = d; G.siteKind = 'castle'; generateCastleLevel(d); if (d===1) G.map[G.genStart.x][G.genStart.y] = T_EXIT; out.made++;
      for (const r of G.genRooms) out.kinds[r.k] = (out.kinds[r.k]||0) + 1;
      /* every open tile reached from the start, round solid things */ const seen = new Set([G.genStart.x + ',' + G.genStart.y]), q = [[G.genStart.x, G.genStart.y]]; while (q.length){ const [x, y] = q.pop(); for (const [i, j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a = x+i, b = y+j, k = a + ',' + b; if (a<0||b<0||a>=COLS||b>=ROWS||seen.has(k)) continue; const t = G.map[a][b]; if (t===T_WALL) continue; seen.add(k); if (t===T_VAULT || DG_SOLID_DECOS.includes(G.dungeonDeco[a][b])) continue; q.push([a, b]); } }
      let open = 0, miss = 0, adv = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const t = G.map[x][y]; if (t===T_WALL) continue; open++; if (!seen.has(x + ',' + y)) miss++; if (t===advanceTile()) adv++; }
      const top = d >= mx; if (miss || adv!==1 || (top && !G.genRooms.some(r=>r.k==='throne'))) out.bad.push({ mx, d, miss, adv, rooms:G.genRooms.length }); if (rep===0 && (d===1 || d===mx || d===2)) out.maps.push('max ' + mx + ' floor ' + d + ' rooms ' + G.genRooms.map(r=>r.k).join(',') + String.fromCharCode(10) + txt()); }
    return out; });
  console.log(JSON.stringify({ made:r.made, fallback:r.fallback, bad:r.bad.slice(0, 6), kinds:r.kinds })); if (process.env.ZMAP) for (const m of r.maps.slice(0, +process.env.ZMAP)) console.log(m);
  if (r.bad.length) throw new Error('bad castle floors ' + r.bad.length);
};
