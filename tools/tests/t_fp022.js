// FP-022: the dungeon as a sculpted kit (SET.tpDungeon 'model', a test against the drawn stone - 'drawn' the default): below ground
// the floor's open tiles and the rooms' walls are the kit's instanced pieces (a tile each, a face each, a corner block at the outer
// corners) in place of the drawn floor and wall faces, tinted to the theme; the pits, runes, pools and stairs keep the drawn stone; a
// click's ray finds the kit's floor; a dressing barrel is the kit's; back to 'drawn' and the drawn stone is back
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; PFX.camp = -1e9;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0;
    const p = G.player; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){ const x = p.x + dx, y = p.y + dy; if (tileAt(x, y)===T_FLOOR && !G.dungeonDeco[x][y]){ G.dungeonDeco[x][y] = 'barrel'; window.__bar = [x, y]; break; } } });
  await wait(1500);
  const look = ()=>ev(()=>{ const T = THREE, out = { on:dkOn(), inst:{}, drawn:[], open:0, faces:0, barrelKit:false, hit:null, theme:FPD.theme };
    const solid = (x, y)=>x < 0 || y < 0 || x >= COLS || y >= ROWS || G.map[x][y]===T_WALL;
    for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++){ if (solid(x, y)) continue; if (G.map[x][y]!==T_STAIRSD && (FP.ftile ? FP.ftile[y*COLS+x] : 0) < 4) out.open++; for (const [dx, dy] of FACING_VECT) if (solid(x+dx, y+dy)) out.faces++; }
    FPD.world.traverse(o=>{ if (o.isInstancedMesh) out.inst[o.userData.fk] = o.count; else if (o.isMesh && o.userData.fk) out.drawn.push(o.userData.fk); });
    for (const [k, o] of ISO.props){ if (k.startsWith('dress:') && k.includes('barrel') && o.g.visible) o.g.traverse(m=>{ if (m.isMesh && m.geometry.userData.mats) out.barrelKit = true; }); }
    const p = G.player, ray = new T.Raycaster(new T.Vector3(p.x + 0.5, 3, p.y + 0.5), new T.Vector3(0, -1, 0)), h = ray.intersectObject(FPD.world, true).find(h=>h.object.isMesh && h.object.visible!==false);
    out.hit = h ? (h.object.userData.fk || h.object.type) + '@' + h.point.y.toFixed(3) : null;
    const wm = FPD.world.children.find(o=>o.userData.fk==='dk:wall'); if (wm){ const c = (Array.isArray(wm.material) ? wm.material[0] : wm.material).color; out.wallTint = c.toArray().map(v=>+v.toFixed(2)); }
    return out; });
  A(await ev(()=>SET.tpDungeon==='drawn'), 'the drawn stone by default');
  A(await ev(()=>buildSettings().includes("setSetting('tpDungeon', 'model')")), 'a row in the settings');
  const d0 = await look(); console.log('drawn', JSON.stringify(d0));
  A(!d0.on && !Object.keys(d0.inst).length && d0.drawn.includes('wall') && d0.drawn.some(k=>/^floor\d$/.test(k)), 'the drawn faces');
  await ev(()=>{ SET.tpDungeon = 'model'; }); await wait(2500);
  const m = await look(); console.log('model', JSON.stringify(m));
  A(m.on && m.inst['dk:floor']===m.open, 'a kit tile on every open tile (' + m.inst['dk:floor'] + ' of ' + m.open + ')');
  A(m.inst['dk:wall'] > 0 && m.inst['dk:wall'] <= m.faces && m.inst['dk:wall'] >= m.faces - 12, 'a kit face on the walls (' + m.inst['dk:wall'] + ' of ' + m.faces + ')');
  A(m.inst['dk:corner'] > 0, 'corner blocks');
  A(!m.drawn.some(k=>/^floor\d$/.test(k)) && !m.drawn.includes('trim'), 'the drawn floors and trims gone (a flight head keeps its cut doorway face): ' + m.drawn.join(','));
  A(m.drawn.includes('stairStone'), 'the stairs still drawn');
  A(m.hit && m.hit.startsWith('dk:floor@') && Math.abs(+m.hit.split('@')[1]) < 0.02, 'a ray finds the kit floor: ' + m.hit);
  A(m.wallTint && m.wallTint.every(v=>v > 0.05 && v < 3), 'the walls tinted to the theme');
  A(m.barrelKit, 'the barrel is the kit\'s');
  await ev(()=>{ SET.tpDungeon = 'drawn'; }); await wait(2000);
  const d1 = await look(); console.log('back', JSON.stringify(d1));
  A(!d1.on && !Object.keys(d1.inst).length && d1.drawn.includes('wall') && !d1.barrelKit, 'the drawn stone back');
  A(!errs.length, 'page errors: ' + errs.join(' | '));
};
