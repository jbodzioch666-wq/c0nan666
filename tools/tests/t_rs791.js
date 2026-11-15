// RS-791: how many runes to make: an altar's menu lists all first, then 1, 5, 10, 25, 100 up to what you have; each row binds that many, with its xp; combination runes the same; rcCraft with no count still binds everything
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e)));
  const r = await page.evaluate(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; skLvl = ()=>99; skPerk = ()=>0; const p = G.player, out = {};
    const rows = ()=>[...document.querySelectorAll('#ctxMenu .cm-o')].map(e=>e.innerText.trim()), ess = ()=>skHave('essence'), set = (k, n)=>skAdd(k, n - skHave(k));
    const pick = i=>document.querySelectorAll('#ctxMenu .cm-o')[i].click(); const per = rcPer('air'); out.per = per;
    p.rcCombo = false; set('essence', 30); set('r_air', 0); rcAsk('air'); out.r30 = rows();
    pick(2); out.after5 = { ess:ess(), air:skHave('r_air') };   /* row 0 all, 1 = 1, 2 = 5 */
    rcAsk('air'); pick(1); out.after1 = { ess:ess(), air:skHave('r_air') };
    set('essence', 3); rcAsk('air'); out.r3 = rows(); ctxClose();
    set('essence', 1); rcAsk('air'); out.r1 = rows(); ctxClose();
    set('essence', 200); rcAsk('air'); out.r200 = rows(); ctxClose();
    set('essence', 12); set('r_air', 0); rcAsk('air'); pick(0); out.all = { ess:ess(), air:skHave('r_air') };
    set('essence', 7); set('r_air', 0); rcCraft('air'); out.noCount = { ess:ess(), air:skHave('r_air') };
    set('essence', 3); set('r_air', 0); rcCraft('air', 50); out.over = { ess:ess(), air:skHave('r_air') };
    /* combination runes: the first the fire altar can make, six of its other rune in the bag */
    p.rcCombo = true; set('essence', 20); for (const t of ['air', 'water', 'earth']) set('r_' + t, 6); const f = rcComboFor('fire'); out.combo = f; if (f){ const oth = 'r_' + f.other; const was = skHave('r_' + f.c); rcAsk('fire'); out.rCombo = rows(); pick(2); out.afterCombo = { ess:ess(), oth:skHave(oth), made:skHave('r_' + f.c) - was }; rcAsk('fire'); pick(0); out.comboAll = { ess:ess(), oth:skHave(oth), made:skHave('r_' + f.c) - was }; }
    return out; });
  console.log('rs791', JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); }, per = r.per;
  A(r.r30.length===6 && /Bind all/.test(r.r30[0]) && /30 essence/.test(r.r30[0]) && /25 essence/.test(r.r30[4]) && r.r30[5]==='Cancel', 'all first, then the amounts you have, then Cancel');
  A(r.r30[0].includes((30*per) + ' air rune') && r.r30[2].includes((5*per) + ' air rune'), 'each row says how many runes');
  A(r.after5.ess===25 && r.after5.air===5*per, 'the 5 row binds five');
  A(r.after1.ess===24 && r.after1.air===6*per, 'the 1 row binds one');
  A(r.r3.length===3 && /3 essence/.test(r.r3[0]) && /1 essence/.test(r.r3[1]), 'only amounts below what you have');
  A(r.r1.length===2, 'one essence: just all');
  A(r.r200.length===7, 'two hundred: every amount');
  A(r.all.ess===0 && r.all.air===12*per, 'all binds all');
  A(r.noCount.ess===0 && r.noCount.air===7*per, 'no count still means all');
  A(r.over.ess===0 && r.over.air===3*per, 'a count above what you have binds what you have');
  A(r.combo && r.combo.n===6, 'the combination rune is found');
  A(r.rCombo.length===4 && /6 essence \+ 6/.test(r.rCombo[0]), 'a combination row shows both inputs and stops at the fewer');
  A(r.afterCombo.ess===15 && r.afterCombo.oth===1 && r.afterCombo.made===5, 'the 5 row binds five combination runes');
  A(r.comboAll.ess===14 && r.comboAll.oth===0 && r.comboAll.made===6, 'all binds the rest');
  A(!errs.length, 'no page errors: ' + errs.slice(0, 2).join(' | '));
};
