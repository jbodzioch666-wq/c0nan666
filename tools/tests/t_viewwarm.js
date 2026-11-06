// RS-345: the open land and a town build their shaders when they load, not on a step. Each compiles its whole scene right
// after it's built (what's off screen too) plus stand-ins for what spawns later (the animals, every gathering spot kind,
// a camp, the markers, a building gone see-through). A walk, a camera turn and nightfall then compile nothing new.
// (A shadow-pass depth program is allowed: it's cheap, and it's keyed on the caster's mirroring, not its material)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.player.wildWarned = 1; saveCurrentGame = ()=>{};
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const walk = async (V, R, n, step)=>{ const out = { progs0:R.info.programs.length, bad:[], maxStep:0 }; let k0 = new Set(R.info.programs.map(p=>p.cacheKey));
      const note = (what)=>{ const nw = R.info.programs.map(p=>p.cacheKey).filter(k=>!k0.has(k)); for (const k of nw){ k0.add(k); if (!/^(depth|distanceRGBA),/.test(k)) out.bad.push(what+': '+k.slice(0, 50)); } };
      const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
      for (let i=0;i<n;i++){ G.player.hp = effMaxHp(); G.ui = 'playing'; const d = dirs[(i>>2)&3], t0 = performance.now(); step(d); out.maxStep = Math.max(out.maxStep, performance.now()-t0|0); await fr(1); note('step '+i); }
      ISO.rot = (ISO.rot+1)&3; await fr(3); note('turn'); G.player.clock = 21; await fr(3); note('night'); G.player.clock = 10;
      out.progs1 = R.info.programs.length; out.warmKids = V.warmGrp ? V.warmGrp.children.length : -1; return out; };
    await fr(6);
    const out = {};
    out.land = await walk(O3, O3.renderer, 16, d=>{ if (G.gameMode!==0){ G.gameMode = 0; } moveDir(d[0], d[1]); });
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(6);
    out.town = await walk(V3, V3.renderer, 12, d=>moveDir(d[0], d[1]));
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.land.warmKids >= 10, 'the land made its stand-ins (animals, spots, camp, markers)');
  A(r.town.warmKids >= 3, 'the town made its stand-ins (rings, see-through building materials)');
  A(r.land.bad.length===0, 'a walk, a turn and nightfall on the land compile no new shader');
  A(r.town.bad.length===0, 'a walk, a turn and nightfall in a town compile no new shader');
};
