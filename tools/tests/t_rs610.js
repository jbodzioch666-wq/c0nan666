// RS-610: raised minions (and every creature below ground) sculpted on the townsfolk's coarser grid, the sculpted skeleton on a grid
// twice as coarse with only its big bones casting a shadow, and a ghost's shroud drawn from the front only - four raised dead cost
// more than the room around them
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (const m of G.mon) m.alive = 0;
    for (let i=0;i<120;i++) await new Promise(r=>requestAnimationFrame(r));
    const L = necroMinions(); for (const k of ['ghost', 'skeleton']){ const def = NECRO_MINIONS.find(d=>d.k===k); const m = { k, nm:'your ' + def.nm, col:def.col, atkBonus:1, dmg1:1, dmg2:2, turnsLeft:9999, reach:1, drain:0, ghost:k==='ghost' }; L.push(m); necroPlace(m); }
    let ok = false; for (let i=0;i<900 && !ok;i++){ await new Promise(r=>requestAnimationFrame(r)); ok = L.every(m=>M3D.inst.get(necroProxy(m))); }
    const out = {}; for (const m of L){ const e = M3D.inst.get(necroProxy(m)); if (!e){ out[m.k] = null; continue; } let tris = 0, cast = 0, sides = new Set();
      e.holder.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry; tris += Math.round((g.index ? g.index.count : g.attributes.position.count)/3); if (o.castShadow) cast++; if (o.material && o.material.transparent && o.material.isMeshStandardMaterial) sides.add(o.material.side); });
      out[m.k] = { tris, cast, transSides:[...sides] }; }
    out.monKey = (()=>{ const pt = m3dPortrait({ nm:'goblin', x:0, y:0 }); return pt ? fpdMonBuild(()=>m3dTplKey(pt)) : ''; })();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ghost && r.ghost.tris < 110000, 'a raised ghost on the coarser grid (it was 194,000 triangles)');
  A(r.ghost.transSides.every(s=>s===0), 'its shroud drawn from the front only');
  A(r.skeleton && r.skeleton.tris < 260000, 'the skeleton on a coarser grid (it was 725,000 triangles)');
  A(r.skeleton.cast <= 24, 'only its big bones cast a shadow (it was 102 pieces): ' + r.skeleton.cast);
  A(/\|c1\.6/.test(r.monKey), 'a dungeon creature\'s template is the coarse one: ' + r.monKey);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
