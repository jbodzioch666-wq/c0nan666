// RS-855: back in your own castle on a later visit (the boss long dead, dgDone 0) a click on the throne from across the hall walks
// you up to it and sits you down; the castle's banners - the throne hall's pillars and the banners on poles - are your arms.
// Shots: shots/rs855-throne.png, shots/rs855-hall.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv0 = owProvinces().list[0], cs = [pv0.seat.x, pv0.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    let t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1);
    if (G.ui==='arms'){ armsSet('f', 1); armsSet('m', 0); armsSet('d', 0); armsSet('e', 6); armsBear(); } setUi('playing');
    /* out, and back another day */ dgFinish(false); setUi('playing'); G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    G.depth = G.dungeonMaxDepth; loadLevel(G.depth); setUi('playing'); out.dgDone = G.dgDone; out.held = !!castleHeldHere();
    t = G.genRooms.find(r=>r.k==='throne'); tx = t.x + (t.w>>1); const thy = t.y;
    /* across the hall, then a click on the throne */ G.folk = (G.folk||[]).filter(f=>f.k!=='warden'); let far = null; for (let y=t.y + t.h - 1; y>t.y + 2 && !far; y--) for (const x of [t.x + 1, t.x + t.w - 2]) if (G.map[x][y]===T_FLOOR && !G.dungeonDeco[x][y] && !folkAt(x, y)){ far = [x, y]; break; }
    p.x = far[0]; p.y = far[1]; for (let i=0;i<20;i++){ renderGame(); await wait(30); }
    isoAct({ gx:tx, gy:thy }, false); out.walking = (ISO.path||[]).length > 0 || !!G.throneSit;
    const t0 = performance.now(); while (performance.now() - t0 < 15000 && !G.throneSit){ renderGame(); await wait(40); }
    for (let i=0;i<30;i++){ renderGame(); await wait(30); }
    out.sit = !!G.throneSit && !!(ISO.player && ISO.player.throneSat); const hp = ISO.player.holder.position; out.onThrone = Math.abs(hp.x - (tx + 0.5)) < 0.05 && Math.abs(hp.z - (thy + 0.5)) < 0.1;
    /* the banners */ const A = armsBannerMat(armsOf()); let hall = 0, poles = 0, red = 0; FPD.scene.traverse(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.parameters) return; const P = o.geometry.parameters;
      if (P.width===0.32 && P.height===0.64){ if (o.material===A) hall++; else red++; } if (P.width===0.5 && P.height===0.9){ if (o.material===A) poles++; else red++; } });
    out.hall = hall; out.poles = poles; out.red = red;
    return out; });
  await page.screenshot({ path: SHOTS + '/rs855-throne.png' });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.held && !r.dgDone, 'not a later visit'); assert.ok(r.walking && r.sit && r.onThrone, 'did not sit on the throne'); assert.ok(r.hall > 0 && r.red===0, 'the hall\'s banners not your arms'); };
