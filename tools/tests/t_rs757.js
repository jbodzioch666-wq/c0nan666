// RS-757: the Lost City's first floor is the city itself (generateCityLevel, theme cityOut): the jungle round it, a stepped pyramid at
// its heart with the way down at its foot, ruined houses, paving and grass - open to the sky, lit by the hour (fpEnv's day branch), the
// jungle's own plants built round it (fpdCityJungle). You can walk from the way in to the way down; monsters wait in it. Below are its
// halls (the temple's rooms, theme city). A floor 1 cached before RS-757 (the temple's rooms) is made afresh
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45; const m = G.ow.map, out = {}; let c = null;
    for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && !owSeaSite(x, y)){ c = { x, y }; break; }
    if (!c) return { none:true };
    G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const P = cityPyr(), cx = COLS >> 1, D = G.dungeonDeco; let jung = 0, pyr = 0, ruin = 0, paved = 0, grass = 0;
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ const t = G.map[x][y], d = D[x][y]; if (t===T_WALL){ if (d==='jung') jung++; else if (d==='pyr') pyr++; else ruin++; } else if (cityPaved(x, y)) paved++; else grass++; }
    const edgeJ = (()=>{ let n = 0, all = 0; for (let x=0;x<COLS;x++) for (const y of [0, ROWS-1]){ all++; if (D[x][y]==='jung') n++; } return n/all; })();
    /* walk from the way in to the way down */
    const seen = new Set([G.genStart.x + ',' + G.genStart.y]), q = [[G.genStart.x, G.genStart.y]]; let reach = false;
    while (q.length){ const [x, y] = q.pop(); if (G.map[x][y]===T_STAIRSD){ reach = true; break; } for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx = x+a, ny = y+b, k = nx + ',' + ny; if (seen.has(k) || nx<0 || ny<0 || nx>=COLS || ny>=ROWS || G.map[nx][ny]===T_WALL) continue; seen.add(k); q.push([nx, ny]); } }
    Object.assign(out, { kind:G.siteKind, depth:G.depth, theme:fpTheme().key, outdoor:fpTheme().outdoor, nightNoon:fpEnv().night, jung, pyr, ruin, paved, grass, edgeJ, reach,
      stairAt:G.map[cx][P.y1]===T_STAIRSD || [[cx-1,P.y1],[cx+1,P.y1]].some(([x, y])=>G.map[x][y]===T_STAIRSD), mon:G.mon.filter(mo=>mo.alive).length, fams:(G.floorFams||[]).slice(), eco:MON_ECOSYS.city,
      plants:Object.keys(FPD.mats||{}).filter(k=>/^cityJ:/.test(k)), world:FPD.world ? FPD.world.children.length : 0, lay:(G.dgCache[cacheKey(G.dungeonSlot, 1)]||{}).lay || null });
    G.player.clock = DAY_LENGTH*0.95; out.nightLate = fpEnv().night; G.player.clock = DAY_LENGTH*0.45;
    /* down into its halls */
    saveLevelCache(1); out.lay = G.dgCache[cacheKey(G.dungeonSlot, 1)].lay;
    loadLevel(2, false); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    out.below = { depth:G.depth, theme:fpTheme().key, outdoor:fpTheme().outdoor, cols:COLS };
    /* a floor 1 cached as RS-756 had it is made afresh */
    const k1 = cacheKey(G.dungeonSlot, 1), old = G.dgCache[k1]; old.lay = ''; old.map = old.map.map(col=>col.map(()=>T_FLOOR));
    loadLevel(1, true); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    let walls = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_WALL) walls++;
    out.redo = { walls, theme:fpTheme().key };
    G.gameMode = 0; setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  A(!r.none, 'a Lost City on the land');
  A(r.kind==='city' && r.depth===1 && r.theme==='cityOut' && r.outdoor, 'its first floor is the city, under the sky: ' + r.theme);
  A(r.nightNoon===false && r.nightLate===true, 'lit by the hour - day at noon, night late');
  A(r.edgeJ > 0.95 && r.jung > 150, 'the jungle closes it in: ' + r.edgeJ + ' ' + r.jung);
  A(r.pyr === CITY_PYR_N, 'the pyramid at its heart: ' + r.pyr);
  A(r.ruin >= 40, 'ruined houses: ' + r.ruin + ' wall tiles');
  A(r.paved > 60 && r.grass > 60, 'paving and grass: ' + r.paved + ' ' + r.grass);
  A(r.stairAt && r.reach, 'the way down at the pyramid\'s foot, and a way to it');
  A(r.mon > 0 && r.fams.length && r.fams.every(f=>r.eco.includes(f)), 'its folk wait in it: ' + r.mon + ' ' + JSON.stringify(r.fams));
  A(['jtree', 'palm', 'fern'].every(k=>r.plants.some(p=>p.startsWith('cityJ:' + k + ':'))), 'the jungle\'s plants built round it: ' + r.plants);
  A(r.lay==='city1', 'its cache knows it is the city');
  A(r.below.depth===2 && r.below.theme==='city' && !r.below.outdoor, 'below, its halls: ' + JSON.stringify(r.below));
  A(r.redo.walls > 200 && r.redo.theme==='cityOut', 'a floor cached before the city was laid out is made afresh: ' + JSON.stringify(r.redo));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
const CITY_PYR_N = 9*7;
