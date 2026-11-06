// probe (RS-695): load a save (ZSAVE) and look at the mines about you: which got their cliff in the land (o3LandMines), and why not.
// ZN: stand by the nth nearest mine (default 0) and shoot it (shots/zminesave-r<k>.png)
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8'), nth = +(process.env.ZN || 0);
  const r = await page.evaluate(async ({ t, nth, process_env_only, ALLMINES })=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    setUi('titleScreen'); importSaveText(t); const l = saveIndexList(); loadGame(l[l.length - 1].id); await fr(60); saveCurrentGame = ()=>{}; G.player.clock = DAY_LENGTH*0.4;
    const out = { gen:G.ow.genVer, cube:typeof owIsPlanet==='function' && owIsPlanet(), size:[OW_COLS, OW_ROWS], pos:G.owPos };
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['mine']).filter(s=>m[s.x][s.y]===OW_MINE).slice(0, 6);
    out.near = sites.map(s=>{ const nb = []; for (let j=-1;j<=1;j++){ let row = ''; for (let i=-1;i<=1;i++){ const q = owNb(s.x, s.y, i, j); row += q ? ({ [OW_MOUNTAIN]:'M', [OW_MINE]:'*', [OW_WATER]:'~', [OW_DESERT]:'d', [OW_GRASS]:'g', [OW_FOREST]:'f', [OW_TUNDRA]:'t', [OW_SWAMP]:'s', [OW_MOUNTAINPASS]:'p', [OW_RIVER]:'r' }[m[q[0]][q[1]]] || '?') : 'x'; } nb.push(row); } return { x:s.x, y:s.y, nb:nb.join('/') }; });
    out.all = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_MINE){ const pv = provAt(x, y); let nb = ''; for (let j=-2;j<=2;j++){ for (let i=-2;i<=2;i++){ const q = owNb(x, y, i, j); nb += q ? ({ [OW_MOUNTAIN]:'M', [OW_MINE]:'*', [OW_WATER]:'~', [OW_DESERT]:'d', [OW_GRASS]:'g', [OW_FOREST]:'f', [OW_TUNDRA]:'t', [OW_SWAMP]:'s', [OW_MOUNTAINPASS]:'p', [OW_RIVER]:'r' }[m[q[0]][q[1]]] || '?') : 'x'; } nb += '/'; } out.all.push([x, y, pv && pv.name, nb]); }
    if (process_env_only) return out;
    if (ALLMINES){ out.check = []; for (const [x, y] of out.all.map(a=>[a[0], a[1]])){ let st = null; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]]){ const q = owNb(x, y, dx, dy); if (q && o3Passable(q[0], q[1]) && m[q[0]][q[1]]!==OW_MINE){ st = q; break; } }
        if (!st){ out.check.push([x, y, 'nostand']); continue; } G.owPos = { x:st[0], y:st[1] }; await fr(90); const C = o3C(x, y), tx = Math.floor(C[0]), tz = Math.floor(C[1]), geo = O3.land.geometry;
        const has = (geo.userData.mines || []).some(([a, b])=>a===tx && b===tz); out.check.push([x, y, has ? 1 : 0, (O3.cuts || []).map(c=>c.t + '@' + (c.x - tx) + ',' + (c.y - tz)).filter(s=>{ const [a, b] = s.split('@')[1].split(',').map(Number); return Math.abs(a) <= 4 && Math.abs(b) <= 4; }).join(' ')]); } return out; }
    const s = sites[nth]; if (!s) return out;
    let st = null; for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,1],[1,-1],[-1,-1]]){ const q = owNb(s.x, s.y, dx, dy); if (q && o3Passable(q[0], q[1]) && m[q[0]][q[1]]!==OW_MINE){ st = q; break; } }
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(150);
    const C = o3C(s.x, s.y), tx = Math.floor(C[0]), tz = Math.floor(C[1]), geo = O3.land.geometry;
    out.frame = [tx, tz]; out.landMines = geo.userData.mines || null; out.has = (geo.userData.mines || []).some(([x, y])=>x===tx && y===tz); out.verts = geo.attributes.position.count;
    out.yaw = +o3SiteYaw(OW_MINE, tx, tz).toFixed(2); out.room = [[0, -0.3], [0, 0], [0, -0.6]].map(([a, b])=>+o3MineRoom(tx + 0.5 + a, tz + 0.5 + b).toFixed(2));
    out.win = O3.win; out.tile = o3Tile(tx, tz);
    const shots = {}; for (let k=0;k<4;k++){ ISO.rot = k; await fr(60); shots['r' + k] = O3.renderer.domElement.toDataURL('image/png'); } ISO.rot = 0;
    return Object.assign(out, { shots }); }, { t:txt, nth, process_env_only:!!process.env.ZLIST, ALLMINES:!!process.env.ZALL });
  if (r.shots) for (const [k, u] of Object.entries(r.shots)) fs.writeFileSync(SHOTS + '/zminesave-' + k + '.png', Buffer.from(u.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.slice(0, 6).join(' | '));
};
