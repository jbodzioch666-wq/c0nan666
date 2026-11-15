// RS-854: in your own castle - your wardens step aside when you walk into them (one in a doorway barred the throne room), you sit
// on your own throne (and rise when you step away), and the steward stays open after each purchase. Shot: shots/rs854-throne.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv0 = owProvinces().list[0], cs = [pv0.seat.x, pv0.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1); if (G.ui==='arms') armsBear(); setUi('playing');
    const c = castleHeldHere(); out.held = !!c;
    /* a warden in the way steps aside */ G.folk = G.folk || []; const ax = tx, ay = t.y + 3; p.x = tx; p.y = t.y + 2; G.folk = G.folk.filter(f=>!(f.x===ax && f.y===ay)); G.map[ax][ay] = T_FLOOR;
    const w = { k:'warden', nm:'one of your wardens', look:'castle warden', x:ax, y:ay, hp:4 }; G.folk.push(w); tryMove(0, 1); out.swap = p.x===ax && p.y===ay && w.x===tx && w.y===t.y + 2;
    /* sit */ p.x = tx; p.y = t.y + 1; G.folk = G.folk.filter(f=>f!==w); tryMove(0, -1); out.sit = !!G.throneSit && p.y===t.y + 1;
    for (let i=0;i<40;i++){ renderGame(); await wait(30); } out.sat = !!(ISO.player && ISO.player.throneSat && ISO.player.rig.sitting);
    const hp = ISO.player.holder.position; out.onThrone = Math.abs(hp.x - (tx + 0.5)) < 0.05 && Math.abs(hp.z - (t.y + 0.5)) < 0.1;
    /* the steward stays */ p.gold = 1e5; const w0 = castleWardensOf(c); castleStewardTalk(c); const hi = G.wevDlg.opts.findIndex(o=>/Hire a warden/.test(o[0])); wevChoose(hi);
    out.steward = G.ui==='wevent' && G.wevDlg && /Your Steward|YOUR STEWARD/i.test(G.wevDlg.title) && castleWardensOf(c)===w0 + 1;
    const bi = G.wevDlg.opts.findIndex(o=>/Build the treasury/.test(o[0])); wevChoose(bi); out.steward2 = G.ui==='wevent' && castleWork(c, 't');
    const li = G.wevDlg.opts.findIndex(o=>o[0]==='Leave'); wevChoose(li); out.left = G.ui==='playing';
    return out; });
  await page.screenshot({ path: SHOTS + '/rs854-throne.png' });
  const r2 = await page.evaluate(async ()=>{ const p = G.player; tryMove(0, 1); for (let i=0;i<5;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } return { rose:!G.throneSit && !ISO.player.throneSat }; });
  Object.assign(r, r2); console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.held && r.swap, 'the warden did not step aside'); assert.ok(r.sit && r.sat && r.onThrone, 'not sat on the throne'); assert.ok(r.rose, 'did not rise');
  assert.ok(r.steward && r.steward2 && r.left, 'the steward closed'); };
