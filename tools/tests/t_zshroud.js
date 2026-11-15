// Probe (RS-812, RS-813): what Serpentskin Shrouds roll for magic, ranged and defence at several levels.
module.exports = async page=>{ page.setDefaultTimeout(0);
  const out = await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const rows = []; for (const d of [10, 30, 60, 90, 126]){ const mg = [], rg = [], ac = [], md = []; let tier = {}; for (let i=0;i<300;i++){ const it = buildUnique(7, d); mg.push(it.magAcc||0); rg.push(it.rngAcc||0); ac.push(it.ac||0); md.push(it.magDmg||0); tier[it.baseMat] = 1; } const st = a=>{ const s = a.slice().sort((x, y)=>x - y); return [s[0], s[s.length>>1], s[s.length - 1]].join('/'); }, pos = mg.filter(x=>x > 0); rows.push({ d, withMag:pos.length, magWhenSome:pos.length ? st(pos) : '-', mag:st(mg), rng:st(rg), ac:st(ac), magDmg:st(md), base:Object.keys(tier).join(',') }); }
    return rows; });
  for (const r of out) console.log('row', JSON.stringify(r));
};
