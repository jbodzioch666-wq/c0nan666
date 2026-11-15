// RS-460: dyeing the Visage of the Sage recolours the hat at once - its indigo was fixed, so a dye never showed on it - and washing the
// dye out brings the indigo back
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const ids = {}; UNIQUES.forEach((u, i)=>ids[u[0]] = i + 1); const v = buildUnique(ids['Visage of the Sage'], 40); G.gear.head = v; rsSync && rsSync();
    const out = { dyeable:dyeable(v) }, k0 = rsLookKey(); out.before = rsPlayerLook().o.helmCol;
    skAdd('dye_red', 1); dyeApply('g:head', 'red'); out.after = rsPlayerLook().o.helmCol; out.keyChanged = rsLookKey()!==k0; out.sage = !!rsPlayerLook().o.sageHat;
    const D = dyeListHtml(); out.swatch = D.html.includes('#9a2a24');
    dyeApply('g:head', null); out.washed = rsPlayerLook().o.helmCol; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.dyeable, 'the Visage can be dyed');
  A(r.before==='#22245a' && r.after==='#9a2a24' && r.sage, 'dyed red, the hat is red and still the sage hat');
  A(r.keyChanged, 'the figure is dressed again at once');
  A(r.swatch, 'the dye works shows its new colour');
  A(r.washed==='#22245a', 'washed out, it is indigo again');
};
