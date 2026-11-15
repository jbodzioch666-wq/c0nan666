// RS-619: the world preview drawn in clear colours (grass lighter than the woods, rivers bright, ranges pale stone, rarer biomes a tint over
// the land), and the Wilderness gone - no band on the map, no Wilderness level anywhere, no losing what you carry, its achievement now The
// Far Reaches - while the world is laid down as before (the same roads and map). Shot: shots/rs619-preview.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); wgRegenerate(1947342953); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } const out = {};
    const px = (t)=>{ for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===t && !wgBioAt(x, y) && !owCliffAt(x, y)) return wgPreviewColor(t, x, y); return null; };   /* (RS-654: not a sea cliff - grey stone since RS-622, and the map's edge is full of them) */
    out.grass = px(OW_GRASS); out.forest = px(OW_FOREST); out.river = px(OW_RIVER); out.mtn = px(OW_MOUNTAIN);
    /* the band where the Wilderness lay: on the preview's canvas, no red wash */
    const w = G.ow.wild, cv = document.getElementById('worldPreviewCanvas'), cx = cv.getContext('2d'); out.side = w && w.side;
    let red = 0, n = 0, spot = null; const cell = cv.width/OW_COLS; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (!wgWildGen(x, y) || G.ow.map[x][y]===OW_WATER || OW_SITE_TILES.includes(G.ow.map[x][y])) continue; if ((x + y) % 7) continue;
      n++; if (!spot && o3Passable(x, y)) spot = { x, y }; const d = cx.getImageData(Math.floor(x*cell + cell/2), Math.floor(y*cell + cell/2), 1, 1).data, want = wgPreviewColor(G.ow.map[x][y], x, y).match(/\d+/g).map(Number); if (d[0] - want[0] > 8 && d[0] > d[1]) red++; }   /* (RS-655: reddened - the old wash reddened every point; the provinces' lettering (RS-623) now lies over a few, dark ink and pale parchment) */
    out.band = [red, n];
    let wildAny = 0, wildGen = 0; for (let x=0;x<OW_COLS;x+=2) for (let y=0;y<OW_ROWS;y+=2){ if (wgWildLevel(x, y)) wildAny++; if (wgWildGen(x, y)) wildGen++; } out.wild = [wildAny, wildGen];
    /* dying where it lay: an ordinary death, with a grave to go back to */
    if (spot){ confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.owPos = { x:spot.x, y:spot.y }; G.player._areaKey = null; G.player.wildWarned = 0; wgOnStep(null); out.warned = G.ui==='wevent' && /Wilderness/.test((G.wevDlg||{}).title||''); if (G.ui==='wevent') wevChoose(0);
      G.inv.push(genItem(5,'weapon',2), genItem(5,'weapon',2)); playerDies('a test'); out.deathWild = !!G.deathWild; continueAfterDeath(false); out.grave = !!G.player.grave; }
    const a = ACHIEVEMENTS.find(q=>q.id==='wild_one'); out.ach = a.name; out.achOk = a.check({ wgStat:{ maxBand:110 } }) && a.check({ wgStat:{ maxWild:20 } }) && !a.check({ wgStat:{ maxBand:50 } });
    return out; });
  await page.screenshot({ path: SHOTS + '/rs619-preview.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const rgb = s=>s.match(/\d+/g).map(Number), lum = c=>c[0]*0.3 + c[1]*0.59 + c[2]*0.11;
  A(lum(rgb(r.grass)) > lum(rgb(r.forest)) + 30, 'grass clearly lighter than the woods (they were one dark green)');
  A(rgb(r.river)[2] > 180 && lum(rgb(r.mtn)) > 110, 'rivers bright, the ranges pale stone');
  A(r.band[1] > 20 && r.band[0] <= r.band[1]*0.05, 'no red Wilderness band on the preview (a road or a site dot drawn over a sampled point aside - the old wash coloured them all)');
  A(r.wild[0]===0 && r.wild[1] > 0, 'no Wilderness level anywhere, though the world is laid down round its old band as before');
  A(r.warned===false && r.deathWild===false && r.grave===true, 'where it lay: no warning, and a death there is an ordinary one, with its grave');
  A(r.ach==='The Far Reaches' && r.achOk, 'its achievement now The Far Reaches, kept by whoever had it');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
