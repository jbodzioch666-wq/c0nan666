// RS-624: the first kill of a session no longer stalls - the hitsplat's digits are stamped from a sheet drawn once (not outlined text
// at a new size each frame), and the Last Foe portrait is drawn once per foe as an image (not onto a fresh canvas each HUD rebuild).
// Checks the first kill's frames with the real warm-up on, and that both still draw. Shots: shots/rs624-foe.png, shots/rs624-splat.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<300;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 5000)); });
  const r = await page.evaluate(async ()=>{ const out = { sheet:!!HSPLAT.cv, warmed:!!window.__glyphWarmed };
    const m = G.mon.find(m=>m.alive); m.x = G.player.x + 1; m.y = G.player.y; m.hp = 0; const i = G.mon.indexOf(m);
    noteFoe(i); monsterDies(i); fxSplat(G.player.x + 1.5, G.player.y + 0.5, 47, 'melee'); const fr = []; let last = performance.now();
    for (let f=0; f<90; f++){ await new Promise(r=>requestAnimationFrame(r)); const t = performance.now(); fr.push(+(t - last).toFixed(1)); last = t; if (f===6) out.splatShot = true; }
    out.worst = Math.max(...fr.slice(1)); out.fr = fr.slice(0, 20);
    const img = document.getElementById('lastFoeArt'); out.img = img ? img.tagName + ' ' + (img.src||'').slice(0, 22) + ' ' + img.naturalWidth : null;
    /* the portrait's image has something drawn on it */
    if (img && img.naturalWidth){ const c = document.createElement('canvas'); c.width = c.height = 56; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, 56, 56).data; let n = 0; for (let k=3;k<d.length;k+=4) if (d[k] > 40) n++; out.ink = n; }
    /* the digits are stamped, and fall back to text only for anything else */
    const c = document.createElement('canvas').getContext('2d'); out.digits = hsplatDigits(c, '128', 50, 50, 20); out.other = hsplatDigits(c, 'x', 50, 50, 20);
    out.cached = foePortraitUrl(G.lastFoe || { nm:'x' })===foePortraitUrl(G.lastFoe || { nm:'x' });
    return out; });
  { const u = await page.evaluate(()=>{ const i = document.getElementById('lastFoeArt'); return i ? i.src : ''; }); if (u.startsWith('data:image/png;base64,')) require('fs').writeFileSync(require('path').join(SHOTS, 'rs624-foe.png'), Buffer.from(u.split(',')[1], 'base64')); }
  await page.evaluate(()=>{ for (let k=0;k<3;k++) fxSplat(G.player.x + 1.5 + k*0.4, G.player.y + 0.5, [7, 23, 108][k], 'melee'); });
  await page.waitForTimeout(250); await page.screenshot({ path: SHOTS + '/rs624-splat.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.sheet && r.warmed, 'the digit sheet is drawn at start-up');
  A(r.digits && !r.other, 'numbers are stamped from it, anything else falls back to text');
  A(r.img && /^IMG data:image\/png/.test(r.img) && r.ink > 150, 'the Last Foe portrait is an image with the foe drawn on it');
  A(r.cached, 'each foe\'s portrait is drawn once');
  A(r.worst < 40, 'no long frame after the first kill: ' + r.worst);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
