// RS-342: a dragon lair's master is level 126 and as big as a mythic beast; god staves and capes and the relics are Unique,
// and the loot filter never salvages them (RS-362: whatever you pick in it) - nor superior gear or quest rewards
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const out = {};
    const st = rsMakeGodStaff('guthix'), cp = rsMakeGodCape('zammy'), wh = crWhip(), sup = crSuperior(rsMakeArmour('metal', 2, 'chest'));
    out.q = [st.quality, cp.quality, wh.quality];
    // with the filter on and every tier, quality and stat picked, nothing special is salvaged
    const F = lootfP(); Object.assign(F, { on:true, tiers:[0,1,2,3,4,5,6], quals:[0,1,2], stats:[], safeUp:false });
    out.sold = [st, cp, wh, sup].map(it=>lootFilterTake(it)); const plain = rsMakeArmour('metal', 0, 'chest'); out.plainSold = lootFilterTake(plain);
    G.inv = [st, sup]; lootfSalvageBag(true); out.afterJunk = G.inv.length; F.on = false;
    // the lair boss
    out.est = (()=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (owSiteKind(G.ow.map[x][y])==='lair') return owSiteEstimate(x, y).boss; return null; })();
    out.lairSize = monSizeK({ nm:'Vyrnax', lairBoss:true }); out.dragon = monSizeK({ nm:'red dragon' });
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.q.every(q=>q===4), 'god staves, god capes and relics are Unique');
  A(r.sold.every(x=>x===false) && r.plainSold > 0, 'the loot filter salvages a plain piece but never the special things');
  A(r.afterJunk===2, 'salvaging the bag leaves them too');
  A(r.est===null || r.est===126, 'a dragon lair\'s master is shown as level 126');
  A(r.lairSize > r.dragon, 'a lair master stands bigger than an ordinary dragon');
  console.log('rs342 ok', JSON.stringify(r));
};
