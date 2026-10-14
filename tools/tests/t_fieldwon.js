// RS-382: a fight on the open land doesn't end the moment the last foe falls. You stay on the field (the win is paid once)
// and walk off its edge when ready - an ambush's sealed edge opens too. A field with no edge you can reach gets a portal
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player; p.hp = p.maxHp = 9999; const out = {};
    const frames = async n=>{ for (let i=0;i<n;i++){ frameLoop(performance.now()); await new Promise(r=>setTimeout(r, 20)); } };
    const kill = ()=>{ for (const m of G.mon){ m.alive = 0; m.hp = 0; } };
    // an ambush: sealed while a foe stands, open once they are all down
    randomEncounter(true); setUi('playing'); await frames(2);
    out.mandatory = G.mandatoryFight && G.mon.some(m=>m.alive);
    { const g0 = p.gold; kill(); await frames(4); out.stay = G.gameMode===2 && G.fieldWon; await frames(4); out.paidOnce = p.gold; }
    // walk to the edge: step west until off the field
    { let n = 0; while (G.gameMode===2 && n++ < 40){ tryMove(-1, 0); } out.left = G.gameMode===0; out.steps = n; }
    // a field with no way out: walls all round - a portal opens, and stepping on it takes you out
    randomEncounter(false); setUi('playing'); await frames(2);
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_FLEE) G.map[x][y] = T_WALL;
    kill(); await frames(3);
    out.portal = !!G.fieldPortal && G.map[G.fieldPortal[0]][G.fieldPortal[1]]===T_EXIT && G.gameMode===2;
    if (G.fieldPortal){ const [x, y] = G.fieldPortal; const dx = Math.sign(x - p.x), dy = Math.sign(y - p.y); let n = 0; while (G.gameMode===2 && n++ < 30){ const ex = Math.sign(G.fieldPortal ? G.fieldPortal[0] - p.x : 0), ey = Math.sign(G.fieldPortal ? G.fieldPortal[1] - p.y : 0); tryMove(ex, ex ? 0 : ey); } out.portalOut = G.gameMode===0; }
    // an ordinary field with its edges keeps them: no portal
    randomEncounter(false); setUi('playing'); await frames(2); kill(); await frames(3); out.noPortal = !G.fieldPortal && G.gameMode===2;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mandatory, 'an ambush starts sealed');
  A(r.stay, 'the field stays open when every foe is down');
  A(r.left, 'walking off the edge of a won ambush takes you back to the open land');
  A(r.portal && r.portalOut, 'a field with no way out gets a portal, and it takes you out');
  A(r.noPortal, 'a field with its edges gets no portal');
};
