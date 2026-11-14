// RS-766 (generator 28): sites on their own ground. A pyramid stands in open desert (not a crystal waste or volcanic land painted over
// the sand), a mine beside a mountain on every size - a Planet's random tries missed a third of them - and a dragon's lair on a broad
// summit: the mountains round it raised to just under it, not a lone spire. Shot: shots/rs766_lair.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { sizes:{} };
    for (const [sz, seed] of [['medium', 4242], ['planet', 777]]){ setWorldSizeTier(sz); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); const m = G.ow.map, o = out.sizes[sz] = { gen:G.ow.genVer, pyr:0, pyrBad:[], mine:0, mineBad:0 };
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const t = m[x][y];
        if (t===OW_PYRAMID){ o.pyr++; let des = 0; for (const [dx, dy] of DIR8){ const q = owNbG(x, y, dx, dy); if (q && m[q[0]][q[1]]===OW_DESERT) des++; } if (wgBioAt(x, y) || des < 4) o.pyrBad.push([BIO[wgBioAt(x, y)]?.id || '', des]); }
        if (t===OW_MINE){ o.mine++; let side = false; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a = owNbG(x, y, dx, dy); if (a && m[a[0]][a[1]]===OW_MOUNTAIN) side = true; } if (!side) o.mineBad++; } } }
    /* the nearest lair, in 3D: the mountains round it near its height */
    setWorldSizeTier('medium'); wgRegenerate(4242); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map; let L = null, bd = 1e9; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_LAIR){ const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; L = { x, y }; } }
    let foot = null; for (const [dx, dy] of DIR8){ for (let k=2;k<6 && !foot;k++){ const q = owNbG(L.x, L.y, dx*k, dy*k); if (q && [OW_GRASS, OW_FOREST, OW_TUNDRA, OW_DESERT, OW_SWAMP].includes(m[q[0]][q[1]])) foot = q; } if (foot) break; }
    G.owPos = { x:(foot||[L.x])[0], y:(foot||[0, L.y + 3])[1] }; owReveal(L.x, L.y, 8);
    for (let i=0;i<30;i++){ renderGame(); try{ o3Render(); }catch(e){} await new Promise(r=>setTimeout(r, 80)); }
    const C = o3C(L.x, L.y), hA = (x, y)=>O3.heightAt(x, y); out.lairH = +hA(C[0], C[1]).toFixed(2); out.ring = [];
    for (const [dx, dy] of DIR8){ const q = owNbG(L.x, L.y, dx, dy); if (!q || m[q[0]][q[1]]!==OW_MOUNTAIN) continue; const c = o3C(q[0], q[1]); out.ring.push(+hA(c[0], c[1]).toFixed(2)); }
    return out; });
  await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/rs766_lair.png' });
  console.log(JSON.stringify(r));
  for (const [sz, o] of Object.entries(r.sizes)){
    A(o.gen >= 28, sz + ': generator 28: ' + o.gen);
    A(o.pyr >= 2 && !o.pyrBad.length, sz + ': every pyramid in open desert, no rarer biome over it: ' + JSON.stringify(o));
    A(o.mine >= 2 && !o.mineBad, sz + ': every mine beside a mountain: ' + JSON.stringify(o)); }
  A(r.lairH > 3 && r.ring.length >= 5 && r.ring.every(h=>h > r.lairH - 0.75), 'the lair on a broad summit, the mountains round it near its height: ' + r.lairH + ' / ' + r.ring.join(' '));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
