// RS-614: the end of each land build no longer freezes on the road mask: the merge that looks for what to keep walked its 6.5 million
// bytes one by one (since RS-591, ~0.7s at a phone's pace); and the mask itself is painted a few stretches of road a slice, with the
// same result as in one go
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    for (let i=0;i<600 && !O3.rmask;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const W = O3_W, M = 5, x0 = G.owPos.x - W/2, y0 = G.owPos.y - W/2, out = {};
    const g = o3RoadMaskGen(x0, y0, W, M); let n = 0, worst = 0, res; for (;;){ const t = performance.now(), st = g.next(); worst = Math.max(worst, performance.now() - t); if (st.done){ res = st.value; break; } n++; }
    const one = o3RoadMask(x0, y0, W, M); let diff = 0; for (let i=0;i<one.d.length;i++) if (one.d[i]!==res.d[i]){ diff++; if (diff > 10) break; }
    out.mask = { yields:n, worst:+worst.toFixed(1), same:diff===0, has:!!O3.rmask };
    const t0 = performance.now(); o3MergeWorld(new THREE.Group()); out.mergeMs = +(performance.now() - t0).toFixed(1);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mask.has, 'the land has its road mask');
  A(r.mask.yields > 5 && r.mask.same, 'painted a few stretches at a time, the same as in one go');
  A(r.mergeMs < 40, 'the merge no longer walks the mask\'s bytes: ' + r.mergeMs + 'ms (it was hundreds)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
