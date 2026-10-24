// probe (RS-652; RS-653: the hero hidden for the turns): a barrow's stair close up, trees hidden (ZP_TREES=1 keeps them), the four turns, then the walk down. Shots: shots/zpit-r0..3.png, zpit-w*.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const at = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 120, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    for (const s of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1],[1,-1]]){ const q = owNb(s.x, s.y, dx, dy); if (!q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue;
      setUi('playing'); G.owPos = { x:q[0], y:q[1] }; owReveal(q[0], q[1], 8); await fr(120); moveDir(-dx, -dy); await fr(90);
      if (G.owPos.x!==s.x || G.owPos.y!==s.y) continue; const PL = o3PL(), g = O3.doors && O3.doors.get(PL.x+','+PL.y); if (g && g.userData.pit){ setUi('playing'); return s; } break; }
    return null; });
  if (!at) throw new Error('no stair barrow');
  const trees = !!process.env.ZP_TREES, zoom = +(process.env.ZP_DIST || 4.2);
  const hide = ()=>page.evaluate(t=>{ if (t) return; const PL = o3PL(), g = O3.doors.get(PL.x+','+PL.y), c = g.userData.pit, m4 = new THREE.Matrix4(), v = new THREE.Vector3(), z = new THREE.Matrix4().makeScale(0, 0, 0);
    O3.world.traverse(o=>{ if (!o.isInstancedMesh) return; let ch = false; for (let i=0;i<o.count;i++){ o.getMatrixAt(i, m4); v.setFromMatrixPosition(m4); if (Math.hypot(v.x - c.cx, v.z - c.cz) < 2.6){ o.setMatrixAt(i, z); ch = true; } } if (ch) o.instanceMatrix.needsUpdate = true; });
    document.querySelectorAll('.v3plate').forEach(e=>e.style.visibility = 'hidden'); }, trees);
  await hide();
  for (let r = 0; r < 4; r++){
    await page.evaluate(([r, z])=>{ ISO.rot = r; O3.dist = z; if (O3.pgrp) O3.pgrp.visible = false; }, [r, zoom]); await page.waitForTimeout(1500);
    await page.screenshot({ path: SHOTS + '/zpit-r' + r + '.png', clip:{ x:250, y:60, width:900, height:620 } });
  }
  await page.evaluate(([z])=>{ ISO.rot = 0; O3.dist = z; if (O3.pgrp) O3.pgrp.visible = true; }, [zoom]); await page.waitForTimeout(1200);
  await page.evaluate(()=>{ G.pendingDungeonModifier = null; enterDungeonConfirm(); });
  for (let i = 0; i < 8; i++){ await page.waitForTimeout(380); await page.screenshot({ path: SHOTS + '/zpit-w' + i + '.png', clip:{ x:250, y:60, width:900, height:620 } }); }
};
