// probe (RS-705): drops on the ground - one of each rarity, a stack of three on one tile, a salvaged one: shots/zground0-1.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    G.gameMode = 0; randomEncounter(false); setUi('playing'); const P = G.player; P.hp = P.maxHp = 9999; G.mon = []; for (let i=0;i<30;i++){ renderGame(); await wait(30); }
    const mk = q=>{ const it = rsMakeArmour('metal', 3, 'chest'); if (q===1 || q===2) afDress(it, 60, q); if (q===3){ it.quality = 3; it.nm = "Guthan's Platebody"; } if (q===4){ it.quality = 4; it.nm = 'Crown of the Barrow King'; } return it; };
    G.inv = []; ISO.beams = []; [0,1,2,3,4].forEach((q, i)=>{ G.dropAt = { x:P.x - 2 + i, y:P.y + 2 }; addToInventory(mk(q)); });
    G.dropAt = { x:P.x + 2, y:P.y - 1 }; addToInventory(mk(1)); addToInventory(mk(2)); addToInventory(genPotion(3));
    const it = mk(2); it.aff[0].t = 1; G.dropAt = { x:P.x - 2, y:P.y - 1 }; addToInventory(it);
    const F = lootfP(); Object.assign(F, { on:true, tiers:[0,1,2,3,4,5,6], stats:[] }); G.dropAt = { x:P.x - 1, y:P.y }; addToInventory(rsMakeArmour('metal', 1, 'legs')); F.on = false; G.dropAt = null; });
  for (const [k, ms] of [[0, 600], [1, 1600]]){ await page.waitForTimeout(ms); await page.screenshot({ path:SHOTS + `/zground${k}.png` }); }
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
