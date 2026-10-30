// RS-643: the 3D land's ground in its own colours on every face of a Planet. o3Ground took a stored tile but read it through the 3D land's
// frame again, so on the faces whose frame is turned the ground took another tile's colour (deserts and snow green, grass sand). Now, framed on
// each face, the ground every frame tile reads is its stored tile's; stood in a tundra and a desert off the front face, the land is laid in
// their colours; the map's places don't change with the face you're on; a medium world is as it was. Shots: shots/rs643-<kind>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const fr = n=>page.evaluate(n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), n);
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; await fr(30);
    const out = { faces:[] }, W = OW_COLS, H = OW_ROWS, N = cubeN(), m = G.ow.map, keep = O3F.face;
    /* framed on each face: the ground at every frame tile round the middle is its stored tile's */
    for (let k=0;k<6;k++){ o3FrameSet(k); const o = CUBE_O[1]; let n = 0, bad = 0;
      for (let lx=o[0]*N - 10; lx<o[0]*N + N + 10; lx+=3) for (let ly=o[1]*N - 10; ly<o[1]*N + N + 10; ly+=3){ const g = o3G(lx, ly); if (!g) continue; const t = m[g[0]][g[1]]; if (OW_SITE_TILES.includes(t)) continue; n++; if (o3GroundL(lx, ly)!==t) bad++; }
      out.faces.push({ k, n, bad }); }
    /* the map's places, built framed on the north face and on the front one */
    o3FrameSet(4); const a = geoBuild(pmMapKey()).places.map(p=>p.kind + p.n + p.name).join('|'); o3FrameSet(1); const b = geoBuild(pmMapKey()).places.map(p=>p.kind + p.n + p.name).join('|'); out.geoSame = a===b;
    o3FrameSet(keep); return out; });
  /* stood in a tundra and a desert off the front face: the land laid in their colours */
  r.stand = {};
  for (const [kind, c] of [['tundra', 'OW_TUNDRA'], ['desert', 'OW_DESERT']]){
    const s = await page.evaluate(async c=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
      const T = eval(c), W = OW_COLS, H = OW_ROWS, m = G.ow.map; let at = null;
      for (let x=3; x<W - 3 && !at; x+=2) for (let y=3; y<H - 3 && !at; y+=2){ const f = cubeFace(x, y); if (f < 0 || f===1 || m[x][y]!==T) continue; let ok = true; for (let i=-3;i<=3 && ok;i++) for (let j=-3;j<=3 && ok;j++) if (m[x + i][y + j]!==T) ok = false; if (ok) at = [x, y]; }
      if (!at) return { none:true };
      G.owPos = { x:at[0], y:at[1] }; owReveal(at[0], at[1], 12); await fr(200);
      const pl = o3PL(), land = O3.land, tex = land && land.material.userData.ownTex && land.material.userData.ownTex[0], w = O3.win, M = 5, NT = tex && tex.image.width, ti = tex ? ((pl.y - (w.y0 - M))*NT + (pl.x - (w.x0 - M)))*4 : -1;
      const want = (wgO3ColL(pl.x, pl.y, T) || O3_COL[T]).map(v=>Math.round(Math.pow(v/255, 2.2)*255)), got = tex ? Array.from(tex.image.data.slice(ti, ti + 3)) : null;
      return { face:cubeFace(at[0], at[1]), frame:O3F.face, ground:o3GroundL(pl.x, pl.y)===T, want, got, d:got ? Math.max(...got.map((v, i)=>Math.abs(v - want[i]))) : 999 }; }, c);
    r.stand[kind] = s; if (!s.none) await page.screenshot({ path: SHOTS + '/rs643-' + kind + '.png' });
  }
  /* a medium world: as it was */
  r.medium = await page.evaluate(async ()=>{ setWorldSizeTier('medium'); wgRegenerate(777); o3FrameSet(1); const W = OW_COLS, H = OW_ROWS, m = G.ow.map; let n = 0, bad = 0;
    for (let x=0;x<W;x+=3) for (let y=0;y<H;y+=3){ const t = m[x][y]; if (OW_SITE_TILES.includes(t)) continue; n++; if (o3GroundL(x, y)!==t) bad++; } return { id:O3F.id, n, bad }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.faces.length===6 && r.faces.every(f=>f.n > 1000 && f.bad===0), 'framed on any face, the ground at every frame tile is its stored tile\'s');
  A(r.geoSame, 'the map\'s places don\'t change with the face you\'re on');
  for (const k of ['tundra', 'desert']){ const s = r.stand[k]; if (s.none) continue; A(s.frame!==1 && s.ground && s.d <= 2, 'stood in a ' + k + ' off the front face, the land is laid in its colour'); }
  A(!r.stand.tundra.none || !r.stand.desert.none, 'a tundra or a desert off the front face to stand in');
  A(r.medium.id && r.medium.n > 1000 && r.medium.bad===0, 'a medium world as it was');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
