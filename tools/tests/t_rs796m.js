// RS-796 on a phone: the Bonuses tab lays out and a tap on a stat row shows its tip; a tap elsewhere leaves it
module.exports = async page=>{ page.setDefaultTimeout(0);
  await page.evaluate(async ()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; setUi('charsheet'); await new Promise(r=>setTimeout(r, 200)); });
  const row = page.locator('#overlay .cs-statgrid [data-tipcs]').first(); await row.scrollIntoViewIfNeeded(); await row.tap(); await page.waitForTimeout(150);
  const r = await page.evaluate(()=>{ const t = document.getElementById('itemTooltip'), o = document.querySelector('#overlay .cs-statspage').getBoundingClientRect(), b = t.getBoundingClientRect(); return { shown:t.style.display!=='none', text:t.textContent.slice(0, 80), inside:b.left >= 0 && b.right <= innerWidth + 1, page:[o.width, innerWidth], gridCols:getComputedStyle(document.querySelector('#overlay .cs-statgrid')).gridTemplateColumns.split(' ').length }; });
  await page.screenshot({ path:__dirname + '/shots/rs796m.png' }); console.log('rs796m', JSON.stringify(r));
  if (!r.shown || r.text.length < 10) throw new Error('assert: a tap shows the tip ' + JSON.stringify(r)); if (!r.inside) throw new Error('assert: the tip stays on screen ' + JSON.stringify(r)); };
module.exports.mobile = true;
