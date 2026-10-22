// RS-626: no jump between the globe and the chart: the globe at its nearest is at the chart's own scale; going in, it unrolls into the chart
// (turning to the land the chart opens on) and fades into it, and going out the chart rolls up into it; both at a steady frame rate; and a
// step of the wheel glides, on the globe and on the chart
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; const raf = ()=>new Promise(r=>requestAnimationFrame(r)); for (let i=0;i<60;i++) await raf();
    toggleOwZoom(); for (let i=0;i<30;i++) await raf(); await new Promise(r=>setTimeout(r, 800)); const out = { warmed:!!GLOBE.r };
    const wheel = dy=>canvas.dispatchEvent(new WheelEvent('wheel', { deltaY:dy, bubbles:true, cancelable:true }));
    /* the chart's wheel glides */
    { const z0 = owZoomScale(); wheel(-100); await raf(); const z1 = owZoomScale(); for (let i=0;i<120;i++) await raf(); const z2 = owZoomScale(); out.glide = z1 > z0 && z1 < z2 - 0.01 && Math.abs(z2 - z0*OW_ZOOM_STEP) < 0.01; }
    const run = async ()=>{ const fr = [], t0 = performance.now(); let l = t0; while (GLOBE.M && performance.now() - t0 < 4000){ await raf(); const t = performance.now(); fr.push(t - l); l = t; } const ms = performance.now() - t0; fr.sort((a, b)=>a - b); return { ms:+ms.toFixed(0), med:+fr[fr.length>>1].toFixed(1), worst:+fr[fr.length-1].toFixed(1) }; };
    /* out: wheel out to the chart's widest, then once more */
    for (let i=0;i<20 && !G.owGlobe;i++){ wheel(100); for (let k=0;k<40;k++) await raf(); }
    out.started = G.owGlobe && !!GLOBE.M; out.flatAtStart = GLOBE.M ? Math.abs(GLOBE.dist - globePlaneDist(chartView(GLOBE.M.chart.zs, GLOBE.M.chart.c).cellPx)) < 1e-6 : false;
    out.out = await run(); out.nearScale = Math.abs(GLOBE.dist - globeNearDist()) < 1e-6 && Math.abs(globeNearDist() - globePlaneDist(chartView(OW_ZOOM_MIN, { x:0, y:0 }).cellPx)) < 1e-9;
    /* the globe's wheel glides too */
    { const d0 = GLOBE.dist; wheel(100); await raf(); const d1 = GLOBE.dist; for (let i=0;i<120;i++) await raf(); out.gGlide = d1 > d0 && d1 < GLOBE.dist - 0.01; }
    /* in: wheel in till it unrolls */
    for (let i=0;i<20 && !GLOBE.M;i++){ wheel(-100); for (let k=0;k<20;k++) await raf(); }
    const face = globeFacing(); out.in = await run(); out.chart = !G.owGlobe && owMapOpen() && owZoomScale()===OW_ZOOM_MIN;
    out.centred = Math.abs(owZoomCenter().x - face.x) <= 2 && Math.abs(owZoomCenter().y - face.y) <= 2;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.warmed, 'the globe is made ready while the chart is open');
  A(r.glide, 'a step of the wheel on the chart glides');
  A(r.started && r.flatAtStart, 'zooming out past the chart starts the roll from the chart exactly as it was');
  A(r.out.ms < 1500 && r.in.ms < 1500, 'each way takes under a second and a half: ' + [r.out.ms, r.in.ms]);
  A(r.nearScale, 'the globe ends at the chart\'s own scale');
  A(r.gGlide, 'a step of the wheel on the globe glides');
  A(r.chart && r.centred, 'zooming in unrolls it into the chart, on the land that faced you');
  A(r.out.med < 14 && r.in.med < 14 && r.out.worst < 70 && r.in.worst < 70, 'smooth both ways: ' + JSON.stringify([r.out, r.in]));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
