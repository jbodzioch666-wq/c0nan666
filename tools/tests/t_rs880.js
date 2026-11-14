// RS-880: the open land without the clipping. Trees, rocks and bushes stand in the pockets between the walking lanes (you walk tile middle to
// tile middle, eight ways), so none is walked through; nothing grows over a barrow's yard or a dragon's crag, and no gathering spot stands on
// the tiles round them; you stop beside a gathering tree, not in it; and the leaves between the camera and you thin away.
// Shots: shots/rs880-barrow.jpg (a barrow from above), shots/rs880-wood.jpg (you in a wood)
const path = require('path'), fs = require('fs'), SHOTS = path.join(__dirname, 'shots');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const T = THREE, m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP, OW_MOUNTAINPASS], N8 = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]], out = { shots:{} };
    const veg = ()=>{ const P = new Map(), M = new T.Matrix4(), v = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(); O3.world.traverse(o=>{ if (!o.isInstancedMesh || !(o.userData.kind in O3_VEG_R)) return; const k = o.userData.kind;
        const n = o.userData.icull ? o.userData.icull.n : o.count, arr = o.userData.icull ? o.userData.icull.m : o.instanceMatrix.array; for (let i=0;i<n;i++){ M.fromArray(arr, i*16); M.decompose(v, q, s); P.set(k + v.x.toFixed(3) + v.z.toFixed(3), [k, v.x, v.z, O3_VEG_R[k]*s.x]); } }); return [...P.values()]; };
    const lanes = ()=>{ let n = 0, tot = 0, worst = 9; const ex = []; for (const [k, x, z, R] of veg()){ const tx = Math.floor(x), tz = Math.floor(z), t = o3Tile(tx, tz); if (t===OW_MOUNTAIN || t===OW_WATER || t===OW_RIVER || t==null) continue; tot++;
        const u = x - tx - 0.5, w = z - tz - 0.5, ln = Math.min(Math.abs(u), Math.abs(w), Math.abs(u - w)/Math.SQRT2, Math.abs(u + w)/Math.SQRT2) - R; worst = Math.min(worst, ln); if (ln < 0.06){ n++; if (ex.length < 5) ex.push([k, +u.toFixed(2), +w.toFixed(2), +R.toFixed(3)]); } } return { n, tot, worst:+worst.toFixed(3), ex }; };
    const shot = (k, C, hgt, back)=>{ const cam = new T.PerspectiveCamera(40, 1.4, 0.05, 80), gy = O3.heightAt(C[0], C[1]); cam.position.set(C[0] + 0.01, gy + hgt, C[1] + back); cam.lookAt(C[0], gy, C[1]); O3.renderer.render(O3.scene, cam); out.shots[k] = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); };
    /* the lanes, round where you start */
    await fr(120); out.start = lanes();
    /* a barrow: nothing over its yard, no gathering spot beside it */
    let bw = null, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_DUNGEON){ const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd && N8.some(([a, b])=>{ const q = owNb(x, y, a, b); return q && m[q[0]][q[1]]===OW_FOREST; })){ bd = d; bw = [x, y]; } }
    if (bw){ const nb = N8.map(([a, b])=>owNb(bw[0], bw[1], a, b)).find(q=>q && open.includes(m[q[0]][q[1]])); G.owPos = { x:nb[0], y:nb[1] }; owReveal(nb[0], nb[1], 8); O3.ppos = null; await fr(150);
      const C = o3C(bw[0], bw[1]); out.barrow = { at:bw, trees:veg().filter(p=>p[0]!=='bush' && p[0]!=='rock' && Math.hypot(p[1] - C[0], p[2] - C[1]) < 1.15).length, lanes:lanes() }; shot('barrow', C, 7, 2.2); }
    /* no gathering spot on the tiles round a barrow or a crag, anywhere in the world */
    let bad = 0, tot = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (m[x][y]!==OW_DUNGEON && m[x][y]!==OW_LAIR) continue; tot++; for (const [a, b] of N8){ const q = owNb(x, y, a, b); if (q && skNodeStatic(q[0], q[1])) bad++; } } out.mound = { bad, tot };
    /* you stop beside a gathering tree you walk onto, not in its trunk */
    let tree = null; for (let d=1; d<40 && !tree; d++) for (let x=G.owPos.x - d; x<=G.owPos.x + d && !tree; x++) for (const y of [G.owPos.y - d, G.owPos.y + d]){ const n = m[x] && m[x][y]!==undefined && skNodeAt(x, y); if (!n || n.k!=='woodcutting' || n.gone) continue;
      const nb = N8.map(([a, b])=>[owNb(x, y, a, b), a, b]).find(([q, a, b])=>q && open.includes(m[q[0]][q[1]]) && !skNodeAt(q[0], q[1]) && owDiagClear(q[0], q[1], -a, -b)); if (nb){ tree = { x, y, from:nb[0], a:nb[1], b:nb[2] }; break; } }
    if (tree){ G.owPos = { x:tree.from[0], y:tree.from[1] }; owReveal(tree.from[0], tree.from[1], 8); O3.ppos = null; await fr(90); moveDir(-tree.a, -tree.b); let near = 9; for (let i=0;i<120;i++){ await fr(1); const c = o3C(tree.x, tree.y); near = Math.min(near, Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1])); }
      const n = skNodeAt(tree.x, tree.y); out.nudge = { on:G.owPos.x===tree.x && G.owPos.y===tree.y, near:+near.toFixed(3), trunk:+o3ChopTrunkR(n).toFixed(3) };
      /* the leaves over you thinned: the shared spot follows you, and the canopy's material carries it */
      const U = o3PeekU().value; out.peek = { w:U.w, d:+Math.hypot(U.x - O3.ppos.x, U.z - O3.ppos.z).toFixed(3), mats:0 }; const seen = new Set(); O3.world.traverse(o=>{ if (o.isMesh && o.material && o.material.userData && o.material.userData.peek && !seen.has(o.material)){ seen.add(o.material); out.peek.mats++; } });
      const c = o3C(tree.x, tree.y); shot('wood', [O3.ppos.x, O3.ppos.z], 2.4, 2.4); out.wood = lanes(); }
    /* deep in a wood, through the game's own camera: the canopy over you thinned */
    { let f = null; for (let d=1; d<50 && !f; d++) for (let x=G.owPos.x - d; x<=G.owPos.x + d && !f; x++) for (const y of [G.owPos.y - d, G.owPos.y + d]){ let n = 0; for (let a=-1;a<=1;a++) for (let b=-1;b<=1;b++){ const q = owNb(x, y, a, b); if (q && m[q[0]][q[1]]===OW_FOREST) n++; } if (n===9 && !skNodeAt(x, y)){ f = [x, y]; break; } }
      if (f){ G.owPos = { x:f[0], y:f[1] }; owReveal(f[0], f[1], 8); O3.ppos = null; await fr(120); O3.renderer.render(O3.scene, O3.cam); out.shots.view = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); } }
    return out; });
  for (const [k, v] of Object.entries(r.shots)) fs.writeFileSync(path.join(SHOTS, 'rs880-' + k + '.jpg'), Buffer.from(v.split(',')[1], 'base64')); delete r.shots;
  console.log(JSON.stringify(r));
  A(r.start.tot > 100 && r.start.n===0, 'no tree, rock or bush on a walking lane round where you start', r.start);
  A(r.barrow && r.barrow.trees===0, 'nothing grows over a barrow by a wood', r.barrow); A(r.barrow.lanes.n===0, 'nor on the lanes round it', r.barrow.lanes);
  A(r.mound.tot > 0 && r.mound.bad===0, 'no gathering spot on the tiles round a barrow or a dragon\'s crag', r.mound);
  A(r.nudge && r.nudge.on && r.nudge.near > r.nudge.trunk + 0.08, 'you stop beside a gathering tree, clear of its trunk', r.nudge);
  A(r.peek && r.peek.w===1 && r.peek.d < 0.05 && r.peek.mats > 0, 'the leaves round you thin away, following you', r.peek);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
