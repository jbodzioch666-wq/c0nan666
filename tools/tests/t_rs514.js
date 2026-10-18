// RS-514: tapping a worn piece on the equipment page's figure describes it at the bottom, as tapping one in the bag does - its
// name, stats and the rest - with a button to take it off; tapping a bag item after shows that one instead, and back again
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gear.chest = rsMakeArmour('metal', 2, 'chest'); G.inv.push(rsMakeArmour('hide', 1, 'legs')); setUi('inventory'); await new Promise(r2=>setTimeout(r2, 200));
    const out = {}, panel = ()=>{ const el = document.querySelector('.cs-gearpage'); return el ? el.innerText : ''; };
    out.before = /take off/.test(panel());
    charSheetSelect('chest'); await new Promise(r2=>setTimeout(r2, 50));
    const p1 = panel(); out.worn = /take off/.test(p1) && p1.includes(G.gear.chest.nm.split(' ')[0]);
    charSheetInvSelect(G.inv.length - 1); await new Promise(r2=>setTimeout(r2, 50)); const p2 = panel(); out.bag = !/take off/.test(p2) && /equip/i.test(p2);
    charSheetSelect('chest'); await new Promise(r2=>setTimeout(r2, 50)); out.back = /take off/.test(panel());
    const btn = [...document.querySelectorAll('.cs-acts .btn')].find(b=>/take off/.test(b.textContent)); const nm = G.gear.chest.nm; if (btn) btn.click(); await new Promise(r2=>setTimeout(r2, 50));
    out.tookOff = !(G.gear.chest && G.gear.chest.used) && G.inv.some(x=>x.nm===nm); out.after = /take off/.test(panel());
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.before && r.worn, 'tapping a worn piece describes it, with a take-off button');
  A(r.bag && r.back, 'tapping the bag after shows the bag item; the figure again shows the worn one');
  A(r.tookOff && !r.after, 'take off moves it into the bag');
};
