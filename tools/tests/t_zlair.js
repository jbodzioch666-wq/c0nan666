// probe (RS-674): the dragon's lair on the land and its walk-in. ZPOSE=1 adds close views of the dragon at eight moments of the walk-in, the crag hidden for the first four.
// Shoots the game standing beside the nearest lair (shots/zlair-land.png), the lair alone on a flat green from four sides, shut
// and opened (shots/zlair-iso.png), and twelve frames of the walk in as the game draws it (shots/zlair-walk.png), and the time a lair takes to build (build: with its dragon's template made afresh; again: from the template)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const pose = !!process.env.ZPOSE;
  const r = await page.evaluate(async ({ pose })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = {};
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 600, ['lair']).filter(s=>m[s.x][s.y]===OW_LAIR); let at = null, g = null;
    for (const s of sites){ const nb = N8.map(([dx, dy])=>({ dx, dy, q:owNb(s.x, s.y, dx, dy) })).filter(o=>o.q && open.includes(m[o.q[0]][o.q[1]]) && owDiagClear(o.q[0], o.q[1], -o.dx, -o.dy));   /* (a step in you can take: not a diagonal between two blocked tiles) */ if (!nb.length) continue;
      G.owPos = { x:nb[0].q[0], y:nb[0].q[1] }; owReveal(nb[0].q[0], nb[0].q[1], 8); await fr(120);
      const C = o3C(s.x, s.y); g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) continue;
      const f = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion); let best = null, bd = -9;   /* (the open tile most in front of it) */
      for (const o of nb){ const c = o3C(o.q[0], o.q[1]), dx = c[0] - C[0], dz = c[1] - C[1], d = (f.x*dx + f.z*dz)/Math.hypot(dx, dz); if (d > bd){ bd = d; best = o; } }
      at = { s, best, front:+bd.toFixed(2) }; break; }
    if (!at) return { none:true, n:sites.length };
    { const pt = MP(mpDragon, { scale:'#a02a1e', belly:'#e0b870', eyes:'255,220,60' }, 1.34), key = m3dTplKey(pt), n0 = O3.smoke.length; M3D.tpl.delete(key);
      let t = performance.now(); o3DragonLair(new THREE.Group(), o3Mats(), ()=>0.5, 0, 0); out.build = Math.round(performance.now() - t);
      t = performance.now(); o3DragonLair(new THREE.Group(), o3Mats(), ()=>0.5, 0, 0); out.again = Math.round(performance.now() - t); O3.smoke.length = n0; }
    out.front = at.front; G.owPos = { x:at.best.q[0], y:at.best.q[1] }; await fr(120); { const c = o3C(at.best.q[0], at.best.q[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }   /* (there, not still on the way from the last tile) */
    const C = o3C(at.s.x, at.s.y); g = O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    const R = O3.renderer, cv = R.domElement, W = cv.width, H = cv.height, snap = ()=>new Promise(res=>{ const im = new Image(); im.onload = ()=>res(im); im.src = cv.toDataURL('image/png'); });
    const shots = { land:cv.toDataURL('image/png') };
    /* the lair alone */
    { const TT = THREE, sc = O3.scene, P = new TT.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(P); const keep = new Set(); let q = g; while (q){ keep.add(q); q = q.parent; } g.traverse(o=>keep.add(o));
      const hid = []; sc.traverse(o=>{ if (!keep.has(o) && !o.isLight && o.visible && (o.isMesh || o.isPoints || o.isSprite || o.isLine)){ o.visible = false; hid.push(o); } });
      const gr = new TT.Mesh(new TT.PlaneGeometry(14, 14), new TT.MeshStandardMaterial({ color:0x5f7f3a, roughness:1 })); gr.rotation.x = -Math.PI/2; gr.position.set(P.x, P.y - 0.01, P.z); gr.receiveShadow = true; sc.add(gr);
      const cam = new TT.PerspectiveCamera(34, W/H, 0.1, 100), s = g.scale.x; O3.ok = false;
      const sheet = document.createElement('canvas'); sheet.width = 1600; sheet.height = 2*400*H/W; const sx = sheet.getContext('2d'); let n = 0;
      for (const op of [0, 1]){ if (g.doorWay.anim) g.doorWay.anim(op ? g.doorWay.openT*0.7 : 0, 0);
        for (let a=0;a<4;a++){ const yaw = g.rotation.y + [0, 0.75, -0.75, Math.PI][a], el = 0.38, d = 6.2*s; cam.position.set(P.x + Math.sin(yaw)*Math.cos(el)*d, P.y + Math.sin(el)*d + 0.5*s, P.z + Math.cos(yaw)*Math.cos(el)*d); cam.lookAt(P.x, P.y + 0.65*s, P.z);
          R.setRenderTarget(null); R.render(sc, cam); const im = await snap(); sx.drawImage(im, (n % 4)*400, Math.floor(n/4)*400*H/W, 400, 400*H/W); n++; } }
      shots.iso = sheet.toDataURL('image/png'); if (g.doorWay.anim) g.doorWay.anim(0, 0);
      if (pose){ const ps = document.createElement('canvas'); ps.width = 1600; ps.height = 2*400*H/W; const px = ps.getContext('2d'); let n2 = 0; const L = new TT.Vector3();
        const rk = []; g.traverse(o=>{ if (o.isMesh && o.material===o3Mats().basalt && o.visible){ rk.push(o); } }); for (const lk of [0, 0.8, 1.6, 2.2, 2.8, 3.6, 4.4, 5.2]){ for (const o of rk) o.visible = n2 >= 4; if (g.doorWay.anim){ g.doorWay.anim(0, 0); for (let t=0;t<=lk;t+=1/60) g.doorWay.anim(t, 0); }
          const yaw = g.rotation.y + (n2 < 4 ? Math.PI/2 : 0.35), d = 2.8*s; L.set(0, 0.45, 0.0); g.localToWorld(L); cam.position.set(L.x + Math.sin(yaw)*d, L.y + 0.35*s, L.z + Math.cos(yaw)*d); cam.lookAt(L);
          R.render(sc, cam); const im = await snap(); px.drawImage(im, (n2 % 4)*400, Math.floor(n2/4)*400*H/W, 400, 400*H/W); px.fillStyle = '#fff'; px.font = '16px sans-serif'; px.fillText(lk + 's', (n2 % 4)*400 + 8, Math.floor(n2/4)*400*H/W + 20); n2++; }
        shots.pose = ps.toDataURL('image/png'); if (g.doorWay.anim) g.doorWay.anim(0, 0); }
      sc.remove(gr); for (const o of hid) o.visible = true; O3.ok = true; await fr(30); }
    /* the walk in, as the game draws it */
    moveDir(-at.best.dx, -at.best.dy); out.walk = !!O3.doorWalk; if (!O3.doorWalk){ out.why = { ui:G.ui, pend:G.pendingDungeon, pos:G.owPos, site:at.s, mode:G.gameMode, trans:transOn(), act:o3Active() }; return Object.assign(out, { shots }); }
    const dw = g.doorWay, marks = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.88, 1.0].map(f=>f*dw.openT), vm = [0.25, 0.55], film = document.createElement('canvas'); film.width = 1600; film.height = 3*400*H/W; const fx = film.getContext('2d');
    let k = 0, j = 0, frames = 0, worst = 0, last = performance.now(); const put = async label=>{ const im = await snap(); const x = (k % 4)*400, y = Math.floor(k/4)*400*H/W; fx.drawImage(im, x, y, 400, 400*H/W); fx.fillStyle = 'rgba(0,0,0,0.6)'; fx.fillRect(x, y, 120, 22); fx.fillStyle = '#fff'; fx.font = '14px sans-serif'; fx.fillText(label, x + 6, y + 16); k++; };
    await put('walk');
    const t0 = performance.now(); while (performance.now() - t0 < 30000 && G.gameMode===0 && k < 12){ await fr(1); const now = performance.now(); worst = Math.max(worst, now - last); last = now; frames++;
      const Wk = O3.doorWalk; if (!Wk) break;
      if (j < marks.length && Wk.look >= marks[j] && Wk.v===0){ await put('look ' + Wk.look.toFixed(1) + 's'); j++; }
      else if (j >= marks.length && Wk.v >= vm[j - marks.length]){ await put('in ' + Wk.v.toFixed(2)); j++; } }
    shots.walk = film.toDataURL('image/png'); out.frames = k;
    const t1 = performance.now(); while (performance.now() - t1 < 15000 && G.gameMode===0) await fr(1);
    out.mode = G.gameMode; out.kind = G.siteKind;
    return Object.assign(out, { shots }); }, { pose });
  if (r.shots) for (const [k, u] of Object.entries(r.shots)) fs.writeFileSync(SHOTS + '/zlair-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
