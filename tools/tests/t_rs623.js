// RS-623: provinces - the land shared out between the towns, each a named realm with its seat, ruler and a foe on its roads; far land and
// townless islands are wild marches. Crossing into one names it in the log; the world map and the preview draw the borders.
// Shots: shots/rs623-preview.png, shots/rs623-map.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { w:[] };
    for (const seed of [1947342953, 2659250257, 777]){ wgRegenerate(seed); owProvinces.c = null; const t0 = performance.now(), pv = owProvinces(), ms = performance.now() - t0, W = OW_COLS, M = G.ow.map;
      let land = 0, owned = 0, wet = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++){ const o = pv.own[y*W + x]; if (M[x][y]===OW_WATER){ if (o>=0) wet++; } else { land++; if (o>=0) owned++; } }
      const towns = skTowns(), seatOk = towns.every(([x, y])=>{ const p = provAt(x, y); return p && !p.wild && p.seat.x===x && p.seat.y===y; });
      const named = pv.list.every(p=>p.name && p.foe && (p.wild || (p.ruler && p.seat.name))), uniq = new Set(pv.list.map(p=>p.name)).size===pv.list.length;
      out.w.push({ seed, ms:+ms.toFixed(0), n:pv.list.length, towns:towns.length, wild:pv.list.filter(p=>p.wild).length, cover:+(owned/land).toFixed(3), wet, seatOk, named, uniq, eg:pv.list.slice(0, 3).map(p=>p.name + ' / ' + (p.ruler||'-') + ' / ' + p.foe) }); }
    renderWorldPreviewMap();
    confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    /* walk into a province that isn't the one you're in */
    const here = provAt(G.owPos.x, G.owPos.y); let to = null; for (let x=0;x<OW_COLS && !to;x++) for (let y=0;y<OW_ROWS;y++){ const p = provAt(x, y); if (p && p!==here && !p.wild && !wgBioAt(x, y) && G.ow.map[x][y]===OW_GRASS){ to = { x, y, p }; break; } }
    G.player._areaKey = null; G.player.areasSeen = []; G.owPos = { x:to.x, y:to.y }; const L0 = G.log.length; wgOnStep(); const lg = G.log.slice(L0).map(l=>l.msg);
    out.enter = lg.some(m=>m.includes(to.p.name)); out.ruler = lg.some(m=>m.includes(to.p.ruler) && m.includes(to.p.seat.name)); out.log = lg;
    /* the foe turns up on its roads: a fourth of fights or so */
    const pk = arenaPicker(OW_GRASS, to.x, to.y); out.famOk = !!famPickFrom([to.p.foe], 30, 4); let n = 0; for (let i=0;i<200;i++) if (pk(30, 4)) n++;
    out.picks = n;
    /* the chart: borders drawn on it */
    owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; PM.cv = null; pmBuild(); out.chart = !!PM.cv; G.owZoomedOut = true; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs623-map.png' });
  await page.evaluate(()=>{ G.owZoomedOut = false; setUi('worldPreview'); renderWorldPreviewMap(); });
  await page.waitForTimeout(400); await page.screenshot({ path: SHOTS + '/rs623-preview.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.w.every(w=>w.n >= w.towns && w.n <= w.towns + 12), 'a province for every town, and a few marches at most');
  A(r.w.every(w=>w.seatOk), 'every town sits in its own province, as its seat');
  A(r.w.every(w=>w.cover > 0.97 && w.wet===0), 'the land is shared out (all but specks of it), the sea isn\'t');
  A(r.w.every(w=>w.named && w.uniq), 'every province named, with a ruler and a foe, no two alike');
  A(r.w.every(w=>w.ms < 400), 'worked out quickly: ' + r.w.map(w=>w.ms));
  A(r.enter && r.ruler, 'walking in names it, and who rules it from where');
  A(r.famOk, 'its foe can be fought');
  A(r.chart, 'the world map is drawn');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
