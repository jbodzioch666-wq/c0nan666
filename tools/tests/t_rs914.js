// RS-914: doorways and doors. A doorway in a full wall has its lintel capped and cased; one in a wall cut down to see in has no lintel left
// hanging over it. Doors are furnishings made at a carpentry bench from any wood (plank, oak, maple, yew, magic - no plan needed), hung in a
// doorway (snapped into it, turned to hang from its other side) and swung open as you come through. The house keeps its own people's look
// (your race's) whichever town or plot you open it from. Shots: shots/rs914-doors.jpg, rs914-hung.png
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player, out = {}; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(q=>setTimeout(q, 30)); } };
    p.race = 'Dwarf'; p.gold = 3e6; skGainXP('construction', 6e7); houseBuy(3); out.townRace = G.villageRace;
    try{
    /* the house's own look, and the town's again outside */
    enterHouse(); await fr(20); out.inRace = G.villageRace; exitInterior(); out.outRace = G.villageRace;
    G.villageRace = 'human'; enterHouse(); await fr(20); out.again = G.villageRace;   /* (as after loading a save, the town's look not yet known) */
    /* the doorways: a lintel only over those in full walls */
    const K = G.houseDoorKind, ks = Object.keys(K); out.kinds = ks.map(k=>K[k].kind); const over = k=>{ const [x, y] = k.split(',').map(Number); let n = 0; V3.world.updateMatrixWorld(true);
      V3.world.traverse(o=>{ if (!o.isMesh || !o.visible) return; const b = new THREE.Box3().setFromObject(o); if (b.max.x - b.min.x > 3 || b.max.z - b.min.z > 3) return; const c = b.getCenter(new THREE.Vector3()); if (c.y > 1.6 && c.y < 3 && c.x > x + 0.2 && c.x < x + 0.8 && c.z > y + 0.2 && c.z < y + 0.8) n++; }); return n; };
    out.lowOver = ks.filter(k=>K[k].kind==='low').map(over); out.fullOver = ks.filter(k=>K[k].kind==='full').map(over);
    /* a doorway's lintel fades with the walls beside it (stood behind each wall in turn) */
    out.fadeBad = 0; out.fadeSeen = 0; for (const k of ks.slice(0, 5)){ const [x, y] = k.split(',').map(Number), I = K[k]; for (const [ox, oy] of I.across ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]]){ const tx = x + ox, ty = y + oy; if (!G.map[tx] || G.map[tx][ty]!==T_FLOOR) continue; p.x = tx; p.y = ty; await fr(25);
        for (const g of V3.occDyn) if (g.userData.link && !g.userData.furn){ const lf = Math.max(...g.userData.link.map(l=>l.userData.fade||0)); if (lf > 0.6){ out.fadeSeen++; if ((g.userData.fade||0) < 0.4) out.fadeBad++; } } } }
    /* doors at the carpentry bench: no plan needed */
    for (const [k, n] of Object.entries({ plank:20, oak_plank:20, maple_plank:10, yew_plank:10, magic_plank:10, nails:200, ironb:2, steelb:2, goldb:2 })) skAdd(k, n);
    setUi('furnCraft'); out.listed = [...document.querySelectorAll('[data-fmake]')].map(b=>b.dataset.fmake).filter(k=>/^door_/.test(k)); setUi('playing');
    for (const k of ['door_oak', 'door_oak', 'door_magic']) furnMake(k); const h = houseP(); out.made = [h.furn.door_oak, h.furn.door_magic];
    /* hung in a doorway beside you */
    const dk = ks.find(k=>K[k].kind==='full'), [ddx, ddy] = dk.split(',').map(Number), side = G.map[ddx][ddy + 1]===T_FLOOR || G.map[ddx + 1][ddy]===T_FLOOR;
    p.x = K[dk].across ? ddx : ddx + 1; p.y = K[dk].across ? ddy + 1 : ddy; if (G.map[p.x][p.y]!==T_FLOOR){ p.x = K[dk].across ? ddx : ddx - 1; p.y = K[dk].across ? ddy - 1 : ddy; } await fr(5);
    heditStart(); heditTake('door_oak'); const S = G.hedit.sel; heditDoorSnap(S, ddx + 0.6, ddy + 0.4); out.snap = [S.x, S.z, +S.r.toFixed(3)]; out.ok = heditOk(S); const r0 = S.r; heditTurn(1); out.turned = +(S.r - r0).toFixed(3); out.placed = heditPlace();
    heditTake('door_oak'); const S2 = G.hedit.sel; S2.x = ddx + 0.5; S2.z = ddy + 0.5; out.twice = heditOk(S2); S2.x = p.x + 0.5; S2.z = p.y + 0.5; out.onFloor = heditOk(S2); heditCancel();
    const lk = ks.find(k=>K[k].kind==='low'); if (lk){ heditTake('door_magic'); const S3 = G.hedit.sel; const [lx, ly] = lk.split(',').map(Number); heditDoorSnap(S3, lx + 0.5, ly + 0.5); out.lowOk = heditOk(S3); out.lowPlaced = heditPlace(); }
    heditEnd(); await fr(5); out.doors = (V3.hdoors||[]).length;
    /* it swings open as you come up to it, and shut as you go */
    const d0 = V3.hdoors.find(d=>Math.floor(d.x)===ddx && Math.floor(d.z)===ddy); await fr(30); out.open = +Math.abs(d0.a).toFixed(2);
    p.x = ddx + (K[dk].across ? 0 : 4); p.y = ddy + (K[dk].across ? 4 : 0); if (G.map[p.x] && G.map[p.x][p.y]!==T_FLOOR){ p.x = ddx - (K[dk].across ? 0 : 4); p.y = ddy - (K[dk].across ? 4 : 0); } if (!G.map[p.x] || G.map[p.x][p.y]!==T_FLOOR) houseUnstick(); await fr(60); out.shut = +Math.abs(d0.a).toFixed(2);
    p.x = K[dk].across ? ddx : ddx + 1; p.y = K[dk].across ? ddy + 1 : ddy; if (G.map[p.x][p.y]!==T_FLOOR){ p.x = K[dk].across ? ddx : ddx - 1; p.y = K[dk].across ? ddy - 1 : ddy; } await fr(40);
    out.saved = JSON.parse(JSON.stringify(h.decor)).filter(d=>/^door_/.test(d.k)).length;
    }catch(e){ out.err = String(e.stack).slice(0, 400); }
    /* every wood's door */
    { const T = THREE, W = 260, H = 380, ks = Object.keys(FURN).filter(k=>FURN[k].door), sheet = document.createElement('canvas'); sheet.width = W*ks.length; sheet.height = H; const sx = sheet.getContext('2d'), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const R = new T.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:true }); R.outputColorSpace = T.SRGBColorSpace;
      ks.forEach((k, i)=>{ const sc = new T.Scene(); sc.background = new T.Color(0x2e261c); sc.add(new T.HemisphereLight(0xfff4e0, 0x403020, 1.5)); const dl = new T.DirectionalLight(0xffffff, 1.8); dl.position.set(1.5, 3, 4); sc.add(dl);
        const m = houseDoorModel(k, false); m.getObjectByName('leaf').rotation.y = -0.45; sc.add(m); const cam = new T.PerspectiveCamera(32, W/H, 0.05, 50); cam.position.set(0.6, 1.2, 3.6); cam.lookAt(0, 1.0, 0); R.render(sc, cam);
        sx.drawImage(cv, i*W, 0); sx.fillStyle = '#fff'; sx.font = '15px sans-serif'; sx.fillText(FURN[k].nm, i*W + 6, 18); });
      R.dispose(); out.sheet = sheet.toDataURL('image/jpeg', 0.88); }
    return out; });
  if (r.sheet){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs914-doors.jpg'), Buffer.from(r.sheet.split(',')[1], 'base64')); delete r.sheet; }
  await page.screenshot({ path:path.join(__dirname, 'shots', 'rs914-hung.png') });
  console.log(JSON.stringify(r));
  A(!r.err, 'ran through', r);
  A(r.inRace==='dwarf' && r.again==='dwarf' && r.outRace===r.townRace, "the house in your people's look, from wherever; the town's again outside", r);
  A(r.kinds.includes('full') && r.lowOver.every(n=>n===0) && r.fullOver.every(n=>n >= 2), 'a lintel over a full wall\'s doorway, none over a low wall\'s', r);
  A(r.fadeSeen > 0 && r.fadeBad===0, 'a lintel fades with the walls beside it', r);
  A(r.listed.length===5 && r.made[0]===2 && r.made[1]===1, 'doors of five woods at the bench, made without a plan', r);
  A(r.ok && r.placed && Math.abs(r.turned - Math.PI) < 1e-3 && !r.twice && !r.onFloor && r.doors >= 1, 'hung in a doorway, one to a doorway, never on the floor', r);
  A(r.open > 1.2 && r.shut < 0.1 && r.saved >= 1, 'it swings open as you come through, shut behind you', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
