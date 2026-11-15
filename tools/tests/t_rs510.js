// RS-510: every robe takes a trim dye at the dye works - a plain Wizard or Monk's robe too, which gains a trim band in the dye
// (only robes from Splitbark up had a trim, so the plainer ones had no trim row at all); washing it out takes the band away again
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    skAdd('dye_red', 5); const out = {};
    for (const [k, it] of [['wizard', rsMakeArmour('cloth', 0, 'chest')], ['monk', rsMakeHolyRobe('chest', 5)]]){ G.gear.chest = it;
      const o = { trimmable:trimmable(it), before:rsPlayerLook().o.robeTrim || null }; trimDyeApply('g:chest', 'red'); o.dyed = rsPlayerLook().o.robeTrim;
      setUi('dyeworks'); o.row = /its trim &middot;/.test(buildDyeWorks()); setUi('playing');
      trimDyeApply('g:chest', null); o.washed = rsPlayerLook().o.robeTrim || null; out[k] = o; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['wizard', 'monk']){ const o = r[k];
    A(o.trimmable && o.row, k + ': the dye works offers its trim');
    A(o.before===null && o.dyed==='#9a2a24' && o.washed===null, k + ': a plain robe gains the trim band in the dye, and loses it washed out'); }
};
