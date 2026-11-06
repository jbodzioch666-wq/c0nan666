// RS-844: a claimed castle stays yours - it doesn't move on when its king falls, its floors are kept, no king or garrison comes back (a floor made afresh has none either); your wardens at each floor's way in, your steward by the throne, the servants at ease; the land names it Your Castle.
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.hp = G.player.maxHp = 400; let cs = null; for (let x=0;x<OW_COLS && !cs;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE){ cs = [x, y]; break; }
    const out = {}; G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); const slot = G.dungeonSlot, max = G.dungeonMaxDepth;
    for (let d=1; d<=max; d++){ G.depth = d; loadLevel(d); setUi('playing'); saveLevelCache(d); }   /* (climbed, floor by floor) */
    /* the king falls: the castle moves on, as beaten sites do */ const k = G.mon[G.bossIdx]; out.king = k && k.nm; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing'); const mv = G.ow.siteMoves[slot]; out.movedAway = !!mv && (mv.x!==cs[0] || mv.y!==cs[1]) && G.ow.map[cs[0]][cs[1]]!==OW_CASTLE;
    /* the throne taken */ const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1), p = G.player; p.x = tx; p.y = t.y + 1; if (G.mon.some(m=>m.alive && m.x===tx && m.y===t.y + 1)) G.mon = []; tryMove(0, -1);
    out.held = !!castleHeld(cs[0], cs[1]); out.back = G.ow.map[cs[0]][cs[1]]===OW_CASTLE && G.ow.dungeonIdx[cs[0]][cs[1]]===slot; out.newGone = !(mv && G.ow.map[mv.x][mv.y]===OW_CASTLE && G.ow.dungeonIdx[mv.x][mv.y]===slot); out.siteMove = G.ow.siteMoves[slot].x===cs[0] && G.ow.siteMoves[slot].y===cs[1];
    out.foesTop = G.mon.filter(m=>m.alive && !m.ally && !m.minion).length; out.steward = G.folk.some(f=>f.k==='steward'); out.wardens = G.folk.filter(f=>f.k==='warden').length;
    /* the steward and a warden, met */ const logs0 = (G.log||[]).length; const st = G.folk.find(f=>f.k==='steward'); for (const [i, j] of [[1,0],[-1,0],[0,1],[0,-1]]){ const x = st.x - i, y = st.y - j; if (G.map[x][y]===T_FLOOR && !dgSolid(x, y) && !folkAt(x, y)){ p.x = x; p.y = y; tryMove(i, j); break; } } out.stewardSpoke = JSON.stringify((G.log||[]).slice(-3)).includes('steward');
    /* away, out the portal: the floors kept */ dgFinish(false); out.kept = Object.keys(G.dgCache).filter(k=>k.startsWith(slot + '_')).length; out.ow = G.gameMode===0;
    /* back again: no garrison, no king, your people at their posts */ G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing'); out.slotAgain = G.dungeonSlot===slot;
    out.foes1 = G.mon.filter(m=>m.alive && !m.ally && !m.minion).length; out.wardens1 = G.folk.filter(f=>f.k==='warden').length; out.calm = G.folk.filter(f=>f.k==='servant').every(f=>f.calm);
    G.depth = max; loadLevel(max); setUi('playing'); out.foesTop2 = G.mon.filter(m=>m.alive && !m.ally && !m.minion).length; out.boss2 = G.bossIdx; out.ui = G.ui; out.steward2 = G.folk.filter(f=>f.k==='steward').length;
    /* a floor lost from the save is made afresh - empty */ delete G.dgCache[cacheKey(slot, 2)]; G.depth = 2; loadLevel(2); setUi('playing'); out.foesFresh = G.mon.filter(m=>m.alive && !m.ally && !m.minion).length;
    for (let i=0;i<20;i++){ renderGame(); await wait(30); }
    /* through the save */ const back = JSON.parse(JSON.stringify(G.player)); out.saved = !!(back.castles && back.castles[cs[0] + ',' + cs[1]] && back.castles[cs[0] + ',' + cs[1]].held);
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.equal(r.king, 'king'); assert.ok(r.movedAway, 'a beaten castle no longer moves on (the old rule) - the test needs it to'); assert.ok(r.held && r.back && r.newGone && r.siteMove, 'the claimed castle did not stay put ' + JSON.stringify(r));
  assert.equal(r.foesTop, 0); assert.ok(r.steward && r.wardens >= 1, 'no steward or wardens'); assert.ok(r.stewardSpoke, 'the steward said nothing');
  assert.ok(r.kept >= 2 && r.ow, 'the floors were not kept ' + r.kept); assert.ok(r.slotAgain, 'a different site');
  assert.equal(r.foes1, 0, 'foes on the first floor of your castle'); assert.ok(r.wardens1 >= 1 && r.calm, 'the first floor\'s people');
  assert.equal(r.foesTop2, 0, 'foes on the top floor'); assert.equal(r.boss2, -1, 'a king again'); assert.notEqual(r.ui, 'bossPreview'); assert.ok(r.steward2 === 1, 'stewards ' + r.steward2);
  assert.equal(r.foesFresh, 0, 'a fresh floor of your castle garrisoned'); assert.ok(r.saved); };
