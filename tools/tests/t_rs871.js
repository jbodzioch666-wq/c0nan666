// RS-871: the castle on the land remade - pale walls with merlons, slender round towers under tall blue witch-hat roofs, a round keep
// with its stair turret and hall, a moat all round and a gatehouse. Stepping onto it you walk up to the moat, the drawbridge comes down
// on its chains (with a thud), the portcullis rises, and you walk over the bridge and in through the gate; behind you it shuts again.
// No plain boxes or few-sided cylinders, the stone merged to a few draws. Shots: shots/rs871-shut.png, rs871-lowering.png, rs871-open.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    const m = G.ow.map, open = [OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP], N4 = [[0,1],[1,0],[0,-1],[-1,0]], out = { shots:{} };
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, ['castle']).filter(s=>m[s.x][s.y]===OW_CASTLE); let at = null;
    for (const s of sites){ if (at) break; for (const [dx, dy] of N4){ const q = owNb(s.x, s.y, dx, dy); if (!at && q && open.includes(m[q[0]][q[1]])) at = { s, q, d:[-dx, -dy] }; } }
    if (!at) return Object.assign(out, { none:true });
    G.owPos = { x:at.q[0], y:at.q[1] }; owReveal(at.q[0], at.q[1], 8); await fr(150);
    const C = o3C(at.s.x, at.s.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1]));
    out.door = !!(g && g.doorWay); if (!g) return out;
    let draws = 0, plain = 0; const thin = [], rbs = new Set(Object.values(V3_RB)); g.traverse(o=>{ if (!o.isMesh) return; draws++; const G2 = o.geometry; if (G2.type==='BoxGeometry' && !rbs.has(G2) && !o.material.isMeshBasicMaterial) plain++; if (G2.type==='CylinderGeometry' && G2.parameters.radialSegments < 16 && G2.parameters.radiusTop > 0.012) thin.push(G2.parameters.radialSegments); if (G2.type==='ConeGeometry') thin.push('cone'); });
    Object.assign(out, { draws, plain, thin, flag:!!g.getObjectByName('keepFlag'), pole:!!g.getObjectByName('keepPole') });
    const movers = g.children.filter(c=>c.userData.mv && c.isGroup), bridge = movers.find(c=>Math.abs(c.rotation.x) > 1), pc = movers.find(c=>c!==bridge);
    out.raised = bridge ? +bridge.rotation.x.toFixed(2) : null;
    /* a camera on the gate for the shots */
    const shoot = async nm=>{ await fr(4); out.shots[nm] = O3.renderer.domElement.toDataURL('image/png'); };
    await shoot('shut');
    moveDir(at.d[0], at.d[1]); out.walk = !!O3.doorWalk; let minX = 9, maxY = 0, shake = 0, onBridge = 0;
    const t0 = performance.now(); while (performance.now() - t0 < 20000 && G.gameMode===0){ await fr(1); const W = O3.doorWalk;
      if (bridge){ minX = Math.min(minX, Math.abs(bridge.rotation.x)); } if (pc) maxY = Math.max(maxY, pc.position.y); shake = Math.max(shake, O3.shake || 0);
      if (W && W.v > 0.05 && W.v < 0.5 && O3.ppos){ const L = g.worldToLocal(new THREE.Vector3(O3.ppos.x, g.position.y, O3.ppos.z)); if (L.z > 0.56 && L.z < 0.8){ onBridge = Math.max(onBridge, +(O3.ppos.y - g.position.y).toFixed(3)); out.dbg = [O3.ppos.y, g.position.y, O3.heightAt(O3.ppos.x, O3.ppos.z), L.x, L.z].map(v=>+v.toFixed(3)); } }
      if (W && !out.shots.lowering && bridge && Math.abs(bridge.rotation.x) < 0.9 && Math.abs(bridge.rotation.x) > 0.5) await shoot('lowering');
      if (W && !out.shots.open && pc && pc.position.y > 0.25) await shoot('open'); }
    Object.assign(out, { minX:+minX.toFixed(2), maxY:+maxY.toFixed(2), shake:+shake.toFixed(2), onBridge, mode:G.gameMode, kind:G.siteKind, ui:G.ui, after:bridge ? +bridge.rotation.x.toFixed(2) : null, pcAfter:pc ? +pc.position.y.toFixed(2) : null });
    return out; });
  for (const [k, v] of Object.entries(r.shots || {})) require('fs').writeFileSync(SHOTS + '/rs871-' + k + '.png', Buffer.from(v.split(',')[1], 'base64')); r.shots = Object.keys(r.shots || {});
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.door, 'a castle near the start, built as a doorway');
  A(r.plain===0 && !r.thin.length, 'no plain boxes, cones or few-sided cylinders');
  A(r.draws <= 40, 'the stone merged: ' + r.draws + ' draws');
  A(r.flag , 'the keep keeps its flag for the realm banner');
  A(r.raised < -1.5, 'the drawbridge is raised while you are away');
  A(r.walk, 'stepping onto it you walk up to the gate');
  A(r.minX < 0.06, 'the drawbridge comes down');
  A(r.maxY > 0.25, 'the portcullis rises');
  A(r.shake > 0.1, 'the bridge lands with a thud');
  A(r.onBridge > 0.06, 'you walk over on its planks');
  A(r.mode===1 && r.kind==='castle', 'and you go on into the castle');
  A(r.after < -1.5 && r.pcAfter < 0.01, 'it shuts again behind you');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
