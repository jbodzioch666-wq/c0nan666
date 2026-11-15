// RS-868: the dungeon's furnishings made properly - every chest one builder (grained boards, domed lid, studded bands, corner brackets,
// hasp and padlock, drop handles), a lathe-turned cask, a braced crate, sculpted rubble and skulls, knobbed bones, a fluted column, a
// brazier on scrolled legs, a moulded altar, an idol, racks with real weapons, sacks, signs, banners and headstones. No prop keeps a plain
// box or a few-sided cylinder in its fixed parts, each is a few draws, an open chest's lid still swings, and the catacombs' skulls are
// the sculpted skull. Shots: shots/rs868-a.png, rs868-b.png, rs868-c.png
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; const out = { bad:{}, draws:{} };
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
    const kinds = [['chest', {}], ['chest', { corrupt:true }], ['gold', {}], ['sign', {}], ['banner', {}], ['altar', {}], ['idol', {}]];
    for (const d of ['barrel','crate','rubble','chains','rack','bench','sacks','shrine','column','heap','skulls','brazier','pgrave','lchest','raidchest','raidgate','plate0','chesto_v','chests_v','chesto_i','chesto_c','chesto_r']) kinds.push(['dress', { d, rot:0 }]);
    const glowy = m=>m.isMeshBasicMaterial || m.transparent || (m.emissiveIntensity > 0.5 && m.emissive && m.emissive.getHex()) ;
    for (const [kind, o] of kinds){ const nm = kind==='dress' ? o.d : kind + (o.corrupt ? 'C' : ''); let g; try{ g = isoPropModel(Object.assign({ x:3, y:5, kind }, o)); }catch(e){ out.bad[nm] = 'threw ' + String(e).slice(0, 160); continue; }
      let draws = 0, plain = 0, thin = []; const rbs = new Set(Object.values(V3_RB)); g.traverse(m=>{ if (!m.isMesh) return; let live = false; for (let q = m; q && q!==g; q = q.parent) if (q.userData.live) live = true; if (live) return; draws++; const G2 = m.geometry;
        if (G2.type==='BoxGeometry' && !rbs.has(G2) && !glowy(m.material)) plain++; if (G2.type==='CylinderGeometry' && G2.parameters.radialSegments < 16 && G2.parameters.radiusTop > 0.012) thin.push(G2.parameters.radialSegments); });
      out.draws[nm] = draws; if (plain || thin.length || !draws) out.bad[nm] = { plain, thin, draws }; isoFreeProp(g); }
    /* an open chest still swings its lid */ { const g = isoPropModel({ x:0, y:0, kind:'dress', d:'chesto_v', rot:0 }); chestOpenedAt = ()=>performance.now() - 3000; g.userData.anim(0, 0, 1, 1); out.lid = +g.userData.hinge.rotation.x.toFixed(2); let n = 0; g.userData.hinge.traverse(m=>{ if (m.isMesh) n++; }); out.lidDraws = n; }
    /* the skull: shaped, not a ball */ { const sg = dgkSkullGeo(); sg.computeBoundingBox(); const b = sg.boundingBox; out.skull = { w:+(b.max.x - b.min.x).toFixed(2), d:+(b.max.z - b.min.z).toFixed(2), n:sg.attributes.position.count }; }
    /* a gallery in a room of this floor: the widest open floor near you */
    let best = null; for (let x=3;x<COLS-4;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-2;i<=2 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } if (best) break; }
    out.room = !!best; if (best){ G.player.x = best[0]; G.player.y = best[1]; }
    const gal = new THREE.Group(); FPD.scene.add(gal); window.__gal = gal; out.best = best;
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.deepEqual(r.bad, {}, 'props with plain boxes or thin cylinders: ' + JSON.stringify(r.bad));
  for (const [k, n] of Object.entries(r.draws)) assert.ok(n <= 12, k + ' is ' + n + ' draws');
  assert.ok(r.lid < -1.5, 'an open chest does not swing its lid ' + r.lid); assert.ok(r.lidDraws <= 6, 'the lid is ' + r.lidDraws + ' draws');
  assert.ok(r.skull.n > 600 && r.skull.d > r.skull.w, 'the skull is a ball ' + JSON.stringify(r.skull));
  assert.ok(r.room, 'no room for the gallery');
  const sets = [['chest:', 'chest:c', 'dress:lchest', 'dress:chesto_v', 'dress:raidchest', 'gold:', 'dress:barrel', 'dress:crate'], ['dress:brazier', 'altar:', 'idol:', 'dress:shrine', 'dress:skulls', 'dress:rubble', 'dress:heap', 'dress:column'], ['dress:rack', 'dress:bench', 'dress:sacks', 'sign:', 'banner:', 'dress:pgrave', 'dress:chains', 'dress:chesto_r']];
  for (let si=0; si<sets.length; si++){ await page.evaluate(async set=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), gal = window.__gal; while (gal.children.length) gal.remove(gal.children[0]);
      set.forEach((k, i)=>{ const [kind, d] = k.split(':'); const o = kind==='dress' ? { kind, d, rot:0 } : { kind, corrupt:d==='c' }; const g = isoPropModel(Object.assign({ x:i, y:i*3 }, o)); g.position.set(G.player.x - 1.6 + (i%4)*1.05, 0, G.player.y - 0.6 + Math.floor(i/4)*1.3); g.userData.anim && (gal.userData['a' + i] = g.userData.anim); gal.add(g); });
      ISO.dist = 5.5; for (let i=0;i<40;i++){ for (const k in gal.userData) gal.userData[k](performance.now()/1000, 0, -1, -1); renderGame(); await wait(30); } }, sets[si]);
    await page.screenshot({ path: SHOTS + '/rs868-' + 'abc'[si] + '.png' }); }
};
