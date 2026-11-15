// RS-848: a raid shows on the world map (a ring and its hours, a tooltip), raiders come at the castle's level or near yours, a warden's
// thrust shows (its proxy turned to its foe), and "the the walking dead" is gone
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y], key = cs[0] + ',' + cs[1], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1);
    const c = p.castles[key]; c.nextRaid = clockNow() - 1; c.raid = null; castleRaidTick();
    out.cbCastle = castleRaidCb(c)===clampCb(Math.max(c.cb, cbLvl() - 4)); const cb0 = cbLvl; cbLvl = ()=>120; try{ out.cbHigh = castleRaidCb(c); } finally { cbLvl = cb0; }
    out.wording = !/the the /.test((G.log||[]).slice(-6).map(l=>l.msg).join(' ')) && /^the /.test(castleTheFoe('zombie')) && !/^the the/.test(castleTheFoe('zombie')) && castleTheFoe('orc')==='the orc raiders';
    /* the thrust */ G.depth = 1; loadLevel(1); setUi('playing'); castleSiegeTick(); const m = G.mon.find(m=>m.alive && m.raider), w = G.folk.find(f=>f.k==='warden' && !f.gone);
    for (const [i, j] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) if (folkFree(m.x + i, m.y + j)){ w.x = m.x + i; w.y = m.y + j; break; }
    m.hp = m.maxHp = 9999; castleWardenAct(w); const px = folkProxy(w); out.thrust = !!px._atkT && px.faceAt===m;
    /* the map */ dgFinish(false); setUi('playing'); c.raid = { foe:'zombie', due:clockNow() + DAY_LENGTH*0.5, str:3 }; const o = wevMapList().find(o=>o.k==='craid');
    out.listed = !!o && o.x===cs[0] && o.y===cs[1] && o.hrs===12; out.tip = /march on your castle/.test(wevTipHtml(o)) && /12h/.test(wevTipHtml(o));
    G.owZoomedOut = false; toggleOwZoom(); for (let i=0;i<8;i++){ renderGame(); await wait(40); } toggleOwZoom(); setUi('playing');
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.cbCastle && r.cbHigh===116, 'the raid\'s level ' + r.cbHigh); assert.ok(r.wording, 'the wording');
  assert.ok(r.thrust, 'the warden\'s thrust'); assert.ok(r.listed && r.tip, 'the raid on the map'); };
