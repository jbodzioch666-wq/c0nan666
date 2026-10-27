// probe (RS-687): the Drowned Temple's walk-in as the game draws it - twelve frames from sailing onto it to going down into the dark, as
// one sheet (shots/zsea-walk.png), and the drowned temple seen from each of the four camera turns before (shots/zsea-r<n>.png)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, temples = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && owSeaSite(x, y)) temples.push({ x, y });
    const s = temples.sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y))[0]; if (!s) return { none:true };
    G.player.hasBoat = 1; G.player.boatTier = 1; const q0 = owNb(s.x, s.y, 1, 1); G.owPos = { x:q0[0], y:q0[1] }; owReveal(q0[0], q0[1], 8); await fr(150);
    const cv = O3.renderer.domElement, shots = {}; for (let k=0;k<4;k++){ ISO.rot = k; await fr(60); shots['r' + k] = cv.toDataURL('image/png'); } ISO.rot = 0; await fr(30);
    const sheet = document.createElement('canvas'), W = cv.width, H = cv.height; sheet.width = 1600; sheet.height = 3*400*H/W; const sx = sheet.getContext('2d');
    const snap = ()=>new Promise(res=>{ const im = new Image(); im.onload = ()=>res(im); im.src = cv.toDataURL('image/png'); });
    moveDir(-1, -1); let n = 0, last = -9; const t0 = performance.now();
    while (performance.now() - t0 < 40000 && G.gameMode===0 && n < 12){ await fr(1); const Wk = O3.doorWalk; if (!Wk) continue; const ph = Wk.leg < Wk.pts.length - 1 ? 0 : Wk.v > 0 ? 9 + Wk.v*6 : 1 + Wk.look;
      if (ph - last >= 0.9 || (n===0)){ last = ph; const im = await snap(); sx.drawImage(im, (n % 4)*400, Math.floor(n/4)*400*H/W, 400, 400*H/W); sx.fillStyle = '#fff'; sx.font = '16px sans-serif'; sx.fillText(ph.toFixed(1), (n % 4)*400 + 6, Math.floor(n/4)*400*H/W + 18); n++; } }
    shots.walk = sheet.toDataURL('image/png'); return { shots, n, mode:G.gameMode }; });
  if (r.shots) for (const [k, u] of Object.entries(r.shots)) fs.writeFileSync(SHOTS + '/zsea-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.join(' | '));
};
