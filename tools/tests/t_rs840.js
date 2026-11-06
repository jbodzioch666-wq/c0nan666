// RS-840: the castle's master is its king - crowned, robed and cloaked - with his royal guard either side of the throne and in the antechamber and his champion before him; at two-thirds of his life he calls two more of his guard; he telegraphs a charge down a straight line, crashing into you if you stay in it and stumbling past (stunned) if you step out.
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; let cs = null; for (let x=0;x<OW_COLS && !cs;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE){ cs = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(2, G.dungeonMaxDepth); G.depth = G.dungeonMaxDepth; loadLevel(G.depth); setUi('playing');
    const out = {}, k = G.mon[G.bossIdx], t = G.genRooms.find(r=>r.k==='throne'); out.boss = k && k.nm; out.king = k && k.king; out.look = !!(typeof HUMAN_LOOKS!=='undefined' ? 1 : 1) && !!m3dPortrait({ nm:'king' }) && !!m3dPortrait({ nm:'royal guard' }) && !!m3dPortrait({ nm:"king's champion" });
    out.guards = G.mon.filter(m=>m.royal==='guard' && m.hp > 0).length; out.champ = G.mon.filter(m=>m.royal==='champion').length;
    /* "Guards!" */ const n0 = G.mon.filter(m=>m.royal==='guard').length; k.hp = Math.floor(k.maxHp*0.6); monBossTurn(k, G.bossIdx, 5); out.called = G.mon.filter(m=>m.royal==='guard').length - n0;
    /* the charge: clear the room, stand three steps below him */ const keep = k; G.mon = G.mon.filter(m=>m===keep); G.bossIdx = 0; k.x = t.x + (t.w>>1); k.y = t.y + 1; k.stunTurns = 0; const p = G.player; p.x = k.x; p.y = k.y + 3; const B = k._boss; B.chargeCd = 0; B.charge = null; const hp0 = p.hp;
    out.warn = kingCharge(k, 0, 3) && !!B.charge; out.hit = kingCharge(k, 0, 1) && (B.chargeHit||0) === 1; out.hurt = hp0 - p.hp; out.cd = B.chargeCd; out.kingAt = [k.x - p.x, k.y - p.y];
    /* again, but step aside */ k.x = t.x + (t.w>>1); k.y = t.y + 1; p.x = k.x; p.y = k.y + 3; B.chargeCd = 0; kingCharge(k, 0, 3); p.x = k.x + 1; kingCharge(k, 0, 3); out.miss = B.chargeMiss; out.stun = k.stunTurns; out.ranPast = k.y - (t.y + 1);
    /* not in line: no charge */ B.chargeCd = 0; B.charge = null; k.stunTurns = 0; k.x = t.x + (t.w>>1); k.y = t.y + 1; p.x = k.x + 1; p.y = k.y + 3; out.noLine = !kingCharge(k, 0, 3) && !B.charge;
    for (let i=0;i<10;i++){ renderGame(); await wait(30); } return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.equal(r.boss, 'king'); assert.ok(r.king, 'the boss is not marked the king'); assert.ok(r.look, 'a royal figure has no look');
  assert.ok(r.guards >= 3, 'too few royal guard: ' + r.guards); assert.equal(r.champ, 1, 'no champion');
  assert.equal(r.called, 2, 'the king did not call two guards: ' + r.called);
  assert.ok(r.warn, 'no warning before the charge'); assert.ok(r.hit && r.hurt > 0, 'the charge did not land on a player in line ' + JSON.stringify(r)); assert.equal(r.cd, 6);
  assert.ok(r.miss === 1 && r.stun >= 1 && r.ranPast >= 3, 'stepping aside did not make him stumble past ' + JSON.stringify(r)); assert.ok(r.noLine, 'he charged off a line'); };
