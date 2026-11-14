// (probe, not in ALL) the open land from a fresh page with a save (ZSAVE): load to the end of its warm-up, and the longest frames
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const fr = []; let last = performance.now(), on = true; const loop = ()=>{ const t = performance.now(); fr.push(t - last); last = t; if (on) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    const t0 = performance.now(); const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); G.interior = null; G.gameMode = 0; setUi('playing');
    while (performance.now() - t0 < 60000){ await new Promise(r=>setTimeout(r, 30)); if (O3.ready !== false && O3.world && !O3.warmWait && !O3.prelink && !O3.pend && performance.now() - t0 > 1500) break; }
    const up = performance.now() - t0; on = false; const s = fr.slice(1).sort((a,b)=>b-a);
    return { up:+(up/1000).toFixed(2), worst:+s[0].toFixed(0), next:s.slice(1, 5).map(v=>+v.toFixed(0)), progs:O3.r ? O3.r.info.programs.length : 0 }; }, txt);
  console.log('land', JSON.stringify(r));
};
