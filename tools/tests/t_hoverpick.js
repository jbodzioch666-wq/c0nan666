// RS-381: moving the mouse no longer costs frames. A pointer's moves are only noted; what is under the cursor is picked
// once a frame at most, in every view. The land is not raycast triangle by triangle (the ground comes from marching the
// ray down the heightfield), creatures are picked by a sphere round their figure instead of their triangles, and the
// dungeon's hover tip reads the floor tile without raycasting the walls. A tooltip follows the cursor once a frame
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const out = {}, T = THREE, rc0 = T.Mesh.prototype.raycast; let rayN = 0, skinN = 0, landN = 0;
    T.Mesh.prototype.raycast = function(...a){ rayN++; if (this.isSkinnedMesh) skinN++; if (O3.land && this===O3.land) landN++; return rc0.apply(this, a); };
    const count = fn=>{ const f0 = window[fn]; let n = 0; window[fn] = function(...a){ n++; return f0.apply(this, a); }; return ()=>n; };
    const nO = count('o3Pick'), nV = count('v3Pick'), nI = count('isoPick');
    // --- the open land: two hundred moves of the mouse, no pick until the frame; and no land triangles even then
    G.gameMode = 0; setUi('playing'); await frames(8);
    { const cv = O3.cv, rc = cv.getBoundingClientRect(), cx = rc.left + rc.width/2, cy = rc.top + rc.height/2, p0 = nO();
      for (let i=0;i<200;i++) cv.dispatchEvent(new PointerEvent('pointermove', { clientX:cx + (i%7), clientY:cy + (i%5), bubbles:true }));
      const afterEvents = nO() - p0; rayN = landN = 0; o3HoverTick(); const afterTick = nO() - p0, landRay = landN; o3HoverTick(); const afterTwo = nO() - p0;
      const a = o3Pick({ clientX:cx, clientY:cy }), B = O3.landBox; const m = new T.Vector2(((cx-rc.left)/rc.width)*2-1, -((cy-rc.top)/rc.height)*2+1); O3.ray.setFromCamera(m, O3.cam);
      const g = o3GroundHit(O3.ray.ray), mh = O3.ray.intersectObject(O3.land, false); const gap = g && mh.length ? +g.distanceTo(mh[0].point).toFixed(3) : null;
      out.land = { afterEvents, afterTick, afterTwo, landRay, kind:a && a.kind, inBox:!!(g && g.x >= B[0] && g.x <= B[2] && g.z >= B[1] && g.z <= B[3]), gap, ground:!!g }; }
    // --- a town: the same
    G.gameMode = 0; enterVillage(); setUi('playing'); await frames(8);
    { const cv = V3.cv, rc = cv.getBoundingClientRect(), cx = rc.left + rc.width/2, cy = rc.top + rc.height/2, p0 = nV();
      for (let i=0;i<200;i++) cv.dispatchEvent(new PointerEvent('pointermove', { clientX:cx + (i%7), clientY:cy + (i%5), bubbles:true }));
      const afterEvents = nV() - p0; v3HoverTick(); const afterTick = nV() - p0; v3HoverTick(); const afterTwo = nV() - p0; out.town = { afterEvents, afterTick, afterTwo, mxy:!!V3.mxy }; }
    // --- a dungeon: a creature is picked by its sphere, not its triangles; the hover tip's pick raycasts nothing
    { const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
      const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
      let spot = null; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){ if (G.map[p.x+dx] && G.map[p.x+dx][p.y+dy]===T_FLOOR){ spot = [p.x+dx, p.y+dy]; break; } }
      const m = newMonster(); Object.assign(m, { alive:1, x:spot[0], y:spot[1], hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'g', nm:'goblin warrior', col:'#8f8', art:null, abilities:[] }); G.mon.push(m); tickMonsters = ()=>{};
      for (let i=0;i<200 && !(i > 6 && M3D.inst.get(m));i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const ins = M3D.inst.get(m), rc = canvas.getBoundingClientRect(); ins.holder.updateMatrixWorld(true); FPD.cam.updateMatrixWorld(true);
      const v = ins.holder.position.clone(); v.y += ins.H*0.5; v.project(FPD.cam); const sx = rc.left + (v.x + 1)/2*rc.width, sy = rc.top + (1 - v.y)/2*rc.height;
      rayN = skinN = 0; const pk = isoPick({ clientX:sx, clientY:sy }); const full = { mon:pk && pk.mon===m, rays:rayN, skinned:skinN };
      rayN = skinN = 0; const qk = isoPick({ clientX:sx, clientY:sy }, true); const quick = { mon:qk && qk.mon===m, rays:rayN };
      /* the hover tip's pick: at most once in seventy milliseconds, as before, and quick - two hundred moves in a burst pick once and raycast nothing */
      const p0 = nI(); ISO.caveTipT = 0; rayN = 0; for (let i=0;i<200;i++) canvas.dispatchEvent(new MouseEvent('mousemove', { clientX:sx + (i%7) + 40, clientY:sy + (i%5) + 40, bubbles:true }));
      const afterEvents = nI() - p0, tickRays = rayN;
      out.dungeon = { full, quick, afterEvents, tickRays, skinnedCreature:!!ins.skinned }; }
    // --- the tooltip: moved once a frame
    { const el = document.getElementById('itemTooltip'); showTooltip({ clientX:100, clientY:100 }, '<b>x</b>'); const l0 = el.style.left; moveItemTooltip({ clientX:300, clientY:300 }); const lNow = el.style.left; await new Promise(r=>requestAnimationFrame(()=>r())); await new Promise(r=>setTimeout(r, 20)); out.tip = { shownAt:l0, rightAfterMove:lNow, nextFrame:el.style.left }; hideItemTooltip(); }
    T.Mesh.prototype.raycast = rc0;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land.afterEvents===0 && r.land.afterTick===1 && r.land.afterTwo===1, 'on the open land, two hundred mouse moves pick nothing; the frame picks once');
  A(r.land.landRay===0 && r.land.ground && r.land.gap!==null && r.land.gap < 0.35 && r.land.inBox && r.land.kind, 'the ground under the cursor comes from the heightfield, within a third of a tile of the mesh, without raycasting the land: '+JSON.stringify(r.land));
  A(r.town.afterEvents===0 && r.town.afterTick===1 && r.town.afterTwo===1 && r.town.mxy, 'in a town likewise');
  A(r.dungeon.skinnedCreature && r.dungeon.full.mon && r.dungeon.full.skinned===0 && r.dungeon.quick.mon && r.dungeon.quick.rays===0, 'in a dungeon a creature is picked by its sphere: no raycast into its skinned body, and the quick pick raycasts nothing: '+JSON.stringify(r.dungeon));
  A(r.dungeon.afterEvents===1 && r.dungeon.tickRays===0, 'the cave tip picks once for a burst of moves, without raycasting the walls');
  A(r.tip.shownAt===r.tip.rightAfterMove && r.tip.nextFrame!==r.tip.shownAt, 'a tooltip is placed when shown, and follows a move on the next frame');
};
