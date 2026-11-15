// RS-859: a castle you hold says so - its tooltip (the world map's and the 3D land's) is your own: your arms, the realm you rule from it,
// its rents a day and those waiting, the tax, the garrison and gate, the works, the next raid; the map rings it in gold under your
// shield, with the realm's name; your realm's towns say they are yours. Shot: shots/rs859-map.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const pv0 = owProvinces().list[0], cs = [pv0.seat.x, pv0.seat.y], p = G.player;
    out.before = /Your Castle/.test(owSiteTipHtml(cs[0], cs[1]));
    G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] }; G.pendingDungeon = { x:cs[0], y:cs[1] }; enterDungeonConfirm(); setUi('playing');
    const max = G.dungeonMaxDepth; G.depth = max; loadLevel(max); setUi('playing'); const k = G.mon[G.bossIdx]; k.hp = 0; k.alive = false; bossDefeated(); setUi('playing');
    const t = G.genRooms.find(r=>r.k==='throne'), tx = t.x + (t.w>>1); p.x = tx; p.y = t.y + 1; G.mon = G.mon.filter(m=>!(m.x===tx && m.y===t.y + 1)); tryMove(0, -1);
    if (G.ui==='arms'){ armsSet('f', 1); armsSet('e', 6); armsBear(); } setUi('playing');
    dgFinish(false); setUi('playing'); G.gameMode = 0; G.owPos = { x:cs[0], y:cs[1] + 1 }; setUi('playing');
    const c = castleHeld(cs[0], cs[1]); out.held = !!c; c.day = Math.floor(clockNow()/DAY_LENGTH) - 3;
    const tip = owSiteTipHtml(cs[0], cs[1]); out.tip = tip.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 400);
    out.mine = /Your Castle/.test(tip) && /rents/.test(tip) && /garrison/.test(tip) && /waiting/.test(tip) && /tax/.test(tip) && /works/.test(tip) && /armsShield|data:image/.test(tip) && (!c.prov || tip.includes(c.prov));
    const mk = wevMapList().find(o=>o.k==='cmine' && o.x===cs[0] && o.y===cs[1]); out.mark = !!mk; out.markTip = mk ? /Your Castle/.test(wevTipHtml(mk)) : false;
    const tk = (c.towns && c.towns[0]) || c.town, [twx, twy] = tk.split(',').map(Number); out.townLine = /your (realm|town)/.test(castleTownLine(twx, twy)) && /reeve holds/.test(castleTownLine(twx, twy));
    const far = owProvinces().list.find(pv=>pv!==pv0 && !pv.wild && pv.towns && pv.towns.length); out.other = far ? castleTownLine(...far.towns[0].split(',').map(Number))==='' : true;
    /* a raid coming: the mark is the raid's, and the castle still its own on hover */ c.raid = { foe:'orc', due:clockNow() + DAY_LENGTH*0.5 }; const rk = wevMapList().find(o=>o.x===cs[0] && o.y===cs[1]); out.raidMark = rk && rk.k==='craid'; out.raidTip = /Your Castle/.test(owSiteTipHtml(cs[0], cs[1])) && /in \d+h/.test(owSiteTipHtml(cs[0], cs[1])); delete c.raid;
    G.owPos = { x:cs[0] - 4, y:cs[1] + 3 }; G.owZoomedOut = false; toggleOwZoom(); for (let i=0;i<10;i++){ renderGame(); await wait(60); }
    const at = ()=>{ const rc = canvas.getBoundingClientRect(), k = rc.width/canvas.width; return [rc.left + ((cs[0] - owZoomLastCam.x)*owZoomLastCellPx + owZoomLastCellPx/2)*k, rc.top + ((cs[1] - owZoomLastCam.y)*owZoomLastCellPx + owZoomLastCellPx/2)*k]; }; window.__c859 = at;
    out.at = at(); return out; });
  for (let i=0;i<4;i++){ const at = await page.evaluate(()=>window.__c859()); await page.mouse.move(at[0], at[1]); await page.mouse.wheel(0, -300); await page.waitForTimeout(250); }
  { const at = await page.evaluate(()=>window.__c859()); await page.mouse.move(at[0] + 3, at[1] + 2); await page.waitForTimeout(500); }
  r.hover = await page.evaluate(()=>{ const t = document.getElementById('itemTooltip') || document.querySelector('.tooltip'); return t ? /Your Castle/.test(t.innerHTML) && getComputedStyle(t).display!=='none' : null; });
  await page.screenshot({ path: SHOTS + '/rs859-map.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(!r.before && r.held, 'the castle was not yours', r); A(r.mine, 'the tooltip does not say it is yours', r); A(r.mark && r.markTip, 'no mark of yours on the map', r);
  A(r.townLine && r.other, 'your towns do not say so', r); A(r.raidMark && r.raidTip, 'under a raid', r); A(r.hover!==false, 'the map hover does not show it', r); };
