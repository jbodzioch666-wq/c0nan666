// probe (RS-707): the smith's enchanting and masterworking panel with a rare piece picked: shots/zench.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    for (const e of ESSENCES) skAdd(e[0], 3 + rn(6)); G.player.gold = 250000;
    const it = rsMakeArmour('metal', 4, 'chest'); it.ilvl = 80; afDress(it, 70, 2); G.gear.chest = it; G.player.gold = 1e6; skAdd('es_law', 2); for (let i=0;i<4;i++) smithMasterwork(it);
    const m = rsMakeWeapon(4, 3); afDress(m, 60, 1); G.inv = [m].concat(G.inv); const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); ENCH.sel = it; setUi('blacksmith');
    const ov = document.getElementById('overlay'), pn = [...ov.querySelectorAll('.panel')].find(p=>/ENCHANT/.test(p.textContent)); pn.id = 'zenchPanel'; pn.scrollIntoView(); });
  await page.waitForTimeout(300); const el = await page.$('#zenchPanel'); await el.screenshot({ path:SHOTS + '/zench.png' });
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
