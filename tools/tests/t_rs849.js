// RS-849: as many realms as the land wants (generator 32: four on a small world, six on a medium, more on the big ones); the Realms
// panel (from the map's toolbar) with who rules each realm and, for yours, the rents, garrison and raids; your realms gold on the map
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = { sizes:{} };
    for (const sz of ['small', 'medium', 'large', 'planet']){ goToCharCreate(); ccBegin(); setWorldSizeTier(sz); wgRegenerate(4242);
      const PV = owProvinces(); let castles = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_CASTLE) castles++;
      out.sizes[sz] = { gv:G.ow.genVer, realms:PV.list.length, slots:NCASTLES, castles, noTown:PV.list.filter(p=>!(p.towns||[]).length).length }; }
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    /* the toolbar's button and the panel, before you rule any */ G.owZoomedOut = false; toggleOwZoom(); renderGame(); out.button = /setUi\('realms'\)/.test(document.getElementById('mapTools').innerHTML);
    setUi('realms'); let ov = document.getElementById('overlay').innerHTML; out.panel = /THE REALMS/.test(ov) && (ov.match(/class="qrep"/g)||[]).length===owProvinces().list.length && /Take a castle/.test(ov); setUi('playing'); toggleOwZoom(); setUi('playing');
    /* a realm taken */ const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1); dgFinish(false); setUi('playing');
    const c = p.castles[cs[0] + ',' + cs[1]]; c.raid = { foe:'orc', due:clockNow() + DAY_LENGTH/4, str:3 };
    setUi('realms'); ov = document.getElementById('overlay').innerHTML; out.yours = /You rule 1 of them/.test(ov) && /Yours/.test(ov) && /warden/.test(ov) && /march on it/.test(ov) && (()=>{ const rows = ov.split('class="qrep"').slice(1).filter(x=>!/armsOpen/.test(x)); return /Yours/.test(rows[0]); })();   /* (yours first; RS-852: below the arms row) */
    setUi('playing');
    /* gold on the map */ G.owZoomedOut = false; toggleOwZoom(); for (let i=0;i<6;i++){ renderGame(); await wait(30); }
    const cv = pmRealmWash.cv, px = cv.getContext('2d').getImageData(cs[0], cs[1], 1, 1).data; out.gold = [px[0], px[1], px[2]].join(',')===REALM_GOLD.join(',');
    toggleOwZoom(); setUi('playing');
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  const want = { small:4, medium:6, large:8, planet:11 };
  for (const sz in r.sizes){ const s = r.sizes[sz]; assert.equal(s.gv, 32, 'generator'); assert.equal(s.realms, want[sz], `${sz}: ${s.realms} realms`); assert.equal(s.slots, s.realms, `${sz}: castle slots`); assert.ok(s.castles >= s.realms, `${sz}: castles`); assert.equal(s.noTown, 0, `${sz}: a realm with no town`); }
  assert.ok(r.button, 'no Realms button on the map'); assert.ok(r.panel, 'the Realms panel'); assert.ok(r.yours, 'your realm in the panel'); assert.ok(r.gold, 'your realm not gold on the map'); };
