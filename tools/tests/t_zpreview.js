// (probe, not in ALL) the game's own world preview of one seed (ZSEED), as you see it when starting. Shot: shots/zpreview.png
module.exports = async page=>{
  await page.evaluate(async seed=>{ goToCharCreate(); ccBegin(); if (seed) wgRegenerate(seed); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, +(process.env.ZSEED || 1947342953));
  await page.waitForTimeout(800); await page.screenshot({ path: SHOTS + '/zpreview.png' });
};
