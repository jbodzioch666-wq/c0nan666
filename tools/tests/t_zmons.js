// (art probe, not in ALL) a few creatures stood round you on a dungeon floor, for a close look: shots/zmons.png. ZMONS='["wolf",...]'
module.exports = async page=>{
  const names = process.env.ZMONS ? JSON.parse(process.env.ZMONS) : ['wolf', 'goblin warrior', 'giant spider', 'troll', 'skeleton warrior', 'red dragon wyrmling'];
  const r = await page.evaluate(async names=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } } p.x = best[0]; p.y = best[1]; }
    for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++){ G.map[p.x+i][p.y+j] = T_FLOOR; G.dungeonDeco[p.x+i][p.y+j] = ''; }
    const at = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
    names.forEach((nm, i)=>{ const m = newMonster(); Object.assign(m, { alive:1, x:p.x+at[i][0], y:p.y+at[i][1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm, col:'#8f8', art:null, abilities:[] }); if (/skelet|ghost|zombie/.test(nm)) m.undead = true; G.mon.push(m); });
    O3.dist = 7; if (typeof FPD!=='undefined') FPD.distK = 0.7; FPD.mapRef = null; const t0 = performance.now(); while (performance.now() - t0 < 25000){ renderGame(); await new Promise(r=>setTimeout(r, 30)); if (G.mon.every(m=>M3D.inst.get(m)) && !FPD.warmWait && !FPD.prep && performance.now() - t0 > 4000) break; }
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    return { have:G.mon.map(m=>[m.nm, !!M3D.inst.get(m)]) }; }, names);
  console.log(JSON.stringify(r)); await page.screenshot({ path: SHOTS + '/zmons.png' });
};
