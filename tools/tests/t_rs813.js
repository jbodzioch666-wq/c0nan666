// RS-813: every Serpentskin Shroud has magic: a new one at any level, and one found before, on load. Rolled magic is kept; it still asks for Defence, and its bonuses and other uniques are untouched.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const o = { lv:[] };
    for (const d of [10, 30, 60, 90, 126]){ let lo = 1e9, hi = -1e9, reqDef = 1e9, kit = null; for (let i=0;i<300;i++){ const it = buildUnique(7, d); lo = Math.min(lo, it.magAcc||0); hi = Math.max(hi, it.magAcc||0); reqDef = Math.min(reqDef, it.reqDef||0); kit = it.aff.filter(a=>!a.imp).map(a=>a.fam).join(','); } o.lv.push({ d, lo, hi, reqDef, kit }); }
    /* an old one: no magic, or a plate's -20. Its other stats stay; twice changes nothing */
    for (const m of [0, -20]){ const it = buildUnique(7, 90); it.magAcc = m; const ac = it.ac, rng = it.rngAcc, aff = JSON.stringify(it.aff); uqMigrate(it); const once = it.magAcc; uqMigrate(it); o['old' + m] = { once, twice:it.magAcc, same:it.ac===ac && it.rngAcc===rng && JSON.stringify(it.aff)===aff }; }
    /* one with rolled magic keeps it */
    const kept = buildUnique(7, 90); kept.magAcc = 37; uqMigrate(kept); o.kept = kept.magAcc;
    /* through the whole item load */
    const sv = buildUnique(7, 60); sv.magAcc = 0; const back = JSON.parse(JSON.stringify(sv)); G.inv.push(back); o.bag = back; try { rsMigrateItem(back); uqMigrate(back); } catch(e){ o.err = String(e); } o.bagMag = back.magAcc; G.inv.pop();
    /* another unique isn't touched */
    const car = buildUnique(6, 90); const c0 = car.magAcc; uqMigrate(car); o.other = [c0, car.magAcc]; let carMag = 0; for (let i=0;i<300;i++) if ((buildUnique(6, 90).magAcc||0) <= 0) carMag++; o.carNoMag = carMag; delete o.bag; return o; });
  console.log('shroud', JSON.stringify(r));
  for (const L of r.lv){ A(L.lo > 0, 'magic at every roll', L); A(L.reqDef > 0, 'still a Defence piece', L); A(L.kit==='def,res,rng,life,thorn', 'its bonuses unchanged', L); }
  for (const k of ['old0', 'old-20']){ A(r[k].once > 0 && r[k].twice===r[k].once && r[k].same, 'an old one gets magic, once, and nothing else changes', r[k]); }
  A(r.kept===37, 'rolled magic is kept', r); A(r.bagMag > 0, 'through the load', r); A(r.other[0]===r.other[1] && r.carNoMag > 0, 'other uniques are left alone', r);
  A(!errs.length, 'no page errors', errs);
};
