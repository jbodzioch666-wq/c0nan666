// (probe, not in ALL) the settings page, one tab (ZTAB, default picture): shots/zset.png
module.exports = async page=>{
  await page.evaluate(async t=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } G.setBack = 'playing'; G.setTab = t; setUi('settings'); await new Promise(r=>setTimeout(r, 300)); }, process.env.ZTAB || 'picture');
  await page.screenshot({ path: SHOTS + '/zset.png' });
};
