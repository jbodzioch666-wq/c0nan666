// RS-395: on the open land your shadow keeps up with you - the sun's shadow map is redrawn every frame while you walk (it was
// every other frame, so the shadow stuttered behind you), and on the slower clock again once you stand; and the shadow camera
// follows you in whole texels, so the land's shadows don't crawl as you go
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = true; G.interior = null; G.gameMode = 0;
    G.player.clock = DAY_LENGTH*5 + DAY_LENGTH*0.45; G.weather = 'clear';
    const frame = ()=>new Promise(r=>requestAnimationFrame(()=>{ renderGame(); r(); }));
    for (let i=0;i<10;i++) await frame();
    const sm = O3.renderer.shadowMap; let sets = 0, ticks = 0, v = false;
    const tick0 = gfxShadowTick; let lastP = null, mv = 0, mvSet = 0;
    window.gfxShadowTick = function(r, view){ if (view!=='o3') return tick0.call(this, r, view); ticks++; const p = O3.pgrp.position, moved = lastP && p.distanceTo(lastP) > 1e-4; lastP = p.clone(); const s0 = sets; const out = tick0.call(this, r, view); if (moved){ mv++; if (sets > s0) mvSet++; } return out; };   /* (per drawn frame - the game's own loop draws too) */
    Object.defineProperty(sm, 'needsUpdate', { configurable:true, get:()=>v, set:x=>{ v = x; if (x) sets++; } });
    const count = async n=>{ sets = 0; ticks = 0; for (let i=0;i<n;i++) await frame(); return +(sets/Math.max(1, ticks)).toFixed(2); };
    for (let i=0;i<10;i++) await frame();
    const idle = await count(30);
    // walk a few tiles over open land
    const o = G.owPos; let goal = null;
    for (const [dx, dy] of [[4,0],[-4,0],[0,4],[0,-4],[3,3],[-3,-3]]){ const x = o.x+dx, y = o.y+dy; if (x>0 && y>0 && x<OW_COLS && y<OW_ROWS && G.ow.map[x][y]===OW_GRASS){ goal = { x, y }; break; } }
    if (!goal) goal = { x:o.x+3, y:o.y };
    o3WalkTo({ kind:'ground', x:goal.x, y:goal.y }); const p0 = O3.pgrp.position.clone();
    mv = mvSet = 0; await count(30); const walk = +(mvSet/Math.max(1, mv)).toFixed(2), mvTicks = mv; const moved = O3.pgrp.position.distanceTo(p0);
    // the shadow camera's target sits on its texel grid
    const half = O3.sun.shadow.camera.right, ts = 2*half/O3.sun.shadow.mapSize.x, tg = O3.sun.target.position, sp = O3.sun.position;
    const fw = tg.clone().sub(sp).normalize(), rt = new THREE.Vector3(0, 1, 0).cross(fw).normalize(), uv = fw.clone().cross(rt);
    const off = a=>{ const q = a/ts; return Math.abs(q - Math.round(q)); };
    const grid = Math.max(off(tg.dot(rt)), off(tg.dot(uv)));
    const near = Math.hypot(tg.x - O3.pgrp.position.x, tg.z - O3.pgrp.position.z);
    delete sm.needsUpdate; sm.needsUpdate = false; window.gfxShadowTick = tick0;
    return { idle, walk, mvTicks, moved:+moved.toFixed(2), grid:+grid.toFixed(4), near:+near.toFixed(3), ts:+ts.toFixed(4), shadows:sm.enabled };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.shadows, 'shadows are on');
  A(r.moved > 0.5, 'you walked');
  A(r.mvTicks >= 5 && r.walk === 1, 'the shadow map is redrawn every frame while you walk');
  A(r.idle <= 0.6, 'and on the slower clock while you stand');
  A(r.grid < 0.02, 'the shadow camera sits on its texel grid');
  A(r.near < 0.3, 'and still follows you');
};
