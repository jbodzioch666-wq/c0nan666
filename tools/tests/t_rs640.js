// RS-640: a Planet's spacing set to the other sizes' (tools/sim/s_world): as many roaming groups to its land as the medium world has
// (some 237 tiles of land to each, up to 150), and generator 18 trims its dungeons, graveyards and mines to a site per 160 tiles of land
// or more; a generator 17 planet keeps its counts; the medium world keeps its 50 roamers
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(()=>{ const out = {}; goToCharCreate(); ccBegin();
    const count = ()=>{ const cube = owCube(); let land = 0, sites = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (cube && cubeFace(x, y) < 0) continue; const t = G.ow.map[x][y]; if (t!==OW_WATER) land++; if (OW_SITE_TILES.includes(t) && t!==OW_TOWN) sites++; } return { land, sites, enc:(G.ow.encounters||[]).length, target:owEncTarget(), nd:NDUNGEONS }; };
    setWorldSizeTier('medium'); wgRegenerate(777); out.medium = count();
    setWorldSizeTier('planet'); G.ow.genVer = 17; wgRegenerate(777); out.p17 = count(); G.ow.genVer = OW_GEN_VER;
    wgRegenerate(777); out.p18 = Object.assign(count(), { ver:G.ow.genVer });
    out.p18.perEnc = Math.round(out.p18.land/Math.max(1, out.p18.target)); out.p18.perSite = Math.round(out.p18.land/Math.max(1, out.p18.sites));
    /* saved and loaded back: the same counts, the same slots (the spire's is the last but one) */
    confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; const key = pmMapKey(), slots = [NDUNGEONS, MAX_SITE_SLOT];
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    out.load = { same:pmMapKey()===key, ver:G.ow.genVer, slots:[NDUNGEONS, MAX_SITE_SLOT], was:slots, target:owEncTarget() };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.medium.target===50 && r.medium.enc <= 50, 'the medium world keeps its 50 roamers');
  A(r.p18.ver===18 && r.p18.target > 100 && r.p18.target <= 150 && r.p18.perEnc > 200 && r.p18.perEnc < 280, 'a planet has as many roamers to its land as the medium world');
  A(r.p18.enc > 80, 'and they are out on its land');
  A(r.p18.perSite >= 160, 'a planet\'s sites spaced like the other sizes\'');
  A(r.p17.nd > r.p18.nd, 'a generator 17 planet keeps its site counts');
  A(r.load.same && r.load.ver===18 && r.load.slots.join()===r.load.was.join() && r.load.target===r.p18.target, 'loaded back, the same world and its counts');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
