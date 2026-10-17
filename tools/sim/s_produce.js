// production skills, from the tables: xp an hour at the craft queue's pace (one action every CQ_STEP ms), the hours to
// 99 with unlimited inputs, and how many inputs 99 takes. Bones, slayer and runecrafting follow kills and essence instead.
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player, perH = 3600000/CQ_STEP, X = x=>Math.round(x*XP_RATE), rows = [];
    const bestAt = (k, list, lvlOf, xpOf)=>{ const out = []; for (let L=1;L<=99;L++){ let b = null; for (const e of list) if (lvlOf(e) <= L && (!b || xpOf(e) > xpOf(b))) b = e; out[L] = b; } return out; };
    const sum = (k, best, xpOf, label)=>{ let hours = 0, actions = 0; for (let L=1;L<99;L++){ const need = SK_XP[L+1]-SK_XP[L], per = X(xpOf(best[L])); const a = need/per; actions += a; hours += a/perH; }
      rows.push({ skill:k, hours:+hours.toFixed(1), actions:Math.round(actions), at:[1,30,60,90].map(L=>label(best[L])+' '+X(xpOf(best[L]))+'xp') }); };
    const cookables = SK_FISH.concat(SK_MEAT).map(f=>({ nm:f.nm, lvl:f.cook, xp:f.cxp })).concat(SK_DISHES.map(d=>({ nm:d.nm, lvl:d.cook, xp:d.cxp })));
    sum('cooking', bestAt('cooking', cookables, e=>e.lvl, e=>e.xp), e=>e.xp, e=>e.nm);
    sum('cooking (fish only)', bestAt('cooking', SK_FISH, f=>f.cook, f=>f.cxp), f=>f.cxp, f=>f.nm);
    // smithing: a bar smelted then forged into a platebody (5 bars, xp = bar xp * 5 * 2) - per bar: smelt xp + 2x forge xp
    sum('smithing (smelt+forge, per bar)', bestAt('smithing', SK_BAR.filter(b=>!b.jewel), b=>b.lvl, b=>b.xp*3), b=>b.xp*3, b=>b.nm);
    sum('smithing (smelt only)', bestAt('smithing', SK_BAR.filter(b=>!b.jewel), b=>b.lvl, b=>b.xp), b=>b.xp, b=>b.nm);
    sum('alchemy (2 herbs a brew)', bestAt('alchemy', SK_HERB, h=>h.lvl, h=>h.axp), h=>h.axp, h=>h.nm);
    sum('firemaking (1 log)', bestAt('firemaking', SK_LOG, l=>l.flvl, l=>l.fxp), l=>l.fxp, l=>l.nm);
    const R = crRecipes();
    sum('crafting', bestAt('crafting', R.filter(r=>r.sec!=='ranged'), r=>r.lvl, r=>r.xp), r=>r.xp, r=>r.nm);
    sum('fletching', bestAt('fletching', R.filter(r=>r.sec==='ranged'), r=>r.lvl, r=>r.xp), r=>r.xp, r=>r.nm);
    const rcl = Object.keys(RC_ALTARS).map(k=>({ nm:k, lvl:RC_ALTARS[k].lvl, xp:RC_ALTARS[k].xp }));
    sum('runecrafting (per essence, queue pace)', bestAt('runecrafting', rcl, a=>a.lvl, a=>a.xp), a=>a.xp, a=>a.nm);
    // prayer: bones per kill (8 / 25 / 110 xp before XP_RATE)
    const bx = id=>RS_BONES.find(b=>b[0]===id)[2]; rows.push({ skill:'prayer (buried; an altar offering gives 3x)', kills99:{ bones:Math.round(SK_XP[99]/X(bx('bones'))), bigbones:Math.round(SK_XP[99]/X(bx('bigbones'))), dbones:Math.round(SK_XP[99]/X(bx('dbones'))) } });
    // slayer: xp = three times the monster's max hp per kill on task (tkOnKill)
    const hp = L=>MONSTER_LEVELS[L-1].hd*5.5*3; rows.push({ skill:'slayer', kills99:{ tier5:Math.round(SK_XP[99]/X(hp(5))), tier10:Math.round(SK_XP[99]/X(hp(10))), tier15:Math.round(SK_XP[99]/X(hp(15))), tier20:Math.round(SK_XP[99]/X(hp(20))) } });
    // inputs: fish per 99 cooking by tier, ore per 99 smithing, herbs per 99 alchemy, logs per 99 firemaking
    const F = id=>SK_FISH.find(f=>f.id===id).cxp, B = id=>SK_BAR.find(b=>b.id===id), H = id=>SK_HERB.find(h=>h.id===id).axp, LG = id=>SK_LOG.find(l=>l.id===id).fxp;
    rows.push({ skill:'inputs for 99', shark:Math.round(SK_XP[99]/X(F('shark'))), lobster:Math.round(SK_XP[99]/X(F('lobster'))), trout:Math.round(SK_XP[99]/X(F('trout'))), runeBarsSmelt:Math.round(SK_XP[99]/X(B('runeb').xp)), runeBarsForge:Math.round(SK_XP[99]/X(B('runeb').xp*3)), coalForThoseRuneBars:Math.round(SK_XP[99]/X(B('runeb').xp*3))*B('runeb').coal, mithrilBarsForge:Math.round(SK_XP[99]/X(B('mithrilb').xp*3)),
      starlilyBrews:Math.round(SK_XP[99]/X(H('starlily'))), magicLogsBurn:Math.round(SK_XP[99]/X(LG('magic'))), yewLogsBurn:Math.round(SK_XP[99]/X(LG('yew'))), essenceDeath:Math.round(SK_XP[99]/X(RC_ALTARS.death.xp)), essenceAir:Math.round(SK_XP[99]/X(RC_ALTARS.air.xp)) });
    return { rows, xp99:SK_XP[99], perH:Math.round(perH) };
  });
  console.log('xp to 99: '+r.xp99+', actions an hour at the queue pace: '+r.perH);
  for (const row of r.rows) console.log(JSON.stringify(row));
};
