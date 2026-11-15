// Probe: each boat on the 3D slipway, from the player's spot at the bench. Shots: zyard_<t>.png
module.exports = async page=>{ page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ const w = ms=>new Promise(res=>setTimeout(res, ms)); window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); await w(300); const p = G.player; p.clock = DAY_LENGTH*0.4; p.hasBoat = 1; p.boatTier = 5; enterInterior('boatyard'); await w(1200); document.getElementById('toasts') && (document.getElementById('toasts').style.display = 'none'); });
  for (const t of [1, 2, 3, 4, 5]){ await page.evaluate(async t=>{ const p = G.player; p.boatUse = t < 5 ? t : null; v3YardSync(); await new Promise(r=>setTimeout(r, 900)); }, t); await page.screenshot({ path:SHOTS + '/zyard_' + t + '.png', clip:{ x:330, y:40, width:560, height:360 } }); }
};
