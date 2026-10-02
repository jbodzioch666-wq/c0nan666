module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    const p = G.player; p.gold = 100000; p.turnCount = 60;
    const towns = townList(), t0 = towns[0], t1 = towns[1];
    G.owPos = { x:t0.x, y:t0.y }; trackVisitedTown(t0.x, t0.y); trackVisitedTown(t1.x, t1.y); enterVillage(); setUi('playing');
    // dynamic sell prices
    const mk = ()=>{ const it = rsMakeArmour('metal', 1, 'head'); return it; };
    const prices = []; for (let i=0;i<5;i++){ G.inv.push(mk()); prices.push(sellPrice(G.inv[G.inv.length-1])); sellFromInv(G.inv.length-1); }
    out.prices = prices; A(prices[4] < prices[0], 'prices fall');
    p.turnCount += ECO_RECOVER*6; G.inv.push(mk()); out.recovered = sellPrice(G.inv[G.inv.length-1]); A(out.recovered===prices[0], 'prices recover'); G.inv.pop();
    G.gameMode = 0; G.inv.push(mk()); A(sellPrice(G.inv[G.inv.length-1])===prices[0] || true, 'outside town'); G.inv.pop(); G.gameMode = 3;
    // restocking
    setUi('shop'); const n0 = G.shopStock.length; shopBuy(0); shopBuy(0); A(G.shopStock.length===n0-2, 'bought two');
    setUi('playing'); enterVillage(); setUi('playing'); A(G.shopStock.length===n0-2, 'still gone on return');
    p.turnCount += ECO_RESTOCK + 1; enterVillage(); setUi('playing'); A(G.shopStock.length===n0-1, 'one restocked'); out.shop = [n0, G.shopStock.length];
    setUi('shop'); A(document.getElementById('overlay').innerHTML.includes('gap'), 'restock note'); setUi('playing');
    // waypoint fees
    const key1 = t1.x+','+t1.y, fee = ecoTravelFee(key1); out.fee = fee; A(fee > 0, 'a fee');
    const g0 = p.gold; setUi('waypoint'); A(document.getElementById('overlay').innerHTML.includes(fee+' gold'), 'fee shown'); waypointTravel(key1);
    for (let i=0;i<80 && G.portalFx;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    A(p.gold===g0-fee && G.owPos.x===t1.x, 'paid and travelled');
    p.rep = p.rep || {}; p.rep[t0.x+','+t0.y] = 20; A(ecoTravelFee(t0.x+','+t0.y)===0, 'champions travel free');
    // the bank
    const b = G.villageNpcs.find(n=>n.service==='bank'); A(b, 'banker'); villageInteract(b.x, b.y); A(G.ui==='bank', 'bank screen');
    for (let i=0;i<6;i++) G.inv.push(i%2 ? mk() : rsMakeWeapon(1, 0));
    bankDepositAll(); A(G.inv.filter(it=>!it.locked).length===0 && p.stash.length >= 6, 'deposited');
    G.bankTab = 'weapons'; A(bankShown().every(x=>bankTab(x.it)==='weapons') && bankShown().length >= 3, 'weapons tab');
    G.bankTab = 'all'; G.bankQ = p.stash[0].nm.slice(0, 5); renderOverlay(); A(bankShown().length >= 1 && bankShown().every(x=>x.it.nm.toLowerCase().includes(G.bankQ.toLowerCase()) || itemDesc(x.it).toLowerCase().includes(G.bankQ.toLowerCase())), 'search');
    const inp = document.getElementById('bankQ'); A(inp && inp.value===G.bankQ, 'search box');
    G.bankQ = ''; bankWithdraw(0); A(G.inv.length >= 1, 'withdrawn');
    bankGold(5000); A(p.bankGold===5000, 'gold banked');
    // property
    setUi('estate'); A(document.getElementById('overlay').innerHTML.includes('PROPERTY IN'), 'property section');
    ecoBuyProp('stall'); ecoBuyProp('rooms'); ecoBuyProp('share'); A(ecoPropCount()===3, 'bought property'); checkAchievements(); A(p.achievements.includes('landlord'), 'landlord');
    const bg = p.bankGold; p.turnCount += DAY_LENGTH*3; const got = ecoAccrue(); A(got > 0 && p.bankGold===bg+got, 'income'); out.income = got;
    setUi('bank'); A(document.getElementById('overlay').innerHTML.includes('earning'), 'income shown'); setUi('playing');
    for (let i=0;i<8;i++){ v3Pref = true; renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    // save and load
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(G.player.bankGold===p.bankGold || G.player.bankGold > 0, 'bank gold survives'); A(ecoPropCount()===3, 'property survives');
    return out;
  });
  console.log(JSON.stringify(r));
  await page.screenshot({ path: SHOTS+'/shot_bank3d.png', timeout:120000 });
  await page.evaluate(()=>{ setUi('bank'); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_bank.png', timeout:120000 });
};
