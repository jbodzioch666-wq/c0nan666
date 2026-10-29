// RS-755: a plain dungeon's folk are its land's - each floor picks its two families (famForFloor, G.floorFams) from MON_ECOSYS by its
// theme (dgThemeKey): a barrow ringed by desert has desert dwellers and the like on every floor, one in grassland the old mix; and the
// monsters met there are of those families
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; o3Pref = false; try{ v3Pref = false; }catch(e){}
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; const m = G.ow.map, out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON); if (sites.length < 2) return { none:true };
    const ring = (s, t)=>{ for (const [dx, dy] of DIR8){ const q = owNb(s.x, s.y, dx, dy); if (q && OW_LAND_KEY[m[q[0]][q[1]]]) m[q[0]][q[1]] = t; } G.ow.bio[s.y*OW_COLS + s.x] = 0; };
    const run = (s, t)=>{ ring(s, t); G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); const fams = new Set(), met = {};
      for (let d0=0; d0<2*Math.min(4, G.dungeonMaxDepth||4); d0++){ const d = 1 + (d0 >> 1); G.dgCache = {};   /* (each floor twice: one alone could meet too few to judge) */ loadLevel(d, false); (G.floorFams||[]).forEach(f=>fams.add(f)); for (const mo of G.mon) if (mo.alive){ const f = FAM_BY_NAME[mo.nm] || FAM_BY_NAME[mo.baseNm]; met[f || 'other'] = (met[f || 'other']||0) + 1; } }
      return { key:dgThemeKey(), fams:[...fams], met }; };
    out.desert = run(sites[0], OW_DESERT); out.grass = run(sites[1], OW_GRASS);
    out.eco = { desert:MON_ECOSYS.dgDesert, grass:MON_ECOSYS.dungeon };
    return out; });
  console.log(JSON.stringify(r));
  A(!r.none, 'two barrows');
  A(r.desert.key==='dgDesert' && r.desert.fams.length >= 2 && r.desert.fams.every(f=>r.eco.desert.includes(f)), "a desert dungeon's floors draw on the desert's folk: " + JSON.stringify(r.desert));
  const tot = Object.keys(r.desert.met).filter(k=>k!=='other').reduce((t, k)=>t + r.desert.met[k], 0), ours = r.eco.desert.reduce((t, k)=>t + (r.desert.met[k]||0), 0);
  A(tot >= 8 && ours/tot >= 0.6, 'most monsters met there are of them (the rest the generic roll, three in ten): ' + JSON.stringify(r.desert.met));
  A(r.grass.key==='dungeon' && r.grass.fams.every(f=>r.eco.grass.includes(f)), 'a grassland one the old mix: ' + JSON.stringify(r.grass));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
