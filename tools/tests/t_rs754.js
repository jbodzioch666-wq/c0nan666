// RS-754: a plain dungeon matches its land (owBiomeOf: a rarer biome if it lies in one, else the most of its neighbours' land). Inside, its
// stone, floor, light, mist and dressing are the biome's (dgThemeKey -> FP_THEME_SPECS dg*, DRESS_KITS); outside, the barrow's mound and
// stones are (O3_BARROW_SKIN); no water or roots in a dry land's (dripN, wetN, dgRoomPurpose): a barrow ringed by desert is sandstone under sand, in and out; one in grassland is as it was
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45; const m = G.ow.map, out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON && OW_LAND_KEY[m[s.x][s.y+1]]);
    if (sites.length < 2) return { none:true };
    const [d, g] = sites;
    /* the biome by the land round it, a rarer biome first */
    for (const [dx, dy] of DIR8){ const q = owNb(d.x, d.y, dx, dy); if (q && OW_LAND_KEY[m[q[0]][q[1]]]) m[q[0]][q[1]] = OW_DESERT; } G.ow.bio[d.y*OW_COLS + d.x] = 0;
    for (const [dx, dy] of DIR8){ const q = owNb(g.x, g.y, dx, dy); if (q && OW_LAND_KEY[m[q[0]][q[1]]]) m[q[0]][q[1]] = OW_GRASS; } G.ow.bio[g.y*OW_COLS + g.x] = 0;
    out.bioD = owBiomeOf(d.x, d.y); out.bioG = owBiomeOf(g.x, g.y);
    G.ow.bio[g.y*OW_COLS + g.x] = 2; out.bioJ = owBiomeOf(g.x, g.y); G.ow.bio[g.y*OW_COLS + g.x] = 0;
    out.map = { tundra:DG_BIOME_THEME.tundra, highland:DG_BIOME_THEME.highland, grass:DG_BIOME_THEME.grass || 'dungeon' };
    /* inside */
    const inside = async s=>{ G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<6;i++){ renderGame(); await fr(2); }
      const T = fpTheme(), deco = {}; for (const c of G.dungeonDeco) for (const k of c) if (k) deco[k] = (deco[k]||0) + 1; return { key:T.key, amb:fpEnv().amb, mist:T.mist, deco }; };
    out.inD = await inside(d); out.inG = await inside(g);
    /* outside: the barrow's mound and stones */
    const outside = async s=>{ G.gameMode = 0; setUi('playing'); const q = owNb(s.x, s.y, 0, 1); G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); O3.win = null; await fr(150);
      let grp = null; O3.scene.traverse(o=>{ if (o.barrowBio && o.doorLintel){ const w = new THREE.Vector3(); o.getWorldPosition(w); const L = o3L(s.x, s.y); if (L && Math.abs(w.x - (L[0] + 0.5)) < 1.2 && Math.abs(w.z - (L[1] + 0.5)) < 1.2) grp = o; } });
      if (!grp) return { found:false }; const maps = new Set(), rocks = new Set(); grp.traverse(o=>{ if (o.isMesh && o.material){ if (o.material.map) maps.add(o.material.map); if (o.material.flatShading) rocks.add(o.material); } });
      return { found:true, bio:grp.barrowBio, sand:maps.has(v3TexSand(O3.tex)), turf:maps.has(v3TexTurf(O3.tex)), rockOwn:[...rocks].some(x=>x!==o3Mats().rock), rockOld:[...rocks].some(x=>x===o3Mats().rock) }; };
    out.outD = await outside(d); out.outG = await outside(g);
    return out; });
  console.log(JSON.stringify(r));
  A(!r.none, 'two barrows near the start');
  A(r.bioD==='desert' && r.bioG==='grass' && r.bioJ==='jungle', 'the biome: the land round it, a rarer biome first: ' + JSON.stringify([r.bioD, r.bioG, r.bioJ]));
  A(r.map.tundra==='dgFrost' && r.map.highland==='dgFrost' && r.map.grass==='dungeon', 'the cold lands share the frost: ' + JSON.stringify(r.map));
  A(r.inD.key==='dgDesert' && r.inD.amb.join()==='0.05,0.04,0.028' && r.inD.mist===0xd8c098 && !r.inD.deco.moss && !r.inD.deco.cobweb && !r.inD.deco.flood && !r.inD.deco.puddle && !r.inD.deco.drip && !r.inD.deco.roots, 'a desert dungeon is sandstone, warm and dry inside: ' + JSON.stringify(r.inD));
  A(r.inG.key==='dungeon' && r.inG.amb.join()==='0.03,0.036,0.05' && !r.inG.mist, 'a grassland one as it was: ' + JSON.stringify(r.inG));
  A(r.outD.found && r.outD.bio==='desert' && r.outD.sand && !r.outD.turf && r.outD.rockOwn && !r.outD.rockOld, "the desert barrow's mound is sand, its stones sandstone: " + JSON.stringify(r.outD));
  A(r.outG.found && r.outG.bio==='grass' && r.outG.turf && !r.outG.sand && r.outG.rockOld, 'the grassland barrow as it was: ' + JSON.stringify(r.outG));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
