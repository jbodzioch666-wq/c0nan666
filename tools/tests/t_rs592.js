// RS-592: the walks between scenes. A building's door swings open before you go through it (its hinge was frozen with the still town,
// so it never moved) and the room's door shuts behind you; the town's gate stands shut, swings open as you come up to it, and you walk out
// through it before the road; a dungeon's stairs are walked up, or down into the dark, before the next floor, and you come off the other
// end onto it. Shots: shots/rs592-door.png, shots/rs592-gate.png, shots/rs592-stairs.png, shots/rs592-arrive.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const wait = ms=>page.waitForTimeout(ms), out = {};
  await page.evaluate(async ()=>{ window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.3;
    for (let i=0;i<200;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } });
  /* the door: it swings open as you step up, and you go in */
  Object.assign(out, await page.evaluate(async ()=>{ const b = VILLAGE_BUILDINGS.find(b=>b.key==='tavern'), d = b.door; G.player.x = d.x; G.player.y = d.y + 1; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const pv = V3.doors.tavern, leaf = pv.children[0], w0 = leaf.getWorldPosition(new THREE.Vector3()); moveDir(0, -1); return { door0:{ x:w0.x, z:w0.z } }; }));
  await wait(330); await page.screenshot({ path: SHOTS + '/rs592-door.png' });
  Object.assign(out, await page.evaluate(()=>{ const pv = V3.door && V3.door.pv; return { doorMid:{ phase:V3.door && V3.door.phase, rot:pv ? +pv.rotation.y.toFixed(2) : null, live:pv ? +Math.atan2(pv.matrixWorld.elements[8], pv.matrixWorld.elements[10]).toFixed(2) : null } }; }));
  await wait(1400);
  Object.assign(out, await page.evaluate(()=>({ inside:!!G.interior, roomDoor:!!V3.roomDoor })));
  /* out again, and to the gate: shut while you're away from it, open as you come near; out through it */
  Object.assign(out, await page.evaluate(async ()=>{ exitInterior(); setUi('playing'); for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const H = V3.gateHinges, ga = V3.gateAt; const far = H.map(h=>+h.rotation.y.toFixed(2));
    let ex = null; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_EXIT) ex = { x, y };
    G.player.x = ex.x; G.player.y = ex.y - 1; for (let i=0;i<90;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const near = H.map(h=>+(h.rotation.y/h.userData.open).toFixed(2)); moveDir(0, 1); return { gate:{ at:!!ga, far, near, walking:!!V3.gate, mode:G.gameMode } }; }));
  await wait(700); await page.screenshot({ path: SHOTS + '/rs592-gate.png' });
  Object.assign(out, await page.evaluate(()=>({ gateMid:{ walking:!!V3.gate, mode:G.gameMode } })));
  await wait(1600);
  Object.assign(out, await page.evaluate(()=>({ gateEnd:{ walking:!!V3.gate, mode:G.gameMode } })));
  /* the stairs: down the flight into the dark, then off the foot of the next floor's */
  Object.assign(out, await page.evaluate(async ()=>{ let st = null; const home = { x:G.owPos.x, y:G.owPos.y }; for (const s of questNearbySites(home.x, home.y, 1, 80, ['dungeon'])){ G.gameMode = 0; G.owPos = { x:home.x, y:home.y }; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
      for (const m of G.mon) m.alive = 0; for (let x=0;x<COLS && !st;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===advanceTile() && stairWallDir(x, y)){ st = { x, y }; break; } if (st) break; }
    if (!st) return { stairs:{ none:true } };
    const w = stairWallDir(st.x, st.y), [ex, ey] = fpStairDir(st.x, st.y), fx = st.x + ex, fy = st.y + ey; G.player.x = fx; G.player.y = fy; for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } await new Promise(r=>setTimeout(r, 4500));
    const d0 = G.depth; moveDir(st.x - fx, st.y - fy); return { stairs:{ d0, walking:!!FPD.stair, depthNow:G.depth, kind:advanceTile()===T_STAIRSD ? 'down' : 'up' } }; }));
  await wait(380); await page.screenshot({ path: SHOTS + '/rs592-stairs0.png' });
  Object.assign(out, await page.evaluate(()=>({ stairMid:{ depth:G.depth, y:ISO.player ? +ISO.player.holder.position.y.toFixed(2) : null, walking:!!FPD.stair } })));
  await wait(200); await page.screenshot({ path: SHOTS + '/rs592-stairs.png' });
  await wait(700); await page.screenshot({ path: SHOTS + '/rs592-arrive.png' });
  await wait(900);
  Object.assign(out, await page.evaluate(()=>({ stairEnd:{ depth:G.depth, walking:!!FPD.stair, arriving:!!FPD.arrive, y:ISO.player ? +ISO.player.holder.position.y.toFixed(2) : null, fade:(document.getElementById('transFade')||{ style:{} }).style.display } })));
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.doorMid && out.doorMid.phase && Math.abs(out.doorMid.rot) > 1 && Math.abs(out.doorMid.live) > 1,   /* (open as you go through it - on a slow frame the walk may be past its first half by now) */ 'the door swings open as you step up to it: ' + JSON.stringify(out.doorMid));
  A(out.inside && out.roomDoor, 'and you go in; the room has a door of its own');
  A(out.gate.at && out.gate.far.every(r=>Math.abs(r) < 0.1), 'the gate stands shut while you\'re away from it: ' + out.gate.far);
  A(out.gate.near.every(r=>r > 0.8) && out.gate.walking && out.gate.mode===3, 'it swings open as you come up to it, and you walk out through it: ' + JSON.stringify(out.gate));
  A(out.gateMid.walking && out.gateMid.mode===3 && !out.gateEnd.walking && out.gateEnd.mode===0, 'out on the road once you are through: ' + JSON.stringify([out.gateMid, out.gateEnd]));
  A(out.stairs.walking && out.stairs.depthNow===out.stairs.d0, 'the stairs walked before the next floor: ' + JSON.stringify(out.stairs));
  A(out.stairMid.depth===out.stairs.d0 && (out.stairs.kind==='down' ? out.stairMid.y < -0.08 : out.stairMid.y > 0.15), 'part way, on the flight - ' + out.stairs.kind + ': ' + JSON.stringify(out.stairMid));
  A(out.stairEnd.depth===out.stairs.d0 + 1 && !out.stairEnd.walking && !out.stairEnd.arriving && Math.abs(out.stairEnd.y) < 0.02 && out.stairEnd.fade==='none', 'then the next floor, off the stairs onto it: ' + JSON.stringify(out.stairEnd));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
