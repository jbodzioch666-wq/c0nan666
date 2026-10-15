// (RS-425: the waypoint a row north, in line with the Peddler's path, the estate agent off its steps)
// RS-422: food on the fire while you cook (a grill over the campfire, a skillet on the hearth, browning as the bar fills, the cook panel
// stepping aside to a corner card); the town square's waypoint in its middle, with paving, benches and a lamp at each corner, every
// door and townsperson still reachable; and your weapon put away out of a fight - a one-handed one at the hip, a two-handed one, a
// staff, a spear or a bow on the back, a shield on the back - and back in hand to fight
module.exports = async page=>{
  const sleep = ms=>new Promise(r=>setTimeout(r, ms));
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, T = THREE, avg = a=>{ let s = 0; for (let i=0;i<a.length;i++) s += a[i]; return s/a.length; };
    // the rig: what's cooking shows, and browns with the bar
    { const rg = cookRigMake(T, {}), seen = {};
      for (const [kind, a, k] of [['cook','trout','fish'],['cook','meat','steak'],['cook','dsteak','dsteak'],['dish','stew','stew']]){ G.ui = 'cook'; CQ.list = [{ kind, a, n:3, done:0, ui:'cook' }]; CQ.next = performance.now() + CQ_STEP; cookRigSync(rg, true, 1);
        seen[k] = Object.keys(rg.foods).filter(n=>rg.foods[n].visible); }
      CQ.list = [{ kind:'cook', a:'meat', n:3, done:0, ui:'cook' }]; CQ.next = performance.now() + CQ_STEP; cookRigSync(rg, true, 1); const m = rg.foods.steak.userData.meshes[0], c0 = avg(m.geometry.attributes.color.array);
      CQ.next = performance.now() - 1; cookRigSync(rg, true, 1); const c1 = avg(m.geometry.attributes.color.array);
      G.ui = 'playing'; CQ.list = []; cookRigSync(rg, false, 1);
      out.rig = { seen, browned:c1 < c0 - 0.03, hidden:!rg.g.visible }; }
    // weapons put away, and drawn to fight
    const fig = (w, sh, bow)=>{ G.gear.weapon = w || newItem(); G.gear.offhand = sh || newItem(); G.gear.ranged = bow ? rsMakeBow(2, true) : newItem(); const e = m3dInstance({}, rsPlayerLook()); m3dPoseHumanoid(e.rig, 1, 0, 0, 0, 0, e); return e; };
    const where = (e, o)=>{ const r = e.rig, p = o.parent; return p===r.hips ? 'hip' : p===r.torso ? 'back' : p===r.arms[0].hand || p===r.arms[1].hand || (p && p.parent===r.arms[0].hand) || (r.wpHome && p===r.wpHome) ? 'hand' : p ? 'other' : 'none'; };
    out.wpn = {};
    for (const [nm, w, sh, bow] of [['sword', rsMakeWeapon(2, 5), rsMakeArmour('metal', 2, 'offhand')], ['dagger', rsMakeWeapon(1, 0)], ['greatsword', rsMakeWeapon(4, 9)], ['staff', rsMakeStaff(1)], ['halberd', rsMakeWeapon(2, 8)], ['bow', null, null, true]]){
      const e = fig(w, sh, bow), held = where(e, e.rig.weapon); rsSheath(e, false, 1, 1, 0); const away = where(e, e.rig.weapon), shield = e.rig.shield ? where(e, e.rig.shield) : null, scab = !!(e.rig.shd.items[0] && e.rig.shd.items[0].sc);
      rsSheath(e, true, 1, 1, 0); const back = where(e, e.rig.weapon), shBack = e.rig.shield ? where(e, e.rig.shield) : null;
      out.wpn[nm] = { held, away, back, shield, shBack, scab }; }
    // the town square
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    const [wx, wy] = townWpAt(), lamps = [[7,11],[17,11],[7,18],[17,18]].filter(([x,y])=>G.villageDeco[x][y]==='lamp').length, benches = [];
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x][y]==='pbench') benches.push([x - wx, y - wy]);
    // from the gate, every door, townsperson, the board and the stone can still be reached
    const pass = (x, y)=>G.map[x] && G.map[x][y]===T_FLOOR, seen = new Set([G.player.x + ',' + G.player.y]), q = [[G.player.x, G.player.y]];
    for (let h=0; h<q.length; h++){ const [x, y] = q[h]; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k = (x+dx) + ',' + (y+dy); if (!seen.has(k) && pass(x+dx, y+dy)){ seen.add(k); q.push([x+dx, y+dy]); } } }
    const near = (x, y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy])=>seen.has((x+dx) + ',' + (y+dy)));
    const cut = [];
    for (const b of VILLAGE_BUILDINGS) if (b.door && !near(b.door.x, b.door.y)) cut.push(b.key);
    for (const n of G.villageNpcs) if (!near(n.x, n.y)) cut.push(n.service);
    { const [bx, by] = townBoardAt(); if (!near(bx, by)) cut.push('board'); } if (!near(wx, wy)) cut.push('waypoint');
    for (const v of G.villagers) if (!v.indoors && G.villageDeco[v.x][v.y]==='pbench') cut.push('villager on a bench ' + v.x + ',' + v.y + ' ' + G.map[v.x][v.y]);   /* (a townsperson is never left inside a bench) */
    waypointArrive(G.owPos.x + ',' + G.owPos.y); G.portalFx = null; setUi('playing');
    out.town = { wp:[wx, wy], centre:[tX(12), tY(10)], pedRow:(()=>{ const b = VILLAGE_BUILDINGS.find(b=>b.key==='shop'); return b ? doorOut(b).y : -1; })(), onSteps:G.villageNpcs.filter(n=>Math.max(Math.abs(n.x - wx), Math.abs(n.y - wy)) <= 1).map(n=>n.service), tile:G.map[wx][wy]===T_WAYPOINT, lamps, benches, cut, arrive:[G.player.x - townWpAt()[0], G.player.y - townWpAt()[1]], floor:G.map[G.player.x][G.player.y]===T_FLOOR };
    // in town your weapon is put away
    G.gear.weapon = rsMakeWeapon(2, 5); rsSync && rsSync();
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    out.townSheath = !!(V3.player && V3.player.e && V3.player.e.rig.sheathed);
    // cooking at the tavern hearth: its pan shows, and the panel is a corner card
    enterInterior('tavern'); setUi('playing'); skAdd('trout', 20); let hx = -1, hy = -1; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (benchAt(x, y)==='hearth'){ hx = x; hy = y; }
    G.player.x = hx + 1; G.player.y = hy + 1; for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    G.cookAt = 'hearth'; setUi('cook'); const full = document.getElementById('overlay').classList.contains('ovcook'); cqAdd('cook', 'trout', '', 20);
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const ov = document.getElementById('overlay');
    out.hearth = { pans:(V3.hearthCook||[]).length, shown:(V3.hearthCook||[]).filter(h=>h.g.visible).length, fish:(V3.hearthCook||[]).some(h=>h.g.visible && h.foods.fish.visible), card:ov.classList.contains('ovcook'), fullFirst:full, small:ov.innerHTML.indexOf('DISHES') < 0 };
    cqStop(); out.hearth.after = !ov.classList.contains('ovcook') && ov.innerHTML.indexOf('DISHES') >= 0;
    setUi('playing'); for (let i=0;i<2;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } out.hearth.gone = (V3.hearthCook||[]).every(h=>!h.g.visible);
    // cooking at your campfire on the open land: the grill over it, with a steak on it, and you sat beside it
    exitInterior(); G.interior = null; G.gameMode = 0; setUi('playing');
    let spot = null; const sp = G.ow.spawnPos;
    for (let rr=1; rr<12 && !spot; rr++) for (let dx=-rr; dx<=rr && !spot; dx++) for (let dy=-rr; dy<=rr; dy++){ const x = sp.x+dx, y = sp.y+dy, tt = G.ow.map[x] && G.ow.map[x][y]; if ((tt===OW_GRASS || tt===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y }; G.mon = []; skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 500 }; skAdd('meat', 20);
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    G.cookAt = 'fire'; setUi('cook'); cqAdd('cook', 'meat', '', 20); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    out.fire = { rig:!!(O3.cookRig && O3.cookRig.g.visible), steak:!!(O3.cookRig && O3.cookRig.foods.steak.visible), sat:!!(O3.player && O3.player.campSit), stick:!!(O3.campStick && O3.campStick.visible), wpnAway:!!(O3.player && O3.player.e.rig.sheathed) };
    cqStop(); setUi('playing'); for (let i=0;i<2;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } out.fire.gone = !(O3.cookRig && O3.cookRig.g.visible);
    // in a dungeon: put away with nothing about, drawn when you fight
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.mon = [];
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    const ir = ISO.player && ISO.player.rig; out.dg = { away:!!(ir && ir.sheathed) };
    FP.swing = 1; for (let i=0;i<12;i++){ FP.swing = 1; renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    out.dg.drawn = !!(ir && !ir.sheathed && ir.weapon.parent===ir.wpHome);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.rig.seen.fish.join()==='fish' && r.rig.seen.steak.join()==='steak' && r.rig.seen.dsteak.join()==='dsteak' && r.rig.seen.stew.join()==='stew', 'the food that\'s cooking shows - a fish, a steak, a dragon steak, a stew');
  A(r.rig.browned && r.rig.hidden, 'it browns as the bar fills, and the rig goes when you stop');
  for (const k of ['sword','dagger']) A(r.wpn[k].held==='hand' && r.wpn[k].away==='hip' && r.wpn[k].back==='hand' && r.wpn[k].scab, k + ': at the hip in a scabbard, back in hand to fight');
  for (const k of ['greatsword','staff','halberd','bow']) A(r.wpn[k].held==='hand' && r.wpn[k].away==='back' && r.wpn[k].back==='hand', k + ': on the back, back in hand to fight');
  A(r.wpn.greatsword.scab && !r.wpn.staff.scab, 'a greatsword in a scabbard on the back, a staff without');
  A(r.wpn.sword.shield==='back' && r.wpn.sword.shBack==='hand', 'the shield on the back, and on the arm to fight');
  A(r.town.tile && r.town.wp.join()===r.town.centre.join(), 'the waypoint in the middle of the square');
  A(r.town.wp[1]===r.town.pedRow, 'in line with the path from the Peddler door (RS-425)');
  A(!r.town.onSteps.length, 'no one stands on its steps (RS-425)');
  A(r.town.lamps===4 && r.town.benches.length===4, 'a lamp at each corner and four benches');
  A(!r.town.cut.length, 'every door, townsperson, the board and the stone can still be reached');
  A(r.town.floor && Math.abs(r.town.arrive[0]) + Math.abs(r.town.arrive[1]) <= 3, 'a portal sets you down beside the stone');
  A(r.townSheath, 'in town your weapon is put away');
  A(r.hearth.pans >= 1 && r.hearth.shown===1 && r.hearth.fish, 'a skillet on the hearth with the trout in it');
  A(!r.hearth.fullFirst && r.hearth.card && r.hearth.small && r.hearth.after, 'while it cooks the panel is a small corner card, and the full one after');
  A(r.hearth.gone, 'the pan goes when you leave the hearth');
  A(r.fire.rig && r.fire.steak && r.fire.sat && !r.fire.stick && r.fire.wpnAway, 'a grill over the campfire with a steak on it, you sat beside it (no marshmallow)');
  A(r.fire.gone, 'the grill goes when you\'re done');
  A(r.dg.away && r.dg.drawn, 'in a dungeon: put away with nothing about, drawn to fight');
};
