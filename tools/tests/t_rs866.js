// RS-866: a crossbow can be upgraded (and the bow or crossbow in your ranged slot is on the smith's enchanting and masterwork list) at the anvil with bars like any smithed weapon (every ranged weapon was left out); a wooden bow still can't
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const xb = rsMakeCrossbow(2), bow = rsMakeBow(2, true); G.gear.ranged = xb; const c = skUpgCost(xb), acc0 = xb.acc;
    skGainXP('smithing', 1e7); skAdd(c.b.id, 10); skUpgrade('g:ranged');
    const html = skUpgradeHtml(), ench = enchPieces().some(([it])=>it===xb), mw = mwOk(xb);
    return { cost:!!c, bar:c && c.b.id, upg:xb.upg||0, acc0, acc1:xb.acc, nm:xb.nm, bow:!!skUpgCost(bow), listed:/upgrade/.test(html) && html.includes('Crossbow'), ench, mw }; });
  console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.cost && r.upg===1 && r.acc1 > r.acc0 && r.listed, 'the crossbow could not be upgraded', r); A(r.ench && r.mw, 'the crossbow you hold is not on the enchanting bench', r); A(!r.bow, 'a wooden bow upgraded at the anvil', r); };
