// RS-869: the last old dungeon models remade - dropped items in their shapes (a flask with its draught, a scroll on rollers, a turned
// wand with a cut gem, a ring and an amulet set with stones, a helm or cap, legs, gloves with fingers, a breastplate or a folded tunic),
// a finer corner cobweb that sometimes has its spider, moss in ragged patches and cushions, puddles and wet spots with ragged edges.
// No plain boxes or few-sided cylinders, each item a few draws. Shots: shots/rs869-items.png, rs869-decos.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ITEMS = [{ kind:'scroll', nm:'Scroll' }, { consumable:true, nm:'Healing potion' }, { consumable:true, nm:'Mana draught' }, { kind:'wand', nm:'Wand' }, { slot:'ring', nm:'Ring', quality:2 }, { slot:'necklace', nm:'Amulet', quality:3 },
    { slot:'head', nm:'Helm', rsFam:'metal', rsCol:'#9aa4ac' }, { slot:'head', nm:'Hood', rsFam:'cloth', rsCol:'#5a3a6a' }, { slot:'legs', nm:'Greaves', rsFam:'metal', rsCol:'#8e969c' }, { slot:'legs', nm:'Chaps', rsFam:'hide', rsCol:'#7a5232' },
    { slot:'arms', nm:'Gauntlets', rsFam:'metal', rsCol:'#9aa4ac' }, { slot:'arms', nm:'Gloves', rsFam:'hide', rsCol:'#6a4a2a' }, { slot:'body', nm:'Plate', rsFam:'metal', rsCol:'#9aa4ac', quality:1 }, { slot:'body', nm:'Robe top', rsFam:'cloth', rsCol:'#3a5a8a' }, { slot:'body', nm:'Jerkin', rsFam:'hide', rsCol:'#7a5232' }];
  const r = await page.evaluate(async ITEMS=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; const out = { bad:{}, draws:{} };
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
    const rbs = new Set(Object.values(V3_RB)), cam = FPD.cam || FPD.camera;
    const check = (nm, g)=>{ let draws = 0, plain = 0, thin = [], few = []; g.traverse(m=>{ if (!m.isMesh) return; draws++; const G2 = m.geometry, M2 = m.material; if (!M2 || !M2.isMaterial) few.push('nomat');
        if (G2.type==='BoxGeometry' && !rbs.has(G2) && !(M2.emissiveIntensity > 0.5)) plain++; if (G2.type==='CylinderGeometry' && G2.parameters.radialSegments < 16 && G2.parameters.radiusTop > 0.012) thin.push(G2.parameters.radialSegments);
        if ((G2.type==='SphereGeometry' && G2.parameters.widthSegments < 10) || (G2.type==='CircleGeometry' && G2.parameters.segments < 24) || (G2.type==='RingGeometry' && G2.parameters.thetaSegments < 24) || G2.type==='OctahedronGeometry') few.push(G2.type); });
      try{ FPD.r.compile(g, cam); }catch(e){ few.push('compile ' + String(e).slice(0, 80)); }
      out.draws[nm] = draws; if (plain || thin.length || few.length || !draws) out.bad[nm] = { plain, thin, few, draws }; };
    for (const it of ITEMS){ const g = isoPropModel({ x:2, y:3, kind:'item', it }); FPD.scene.add(g); check(it.nm, g); FPD.scene.remove(g); isoFreeProp(g); }
    let spider = 0; for (let i=0;i<12;i++){ const g = isoPropModel({ x:i, y:i*2, kind:'dress', d:'cobweb', rot:0 }); g.traverse(o=>{ if (o.isMesh && o.material===ISO.pm.wspider) spider++; }); if (i===0){ FPD.scene.add(g); check('cobweb', g); FPD.scene.remove(g); } }
    out.spider = spider; out.webSize = ISO.webTex.image.width;
    for (const d of ['moss','puddle','drip','flood']){ const g = isoPropModel({ x:3, y:4, kind:'dress', d, rot:0 }); FPD.scene.add(g); check(d, g); FPD.scene.remove(g); }
    let best = null; for (let x=3;x<COLS-4 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-2;i<=2 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } }
    if (best){ G.player.x = best[0]; G.player.y = best[1]; } out.room = !!best; window.__gal = new THREE.Group(); FPD.scene.add(window.__gal);
    return out; }, ITEMS);
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.deepEqual(r.bad, {}, 'old shapes left: ' + JSON.stringify(r.bad));
  for (const [k, n] of Object.entries(r.draws)) assert.ok(n <= 10, k + ' is ' + n + ' draws');
  assert.ok(r.spider > 0, 'no web has its spider'); assert.equal(r.webSize, 256, 'the web is the old 64 canvas'); assert.ok(r.room, 'no room for the gallery');
  const shots = [['items', ITEMS.map(it=>({ kind:'item', it }))], ['decos', [{ kind:'dress', d:'cobweb', rot:0, x:5, y:2 }, { kind:'dress', d:'cobweb', rot:1.57, x:9, y:4 }, { kind:'dress', d:'moss', rot:0 }, { kind:'dress', d:'puddle', rot:0 }, { kind:'dress', d:'drip', rot:0 }, { kind:'dress', d:'moss', rot:0, x:7, y:1 }, { kind:'dress', d:'puddle', rot:0, x:4, y:9 }, { kind:'dress', d:'flood', rot:0 }]]];
  for (const [nm, list] of shots){ await page.evaluate(async list=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), gal = window.__gal; while (gal.children.length) gal.remove(gal.children[0]); const per = list.length > 8 ? 5 : 4, sp = list.length > 8 ? 0.72 : 1.05;
      let spi = -1; if (list[0].d==='cobweb'){ for (let i=0;i<40 && spi < 0;i++){ const g = isoPropModel({ x:i, y:i*2, kind:'dress', d:'cobweb', rot:0 }); let s = false; g.traverse(o=>{ if (o.material===ISO.pm.wspider) s = true; }); if (s) spi = i; } list[0].x = spi; list[0].y = spi*2; }
      list.forEach((p, i)=>{ const g = isoPropModel(Object.assign({ x:i, y:i*3 }, p)); g.position.set(G.player.x - 1.4 + (i%per)*sp, 0, G.player.y - 0.8 + Math.floor(i/per)*(list.length > 8 ? 0.72 : 1.2)); if (p.kind==='item') g.scale.setScalar(1.25); gal.add(g); });
      ISO.dist = list.length > 8 ? 4.6 : 5.5; for (let i=0;i<40;i++){ for (const g of gal.children) if (g.userData.anim) g.userData.anim(performance.now()/1000, 0); renderGame(); await wait(30); } }, list);
    await page.screenshot({ path: SHOTS + '/rs869-' + nm + '.png' }); }
  assert.equal(errs.length, 0, errs.join('|'));
};
