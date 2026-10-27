// RS-659: a Planet's loose ends. (1) The chart's trees and peaks stand upright on the globe's turned faces: the face charts draw from a bare
// chart (PM.bare) and lay each glyph turned by the grid's angle there (pmGlyphsTurned), kept per face until the chart moves; the landmarks,
// points of interest, pins, houses, gathering spots and smoke turn too. (2) The sketch's darker parts are stippled on a cube planet, not
// hatched (squared paper on a turned face, a seam where two faces' lines met). (3) Roamers scale with the land on every size (owEncTarget).
// (4) Generator 20: the neighbour loops (a site's surroundings, the spawn's clearing, a region's biome...) step over face edges (owNbG).
// Shots: shots/rs659-north.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null; G.player.wildWarned = 1;
    owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; const wk = owWalkArr(); for (let i=0;i<wk.length;i+=3) wk[i] = 1; G.ow.walkVer = (G.ow.walkVer||0) + 1; await fr(20);
    const out = { ver:G.ow.genVer, cube:owCube() }, N = cubeN(), m = G.ow.map, W = OW_COLS, H = OW_ROWS;
    /* (4) a tile on the north face's west edge: its west neighbour lies on the west face, where generator 19 saw the void */
    { const x = N, y = N >> 1, nb = owNbG(x, y, -1, 0); G.ow.genVer = 19; const old = owNbG(x, y, -1, 0); G.ow.genVer = 20;
      out.nb = { face:cubeFace(x, y), nbFace:nb ? cubeFace(nb[0], nb[1]) : null, oldFace:old ? cubeFace(old[0], old[1]) : null, spawnFace:cubeFace(G.ow.spawnPos.x, G.ow.spawnPos.y) }; }
    /* (3) the roamers, to the land */
    { let land = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++) if (m[x][y]!==OW_WATER && cubeFace(x, y) >= 0) land++; out.enc = { planet:owEncTarget(), want:clamp(Math.round(25*land/11800), 25, 75), n:G.ow.encounters.length }; }
    /* (1), (2): the chart */
    toggleOwZoom(); await fr(10); if (!PM.cv) pmBuild();
    { const ink = cv=>{ const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i=0;i<d.length;i+=16) if (d[i] < 110 && d[i+1] < 90) n++; return n; }; out.bare = { has:!!PM.bare, cv:ink(PM.cv), bare:PM.bare ? ink(PM.bare) : -1 }; }
    { /* a stretch of open sea inside a face: dots, and no bias to the old hatching's diagonal */
      let sea = null; for (let f=0; f<6 && !sea; f++){ const o = CUBE_O[f]; for (let y=o[1]*N + 8; y<o[1]*N + N - 40 && !sea; y+=6) for (let x=o[0]*N + 8; x<o[0]*N + N - 40 && !sea; x+=6){ let ok = true; for (let j=0;j<32 && ok;j++) for (let i=0;i<32 && ok;i++) if (m[x + i][y + j]!==OW_WATER) ok = false; if (ok) sea = [x, y]; } }
      if (sea){ const P = PM.P, sk = pmSketch(), d = sk.getContext('2d').getImageData(sea[0]*P, sea[1]*P, 32*P, 32*P).data, w = 32*P; let dark = 0, diag = 0, n = 0, sum = 0;
        for (let i=0;i<d.length;i+=4) sum += d[i]; const mean = sum/(d.length/4);
        for (let i=0;i<d.length;i+=4){ n++; if (d[i] < mean - 12){ dark++; const px = (i/4) % w + sea[0]*P, py = Math.floor((i/4)/w) + sea[1]*P; if (((px - py) % 6 + 6) % 6===0) diag++; } }
        out.stip = { dark:+(dark/n).toFixed(3), diag:dark ? +(diag/dark).toFixed(3) : -1 }; } else out.stip = { none:true }; }
    /* (1) the north face's thickest woods, looked at close: the glyphs drawn turned by the face's angle, from a layer kept per face */
    const look = async (face, at)=>{ const o = CUBE_O[face]; let c = at || null, best = -1; if (!c) for (let y=o[1]*N + 14; y<o[1]*N + N - 14; y+=4) for (let x=o[0]*N + 14; x<o[0]*N + N - 14; x+=4){ let n = 0; for (let j=-12;j<12;j++) for (let i=-12;i<12;i++){ const t = m[x + i][y + j]; n += t===OW_FOREST || t===OW_MOUNTAIN ? 3 : t===OW_SWAMP || t===OW_DESERT || t===OW_TUNDRA ? 1 : 0; } if (n > best){ best = n; c = [x, y]; } }   /* (the spot thickest with the things drawn) */
      const rots = [], g0 = window.pmGlyph, nd = window.pmNearDetail; let near = 0, cur = -1; const gp = globeCubePatch;
      window.pmGlyph = function(x){ if (cur===face){ const t = x.getTransform(); rots.push([Math.atan2(t.b, t.a), t.e, t.f]); } return g0.apply(this, arguments); }; window.pmNearDetail = function(){ near++; return nd.apply(this, arguments); };
      window.globeCubePatch = function(k){ cur = k; try{ return gp.apply(this, arguments); } finally { cur = -1; } };
      G.owZoomScale = 3.2; await fr(3); GLOBE.dist = GLOBE.distGoal; globeFace(c[0], c[1]); GLOBE.dirty = true; await fr(50);
      const P = GLOBE.cpatch[face], key1 = P && P.gl && P.gl.key, n1 = P && P.gl && P.gl.n; const before = rots.length; GLOBE.dirty = true; await fr(30);   /* (drawn again, for its clouds: the layer kept) */
      window.pmGlyph = g0; window.pmNearDetail = nd; window.globeCubePatch = gp;
      const med = a=>{ const s = a.slice().sort((p, q)=>p - q); return s.length ? s[s.length >> 1] : null; }, wr = a=>Math.abs(((a % (Math.PI*2)) + Math.PI*3) % (Math.PI*2) - Math.PI), an = P && P.an || 0, gl = P && P.gl;
      /* the ones within thirty tiles of the tile you look at (farther out, toward the horizon, the grid's lines are seen edge-on and swing toward the limb, as the writing's do) */
      const near30 = gl ? rots.filter(([, e, f])=>Math.hypot(gl.x0 + e/gl.gb - c[0], gl.y0 + f/gl.gb - c[1]) <= 30) : [], abs = near30.map(v=>Math.abs(v[0])), off = near30.map(v=>wr(v[0] + an));
      return { at:c, woods:best, an:+an.toFixed(2), glyphs:rots.length, near30:near30.length, med:+(med(abs)||0).toFixed(2), offMed:+(med(off)||0).toFixed(2), offP90:off.length ? +off.slice().sort((p, q)=>p - q)[Math.floor(off.length*0.9)].toFixed(2) : -1,    kept:!!(P && P.gl && P.gl.key===key1 && P.gl.n===n1), drawnAgain:rots.length - before, near, lod2:owZoomScale() >= 3 }; };
    out.north = await look(4);
    out.front = await look(1);
    out.pole = await look(4, [CUBE_O[4][0]*N + (N >> 1), CUBE_O[4][1]*N + (N >> 1)]);   /* (the face's middle, where its grid lies well turned on the screen) */
    /* the other drawings turned about their own place, by the chart's turn: a landmark (context first) and a town's houses (the chart's) */
    { const got = {}, lm0 = window.pmLandmark, hs0 = window.pmHouses; window.pmLandmark = function(c, px, py){ got.lm = c.getTransform(); }; window.pmHouses = function(px, py){ got.hs = ctx.getTransform(); };
      const un = globeUprightOn(0.8); try{ ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); pmLandmark(ctx, 100, 50, 10, { id:'spire', x:0, y:0 }, 0); pmHouses(60, 40, 1, 1); ctx.restore(); } finally { un(); window.pmLandmark = lm0; window.pmHouses = hs0; }
      const rot = t=>t ? +Math.atan2(t.b, t.a).toFixed(2) : null; out.wrap = { lm:[rot(got.lm), got.lm && [+got.lm.e.toFixed(1), +got.lm.f.toFixed(1)]], hs:[rot(got.hs), got.hs && [+got.hs.e.toFixed(1), +got.hs.f.toFixed(1)]], restored:window.pmLandmark===lm0 }; }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs659-north.png' });
  /* (3) a Large world: more than the medium world's fifty roamers; a Medium one keeps about fifty */
  const r2 = await page.evaluate(()=>{ toggleOwZoom(); const out = {}; for (const [tier, seed] of [['large', 777], ['medium', 777]]){ setWorldSizeTier(tier); wgRegenerate(seed); let land = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]!==OW_WATER) land++; out[tier] = { land, target:owEncTarget(), n:G.ow.encounters.length }; } return out; });
  Object.assign(r, { sizes:r2 }); console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver >= 20 && r.cube, 'a fresh planet is a generator 20 (or later) cube');   /* (RS-671: generator 21 since RS-668) */
  A(r.nb.face===4 && r.nb.nbFace===0 && r.nb.oldFace===-1 && r.nb.spawnFace >= 0, 'over the north face\'s west edge the neighbour lies on the west face (the void to generator 19): ' + JSON.stringify(r.nb));
  A(r.enc.planet===r.enc.want && r.enc.planet > 25 && r.enc.n >= r.enc.planet*0.7, 'a planet\'s roamers to its land: ' + JSON.stringify(r.enc));
  A(r.sizes.large.target > 30 && r.sizes.large.target===Math.min(75, Math.max(25, Math.round(25*r.sizes.large.land/11800))) && r.sizes.large.n >= r.sizes.large.target*0.7, 'a large world has more than its medium twenty-five roamers (RS-683: halved), to its land: ' + JSON.stringify(r.sizes));
  A(r.sizes.medium.target >= 25 && r.sizes.medium.target <= 31, 'a medium world keeps about twenty-five (RS-683: halved): ' + JSON.stringify(r.sizes));
  A(r.bare.has && r.bare.bare < r.bare.cv*0.9, 'the bare chart has no glyph ink: ' + JSON.stringify(r.bare));
  if (!r.stip.none) A(r.stip.dark > 0.02 && r.stip.dark < 0.3 && Math.abs(r.stip.diag - 1/6) < 0.07, 'open sea is stippled, with no diagonal hatching: ' + JSON.stringify(r.stip));
  A(r.north.glyphs > 50 && r.north.lod2 && r.north.near===0, 'close in on the north face the glyphs are drawn, through the turned layer: ' + JSON.stringify(r.north));
  const turned = L=>L.near30 < 10 || (L.offMed < 0.25 && L.offP90 < 0.6);   /* (a face with next to nothing drawn near the spot proves nothing) */
  A(turned(r.north), 'on the north face they are turned back by the grid\'s angle (its own at each spot): ' + JSON.stringify(r.north));
  A(Math.abs(r.pole.an) > 0.3 && turned(r.pole) && (r.pole.near30 < 10 || r.pole.med > 0.2), 'at the pole the grid lies turned, and what is drawn there turns with it: ' + JSON.stringify(r.pole));
  A(r.north.near30 + r.pole.near30 + r.front.near30 > 60, 'enough was drawn near the spots looked at to judge: ' + [r.north.near30, r.pole.near30, r.front.near30].join(' '));
  A(r.north.kept && r.north.drawnAgain===0, 'the layer is kept when the chart is drawn again for its clouds: ' + JSON.stringify(r.north));
  A(r.front.glyphs > 50 && turned(r.front), 'on the front face too, by its own angle: ' + JSON.stringify(r.front));
  A(r.wrap.lm[0]===0.8 && r.wrap.lm[1][0]===100 && r.wrap.lm[1][1]===50 && r.wrap.hs[0]===0.8 && r.wrap.hs[1][0]===60 && r.wrap.hs[1][1]===40 && r.wrap.restored, 'landmarks and houses turn about their own place: ' + JSON.stringify(r.wrap));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
