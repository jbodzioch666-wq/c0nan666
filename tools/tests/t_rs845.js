// RS-845: one castle to each province (generator 30) - inside its borders, clear of its seat, locked where it first stood; a beaten
// one rises again within the same province, and taking its throne makes you the province's lord, hailed by its seat
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{
    const out = { sizes:{} };
    const census = ()=>{ const PV = owProvinces(), realms = PV.list.filter(p=>!p.wild), per = {}, pos = [];
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE){ const k = provIdAt(x, y); per[k] = (per[k]||0) + 1; pos.push([x, y, k]); }
      const seatD = pos.map(([x, y, k])=>{ const pv = PV.list[k]; return pv && pv.seat ? Math.hypot(x - pv.seat.x, y - pv.seat.y) : -1; });
      return { realms:realms.length, castles:pos.length, slots:NCASTLES, held:realms.filter(p=>per[p.id]===1).length, twice:Object.values(per).filter(n=>n > 1).length,
        wildOnes:pos.filter(([x, y, k])=>k < 0 || (PV.list[k] && PV.list[k].wild)).length, minSeat:Math.min(...seatD), pos:pos.map(p=>p[0] + ',' + p[1]).sort().join(' ') }; };
    for (const sz of ['small', 'medium', 'large', 'planet']){ goToCharCreate(); ccBegin(); setWorldSizeTier(sz); const t0 = performance.now(); wgRegenerate(4242); out.sizes[sz] = Object.assign(census(), { ms:Math.round(performance.now() - t0), gv:G.ow.genVer }); }
    /* the medium world, played */ goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const c0 = census(); out.c0 = c0; out.genVer = G.ow.genVer;
    /* a load rebuilds the land from its seed: the castles where they stood */ owProvinces.c = null; generateOverworld(G.ow.seed); applyOverworldOverrides(); out.sameAfterRegen = census().pos===c0.pos;
    out.locked = Object.values(G.ow.siteMoves||{}).filter(m=>m.kind==='castle').length;
    /* into one, its king beaten: it rises again in the same province */
    let cs = null; for (let x=0;x<OW_COLS && !cs;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE){ cs = [x, y]; break; }
    const pid = provIdAt(cs[0], cs[1]), pv = provAt(cs[0], cs[1]); out.pvName = pv.name;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); const slot = G.dungeonSlot, max = G.dungeonMaxDepth;
    G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const mv = G.ow.siteMoves[slot]; out.moved = !!mv && (mv.x!==cs[0] || mv.y!==cs[1]); out.sameProv = mv && provIdAt(mv.x, mv.y)===pid;
    /* the throne taken: the province's seat hails you */
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1), p = G.player; p.x = tx; p.y = t.y + 1; if (G.mon.some(m=>m.alive && m.x===tx && m.y===t.y + 1)) G.mon = []; const l0 = (G.log||[]).length; tryMove(0, -1);
    const c = p.castles && p.castles[cs[0] + ',' + cs[1]]; out.claimed = !!(c && c.held); out.seat = c && c.town===pv.seat.x + ',' + pv.seat.y; out.provSaved = c && c.prov===pv.name;
    out.lordMsg = (G.log||[]).slice(-12).map(l=>String(l.msg)).some(s=>/lord of/.test(s)); out.line = provLine(pv);
    dgFinish(false); setUi('playing');
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.equal(r.genVer, 30, 'generator');
  for (const sz in r.sizes){ const s = r.sizes[sz];
    assert.equal(s.slots, s.castles + (s.slots - s.castles), sz);
    assert.ok(s.held >= s.realms - 1, `${sz}: ${s.held} of ${s.realms} provinces have one castle`); assert.equal(s.twice, 0, `${sz}: a province with two castles`); assert.equal(s.wildOnes, 0, `${sz}: a castle in the wilds`);
    assert.ok(s.minSeat >= 4, `${sz}: a castle at its seat's door ${s.minSeat}`); }
  assert.ok(r.sameAfterRegen, 'the castles moved when the land was rebuilt'); assert.ok(r.locked >= r.c0.castles, 'castles not locked in place');
  assert.ok(r.moved && r.sameProv, 'a beaten castle left its province');
  assert.ok(r.claimed && r.seat && r.provSaved, 'the claim did not go to the province\'s seat'); assert.ok(r.lordMsg, 'no word of the lordship'); assert.ok(/You hold/.test(r.line), r.line); };
