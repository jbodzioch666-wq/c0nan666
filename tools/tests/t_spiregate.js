// RS-359: walking onto the Black Spire's tile with the quest's "go to" step live brings up the quest's arrival, the knight's
// floor and then the Spire itself - not the necro tower's plain dungeon prompt, which used to swallow the arrival so the
// quest could never be finished. Any quest site works the same; without a quest the prompt opens as before
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player; p.clock = 100; G.gameMode = 0;
    sqP().lich8 = { step:1, state:'active', flags:{}, log:[], loc:{}, n:0, started:0, home:curTownKey() || (G.owPos.x+','+G.owPos.y) };
    const L = sqResolve('lich8', SQ.lich8.steps[1]); out.spireTile = G.ow.map[L.x][L.y]; out.isTower = [OW_NECROTOWER, OW_CASTLE].includes(out.spireTile);
    // step onto it from a neighbour that can be stood on
    const arrive = ()=>{ for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){ G.owPos = { x:L.x+dx, y:L.y+dy }; G.ui = 'playing'; tryMoveOverworld(-dx, -dy); if (G.owPos.x===L.x && G.owPos.y===L.y) return true; } return false; };
    out.arrived = arrive(); out.uiAfterStep = G.ui;
    sqFrame(); out.uiAfterFrame = G.ui; out.dlg = G.wevDlg ? G.wevDlg.title : null;
    if (G.wevDlg) G.wevDlg.opts[0][1](); out.uiPuzzle = G.ui; out.kind = G.sqPz ? G.sqPz.kind : null;
    // across the floor and into the Spire
    if (G.sqPz){ const z = G.sqPz, prev = new Map([[0, null]]), q = [0]; while (q.length){ const c = q.shift(); if (c===z.goal) break; for (const n of sqKnightMoves(c)) if (!prev.has(n) && !z.crack.includes(n)){ prev.set(n, c); q.push(n); } }
      const path = []; let c = z.goal; while (c!==0){ path.unshift(c); c = prev.get(c); } for (const k of path) if (G.sqPz) sqPzKnight(k); }
    out.inSpire = G.gameMode===1 && G.dungeonMaxDepth >= 6 && G.dungeonEntrance && G.dungeonEntrance.x===L.x && G.dungeonEntrance.y===L.y;
    // leave, come back: the tower's prompt opens, and the tower is now the six-floor Spire with the Wakener on top
    G.gameMode = 0; G.mon = []; G.isBossFloor = 0; setUi('playing'); out.stepNow = sqStep('lich8').k;
    out.back = arrive(); out.uiBack = G.ui; out.deep = G.ow.dungeonMax[L.x][L.y]; setUi('playing');
    // no quest here: the tower's prompt as before
    sqP().lich8.state = 'abandoned'; out.plain = arrive(); out.uiPlain = G.ui; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.isTower && r.arrived, 'the Spire is a tower tile you can step onto');
  A(r.uiAfterStep!=='dungeonPrompt' && r.uiAfterFrame==='wevent' && /Black Spire/.test(r.dlg||''), 'the quest takes the arrival, not the dungeon prompt');
  A(r.uiPuzzle==='sqpuzzle' && r.kind==='knight' && r.inSpire, 'the knight\'s floor, then six floors of Spire');
  A(r.stepNow==='spire' && r.back && r.uiBack==='dungeonPrompt' && r.deep >= 6, 'coming back, the tower is the six-floor Spire');
  A(r.plain && r.uiPlain==='dungeonPrompt', 'with no quest here the tower\'s prompt opens as before');
};
