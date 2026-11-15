// RS-199: potions stack - matching healing potions, antipoisons and weapon poisons share one bag slot with a count; drinking or
// selling one takes one off; counts (the Q button, quests, the quick bar) add up the stacks; old saves' loose potions merge on load
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ try {
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    G.inv = [];
    const pot = k=>{ const it = newItem(); Object.assign(it, { used:1, nm:POTIONS[k][0], consumable:1, kind:'heal', hd1:POTIONS[k][1], hd2:POTIONS[k][2], price:POTIONS[k][4] }); return it; };
    for (let i=0;i<5;i++) addToInventory(pot(0)); for (let i=0;i<2;i++) addToInventory(pot(1)); addToInventory(mkAntipoison()); addToInventory(mkAntipoison());
    out.slots = G.inv.length; A(G.inv.length===3 && potQty(G.inv[0])===5 && potQty(G.inv[1])===2 && potQty(G.inv[2])===2, 'three stacks: '+JSON.stringify(G.inv.map(potQty)));
    A(potCount(it=>it.kind==='heal')===7, 'seven healing potions counted');
    // the bag shows the count
    SP.open = true; SP.tab = 'inv'; renderGame(); await new Promise(r=>setTimeout(r, 100));
    out.badge = [...document.querySelectorAll('#sidePanel .sp-cell b.qty')].map(b=>b.textContent); A(out.badge.includes('5') && out.badge.includes('2'), 'the count on the picture: '+out.badge);
    // the Q button counts them all
    renderGame(); const q = document.querySelector('.dh-slot[data-k="Q"] .n'); A(q && q.textContent==='7', 'Q shows 7: '+(q && q.textContent));
    // drinking one takes one
    G.player.hp = 1; useFromInv(0); A(potQty(G.inv[0])===4 && G.inv.length===3, 'drank one');
    // selling one takes one
    const g0 = G.player.gold; sellFromInv(1); A(potQty(G.inv[1])===1 && G.player.gold > g0, 'sold one'); sellFromInv(1); A(G.inv.length===2, 'the last one of a stack leaves the slot');
    // a full pack still takes a potion that stacks
    while (G.inv.length < MAXINV) G.inv.push(rsMakeWeapon(0, 0)); addToInventory(pot(0)); A(potQty(G.inv[0])===5 && G.inv.length===MAXINV, 'a full pack still stacks potions');
    G.inv = G.inv.filter(it=>it.consumable);
    // old saves: loose potions merge on load
    G.inv = [pot(2), pot(2), rsMakeWeapon(0, 0), pot(2)]; rsMigrateAll(); A(G.inv.length===2 && potQty(G.inv[0])===3, 'merged on load: '+JSON.stringify(G.inv.map(potQty)));
    // and the stack is saved
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); A(potQty(G.inv.find(it=>it.consumable))===3, 'the count is saved');
    return out; } catch(e){ return { err:e.message, stack:String(e.stack).split('\n').slice(0,4).join(' | ') }; }
  });
  console.log(JSON.stringify(r)); if (r.err) throw new Error(r.err);
};
