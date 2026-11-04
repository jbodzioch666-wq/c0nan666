// Probe (RS-812): what Serpentskin Shrouds roll: base family, bases' stats, what they ask for.
module.exports = async page=>{ page.setDefaultTimeout(0);
  const out = await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const rows = {}; for (const d of [60, 90]) for (let i=0;i<200;i++){ const it = buildUnique(7, d); const k = d + ' ' + it.rsFam + '/' + (it.lookFam||'-') + ' ' + it.basis + ' ' + it.baseMat; const R = rows[k] = rows[k] || { n:0, mag:0, ac:0, rng:0, kit:(it.aff||[]).filter(a=>!a.imp).map(a=>a.fam).join(',') }; R.n++; if (it.magAcc > 0) R.nMag = (R.nMag||0) + 1; if (it.rngAcc > 12 && !(it.magAcc > 0)) R.nRng = (R.nRng||0) + 1; if (!(it.magAcc > 0) && !(it.rngAcc > 30)) R.nPlain = (R.nPlain||0) + 1; R.mag = Math.max(R.mag, it.magAcc||0); R.ac = Math.max(R.ac, it.ac||0); R.rng = Math.max(R.rng, it.rngAcc||0); }
    return rows; });
  for (const k of Object.keys(out).sort()) console.log(k, JSON.stringify(out[k]));
};
