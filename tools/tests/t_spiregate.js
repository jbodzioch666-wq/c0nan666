// RS-359: walking onto a site's tile that a quest led you to brings up the quest's own arrival instead of the site's plain
// dungeon prompt, which used to swallow it (RS-665: no prompt now - straight in) (the Black Spire's knight's floor never showed). Here: the graveyard watch of
// the Waking Lich II, at night. By day the night-only watch still gets the prompt, and with no quest the prompt as before.
// (RS-360 made the Spire itself a landmark - see t_spire)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, p = G.player; G.gameMode = 0; p.wildWarned = 1;
    sqP().lich2 = { step:1, state:'active', flags:{}, log:[], loc:{}, n:0, started:0, home:curTownKey() || (G.owPos.x+','+G.owPos.y) };
    const L = sqResolve('lich2', SQ.lich2.steps[1]); out.tile = G.ow.map[L.x][L.y]; out.isSite = OW_SITE_TILES.includes(out.tile);
    const arrive = ()=>{ for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){ G.owPos = { x:L.x+dx, y:L.y+dy }; G.ui = 'playing'; G.wevDlg = null; tryMoveOverworld(-dx, -dy); if (G.owPos.x===L.x && G.owPos.y===L.y) return true; } return false; };
    // by day: the prompt, as before
    p.clock = 100; out.dayArrived = arrive(); out.uiDay = G.ui; out.dayIn = G.gameMode===1; G.gameMode = 0; setUi('playing');
    // by night: the quest takes the arrival
    p.clock = 10; out.nightArrived = arrive(); out.uiNight = G.ui; out.nightIn = G.gameMode===1; sqFrame(); out.uiFrame = G.ui; out.dlg = G.wevDlg ? G.wevDlg.title : null;
    if (G.wevDlg && G.ui==='wevent') G.wevDlg.opts[0][1](); out.stepAfter = sqP().lich2.step; out.uiAfter = G.ui; setUi('playing');
    // with no quest here: the prompt
    sqP().lich2.state = 'abandoned'; out.plain = arrive(); out.uiPlain = G.ui; out.plainIn = G.gameMode===1; G.gameMode = 0; setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.isSite && r.dayArrived && r.dayIn, 'by day the night-only watch lets you straight in (RS-665: no prompt)');
  A(r.nightArrived && !r.nightIn && r.uiFrame==='wevent' && /Graveyard Watch/.test(r.dlg||''), 'by night the quest takes the arrival, not the dungeon prompt');
  A(r.stepAfter===2 && r.uiAfter==='wevent', 'going on reaches the ghost-knight\'s choice');
  A(r.plain && r.plainIn, 'with no quest here you go straight in');
};
