module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const key = (k, code)=>handleKeydown({ key:k, code:code||'', target:document.body, preventDefault(){} });
    const up = k=>document.dispatchEvent(new KeyboardEvent('keyup', { key:k }));
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false; G.gameMode = 0;
    // the overworld: find open ground with all eight neighbours passable
    let f = null;
    for (let x=3;x<OW_COLS-3 && !f;x++) for (let y=3;y<OW_ROWS-3;y++){ let ok = true; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (!o3Passable(x+i,y+j) || OW_SITE_TILES.includes(G.ow.map[x+i][y+j])) ok = false; if (ok){ f = [x,y]; break; } }
    A(f, 'open ground');
    const home = ()=>{ G.owPos = { x:f[0], y:f[1] }; G.ow.encounters = []; G.wevDlg = null; G.ui = 'playing'; };   // (a step can start a roadside event)
    home();
    moveDir(1, 1); A(G.owPos.x===f[0]+1 && G.owPos.y===f[1]+1, 'overworld diagonal');
    home();
    // keys: W held, then D = north-east; the numpad's 7 = north-west
    key('w'); A(G.owPos.y===f[1]-1 && G.owPos.x===f[0], 'w north'); home(); key('d'); A(G.owPos.x===f[0]+1 && G.owPos.y===f[1]-1, 'w+d north-east'); up('w'); up('d');
    home(); key('Home', 'Numpad7'); A(G.owPos.x===f[0]-1 && G.owPos.y===f[1]-1, 'numpad 7'); up('Home');
    home(); key('7', 'Numpad7'); A(G.owPos.x===f[0]-1 && G.owPos.y===f[1]-1, 'numpad 7 with NumLock on walks, not the quickbar');
    // no cutting across a mountain's corner
    home(); const t0 = G.ow.map[f[0]+1][f[1]], t1 = G.ow.map[f[0]][f[1]+1];
    G.ow.map[f[0]+1][f[1]] = OW_MOUNTAIN; moveDir(1, 1); A(G.owPos.x===f[0] && G.owPos.y===f[1], 'no corner cutting');
    G.ow.map[f[0]+1][f[1]] = t0; G.ow.map[f[0]][f[1]+1] = t1;
    // click paths take the diagonal
    const pth = o3PathTo(f[0]+1, f[1]+1); out.o3path = pth; A(pth && pth.length===1, 'overworld path goes diagonally');
    // the map's route planner, by road and across country
    home(); for (const roads of [false, true]){ G.player.routeRoads = roads; G.player.route = { pts:[[f[0]+1, f[1]+1]] }; routeInfo.c = null; const ri = routeInfo(); A(ri && ri.steps===1, 'route goes diagonally (roads '+roads+')'); }
    G.player.route = null; G.player.routeRoads = true;
    // a town
    const tn = townList()[0]; G.owPos = { x:tn.x, y:tn.y }; enterVillage(); setUi('playing');
    let g = null; for (let x=2;x<COLS-2 && !g;x++) for (let y=2;y<ROWS-2;y++){ let ok = true; for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) if (!v3Walkable(x+i,y+j)) ok = false; if (ok){ g = [x,y]; break; } }
    A(g, 'open street'); G.villagers = []; G.player.x = g[0]; G.player.y = g[1]; moveDir(1, -1); A(G.player.x===g[0]+1 && G.player.y===g[1]-1, 'town diagonal');
    const vp = v3PathTo(g[0]-1, g[1]+1, false); out.v3path = vp; A(vp && vp.length===2 && vp.some(d=>d[0] && d[1]), 'town path goes diagonally');
    // a fight: no diagonal strikes, and monsters close square-on
    G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; G.gameMode = 0; randomEncounter(false); setUi('playing');
    const p = G.player, m = G.mon[0]; G.mon = [m];
    let c = null; for (let x=2;x<COLS-3 && !c;x++) for (let y=2;y<ROWS-3;y++){ let ok = true; for (let i=-1;i<=2;i++) for (let j=-1;j<=2;j++) if (tileAt(x+i,y+j)!==T_FLOOR) ok = false; if (ok){ c = [x,y]; break; } }
    A(c, 'open floor'); p.x = c[0]; p.y = c[1]; m.x = c[0]+1; m.y = c[1]+1; const hp0 = m.hp;
    moveDir(1, 1); A(p.x===c[0] && p.y===c[1] && m.hp===hp0, 'no diagonal strike');
    A(Math.abs(m.x-p.x)+Math.abs(m.y-p.y)===2, 'no turn spent');
    // (some monsters stand and cast, or idle a turn: give it a few tries from the corner)
    let sq = false; for (let i=0;i<8 && !sq;i++){ m.x = c[0]+1; m.y = c[1]+1; p.hp = effMaxHp(); tickMonsters(); if (m.x!==c[0]+1 || m.y!==c[1]+1){ A(Math.abs(m.x-p.x)+Math.abs(m.y-p.y)<=1, 'the monster steps square-on'); sq = true; } }
    out.monAfter = [m.x-p.x, m.y-p.y];
    // a far monster chases on the diagonal
    m.x = c[0]+2; m.y = c[1]+2; m.hp = m.maxHp; let moved = false; for (let i=0;i<6 && !moved;i++){ m.x = c[0]+2; m.y = c[1]+2; tickMonsters(); if (m.x===c[0]+1 && m.y===c[1]+1) moved = true; }
    out.diagChase = moved;
    // the iso view: two held keys walk the diagonal between them
    if (typeof isoDirFor==='function' && FPD.ok){ const v1 = isoDirFor(1,-1), v2 = isoDirFor(2,0); out.iso = [v1, v2]; A(Math.abs(v1[0])+Math.abs(v1[1])===1, 'one key = a grid cardinal'); A(v2[0] && v2[1], 'two keys = a grid diagonal'); }
    // the figure in the 3D fight view turns to the diagonal it walked
    G.mon = []; p.x = c[0]; p.y = c[1]; moveDir(1, 1); A(p.x===c[0]+1 && p.y===c[1]+1, 'diagonal in a fight');
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    if (ISO.player){ out.isoFace = +ISO.player.face.toFixed(2); A(Math.abs(ISO.player.face - Math.atan2(1, 1)) < 0.15, 'faces the diagonal'); }
    isoStep([0, 1]); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    if (ISO.player){ out.isoFace2 = +ISO.player.face.toFixed(2); A(Math.abs(ISO.player.face - Math.atan2(0, 1)) < 0.15, 'and back to square-on'); }
    return out;
  });
  console.log(JSON.stringify(r));
};
