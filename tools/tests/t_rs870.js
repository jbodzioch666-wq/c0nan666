// RS-870: chests of five looks - banded, strongbox, ornate, rustic, travelling trunk - a treasure room's picked by its tile, and the
// same chest shut and opened keeps its look; the iron strongbox and the raid's gold chest keep theirs. No plain boxes or few-sided
// cylinders, a few draws each, an opened lid swings. Shots: shots/rs870-shut.png, rs870-open.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; const out = { bad:{}, draws:{}, seen:{}, same:0, diff:0 };
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
    const cam = FPD.cam || FPD.camera; window.__tiles = {};
    for (let i=0;i<60;i++){ const x = (i*7)%31 * 7, y = Math.floor(i/3) * 13, a = isoPropModel({ x, y, kind:'chest' }), b = isoPropModel({ x, y, kind:'dress', d:'chesto_v', rot:0 }), st = a.userData.chestStyle;
      out.seen[st] = (out.seen[st]||0) + 1; if (st===b.userData.chestStyle) out.same++; else out.diff++; if (!window.__tiles[st]) window.__tiles[st] = [x, y];
      if (out.seen[st]===1) for (const [nm, g] of [[st, a], [st + 'Open', b]]){ let draws = 0, plain = 0, thin = []; const rbs = new Set(Object.values(V3_RB)); g.traverse(m=>{ if (!m.isMesh) return; draws++; const G2 = m.geometry; if (G2.type==='BoxGeometry' && !rbs.has(G2)) plain++; if (G2.type==='CylinderGeometry' && G2.parameters.radialSegments < 16 && G2.parameters.radiusTop > 0.012) thin.push(G2.parameters.radialSegments); });
        FPD.scene.add(g); try{ FPD.r.compile(g, cam); }catch(e){ thin.push('compile ' + String(e).slice(0, 60)); } FPD.scene.remove(g); out.draws[nm] = draws; if (plain || thin.length) out.bad[nm] = { plain, thin }; }
      if (out.seen[st]===1){ chestOpenedAt = ()=>performance.now() - 3000; b.userData.anim(0, 0, 1, 1); out['lid' + st] = +b.userData.hinge.rotation.x.toFixed(2); } }
    out.iron = isoPropModel({ x:0, y:0, kind:'dress', d:'lchest', rot:0 }).userData.chestStyle; out.raid = isoPropModel({ x:0, y:0, kind:'dress', d:'raidchest', rot:0 }).userData.chestStyle;
    let best = null; for (let x=3;x<COLS-4 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-2;i<=2 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } }
    if (best){ G.player.x = best[0]; G.player.y = best[1]; } out.room = !!best; window.__gal = new THREE.Group(); FPD.scene.add(window.__gal);
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.deepEqual(r.bad, {}, 'chests with plain boxes or thin cylinders: ' + JSON.stringify(r.bad));
  for (const st of ['banded', 'strongbox', 'ornate', 'rustic', 'trunk']){ assert.ok(r.seen[st] >= 4, 'too few ' + st + ' chests ' + JSON.stringify(r.seen)); assert.ok(r['lid' + st] < -1.5, st + ' lid does not swing'); }
  for (const [k, n] of Object.entries(r.draws)) assert.ok(n <= 12, k + ' is ' + n + ' draws');
  assert.equal(r.diff, 0, 'a chest changes its look when opened'); assert.equal(r.iron, 'strongbox'); assert.equal(r.raid, 'ornate'); assert.ok(r.room, 'no room');
  for (const open of [false, true]){ await page.evaluate(async open=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), gal = window.__gal; while (gal.children.length) gal.remove(gal.children[0]); chestOpenedAt = ()=>performance.now() - 3000;
      ['banded', 'strongbox', 'ornate', 'rustic', 'trunk'].forEach((st, i)=>{ const [x, y] = window.__tiles[st], g = isoPropModel(open ? { x, y, kind:'dress', d:'chesto_v', rot:0 } : { x, y, kind:'chest' }); g.position.set(G.player.x - 1.5 + (i%3)*1.05, 0, G.player.y - 0.7 + Math.floor(i/3)*1.0); g.scale.setScalar(1.3); if (g.userData.anim) g.userData.anim(0, 0, 1, 1); gal.add(g); });
      ISO.dist = 5; for (let i=0;i<30;i++){ renderGame(); await wait(30); } }, open);
    await page.screenshot({ path: SHOTS + '/rs870-' + (open ? 'open' : 'shut') + '.png' }); }
  assert.equal(errs.length, 0, errs.join('|'));
};
