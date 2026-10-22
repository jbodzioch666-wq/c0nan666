// (probe, not in ALL) frame times while the globe rolls up out of the chart and unrolls back into it, at normal speed
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(w=>{ window.__zwait = w; }, +(process.env.ZWAIT||0));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; G.interior = null; owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    toggleOwZoom(); G.owZoomScale = OW_ZOOM_MIN; for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, +(window.__zwait||0)));
    const og = globeRender, gt = []; window.globeRender = function(){ const t = performance.now(); try{ return og.apply(this, arguments); } finally { gt.push(+(performance.now() - t).toFixed(1)); } };
    const run = async f=>{ gt.length = 0; f(); const fr = []; let l = performance.now(); while (GLOBE.M){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(t - l); l = t; } const at = fr.map((v, i)=>[+v.toFixed(0), i]).sort((a, b)=>b[0] - a[0]).slice(0, 4).map(x=>x.join('@')).join(' '); fr.sort((a, b)=>a - b); return { gt:gt.slice(0, 6), at, n:fr.length, med:+fr[fr.length>>1].toFixed(1), worst:+fr[fr.length-1].toFixed(1) }; };
    const out = await run(()=>globeOpen()); for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r)); const back = await run(()=>globeClose()); return { out, back }; });
  console.log(JSON.stringify(r));
};
