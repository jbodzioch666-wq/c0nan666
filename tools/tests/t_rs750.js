// RS-750: a house costs 50,000 gold (it was 2,500). The estate agent asks it, the help says it, and "Buy a house" moved up a tier in
// the Heartlands diary (it swapped with "Pay for a town upgrade").
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; try{ v3Pref = false; }catch(e){}
    const p = G.player, out = { price:HOUSE_PRICE };
    p.gold = 49999; setUi('estate'); out.text = (document.getElementById('overlay').textContent.match(/A cottage of your own: [^.]*/)||[''])[0];
    out.btnOff = !![...document.querySelectorAll('#overlay button')].find(b=>/buy the house/.test(b.textContent) && b.disabled);
    houseBuy(); out.short = !houseP() && p.gold===49999;
    p.gold = 50000; houseBuy(); out.bought = !!houseP() && p.gold===0; setUi('playing');
    const H = DIARIES.find(d=>d.id==='heart').tiers; out.t2 = H[1].map(t=>t[0]); out.t3 = H[2].map(t=>t[0]);
    return out; });
  console.log(JSON.stringify(r));
  A(r.price===50000, 'a house is 50,000: ' + r.price);
  A(/50,000/.test(r.text) && r.btnOff, 'the agent asks it: ' + JSON.stringify(r));
  A(r.short && r.bought, "you can't buy it a coin short, and can with it: " + JSON.stringify(r));
  A(!r.t2.includes('Buy a house') && r.t2.includes('Pay for a town upgrade') && r.t3.includes('Buy a house'), 'the diary task moved up a tier: ' + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
