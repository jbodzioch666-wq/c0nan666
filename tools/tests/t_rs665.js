// RS-665: no risk window when you step onto a dungeon. Every kind of site takes you straight in at the standard risk (a barrow by
// its walk-in first); the prompt never opens.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = { kinds:{} }; p.wildWarned = 1; p.clock = 100; let prompts = 0; const su = window.setUi; window.setUi = function(n){ if (n==='dungeonPrompt') prompts++; return su.apply(this, arguments); };
    const m = G.ow.map, W = m.length, H = m[0].length, home = { ...G.owPos };
    for (const t of [OW_DUNGEON, OW_GRAVEYARD, OW_MINE, OW_CASTLE, OW_TEMPLE, OW_NECROTOWER, OW_PYRAMID]){
      let done = false;
      for (let x=1;x<W-1 && !done;x++) for (let y=1;y<H-1 && !done;y++){ if (m[x][y]!==t) continue;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const q = owNb(x, y, dx, dy); if (!q) continue;
          G.gameMode = 0; G.ui = 'playing'; O3.doorWalk = null; G.owPos = { x:q[0], y:q[1] }; tryMoveOverworld(-dx, -dy); if (G.owPos.x!==x || G.owPos.y!==y) continue;
          out.kinds[t] = { ui:G.ui, mode:G.gameMode, walk:!!O3.doorWalk, mod:G.dungeonModifier||null }; done = true; break; } } }
    window.setUi = su; out.prompts = prompts; G.gameMode = 0; G.owPos = home; setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(Object.keys(r.kinds).length >= 3, 'several kinds of site reached');
  A(r.prompts===0, 'the risk window never opened');
  for (const [t, k] of Object.entries(r.kinds)) A(k.ui!=='dungeonPrompt' && (k.mode===1 || k.walk) && !k.mod, 'straight in at the standard risk (tile ' + t + '): ' + JSON.stringify(k));
};
