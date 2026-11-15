// probe (RS-704): what drops look like. Rolls drops at a few levels and prints the rarity shares, some names with their bonuses and
// tiers, and the tooltip of a rare (with Alt). ZL=level list, ZN=drops a level
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(({ L, n })=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {};
    for (const lv of L){ const c = [0,0,0,0,0], names = [], tiers = {}; let naff = 0, nmr = 0;
      for (let i=0;i<n;i++){ const it = genItem(lv, lootKind(), 3); const q = it.quality||0; c[q]++; if (q===1 || q===2){ naff += it.aff.length; nmr++; for (const a of it.aff) if (a.t) tiers['T'+a.t] = (tiers['T'+a.t]||0) + 1; }
        if (names.length < 7 && q >= 1) names.push(`${it.nm}${it.baseNm && it.baseNm!==it.nm ? ' (' + it.baseNm + ')' : ''}: ` + it.aff.map((a, j)=>affixText(it, j) + (a.t ? ' T' + a.t : '')).join(', ')); }
      out[lv] = { share:c.map(x=>+(x/n*100).toFixed(1)), affPer:+(naff/Math.max(1, nmr)).toFixed(2), tiers, names }; }
    const it = genItem(90, 'weapon', 3, false, 2); TT_ALT = true; out.tip = itemCompareTooltipHtml(it).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); TT_ALT = false;
    return out; }, { L:(process.env.ZL || '10,40,70,100,126').split(',').map(Number), n:+(process.env.ZN || 500) });
  console.log(JSON.stringify(r, null, 1)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
