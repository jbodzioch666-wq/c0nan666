// probe (RS-704): the look of a rare's and a magic piece's tooltip in the bag, plain and with Alt held: shots/zloottip.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    const rare = rsMakeArmour('metal', 4, 'chest'); afDress(rare, 95, 2); const mag = rsMakeWeapon(5, 3); afDress(mag, 80, 1); const ring = rsMakeJewel('ring', RS_RINGS.findIndex(x=>x[2].recoil)); afDress(ring, 70, 1);
    G.inv = [rare, mag, ring].concat(G.inv); setUi('inventory'); renderOverlay(); });
  const shots = [];
  for (const [i, alt] of [[0, false], [0, true], [1, false], [2, true]]){
    await page.evaluate(({ i, alt })=>{ TT_ALT = alt; showItemTooltip({ clientX:300 + i*10, clientY:120 }, G.inv[i]); }, { i, alt });
    await page.waitForTimeout(150); const tt = await page.$('#itemTooltip'); shots.push(await tt.screenshot()); }
  await page.evaluate(()=>{ TT_ALT = false; hideItemTooltip(); });
  const { createCanvas, loadImage } = (()=>{ try{ return require('canvas'); }catch(e){ return {}; } })();
  if (createCanvas){ const ims = []; for (const s of shots) ims.push(await loadImage(s)); const W = ims.reduce((t, im)=>t + im.width + 10, 0), H = Math.max(...ims.map(im=>im.height)); const c = createCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#222'; x.fillRect(0, 0, W, H); let dx = 0; for (const im of ims){ x.drawImage(im, dx, 0); dx += im.width + 10; } fs.writeFileSync(SHOTS + '/zloottip.png', c.toBuffer('image/png')); }
  else shots.forEach((s, k)=>fs.writeFileSync(SHOTS + `/zloottip${k}.png`, s));
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
