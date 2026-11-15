// RS-612: a unique named as a robe (the Serpentskin Shroud) is drawn and named as a robe whatever it's made of - its stats, what it
// asks for and how it's upgraded its own (a Defence piece stays one); an old one in your bag is put right as it loads; and a unique
// named otherwise keeps its own look
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; const out = {};
    const id = UNIQUES.findIndex(u=>u[0]==='Serpentskin Shroud') + 1, idC = UNIQUES.findIndex(u=>u[0]==='Carapace of Ages') + 1;
    /* made heavy on defence, as the one in the report */
    let it = null; for (let i=0;i<40 && !(it && it.rsFam==='metal');i++){ it = buildUnique(id, 40); if (it.rsFam!=='metal'){ it.magAcc = 0; it.magDmg = 0; it.rngAcc = 0; it.ac = 57; delete it.lookFam; it.rsFam = null; rsUniqueFam(it); } }
    out.shroud = { fam:it.rsFam, look:it.lookFam, basis:it.basis, req:it.reqDef ? 'def' : it.reqMag ? 'mag' : it.reqRng ? 'rng' : '', ac:it.ac };
    G.gear.chest = it; it.used = true; const L = rsPlayerLook(); out.outfit = L.o.outfit;
    /* an old one, a platebody as it was saved: put right as it loads */
    const old = JSON.parse(JSON.stringify(it)); delete old.lookFam; old.basis = 'Platebody'; rsUniqueFam(old); out.old = { look:old.lookFam, basis:old.basis, fam:old.rsFam };
    /* a unique named otherwise keeps its own */
    let c = buildUnique(idC, 40); out.carapace = { look:c.lookFam || null, basis:c.basis, fam:c.rsFam };
    G.gear.chest = c; c.used = true; out.cOutfit = rsPlayerLook().o.outfit;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shroud.fam==='metal' && r.shroud.req==='def', 'the shroud stays a Defence piece of metal');
  A(r.shroud.look==='cloth' && r.shroud.basis==='Robe', 'and is cut and named as a robe: ' + r.shroud.basis);
  A(r.outfit==='robe', 'drawn on you as a robe: ' + r.outfit);
  A(r.old.look==='cloth' && r.old.basis==='Robe' && r.old.fam==='metal', 'an old one is put right as it loads');
  A(!r.carapace.look && r.cOutfit===(r.carapace.fam==='metal' ? 'plate' : r.carapace.fam==='hide' ? 'leather' : 'robe'), 'a unique named otherwise keeps its own look');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
