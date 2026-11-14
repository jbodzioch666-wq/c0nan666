// RS-369: the basic runes are sold at the temple now, not the alchemist's
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    v3Pref = false; o3Pref = false;
    const t = townList().find(t=>townInfo(t.x, t.y).tier >= 1); G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const out = { hasTemple:VILLAGE_BUILDINGS.some(b=>b.key==='temple') };
    const th = buildTemple(), n = (th.match(/onclick="rsBuyRunes/g)||[]).length;   /* (the temple's own page - opening it can lead with the priest's quest) */
    out.templeRunes = /RUNES/.test(th) && n;
    G.player.gold = 5000; const m0 = skHave('r_mind'); rsBuyRunes('mind', 10); out.bought = skHave('r_mind') - m0===10;
    G.alchemistStock = G.alchemistStock || []; out.alchRunes = (buildAlchemist().match(/onclick="rsBuyRunes/g)||[]).length;
    setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.hasTemple && r.templeRunes >= 5 && r.bought, 'the temple sells runes');
  A(r.alchRunes===0, 'the alchemist does not');
};
