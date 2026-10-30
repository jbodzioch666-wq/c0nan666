// RS-369: arrows and bolts stack themselves in the quiver - onto the loaded stack, or the stack of their kind waiting there,
// never as loose bundles in the pack (even with the pack full); thrown weapons like the ones in your hand go onto that
// stack; loose ammo in an old save's pack goes into the quiver when it loads. The bag's Quiver tab (where Salvage was)
// shows every kind with its count and loads one with a tap
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player, out = {}; G.inv = []; p.ammoStacks = {}; lootFilterTake = ()=>false;
    const mk = (t, n)=>{ const x = rsMakeAmmo(t); x.qty = n; return x; };
    const a0 = rsMakeAmmo(1); a0.qty = 0; G.gear.ammo = a0; p.arrows = 20;   /* iron arrows loaded */
    addToInventory(mk(1, 15)); out.loaded = p.arrows; out.inv1 = G.inv.length;
    for (let i=0;i<3;i++){ addToInventory(mk(2, 10)); addToInventory(mk(RS_BOLT0 + 1, 7)); }
    out.steel = arrowCount(2); out.bolts = arrowCount(RS_BOLT0 + 1); out.inv2 = G.inv.length; out.stillIron = ammoType()===1;
    while (G.inv.length < MAXINV) G.inv.push(genItem(10, 'weapon'));
    addToInventory(mk(2, 5)); out.fullSteel = arrowCount(2); out.fullLen = G.inv.length===MAXINV;
    G.inv = [];
    const d0 = rsMakeThrown('dart', 1, 30); d0.used = true; G.gear.ranged = d0; addToInventory(rsMakeThrown('dart', 1, 12)); out.darts = G.gear.ranged.qty; out.dartInv = G.inv.some(x=>x.thrown);
    G.gear.ranged = rsMakeBow(5, false);
    // an old save: loose bundles in the pack go into the quiver
    G.inv = [mk(1, 4), mk(5, 3), mk(1, 6), mk(5, 9), mk(1, 1)]; ammoStackAll(); out.migr = { iron:arrowCount(1), rune:arrowCount(5), inv:G.inv.length };
    /* (RS-373) arrows taken out of the bank go into the quiver; the Resources tab doesn't list them (the Quiver tab does) */
    { const bp = bankP(); bp.stash = [mk(5, 7)]; const n0 = arrowCount(5), inv0 = G.inv.length; bankWithdraw(0); setUi('playing'); out.bank = { quiver:arrowCount(5) - n0, inv:G.inv.length - inv0 }; }
    out.resHasArrows = resCats().some(([nm, ids])=>ids.some(id=>/^arw_/.test(id))) && csBagCount('res')===resCats().reduce((a, [nm, ids])=>a + (nm==='Fish & food' ? 0 : ids.filter(id=>!/^arw_|^arrows$/.test(id) && resCount(id)).length), 0);
    // the Quiver tab
    setUi('inventory'); csBagTab('quiver'); await new Promise(r=>setTimeout(r, 50));
    out.tabs = [...document.querySelectorAll('#overlay .cs-bagtab')].map(e=>e.textContent.replace(/\s*\d+$/, '').trim()).join();
    out.rows = document.querySelectorAll('#overlay .cs-quiver [data-csq]').length; out.kinds = quiverList().length;
    document.querySelector('#overlay .cs-quiver [data-csq="5"]').click(); await new Promise(r=>setTimeout(r, 30));
    out.loadedNow = ammoType(); out.runeOn = !!document.querySelector('#overlay .cs-quiver [data-csq="5"].sel');
    /* (RS-372) or dragged onto the quiver slot on the figure */
    out.dropOk = csDropOk({ from:'quiver', t:2 }, { slot:'ammo' }) && !csDropOk({ from:'quiver', t:2 }, { slot:'head' }); csDrop({ from:'quiver', t:2 }, { slot:'ammo' }); out.dragged = ammoType();
    setUi('playing');
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.loaded===35 && r.inv1===0, 'the loaded kind goes onto the loaded stack');
  A(r.steel===30 && r.bolts===21 && r.inv2===0 && r.stillIron, 'other kinds wait in the quiver, one stack each, nothing in the pack');
  A(r.fullSteel===35 && r.fullLen, 'into the quiver even with a full pack');
  A(r.darts===42 && !r.dartInv, 'more darts go onto the ones in hand');
  A(r.migr.iron===46 && r.migr.rune===12 && r.migr.inv===0, 'loose ammo in the pack goes into the quiver');
  A(r.tabs==='All,Gear,Food,Scrolls,Resources,Quiver' && r.rows===r.kinds && r.kinds===4, 'the Quiver tab shows every kind as a picture');
  A(r.loadedNow===5 && r.runeOn, 'a tap loads a kind');
  A(r.bank.quiver===7 && r.bank.inv===0, 'arrows from the bank go into the quiver (RS-373)');
  A(r.resHasArrows, 'the Resources tab leaves arrows and bolts to the Quiver tab');
  A(r.dropOk && r.dragged===2, 'or drag it onto the quiver slot (RS-372)');
};
