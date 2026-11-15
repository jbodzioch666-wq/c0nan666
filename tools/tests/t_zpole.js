// (probe, not in ALL) a cube Planet's globe looking at one face (ZFACE, 4 the north; ZAT=x,y a tile, or the face's spot thickest with
// trees and peaks when it's left out) at a few zooms (ZZOOM=1,2.5,5): shots/zpole-<face>-<zoom>.png, with the time each face's chart took
// to draw (globeCubePatch) and its glyph layer's share (pmGlyphsTurned, the glyphs drawn afresh). ZCLIP=1 saves the middle at full size too
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; const wk = owWalkArr(); for (let i=0;i<wk.length;i+=3) wk[i] = 1; G.ow.walkVer = (G.ow.walkVer||0) + 1; await fr(20); toggleOwZoom(); await fr(10); });
  const face = +(process.env.ZFACE || 4), zooms = (process.env.ZZOOM || '1,2.5,5').split(',').map(Number), at = process.env.ZAT ? process.env.ZAT.split(',').map(Number) : null;
  for (const z of zooms){
    const r = await page.evaluate(async ([face, z, at])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      const N = cubeN(), o = CUBE_O[face]; let c = at;
      if (!c){ let best = -1; for (let y=o[1]*N + 12; y<o[1]*N + N - 12; y+=4) for (let x=o[0]*N + 12; x<o[0]*N + N - 12; x+=4){ let n = 0; for (let j=-12;j<12;j++) for (let i=-12;i<12;i++){ const t = G.ow.map[x + i][y + j]; if (t===OW_FOREST || t===OW_MOUNTAIN) n++; } if (n > best){ best = n; c = [x, y]; } } }
      const times = [], gp = globeCubePatch, gl = pmGlyphsTurned; let glMs = 0, glN = 0;
      window.pmGlyphsTurned = function(){ const t0 = performance.now(), P = GLOBE.cpatch[GLOBE.cpk], k0 = P.gl && P.gl.key; try{ return gl.apply(this, arguments); } finally { glMs += performance.now() - t0; if (P.gl && P.gl.key!==k0) glN += P.gl.n; } };
      window.globeCubePatch = function(k){ const t0 = performance.now(); glMs = 0; glN = 0; try{ return gp.apply(this, arguments); } finally { times.push([k, +(performance.now() - t0).toFixed(1), +glMs.toFixed(1), glN]); } };
      G.owZoomScale = z; await fr(3); GLOBE.dist = GLOBE.distGoal; globeFace(Math.min(c[0], OW_COLS - 1), Math.min(c[1], OW_ROWS - 1)); GLOBE.dirty = true; await fr(60);
      window.globeCubePatch = gp; window.pmGlyphsTurned = gl;
      return { z, at:c, dist:+GLOBE.dist.toFixed(2), an:+(GLOBE.an||0).toFixed(2), pa:+GLOBE.pa.toFixed(2), times:times.slice(0, 14) }; }, [face, z, at]);
    console.log(JSON.stringify(r)); await page.screenshot({ path: SHOTS + '/zpole-' + face + '-' + z + '.png' });
    if (process.env.ZCLIP) await page.screenshot({ path: SHOTS + '/zpole-' + face + '-' + z + '-clip.png', clip:{ x:400, y:250, width:600, height:400 } });
  }
  if (errs.length) console.log('ERRORS', errs.join(' | '));
};
