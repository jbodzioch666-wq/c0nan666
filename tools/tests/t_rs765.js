// RS-765: regeneration leaves the bonus pool - stacked over every piece of armour and jewellery it was too strong. Only an Ancestral
// piece (from level 90, rolled from the top tiers) may roll it; a magic or rare drop, Blood's pool and Chaos never give it otherwise.
// A unique's kit, a set piece and a base's own bonus keep theirs, and a piece that already has it keeps it
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, rg = it=>(it.aff||[]).some(a=>a && !a.imp && a.kind==='regen');
    let plain = 0, plainRg = 0, anc = 0, ancRg = 0;
    for (const L of [40, 80, 110, 126]) for (let i=0;i<2500;i++){ const it = genItem(L, lootKind(), 2); if (it.quality!==1 && it.quality!==2) continue;
      if (it.anc){ anc++; if (rg(it)) ancRg++; } else { plain++; if (rg(it)) plainRg++; } }
    /* forced: armour rolled rare at the top level, plain and Ancestral */
    let fP = 0, fA = 0; for (let i=0;i<600;i++){ const a = rsMakeArmour('metal', 6, 'chest'); afDress(a, 126, 2); if (rg(a)) fP++; const b = rsMakeArmour('metal', 6, 'chest'); b.anc = 1; b.ilvl = CB_HI; afDress(b, 126, 2); if (rg(b)) fA++; }
    const it = rsMakeArmour('metal', 6, 'chest'); afDress(it, 126, 2); out.pool = afRollPool(it).some(o=>o.F.key==='regen');
    const ia = rsMakeArmour('metal', 6, 'chest'); ia.anc = 1; ia.ilvl = CB_HI; afDress(ia, 126, 2); out.poolAnc = afRollPool(ia).some(o=>o.F.key==='regen');
    out.kit = UNIQUE_KIT ? JSON.stringify(UNIQUE_KIT).includes('regen') : null;
    Object.assign(out, { plain, plainRg, anc, ancRg, fP, fA }); return out; });
  console.log(JSON.stringify(r));
  A(r.plain > 3000 && r.plainRg===0 && r.fP===0, 'no plain magic or rare piece rolls regeneration: ' + JSON.stringify(r));
  A(r.fA > 20, 'an Ancestral piece still may: ' + r.fA);
  A(!r.pool && r.poolAnc, 'Blood\'s pool offers it only on an Ancestral piece');
  A(r.kit, 'uniques\' kits keep it');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
