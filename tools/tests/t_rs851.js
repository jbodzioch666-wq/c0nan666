// RS-851: the skeleton's left hand is a left hand that reads as one - turned palm down at the wrist, its fist round the shield's bar,
// thumb up and in toward the body (it lay palm up, which read as a right hand); a king's siege of a town of your own realm walked
// through from the gate (the dialog, the battle's waves and the streets, the town kept, no border moved); and the borders redrawn
// after a conquest on a planet timed (once for the chart: the cached realms after)
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); const out = {}, T = THREE;
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    /* the hand */ { const t0 = performance.now(); while (!(sk3Init() && SK3.ok) && performance.now() - t0 < 60000){ renderGame(); await wait(30); }
      const e = sk3Instance({ nm:'skeleton warrior', x:0, y:0 }); sk3Pose(0, 0, 0, 0, 0, e.rig); e.holder.updateMatrixWorld(true);
      const h = e.rig.L.hand, b = h.children.find(o=>o.isMesh && o.material && o.material.vertexColors), m = new T.Matrix3().setFromMatrix4(b.matrixWorld), d = v=>new T.Vector3(...v).applyMatrix3(m).normalize();
      const palm = d([0, 0, 1]), thumb = d([1, 0, 0]), joint = h.getWorldPosition(new T.Vector3()), wrist = b.getWorldPosition(new T.Vector3());
      const bar = h.children.find(o=>o.geometry && o.geometry.type==='CylinderGeometry' && Math.abs(o.rotation.z - Math.PI/2) < 0.01);
      out.hand = { palmY:+palm.y.toFixed(2), thumbX:+thumb.x.toFixed(2), thumbY:+thumb.y.toFixed(2), gap:+joint.distanceTo(wrist).toFixed(4), barZ:bar ? bar.position.z : null }; }
    /* a castle taken: you rule its realm */ const pv = owProvinces().list[0], cs = [pv.seat.x, pv.seat.y], p = G.player;
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1); dgFinish(false); setUi('playing');
    const mine = owProvinces().list.find(q=>provHeld(q)); out.rule = !!mine;
    if (!mine) return out;
    /* a king marches on a town of yours (one with a town to spare: pick till it is) */
    const e = wevP(), rw = realmWarState(); let d = null;
    if ((mine.towns||[]).length < 2){ const L = owProvinces().list, give = L.find(q=>q.id!==mine.id && (q.towns||[]).length > 1); rw.taken[give.towns[0]] = mine.id; rw.n++; owProvinces.c = null; }
    const mine2 = owProvinces().list.find(q=>provHeld(q)); out.townsMine = mine2.towns.length;
    for (let i=0;i<200 && !d;i++){ e.dyn = e.dyn.filter(x=>x.kind!=='siege'); rw.next = 0; const c = realmWarTick(); if (c && c.war.b===mine2.id) d = c; }
    out.war = !!d; if (!d) return out;
    out.yoursLog = G.log.slice(-6).some(l=>/a town of your realm/.test(l.msg));
    setUi('realms'); out.panelYours = /your town/.test(document.getElementById('overlay').innerHTML); setUi('playing');
    /* to the gate, and in */ G.gameMode = 0; G.owPos = { x:d.x, y:d.y }; p.hp = p.maxHp = 99999; wevTownGate(d.x, d.y); out.dialog = G.ui==='wevent';
    SET.loadCards = false; const opt = G.wevDlg.opts ? G.wevDlg.opts[0] : (G.wevDlg.options||G.wevDlg.choices||[])[0]; try{ (opt[1] || opt.fn)(); }catch(er){ out.optErr = String(er); }
    await wait(50); setUi('playing'); out.battle = !!G.siegeWar && G.gameMode===2;
    let rounds = 0; while (wevP().dyn.includes(d) && rounds < 40){ rounds++; for (const m of G.mon) if (m.alive && !m.ally){ m.hp = 0; m.alive = false; } p.hp = p.maxHp; setUi('playing'); for (let f=0; f<4; f++){ await wait(40); } }
    out.rounds = rounds; out.saved = !wevP().dyn.includes(d); out.kept = provIdAt(d.x, d.y)===mine2.id; out.chron = /you broke/.test((realmWarState().log[0]||{}).s||'');
    out.stays = G.log.slice(-30).some(l=>/stays in your realm/.test(l.msg));
    /* a planet's borders after a conquest */
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); wgRegenerate(4242); const L = owProvinces().list, A = L[0], B = L.find(q=>q.id!==A.id && (q.towns||[]).length > 1);
    G.ow.ev = G.ow.ev || {}; const ev = wevP(), rw2 = realmWarState(); rw2.taken[B.towns[0]] = A.id; rw2.n++;
    owProvinces.c = null; let t0 = performance.now(); const P2 = owProvinces(); out.planetMs = Math.round(performance.now() - t0);
    t0 = performance.now(); owProvinces(); out.cachedMs = +(performance.now() - t0).toFixed(2);
    const [bx, by] = B.towns[0].split(',').map(Number); out.planetMoved = provIdAt(bx, by)===A.id && P2.list.length===L.length;
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  const h = r.hand; assert.ok(h.palmY < -0.2, 'the left palm faces up'); assert.ok(h.thumbX < 0, 'the left thumb points out, not toward the body'); assert.ok(h.gap < 0.001, 'the hand off its wrist'); assert.ok(h.barZ < 0, 'the shield bar not in the turned fist');
  assert.ok(r.rule && r.war, 'no war on your town'); assert.ok(r.yoursLog && r.panelYours, 'your town not named as yours'); assert.ok(r.dialog && r.battle, 'the gate or the battle ' + (r.optErr||''));
  assert.ok(r.saved && r.kept && r.chron && r.stays, 'the town not saved by breaking the siege'); assert.ok(r.planetMoved, 'the planet\'s border did not move'); assert.ok(r.planetMs < 3000, 'the planet\'s borders took ' + r.planetMs + ' ms'); };
