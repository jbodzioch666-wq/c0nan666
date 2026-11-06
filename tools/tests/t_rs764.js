// RS-764: every flight down's doorway is open in a graveyard too: on its surface no grass floats over the shaft, and in the catacombs
// below the niched wall is cut round the doorway like any other. Rays through it, against the whole scene, reach the passage's stone
// (t_zstairall runs the same check over every kind of site and every dungeon theme)
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } }, out = [];
    window.__only = 'OW_GRAVEYARD'; goToCharCreate(); ccBegin(); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    const kinds = { OW_DUNGEON, OW_GRAVEYARD, OW_MINE, OW_LAIR, OW_NECROTOWER, OW_PYRAMID, OW_CASTLE, OW_TEMPLE };
    if (window.__themes){ const ks = [...new Set(Object.values(DG_BIOME_THEME))].concat(['dungeon']); const real = dgThemeKey; wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
      const m = G.ow.map; let c = null; for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_DUNGEON){ c = { x, y }; break; }
      for (const tk of ks){ dgThemeKey = ()=>G.siteKind==='dungeon' ? tk : real(); G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing');
        for (let d=1; d<=3; d++){ if (d > 1){ saveLevelCache(G.depth); loadLevel(d, false); setUi('playing'); } G.mon.forEach(mo=>mo.alive = false); await fr(12); check('OW_DUNGEON', false, d); } G.gameMode = 0; setUi('playing'); }
      dgThemeKey = real; return out; }
    function check(kn, sea, d){
            const meshes = []; FPD.scene.updateMatrixWorld(true); FPD.scene.traverse(o=>{ if (o.isMesh && o.visible && !(ISO.player && ISO.player.holder && isDesc(o, ISO.player.holder))) meshes.push(o); });
            function isDesc(o, h){ for (let p=o; p; p=p.parent) if (p===h) return true; return false; }
            const rc = new THREE.Raycaster();
            for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.map[x][y]!==T_STAIRSD) continue; const [ex, ey] = fpStairDir(x, y), head = tileAt(x - ex, y - ey);
              const rec = { kn, sea, d, theme:fpTheme().key, kind:G.siteKind, at:[x, y], head, bad:[] };
              if (head===T_WALL){
                for (const [h, so] of [[0.04,0],[0.25,0],[0.4,0],[0.2,0.3],[0.2,-0.3]]){ rc.set(new THREE.Vector3(x + 0.5 + ey*so, h, y + 0.5 - ex*so), new THREE.Vector3(-ex, 0, -ey)); rc.far = 3;
                  const hit = rc.intersectObjects(meshes, false)[0]; const k = hit ? (hit.object.userData.fk || hit.object.name || 'obj:' + hit.object.geometry.type + ':' + JSON.stringify(hit.point.toArray().map(v=>+v.toFixed(2)))) : 'none';
                  if (!hit || hit.distance < 0.55 || k!=='stairStone') rec.bad.push([h, so, hit ? +hit.distance.toFixed(2) : null, k]); }
                rc.set(new THREE.Vector3(x + 0.5 - ex*0.7, 0.45, y + 0.5 - ey*0.7), new THREE.Vector3(0, -1, 0)); const dn = rc.intersectObjects(meshes, false)[0];
                if (!dn || dn.object.userData.fk!=='stairStone') rec.bad.push(['down', dn ? +dn.distance.toFixed(2) : null, dn ? (dn.object.userData.fk || dn.object.name || 'obj') : 'none']); }
              out.push(rec); } }
    for (const seed of [12345]){ wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*0.45;
      for (const [kn, want] of Object.entries(kinds)){ if (window.__only && kn!==window.__only) continue; const m = G.ow.map; const cs = [];
        for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===want) cs.push({ x, y, sea:owSeaSite(x, y) });
        for (const c of [cs[0], cs.find(q=>q.sea)].filter(Boolean)){
          G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:c.x, y:c.y }; try { enterDungeonConfirm(); } catch(e){ out.push({ kn, err:String(e).slice(0,120) }); continue; } setUi('playing');
          for (let d=1; d<=Math.min(G.dungeonMaxDepth||1, 6); d++){
            if (d > 1){ saveLevelCache(G.depth); loadLevel(d, false); setUi('playing'); }
            G.mon.forEach(mo=>mo.alive = false); await fr(12);
            const meshes = []; FPD.scene.updateMatrixWorld(true); FPD.scene.traverse(o=>{ if (o.isMesh && o.visible && !(ISO.player && ISO.player.holder && isDesc(o, ISO.player.holder))) meshes.push(o); });
            function isDesc(o, h){ for (let p=o; p; p=p.parent) if (p===h) return true; return false; }
            const rc = new THREE.Raycaster();
            for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.map[x][y]!==T_STAIRSD) continue; const [ex, ey] = fpStairDir(x, y), head = tileAt(x - ex, y - ey);
              const rec = { kn, sea:c.sea, d, theme:fpTheme().key, kind:G.siteKind, at:[x, y], head, bad:[] };
              if (head===T_WALL){
                for (const [h, so] of [[0.04,0],[0.25,0],[0.4,0],[0.2,0.3],[0.2,-0.3]]){ rc.set(new THREE.Vector3(x + 0.5 + ey*so, h, y + 0.5 - ex*so), new THREE.Vector3(-ex, 0, -ey)); rc.far = 3;
                  const hit = rc.intersectObjects(meshes, false)[0]; const k = hit ? (hit.object.userData.fk || hit.object.name || hit.object.material?.name || hit.object.parent?.name || ('obj:' + hit.object.geometry.type + ':' + hit.object.material.type + ':' + (hit.object.material.color ? hit.object.material.color.getHexString() : '') + ':' + JSON.stringify(hit.point.toArray().map(v=>+v.toFixed(2))) + ':' + hit.object.geometry.attributes.position.count + ':' + JSON.stringify(new THREE.Box3().setFromObject(hit.object)) + ':' + hit.object.parent?.type + (hit.object.parent?.children.length) + ':' + Object.keys(hit.object.userData).join('|'))) : 'none';
                  if (!hit || hit.distance < 0.55 || k!=='stairStone') rec.bad.push([h, so, hit ? +hit.distance.toFixed(2) : null, k]); }
                rc.set(new THREE.Vector3(x + 0.5 - ex*0.7, 0.45, y + 0.5 - ey*0.7), new THREE.Vector3(0, -1, 0)); const dn = rc.intersectObjects(meshes, false)[0];
                if (!dn || dn.object.userData.fk!=='stairStone') rec.bad.push(['down', dn ? +dn.distance.toFixed(2) : null, dn ? (dn.object.userData.fk || dn.object.name || 'obj') : 'none']); }
              out.push(rec); }
          }
          G.gameMode = 0; setUi('playing');
        } } }
    return out; });
  const heads = {}; for (const o of r) if (o.at) { const k = o.theme + '/' + o.head; heads[k] = (heads[k]||0) + 1; }
  console.log('flights by theme/head tile: ' + JSON.stringify(heads));
  for (const o of r) if (o.err || (o.bad && o.bad.length)) console.log('BAD ' + JSON.stringify(o));
  console.log('flights: ' + r.filter(o=>o.at).length + ', bad: ' + r.filter(o=>o.bad && o.bad.length).length);
  const fl = r.filter(o=>o.at), bad = fl.filter(o=>o.bad && o.bad.length);
  if (!(fl.some(o=>o.theme==='graveyard') && fl.some(o=>o.theme==='catacomb'))) throw new Error('assert: flights on the surface and in the catacombs: ' + JSON.stringify(fl.map(o=>o.theme)));
  if (bad.length || r.some(o=>o.err)) throw new Error('assert: every doorway open: ' + JSON.stringify(bad.concat(r.filter(o=>o.err))));
  if (errs.length) throw new Error('assert: no errors: ' + errs.join(' | '));
};
