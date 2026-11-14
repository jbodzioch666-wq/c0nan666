// RS-876: an auto-walk keeps off the water - the click path (o3PathTo), the route planner (wgRoutePath, by the roads) and the plain
// route (owBfs, the way back to a grave) all go round a lake by land with a boat in hand, though straight across is shorter; and to an
// island with no way on foot they still take the boat
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    owFresh = ()=>false; iceAt = ()=>false;   /* (the lake dug here counts as open water a boat can take) */
    const M = G.ow.map, W = OW_COLS, out = {};
    /* a 24 x 22 block cleared to grass, well inland */
    owLandmarkFoot = ()=>false; const o = [Math.floor(OW_COLS/2) - 12, Math.floor(OW_ROWS/2) - 11]; for (let i=-2;i<26;i++) for (let j=-2;j<24;j++) M[o[0] + i][o[1] + j] = OW_GRASS;
    out.found = !!o; if (!o) return out; const [x0, y0] = o;
    for (let i=3;i<=20;i++) for (let j=8;j<=12;j++) M[x0 + i][y0 + j] = OW_WATER;   // a lake, 18 wide and 5 deep
    G.player.hasBoat = 1; G.owPos = { x:x0 + 11, y:y0 + 6 }; const T = [x0 + 11, y0 + 14];
    const wet = tiles=>tiles.filter(([x, y])=>M[x][y]===OW_WATER).length;
    const fromSteps = st=>{ const t = []; let x = G.owPos.x, y = G.owPos.y; for (const [dx, dy] of st){ x += dx; y += dy; t.push([x, y]); } return t; };
    const fromIdx = p=>p.map(j=>[j%W, (j/W)|0]);
    const a = o3PathTo(T[0], T[1]); out.click = a && { n:a.length, wet:wet(fromSteps(a)), end:fromSteps(a).pop() };
    const b = owBfs(G.owPos.x, G.owPos.y, T[0], T[1]); out.bfs = b && { n:b.length, wet:wet(fromIdx(b)) };
    const c = wgRoutePath(G.owPos.x, G.owPos.y, T[0], T[1]); out.road = c && { n:c.length, wet:wet(fromIdx(c)) };
    /* an island in the middle: no way there on foot */
    for (let i=0;i<24;i++) for (let j=1;j<=21;j++) if (i < 2 || i > 21 || j < 3 || j > 19) {} else M[x0 + i][y0 + j] = OW_WATER;
    M[x0 + 11][y0 + 11] = OW_GRASS; G.owPos = { x:x0 + 11, y:y0 + 1 };
    const d = o3PathTo(x0 + 11, y0 + 11); out.island = d && { n:d.length, wet:wet(fromSteps(d)) };
    const e = owBfs(G.owPos.x, G.owPos.y, x0 + 11, y0 + 11); out.islandBfs = e && { n:e.length, wet:wet(fromIdx(e)) };
    return out; });
  console.log(JSON.stringify(r));
  A(r.found, 'open land to dig a lake in', r);
  A(r.click && r.click.wet===0 && r.click.n > 8, 'a click goes round the lake by land', r);
  A(r.bfs && r.bfs.wet===0, 'the plain route goes round by land', r);
  A(r.road && r.road.wet===0, 'the planner goes round by land', r);
  A(r.island && r.island.wet > 0 && r.islandBfs && r.islandBfs.wet > 0, 'to an island it still takes the boat', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
