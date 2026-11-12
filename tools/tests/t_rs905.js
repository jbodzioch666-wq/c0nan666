// RS-905: the house's working pieces are placeable too. In the edit mode, a click on the bed, a bench, the altar, the portal, a garden bed or
// the hen house picks it up (the room laid out without it); it's set down a tile at a time anywhere in its own room and turned a quarter at
// a time - the bed's foot going the way it's turned - and works where it stands (h.wpos, from the room's corner). Esc puts it back; it
// can't go to the store. A house from before keeps every piece where it was built. Shot: shots/rs905-moved.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const frames = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } }, n);
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 200000; houseBuy(); const h = houseP(); h.size = 2; h.rooms.push({ k:'garden', c:0, r:1 }); h.built.bed = 1; enterHouse(); });
  await frames(40);
  const r = await page.evaluate(async ()=>{ const out = {}, h = houseP(), p = G.player, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    const at = (x, y, z)=>{ const v = new THREE.Vector3(x, y, z).project(V3.cam), rc = V3.cv.getBoundingClientRect(); return { clientX:rc.left + (v.x + 1)/2*rc.width, clientY:rc.top + (1 - v.y)/2*rc.height, pointerType:'mouse', button:0 }; };
    const find = key=>{ for (const t in G.houseWork) if (G.houseWork[t].key===key) return G.houseWork[t]; return null; };
    const b0 = find('bed'); out.b0 = b0 ? [b0.x, b0.y] : null; out.oldDefault = !!b0 && !h.wpos.bed;
    heditStart(); out.picked = heditPickWork(at(b0.x + 0.5, 0.4, b0.y + 0.5)); out.sel = G.hedit.sel && G.hedit.sel.work; out.held = h.wheld; out.freed = G.map[b0.x][b0.y]===T_FLOOR && G.map[b0.x][b0.y + 1]===T_FLOOR;
    await fr(3); out.ghost = !!(V3.heGhost && V3.heGhost.parent);
    out.noStore = (heditStore(), !!G.hedit.sel); heditLift(1); out.noLift = G.hedit.sel.y===0;
    /* turned a quarter, set down further along the room: the foot to the east */
    heditTurn(1); const S = G.hedit.sel; let spot = null; for (let ly=1; ly<4 && !spot; ly++) for (let lx=0; lx<4; lx++){ const x = S.x0 + lx, y = S.y0 + ly; if (G.map[x][y]===T_FLOOR && G.map[x + 1][y]===T_FLOOR && !(x===p.x && y===p.y) && !(x + 1===p.x && y===p.y) && (x!==b0.x || y!==b0.y)){ spot = [x, y]; break; } }
    heditMove(at(spot[0] + 0.5, 0, spot[1] + 0.5)); out.aim = [Math.floor(S.x), Math.floor(S.z)]; out.spot = spot; out.ok = heditOk(S);
    /* out of its room: refused */
    const keep = [S.x, S.z]; S.x = S.x0 + 7.5; out.outRoom = heditOk(S); S.x = keep[0]; S.z = keep[1];
    out.placed = heditPlace(); out.wpos = h.wpos.bed; out.tiles = [G.villageDeco[spot[0]][spot[1]], G.villageDeco[spot[0] + 1][spot[1]]]; out.rot = G.houseRot['bed|' + spot[0] + '|' + spot[1]]; out.oldFree = G.map[b0.x][b0.y]===T_FLOOR;
    await fr(5);
    /* the garden's bed moved; it's still that bed */
    const g0 = find('gbed0'); out.g0 = !!g0; if (g0){ heditPickWork(at(g0.x + 0.5, 0.2, g0.y + 0.5)); const T = G.hedit.sel; out.gsel = T && T.work; let gs = null; for (let ly=0; ly<5 && !gs; ly++) for (let lx=0; lx<5; lx++){ const x = T.x0 + lx, y = T.y0 + ly; if (G.map[x][y]===T_FLOOR && !(x===p.x && y===p.y)){ gs = [x, y]; break; } }
      heditMove(at(gs[0] + 0.5, 0, gs[1] + 0.5)); heditPlace(); out.gAt = gardenBedAt(gs[0], gs[1]); out.gGroup = V3.garden && V3.garden[0] ? [Math.floor(V3.garden[0].g.position.x), Math.floor(V3.garden[0].g.position.z)].join() === gs.join() : false; }
    /* picked up and put back with Esc */
    const b1 = find('bed'); heditPickWork(at(b1.x + 0.5, 0.4, b1.y + 0.5)); handleKeydown(new KeyboardEvent('keydown', { key:'Escape' })); const b2 = find('bed'); out.back = !!b2 && b2.x===b1.x && b2.y===b1.y && !h.wheld && !G.hedit.sel;
    handleKeydown(new KeyboardEvent('keydown', { key:'Escape' })); out.off = !G.hedit;
    /* kept: laid out again from the save */
    const js = JSON.parse(JSON.stringify(h)); houseLayout(); const b3 = find('bed'); out.kept = !!b3 && b3.x===spot[0] && b3.y===spot[1] && js.wpos.bed && G.villageDeco[spot[0] + 1][spot[1]]==='bench:bed';
    /* a held piece in a save comes back where it stood */
    h.wheld = 'bed'; houseP(); out.unheld = !h.wheld;
    await fr(10); return out; });
  await page.screenshot({ path: __dirname + '/shots/rs905-moved.png' });
  console.log(JSON.stringify(r));
  A(r.oldDefault, 'a house from before: the bed where it was built', r);
  A(r.picked && r.sel==='bed' && r.held==='bed' && r.freed && r.ghost, 'the bed picked up, its tiles free, a ghost of it in hand', r);
  A(r.noStore && r.noLift, 'built into the house: not to the store, not raised', r);
  A(r.ok && !r.outRoom && r.aim.join()===r.spot.join(), 'set down a tile at a time, only in its own room', r);
  A(r.placed && r.wpos && Math.abs(r.rot - Math.PI/2) < 0.01 && r.tiles[0]==='bench:bed' && r.tiles[1]==='bench:bed' && r.oldFree, 'turned a quarter: the bed and its foot to the east, the old place clear', r);
  A(!r.g0 || (r.gsel==='gbed0' && r.gAt===0 && r.gGroup), 'a garden bed moved, still the same bed, its crop with it', r);
  A(r.back && r.off, 'Esc puts it back where it stood, and ends decorating', r);
  A(r.kept && r.unheld, 'kept in the save; one left in hand comes back', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
