// RS-909: the four houses, each to its own plan. Bought outright at the estate agent's (the Cottage, House, Manor and Estate; moving up costs
// the difference, down nothing back), each with its garden of 2, 4, 6 or 8 beds, a paddock from the House up and a pasture for cows from the
// Manor; the Manor and the Estate two floors joined by a stair. Every working piece has its place on each plan; every place can be reached
// and nothing stands in a doorway. An old house (rooms on plots) is carried over to the plan of its size. Shots: shots/rs909-<house>-<floor>.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing'); });
  const out = {};
  /* the shop: a level-1 can buy only the cottage */
  out.shop = await page.evaluate(()=>{ const p = G.player; p.gold = 2000000; const r = { noHouse:houseBuy(2) };
    r.cottage = houseBuy(1); r.size = houseP().size; r.gold = p.gold; r.beds = gardenP().length; r.seeds = skHave('seed_flax'); return r; });
  A(!out.shop.noHouse && out.shop.cottage && out.shop.size===1 && out.shop.gold===2000000 - 50000 && out.shop.beds===2 && out.shop.seeds >= 3, 'the cottage bought (a House needs Construction 15)', out.shop);
  for (let size=1; size<=4; size++){
    const r = await page.evaluate(async size=>{ const p = G.player, h = houseP(), o = {};
      if (h.size!==size){ skGainXP('construction', 5e7); const g0 = p.gold, want = Math.max(0, HOUSE_SIZES[size].gold - HOUSE_SIZES[h.size].gold); o.moved = houseBuy(size); o.paid = g0 - p.gold; o.want = want; }
      for (const sp of HOUSE_SPOTS) h.built[sp.id] = 1; o.size = h.size; o.beds = gardenP().length; o.herd = HOUSE_PLANS[size].herd;
      if (G.interior) exitInterior(); setUi('playing'); enterHouse(); o.floors = [];
      for (let f=0; f<housePlan().floors.length; f++){ if (f && houseFl()!==f) houseStair(); const F = { f:houseFl(), at:[p.x, p.y] };
        /* every tile reachable from where you stand, round the furniture; every bench and empty space used from beside it; no doorway blocked */
        const seen = new Set([p.x+','+p.y]), q = [[p.x, p.y]], pass = (x, y)=>G.map[x] && (G.map[x][y]===T_FLOOR || G.map[x][y]===T_DOOROUT);
        while (q.length){ const [x, y] = q.shift(); for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k = (x+a)+','+(y+b); if (!seen.has(k) && pass(x+a, y+b)){ seen.add(k); q.push([x+a, y+b]); } } }
        let floor = 0, lost = []; for (const k in G.houseArea){ const [x, y] = k.split(',').map(Number); if (!pass(x, y)) continue; floor++; if (!seen.has(k)) lost.push(k); } F.floor = floor; F.lost = lost;
        F.benches = ROOM_LAYOUT.house.benches.length; F.unreach = ROOM_LAYOUT.house.benches.filter(([k, x, y])=>!roomBenchTiles(k, x, y).some(([bx, by])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a, b])=>seen.has((bx+a)+','+(by+b))))).map(b=>b.join(':'));
        F.doorsBlocked = [...G.houseKeep].filter(k=>!pass(...k.split(',').map(Number)));
        F.kinds = ROOM_LAYOUT.house.benches.map(b=>b[0]).sort(); F.stair = ROOM_LAYOUT.house.benches.some(b=>b[0]==='hstair');
        F.villagers = G.villagers.length;
        for (let i=0;i<14;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); }
        const T = THREE, R = V3.renderer, sz = R.getSize(new T.Vector2()), cam = new T.PerspectiveCamera(40, sz.x/sz.y, 0.1, 300), cx = COLS/2, cz = ROWS/2 + (f ? 2 : 0);
        cam.position.set(cx + 4, Math.max(COLS, ROWS)*0.95, cz + Math.max(COLS, ROWS)*0.75); cam.lookAt(cx, 0, cz - 1); for (const ob of (V3.occ||[])) if (ob.userData.grp) ob.userData.grp.visible = true;
        R.render(V3.scene, cam); F.shot = R.domElement.toDataURL('image/jpeg', 0.85); F.hits = V3.hits.length; F.occ = (V3.occ||[]).length; F.wins = (V3.intWin||[]).length;
        o.floors.push(F); }
      if (houseFl()) houseStair(); o.back = houseFl()===0;
      return o; }, size);
    for (const F of r.floors){ fs.writeFileSync(path.join(__dirname, 'shots', `rs909-${size}-${F.f}.jpg`), Buffer.from(F.shot.split(',')[1], 'base64')); delete F.shot; }
    out['h' + size] = r; console.log(size, JSON.stringify(r));
    if (size > 1) A(r.moved && r.paid===r.want, 'moved up for the difference', r);
    A(r.beds===[0, 2, 4, 6, 8][size] && r.floors.length===(size >= 3 ? 2 : 1) && r.back, 'its garden and floors', r);
    for (const F of r.floors){ A(!F.lost.length && !F.unreach.length && !F.doorsBlocked.length, 'every tile and piece reached, the doorways clear', F); A(F.stair===(size >= 3), 'the stair where there are two floors', F); A(F.occ > 4 && F.hits >= F.benches, 'walls and hit boxes built', F); }
    const kinds = r.floors.flatMap(F=>F.kinds); A(['bed', 'hearth', 'trophy', 'furnace', 'anvil', 'altar', 'jeweller', 'cauldron', 'fletching', 'carpentry', 'portal'].every(k=>kinds.includes(k)), 'every working piece in the house', kinds);
    A(kinds.filter(k=>k==='patch').length===r.beds && kinds.includes('coop')===(size >= 2) && kinds.includes('byre')===(size >= 3), 'beds, the hen house from the House, the byre from the Manor', kinds); }
  /* moving down: crops the smaller garden has no room for come back as seeds; furnishings set out go to the store */
  out.down = await page.evaluate(()=>{ if (G.interior) exitInterior(); const h = houseP(), g = gardenP(); for (let i=0;i<g.length;i++) g[i] = { id:'flax', t0:clockNow() }; h.decor.push({ k:'chair', x:5.5, z:5.5, y:0, r:0 });
    const s0 = skHave('seed_flax'), c0 = h.furn.chair||0, ok = houseBuy(1); return { ok, size:h.size, beds:gardenP().length, kept:gardenP().filter(Boolean).length, seeds:skHave('seed_flax') - s0, chair:(h.furn.chair||0) - c0, decor:h.decor.filter(d=>!(FURN[d.k] && FURN[d.k].rug)).length, wpos:Object.keys(h.wpos).length }; });
  A(out.down.ok && out.down.size===1 && out.down.beds===2 && out.down.kept===2 && out.down.seeds===6 && out.down.chair===1 && !out.down.decor, 'moved down: two beds kept, six crops back as seeds, the chair to the store', out.down);
  /* an old house of rooms on plots: to its plan */
  out.old = await page.evaluate(()=>{ const p = G.player; p.house = { v:2, size:3, rooms:[{ k:'parlour', c:0, r:0 }, { k:'bedroom', c:1, r:0 }, { k:'chapel', c:2, r:0 }, { k:'garden', c:0, r:1 }, { k:'farmyard', c:1, r:1 }],
      built:{ bed:1, altar:2, portal:1 }, decor:[{ k:'chair', x:4.5, z:4.5, y:0, r:0 }, { k:'vase', x:5.5, z:4.5, y:0.6, r:0 }], furn:{ chair:1 }, wpos:{ bed:{ lx:2, ly:1, rot:0 } }, garden:[{ id:'flax', t0:1 }, null, { id:'silverleaf', t0:1 }, null],
      farm:{ a:[{ k:'cow', g:5 }, { k:'cow', g:9 }, { k:'chicken', g:1 }], feed:10, at:clockNow() } };
    const h = houseP(); const r = { v:h.v, size:h.size, rooms:h.rooms, chair:h.furn.chair, vase:h.furn.vase, decor:h.decor.filter(d=>!(FURN[d.k] && FURN[d.k].rug)).length, wpos:Object.keys(h.wpos).length, beds:gardenP().length, crops:gardenP().filter(Boolean).length, animals:farmP().a.length, note:!!h.moved3 };
    enterHouse(); r.layout = ROOM_LAYOUT.house.benches.filter(b=>b[0]==='altar' || b[0]==='portal').length; r.noteGone = !h.moved3; r.bed = (()=>{ houseStair(); return ['bed', 'altar'].every(k=>ROOM_LAYOUT.house.benches.some(b=>b[0]===k)); })(); return r; });
  A(out.old.v===3 && out.old.size===3 && out.old.rooms===undefined && out.old.chair===2 && out.old.vase===1 && !out.old.decor && !out.old.wpos && out.old.beds===6 && out.old.crops===2 && out.old.animals===3 && out.old.note, 'an old manor carried over', out.old);
  A(out.old.layout===1 && out.old.noteGone && out.old.bed, 'its portal below, its bed and altar upstairs', out.old);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
