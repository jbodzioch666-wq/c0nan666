// RS-694: the Dwarf Gate set into its mountain. The cliff the gate is cut into is the land itself - made finer round the gate and raised
// in the mountain's rock behind the dressed face (o3LandMines) - not a crag of the gate's own. Checked by rays on the land: the face rises
// behind the gate and the ground in front is level; the doorway is open into the hall and the face beside it is not; no holes anywhere
// in the finer patch (a cell's two triangles both go, and both come back); and its edge meets the land round it. The ground you walk on
// is the land as it was. Shot: shots/rs694.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP], sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['mine']).filter(s=>m[s.x][s.y]===OW_MINE); let at = null;
    for (const s of sites){ if (at) break; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const q = owNb(s.x, s.y, dx, dy), b = owNb(s.x, s.y, -dx, -dy); if (!at && q && b && open.includes(m[q[0]][q[1]]) && m[b[0]][b[1]]===OW_MOUNTAIN) at = { s, q }; } }
    if (!at) return { none:true };
    G.owPos = { x:at.q[0], y:at.q[1] }; owReveal(at.q[0], at.q[1], 8); await fr(150);
    const T = THREE, C = o3C(at.s.x, at.s.y), tx = Math.floor(C[0]), tz = Math.floor(C[1]), g = O3.doors && O3.doors.get(tx + ',' + tz), out = {};
    const geo = O3.land.geometry; out.mines = (geo.userData.mines || []).some(([x, y])=>x===tx && y===tz);
    /* (RS-695) every mine in the land built round you has its cliff - one near another, or near a barrow's stair, had none */
    { const L = geo.userData.mines || [], w = O3.win || O3.lastWin; let all = 0, got = 0; const [lx, ly] = [Math.floor(O3.ppos.x) - 40, Math.floor(O3.ppos.z) - 40];
      for (let x=lx;x<lx+80;x++) for (let y=ly;y<ly+80;y++) if (o3Tile(x, y)===OW_MINE){ all++; if (L.some(([a, b])=>a===x && b===y)) got++; } out.allMines = all; out.gotMines = got; }
    out.ownCrag = 0; if (g) g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors) out.ownCrag++; });
    /* the land round the gate as a mesh of its own, to cast rays on */
    const P = geo.attributes.position, I = geo.index.array, S = O3_MINE_S, ry = o3SiteYaw(OW_MINE, tx, tz), co = Math.cos(ry), si = Math.sin(ry), cx = tx + 0.5, cz = tz + 0.5, pad = O3.heightAt(cx, cz);
    const W = (u, v)=>[cx + S*(u*co + v*si), cz + S*(-u*si + v*co)], near = k=>Math.abs(P.getX(k) - cx) < 3.2 && Math.abs(P.getZ(k) - cz) < 3.2, ix = [];
    for (let q=0;q<I.length;q+=3) if (near(I[q]) || near(I[q+1]) || near(I[q+2])) ix.push(I[q], I[q+1], I[q+2]);
    const sub = new T.BufferGeometry(); sub.setAttribute('position', P); sub.setIndex(ix); const mesh = new T.Mesh(sub, new T.MeshBasicMaterial({ side:T.DoubleSide })), rc = new T.Raycaster();
    let twice = 0; const down = (wx, wz)=>{ rc.set(new T.Vector3(wx, 20, wz), new T.Vector3(0, -1, 0)); const hs = rc.intersectObject(mesh); if (hs.length > 1 && hs[1].distance - hs[0].distance > 1e-3) twice++; return hs[0] ? hs[0].point.y : null; };
    const hAt = (u, v)=>{ const [wx, wz] = W(u, v); return down(wx, wz); };
    out.pad = +pad.toFixed(2); out.behind = [[0, -0.3], [0.3, -0.5], [-0.3, -0.5], [0, -0.9]].map(([u, v])=>+(hAt(u, v) - pad).toFixed(2)); out.front = [[0, 0.7], [0.3, 0.75], [-0.3, 0.75]].map(([u, v])=>+(hAt(u, v) - O3.heightAt(...W(u, v))).toFixed(2));   /* (the land as it was) */
    /* the doorway: a ray in through it meets no land in the hall; one beside it meets the face */
    const across = (u)=>{ const [ax, az] = W(u, 1.0), [bx, bz] = W(u, -0.4), d = new T.Vector3(bx - ax, 0, bz - az), L = d.length(); rc.set(new T.Vector3(ax, pad + 0.5*S, az), d.normalize()); rc.far = L; const h = rc.intersectObject(mesh)[0]; rc.far = Infinity; return h ? +(1.0 - h.distance/S).toFixed(2) : null; };
    out.door = across(0); out.beside = Math.max(across(0.36), across(-0.36));   /* (behind the dressed stone, either side of the doorway) */
    /* no holes: rays straight down over the whole patch, bar the doorway itself */
    let miss = 0, n = 0, seam = 0; for (let wx=cx - 2.4; wx<=cx + 2.4; wx+=0.047) for (let wz=cz - 2.4; wz<=cz + 2.4; wz+=0.047){ const dx = wx - cx, dz = wz - cz, u = (dx*co - dz*si)/S, v = (dx*si + dz*co)/S;
      if (Math.abs(u) < 0.3 && v > 0.1 && v < 0.45) continue; n++; if (down(wx, wz)==null) miss++; }
    out.miss = miss; out.rays = n; out.twice = twice;
    /* its edge: every point of the finer patch not raised lies on the land as it was (on a cell's side, where the plain grid's triangles meet it, exactly) */
    { const RK = geo.userData.rock; let ne = 0; for (let k=RK.at;k<P.count;k++){ const x = P.getX(k), z = P.getZ(k), dx = x - cx, dz = z - cz, u = (dx*co - dz*si)/S, v = (dx*si + dz*co)/S; if (Math.abs(dx) > 3.2 || Math.abs(dz) > 3.2 || (Math.abs(u) <= 1.45 && v >= -1.6 && v <= 0.8)) continue;   /* (this gate's patch, out past the cliff's own ground) */ if (Math.abs(x*O3_R - Math.round(x*O3_R)) > 1e-4 && Math.abs(z*O3_R - Math.round(z*O3_R)) > 1e-4) continue; ne++; seam = Math.max(seam, Math.abs(P.getY(k) - O3.heightAt(x, z))); } out.edgePts = ne; } out.seam = +seam.toFixed(4);
    out.walk = +(O3.heightAt(...W(0, 0.1)) - pad).toFixed(3);   /* (the ground you walk on: level at the door) */
    /* the open tiles round it: their middles (where a tree or a rock to gather stands, and you) not buried in the cliff */
    out.tiles = 0; out.buried = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++){ const q = o3Tile(tx + i, tz + j); if ((!i && !j) || q==null || q===OW_MOUNTAIN || q===OW_WATER || q===OW_RIVER) continue; const h = down(tx + i + 0.5, tz + j + 0.5); if (h==null) continue; out.tiles++; out.buried = Math.max(out.buried, +(h - O3.heightAt(tx + i + 0.5, tz + j + 0.5)).toFixed(3)); }
    out.veg = 0; O3.scene.traverse(o=>{ if (o.isInstancedMesh && o.count){ const mm = new T.Matrix4(), v = new T.Vector3(); for (let k=0;k<o.count;k++){ o.getMatrixAt(k, mm); v.setFromMatrixPosition(mm).applyMatrix4(o.matrixWorld); if (Math.abs(v.x - cx) < 2.6 && Math.abs(v.z - cz) < 2.6 && o3NearMine(v.x, v.z, 0)) out.veg++; } } });   /* (nothing grown in it) */
    /* (RS-695) a second mine five tiles off: its patch and the gate's overlap - both have their cliffs, the land between whole */
    { let put = null; for (let d=4; d<=5 && !put; d++) for (const [i, j] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, 1], [-d, 1], [1, d], [1, -d]]){ const x = tx + i, y = tz + j, q = o3Tile(x, y); if (put || ![OW_GRASS, OW_DESERT, OW_FOREST, OW_TUNDRA].includes(q)) continue;
        let near = false; for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++) if (OW_SITE_TILES.includes(o3Tile(x + a, y + b)) && (x + a!==tx || y + b!==tz)) near = true; if (!near) put = [x, y, q]; }
      if (put){ const g2 = o3G(put[0], put[1]); m[g2[0]][g2[1]] = OW_MINE; O3.win = null; await fr(120);
        const L = O3.land.geometry.userData.mines || []; out.pair = [L.some(([a, b])=>a===tx && b===tz), L.some(([a, b])=>a===put[0] && b===put[1])];
        const P2 = O3.land.geometry.attributes.position, I2 = O3.land.geometry.index.array, mx = (tx + put[0])/2 + 0.5, mz = (tz + put[1])/2 + 0.5, nr = k=>Math.abs(P2.getX(k) - mx) < 4.5 && Math.abs(P2.getZ(k) - mz) < 4.5, ix2 = [];
        for (let q=0;q<I2.length;q+=3) if (nr(I2[q]) || nr(I2[q+1]) || nr(I2[q+2])) ix2.push(I2[q], I2[q+1], I2[q+2]);
        const sub2 = new T.BufferGeometry(); sub2.setAttribute('position', P2); sub2.setIndex(ix2); const mesh2 = new T.Mesh(sub2, new T.MeshBasicMaterial({ side:T.DoubleSide }));
        let miss2 = 0, n2 = 0; const doorAt = (wx, wz)=>[[tx, tz], [put[0], put[1]]].some(([sx, sz])=>{ const r2 = o3SiteYaw(OW_MINE, sx, sz), dx = wx - sx - 0.5, dz = wz - sz - 0.5, u = (dx*Math.cos(r2) - dz*Math.sin(r2))/S, v = (dx*Math.sin(r2) + dz*Math.cos(r2))/S; return Math.abs(u) < 0.3 && v > 0.1 && v < 0.45; });
        for (let wx=mx - 4; wx<=mx + 4; wx+=0.07) for (let wz=mz - 4; wz<=mz + 4; wz+=0.07){ if (doorAt(wx, wz)) continue; n2++; rc.set(new T.Vector3(wx, 20, wz), new T.Vector3(0, -1, 0)); if (!rc.intersectObject(mesh2)[0]) miss2++; }
        rc.set(new T.Vector3(put[0] + 0.5, 20, put[1] + 0.5), new T.Vector3(0, -1, 0)); const hm = rc.intersectObject(mesh2)[0]; out.pairRise = hm ? +(hm.point.y - O3.heightAt(put[0] + 0.5, put[1] + 0.5)).toFixed(2) : null;   /* (its own tile raised behind its door) */
        out.pairMiss = miss2; out.pairRays = n2; m[g2[0]][g2[1]] = put[2]; O3.win = null; await fr(120); } }
    { const c2 = O3.cam.clone(), [fx, fz] = W(0, 3.4); c2.position.set(fx, pad + 2.2*S, fz); c2.lookAt(cx, pad + 0.7*S, cz); c2.updateProjectionMatrix(); O3.renderer.render(O3.scene, c2); out.shot = O3.renderer.domElement.toDataURL('image/png'); }
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs694.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.none, 'a mine at the foot of a mountain');
  A(r.gotMines===r.allMines, 'every mine about you has its cliff: ' + r.gotMines + ' of ' + r.allMines);
  A(r.mines && r.ownCrag===0, 'the land is raised round the gate, and the gate brings no crag of its own');
  A(r.behind.every(h=>h > 1.2) && r.front.every(h=>Math.abs(h) < 0.06), 'the mountain\'s face rises behind the gate, the ground before it as it was');
  A(r.door===null && r.beside!==null && r.beside > 0 && r.beside < 0.4, 'the doorway open into the hall, the face beside it solid');
  A(r.rays > 5000 && r.miss===0 && r.twice===0, 'no holes in the land round the gate, nor land laid twice');
  A(r.edgePts > 50 && r.seam < 0.001, 'its edge meets the land round it');
  A(Math.abs(r.walk) < 0.05, 'the ground you walk on level at the door');
  A(r.tiles >= 4 && r.buried < 0.12, 'the open tiles round it not buried in the cliff: ' + r.buried);
  A(r.veg===0, 'no tree, bush, rock or grass in the cliff');
  A(r.pair && r.pair[0] && r.pair[1] && r.pairRise > 0.5 && r.pairRays > 5000 && r.pairMiss===0, 'a mine five tiles from another: both have their cliffs, the land between them whole');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
