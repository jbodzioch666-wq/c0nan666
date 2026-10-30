// RS-397: the dungeon overlay's effects are scene objects - particles as one point cloud, loot beams as a sprite and pool,
// vein glows built with the veins, the hover glow and outline, and arrows and spell bolts in flight - not 2D arcs and
// gradients drawn over the view every frame. The timing of shots and beams still runs, and the flash is in the post shader
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); } };
    await run(6);
    const p = G.player, F = ISO.fx; let gx = p.x+1, gy = p.y; if (G.map[gx][gy]!==T_FLOOR){ gx = p.x; gy = p.y+1; }
    // a burst of sparks, a loot beam, a spell bolt and an arrow on the way to a creature, the mouse over a tile
    const m = { nm:'test goblin', alive:true, hp:5, maxHp:5, x:gx, y:gy, sym:'g', col:'#8a8' }; G.mon.push(m);
    FP.parts = []; fpBurst(p.x+0.5, p.y+0.5, 0.5, '#ffd27a', 40, 1.2);
    (ISO.beams = ISO.beams || []).push({ x:gx, y:gy, col:'#ffd040', q:3, t:0, life:3, depth:G.depth, mode:G.gameMode });
    ISO.shots = []; isoShot(m, 'spell', '#60a0ff', 0, { tier:2, elem:'water' }); isoShot(m, 'arrow', '#9aa3a8', 0); ISO.shots.forEach(s=>{ s.dur = 5; s.t = Math.max(s.t, 0); });   /* (RS-703: a spell bolt waits for the staff's thrust - here, already on its way) */
    const rc = canvas.getBoundingClientRect(), pr = (()=>{ const v = new THREE.Vector3(gx+0.5, 0, gy+0.5).project(FPD.cam); return { x:rc.left + (v.x*0.5+0.5)*rc.width, y:rc.top + (-v.y*0.5+0.5)*rc.height }; })();
    ISO.mouse = pr;
    const sp0 = isoSpellParticles, mm0 = fpDrawMinimap; window.isoSpellParticles = ()=>{}; window.fpDrawMinimap = ()=>{};   /* (the spell's element motes are 2D by design; the minimap draws its dots with arcs) */
    let arcs = 0, grads = 0; const a0 = ctx.arc.bind(ctx), g0 = ctx.createRadialGradient.bind(ctx);
    ctx.arc = function(...a){ arcs++; return a0(...a); }; ctx.createRadialGradient = function(...a){ grads++; return g0(...a); };
    await run(2);
    ctx.arc = a0; ctx.createRadialGradient = g0; window.isoSpellParticles = sp0; window.fpDrawMinimap = mm0;
    const pts = F.add.geometry.drawRange.count + F.norm.geometry.drawRange.count, beam = [...F.beams.values()][0], shots = [...F.shots.values()];
    const out = { arcs, grads, parts:FP.parts.length, pts, inScene:F.g.parent===FPD.scene, beam:!!beam && beam.sh.parent===F.g && beam.sh.material.opacity > 0.2, shots:shots.length, arrowLine:shots.some(o=>o.arrow && o.shaft.geometry.attributes.position.getX(1) > 0),
      bolt:shots.some(o=>!o.arrow && o.all.length===5 && o.all[0].position.y > 0.4), hover:F.hoverGlow.visible && F.hoverLine.visible && F.hoverGlow.position.x===gx+0.5, red:F.hoverGlow.material.color.r > F.hoverGlow.material.color.g*2 };
    // the shots land and the beam ends on their own clocks
    ISO.shots.forEach(s=>{ s.t = 4.99; }); ISO.beams.forEach(b=>{ b.t = 2.99; }); await run(2);
    out.landed = ISO.shots.length===0 && F.shots.size===0; out.beamGone = ISO.beams.length===0 && F.beams.size===0;
    // the tier-4 flash goes into the post shader
    ISO.flash = { col:'#60a0ff', t:0 }; renderGame(); const U = GFXP.get(FPD.r).comp.uniforms; out.flash = +U.flashK.value.toFixed(2); out.flashB = +U.flashC.value.z.toFixed(2);
    G.mon = G.mon.filter(q=>q!==m); return out;
  });
  await page.evaluate(async ()=>{ const p = G.player; let gx = p.x+1, gy = p.y; if (G.map[gx][gy]!==T_FLOOR){ gx = p.x; gy = p.y+1; }
    FP.parts = []; fpBurst(p.x+0.5, p.y+0.5, 0.5, '#ffd27a', 40, 1.2); (ISO.beams = ISO.beams || []).push({ x:gx, y:gy, col:'#ffd040', q:3, t:0.5, life:3, depth:G.depth, mode:G.gameMode });
    const m = { nm:'test goblin', alive:true, hp:5, maxHp:5, x:gx, y:gy+1, sym:'g', col:'#8a8' }; G.mon.push(m); isoShot(m, 'arrow', '#9aa3a8', 0); ISO.shots.forEach(s=>{ s.dur = 5; s.t = 2; }); renderGame(); G.mon = G.mon.filter(q=>q!==m); });
  await page.screenshot({ path:`${S}/s397-fx.png`, timeout:150000 });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.inScene, 'the effects group is in the scene');
  A(r.parts >= 30 && r.pts===r.parts, 'every particle is a point in the cloud');
  A(r.beam, 'the loot beam stands in the scene');
  A(r.shots===2 && r.arrowLine && r.bolt, 'the arrow and the spell bolt fly in the scene');
  A(r.hover && r.red, 'the hover glow is on the tile, red over a creature');
  A(r.arcs===0 && r.grads===0, 'no 2D arcs or gradients for them');
  A(r.landed && r.beamGone, 'shots land and beams end on their clocks');
  A(r.flash > 0.5 && r.flashB > 0.9, 'the flash is in the post shader');
};
