// gathering: drives skGatherTick with a fake clock at a sample of levels, on the best node each level can work.
// Prints xp an hour, takes an hour and what they sell for (at the full price, before a buyer is flooded). "adj" rates allow for nodes running out: a node of n takes is
// followed by about three ticks of walking to the next one (an assumption, not measured).
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    randomEncounter = ()=>{}; skSpecialFoe = ()=>{}; skBirdNest = ()=>{}; skContinue = ()=>false; tickMonsters = ()=>{}; skTrophyRoll = ()=>{}; audSkill = ()=>{};
    harpoonReady = ()=>true; harpoonTier = ()=>3; caveVeinStart = ()=>1e9;
    const p = G.player, out = [];
    const LEVELS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    const toolFor = L=>{ let t = 0; for (let i=0;i<SK_TIER.length;i++) if (SK_TIER[i][1] <= L && SK_TIER[i][0]!=='Infernal') t = i+1; return t; };
    const price = id=>SMITH_BUYS[id] || shopResPrice(id) || 0;
    const configs = [];
    for (const L of LEVELS){
      for (const ty in SK_TREE){ const lg = SK_LOG.find(l=>l.id===SK_TREE[ty].log); if (lg.lvl <= L) configs.push({ k:'woodcutting', L, node:{ k:'woodcutting', type:ty }, n:SK_TREE[ty].n, nm:SK_TREE[ty].nm }); }
      for (const ty of ['shore','river','deep']){ const fs = SK_SPOT[ty].fish.map(id=>SK_FISH.find(f=>f.id===id)).filter(f=>f && f.lvl <= L); if (fs.length) configs.push({ k:'fishing', L, node:{ k:'fishing', type:ty }, n:SK_SPOT[ty].n, nm:SK_SPOT[ty].nm }); }
      for (const h of SK_HERB) if (h.lvl <= L) configs.push({ k:'foraging', L, node:{ k:'foraging', type:h.id }, n:3, nm:h.nm });
      configs.push({ k:'mining', L, rock:true, n:1e9, nm:'mountainside rock' });
      for (const o of SK_ORE) if (o.lvl <= L) configs.push({ k:'mining', L, vein:o.id, n:caveVeinStart.orig ? 6 : 6, nm:o.nm+' vein' });
    }
    for (const c of configs){
      const L = c.L; for (const [k] of SK_DEFS) p.skills[k] = SK_XP[L]; p.skills.hitpoints = SK_XP[10]; rsSync();
      const t = toolFor(L); p.tools = { rod:t, pick:t, axe:t, sickle:t }; p.bag = {}; p.gold = 0;
      const xp0 = p.skills[c.k];
      let o; G.gameMode = 0; G.interior = null; G.weather = 'clear';
      if (c.node){ const node = Object.assign({ x:G.owPos.x, y:G.owPos.y, left:1e9, max:1e9, qual:0 }, c.node); skNodeAt = ()=>node; skNodeTake = ()=>false; o = { k:c.k, node:{ x:node.x, y:node.y }, label:c.nm }; }
      else if (c.rock) o = { k:'mining', label:c.nm };
      else { G.gameMode = 1; G.dungeonDeco = makeGrid(''); G.dungeonSlot = 0; G.depth = 1; G.veinLeft = {}; G.player.x = 5; G.player.y = 5; G.mon = []; veinOre = ()=>c.vein; o = { k:'mining', vein:{ x:5, y:5 }, label:c.nm }; }
      const pos = G.gameMode===0 ? G.owPos.x+','+G.owPos.y : G.player.x+','+G.player.y;
      let now = 1e6, ticks = 0; const TICKS = 1500;
      while (ticks < TICKS){ if (!G.gather) G.gather = { o, mode:G.gameMode, pos, next:0, n:0 }; const n0 = G.gather.n; skGatherTick(now); if (G.gather && G.gather.n > n0){ ticks++; now += G.gather.iv; } else now += 100; }
      const iv = G.gather ? G.gather.iv : 2800, hours = ticks*iv/3600000;
      let takes = 0, value = 0; for (const id in p.bag){ takes += p.bag[id]; value += p.bag[id]*price(id); }
      const xp = p.skills[c.k] - xp0, adj = c.n/(c.n+3);
      out.push({ k:c.k, L, at:c.nm, tool:SK_TIER[t-1] ? SK_TIER[t-1][0] : 'none', chance:+(G.gather ? G.gather.ch : 0).toFixed(2), xpH:Math.round(xp/hours), takesH:Math.round(takes/hours), goldH:Math.round(value/hours), adjXpH:Math.round(xp/hours*adj), adjGoldH:Math.round(value/hours*adj), bag:Object.assign({}, p.bag) });
      G.gather = null;
    }
    // the best node at each level, per skill, and the hours to 99 at those rates
    const res = {};
    for (const [k] of SK_DEFS){ if (!['woodcutting','fishing','mining','foraging'].includes(k)) continue;
      const best = {}; for (const o of out) if (o.k===k && (!best[o.L] || o.adjXpH > best[o.L].adjXpH)) best[o.L] = o;
      let hours = 0, gold = 0; for (let L=1;L<99;L++){ let b = null; for (const s of LEVELS) if (s <= L) b = best[s]; const h = (SK_XP[L+1]-SK_XP[L])/b.adjXpH; hours += h; gold += h*b.adjGoldH; }
      res[k] = { hours:+hours.toFixed(1), gold:Math.round(gold), best:Object.values(best).map(o=>({ L:o.L, at:o.at, tool:o.tool, chance:o.chance, xpH:o.xpH, adjXpH:o.adjXpH, takesH:o.takesH, adjGoldH:o.adjGoldH })) }; }
    return res;
  });
  for (const k in r){ console.log(`${k}: ${r[k].hours} h to 99, ${r[k].gold} gold on the way`); for (const b of r[k].best) console.log('  '+JSON.stringify(b)); }
};
