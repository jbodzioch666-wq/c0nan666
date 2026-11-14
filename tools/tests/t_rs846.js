// RS-846: the realms (generator 31) - the land shared into six territories of near even size, each ruled from a castle at its heart;
// every town in one, the castle staying on its seat when its king falls, the claim making you ruler of the realm (all its towns hail
// you, any of them pays the rents), and the map's Territories layer washing each realm in its own colour, switched on and off
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{
    const out = { sizes:{} };
    const census = ()=>{ const PV = owProvinces(), W = OW_COLS, land = new Array(PV.list.length).fill(0); let tot = 0, owned = 0;
      for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++){ const t = G.ow.map[x][y]; if (t===OW_WATER || (owCube() && cubeFace(x, y) < 0)) continue; tot++; const k = PV.own[y*W + x]; if (k >= 0){ owned++; land[k]++; } }
      const towns = skTowns(), inRealm = towns.filter(t=>PV.own[t[1]*W + t[0]] >= 0).length;
      const seatsOk = PV.list.every(p=>p.realm && G.ow.map[p.seat.x][p.seat.y]===OW_CASTLE && PV.own[p.seat.y*W + p.seat.x]===p.id);
      let castles = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE) castles++;
      return { realms:PV.list.length, castles, cover:+(owned/tot).toFixed(3), spread:+(Math.max(...land)/Math.max(1, Math.min(...land))).toFixed(2), towns:towns.length, inRealm, seatsOk, names:PV.list.map(p=>p.name + ' (' + p.towns.length + ')').join('; ') }; };
    for (const sz of ['small', 'medium', 'large', 'planet']){ goToCharCreate(); ccBegin(); setWorldSizeTier(sz); const t0 = performance.now(); wgRegenerate(4242); out.sizes[sz] = Object.assign(census(), { ms:Math.round(performance.now() - t0), gv:G.ow.genVer }); }
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const c0 = census(); out.c0 = c0; const own0 = Array.from(owProvinces().own).join('');
    /* a load rebuilds the land: the same realms */ owProvinces.c = null; generateOverworld(G.ow.seed); applyOverworldOverrides(); out.sameRealms = Array.from(owProvinces().own).join('')===own0;
    /* the map's Territories layer */ out.layer = MAP_LAYERS.some(l=>l[0]==='realms') && mapF('realms')===1; G.owZoomedOut = false; toggleOwZoom(); renderGame(); out.washed = !!pmRealmWash.cv; mapToggle('realms'); out.off = mapF('realms')===0; renderGame(); mapToggle('realms'); out.on = mapF('realms')===1; toggleOwZoom(); setUi('playing');
    /* a realm's castle: its king falls, it stays */ const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y];
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); const max = G.dungeonMaxDepth;
    G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing'); out.stayed = G.ow.map[cs[0]][cs[1]]===OW_CASTLE;
    /* the throne taken: the realm's towns hail you */ const rep0 = {}; for (const t of pv.towns) rep0[t] = repAt(t);
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1), p = G.player; p.x = tx; p.y = t.y + 1; if (G.mon.some(m=>m.alive && m.x===tx && m.y===t.y + 1)) G.mon = []; tryMove(0, -1);
    const c = p.castles[cs[0] + ',' + cs[1]]; out.claimed = !!(c && c.held); out.towns = c && c.towns ? c.towns.length : 0; out.realmTowns = pv.towns.length;
    out.hailed = pv.towns.filter(t=>repAt(t) > rep0[t]).length; out.line = provLine(pv); out.ruleMsg = (G.log||[]).slice(-12).some(l=>/ruler of/.test(String(l.msg)));
    dgFinish(false); setUi('playing');
    /* rents from a town of the realm that isn't the nearest */ const far = pv.towns.find(k=>k!==c.town) || c.town; c.day = Math.floor(clockNow()/DAY_LENGTH) - 3; const [fx, fy] = far.split(',').map(Number);
    const g0 = p.gold, ck = curTownKey; curTownKey = ()=>far; try{ out.rent = castleRents(); } finally { curTownKey = ck; } out.goldUp = p.gold - g0;
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  for (const sz in r.sizes){ const s = r.sizes[sz];
    assert.ok(s.gv >= 31, 'generator'); assert.ok(s.realms >= 4 && s.realms <= 12, `${sz}: ${s.realms} realms`);   /* (RS-849: as many as the land wants) */ assert.ok(s.seatsOk, `${sz}: a realm without its castle on its seat`);
    assert.ok(s.castles >= s.realms, `${sz}: castles ${s.castles}`); assert.ok(s.cover >= 0.97, `${sz}: only ${s.cover} of the land in a realm`); assert.equal(s.inRealm, s.towns, `${sz}: a town in no realm`);
    assert.ok(s.spread <= 2.5, `${sz}: realms uneven (largest/smallest ${s.spread})`); }
  for (const sz in r.sizes) assert.ok(!/\(0\)/.test(r.sizes[sz].names), sz + ': a realm with no town'); assert.ok(!/\(0\)/.test(r.c0.names), 'a realm with no town');
  assert.ok(r.sameRealms, 'the realms changed when the land was rebuilt');
  assert.ok(r.layer && r.washed && r.off && r.on, 'the Territories layer');
  assert.ok(r.stayed, 'the realm\'s castle moved'); assert.ok(r.claimed && r.towns===r.realmTowns, 'the claim'); assert.ok(r.hailed >= r.realmTowns - 1, 'hailed in ' + r.hailed);
  assert.ok(r.ruleMsg && /You rule/.test(r.line), r.line); assert.ok(r.rent > 0 && r.goldUp===r.rent, 'no rents from a town of the realm'); };
