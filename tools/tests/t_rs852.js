// RS-852: your coat of arms - chosen at the first castle you take (the picker opens on the throne; Escape bears what it shows), changed
// from the Realms panel; flown on your castle on the land (the keep's banner and two on the gate wall), over the towns of your realm and
// at their gates; your realms washed in the field's colour on the map; kept through a save, and an old save has none
// Shots: shots/rs852-castle.png, shots/rs852-town.png, shots/rs852-picker.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    out.none = armsOf()===null;
    const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1);
    out.picker = G.ui==='arms' && /YOUR ARMS/.test(document.getElementById('overlay').innerHTML);
    armsSet('f', 1); armsSet('m', 0); armsSet('d', 0); armsSet('e', 6); out.blazon = /Azure, an eagle Or/.test(document.getElementById('overlay').innerHTML);
    return out; });
  await page.screenshot({ path: SHOTS + '/rs852-picker.png' });
  const r2 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {}, p = G.player;
    /* Escape the first time bears what it shows */ document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true })); await wait(50);
    out.borne = !!armsOf() && armsKey(armsOf())==='1.0.0.6' && G.ui==='playing'; if (!out.borne) armsBear();
    dgFinish(false); setUi('playing');
    const pv = owProvinces().list.find(q=>provHeld(q)), cs = [pv.seat.x, pv.seat.y];
    /* the map */ G.owZoomedOut = false; toggleOwZoom(); for (let i=0;i<4;i++){ renderGame(); await wait(30); }
    const px = pmRealmWash.cv.getContext('2d').getImageData(cs[0], cs[1], 1, 1).data; out.mapCol = [px[0], px[1], px[2]].join(',')===armsRgb().join(',') && armsRgb().join(',')!==REALM_GOLD.join(','); toggleOwZoom(); setUi('playing');
    /* the panel */ setUi('realms'); const ov = document.getElementById('overlay').innerHTML; out.panel = /Your arms/.test(ov) && /armsOpen\(\)/.test(ov) && /Azure, an eagle Or/.test(ov); setUi('playing');
    /* the land: the castle's banners */ G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] + 2 }; O3.mapRef = null; const t0 = performance.now(); while (performance.now() - t0 < 20000){ renderGame(); await wait(40); if (O3.sites && [...O3.sites.keys()].some(k=>/\|1\.0\.0\.6$/.test(k)) && !O3.pend && performance.now() - t0 > 3000) break; }
    const keys = [...O3.sites.keys()]; out.castleTag = keys.some(k=>k.startsWith(`${cs[0]},${cs[1]},${OW_CASTLE}`) && /\|1\.0\.0\.6$/.test(k)) || keys.some(k=>k.split(',')[2]==String(OW_CASTLE) && /\|1\.0\.0\.6$/.test(k));
    const m = armsBannerMat(armsOf()); let n = 0; O3.world && O3.world.traverse(o=>{ if (o.material===m) n++; }); out.banners = n;
    for (let i=0;i<10;i++){ renderGame(); await wait(40); }
    out.town = (pv.towns||[])[0]; return out; });
  await page.screenshot({ path: SHOTS + '/rs852-castle.png' });
  const r3 = await page.evaluate(async (tk)=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {}, [x, y] = tk.split(',').map(Number);
    out.townMine = armsTownMine(x, y);
    G.owPos = { x, y }; G.gameMode = 0; enterVillage(); setUi('playing'); await wait(2500); for (let i=0;i<10;i++){ renderGame(); await wait(40); }
    const m = armsBannerMat(armsOf()); out.gate = (V3.banners||[]).filter(b=>b.material===m).length >= 2; out.dbg = [(V3.banners||[]).length, G.owPos.x + "," + G.owPos.y, armsTownMine(G.owPos.x, G.owPos.y), G.gameMode];
    /* walk to the gate's banners for the shot */ return out; }, r2.town);
  await page.screenshot({ path: SHOTS + '/rs852-town.png' });
  const r4 = await page.evaluate(async ()=>{ const out = {};
    saveCurrentGame(); loadGame(G.saveId); setUi('playing'); out.kept = armsKey(armsOf())==='1.0.0.6';
    /* changed from the panel */ armsOpen(); armsSet('f', 0); armsSet('e', 1); armsBear(); out.changed = armsKey(armsOf())==='0.0.0.1' && G.log.slice(-3).some(l=>/heralds paint/.test(l.msg));
    /* an old save: no arms, a bad one ignored */ G.player.arms = { f:99 }; out.bad = armsOf()===null; delete G.player.arms; out.old = armsOf()===null && armsRgb().join(',')===REALM_GOLD.join(',');
    return out; });
  const R = Object.assign({}, r, r2, r3, r4); console.log(JSON.stringify(R)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(R.none && R.picker && R.blazon, 'the picker at the first throne'); assert.ok(R.borne, 'Escape did not bear the arms'); assert.ok(R.mapCol, 'the map not in the arms\' colour'); assert.ok(R.panel, 'the Realms panel');
  assert.ok(R.castleTag && R.banners >= 3, 'the castle\'s banners on the land: ' + R.banners); assert.ok(R.townMine && R.gate, 'the town gate\'s banners');
  assert.ok(R.kept && R.changed, 'kept or changed'); assert.ok(R.bad && R.old, 'old saves'); };
