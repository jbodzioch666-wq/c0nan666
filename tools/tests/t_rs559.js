// RS-559: the stone's materials. Walls and floors below ground go through fpWorn (hairline cracks, patches worn darker, moss in
// the joints where the place is damp); every stone material carries a specular map from its own height (the faces catch the
// light, the mortar and cracks don't); and the floors of the catacombs, the sunken temples and the swamps are wet - a sheen
// gathering in the low places. Out of doors the generators are untouched
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    /* the wear itself, on a plain generator: cracks darken a few points, moss greens the joints only when damp */
    const base = fpBricks({ base:[132,128,124], mc:[46,44,44], rows:4, cols:2, seed:11 }), wornDry = fpWorn(base, 11), wornDamp = fpWorn(base, 11, { damp:0.5 });
    let dark = 0, green = 0, greenDry = 0, n = 0; for (let y=0;y<64;y+=0.5) for (let x=0;x<64;x+=0.5){ const a = base(x, y), b = wornDry(x, y), c = wornDamp(x, y); n++; if (b[0] < a[0]*0.6) dark++; if (c[1] > c[0]*1.2 && c[1] > a[1]) green++; if (b[1] > b[0]*1.2 && b[1] > a[1]) greenDry++; }
    out.wear = { dark:+(dark/n).toFixed(4), green:+(green/n).toFixed(4), greenDry:+(greenDry/n).toFixed(4) };
    const go = async (want, depth)=>{ G.gameMode = 0; let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===want){ dx = x; dy = y; break; }
      G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = []; if (depth > 1){ loadLevel(depth, false); G.mon = []; } for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    await go(OW_GRAVEYARD, 2); const mats = {}; FPD.world.traverse(o=>{ if (o.isMesh && o.material && o.material.isMeshPhongMaterial) for (const k in FPD.mats) if (FPD.mats[k]===o.material) mats[k] = o.material; });
    const f0 = mats['catacomb:f0'], w0 = mats['catacomb:wall2']; out.crypt = { floorSpec:!!(f0 && f0.specularMap), floorShine:f0 ? f0.shininess : null, floorSpecK:f0 ? +f0.specular.r.toFixed(2) : null, wallSpec:!!(w0 && w0.specularMap), wallShine:w0 ? w0.shininess : null, keys:Object.keys(mats).length };
    await go(OW_DUNGEON, 1); const d0 = FPD.mats['dungeon:f0']; out.dungeon = { floorShine:d0 ? d0.shininess : null, floorSpecK:d0 ? +d0.specular.r.toFixed(2) : null, spec:!!(d0 && d0.specularMap) };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.wear.dark > 0.002 && r.wear.dark < 0.08, 'a few cracks, not a shattered wall: ' + r.wear.dark);
  A(r.wear.green > 0.01 && r.wear.greenDry < 0.001, 'moss in the joints only where it is damp: ' + r.wear.green + ' / ' + r.wear.greenDry);
  A(r.crypt.floorSpec && r.crypt.floorShine >= 60 && r.crypt.floorSpecK > 0.3, 'the catacomb floor is wet, with a sheen in the low places');
  A(r.crypt.wallSpec, 'the walls carry a specular map');
  A(r.dungeon.floorShine < 60 && r.dungeon.floorSpecK < 0.3 && r.dungeon.spec, 'a dry dungeon floor is matte, its faces catching a little light');
};
