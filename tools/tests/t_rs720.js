// RS-720: the crafts quarter. The trades crowded into the Tailor's and the Smithy each have a workshop of their own along a lane south
// of the square: the Tannery (tanning rack, leatherworking bench) and the Fletcher (fletching bench, staff-carver's lathe) in every
// town, the Glassblower & Potter (kiln, potter's wheel) and the Barber from a village, the Jeweller (gem-cutting table, jeweller's
// bench) in a city. The Tailor keeps the spinning wheel, the loom and the dye vat; the Smithy its furnace and anvils. The loom weaves
// only robes now, leather goes to its own bench, staves to the lathe; each keeper sells their own trade's plain pieces.
// Shots: shots/rs720_quarter.png, rs720_tannery.png, rs720_fletcher.png, rs720_jeweller.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; const out = {};
    const go = t=>{ G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); return VILLAGE_BUILDINGS.map(b=>b.key); };
    const hamlet = townList().find(t=>townInfo(t.x, t.y).tier===0); if (hamlet){ out.hamlet = go(hamlet); G.gameMode = 0; }
    const city = townList().find(t=>townInfo(t.x, t.y).tier===2); if (!city) return { noCity:true };
    out.city = go(city);
    /* every door opens, and each room holds its own benches */
    out.rooms = {}; out.doors = {};
    for (const k of ['smith','tailor','tannery','fletcher','pottery','jeweller','barber']){ const b = buildingByKey(k); if (!b) continue;
      out.doors[k] = [T_TOWNDOOR, T_TAILOR, T_BLACKSMITH].includes(G.map[b.door.x][b.door.y]);
      enterInterior(k); out.rooms[k] = G.interior ? ROOM_LAYOUT[k].benches.map(b=>benchAt(b[1], b[2])) : null;
      const keeper = G.villageNpcs.find(n=>n.x===10 && n.y===5); out.rooms[k + '_keeper'] = keeper && keeper.service; exitInterior(); }
    /* the benches' rows */
    const rows = k=>{ const f = BENCHES[k].rows; return [...new Set(crRecipes().map(r=>r.row))].filter(r=>typeof f==='function' ? f(r) : f.includes(r)); };
    out.loom = rows('loom'); out.leather = rows('leather'); out.staves = rows('staves'); out.fletching = rows('fletching');
    /* the keepers */
    const shop = k=>{ G.craftShop = k; G.craftStock = {}; setUi('tailor'); const t = document.getElementById('overlay').textContent; const w = tailorWares().map(i=>i.nm); setUi('playing'); return { t:t.slice(0, 40), w }; };
    out.shops = { tailor:shop('tailor'), tanner:shop('tanner'), fletcher:shop('fletcher'), jeweller:shop('jeweller') };
    enterInterior('barber'); villageInteract(10, 5); out.barber = G.ui; if (G.ui==='makeover') makeoverLeave(); setUi('playing'); exitInterior();
    enterInterior('pottery'); villageInteract(10, 5); out.potter = G.ui==='wevent' && /kiln/.test(document.getElementById('overlay').textContent); setUi('playing'); exitInterior();
    /* stitch a leather body at the new bench */
    const lr = crRecipes().find(r=>r.row==='Leather armour'); for (const m in lr.need) skAdd(m, lr.need[m]*2); if (skLvl('crafting') < lr.lvl) skGainXP('crafting', 1e7); p.gold += lr.gold||0;
    enterInterior('tannery'); G.bench = 'leather'; setUi('bench'); out.leatherBench = /leather/i.test(document.getElementById('overlay').textContent);
    const n0 = G.inv.length; crCraft(lr.id); out.made = G.inv.length > n0 || CQ.list.length > 0; cqStop(); setUi('playing'); exitInterior();
    /* the quarter from the lane */
    const fb = buildingByKey('fletcher'); p.x = fb.door.x + 3; p.y = fb.door.y + 2; p.facing = 0; V3.dist = 9;
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    return out; });
  if (R.noCity){ console.log('no city in this world - skipped'); return; }
  await page.waitForTimeout(2000); await page.screenshot({ path:SHOTS + '/rs720_quarter.png' });
  for (const k of ['tannery','fletcher','jeweller']){
    await ev(async k=>{ enterInterior(k); setUi('playing'); G.player.x = 10; G.player.y = 9; G.player.facing = 0; V3.dist = 6.5; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, k);
    await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + `/rs720_${k}.png` }); await ev(()=>exitInterior()); }
  console.log(JSON.stringify(R));
  if (R.hamlet) A(R.hamlet.includes('tannery') && R.hamlet.includes('fletcher') && !R.hamlet.some(k=>['pottery','barber','jeweller','tailor','alch'].includes(k)), 'a hamlet: the tannery and the fletcher, no more: ' + R.hamlet);
  A(['tannery','fletcher','pottery','barber','jeweller','tailor'].every(k=>R.city.includes(k)), 'a city has every workshop: ' + R.city);
  A(Object.values(R.doors).every(Boolean), 'every workshop has its door: ' + JSON.stringify(R.doors));
  const eq = (a, b)=>JSON.stringify(a)===JSON.stringify(b);
  A(eq(R.rooms.tailor, ['spinning','loom','dyevat']) && eq(R.rooms.smith, ['furnace','anvil','anvil']), 'the Tailor: wheel, loom, vat; the Smithy: furnace and anvils: ' + JSON.stringify(R.rooms));
  A(eq(R.rooms.tannery, ['tanning','leather']) && eq(R.rooms.fletcher, ['fletching','staves']) && eq(R.rooms.pottery, ['kiln','wheel']) && eq(R.rooms.jeweller, ['jeweller','gemcut']) && eq(R.rooms.barber, ['barber']), 'each workshop its own benches');
  A(R.rooms.tannery_keeper==='tanner' && R.rooms.fletcher_keeper==='fletcher' && R.rooms.jeweller_keeper==='jeweller' && R.rooms.barber_keeper==='barber' && R.rooms.pottery_keeper==='potter', 'a keeper behind each counter');
  A(R.loom.length && R.loom.every(r=>/robes$/.test(r)), 'the loom weaves robes only: ' + R.loom);
  A(R.leather.includes('Leather armour') && R.leather.includes('Superior dragonhide') && !R.leather.some(r=>/robes/.test(r)), 'the leather bench: leather and dragonhide');
  A(R.staves.length >= 6 && !R.fletching.some(r=>/^(Staves|Battlestaves|Mystic|Master|Combination)/.test(r)) && R.fletching.includes('Arrows'), 'staves on the lathe, not the fletching bench');
  A(/TAILOR/.test(R.shops.tailor.t) && /TANNERY/.test(R.shops.tanner.t) && /FLETCHER/.test(R.shops.fletcher.t) && /JEWELLER/.test(R.shops.jeweller.t), 'each keeper has their own shop');
  A(R.shops.jeweller.w.some(n=>/Ring/.test(n)) && R.shops.fletcher.w.some(n=>/staff/i.test(n)) && !R.shops.tailor.w.some(n=>/staff|bow/i.test(n)), 'each sells their own trade: ' + JSON.stringify(R.shops));
  A(R.barber==='makeover' && R.potter, 'the barber restyles you; the potter has a word');
  A(R.leatherBench && R.made, 'leather armour is stitched at the leatherworking bench');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
