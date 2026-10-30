// RS-670: a tap that never lifts doesn't brick the touch screen. The touch layer keeps the fingers down (TOUCH.pts); a lift lost in a
// stall (the land built at once when a Planet's frame switched - seconds on a phone) left a finger in it for ever, and every later tap
// made a two-finger pinch that was swallowed: nothing on the land or the pad answered until the game was reloaded. Now a finger that
// has sent nothing for a while is dropped when the next one comes down, and a hidden page or a lost window lets them all go.
// And a click-walk over a seam goes on after the land's frame switches (its steps were cleared with the old frame).
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; G.player.clock = DAY_LENGTH*0.4; G.player.hasBoat = 1;
    await fr(150); const out = {};
    /* a tap on the land as the phone sends it: pointerdown and pointerup of a touch, through the window's touch layer and on to the canvas */
    const cv = O3.cv, rc = cv.getBoundingClientRect(), ev = (type, id, x, y)=>cv.dispatchEvent(new PointerEvent(type, { pointerType:'touch', pointerId:id, isPrimary:true, clientX:x, clientY:y, bubbles:true, cancelable:true, button:0, buttons:type==='pointerup' ? 0 : 1 }));
    const tap = async (id, x, y)=>{ ev('pointerdown', id, x, y); await fr(2); ev('pointerup', id, x, y); await fr(6); };
    const spot = ()=>{ for (let k=0;k<40;k++){ const x = rc.left + rc.width*(0.3 + 0.4*Math.random()), y = rc.top + rc.height*(0.3 + 0.4*Math.random()); const a = o3Pick({ clientX:x, clientY:y }); if (a && a.kind==='ground' && (a.x!==G.owPos.x || a.y!==G.owPos.y) && o3Passable(a.x, a.y) && (o3PathTo(a.x, a.y)||[]).length) return [x, y, a]; }   /* (a spot a walk can reach) */ return null; };
    const s1 = spot(); if (!s1) return { none:true };
    O3.path = []; await tap(11, s1[0], s1[1]); out.tap1 = { path:(O3.path||[]).length, pts:TOUCH.pts.size };
    /* a finger whose lift is lost */
    O3.path = []; ev('pointerdown', 12, s1[0], s1[1]); await fr(3); out.lost = { pts:TOUCH.pts.size, mode:TOUCH.mode };
    /* a long while later (the game stalled, the lift never came): taps again */
    for (const p of TOUCH.pts.values()) p.t = performance.now() - 5000;
    const s2 = spot() || s1; await tap(13, s2[0], s2[1]); out.tap2 = { path:(O3.path||[]).length, pts:TOUCH.pts.size, mode:TOUCH.mode };
    /* the pad still answers too */
    const pad = document.querySelector('#pad [data-dir], .pad [data-dir], [data-dir=up]'); out.pad = !!pad;
    /* and the page hidden lets every finger go */
    ev('pointerdown', 14, s1[0], s1[1]); await fr(2); out.before = TOUCH.pts.size; document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('blur')); await fr(2); out.afterBlur = TOUCH.pts.size;
    /* the walk over a seam goes on past the frame switch: water on both sides, ten tiles over */
    O3.path = []; const m = G.ow.map, W = OW_COLS, H = OW_ROWS; let pair = null;
    for (let x=0;x<W && !pair;x++) for (let y=0;y<H && !pair;y++){ if (cubeFace(x, y) < 0 || m[x][y]!==OW_WATER) continue;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const b = owNb(x, y, dx, dy); if (!b || cubeFace(b[0], b[1])===cubeFace(x, y) || cubeFace(b[0], b[1]) < 0) continue;
        let ok = true, cx = x, cy = y, ddx = dx, ddy = dy, last = null; for (let k=0;k<10 && ok;k++){ const q = owNb(cx, cy, ddx, ddy); if (!q || m[q[0]][q[1]]!==OW_WATER){ ok = false; break; }
          const back = [[1,0],[-1,0],[0,1],[0,-1]].find(([ex, ey])=>{ const z = owNb(q[0], q[1], ex, ey); return z && z[0]===cx && z[1]===cy; }); if (!back){ ok = false; break; } last = q; cx = q[0]; cy = q[1]; ddx = -back[0]; ddy = -back[1]; }
        if (ok){ pair = { x, y, to:last }; break; } } }
    if (pair){ G.owPos = { x:pair.x, y:pair.y }; owReveal(pair.x, pair.y, 12); await fr(150); let t1 = performance.now(); while (performance.now() - t1 < 4000 && (O3.pend || o3FrameFor(G.owPos.x, G.owPos.y)!==O3F.face)) await fr(1);
      const sw0 = O3.frameSwitches||0; o3WalkTo({ kind:'ground', x:pair.to[0], y:pair.to[1] }); const pl = (O3.path||[]).length; t1 = performance.now(); let last = '', lastT = t1;
      while (performance.now() - t1 < 40000){ await fr(1); const k = G.owPos.x + ',' + G.owPos.y; if (k!==last){ last = k; lastT = performance.now(); } if (!(O3.path && O3.path.length) && performance.now() - lastT > 1200) break; if (performance.now() - lastT > 5000) break; }
      out.seam = { pathLen:pl, arrived:G.owPos.x===pair.to[0] && G.owPos.y===pair.to[1], at:[G.owPos.x, G.owPos.y], to:pair.to, switches:(O3.frameSwitches||0) - sw0, mode:G.gameMode }; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none, 'ground to tap');
  A(r.tap1.path > 0 && r.tap1.pts===0, 'a tap walks you, and the finger is let go');
  A(r.lost.pts===1, 'a finger down with its lift lost stays in the touch layer');
  A(r.tap2.path > 0 && r.tap2.pts===0, 'the next tap, a long while later, still walks you (the lost finger dropped)');
  A(r.before >= 1 && r.afterBlur===0, 'a hidden page lets every finger go');
  A(r.seam && (r.seam.arrived || r.seam.mode!==0), 'a click-walk over a seam reaches the far side past the frame switch (' + JSON.stringify(r.seam) + ')');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
