// RS-213: pyramids in the desert - placed in a new world, entered like any site, floored with their own layout and
// theme, peopled by the tomb family with 3D models for every creature, and bossed by the risen pharaoh or a god of the old lore
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const pyr = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_PYRAMID) pyr.push([x, y, G.ow.dungeonMax[x][y], G.ow.dungeonIdx[x][y]]);
    out.n = pyr.length; out.max = MAX_SITE_SLOT; out.genVer = G.ow.genVer;
    A(pyr.length >= 1 && pyr.length===NPYRAMID, 'pyramids placed: '+pyr.length+' of '+NPYRAMID);
    A(pyr.every(p=>p[2] >= 3 && p[2] <= 6 && p[3] > MAX_SITE_SLOT - NPYRAMID && p[3] <= MAX_SITE_SLOT), 'each has 3-6 floors and a slot after the older kinds '+JSON.stringify(pyr));
    out.desert = pyr.filter(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>G.ow.map[x+dx] && G.ow.map[x+dx][y+dy]===OW_DESERT)).length;
    A(owSiteKind(OW_PYRAMID)==='pyramid' && SITE_KIND_TILE.pyramid===OW_PYRAMID && OW_SITE_TILES.includes(OW_PYRAMID), 'the tile is a site');
    A(SITE_ART[OW_PYRAMID] && PM_SITE_BRIGHT[OW_PYRAMID] && EXAMINE_OW[OW_PYRAMID] && O3_SITE_NAME[OW_PYRAMID] && OW_SITE_NAME[OW_PYRAMID] && SITE_TITLE.pyramid && SITE_POWER.pyramid && HISTORY_TITLES.pyramid, 'every site table has a row');
    // in
    const [px, py] = pyr[0]; G.gameMode = 0; G.owPos = { x:px, y:py }; G.pendingDungeon = { x:px, y:py }; enterDungeonConfirm(); setUi('playing');
    A(G.siteKind==='pyramid' && G.gameMode===1, 'entered as a pyramid');
    A(fpTheme().key==='pyramid', 'its own theme');
    // (RS-214) hieroglyphs painted on both walls: a good share of pixels carry pigment, in more than one colour
    { const spec = FP_THEME_SPECS.pyramid; for (const [k, mode] of [['wall','a'],['wall2','cartouche']]){ let n = 0, blue = 0, red = 0; const M = fpGlyphMask(mode);
        for (let i=0;i<M.N*M.N;i+=7){ if (M.m[i] > 50){ n++; if (M.ch[i]===0) blue++; if (M.ch[i]===1) red++; } }
        out['glyph_'+k] = [n, blue, red]; A(n > 1000 && blue > 200 && red > 200, k+' carries painted signs '+JSON.stringify([n, blue, red]));
        const c = spec[k](20, 30); A(Array.isArray(c) && c.length >= 3, k+' still paints stone'); } }
    let adv = 0, altar = 0, idols = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.map[x][y]===advanceTile()) adv++; if (G.dungeonDeco[x][y]==='altar') altar++; if (G.dungeonDeco[x][y]==='idol') idols++; }
    A(adv===1 && altar===1 && idols===2, 'the burial hall layout '+JSON.stringify([adv, altar, idols]));
    const names = G.mon.map(m=>m.nm); out.mon = names;
    A(names.length && names.every(n=>FAM_BY_NAME[n]==='tomb'), 'every creature is a tomb dweller: '+names.join(', '));
    A(PYRAMID_SKIN.length===20 && PYRAMID_SKIN.every(e=>e.nm && e.art && e.rgb), 'a creature for every level');
    // the save carries it
    saveCurrentGame(); loadGame(G.saveId); A(G.siteKind==='pyramid' && G.gameMode===1, 'back in the pyramid after a reload');
    // a model for every one of them, and for the bosses
    const meshCount = nm=>{ const m = { nm, undead:/mummy|pharaoh/.test(nm) }, pt = m3dPortrait(m); if (!pt) return -1; const e = m3dInstance(m, pt); let n = 0; e.holder.traverse(o=>{ if (o.isMesh) n++; }); return n; };
    out.models = {}; for (const nm of TOMB_TIERS.map(t=>t[0]).concat(['risen pharaoh','Apep','Ammit'])){ out.models[nm] = meshCount(nm); A(out.models[nm] > 3, nm+' has a model: '+out.models[nm]); }
    // the boss floor: the pharaoh, or one of the gods
    saveLevelCache(G.depth); loadLevel(G.dungeonMaxDepth, false); setUi('playing');
    const boss = G.mon[G.bossIdx]; out.boss = boss && boss.nm;
    A(G.isBossFloor && boss && ['risen pharaoh','Apep','Ammit'].includes(boss.nm), 'the boss is the pharaoh or a god: '+out.boss);
    A(NAMED_BOSSES.apep.where==='pyramids' && bestWhere('tomb jackal')==='pyramids', 'the bestiary knows where they live');
    for (const k of ['apep','ammit']) for (const u of NAMED_BOSSES[k].uniques){ const n0 = G.inv.length; u[1](); A(G.inv.length===n0+1, k+' unique drops: '+u[0]); }
    // the land model and the map badge
    O3.flames = O3.flames || []; O3.glows = O3.glows || []; O3.smoke = O3.smoke || []; const g = o3Site(OW_PYRAMID, px, py); let gm = 0; g.traverse(o=>{ if (o.isMesh) gm++; }); A(gm >= 8, 'a pyramid stands on the land: '+gm);
    G.gameMode = 0; G.bestTab = 'bosses'; setUi('bestiary'); A(document.getElementById('overlay').textContent.includes('Apep') && document.getElementById('overlay').textContent.includes('Ammit'), 'the bosses tab lists them'); setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
};
