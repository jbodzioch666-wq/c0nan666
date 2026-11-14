// RS-406: a dungeon's floors stay as you left them until you clear it - every site you've walked, not just the three most
// recent (a fourth site used to reset the oldest one on the next save), through saving and loading the game; time away
// doesn't reset them
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const sites = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON && G.ow.dungeonMax[x][y] >= 1) sites.push([x, y]);
    const sig = ()=>G.map.map(c=>c.join('')).join('|') + '#' + G.mon.map(m=>m.nm+m.x+','+m.y).join(',');
    const enter = ([x, y])=>{ G.gameMode = 0; G.owPos = { x, y }; G.pendingDungeon = { x, y }; enterDungeonConfirm(); setUi('playing'); };
    const seen = {}, pick = [];
    for (const s of sites){ if (pick.length >= 5) break; const sl = G.ow.dungeonIdx[s[0]][s[1]]; if (seen[sl]) continue; seen[sl] = 1; pick.push(s); }
    const first = {};
    for (const s of pick){ enter(s); first[s] = sig(); dgFinish(true); }
    G.player.clock = (G.player.clock||0) + DAY_LENGTH*5;   // a long time away
    saveCurrentGame(); const id = G.saveId; G.dgCache = {}; loadGame(id); setUi('playing');
    const out = { n:pick.length, kept:Object.keys(G.dgCache).length, same:[] };
    for (const s of pick){ enter(s); out.same.push(sig()===first[s]); dgFinish(true); }
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n >= 4, 'at least four dungeons to walk');
  A(r.kept >= r.n && r.same.every(Boolean), 'every uncleared dungeon is just as you left it, after a save, a load and days away');
};
