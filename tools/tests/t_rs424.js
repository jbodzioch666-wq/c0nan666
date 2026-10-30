// RS-424: at night every lamp in town stays lit as you walk away - a pool of light under it and a glow about its head, dimmer where
// one of the few real lights has it - and a real light handed on to another lamp fades up there; the waypoint's obelisks are gone
module.exports = async page=>{
  const sleep = ms=>new Promise(r=>setTimeout(r, ms));
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    G.player.clock = DAY_LENGTH*0.02; const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const [wx, wy] = townWpAt(); G.player.x = wx; G.player.y = wy + 2; await frames(25);
    const look = ()=>{ const gl = V3.glows || [], real = gl.filter(g=>g.l._realT===V3.t), dark = gl.filter(g=>g.l._realT!==V3.t);
      return { n:gl.length, real:real.length, darkLit:dark.filter(g=>g.pool.visible && g.pool.material.opacity > 0.2 && g.halo.material.opacity > 0.3).length, dark:dark.length,
        realDim:real.every(g=>g.pool.material.opacity < 0.3) }; };
    const a = look();
    // walk to the far side of town: the lamps behind you keep glowing
    G.player.x = 2; G.player.y = 2; for (let x=2;x<COLS-2;x++) if (G.map[x][2]===T_FLOOR){ G.player.x = x; break; } V3.path = []; await frames(4);
    const pl = V3.plights.filter(p=>p.userData), fk = Math.min(...pl.map(p=>p._fk===undefined ? 1 : p._fk)); await frames(30); const b = look();
    // obelisks: no four-sided cones or tapered posts round the stone
    let obel = 0; V3.world.traverse(o=>{ if (!o.isMesh) return; const gt = o.geometry.parameters; if (gt && gt.radialSegments===4 && Math.hypot(o.position.x - wx - 0.5, o.position.z - wy - 0.5) < 1.5) obel++; });
    // (RS-427) walking along a street a step at a time: a lamp that stays lit keeps its light - no swapping, no fading from nothing
    G.player.x = wx; G.player.y = wy + 2; await frames(20); let swaps = 0, dips = 0, moves = 0; const prev = new Map(V3.plights.map(pl=>[pl, pl.userData]));
    for (let st=0; st<8; st++){ const nx = G.player.x + (st < 4 ? 1 : -1); if (G.map[nx] && G.map[nx][G.player.y]===T_FLOOR) G.player.x = nx; else G.player.y += 1;
      for (let f=0; f<6; f++){ renderGame(); await new Promise(r=>setTimeout(r, 30));
        const now = new Map(V3.plights.map(pl=>[pl, pl.userData])), lampOf = m=>new Set([...m.values()].filter(Boolean));
        const before = lampOf(prev), after = lampOf(now);
        for (const pl of V3.plights){ if (prev.get(pl)!==now.get(pl)){ moves++; if (now.get(pl) && before.has(now.get(pl))) swaps++; } if (pl.userData && prev.get(pl)===pl.userData){ pl._age = (pl._age||0) + 1; if (!pl._out && pl._age > 10 && (pl._fk===undefined ? 1 : pl._fk) < 0.5) dips++; } else pl._age = 0; }
        prev.clear(); for (const [k, v] of now) prev.set(k, v); } }
    const walk = { swaps, dips, moves };
    G.player.clock = DAY_LENGTH*0.45; await frames(20); const day = (V3.glows||[]).filter(g=>g.pool.visible).length;
    return { a, b, fk, obel, day, lights:V3.plights.length, walk }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.a.n >= 8 && r.a.dark > 0 && r.a.darkLit===r.a.dark, 'at night every lamp without a real light still glows, pool and head');
  A(r.a.realDim, 'where a real light has the lamp its pool is dimmer, not doubled');
  A(r.b.darkLit===r.b.dark, 'walked away, the lamps behind you keep glowing');
  A(r.fk < 0.9 || r.b.real >= 1, 'a light handed on to another lamp fades up there');
  A(r.obel===0, 'no obelisks round the waypoint');
  A(r.day===0, 'no glow by day');
  A(r.walk.swaps===0 && r.walk.dips===0, 'walking a street, a lit lamp keeps its light - no swaps or flashes (RS-427)');
};
