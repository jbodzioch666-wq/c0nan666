module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); setUi('playing');
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync(); G.player.hp = effMaxHp();
    let dx=-1, dy=-1;
    for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.pendingDungeon = {x:dx, y:dy}; enterDungeonConfirm();
    slayerAssign();
    const stats = { kills:0, turns:0, floors:0, errs:[] };
    for (let d=1; d<=10; d++){
      try { loadLevel(d, false); } catch(e){ stats.errs.push('load '+d+' '+e.message); continue; }
      stats.floors++;
      for (let t=0;t<150;t++){
        G.player.hp = effMaxHp(); G.ui = 'playing';
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]], [a,b] = dirs[Math.floor(Math.random()*4)];
        try { tryMove(a,b); stats.turns++; } catch(e){ stats.errs.push('move '+e.message); break; }
        if (G.gameMode!==1){ break; }
      }
      if (G.gameMode!==1) { G.gameMode = 1; loadLevel(d, false); }
      for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive){ try { monsterDies(i); stats.kills++; } catch(e){ stats.errs.push('die '+e.message); } }
      if (!G.player.slay.task) slayerAssign();
    }
    stats.slayer = skLvl('slayer'); stats.done = G.player.slay.done; stats.tokkul = G.player.cur.tokkul;
    stats.contracts = tkP().contracts.daily.map(t=>tkText(t)+' '+tkProg(t)+'/'+t.need);
    saveCurrentGame();
    return stats;
  });
  console.log(JSON.stringify(r, null, 1));
  if (r.errs.length) throw new Error('errors in soak');
  // reload the save
  const r2 = await page.evaluate(()=>{ const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); return { ok:!!G.player, slay:G.player.slay && G.player.slay.done, cur:G.player.cur }; });
  console.log(JSON.stringify(r2));
};
