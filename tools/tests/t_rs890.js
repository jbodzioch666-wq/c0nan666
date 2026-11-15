// RS-890: hovering a town on the world map (M) shows its size - a village, a town or a city (with its people: "Dwarven city") - and the
// combat levels of the land round it, under its name and waypoint line (owTownTipRows). Every town's rows, then a real hover on the map.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(res=>setTimeout(res, ms)), out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; window.__trans = true;
    out.rows = townList().map(p=>{ const d = document.createElement('div'); d.innerHTML = owTownTipRows(p.x, p.y); return { tier:townTier(p.x, p.y), text:d.textContent }; });
    /* a real hover: the map open over the land, close in, the mouse on the nearest town */
    const sp = G.ow.spawnPos || G.owPos; let t = null, bd = 1e9; for (const p of townList()){ const d = Math.hypot(p.x - G.owPos.x, p.y - G.owPos.y); if (d < bd){ bd = d; t = p; } }
    G.gameMode = 0; G.owPos = { x:t.x + 1, y:t.y }; owReveal(t.x, t.y, 6); if (!G.owZoomedOut) toggleOwZoom(); G.owZoomScale = OW_ZOOM_MAX; renderGame(); await wait(250); renderGame(); await wait(100);
    const cv = canvas, rc = cv.getBoundingClientRect(), k = cv.width/rc.width, C = owZoomLastCellPx, cam = owZoomLastCam;
    cv.dispatchEvent(new MouseEvent('mousemove', { bubbles:true, clientX:rc.left + ((t.x - cam.x)*C + C/2)/k, clientY:rc.top + ((t.y - cam.y)*C + C/2)/k })); await wait(60);
    const tt = document.getElementById('itemTooltip') || document.querySelector('.tooltip, #tooltip'); out.tip = tt && tt.style.display!=='none' ? tt.textContent : '';
    out.name = o3TownName(t.x, t.y); out.size = TOWN_SIZE_NM[townTier(t.x, t.y)]; out.mapOpen = owMapOpen();
    return out; });
  console.log(JSON.stringify({ rows:r.rows.slice(0, 4), tip:r.tip, size:r.size, mapOpen:r.mapOpen }));
  A(r.rows.length >= 3, 'towns found', r);
  for (const w of r.rows){ { const m = /size(.*?)the land/.exec(w.text); A(m && m[1].toLowerCase().endsWith(['village', 'town', 'city'][w.tier]), 'each town names its size', w); } A(/combat \d+-\d+/.test(w.text), 'and the levels of the land round it', w); }
  A(new Set(r.rows.map(w=>w.tier)).size >= 2, 'more than one size among the towns', r.rows);
  A(r.mapOpen && r.tip.includes(r.name) && new RegExp(r.size, 'i').test(r.tip) && /combat \d+-\d+/.test(r.tip), 'hovering the town on the map shows its size and level', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
