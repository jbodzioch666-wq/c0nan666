// RS-622: world generator 13 - sea cliffs: where high ground meets the water a coast stands sheer over it, rock at its lip, no beach below;
// never by a town, a site, a road, a ferry's pier or a river's mouth, and never a lone tile; drawn dark on the preview; a generator 12 world
// has none. Shot: shots/rs622-cliff.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { ver:OW_GEN_VER, w:[] };
    for (const seed of [1947342953, 2659250257, 777, 99]){ wgRegenerate(seed); const W = OW_COLS, H = OW_ROWS, M = G.ow.map; let n = 0, bad = 0, lone = 0;
      const piers = (G.ow.ferries||[]).flatMap(f=>[f.a, f.b]);
      for (let x=1;x<W-1;x++) for (let y=1;y<H-1;y++){ if (!owCliffAt(x, y)) continue; n++;
        let nb = 0; for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) if ((dx || dy) && owCliffAt(x+dx, y+dy)) nb++; if (!nb) lone++;
        if (G.ow.road[y*W + x] || piers.some(p=>Math.abs(p[0]-x) <= 1 && Math.abs(p[1]-y) <= 1)) bad++;
        for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++){ const t = M[x+dx][y+dy]; if (t===OW_RIVER || OW_SITE_TILES.includes(t)) bad++; } }
      out.w.push({ seed, n, bad, lone }); }
    G.ow.genVer = 12; wgRegenerate(777); out.v12 = G.ow.cliff===null; G.ow.genVer = OW_GEN_VER;
    /* in 3D: a cliff's top over the water, and the sea deep at its foot */
    wgRegenerate(777); let c = null, sea = null; for (let x=2;x<OW_COLS-2 && !c;x++) for (let y=2;y<OW_ROWS-2;y++) if (owCliffAt(x, y)){ for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (G.ow.map[x+dx][y+dy]===OW_WATER){ c = { x, y }; sea = { x:x+dx, y:y+dy }; break; } if (c) break; }
    out.preview = c ? wgPreviewColor(G.ow.map[c.x][c.y], c.x, c.y) : '';
    confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    if (c){ G.owPos = { x:c.x, y:c.y }; O3.win = null; for (let i=0;i<300;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
      out.top = +O3.heightAt(c.x + 0.5, c.y + 0.5).toFixed(3); const ex = c.x + 0.5 + (sea.x - c.x)*0.5, ez = c.y + 0.5 + (sea.y - c.y)*0.5; out.lip = +O3.heightAt(ex, ez).toFixed(3); out.foot = +O3.heightAt(sea.x + 0.5, sea.y + 0.5).toFixed(3); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs622-cliff.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver===13, 'new worlds are made by generator 13');
  A(r.w.every(w=>w.n > 5), 'every world has cliffs along its coasts');
  A(r.w.every(w=>w.bad===0 && w.lone===0), 'never by a road, a pier, a site or a river, and never a lone tile');
  A(r.v12, 'a generator 12 world has none (it comes out as it did)');
  A(r.top > -0.14 + 0.4 && r.lip > -0.14 + 0.4 && r.foot < -0.14, 'the cliff stands high to its lip, the water deep at its foot: ' + [r.top, r.lip, r.foot]);
  A(r.preview==='rgb(112,104,96)', 'drawn dark on the preview');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
