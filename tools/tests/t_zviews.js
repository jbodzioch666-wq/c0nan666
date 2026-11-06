// (probe, not in ALL) the open land and a town drawn through the sliced warm-up and parallel link (as players get it, not the tests'
// one-call compile): shots/zviews_land.png and zviews_town.png. ZSAVE a save
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = process.env.ZSAVE ? fs.readFileSync(process.env.ZSAVE, 'utf8') : null;
  const wait = async ()=>page.evaluate(async ()=>{ const t0 = performance.now(); while (performance.now() - t0 < 30000){ renderGame(); await new Promise(r=>setTimeout(r, 30)); const V = G.gameMode===3 ? V3 : O3; if (!V.warmWait && !V.prelink && performance.now() - t0 > 2500) break; } for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } return +(performance.now() - t0).toFixed(0); });
  await page.evaluate(async txt=>{ window.__noWarmSlice = false; if (txt){ const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); } else { goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); } G.interior = null; if (G.gameMode!==0){ G.gameMode = 0; } setUi('playing'); }, txt);
  console.log('land', await wait()); await page.screenshot({ path: SHOTS + '/zviews_land.png' });
  await page.evaluate(()=>{ const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); });
  console.log('town', await wait()); await page.screenshot({ path: SHOTS + '/zviews_town.png' });
};
