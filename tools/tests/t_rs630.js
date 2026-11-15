// RS-630: generator 15 - a Planet is a cube-sphere: six 124-tile faces, unfolded in a cross. Every tile maps to the sphere and back to itself;
// a step out over any of the cube's twelve edges lands on the face that edge meets, and steps back; tiles are near one size everywhere
// (not stretched toward the poles); land runs freely over the five joined edges while the seven unjoined ones are narrow seas; the world
// preview draws it as a world map; a generator 14 Planet still comes out as it did. Shot: shots/rs630-preview.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const out = {}; goToCharCreate(); ccBegin();
    G.worldSizeTier = 'planet'; OW_COLS = 432; OW_ROWS = 216; recomputeWorldSizeConstants(); G.ow.genVer = 14; G.ow.townPositions = {}; G.ow.townFlavor = {}; G.ow.siteMoves = {}; wgRegenerate(777); out.old = !owCube() && owIsPlanet() && G.ow.map.length===432 && G.ow.map[0].length===216;
    G.ow.genVer = OW_GEN_VER; setWorldSizeTier('planet'); const N = cubeN(), W = OW_COLS, H = OW_ROWS; out.cube = owCube() && N===124 && W===496 && H===372;
    /* every tile there and back */
    let bad = 0, n = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (cubeFace(x, y) < 0) continue; n++; const t = cubeDirTile(cubeTileDir(x, y)); if (Math.floor(t.x)!==x || Math.floor(t.y)!==y) bad++; } out.round = [n, bad];
    /* over each edge: from the middle of every face's four edges, one step out and one step back */
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]], edges = [];
    for (let f=0; f<6; f++){ const o = CUBE_O[f]; for (const [dx, dy] of dirs){ const x = o[0]*N + (dx<0 ? 0 : dx>0 ? N-1 : N>>1), y = o[1]*N + (dy<0 ? 0 : dy>0 ? N-1 : N>>1), q = owOff(x, y, dx, dy), f2 = q && cubeFace(q[0], q[1]);
      const a = cubeTileDir(x, y), b = q && cubeTileDir(q[0], q[1]), ang = b ? Math.acos(Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2])) : 9;
      edges.push({ f, d:[dx, dy], f2, near:ang < Math.PI/2/N*1.8 }); } }
    out.edgesOk = edges.every(e=>e.f2 >= 0 && e.f2!==e.f && e.near); out.faces = new Set(edges.map(e=>e.f + '>' + e.f2)).size; out.bad = edges.filter(e=>!(e.f2 >= 0 && e.f2!==e.f && e.near));
    /* tile sizes: the biggest against the smallest */
    { let mn = 9, mx = 0; for (let f=0; f<6; f++){ const o = CUBE_O[f]; for (const [i, j] of [[0,0],[N>>1,N>>1],[0,N>>1],[N-1,N-1]]){ const a = cubeTileDir(o[0]*N + i, o[1]*N + j, 0, 0), b = cubeTileDir(o[0]*N + i, o[1]*N + j, 1, 1); const s = Math.acos(Math.min(1, a[0]*b[0] + a[1]*b[1] + a[2]*b[2])); mn = Math.min(mn, s); mx = Math.max(mx, s); } } out.sizeRatio = +(mx/mn).toFixed(2); }
    /* land over the joined edges (F with L, R, T and D; R with B) */
    { const M = G.ow.map, land = (x, y)=>M[x][y]!==OW_WATER; let k = 0; for (let i=0;i<N;i++){ if (land(N - 1, N + i) && land(N, N + i)) k++; if (land(2*N - 1, N + i) && land(2*N, N + i)) k++; if (land(3*N - 1, N + i) && land(3*N, N + i)) k++; if (land(N + i, N - 1) && land(N + i, N)) k++; if (land(N + i, 2*N - 1) && land(N + i, 2*N)) k++; } out.joinedLand = k; }
    setUi('worldPreview'); renderWorldPreviewMap(); const cv = document.getElementById('worldPreviewCanvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let land = 0; for (let i=0;i<d.length;i+=16) if (!(d[i] < 70 && d[i+2] > 100)) land++; out.preview = +(land/(d.length/16)).toFixed(2);
    return out; });
  await page.screenshot({ path: SHOTS + '/rs630-preview.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.old, 'a generator 14 Planet comes out as it did, laid flat');
  A(r.cube, 'a new Planet is a cube-sphere of six 124-tile faces');
  A(r.round[0]===6*124*124 && r.round[1]===0, 'every tile maps to the sphere and back to itself');
  A(r.edgesOk && r.faces===24, 'a step out over any edge lands beside it on the face it meets');
  A(r.sizeRatio < 1.5, 'tiles near one size everywhere: ' + r.sizeRatio);
  A(r.joinedLand > 20, 'land runs over the joined edges');
  A(r.preview > 0.2 && r.preview < 0.5, 'the preview draws it as a world map, about a third land');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
