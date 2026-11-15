// RS-671: at a cube Planet's corner the land is framed on the face you're on. Come down from the top face to the corner where faces 0, 1
// and 4 meet, and the frame stayed face 4's for six tiles: your face lay in one arm of the cross and the face over the seam in another,
// with the void between them drawn as sea - a click across the seam fell on nothing. Now, within six tiles of an arm's corner, the frame
// is your own face at once, and every tile round you can be clicked and walked to. Uses a fresh planet: a corner tile of the middle
// row's first face, reached in frame 4.
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.hasBoat = 1; G.player.clock = DAY_LENGTH*0.4;
    const N = cubeN(), m = G.ow.map, out = {};
    /* the corner of face 0 that touches faces 1 and 4: its top-right tile (N - 1, N), one in from the edge */
    const P = { x:N - 1, y:N + 2 }; for (let a=-3;a<=3;a++) for (let b=-3;b<=3;b++){ const q = owOff(P.x, P.y, a, b); if (q && m[q[0]][q[1]]===OW_MOUNTAIN) m[q[0]][q[1]] = OW_WATER; }   /* (no mountain in the way of the walks) */
    /* arrive in frame 4, as from the top face */
    G.owPos = { ...P }; o3FrameSwitch(4); await fr(200); out.frameAfter = O3F.face; out.faceOn = cubeFace(P.x, P.y);
    let t0 = performance.now(); while (performance.now() - t0 < 4000 && O3.pend) await fr(1); await fr(30);
    /* every tile round you is a real one, and a pick on each screen side lands on land */
    const cv = O3.cv, rc = cv.getBoundingClientRect(), v = O3.pgrp.position.clone().project(O3.cam), fx = rc.left + (v.x + 1)/2*rc.width, fy = rc.top + (1 - v.y)/2*rc.height;
    out.picks = []; for (const off of [[110,0],[-110,0],[0,70],[0,-70],[80,50],[-80,50],[80,-50],[-80,-50]]){ const a = o3Pick({ clientX:fx + off[0], clientY:fy + off[1] }); out.picks.push(a ? [a.kind, a.x, a.y] : null); }
    out.nulls = out.picks.filter(a=>!a).length;
    /* and a click over the seam to face 1 walks you there */
    const E = owNb(P.x, P.y, 1, 0); O3.path = []; o3WalkTo({ kind:'ground', x:E[0], y:E[1] }); t0 = performance.now(); let moved = false; while (performance.now() - t0 < 3000){ await fr(1); if (G.owPos.x===E[0] && G.owPos.y===E[1]){ moved = true; break; } }
    out.east = { to:E, face:cubeFace(E[0], E[1]), moved, frame:O3F.face };
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.faceOn===0, 'standing on face 0 at its corner');
  A(r.frameAfter===0, 'the land is framed on your own face at the corner, not kept on the face you came from');
  A(r.nulls===0, 'a pick on every side of you lands on a real tile');
  A(r.east.moved, 'a click over the seam walks you onto the next face');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
