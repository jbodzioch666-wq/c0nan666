// RS-587: the treasure room's door at the room's face, out at its first pillars; the wandering merchant in a boat on open water; a roamer
// you can click to go and fight; a grill over the hearth's fire for what's grilled; the campfire's light there from the start, so lighting
// a fire compiles nothing. Shots: shots/rs587-door.png, shots/rs587-boat.png, shots/rs587-grill.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const fr = n=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, n);
  const out = {};
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0; });
  /* the campfire: lit, it compiles nothing new */
  await fr(200);
  Object.assign(out, await page.evaluate(async ()=>{ const o = {}; let spot = null; const sp = G.ow.spawnPos;
    for (let r=1; r<12 && !spot; r++) for (let dx=-r; dx<=r && !spot; dx++) for (let dy=-r; dy<=r; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if ((t===OW_GRASS || t===OW_DESERT) && !skNodeAt(x, y) && !owPlaceAt(x, y)){ spot = { x, y }; break; } }
    G.owPos = { x:spot.x, y:spot.y }; G.mon = []; for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const p0 = O3.renderer.info.programs.length; skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 500 }; G.player.campPitch = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 500, tent:1, spit:1 };
    let worst = 0; for (let i=0;i<30;i++){ const a = performance.now(); renderGame(); await new Promise(r=>requestAnimationFrame(r)); worst = Math.max(worst, performance.now() - a); }
    o.camp = { newProgs:O3.renderer.info.programs.length - p0, worst:Math.round(worst), lit:O3.fireLight.intensity > 0.5, near:Math.hypot(O3.fireLight.position.x - spot.x - 0.5, O3.fireLight.position.z - spot.y - 0.5) < 0.05 };
    skP().fire = null; G.player.campPitch = null; return o; }));
  /* the merchant: a boat on open water, on foot on land; and a roamer you click goes after */
  Object.assign(out, await page.evaluate(async ()=>{ const o = {}, P = G.owPos, M = G.ow.map; let wat = null, land = null;
    for (let r=2; r<14 && !(wat && land); r++) for (let dx=-r; dx<=r; dx++) for (let dy=-r; dy<=r; dy++){ const x = P.x+dx, y = P.y+dy, t = M[x] && M[x][y]; if (t===undefined) continue;
      if (!wat && t===OW_WATER && !iceAt(x, y)) wat = { x, y }; if (!land && r>=3 && r<=5 && (t===OW_GRASS || t===OW_DESERT) && !owPlaceAt(x, y) && !skNodeAt(x, y)) land = { x, y }; }
    o.found = { wat:!!wat, land:!!land }; if (!wat || !land) return o;
    G.ow.encounters = [{ x:wat.x, y:wat.y, merchant:true, id:9001 }, { x:land.x, y:land.y, merchant:false, id:9002 }]; encParty(G.ow.encounters[1]);
    moveOverworldEncounters = ()=>{};
    for (let i=0;i<400 && !(O3.beasts && O3.beasts.get('merch9001')); i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const f = O3.beasts && O3.beasts.get('merch9001'); o.boat = f ? { boat:!!(f.boat && f.boat.visible), up:+(f.e.holder.position.y - (-0.14)).toFixed(3), ringOff:!f.ring.visible, hb:!!f.hb } : null;
    if (f){ const T = THREE, c = f.e.holder.position.clone(), cam = O3.cam.clone(); cam.aspect = 1.4; cam.fov = 30; cam.updateProjectionMatrix(); cam.position.set(c.x + 2.2, c.y + 1.6, c.z + 2.2); cam.lookAt(c.x, c.y + 0.3, c.z);
      const r = O3.renderer; r.setSize(560, 400, false); gfxRender(r, O3.scene, cam, 'o3'); o.boatShot = r.domElement.toDataURL('image/png'); O3.sz = ''; }
    /* the roamer on land: click on its body */
    const ek = [...(O3.beasts||new Map()).keys()].find(k=>k.startsWith('enc9002')), fe = ek && O3.beasts.get(ek); o.encFig = !!fe;
    if (fe && fe.hb){ const v = fe.hb.getWorldPosition(new THREE.Vector3()); v.y += 0.3; v.project(O3.cam); const rc = O3.cv.getBoundingClientRect(), cx = rc.left + (v.x + 1)/2*rc.width, cy = rc.top + (1 - v.y)/2*rc.height;
      const a = o3Pick({ clientX:cx, clientY:cy }); o.pick = a && a.kind;
      O3.cv.dispatchEvent(new PointerEvent('pointerdown', { clientX:cx, clientY:cy, button:0, pointerType:'mouse', bubbles:true }));
      o.chase = { id:O3.chase, steps:O3.path.length, tip:(examineAct(a)||'').slice(0, 60) };
      /* it moves a tile: the way is laid again after the next step */
      const en = G.ow.encounters[1], nx = en.x + (en.x > P.x ? 1 : -1); if (M[nx] && (M[nx][en.y]===OW_GRASS || M[nx][en.y]===OW_FOREST || M[nx][en.y]===OW_DESERT)) en.x = nx; o.moved = [en.x, en.y];
      let met = false; for (let i=0;i<500 && !met;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); if (G.ui!=='playing' || G.gameMode!==0) met = true; }
      o.met = { met, ui:G.ui, mode:G.gameMode, chase:O3.chase }; }
    const shot = ()=>{ const r = O3.renderer; return r.domElement.toDataURL('image/png'); };
    try{ G.ui = 'playing'; G.gameMode = 0; G.owPos = { x:wat.x, y:wat.y + 3 }; }catch(e){}
    return o; }));
  /* the treasure room's door: at the room's face */
  Object.assign(out, await page.evaluate(async ()=>{ const o = {};
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0;
    const find = ()=>{ for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.dungeonDeco[x][y]==='ldoor') return { x, y }; return null; };
    let at = find(); if (!at){ for (let k=0;k<5 && !at;k++){ dgCarveCloset(); at = find(); } FPD.mapRef = null; }
    o.door = !!at; if (!at) return o;
    const pr = dressProp(at.x, at.y, 'ldoor'), dx = pr.rot===0 ? 0 : 1, dy = pr.rot===0 ? 1 : 0, rx = at.x + dx*pr.side, ry = at.y + dy*pr.side;
    o.side = pr.side; o.roomSide = G.map[rx][ry]!==T_WALL && G.map[at.x - dx*pr.side*2] && G.map[at.x - dx*pr.side*2][at.y - dy*pr.side*2]===T_VAULT;
    /* stand in the room before it */
    G.player.x = at.x + dx*pr.side*2; G.player.y = at.y + dy*pr.side*2; for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const e = [...(ISO.props||new Map()).entries()].find(([k, v])=>/ldoor/.test(k) && v.g), g = e && e[1].g;
    if (g){ g.updateMatrixWorld(true); let bb = null; g.traverse(m=>{ if (m.isMesh && m.geometry.type==='ExtrudeGeometry'){ const b = new THREE.Box3().setFromObject(m); bb = bb ? bb.union(b) : b; } });
      const c = bb.getCenter(new THREE.Vector3()); o.doorAt = +(((dx ? c.x : c.z) - ((dx ? at.x : at.y) + 0.5))*pr.side).toFixed(2); }
    return o; }));
  await page.screenshot({ path: SHOTS + '/rs587-door.png' });
  /* the hearth: a grill over the fire, a trout on it */
  Object.assign(out, await page.evaluate(async ()=>{ const o = {}; G.gameMode = 0; G.mon = []; setUi('playing');
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    enterInterior('tavern'); setUi('playing'); skAdd('trout', 20); let hx = -1, hy = -1; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (benchAt(x, y)==='hearth'){ hx = x; hy = y; }
    G.player.x = hx + 1; G.player.y = hy + 1; for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    G.cookAt = 'hearth'; setUi('cook'); cqAdd('cook', 'trout', '', 20); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const H = (V3.hearthCook||[]).find(h=>h.g.visible); o.grill = H ? { grill:!!H.pan2, fish:H.foods.fish.visible, panHid:!H.pan2.visible, inBox:H.g.position.z < -0.1, y:H.g.position.y } : null;
    if (H){ const T = THREE, c = H.g.getWorldPosition(new T.Vector3()), q = H.g.parent.getWorldQuaternion(new T.Quaternion()), fw = new T.Vector3(0, 0, 1).applyQuaternion(q), cam = V3.cam.clone();
      cam.aspect = 1.4; cam.fov = 35; cam.updateProjectionMatrix(); cam.position.copy(c).add(new T.Vector3(fw.x*1.1, 0.55, fw.z*1.1)); cam.lookAt(c.x, c.y, c.z);
      const r = V3.renderer; r.setSize(560, 400, false); gfxRender(r, V3.scene, cam, 'v3'); o.shot = r.domElement.toDataURL('image/png'); V3.sz = ''; }
    cqStop(); setUi('playing'); return o; }));
  if (out.boatShot){ require('fs').writeFileSync(SHOTS + '/rs587-boat.png', Buffer.from(out.boatShot.split(',')[1], 'base64')); delete out.boatShot; }
  if (out.shot){ require('fs').writeFileSync(SHOTS + '/rs587-grill.png', Buffer.from(out.shot.split(',')[1], 'base64')); delete out.shot; }
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.camp.newProgs===0 && out.camp.lit && out.camp.near, 'lighting a fire compiles nothing, and its light is at the fire: ' + JSON.stringify(out.camp));
  A(out.found.wat && out.found.land, 'water and land near the start');
  A(out.boat && out.boat.boat && out.boat.up > 0.1 && out.boat.ringOff, 'the merchant on open water stands in a boat: ' + JSON.stringify(out.boat));
  A(out.encFig && out.pick==='enc' && out.chase.id===9002 && out.chase.steps > 0, 'a click on a roamer goes after it: ' + JSON.stringify(out.chase));
  A(out.met && out.met.met && (out.met.mode!==0 || out.met.ui!=='playing'), 'and catches it - the fight: ' + JSON.stringify(out.met));
  A(out.door && out.side!==0 && out.roomSide, 'the treasure door faces the room: ' + out.side);
  A(out.doorAt > 0.4 && out.doorAt < 0.6, 'and stands at the room\'s face, out at its pillars: ' + out.doorAt);
  A(out.grill && out.grill.grill && out.grill.fish && out.grill.panHid && out.grill.inBox, 'a trout grilled over the hearth\'s fire: ' + JSON.stringify(out.grill));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
