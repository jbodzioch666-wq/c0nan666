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
    G.player.clock = DAY_LENGTH*0.45; await frames(20); const day = (V3.glows||[]).filter(g=>g.pool.visible).length;
    return { a, b, fk, obel, day, lights:V3.plights.length }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.a.n >= 8 && r.a.dark > 0 && r.a.darkLit===r.a.dark, 'at night every lamp without a real light still glows, pool and head');
  A(r.a.realDim, 'where a real light has the lamp its pool is dimmer, not doubled');
  A(r.b.darkLit===r.b.dark, 'walked away, the lamps behind you keep glowing');
  A(r.fk < 0.9, 'a light handed on to another lamp fades up there');
  A(r.obel===0, 'no obelisks round the waypoint');
  A(r.day===0, 'no glow by day');
};
