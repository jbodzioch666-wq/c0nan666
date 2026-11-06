// RS-514: tapping a worn piece on the equipment page's figure describes it at the bottom, as tapping one in the bag does - its
// name, stats and the rest (RS-515: no buttons, and no comparison - that's for bag items); tapping a bag item after shows that one
// instead, with its comparison, and back again
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('metal', 2, 'chest'); G.inv.push(rsMakeArmour('hide', 1, 'legs')); setUi('inventory'); await new Promise(r2=>setTimeout(r2, 200));
    const out = {}, panel = ()=>{ const el = document.querySelector('.cs-gearpage'); return el ? el.innerText : ''; };
    out.before = !!document.querySelector('.cs-gearpage .detailpane');
    charSheetSelect('chest'); await new Promise(r2=>setTimeout(r2, 50));
    const p1 = panel(); out.worn = !!document.querySelector('.cs-gearpage .detailpane') && p1.includes(G.gear.chest.nm);
    out.noButtons = !/take off|close/i.test(p1.split(G.gear.chest.nm).pop()) && !document.querySelector('.cs-gearpage .cs-acts');
    out.noCompare = !/replaces/i.test(p1);
    charSheetInvSelect(G.inv.length - 1); await new Promise(r2=>setTimeout(r2, 50)); const p2 = panel(); out.bag = /replaces/i.test(p2) && /equip/i.test(p2);
    charSheetSelect('chest'); await new Promise(r2=>setTimeout(r2, 50)); const p3 = panel(); out.back = p3.includes(G.gear.chest.nm) && !/replaces/i.test(p3);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.before && r.worn, 'tapping a worn piece describes it');
  A(r.noButtons && r.noCompare, 'with no buttons and no comparison (RS-515)');
  A(r.bag && r.back, 'tapping the bag after shows the bag item and its comparison; the figure again shows the worn one, without');
};
