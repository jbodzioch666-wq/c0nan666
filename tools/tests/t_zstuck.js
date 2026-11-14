// (probe) a player's own save (env ZI_SAVE; never commit a save): why won't the ship move where they are? Prints where they are and what each direction does, by key and by tap
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 400))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 400)); });
  const txt = fs.readFileSync(process.env.ZI_SAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true; window.__noPirates = true; const ok = importSaveText(txt), sv = JSON.parse(txt).data; loadGame(sv.id); setUi('playing'); await w(5000); saveCurrentGame = ()=>{}; const p = G.player, o = { ok };
    const snap = ()=>{ const S = seaState(), pp = O3.ppos, PL = o3PL(); return { pos:[G.owPos.x, G.owPos.y], pp:pp && [+pp.x.toFixed(2), +pp.z.toFixed(2)], PL:[PL.x, PL.y], v:+S.v.toFixed(2), sail:S.sail, k:+S.k.toFixed(2), want:S.want==null ? null : +S.want.toFixed(2), yaw:+S.yaw.toFixed(2), blocked:S.blocked, on:seaOn(), ui:G.ui }; };
    o.world = { cols:OW_COLS, rows:OW_ROWS, cube:owCube(), planet:owIsPlanet(), gen:G.ow.genVer, face:owCube() ? cubeFace(G.owPos.x, G.owPos.y) : null, tile:G.ow.map[G.owPos.x][G.owPos.y], water:OW_WATER, ice:iceAt(G.owPos.x, G.owPos.y), nudge:o3YardNudge(G.owPos.x, G.owPos.y), active:o3Active(), ferry:!!G.owFerry, portal:!!G.owPortal, door:!!O3.doorWalk, gather:!!G.gather, down:!!G.playerDown, over:G.gameOver };
    o.around = []; for (let dy=-2;dy<=2;dy++){ let row = ''; for (let dx=-2;dx<=2;dx++){ const q = owNb(G.owPos.x, G.owPos.y, dx, dy); row += q ? (G.ow.map[q[0]] && G.ow.map[q[0]][q[1]]===OW_WATER ? '~' : '#') : 'X'; } o.around.push(row); }
    o.start = snap(); o.tries = {};
    for (const [nm, d] of [['e', [1, 0]], ['w', [-1, 0]], ['s', [0, 1]], ['n', [0, -1]]]){ const s0 = snap(), t0 = performance.now(); seaState().sail = 0; while (performance.now() - t0 < 2500){ moveInput(d[0], d[1]); await w(90); } const s1 = snap(); o.tries[nm] = { pos:s1.pos, dp:s0.pp && s1.pp ? +Math.hypot(s1.pp[0] - s0.pp[0], s1.pp[1] - s0.pp[1]).toFixed(2) : null, v:s1.v, on:s1.on, blocked:s1.blocked, yaw:s1.yaw }; }
    /* bow on to the edge, as if you had sailed to it */
    const home = async ()=>{ G.owPos.x = 0; G.owPos.y = 272; await w(500); const S = seaState(); S.v = 0; S.sail = 0; S.k = 0; S.want = null; S.yaw = O3.boatYaw = -Math.PI/2; O3.ppos.x = 0.12; O3.ppos.z = 272.5; O3.path = []; await w(100); };
    o.bowOn = {};
    await home(); { moveInput(1, 0); await w(100); const s0 = snap(); await w(6000); o.bowOn.onePress = { s0, s1:snap() }; }
    await home(); { const t0 = performance.now(); let n = 0; while (performance.now() - t0 < 6000){ moveInput(1, 0); n++; await w(1000); } o.bowOn.pressEverySecond = { n, s1:snap() }; }
    await home(); { const t0 = performance.now(); while (performance.now() - t0 < 6000){ moveInput(1, 0); await w(90); } o.bowOn.hold = snap(); }
    await home(); { o3WalkTo({ x:8, y:272 }); const n0 = O3.path.length; await w(6000); o.bowOn.tap = { n0, left:O3.path.length, s1:snap() }; }
    return o; }, txt);
  console.log(JSON.stringify(r, null, 0)); console.log('errors', errs.length, errs.slice(0, 5).join(' | ')); };
