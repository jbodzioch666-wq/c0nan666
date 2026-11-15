// probe (RS-712, on a phone): the anvil's Work a piece tab with a rare piece on it: shots/zench.png; holding Law: zench_law.png; mid-strike
// of the hammer: zench_hit.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    for (const e of ESSENCES) skAdd(e[0], 3 + rn(6)); G.player.gold = 250000;
    const it = rsMakeArmour('metal', 4, 'chest'); it.ilvl = 80; afDress(it, 70, 2); G.gear.chest = it; G.player.gold = 1e6; skAdd('es_law', 2); for (let i=0;i<4;i++) smithMasterwork(it);
    const m = rsMakeWeapon(4, 3); afDress(m, 60, 1); const r2 = rsMakeArmour('metal', 3, 'legs'); afDress(r2, 50, 2); const f = rsForgeQuality(rsMakeArmour('metal', 5, 'head'), 99, 85);
    G.inv = [m, r2, f].concat(G.inv); const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); anvilOpen(it, 'blacksmith'); });
  await page.waitForTimeout(3500); await page.screenshot({ path:SHOTS + '/zench2.png' });
  await page.evaluate(()=>anvHold('es_law')); await page.waitForTimeout(200); await page.screenshot({ path:SHOTS + '/zench2_law.png' });
  await page.evaluate(()=>{ anvHold(null); anvMasterwork(); }); await page.waitForTimeout(170); await page.screenshot({ path:SHOTS + '/zench2_hit.png' });
  await page.waitForTimeout(600);
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};

module.exports.mobile = true;
