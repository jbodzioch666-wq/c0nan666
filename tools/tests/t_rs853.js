// RS-853: a realm to grow - the castle's works (barracks: ten wardens, cheaper; walls: the garrison holds better, a raider fewer;
// treasury: more rents) and taxes (light: standing up, heavy: down) set with the steward; your wardens marched on a neighbour's
// town (taken or held on the roll, the wardens home, some fallen), the storming led yourself; a truce bought, tribute demanded and
// paid, and a refusal that brings the king down on you
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv0 = owProvinces().list[0], cs = [pv0.seat.x, pv0.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1); if (G.ui==='arms') armsBear(); dgFinish(false); setUi('playing');
    const ck = cs[0] + ',' + cs[1], c = p.castles[ck]; G.gameMode = 0;
    /* works */ const rent0 = castleRentDay(c), hire0 = castleHireCost(c); p.gold = 1e6;
    castleStewardTalk(c); out.stewardOpts = G.wevDlg.opts.map(o=>o[0]).filter(s=>/Build the|Tax /.test(s)).length; setUi('playing');
    out.built = castleBuild(c, 'b') && castleBuild(c, 'w') && castleBuild(c, 't') && !castleBuild(c, 't');
    out.barracks = castleMaxWardens(c)===10 && castleHireCost(c) < hire0; out.treasury = castleRentDay(c) > rent0;
    c.wardens = 9; out.hire10 = castleHire(c) && !castleHire(c) && c.wardens===10;
    c.raid = { foe:'orc', due:0, str:12 }; c.wardens = 7; out.walls = castleRaidResolve(ck, 12)==='held';   /* (7 wardens + 3 for the walls = 10 < 12 without them... with them: held at 7 + 3 + 0 >= 12? no) */
    c.held = 1; c.lost = 0; c.wardens = 9; c.raid = { foe:'orc', due:0, str:12 }; out.walls2 = castleRaidResolve(ck, 12)==='held';
    /* taxes */ const fair = castleRentDay(c); castleSetTax(c, 2); out.heavy = castleRentDay(c) > fair; const tk = c.towns[0], r0 = repAt(tk); castleTaxRep(c, 2); out.heavyRep = repAt(tk)===r0 - 2;
    castleSetTax(c, 0); out.light = castleRentDay(c) < fair; const r1 = repAt(tk); castleTaxRep(c, 3); out.lightRep = repAt(tk)===r1 + 1; castleSetTax(c, 1);
    /* a march, taken on the roll */ const e = wevP(); e.dyn = e.dyn.filter(d=>d.kind!=='siege'); c.wardens = 6;
    setUi('realms'); out.panelMarch = /March on a town/.test(document.getElementById('overlay').innerHTML); setUi('playing');
    const T = realmTargets(); out.targets = T.length; if (!T.length) return out;
    const d = realmMarch(T[0].k); out.march = !!d && d.mine && c.wardens===1 && c.away===5 && e.dyn.includes(d);
    const o = wevMapList().find(o=>o.k==='siege' && o.d===d); out.tip = !!o && /Your wardens besiege/.test(wevTipHtml(o));
    setUi('realms'); out.panelWar = /Your war:/.test(document.getElementById('overlay').innerHTML); setUi('playing');
    wevTownGate(d.x, d.y); out.gate = G.ui==='wevent' && /Lead the storming/.test(G.wevDlg.opts[0][0]); setUi('playing');
    const mineId = realmMine()[0].id; d.until = wevTurn() - 1; const rr = Math.random; Math.random = ()=>0; try{ wevTick(); } finally { Math.random = rr; }
    out.taken = !e.dyn.includes(d) && provIdAt(d.x, d.y)===mineId && c.towns.includes(d.key) && c.wardens >= 2 && !c.away;
    /* another, held against you */ c.wardens = 6; const T2 = realmTargets(); const d2 = realmMarch(T2[0].k); e.dyn.splice(e.dyn.indexOf(d2), 1); const own2 = provIdAt(d2.x, d2.y); out.held = realmMarchEnd(d2, 0.999)===false && provIdAt(d2.x, d2.y)===own2 && c.wardens <= 6 && c.wardens >= 3;
    /* the storming, led yourself */ c.wardens = 6; const T3 = realmTargets(); const d3 = realmMarch(T3[0].k); SET.loadCards = false; wevTownGate(d3.x, d3.y); G.wevDlg.opts[0][1](); await wait(50); setUi('playing');
    out.storm = G.gameMode===2 && G.wevFight && G.wevFight.kind==='storm' && G.mon.length >= 2; p.hp = p.maxHp = 99999;
    for (const m of G.mon) { m.hp = 0; m.alive = false; } for (let i=0;i<6;i++) await wait(40);
    out.stormed = !e.dyn.includes(d3) && provIdAt(d3.x, d3.y)===mineId; setUi('playing'); G.gameMode = 0;
    /* a truce: kings leave your towns alone */ const L = owProvinces().list, kings = L.filter(q=>!provHeld(q)); for (const q of kings) realmTruce(q.id);
    let atYou = 0; for (let i=0;i<40;i++){ e.dyn = e.dyn.filter(x=>x.kind!=='siege'); const rw = realmWarState(); rw.next = 0; const w = realmWarTick(); if (w && provHeld(realmWarSide(w.war.b))) atYou++; } out.truce = atYou===0;
    /* tribute demanded: strong, it's paid */ const rw = realmWarState(); rw.pacts = {}; c.wardens = 10; const weak = kings.slice().sort((a, b)=>(a.towns||[]).length - (b.towns||[]).length)[0];
    out.demand = realmDemand(weak.id)==='yes'; const g0 = p.gold; rw.tday = Math.floor(wevTurn()/DAY_LENGTH) - 1; realmTributeTick(rw); out.tribute = p.gold > g0;
    setUi('realms'); out.panelTrib = /Pays you tribute/.test(document.getElementById('overlay').innerHTML); setUi('playing');
    /* refused: he comes for you */ for (const q of Object.values(p.castles)) { q.wardens = 0; q.gate = 0; q.works = {}; } const strong = kings.filter(q=>q.id!==weak.id).sort((a, b)=>(b.towns||[]).length - (a.towns||[]).length)[0];
    out.refuse = realmDemand(strong.id)==='no' && rw.spite===strong.id; e.dyn = e.dyn.filter(x=>x.kind!=='siege'); rw.next = 0; const w2 = realmWarTick(); out.spite = !!w2 && w2.war.a===strong.id;
    /* through a save */ saveCurrentGame(); loadGame(G.saveId); setUi('playing'); const c2 = G.player.castles[ck]; out.kept = c2.tax===1 && c2.wardens===0 && !!realmPact(weak.id) && realmPact(weak.id).g > 0;
    return out; });
  await page.evaluate(()=>{ for (const q of Object.values(G.player.castles)) q.wardens = 6; setUi('realms'); }); await page.screenshot({ path: SHOTS + '/rs853-realms.png' }); await page.evaluate(()=>setUi('playing'));
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.stewardOpts >= 5, 'the steward\'s works and taxes'); assert.ok(r.built && r.barracks && r.treasury && r.hire10, 'the works');
  assert.ok(!r.walls && r.walls2, 'the walls'); assert.ok(r.heavy && r.heavyRep && r.light && r.lightRep, 'the taxes');
  assert.ok(r.panelMarch && r.targets && r.march && r.tip && r.panelWar && r.gate, 'the march'); assert.ok(r.taken, 'the town not taken'); assert.ok(r.held, 'the town held');
  assert.ok(r.storm && r.stormed, 'the storming'); assert.ok(r.truce, 'a king broke the truce'); assert.ok(r.demand && r.tribute && r.panelTrib, 'the tribute');
  assert.ok(r.refuse && r.spite, 'the refusal'); assert.ok(r.kept, 'lost in the save'); };
