// RS-405: a dungeon you've been away from for a day of the game's clock is laid out afresh when you go back in - new rooms,
// foes and loot - while one you left a little while ago is just as you left it, your gravestone stays, and the floors' time
// goes in the save
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON && G.ow.dungeonMax[x][y] >= 2){ dx=x; dy=y; break; }
    const P = G.player; P.clock = DAY_LENGTH*3 + DAY_LENGTH*0.4;
    const enter = ()=>{ G.gameMode = 0; G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); };
    const sig = ()=>G.map.map(c=>c.join('')).join('|') + '#' + G.mon.map(m=>m.nm+m.x+','+m.y).join(',');
    enter(); const slot = G.dungeonSlot, s1 = sig();
    // a gravestone of yours on this floor
    P.graves = P.graves || []; P.graves.push({ x:dx, y:dy, items:[], gold:5, dg:{ slot, d:1, x:G.genStart.x, y:G.genStart.y } });
    dgFinish(true); out.clk = G.dgCache[slot+'_1'] && G.dgCache[slot+'_1'].clk;
    out.coded = dgCacheDecode(dgCacheEncode())[slot+'_1'].clk === out.clk;
    // back soon: the same
    P.clock += DAY_LENGTH*0.5; enter(); out.sameSoon = sig()===s1; dgFinish(true);
    // a day later: new
    P.clock += DAY_LENGTH*1.05; enter(); out.newLater = sig()!==s1; out.foes = G.mon.filter(m=>m.alive).length;
    out.grave = P.graves.some(g=>g.dg && g.dg.slot===slot); dgGraveSync(); out.graveDeco = P.graves.filter(g=>g.dg && g.dg.slot===slot).every(g=>G.dungeonDeco[g.dg.x][g.dg.y]==='pgrave');
    dgFinish(true);
    // an old save's floors (no time on them) are kept
    for (const k of Object.keys(G.dgCache)) G.dgCache[k].clk = null; const s2 = (()=>{ enter(); return sig(); })(); dgFinish(true);
    for (const k of Object.keys(G.dgCache)) G.dgCache[k].clk = null; P.clock += DAY_LENGTH*3; enter(); out.oldKept = sig()===s2;
    return out;
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(typeof r.clk==='number' && r.coded, 'a floor keeps the clock time it was left at, in the save too');
  A(r.sameSoon, 'back after half a day: the same floor');
  A(r.newLater && r.foes > 0, 'back after a day: a fresh floor with foes in it');
  A(r.grave && r.graveDeco, 'your gravestone stays, on the new floor');
  A(r.oldKept, 'floors from before RS-405 are kept');
};
