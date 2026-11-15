// RS-558: bloom tuned per site. Each underground grade carries its own threshold (th: how bright a thing must be to bleed light)
// and blur width (bw); the bright pass and the blur take them from the eased grade, and above ground the old 0.8 and 1.4 stay
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    for (const k of ['dungeon', 'mine', 'crypt', 'sunken', 'castle', 'pyramid', 'lair']){ const g = GFX_GRADES[k]; if (g.th===undefined || g.bw===undefined) out.missing = k; }
    out.fields = GFX_GRADES.fields.th===undefined;
    const go = async (want, depth)=>{ G.gameMode = 0; let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===want){ dx = x; dy = y; break; }
      G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; if (depth > 1){ loadLevel(depth, false); G.mon = []; } for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    await go(OW_GRAVEYARD, 2); const P = GFXP.get(FPD.r); out.crypt = { key:gfxGradeKey('fpd'), th:+P.bright.uniforms.th.value.toFixed(3), g:+GFX.grade.fpd.th.toFixed(3), bw:+GFX.grade.fpd.bw.toFixed(2) };
    await go(OW_DUNGEON, 1); out.dungeon = { key:gfxGradeKey('fpd'), th:+P.bright.uniforms.th.value.toFixed(3), bw:+GFX.grade.fpd.bw.toFixed(2) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.missing && r.fields, 'every underground grade has its own bloom threshold and width; the open land keeps the default');
  A(r.crypt.key==='crypt' && Math.abs(r.crypt.th - 0.84) < 0.02 && r.crypt.bw > 1.9, 'the catacombs bloom soft and wide');
  A(r.dungeon.key==='dungeon' && r.dungeon.th > 0.88 && r.dungeon.bw < 1.6, 'a dry dungeon blooms tight, only its true lights');
};
