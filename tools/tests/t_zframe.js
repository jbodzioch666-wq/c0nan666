// (probe, not in ALL) RS-632's frame: the 3D land on the north face (shots/zframe-T.png), then sailing west over its edge onto L
// (zframe-edge-<k>.png), with the frame, the camera's quarter turns and the player's place at each step
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  const r = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.hasBoat = true; G.player.wildWarned = 1;
    const N = cubeN(); let land = null; for (let r=0; r<50 && !land; r++) for (let dx=-r; dx<=r && !land; dx++) for (let dy=-r; dy<=r; dy++){ const x = N + (N>>1) + dx, y = (N>>1) + dy, t = G.ow.map[x][y]; if (t!==OW_WATER && t!==OW_MOUNTAIN && !OW_SITE_TILES.includes(t)){ land = [x, y]; break; } }
    G.owPos = { x:land[0], y:land[1] }; for (let i=0;i<200;i++) await raf(); out.T = { face:O3F.face, at:land, pl:o3PL(), win:O3.win && [O3.win.cx, O3.win.cy], rot:ISO.rot };
    return out; });
  await page.screenshot({ path: SHOTS + '/zframe-T.png' }); console.log('T', JSON.stringify(r));
  const r2 = await page.evaluate(async ()=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), N = cubeN(), steps = [];
    G.owPos = { x:N + 1, y:N >> 1 }; G.ow.map[N + 1][N >> 1] = OW_WATER; for (let i=0;i<120;i++) await raf();
    for (let k=0;k<12;k++){ const before = [G.owPos.x, G.owPos.y]; const d = o3DirToG(-1, 0); tryMoveOverworld(d[0], d[1]); for (let i=0;i<20;i++) await raf();
      steps.push({ k, from:before, to:[G.owPos.x, G.owPos.y], face:cubeFace(G.owPos.x, G.owPos.y), frame:O3F.face, rot:ISO.rot, pl:[o3PL().x, o3PL().y], pp:O3.ppos ? [+O3.ppos.x.toFixed(1), +O3.ppos.z.toFixed(1)] : null }); }
    return steps; });
  for (const s of r2) console.log('step', JSON.stringify(s));
  await page.screenshot({ path: SHOTS + '/zframe-edge.png' });
  if (errs.length) console.log('ERRORS', errs.slice(0, 6).join(' | '));
};
