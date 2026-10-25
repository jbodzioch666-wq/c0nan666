// probe (RS-668): a walk-in site in its place on the land. ZK = mine | graveyard | lair | pyramid | dungeon (default mine); ZOPEN = how long
// it has been looked at (its doors part open, 0 = shut). Stands you on open land in front of the nearest one and shoots the game at each of
// the four camera turns (shots/zsite-<kind>-r<n>.png), then the site alone on a flat green from eight angles round it, shut and open,
// as one sheet (shots/zsite-<kind>-iso.png)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const kind = process.env.ZK || 'mine', open = +(process.env.ZOPEN || 0);
  const r = await page.evaluate(async ({ kind, open })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    const T = { mine:OW_MINE, graveyard:OW_GRAVEYARD, lair:OW_LAIR, pyramid:OW_PYRAMID, dungeon:OW_DUNGEON }[kind], m = G.ow.map;
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, [kind]).filter(s=>m[s.x][s.y]===T);
    let at = null; for (const s of sites){ if (at) break; let side = 0; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const a = owNb(s.x, s.y, dx, dy); if (a && m[a[0]][a[1]]===OW_MOUNTAIN) side++; }
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]]){ const q = owNb(s.x, s.y, dx, dy), b = owNb(s.x, s.y, -dx, -dy); if (at || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
        if (T===OW_MINE && !(b && m[b[0]][b[1]]===OW_MOUNTAIN)) continue; at = { s, q, side, n:sites.length }; } }
    if (!at) return { none:true, n:sites.length };
    G.owPos = { x:at.q[0], y:at.q[1] }; owReveal(at.q[0], at.q[1], 8); await fr(150);
    const PL = o3C(at.s.x, at.s.y), g = O3.doors && O3.doors.get(Math.floor(PL[0]) + ',' + Math.floor(PL[1]));
    if (g && g.doorWay && g.doorWay.anim) g.doorWay.anim(open, 0);
    const shots = {}; for (let k=0;k<4;k++){ ISO.rot = k; await fr(70); shots['r' + k] = O3.renderer.domElement.toDataURL('image/png'); }
    ISO.rot = 0;
    if (!g) return { at, shots, nog:true };
    /* the site alone */
    const TT = THREE, sc = O3.scene, P = new TT.Vector3(); g.updateMatrixWorld(true); g.getWorldPosition(P); const keep = new Set(); let q = g; while (q){ keep.add(q); q = q.parent; } g.traverse(o=>{ keep.add(o); o.frustumCulled = false; });
    sc.traverse(o=>{ if (!keep.has(o) && !o.isLight && (o.isMesh || o.isPoints || o.isSprite || o.isLine)) o.visible = false; });
    const gr = new TT.Mesh(new TT.PlaneGeometry(14, 14), new TT.MeshStandardMaterial({ color:0x5f7f3a, roughness:1 })); gr.rotation.x = -Math.PI/2; gr.position.set(P.x, P.y - 0.01, P.z); gr.receiveShadow = true; sc.add(gr);
    const R = O3.renderer, W = R.domElement.width, H = R.domElement.height, cam = new TT.PerspectiveCamera(34, W/H, 0.1, 100), s = g.scale.x; O3.ok = false;
    const sheet = document.createElement('canvas'); sheet.width = 1600; sheet.height = 800; const sx = sheet.getContext('2d');
    const frame = ()=>{ const im = new Image(); im.src = R.domElement.toDataURL('image/png'); return new Promise(res=>{ im.onload = ()=>res(im); }); };
    let n = 0; for (const op of [0, 3]){ g.doorWay && g.doorWay.anim && g.doorWay.anim(op, 0);
      for (let a=0;a<4;a++){ const yaw = g.rotation.y + [0, 0.7, -0.7, Math.PI][a], el = 0.42, d = 4.4*s; cam.position.set(P.x + Math.sin(yaw)*Math.cos(el)*d, P.y + Math.sin(el)*d + 0.4*s, P.z + Math.cos(yaw)*Math.cos(el)*d); cam.lookAt(P.x, P.y + 0.5*s, P.z);
        R.setRenderTarget(null); R.render(sc, cam); const im = await frame(); sx.drawImage(im, (n % 4)*400, Math.floor(n/4)*400, 400, 400*H/W); n++; } }
    shots.iso = sheet.toDataURL('image/png'); g.doorWay && g.doorWay.anim && g.doorWay.anim(0, 0);
    let meshes = 0; g.traverse(o=>{ if (o.isMesh) meshes++; });
    return { at, shots, meshes, rot:+g.rotation.y.toFixed(2) }; }, { kind, open });
  if (r.shots) for (const [k, u] of Object.entries(r.shots)) fs.writeFileSync(SHOTS + '/zsite-' + kind + '-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
