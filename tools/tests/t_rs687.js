// RS-687: the Drowned Temple (RS-688: the Rotunda). A sunken temple out at sea - generator 24 puts every other one there, on a water tile
// with open water 3.5 tiles round and a shore within six, reached by boat. The land under it is a well in the seabed with the Rotunda at the
// bottom: its hall and columns under the water, its green bronze dome standing up out of it; shafts of light and fish in the water over it,
// a mooring stone at the lip. A boat beside it lies out past the well. Sailing onto it you come round to the stone broadside; the eye wakes
// (one toll), the sea parts (one rush: the sheet opens over the well, the water in it falls to the floor and fades, a wall of water stands
// round it) and you step out of the boat, which waits at the stone, down the stair against the well's side to the floor and in at the
// bronze doors as they swing open (one grind). No shake, no zoom, your own size. Without a boat the temple is out of reach; a generator 23
// world keeps every temple at sea, a generator 22 world on the land.
// Shots: shots/rs687-sea.png (drowned), shots/rs687-parted.png (the sea parted, going down)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, out = { ver:G.ow.genVer, rim:O3_SEA_TEMPLE.rim };
    const all = ()=>{ const L = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TEMPLE) L.push({ x, y }); return L; };
    /* every other temple at sea, open water all round */
    const temples = all(), seaT = temples.filter(t=>owSeaSite(t.x, t.y)); out.temples = temples.length; out.atSea = seaT.length;
    out.shore = seaT.filter(t=>{ for (let dx=-6;dx<=6;dx++) for (let dy=-6;dy<=6;dy++){ const q = owNb(t.x, t.y, dx, dy); if (q && [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) return true; } return false; }).length;
    out.ring = seaT.filter(t=>{ for (let dx=-3;dx<=3;dx++) for (let dy=-3;dy<=3;dy++){ if ((!dx && !dy) || dx*dx + dy*dy > 12.25) continue; const q = owNb(t.x, t.y, dx, dy); if (!q || m[q[0]][q[1]]!==OW_WATER) return false; } return true; }).length;
    const s = seaT.slice().sort((a, b)=>Math.hypot(a.x - G.owPos.x, a.y - G.owPos.y) - Math.hypot(b.x - G.owPos.x, b.y - G.owPos.y))[0]; if (!s) return out;
    /* without a boat: not to be had */
    G.player.hasBoat = 0; { const q = owNb(s.x, s.y, 0, 1); G.owPos = { x:q[0], y:q[1] }; tryMoveOverworld(0, -1); out.noBoat = G.owPos.x!==s.x || G.owPos.y!==s.y; }
    /* by boat: beside it, the well built */
    G.player.hasBoat = 1; G.player.boatTier = 1; const q0 = owNb(s.x, s.y, 0, 1); G.owPos = { x:q0[0], y:q0[1] }; owReveal(q0[0], q0[1], 8); await fr(150);
    const C = o3C(s.x, s.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) return Object.assign(out, { nog:true });
    { let last = null; for (let i=0;i<400 && O3.ppos;i++){ await fr(1); const p = [O3.ppos.x, O3.ppos.z]; if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 1e-4 && i > 30) break; last = p; } out.beside = +Math.hypot(O3.ppos.x - C[0], O3.ppos.z - C[1]).toFixed(2); }   /* (out past the well, not over the dome) */
    const dw = g.doorWay, P = dw.parts || {}; out.sea = !!dw.sea; out.parts = !!(P.pier && P.steps && P.steps.length===30 && P.disc && P.wall && P.shafts && P.shafts.length >= 4 && P.fish && P.fish.length===8 && P.open && P.open.leaves.length===2 && P.sig);
    out.cut = !!g.stairCut; out.floor = +O3.heightAt(C[0], C[1]).toFixed(2); { let lip = -9; for (let k=0;k<16;k++){ const a = k*Math.PI/8; lip = Math.max(lip, O3.heightAt(C[0] + Math.cos(a)*O3_SEA_TEMPLE.rim, C[1] + Math.sin(a)*O3_SEA_TEMPLE.rim)); } out.lip = +lip.toFixed(2); }   /* (the lip's highest round the well) */ out.bed = +O3.heightAt(C[0] + 3.3, C[1]).toFixed(2);
    { g.updateMatrixWorld(true); const v = new THREE.Vector3(), M = O3.mats; let dome = -9, cols = -9; g.traverse(o=>{ if (!o.isMesh || !o.geometry.attributes.position) return; const p = o.geometry.attributes.position; for (let i=0;i<p.count;i++){ v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); const d = Math.hypot(v.x - C[0], v.z - C[1]);
        if (o.material===M.templeDome && d < 0.9) dome = Math.max(dome, v.y); if (o.material===M.templeSt && d > 0.9 && d < 1.12 && v.y < out.floor + 2.05) cols = Math.max(cols, v.y); } }); out.dome = +dome.toFixed(2); out.cols = +cols.toFixed(2); }   /* (the dome's top; the columns' capitals) */
    out.farHoles = O3.farHoles||0; out.hole = O3.uHole ? [+O3.uHole.value.z.toFixed(2), O3.uHole.value.w] : null; out.ground = o3Ground(s.x, s.y)===OW_WATER;
    out.sailing = !!(O3.boat && O3.boat.visible); out.fishOn = P.fish.every(f=>f.visible); out.shaftsOn = P.shafts.every(f=>f.visible);
    const fish0 = P.fish[0].position.clone(); await fr(20); out.fishSwim = +fish0.distanceTo(P.fish[0].position).toFixed(3);
    out.shotSea = O3.renderer.domElement.toDataURL('image/png');
    /* sail onto it */
    const s0 = window.sfx, heard = {}; window.sfx = n=>{ heard[n] = (heard[n] || 0) + 1; return s0(n); };
    moveDir(0, -1); out.walk = !!O3.doorWalk; out.onTile = G.owPos.x===s.x && G.owPos.y===s.y;
    let discMin = 9, wallMax = 0, holeW = 0, boatSeen = 0, boatHeld = 0, boatOff = 0, figMin = 9, minY = 9, shake = 0, camDown = 0, shot = false, ashoreFrames = 0, mooring = null, sigMax = 0, fishOff = false, shaftsOff = false, leaf = 0, leafAtStone = 9, deep = 0;
    const t0 = performance.now(); while (performance.now() - t0 < 40000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk; if (!W) continue;
      sigMax = Math.max(sigMax, P.sig.emissiveIntensity); if (P.disc.visible) discMin = Math.min(discMin, P.disc.position.y); wallMax = Math.max(wallMax, P.wallM.opacity); holeW = Math.max(holeW, O3.uHole.value.w);
      if (!P.fish[0].visible) fishOff = true; if (!P.shafts[0].visible) shaftsOff = true; if (P.deep.visible) deep++;
      const lr = Math.abs(P.open.leaves[0].rotation.y); leaf = Math.max(leaf, lr); if (W.v > 0 && W.v < 0.2) leafAtStone = Math.min(leafAtStone, lr);
      shake = Math.max(shake, O3.shake || 0);
      if (W.look > 1 && O3.camPos) camDown = Math.max(camDown, O3.camPos.y - O3.cam.position.y);
      if (W.v > 0 && O3.ppos){ ashoreFrames++; if (O3.pgrp) figMin = Math.min(figMin, O3.pgrp.scale.x); minY = Math.min(minY, O3.ppos.y);
        if (O3.boat && O3.boat.visible){ boatSeen++; const bp = O3.boat.getWorldPosition(new THREE.Vector3()); if (!mooring) mooring = bp.clone(); else if (bp.distanceTo(mooring) < 0.08) boatHeld++; boatOff = Math.max(boatOff, Math.hypot(bp.x - O3.ppos.x, bp.z - O3.ppos.z)); } }
      if (!shot && W.v > 0.3 && W.v < 0.6){ shot = true; out.shotParted = O3.renderer.domElement.toDataURL('image/png'); } }
    window.sfx = s0;
    Object.assign(out, { sigMax:+sigMax.toFixed(2), discMin:+discMin.toFixed(3), wallMax:+wallMax.toFixed(2), holeW, fishOff, shaftsOff, boatSeen, boatHeld, ashoreFrames, boatOff:+boatOff.toFixed(2), figMin:+figMin.toFixed(2), down:+(O3_WATER_Y - minY).toFixed(2), shake:+shake.toFixed(2), camDown:+camDown.toFixed(2),
      leaf:+leaf.toFixed(2), leafAtStone:+leafAtStone.toFixed(2), deep, toll:heard.drowned || 0, rush:heard.waters || 0, grind:heard.slab || 0, mode:G.gameMode, kind:G.siteKind, cam:!!dw.cam });
    await fr(5); out.reset = !P.wall.visible && !P.disc.visible && O3.uHole.value.w===0 && P.fish.every(f=>f.visible) && Math.abs(P.open.leaves[0].rotation.y) < 1e-4 && P.sig.emissiveIntensity < 0.1;
    let blackStone = 0; g.traverse(o=>{ if (o.isMesh && o.material && o.material.vertexColors && !o.geometry.attributes.color && !o.isSkinnedMesh) blackStone++; }); out.blackStone = blackStone;
    /* a generator 23 world keeps every temple at sea; a generator 22 world on the land */
    G.gameMode = 0; setUi('playing');
    for (const v of [23, 22]){ G.ow.genVer = v; wgRegenerate(G.ow.seed); const L = all(); out['g' + v] = { n:L.length, sea:L.filter(t=>owSeaSite(t.x, t.y)).length, ver:G.ow.genVer }; }
    G.ow.genVer = OW_GEN_VER;
    return out; });
  const fs = require('fs'); for (const [k, f] of [['shotSea', 'rs687-sea'], ['shotParted', 'rs687-parted']]){ if (r[k]) fs.writeFileSync(SHOTS + '/' + f + '.png', Buffer.from(r[k].split(',')[1], 'base64')); r[k] = !!r[k]; }
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ver===24 && r.temples >= 2 && r.atSea >= 1 && r.atSea <= Math.ceil(r.temples/2) && r.ring===r.atSea && r.shore===r.atSea, 'every other sunken temple out at sea, open water 3.5 tiles round, a shore within six');
  A(r.noBoat, 'without a boat it is out of reach');
  A(r.sea && r.parts && !r.cut, 'built as the Rotunda: the mooring stone, 30 steps, the water in the well and its wall, shafts of light, eight fish, bronze doors, the eye');
  A(r.floor < -2.1 && r.lip > -0.6 && r.lip < -0.25, 'a well in the seabed: the floor deep, a lip just under the waves: ' + [r.floor, r.lip, r.bed]);
  A(r.dome > -0.14 + 0.5 && r.cols < -0.14, 'its dome above the waves, its columns under them: ' + [r.dome, r.cols]);
  A(r.beside >= r.rim + 0.2, 'a boat beside it lies out past the well: ' + r.beside);
  A(r.farHoles >= 1 && r.hole && r.hole[0] > 2 && r.hole[1]===0 && r.ground, 'the far sea open over the well, the sheet clearer over it and whole, the ground seabed');
  A(r.sailing && r.fishOn && r.shaftsOn && r.fishSwim > 0.005, 'beside it in your boat, the fish swimming and the light falling');
  A(r.walk && r.onTile, 'sailing onto it you come round to the stone');
  A(r.toll===1 && r.sigMax > 1.5, 'the eye wakes: one toll');
  A(r.rush===1 && r.holeW===1 && r.wallMax > 0.5 && r.discMin < 0.1 && r.fishOff && r.shaftsOff, 'the sea parts: one rush, the sheet open, a wall of water standing, the water in the well down to the floor, the fish and the light gone');
  A(r.ashoreFrames > 10 && r.boatSeen===r.ashoreFrames && r.boatHeld > r.ashoreFrames*0.8 && r.boatOff > 0.8, 'out of the boat, which waits at the mooring stone while you go down');
  A(r.down > 2.0, 'down the stair to the floor of the well: ' + r.down);
  A(r.leafAtStone < 0.05 && r.leaf > 1.3 && r.grind===1 && r.deep > 0, 'the doors shut while you go down, then swing open as you come to them: one grind, a light within');
  A(r.shake < 0.05 && !r.cam && r.camDown < 0.01 && r.figMin > 0.999, 'no shake, no zoom, your own size');
  A(r.mode===1 && r.kind==='temple', 'and on into the temple');
  A(r.reset, 'the sea whole again behind you, the doors shut, the fish back');
  A(r.blackStone===0, 'every stone has its colours');
  A(r.g23.ver===23 && r.g23.n >= 2 && r.g23.sea===r.g23.n, 'a generator 23 world keeps every temple at sea');
  A(r.g22.ver===22 && r.g22.n >= 2 && r.g22.sea===0, 'a generator 22 world keeps its temples on the land');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
