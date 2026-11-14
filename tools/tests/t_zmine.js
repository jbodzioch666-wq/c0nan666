// probe (RS-694): the Dwarf Gate in its mountain. ZSEED pins the world (Math.random seeded before it is made, so two builds of the game make
// the same world); ZN picks the nth nearest mine (default 0); ZOPEN how far its doors are open (0 shut, 3 open); ZTAG names the shots.
// Shoots the game at the four camera turns (shots/zmine-<tag>-r<n>.png), then the land and the gate alone (nothing else drawn) from six
// angles round it, as one sheet (shots/zmine-<tag>-sheet.png)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const tag = process.env.ZTAG || 'a', open = +(process.env.ZOPEN || 0), seed = +(process.env.ZSEED || 1), nth = +(process.env.ZN || 0);
  const r = await page.evaluate(async ({ open, seed, nth })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    let s0 = seed >>> 0; const rr = Math.random; Math.random = ()=>{ s0 = (s0 + 0x6D2B79F5) | 0; let x = Math.imul(s0 ^ (s0 >>> 15), 1 | s0); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0)/4294967296; };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); Math.random = rr; setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['mine']).filter(s=>m[s.x][s.y]===OW_MINE); let at = null, k = 0;
    for (const s of sites){ if (at) break; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]]){ const q = owNb(s.x, s.y, dx, dy), b = owNb(s.x, s.y, -dx, -dy); if (at || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]]) || !(b && m[b[0]][b[1]]===OW_MOUNTAIN)) continue; if (k++ < nth) break; at = { s, q }; } }
    if (!at) return { none:true, n:sites.length };
    G.owPos = { x:at.q[0], y:at.q[1] }; owReveal(at.q[0], at.q[1], 8); await fr(150);
    const PL = o3C(at.s.x, at.s.y), g = O3.doors && O3.doors.get(Math.floor(PL[0]) + ',' + Math.floor(PL[1]));
    if (g && g.doorWay && g.doorWay.anim) g.doorWay.anim(open, 0);
    const shots = {}; for (let k=0;k<4;k++){ ISO.rot = k; await fr(70); shots['r' + k] = O3.renderer.domElement.toDataURL('image/png'); }
    ISO.rot = 0; if (!g) return { at, shots, nog:true };
    const TT = THREE, sc = O3.scene, P = new TT.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(P); const keep = new Set(); let q = g; while (q){ keep.add(q); q = q.parent; } g.traverse(o=>{ keep.add(o); o.frustumCulled = false; });
    q = O3.land; while (q){ keep.add(q); q = q.parent; }
    sc.traverse(o=>{ if (!keep.has(o) && !o.isLight && (o.isMesh || o.isPoints || o.isSprite || o.isLine)) o.visible = false; });
    const R = O3.renderer, W = R.domElement.width, H = R.domElement.height, cam = new TT.PerspectiveCamera(34, W/H, 0.1, 100), s = g.scale.x; O3.ok = false;
    const sheet = document.createElement('canvas'); sheet.width = 1500; sheet.height = 1000*H/W*1.0; const sx = sheet.getContext('2d');
    const frame = ()=>{ const im = new Image(); im.src = R.domElement.toDataURL('image/png'); return new Promise(res=>{ im.onload = ()=>res(im); }); };
    const views = [[0, 0.35, 4.2], [0.75, 0.4, 4.2], [-0.75, 0.4, 4.2], [0, 0.15, 2.2], [Math.PI*0.75, 0.6, 5.5], [Math.PI, 0.7, 5.5]];
    for (let n=0;n<views.length;n++){ const [da, el, d0] = views[n], yaw = g.rotation.y + da, d = d0*s; cam.position.set(P.x + Math.sin(yaw)*Math.cos(el)*d, P.y + Math.sin(el)*d + 0.4*s, P.z + Math.cos(yaw)*Math.cos(el)*d); cam.lookAt(P.x, P.y + 0.6*s, P.z);
      R.setRenderTarget(null); R.render(sc, cam); const im = await frame(); sx.drawImage(im, (n % 3)*500, Math.floor(n/3)*500*H/W, 500, 500*H/W); }
    shots.sheet = sheet.toDataURL('image/png'); g.doorWay && g.doorWay.anim && g.doorWay.anim(0, 0);
    return { at, shots, rot:+g.rotation.y.toFixed(2), mines:(O3.land.geometry.userData.mines || []).length, verts:O3.land.geometry.attributes.position.count }; }, { open, seed, nth });
  if (r.shots) for (const [k, u] of Object.entries(r.shots)) fs.writeFileSync(SHOTS + '/zmine-' + tag + '-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
