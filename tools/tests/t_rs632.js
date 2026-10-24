// RS-632: the 3D land's frame on a cube-sphere - the face you're on turned into the middle of the cross, so the land runs on over its
// edges: the lookups exact both ways; on the north face the frame is that face; sailing over its edge the 3D place goes on step by step;
// a few tiles in the frame changes and the camera turns with it, so the same key still walks the same way; sites are named and clicked
// at their place in the world; a flat world's frame is the world as stored. Shots: shots/rs632-north.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; for (let i=0;i<60;i++) await raf(); out.flatId = O3F.id;
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.hasBoat = true; G.player.wildWarned = 1;
    const N = cubeN(), W = OW_COLS;
    /* the lookups, every face, both ways */
    let bad = 0; for (let X=0; X<6; X++){ const L = o3FrameLut(X); for (let i=0;i<L.g2l.length;i++){ if (L.g2l[i] < 0) continue; if (L.l2g[L.g2l[i]]!==i) bad++; } } out.lutBad = bad;
    /* the north face */
    let land = null; for (let r=0; r<50 && !land; r++) for (let dx=-r; dx<=r && !land; dx++) for (let dy=-r; dy<=r; dy++){ const x = N + (N>>1) + dx, y = (N>>1) + dy, t = G.ow.map[x][y]; if (t!==OW_WATER && t!==OW_MOUNTAIN && !OW_SITE_TILES.includes(t)){ land = [x, y]; break; } }
    G.owPos = { x:land[0], y:land[1] }; for (let i=0;i<200;i++) await raf();
    const pl = o3PL(); out.north = { frame:O3F.face, inMiddle:pl.x >= N && pl.x < 2*N && pl.y >= N && pl.y < 2*N, win:!!O3.win };
    { let ok = 0, n = 0; O3.hits.forEach(h=>{ const a = h.userData.act; if (!a || a.kind!=='site') return; n++; if (OW_SITE_TILES.includes(G.ow.map[a.x][a.y])) ok++; }); out.sites = [ok, n]; }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs632-north.png' });
  const r2 = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), N = cubeN(), out = { steps:[] };
    G.owPos = { x:N + 1, y:N >> 1 }; G.ow.map[N + 1][N >> 1] = OW_WATER; for (let i=0;i<120;i++) await raf();
    let prevL = o3PL(), cont = true, switched = -1, rot0 = ISO.rot, gStepBefore = null, gStepAfter = null;
    for (let k=0;k<12;k++){ const key = viewRotDir([-1, 0]), d = o3DirToG(key[0], key[1]), at = [G.owPos.x, G.owPos.y]; const exp = owNb(at[0], at[1], d[0], d[1]); if (exp) G.ow.map[exp[0]][exp[1]] = OW_WATER;   /* (a clear way: generator 16 lets land reach these edges) */
      tryMoveOverworld(d[0], d[1]); for (let i=0;i<20;i++) await raf(); const l = o3PL();
      if (switched < 0 && O3F.face!==4) switched = k; if (switched < 0 && Math.abs(l.x - prevL.x) + Math.abs(l.y - prevL.y)!==1) cont = false; prevL = l;
      if (k===5) gStepBefore = [G.owPos.x - at[0], G.owPos.y - at[1]]; if (k===10) gStepAfter = [G.owPos.x - at[0], G.owPos.y - at[1]]; out.steps.push([G.owPos.x, G.owPos.y, O3F.face, ISO.rot]); }
    Object.assign(out, { cont, switched, turned:ISO.rot!==rot0, gStepBefore, gStepAfter, face:cubeFace(G.owPos.x, G.owPos.y) }); return out; });
  Object.assign(r, r2); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.flatId===true, 'a flat world\'s frame is the world as stored');
  A(r.lutBad===0, 'the frame lookups are exact both ways');
  A(r.north.frame===4 && r.north.inMiddle && r.north.win, 'on the north face the frame is that face, you in the middle of it');
  A(r.sites[1] > 0 && r.sites[0]===r.sites[1], 'sites are clicked at their place in the world');
  A(r.cont, 'sailing over the edge, the 3D place goes on a step at a time');
  A(r.switched >= 4 && r.switched <= 9 && r.turned && r.face===0, 'a few tiles in the frame changes, and the camera turns with it');
  A(r.gStepBefore && r.gStepAfter && r.gStepBefore[0]===r.gStepAfter[0] && r.gStepBefore[1]===r.gStepAfter[1], 'the same key still walks the same way after the change');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
