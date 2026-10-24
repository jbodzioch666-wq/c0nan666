// RS-654: a Planet's turned faces, audited. Framed off the front face: the plants keep off the gathering trees and the landmarks' feet
// where they are in the world (they read them at the frame tile); the winter ice lies on the frozen water (its mask was read at the frame
// tile); the far land past the built window is laid in the frame you're in (it kept the last frame's); a treasure map's mark stands at its
// tile (it stood at the stored one). A medium world is as it was. Shot: shots/rs654-<face>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0; G.interior = null; await fr(30);
    const W = OW_COLS, H = OW_ROWS, m = G.ow.map, out = { faces:[] }, TREES = /^(oak|pine|birch|cypress|willow|dead|snowpine|palm|jtree)$/;
    const land = t=>t===OW_GRASS || t===OW_FOREST || t===OW_DESERT || t===OW_TUNDRA || t===OW_SWAMP;
    const inner = (x, y)=>{ const f = cubeFace(x, y); if (f < 0) return -1; const N = cubeN(), o = CUBE_O[f], ix = x - o[0]*N, iy = y - o[1]*N; return Math.min(ix, iy, N - 1 - ix, N - 1 - iy); };   /* (how far inside its face a tile is: the frame only changes a few tiles past an edge) */
    /* the plants in the land built round you, by tile in the frame */
    const plants = ()=>{ const out = []; O3.world.traverse(o=>{ if (!o.isInstancedMesh || !o.userData.kind) return; const ic = o.userData.icull, a = ic ? ic.m : o.instanceMatrix.array, n = ic ? ic.n : o.count;
      for (let i=0;i<n;i++) out.push([o.userData.kind, Math.floor(a[i*16 + 12]), Math.floor(a[i*16 + 14])]); }); return out; };
    const check = async (k, at, tag)=>{ G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 12); await fr(150);
      const f = { k, tag, at, frame:O3F.face, farId:O3.farLand && O3.farLand.uuid, n:0, treeOnNode:0, onFoot:0, bushOnNode:0, nodeTiles:0 };
      for (const [kind, lx, ly] of plants()){ const g = o3G(lx, ly); if (!g) continue; f.n++; const nd = skNodeStatic(g[0], g[1]);
        if (nd && nd.k==='woodcutting' && TREES.test(kind)) f.treeOnNode++; if (owLandmarkFoot(g[0], g[1]) && kind!=='reed') f.onFoot++; }
      /* the far land: a vertex over four water tiles of the frame is sea-coloured, one over four grass or forest tiles is not */
      if (O3.farLand){ const P = O3.farLand.geometry.attributes.position, C = O3.farLand.geometry.attributes.color, S = 2; let sea = 0, seaBad = 0, grn = 0, grnBad = 0;
        for (let i=0;i<P.count;i+=7){ const x = P.getX(i), z = P.getZ(i), ts = [[0,0],[-1,0],[0,-1],[-1,-1]].map(([dx, dz])=>o3Tile(Math.min(W-1, Math.max(0, x+dx)), Math.min(H-1, Math.max(0, z+dz)))), blue = C.getZ(i) > C.getX(i)*1.8 && C.getY(i) < 0.2;
          if (ts.every(t=>t===OW_WATER)){ sea++; if (!blue) seaBad++; } else if (ts.every(t=>t===OW_GRASS || t===OW_FOREST)){ grn++; if (blue) grnBad++; } }
        Object.assign(f, { sea, seaBad, grn, grnBad }); }
      out.faces.push(f); return f; };
    /* a tile on each face with woods and a gathering tree near it */
    const spot = k=>{ let best = null, bs = -1; for (let x=4; x<W-4; x+=2) for (let y=4; y<H-4; y+=2){ if (cubeFace(x, y)!==k || inner(x, y) < 9 || !land(m[x][y]) || OW_SITE_TILES.includes(m[x][y])) continue;
        let woods = 0, nodes = 0; for (let i=-6;i<=6;i++) for (let j=-6;j<=6;j++){ const q = owOff(x, y, i, j); if (!q) continue; if (m[q[0]][q[1]]===OW_FOREST) woods++; const nd = skNodeStatic(q[0], q[1]); if (nd && nd.k==='woodcutting') nodes++; }
        const s = Math.min(woods, 20) + nodes*3; if (nodes && s > bs){ bs = s; best = [x, y]; } } return best; };
    for (const k of [0, 2, 3, 4, 5]){ const at = spot(k); if (!at){ out.faces.push({ k, none:true }); continue; } await check(k, at, 'woods'); }
    /* a landmark's foot off the front face */
    { const lm = owGeo().landmarks.find(l=>cubeFace(l.x, l.y)!==1 && inner(l.x, l.y) >= 12 && l.kind!=='volcano'); if (lm){ let at = null; for (let r=2;r<7 && !at;r++) for (let i=-r;i<=r && !at;i++) for (let j=-r;j<=r;j++){ const q = owOff(lm.x, lm.y, i, j); if (q && land(m[q[0]][q[1]]) && !OW_SITE_TILES.includes(m[q[0]][q[1]]) && !owLandmarkFoot(q[0], q[1])){ at = q; break; } }
      if (at){ const f = await check(cubeFace(lm.x, lm.y), at, 'landmark'); f.lm = lm.kind; } } }
    /* winter ice off the front face: every slab on a frozen water tile of the frame, and one on every such tile in the window */
    { G.player.clock = DAY_LENGTH*18.5; const mask = iceMask(); let at = null;
      for (let x=4; x<W-4 && !at; x+=2) for (let y=4; y<H-4 && !at; y+=2){ if (cubeFace(x, y)===1 || inner(x, y) < 12 || !mask[y*W + x]) continue; for (let i=-4;i<=4 && !at;i++) for (let j=-4;j<=4;j++){ const q = owOff(x, y, i, j); if (q && land(m[q[0]][q[1]]) && !OW_SITE_TILES.includes(m[q[0]][q[1]])){ at = q; break; } } }
      if (at){ G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 12); await fr(150); const ice = { winter:isWinter(), frame:O3F.face, has:!!O3.iceMesh, quads:0, bad:0, want:0 };
        if (O3.iceMesh){ const P = O3.iceMesh.geometry.attributes.position; for (let i=0;i<P.count;i+=6){ ice.quads++; const lx = Math.round(P.getX(i)), ly = Math.round(P.getZ(i)), g = o3G(lx, ly); if (!g || o3Tile(lx, ly)!==OW_WATER || !mask[g[1]*W + g[0]]) ice.bad++; } }
        const w = O3.win; for (let x=w.x0; x<w.x0+O3_W; x++) for (let y=w.y0; y<w.y0+O3_W; y++){ const g = o3G(x, y); if (g && m[g[0]][g[1]]===OW_WATER && mask[g[1]*W + g[0]]) ice.want++; }
        out.ice = ice; } else out.ice = { none:true };
      G.player.clock = DAY_LENGTH*0.45; }
    /* a treasure map's mark, off the front face */
    { const f = out.faces.find(f=>!f.none); if (f){ G.owPos = { x:f.at[0], y:f.at[1] }; await fr(60); const q = owOff(f.at[0], f.at[1], 3, 2), it = { tmap:1, mx:q[0], my:q[1], nm:'a test map', qty:1 }; G.inv.push(it); await fr(10);
      const c = o3C(q[0], q[1]), g = (O3.trailPool||[]).find(g=>g.visible); out.mark = { frame:O3F.face, at:q, have:!!g, d:g ? +Math.hypot(g.position.x - c[0], g.position.z - c[1]).toFixed(2) : null, stored:g ? +Math.hypot(g.position.x - q[0] - 0.5, g.position.z - q[1] - 0.5).toFixed(2) : null };
      G.inv.splice(G.inv.indexOf(it), 1); await fr(5); } }
    /* a medium world: as it was */
    setWorldSizeTier('medium'); wgRegenerate(777); G.gameMode = 0; await fr(120); { let n = 0, bad = 0; for (const [kind, lx, ly] of plants()){ n++; const nd = skNodeStatic(lx, ly); if (nd && nd.k==='woodcutting' && TREES.test(kind)) bad++; } out.medium = { id:O3F.id, n, bad }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const F = r.faces.filter(f=>!f.none); A(F.length >= 3, 'woods to stand in on the turned faces');
  for (const f of F){ A(f.frame===f.k, 'framed on face ' + f.k); A(f.n > 100, 'plants built on face ' + f.k);
    A(f.treeOnNode===0, 'no tree of the woods over a gathering tree on face ' + f.k + ' (' + f.treeOnNode + ')');
    A(f.onFoot===0, 'nothing growing in a landmark\'s foot on face ' + f.k + ' (' + f.onFoot + ')');
    A(f.sea > 20 && f.seaBad===0 && f.grn > 20 && f.grnBad===0, 'the far land laid in the frame on face ' + f.k); }
  A(new Set(F.map(f=>f.farId)).size===F.length, 'the far land built afresh in each frame');
  if (!r.ice.none){ A(r.ice.winter && r.ice.frame!==1 && r.ice.has, 'ice off the front face in winter'); A(r.ice.bad===0 && r.ice.quads===r.ice.want, 'every slab of ice on a frozen water tile of the frame, and one on each (' + r.ice.quads + ' of ' + r.ice.want + ', ' + r.ice.bad + ' astray)'); }
  A(r.mark && r.mark.have && r.mark.frame!==1 && r.mark.d < 0.01, 'a treasure map\'s mark stands at its tile in the frame');
  A(r.medium.id && r.medium.n > 100 && r.medium.bad===0, 'a medium world as it was');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
