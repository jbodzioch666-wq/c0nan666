// RS-847: raids on your castles - word a day ahead; at the gate, three waves with your wardens fighting beside you, and the spoils for
// holding; stay away and the garrison holds (the rents lost) or falls (a usurper - storm it to take it back); the steward hires wardens
// and strengthens the gate
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{
    const out = {}, logs = ()=>(G.log||[]).slice(-14).map(l=>String(l.msg)).join(' | ');
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y], key = cs[0] + ',' + cs[1], p = G.player;
    const enter = ()=>{ G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); };
    const takeThrone = ()=>{ const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; const had = !!k; if (k){ k.hp = 0; k.alive = false; } bossDefeated(); setUi('playing');
      const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; if (G.mon.some(m=>m.alive && m.x===tx && m.y===t.y + 1)) G.mon = []; tryMove(0, -1); return had; };
    enter(); takeThrone(); const c = p.castles[key]; out.claimed = !!(c && c.held); out.wardens0 = castleWardensOf(c); out.nextRaid = c.nextRaid > clockNow();
    /* the steward: the garrison, wardens hired, the gate made stronger */
    p.gold = 100000; out.hired = castleHire(c) && c.wardens===3; out.gated = castleGateUp(c) && c.gate===1;
    /* word of a raid */ c.nextRaid = clockNow() - 1; castleRaidTick(); out.raid = !!c.raid; out.word = /march on your castle/.test(logs());
    castleStewardTalk(c); out.stewardUi = G.ui==='wevent' && /march on us/.test(G.wevDlg.text) && G.wevDlg.opts.filter(o=>/Hire a warden|Make it|Leave/.test(o[0])).length===3;   /* (RS-853: the works and the taxes besides) */ setUi('playing');
    /* at the gate: three waves */ G.depth = 1; loadLevel(1); setUi('playing'); out.siege = !!G.castleSiege; out.wardensAtGate = G.folk.filter(f=>f.k==='warden' && !f.gone).length;
    let waves = 0, raiders = 0, struck = null; const g0 = p.gold;
    for (let it=0; it<40 && G.castleSiege; it++){ castleSiegeTick(); if (!G.castleSiege) break; waves = G.castleSiege.wave;
      const rs = G.mon.map((m, i)=>[m, i]).filter(([m])=>m.alive && m.raider); raiders += rs.length;
      if (struck===null && rs.length){ const m = rs[0][0], w = G.folk.find(f=>f.k==='warden' && !f.gone);
        for (const [i, j] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) if (folkFree(m.x + i, m.y + j)){ w.x = m.x + i; w.y = m.y + j; break; }
        const h = m.hp; castleWardenAct(w); struck = !m.alive || m.hp < h; }
      for (const [m] of rs) if (m.alive){ m.hp = 0; monsterDies(G.mon.indexOf(m)); } }
    out.waves = waves; out.raiders = raiders; out.struck = struck; out.won = !G.castleSiege && !c.raid && c.defended===1; out.spoils = p.gold - g0;
    /* away: the garrison holds alone */ dgFinish(false); setUi('playing');
    c.raid = { foe:'orc', due:clockNow() - 1, str:0 }; c.day = -5; out.held = castleRaidResolve(key, 0)==='held' && !!castleHeld(cs[0], cs[1]) && c.day===Math.floor(clockNow()/DAY_LENGTH);
    /* the due time passes on the tick */ c.raid = { foe:'orc', due:clockNow() - 1, str:0 }; c.wardens = 6; c.gate = 3; castleRaidTick(); out.tickResolved = !c.raid;
    /* and falls */ c.raid = { foe:'orc', due:clockNow() - 1, str:0 }; c.wardens = 0; c.gate = 0; out.lost = castleRaidResolve(key, 99)==='lost' && !castleHeld(cs[0], cs[1]) && c.lost===1;
    out.cacheGone = Object.keys(G.dgCache).filter(k=>k.startsWith((c.slot||G.ow.dungeonIdx[cs[0]][cs[1]]) + '_')).length;
    { c.day = 0; const ck = curTownKey; curTownKey = ()=>c.town; try{ out.rentsLost = castleRents(); } finally { curTownKey = ck; } }
    /* storm it again: a usurper on the throne, and it's yours once more */ enter(); out.kingBack = takeThrone(); out.retaken = !!castleHeld(cs[0], cs[1]); dgFinish(false); setUi('playing');
    out.json = !!JSON.parse(JSON.stringify(p)).castles[key].held;
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.claimed && r.wardens0===2 && r.nextRaid, 'the claim');
  assert.ok(r.hired && r.gated, 'the steward\'s hire and gate');
  assert.ok(r.raid && r.word, 'no word of a raid'); assert.ok(r.stewardUi, 'the steward\'s counsel');
  assert.ok(r.siege, 'no fight at the gate'); assert.equal(r.wardensAtGate, 3, 'wardens at the gate');
  assert.equal(r.waves, 3, 'waves ' + r.waves); assert.ok(r.raiders >= 4, 'raiders ' + r.raiders); assert.ok(r.struck, 'the warden did not strike');
  assert.ok(r.won && r.spoils > 0, 'the defence was not won');
  assert.ok(r.held && r.tickResolved, 'the garrison alone'); assert.ok(r.lost && r.cacheGone===0 && r.rentsLost===0, 'the fall');
  assert.ok(r.kingBack && r.retaken && r.json, 'taken back'); };
