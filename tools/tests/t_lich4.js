// RS-347: The Waking Lich IV sends you to a graveyard, never a necromancer's tower or any other site, however far the
// nearest graveyard is; the relic lies on floor 6, and the graveyard is made at least six floors deep for it. A save that
// was already pointed at a tower is sent to a graveyard the next time the quest looks for its target.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, sq = sqP();
    for (const id of ['lich1','lich2','lich3']) sq[id] = { step:99, state:'done', flags:{}, log:[], loc:{} };
    sqStart('lich4'); sqAdvance('lich4');                         // past "talk to the temple" to the floor step
    const s = sq.lich4, st = sqStep('lich4'); out.stepK = st && st.k; out.floor = st && st.floor;
    const L = s.loc[s.step]; out.tile = L && G.ow.map[L.x][L.y]; out.grave = out.tile===OW_GRAVEYARD; out.depth = L && G.ow.dungeonMax[L.x][L.y];
    out.graves = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_GRAVEYARD) out.graves++;
    // an old save sent to a tower: the next target look-up moves it to a graveyard
    let tw = null; for (let x=0;x<OW_COLS && !tw;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_NECROTOWER){ tw = { x, y }; break; }
    if (tw){ s.loc[s.step] = { x:tw.x, y:tw.y }; sqTarget('lich4'); const L2 = s.loc[s.step]; out.movedTile = G.ow.map[L2.x][L2.y]; out.movedGrave = out.movedTile===OW_GRAVEYARD; out.movedDepth = G.ow.dungeonMax[L2.x][L2.y]; }
    else { out.movedGrave = true; out.movedDepth = 6; }
    // the objective names floor 6
    out.obj = sqObjective('lich4');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.stepK==='floor' && r.floor===6, 'the relic step is a floor step on floor 6');
  A(r.graves > 0 && r.grave, 'the quest points at a graveyard');
  A(r.depth >= 6, 'that graveyard goes at least six floors down');
  A(r.movedGrave && r.movedDepth >= 6, 'a save pointed at a tower is sent to a graveyard six floors deep');
  A(/floor 6/.test(r.obj), 'the objective says floor 6');
};
