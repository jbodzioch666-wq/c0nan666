// (probe, not in ALL) which generator a new world really gets, each way you can start one, and what it looks like by the numbers
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {};
    const stat = ()=>{ const W = OW_COLS, H = OW_ROWS, M = G.ow.map; let land = 0, mtn = 0, riv = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = M[x][y]; if (t!==OW_WATER) land++; if (t===OW_MOUNTAIN) mtn++; if (t===OW_RIVER) riv++; }
      return { ver:G.ow.genVer, size:W + 'x' + H, cont:wgContinent(), mtn:+(100*mtn/land).toFixed(1), riv:+(100*riv/land).toFixed(1), gen11:!!G.ow.gen11, ui:G.ui }; };
    goToCharCreate(); ccBegin(); out.ccBegin = stat();
    if (G.ui==='worldPreview'){ try{ wgRegenerate(Math.floor(Math.random()*4294967295)); out.reroll = stat(); }catch(e){ out.reroll = String(e); } confirmWorldPreview(); }
    setUi('playing'); out.playing = stat();
    out.version = GAME_VERSION; return out; });
  console.log(JSON.stringify(r, null, 1));
};
