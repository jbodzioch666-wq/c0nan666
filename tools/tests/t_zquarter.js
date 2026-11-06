// probe (RS-720): the crafts quarter from the lane in a city and a hamlet, and the new rooms, from a wider camera.
// Shots: shots/zq_city.png, zq_city_r1.png, zq_hamlet.png, zq_<room>.png
module.exports = async page=>{ page.setDefaultTimeout(0);
  const ev = (f, a)=>page.evaluate(f, a);
  const settle = async (n)=>{ await ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n || 40); await page.waitForTimeout(1500); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false; G.player.clock = G.player.turnCount = 60; });
  for (const tier of [2, 0]){
    const ok = await ev(tier=>{ const t = townList().find(t=>townInfo(t.x, t.y).tier===tier); if (!t) return false; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      const p = G.player; p.x = TOWN_CX; p.y = tY(TOWN_CRAFT_LANE) - 3; p.facing = 2; V3.dist = 14; return true; }, tier);
    if (!ok) continue; await settle(); await page.screenshot({ path:SHOTS + `/zq_${tier ? 'city' : 'hamlet'}.png` });
    if (tier){ await ev(()=>{ ISO.rot = 1; G.player.viewRot = 1; }); await settle(); await page.screenshot({ path:SHOTS + '/zq_city_r1.png' }); await ev(()=>{ ISO.rot = 0; G.player.viewRot = 0; });
      for (const k of ['tannery','fletcher','pottery','jeweller','barber','tailor','smith']){
        await ev(k=>{ enterInterior(k); setUi('playing'); G.player.x = 10; G.player.y = 10; G.player.facing = 0; V3.dist = 10; }, k); await settle(30);
        await page.screenshot({ path:SHOTS + `/zq_${k}.png` }); await ev(()=>exitInterior()); } }
  }
};
