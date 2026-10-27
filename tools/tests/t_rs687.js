// RS-687: the Drowned Temple. Generator 23 puts every sunken temple out at sea: a water tile with open water all round it and a shore
// within five tiles, reached by boat. The land under it is a well in the seabed with the shrine at the bottom, its roof under the waves,
// shafts of light and fish in the water over it, a mooring stone standing up out of the water at the lip. Sailing onto it you come
// round to the stone broadside; the eye wakes (one toll), the sea parts (one rush: the sheet opens over the well, the water in it falls
// to the floor and fades, a wall of water stands round it) and you step out of the boat, which waits at the stone, down the winding
// stair to the path - whose flags then sink into their own stair and the pool drains down it as on land (one grind) - and on in. No
// shake, no zoom, your own size. Without a boat the temple is out of reach; a generator 22 world keeps its temples on the land.
// Shots: shots/rs687-sea.png (drowned), shots/rs687-parted.png (the sea parted, going down)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, out = { ver:G.ow.genVer }, N4 = [[1,0],[-1,0],[0,1],[0,-1]];
    /* every temple at sea */
    const temples = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE) temples.push({ x, y });
    out.temples = temples.length; out.atSea = temples.filter(t=>owSeaSite(t.x, t.y)).length;
    out.shore = temples.filter(t=>{ for (let dx=-5;dx<=5;dx++) for (let dy=-5;dy<=5;dy++){ const q = owNb(t.x, t.y, dx, dy); if (q && [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) return true; } return false; }).length;
    out.ring = temples.filter(t=>[[1,1],[-1,1],[1,-1],[-1,-1]].concat(N4).every(([a, b])=>{ const q = owNb(t.x, t.y, a, b); return q && m[q[0]][q[1]]===OW_WATER; })).length;
    const s = temples.slice().sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y))[0]; if (!s) return out;
    /* without a boat: not to be had */
    G.player.hasBoat = 0; { const q = owNb(s.x, s.y, 0, 1); G.owPos = { x:q[0], y:q[1] }; tryMoveOverworld(0, -1); out.noBoat = G.owPos.x!==s.x || G.owPos.y!==s.y; }
    /* by boat: beside it, the well built */
    G.player.hasBoat = 1; G.player.boatTier = 1; const q0 = owNb(s.x, s.y, 0, 2); G.owPos = { x:q0[0], y:q0[1] }; owReveal(q0[0], q0[1], 8); await fr(150);
    const C = o3C(s.x, s.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) return Object.assign(out, { nog:true });
    const dw = g.doorWay, P = dw.parts || {}; out.sea = !!dw.sea; out.parts = !!(P.pier && P.steps && P.steps.length===26 && P.disc && P.wall && P.shafts && P.shafts.length >= 4 && P.fish && P.fish.length===6 && P.flags && P.flags.length===8 && P.pool);
    out.cut = !!g.stairCut; out.floor = +O3.heightAt(C[0], C[1]).toFixed(2); out.lip = +O3.heightAt(C[0] + 1.6, C[1]).toFixed(2); out.bed = +O3.heightAt(C[0] + 2.4, C[1]).toFixed(2);
    { g.updateMatrixWorld(true); let top = -9; const v = new THREE.Vector3(); g.traverse(o=>{ if (!(o.isMesh && o.material===P.pier.material)) return; const p = o.geometry.attributes.position; for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (Math.hypot(v.x - C[0], v.z - C[1]) < 0.8) top = Math.max(top, v.y); } }); out.roof = +top.toFixed(2); }   /* (the shrine's stone over the middle: its gable the highest; the stone is merged, the mooring stone with it) */
    out.farHoles = O3.farHoles||0; out.hole = O3.uHole ? [+O3.uHole.value.z.toFixed(2), O3.uHole.value.w] : null; out.ground = o3Ground(s.x, s.y)===OW_WATER;
    out.sailing = !!(O3.boat && O3.boat.visible); out.fishOn = P.fish.every(f=>f.visible); out.shaftsOn = P.shafts.every(f=>f.visible);
    const fish0 = P.fish[0].position.clone(); await fr(20); out.fishSwim = +fish0.distanceTo(P.fish[0].position).toFixed(3);
    out.shotSea = O3.renderer.domElement.toDataURL('image/png');
    /* sail onto it */
    const q1 = owNb(s.x, s.y, 0, 1); G.owPos = { x:q1[0], y:q1[1] }; await fr(60); { const c = o3C(q1[0], q1[1]); for (let i=0;i<400 && O3.ppos && Math.hypot(O3.ppos.x - c[0], O3.ppos.z - c[1]) > 0.15;i++) await fr(1); }
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    moveDir(0, -1); out.walk = !!O3.doorWalk; out.onTile = G.owPos.x===s.x && G.owPos.y===s.y;
    let discMin = 9, wallMax = 0, holeW = 0, boatSeen = 0, boatHeld = 0, boatOff = 0, figMin = 9, minY = 9, shake = 0, camDown = 0, folded = 0, order = true, drained = false, deep = 0, shot = false, ashoreFrames = 0, mooring = null, sigMax = 0, fishOff = false, shaftsOff = false;
    const t0 = performance.now(); while (performance.now() - t0 < 40000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk; if (!W) continue;
      sigMax = Math.max(sigMax, P.sig.emissiveIntensity); if (P.disc.visible) discMin = Math.min(discMin, P.disc.position.y); wallMax = Math.max(wallMax, P.wallM.opacity); holeW = Math.max(holeW, O3.uHole.value.w);
      if (!P.fish[0].visible) fishOff = true; if (!P.shafts[0].visible) shaftsOff = true;
      shake = Math.max(shake, O3.shake || 0); if (P.deep.visible) deep++; if (!P.pool.visible) drained = true;
      const at = P.flags.map(f=>f.o.position.distanceTo(f.b) < 1e-3); for (let i=1;i<at.length;i++) if (at[i] && !at[i - 1]) order = false; folded = Math.max(folded, at.filter(Boolean).length);
      if (W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W.v > 0 && O3.ppos){ ashoreFrames++; if (O3.pgrp) figMin = Math.min(figMin, O3.pgrp.scale.x); minY = Math.min(minY, O3.ppos.y);
        if (O3.boat && O3.boat.visible){ boatSeen++; const bp = O3.boat.getWorldPosition(new THREE.Vector3()); if (!mooring) mooring = bp.clone(); else if (bp.distanceTo(mooring) < 0.08) boatHeld++; boatOff = Math.max(boatOff, Math.hypot(bp.x - O3.ppos.x, bp.z - O3.ppos.z)); } }
      if (!shot && W.v > 0.3 && W.v < 0.6){ shot = true; out.shotParted = O3.renderer.domElement.toDataURL('image/png'); } }
    window.sfx = s0;
    Object.assign(out, { sigMax:+sigMax.toFixed(2), discMin:+discMin.toFixed(3), wallMax:+wallMax.toFixed(2), holeW, fishOff, shaftsOff, boatSeen, boatHeld, ashoreFrames, boatOff:+boatOff.toFixed(2), figMin:+figMin.toFixed(2), down:+(O3_WATER_Y - minY).toFixed(2), shake:+shake.toFixed(2), camDown:+camDown.toFixed(2), folded, order, drained, deep,
      toll:heard.drowned || 0, rush:heard.waters || 0, grind:heard.slab || 0, mode:G.gameMode, kind:G.siteKind, cam:!!dw.cam, doorH:dw.doorH || 0 });
    await fr(5); out.reset = !P.wall.visible && !P.disc.visible && O3.uHole.value.w===0 && P.fish.every(f=>f.visible) && P.pool.visible && P.flags.every(f=>f.o.position.distanceTo(f.a) < 1e-4) && P.sig.emissiveIntensity < 0.1;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    /* a generator 22 world keeps its temples on the land */
    G.gameMode = 0; setUi('playing'); G.ow.genVer = 22; wgRegenerate(G.ow.seed); let land = 0, n22 = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TEMPLE){ n22++; if (!owSeaSite(x, y)) land++; } out.old = { n:n22, land, ver:G.ow.genVer }; G.ow.genVer = OW_GEN_VER;
    return out; });
  const fs = require('fs'); for (const [k, f] of [['shotSea', 'rs687-sea'], ['shotParted', 'rs687-parted']]){ if (r[k]) fs.writeFileSync(SHOTS + '/' + f + '.png', Buffer.from(r[k].split(',')[1], 'base64')); r[k] = !!r[k]; }
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver===23 && r.temples >= 2 && r.atSea===r.temples && r.ring===r.temples && r.shore===r.temples, 'every sunken temple out at sea, open water all round, a shore within five tiles');
  A(r.noBoat, 'without a boat it is out of reach');
  A(r.sea && r.parts && r.cut, 'built as the drowned temple: the mooring stone, 26 steps, the water in the well and its wall, shafts of light, six fish, the path and its stair');
  A(r.floor < -1.6 && r.lip > -0.55 && r.lip < -0.25, 'a well in the seabed: the floor deep, a lip just under the waves: ' + [r.floor, r.lip, r.bed]);
  A(r.roof < -0.14, 'its roof under the waves: ' + r.roof);
  A(r.farHoles >= 1 && r.hole && r.hole[0] > 1 && r.hole[1]===0 && r.ground, 'the far sea open over the well, the sheet clearer over it and whole, the ground seabed');
  A(r.sailing && r.fishOn && r.shaftsOn && r.fishSwim > 0.005, 'beside it in your boat, the fish swimming and the light falling');
  A(r.walk && r.onTile, 'sailing onto it you come round to the stone');
  A(r.toll===1 && r.sigMax > 1.5, 'the eye wakes: one toll');
  A(r.rush===1 && r.holeW===1 && r.wallMax > 0.5 && r.discMin < 0.1 && r.fishOff && r.shaftsOff, 'the sea parts: one rush, the sheet open, a wall of water standing, the water in the well down to the floor, the fish and the light gone');
  A(r.ashoreFrames > 10 && r.boatSeen===r.ashoreFrames && r.boatHeld > r.ashoreFrames*0.8 && r.boatOff > 0.8, 'out of the boat, which waits at the mooring stone while you go down');
  A(r.down > 1.2, 'down the winding stair to the floor of the well and on down the path: ' + r.down);
  A(r.folded===8 && r.order && r.grind===1 && r.drained && r.deep > 0, 'the flags sink in order, the pool drains, the light at the foot');
  A(r.shake < 0.05 && !r.cam && r.camDown < 0.01 && !r.doorH && r.figMin > 0.999, 'no shake, no zoom, your own size');
  A(r.mode===1 && r.kind==='temple', 'and on into the temple');
  A(r.reset, 'the sea whole again behind you, the fish back');
  A(r.blackStone===0, 'every stone has its colours');
  A(r.old.ver===22 && r.old.n >= 2 && r.old.land===r.old.n, 'a generator 22 world keeps its temples on the land');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
