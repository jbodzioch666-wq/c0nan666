// RS-763: the doorway at the head of a flight down is a real opening. The wall's face (and in the Lost City the pyramid's first tier)
// is cut round it, the ground and the plinth no longer run across it, and behind it a passage goes on down into the dark: a ray
// through the doorway, low or high, passes the wall's face and meets the passage's stone
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const out = {}, fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
    for (const site of ['city', 'dungeon']){ const m = G.ow.map, want = site==='city' ? OW_TEMPLE : OW_DUNGEON; let c = null;
      for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want && !owSeaSite(x, y)){ c = { x, y }; break; }
      G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false); await fr(30);
      let s = null; for (let x=0;x<COLS && !s;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_STAIRSD && tileAt(x - fpStairDir(x, y)[0], y - fpStairDir(x, y)[1])===T_WALL){ s = { x, y }; break; }
      const [ex, ey] = fpStairDir(s.x, s.y), meshes = []; FPD.world.traverse(o=>{ if (o.isMesh && o.visible) meshes.push(o); }); FPD.world.updateMatrixWorld(true);
      const rc = new THREE.Raycaster(), o = { kind:G.siteKind, rays:[] };
      for (const [h, sOff] of [[0.04, 0], [0.25, 0], [0.4, 0], [0.2, 0.3], [0.2, -0.3]]){
        rc.set(new THREE.Vector3(s.x + 0.5 + ey*sOff, h, s.y + 0.5 - ex*sOff), new THREE.Vector3(-ex, 0, -ey)); rc.far = 3;
        const hit = rc.intersectObjects(meshes, false)[0]; o.rays.push(hit ? { d:+hit.distance.toFixed(2), k:hit.object.userData.fk || hit.object.material?.name || '?' } : null); }
      /* looked down into it from above, over the doorway: not the ground (it ran on under the wall and across the passage) */
      rc.set(new THREE.Vector3(s.x + 0.5 - ex*0.7, 0.45, s.y + 0.5 - ey*0.7), new THREE.Vector3(0, -1, 0)); const dn = rc.intersectObjects(meshes, false)[0];
      o.down = dn ? { d:+dn.distance.toFixed(2), k:dn.object.userData.fk || '?' } : null;
      out[site] = o; G.gameMode = 0; setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  for (const k of ['city', 'dungeon']){ const o = r[k];
    A(o.rays.every(h=>h && h.d > 0.55 && h.k==='stairStone'), k + ': every ray through the doorway passes the wall\'s face to the passage\'s stone: ' + JSON.stringify(o.rays));
    A(o.down && o.down.k==='stairStone', k + ': under the doorway\'s head, the passage, not the ground: ' + JSON.stringify(o.down)); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
