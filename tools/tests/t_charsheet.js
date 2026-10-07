// RS-195: the character sheet is two pages side by side - CHARACTER STATS on the left, EQUIPMENT on the right with the figure
// laid out like an action RPG's and the whole bag under it; the stats page has tabs; tapping a piece in the bag previews it
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {}, wait = ms=>new Promise(r=>setTimeout(r, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const k of ['attack','strength','defence','ranged','magic']) G.player.skills[k] = SK_XP[60]; rsSync();
    G.gear.weapon = rsMakeWeapon(3, 3); G.gear.chest = rsMakeArmour('metal', 3, 'chest'); G.gear.ring1 = rsMakeJewel('ring', 0);
    for (let i=0;i<5;i++) G.inv.push(genItem(6, i%2 ? 'weapon' : 'armor')); G.inv.push(rsMakeArmour('metal', 6, 'chest'));
    setUi('charsheet'); renderOverlay(); await wait(200);
    const q = s=>document.querySelector('#overlay '+s), qa = s=>[...document.querySelectorAll('#overlay '+s)];
    const sp = q('.cs-statspage').getBoundingClientRect(), gp = q('.cs-gearpage').getBoundingClientRect();
    out.pages = [Math.round(sp.left), Math.round(sp.width), Math.round(gp.left), Math.round(gp.width)];
    A(sp.width > 300 && gp.width > 300 && sp.right <= gp.left + 1 && Math.abs(sp.top - gp.top) < 2, 'two pages side by side: '+JSON.stringify(out.pages));
    A(/CHARACTER STATS/.test(q('.cs-statspage').textContent) && /EQUIPMENT/.test(q('.cs-gearpage').textContent), 'page titles');
    // the figure: every slot, inside the figure's box, none overlapping
    const wrap = q('.doll-wrap').getBoundingClientRect(), slots = qa('.doll-slot').map(e=>e.getBoundingClientRect());
    A(slots.length===PAPERDOLL_SLOTS.length, 'every slot on the figure');
    A(slots.every(b=>b.left >= wrap.left - 1 && b.right <= wrap.right + 1 && b.top >= wrap.top - 1 && b.bottom <= wrap.bottom + 1), 'slots inside the figure');
    for (let i=0;i<slots.length;i++) for (let j=i+1;j<slots.length;j++){ const a = slots[i], b = slots[j]; A(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1, 'slots '+i+' and '+j+' overlap'); }
    // weapon left of the head, off-hand right of it, the bag under the figure
    const at = k=>q(`.doll-slot[onclick*="'${k}'"]`).getBoundingClientRect();
    A(at('weapon').right < at('head').left && at('offhand').left > at('head').right && at('chest').top > at('head').bottom, 'weapon, head and off-hand in place');
    const bag = q('.cs-bag').getBoundingClientRect(); A(bag.top >= wrap.bottom, 'the bag sits under the figure');
    out.bag = [qa('.cs-bag .sp-cell').length, qa('.cs-bag .cs-bagempty').length];
    A(out.bag[0]===G.inv.length && out.bag[0] + out.bag[1]===Math.ceil(MAXINV/CS_BAG_COLS)*CS_BAG_COLS, 'the bag shows every slot of your pack: '+JSON.stringify(out.bag));
    // tap the rune platebody: the detail offers EQUIP and the stats page marks what changes
    const ri = G.inv.length - 1; q(`.cs-bag .sp-cell[data-csinv="${ri}"]`).click(); await wait(120);
    A(q(`.cs-bag .sp-cell[data-csinv="${ri}"]`).classList.contains('sel') && /EQUIP/.test(q('.charsheet-detail').textContent), 'picked, with an equip button');
    out.deltas = qa('.cs-statspage .cs-delta').length; A(out.deltas > 0 && /better/.test(q('.cs-statspage').textContent), 'the stats page marks the change');
    // the tabs
    for (const [t, want] of [['defence', /Defence bonus/], ['skills', /Woodcutting/], ['other', /In the bank/], ['offence', /Melee to hit/]]){ csTab(t); await wait(60); A(want.test(q('.cs-statgrid').textContent) && q('.cs-tabb.on').textContent.toLowerCase()===t, 'tab '+t); }
    // equip it
    q('.charsheet-detail .btn.primary').click(); await wait(120); A(G.gear.chest.rsTier===6, 'equipped from the bag');
    return out;
  });
  console.log(JSON.stringify(r));
  await page.screenshot({ path:SHOTS+'/shot_charsheet.png' });
};
