// RS-867: reworking with bars (up to +5) on the anvil's Work a piece tab, beside masterwork and smash - it was only a folded section under
// Forge from bars, easily missed; that section now starts open. Shot: shots/rs867-anvil.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    skGainXP('smithing', 1e7); skAdd('bronze', 20); const it = G.gear.weapon, acc0 = it.acc;
    ENCH.tab = 'work'; ENCH.sel = it; G.bench = 'anvil'; setUi('bench'); renderOverlay(); const html = buildAnvil(), btn = /Rework \+1/.test(html);
    anvRework(); for (let i=0;i<120 && (it.upg||0) < 1;i++) await new Promise(r=>setTimeout(r, 25));
    ENCH.tab = 'forge'; const fh = buildAnvil(); const open = /<details class="anf-xtra" open ontoggle="ANF.upg/.test(fh);
    ENCH.tab = 'work'; renderOverlay();
    return { msg:ENCH.msg, btn, upg:it.upg||0, acc0, acc1:it.acc, open }; });
  await page.screenshot({ path: SHOTS + '/rs867-anvil.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  A(r.btn && r.upg===1 && r.acc1 > r.acc0, 'no rework on the Work a piece tab', r); A(r.open, 'the upgrade section folded shut', r); };
