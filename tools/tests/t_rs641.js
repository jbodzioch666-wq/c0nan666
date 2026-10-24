// RS-641: the globe turns any way, as far as you like: dragged down it rolls over the north pole and on down the far side, upside down,
// a drag across then still moves the land the way you drag, the chart's writing set upright on the screen whichever way up it is, a
// flick carries on a little; the map swinging to a place (as a search does) brings it round north up; a generator 14 planet rolls over too
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const out = {}, fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; await fr(20);
    const T = THREE, rc = canvas.getBoundingClientRect(), cx = rc.left + rc.width/2, cy = rc.top + rc.height/2;
    const pe = (t, x, y)=>(t==='pointerdown' ? canvas : window).dispatchEvent(new PointerEvent(t, { clientX:x, clientY:y, isPrimary:true, pointerType:'mouse', button:0, bubbles:true }));
    const drag = async (dx, dy, n, keep)=>{ let x = cx, y = cy; pe('pointerdown', x, y); for (let i=0;i<n;i++){ x += dx; y += dy; pe('pointermove', x, y); await fr(1); } pe('pointerup', x, y); if (!keep){ GLOBE.vyaw = GLOBE.vpitch = 0; } await fr(2); };
    const facing = ()=>globeUnturn(new T.Vector3(0, 0, 1));   /* (the point of the globe's own sphere facing you) */
    const north = ()=>new T.Vector3(0, 1, 0).applyQuaternion(globeQ());   /* (its north pole, as seen) */
    const open = async ()=>{ toggleOwZoom(); G.owZoomScale = OW_ZOOM_MIN; await fr(10); canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:100, bubbles:true, cancelable:true })); await fr(40); };
    await open(); out.on = owGlobeOn(); const f0 = facing(), lon0 = Math.atan2(f0.x, f0.z); out.northUp = north().y > 0.2;
    /* dragged down, a long way: up over the north pole, and on */
    const k = 0.0042*(GLOBE.dist - 1)/4.6, ang = Math.PI - Math.asin(f0.y) + 0.35, n = Math.ceil(ang/(30*k)); let topY = -2;
    { let x = cx, y = cy; pe('pointerdown', x, y); for (let i=0;i<n;i++){ y += 30; pe('pointermove', x, y); await fr(1); topY = Math.max(topY, facing().y); } pe('pointerup', x, y); GLOBE.vyaw = GLOBE.vpitch = 0; await fr(30); }
    const f1 = facing(), lon1 = Math.atan2(f1.x, f1.z), dl = Math.abs(((lon1 - lon0) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI);
    out.over = { topY:+topY.toFixed(3), endY:+f1.y.toFixed(2), dLon:+dl.toFixed(2), northY:+north().y.toFixed(2), an:+(GLOBE.an||0).toFixed(2), steps:n };
    /* upside down now: a drag across still moves the land under the mouse the same way */
    { const ft = globeFacing(), tx = ft.x, ty = ft.y, p0 = globeTileScreen(tx, ty); await drag(15, 0, 4); const p1 = globeTileScreen(tx, ty); out.across = p0 && p1 ? +(p1.x - p0.x).toFixed(0) : null; out.acrossY = p0 && p1 ? +Math.abs(p1.y - p0.y).toFixed(0) : null; }
    /* a flick carries on a little after the mouse lets go */
    { await drag(25, 0, 3, true); const a = facing(); await fr(20); out.flick = +a.angleTo(facing()).toFixed(3); GLOBE.vyaw = GLOBE.vpitch = 0; }
    /* swung round to a place, as the search does: it comes round north up */
    { const t = { x:G.owPos.x, y:G.owPos.y }; G.owZoomCenter = { x:t.x, y:t.y }; for (const t0 = performance.now(); (GLOBE.aim || performance.now() - t0 < 300) && performance.now() - t0 < 6000;) await fr(1); await fr(5); const f = globeFacing();   /* (until the swing is done, by the clock: 90 frames were 1.5s on a 60Hz screen, under half that here, and the swing still running turned the roll-over back) */ out.aim = { d:Math.max(Math.abs(f.x - t.x), Math.abs(f.y - t.y)), northY:+north().y.toFixed(2), aim:!!GLOBE.aim }; }
    /* the chart laid over, close in, with the globe upside down: its writing turned back upright */
    { canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:-100, bubbles:true, cancelable:true })); for (let i=0;i<14;i++){ canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:-100, bubbles:true, cancelable:true })); await fr(3); } await fr(40);
      const an0 = GLOBE.an||0; globeQ().premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), Math.PI)); GLOBE.vyaw = GLOBE.vpitch = 0; await fr(30);   /* (rolled over on the spot) */
      const wr = a=>Math.abs(((a % (Math.PI*2)) + Math.PI*3) % (Math.PI*2) - Math.PI);
      out.close = { pa:+GLOBE.pa.toFixed(2), an0:+an0.toFixed(2), an:+(GLOBE.an||0).toFixed(2), dAn:+wr((GLOBE.an||0) - an0).toFixed(2), northY:+north().y.toFixed(2), redrawn:!!GLOBE.lastRef && wr((GLOBE.lastRef.an||0) - (GLOBE.an||0)) < 0.1 }; }
    toggleOwZoom(); await fr(5);
    /* a generator 14 planet (laid flat, 432x216): rolls over the pole too */
    { G.worldSizeTier = 'planet'; OW_COLS = 432; OW_ROWS = 216; recomputeWorldSizeConstants(); G.ow.genVer = 14; G.ow.townPositions = {}; G.ow.townFlavor = {}; G.ow.siteMoves = {}; wgRegenerate(777);
      G.gameMode = 0; G.interior = null; await open(); const k2 = 0.0042*(GLOBE.dist - 1)/4.6, n2 = Math.ceil((Math.PI/2 - Math.asin(facing().y) + 0.35)/(30*k2)); let top = -2;
      { let x = cx, y = cy; pe('pointerdown', x, y); for (let i=0;i<n2;i++){ y += 30; pe('pointermove', x, y); await fr(1); top = Math.max(top, facing().y); } pe('pointerup', x, y); GLOBE.vyaw = GLOBE.vpitch = 0; await fr(20); }
      out.flat = { cube:owCube(), topY:+top.toFixed(3), northY:+north().y.toFixed(2), an:+(GLOBE.an||0).toFixed(2) }; toggleOwZoom(); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs641-globe.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.on && r.northUp, 'the globe opens north up');
  A(r.over.topY > 0.97, 'dragged down it rolls over the north pole (it used to stop short of it)');
  A(r.over.endY < 0.6 && r.over.dLon > 2.5, 'and on down the far side');
  A(r.over.northY < -0.3, 'upside down now');
  A(r.across > 25 && r.acrossY < r.across, 'a drag across still moves the land the way you drag');
  A(r.flick > 0.01, 'a flick carries on a little');
  A(r.aim.d <= 3 && r.aim.northY > 0.2, 'swung round to a place it comes north up');
  A(r.close.pa > 0.5 && Math.abs(r.close.dAn - Math.PI) < 0.3 && r.close.redrawn, 'the chart close in, upside down, drawn afresh with its writing turned upright');
  A(!r.flat.cube && r.flat.topY > 0.97, 'a generator 14 planet rolls over its pole too');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
