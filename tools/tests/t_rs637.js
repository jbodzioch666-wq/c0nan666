// RS-637: generator 17 - no narrow seas left on a Planet's face edges, only small ones at the eight cube corners; the land runs over all
// twelve edges; the weather comes from the sphere (winds round true latitudes, noise in 3D), so the ground on either side of an edge
// matches about as often as any two neighbouring tiles do; a generator 16 planet comes out as before. Shots: shots/rs637-preview.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const r = await page.evaluate(async ()=>{ const out = { w:[] }; goToCharCreate(); ccBegin(); setWorldSizeTier('planet');
    G.ow.genVer = 16; wgRegenerate(777); const k16 = pmMapKey(); wgRegenerate(777); out.same16 = pmMapKey()===k16 && !owCube17(); G.ow.genVer = OW_GEN_VER;
    for (const seed of [777, 424242]){ wgRegenerate(seed); const N = cubeN(), M = G.ow.map, W = OW_COLS;
      /* every face's four edges, from inside: the pairs over each edge */
      let land = 0, pairs = 0, same = 0, edgesWithLand = 0; const per = [];
      for (let f=0; f<6; f++){ const o = CUBE_O[f]; for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]){ let l = 0;
          for (let i=4;i<N - 4;i++){ const x = o[0]*N + (dx<0 ? 0 : dx>0 ? N-1 : i), y = o[1]*N + (dy<0 ? 0 : dy>0 ? N-1 : i), q = owOff(x, y, dx, dy); if (!q) continue; const a = M[x][y], b = M[q[0]][q[1]];
            if (a!==OW_WATER && b!==OW_WATER){ l++; land++; pairs++; if (a===b) same++; } } per.push(l); if (l > 0) edgesWithLand++; } }
      /* and inside the faces, for comparison */
      let ip = 0, is = 0; for (let k=0;k<20000;k++){ const x = 1 + Math.floor(Math.random()*(W - 2)), y = 1 + Math.floor(Math.random()*(OW_ROWS - 2)); if (cubeFace(x, y) < 0 || cubeFace(x + 1, y)!==cubeFace(x, y)) continue; const a = M[x][y], b = M[x + 1][y]; if (a!==OW_WATER && b!==OW_WATER){ ip++; if (a===b) is++; } }
      let seaBad = 0, corner = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++){ if (cubeFace(x, y) < 0) continue; if (cubeCornerDist(x, y) < 2.5 && M[x][y]!==OW_WATER) seaBad++; if (cubeCornerDist(x, y) < 2.5) corner++; }
      let ghost = 0; for (let x=0;x<W;x++) for (let y=0;y<OW_ROWS;y++) if (cubeFace(x, y) < 0 && M[x][y]!==OW_WATER) ghost++;
      out.w.push({ seed, ver:G.ow.genVer, land, edgesWithLand, edgeMatch:+(same/Math.max(1, pairs)).toFixed(2), innerMatch:+(is/Math.max(1, ip)).toFixed(2), seaBad, corner, ghost, per }); }
    setUi('worldPreview'); renderWorldPreviewMap(); return out; });
  await page.screenshot({ path: SHOTS + '/rs637-preview.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.same16, 'a generator 16 planet comes out as before');
  A(r.w.every(w=>w.ver===17), 'new planets are made by generator 17');
  A(r.w.every(w=>w.edgesWithLand >= 8), 'land runs over most of the faces\' edges (of 24 sides, as many as have land there)');
  A(r.w.every(w=>w.edgeMatch > w.innerMatch - 0.15), 'over an edge the ground matches near as often as inside a face');
  A(r.w.every(w=>w.seaBad===0 && w.corner > 0), 'small seas at the eight corners');
  A(r.w.every(w=>w.ghost===0), 'nothing left in the void');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
