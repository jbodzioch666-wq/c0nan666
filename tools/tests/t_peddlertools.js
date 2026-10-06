// RS-178: the gathering tools (rod, pickaxe, hatchet...) are sold by the Peddler, not the blacksmith
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const shop = buildShop(), smith = buildBlacksmith();
    const n = h=>(h.match(/skBuyTool\(/g)||[]).length;
    const p = skP(); p.tools.pick = 0; G.player.gold = 5000; const g0 = G.player.gold; skBuyTool('pick');
    // RS-179: holding a tool, a staff's three circling orbs go away with the staff
    G.gear.weapon = Object.assign(newItem(), { used:1, nm:'Staff of Air', basis:'Quarterstaff', slot:'weapon', rsStaff:1, rsElem:'air', rs:1 });
    const e = m3dInstance({}, rsPlayerLook()), sw = e.rig.swirl; let orbs = null;
    if (sw){ rsHoldTool(e, 'pick'); const held = sw.visible; rsHoldTool(e, null); orbs = { held, back:sw.visible }; }
    return { orbs, shopTools:n(shop), smithTools:n(smith), tools:SK_TOOLS.length, shopHead:/TOOLS/.test(shop), bought:p.tools.pick, paid:g0 - G.player.gold, supplies:/DUNGEON SUPPLIES/.test(smith) };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shopHead && r.shopTools===r.tools, 'the Peddler sells every gathering tool');
  A(r.smithTools===0, 'the blacksmith no longer sells them');
  A(r.supplies, 'the blacksmith still has the dungeon supplies');
  A(r.orbs && r.orbs.held===false && r.orbs.back===true, 'the staff orbs hide while you hold a tool, and come back after');
  A(r.bought===1 && r.paid > 0, 'buying a pickaxe works');
};
