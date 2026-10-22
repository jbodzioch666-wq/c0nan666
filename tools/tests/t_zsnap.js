// (probe, not in ALL) how long the chart's snapshot for the globe's fade takes at the zoom the globe unrolls into, three times running
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; const raf = ()=>new Promise(r=>requestAnimationFrame(r)); for (let i=0;i<60;i++) await raf();
    toggleOwZoom(); for (let i=0;i<30;i++) await raf(); await new Promise(r=>setTimeout(r, 800));
    const out = []; for (let k=0;k<3;k++){ const M = { chart:{ c:{ x:100 + k*40, y:90 }, zs:GLOBE_IN_ZS } }; const t = performance.now(); globeChartSnap(M); const cpu = performance.now() - t; await raf(); const t2 = performance.now(); await raf(); out.push([+cpu.toFixed(1), +(performance.now() - t2).toFixed(1)]); }
    G.owZoomCenter = { x:150, y:90 }; G.owZoomScale = GLOBE_IN_ZS; const fr = []; let l = performance.now(); for (let i=0;i<120;i++){ await raf(); const t = performance.now(); fr.push(t - l); l = t; } fr.sort((a, b)=>a - b);
    const og = renderOverworldMapZoomed, ct = []; window.renderOverworldMapZoomed = function(){ const t = performance.now(); try{ return og.apply(this, arguments); } finally { ct.push(performance.now() - t); } }; for (let i=0;i<60;i++) await raf(); ct.sort((a, b)=>a - b);
    return { snaps:out, chartFrame:{ med:+fr[60].toFixed(1), worst:+fr[119].toFixed(1) }, chartCpu:{ med:+ct[30].toFixed(1), worst:+ct[59].toFixed(1) } }; });
  console.log('R', JSON.stringify(r));
};
