// RS-712: the anvil, a screen of its own. An anvil bench opens it on its Forge tab, the smith's button on Work a piece. Real mouse drags:
// a rare piece onto the anvil, an Essence of Law onto one of its bonuses (a tier up); a tapped Essence of Chaos, then a tap on the anvil
// (all rerolled); the hammer's Smash takes two taps and breaks the piece into essences; Masterwork raises a worn piece. Each bonus shows
// what Change and Law make of it and the piece lists what it could roll; a piece you made can't be smashed; Escape goes back to the smith
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const out = {}, ev = (f, a)=>page.evaluate(f, a), wait = ms=>page.waitForTimeout(ms);
  const at = async sel=>{ const b = await page.evaluate(s=>{ const el = typeof s==='string' ? document.querySelector(s) : null; if (!el) return null; el.scrollIntoView({ block:'nearest' }); const r = el.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2 }; }, sel); if (!b) throw new Error('no ' + sel); return b; };
  const drag = async (a, b)=>{ const p = await at(a), q = await at(b); await page.mouse.move(p.x, p.y); await page.mouse.down(); for (let i=1;i<=12;i++){ await page.mouse.move(p.x + (q.x - p.x)*i/12, p.y + (q.y - p.y)*i/12); await wait(16); } await page.mouse.up(); };
  const tap = async sel=>{ const p = await at(sel); await page.mouse.click(p.x, p.y); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    for (const e of ESSENCES) skAdd(e[0], 10); G.player.gold = 1e6;
    const rare = rsMakeArmour('metal', 4, 'chest'); rare.ilvl = 126; afDress(rare, 126, 2); rare.zr = 1;
    const w = rsMakeWeapon(4, 3); afDress(w, 60, 1); G.gear.weapon = w;
    const made = rsForgeQuality(rsMakeArmour('metal', 5, 'head'), 99, 85); made.zm = 1;
    G.inv = [rare, made]; const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); useBench('anvil'); });
  await wait(300);
  out.bench = await ev(()=>({ ui:G.ui, forge:/Forge from bars/.test(document.getElementById('overlay').textContent), tab:ENCH.tab, wide:document.getElementById('overlay').classList.contains('ovwide') }));
  await tap('.anv-tabs .btn:nth-child(2)'); await wait(200);
  out.work = await ev(()=>({ tab:ENCH.tab, es:document.querySelectorAll('.anv-es').length, groups:[...document.querySelectorAll('.anv-gh')].map(g=>g.textContent).join('|'), wide:document.getElementById('overlay').classList.contains('ovwide') }));
  /* drag the rare onto the anvil */
  const rareSel = await ev(()=>`[data-anv-pc="${ENCH.list.findIndex(x=>x[0].zr)}"]`);
  await drag(rareSel, '.anv-stage'); await wait(200);
  out.placed = await ev(()=>({ on:!!(ENCH.sel && ENCH.sel.zr), lines:document.querySelectorAll('.anv-ln[data-anv-ln]').length, opts:[...document.querySelectorAll('.anv-ln[data-anv-ln] .anv-lo')].every(o=>/Change/.test(o.textContent) && /Law/.test(o.textContent)),
    pre:document.querySelectorAll('.anv-pool .anv-pl').length, txt:/WHAT IT CAN ROLL/.test(document.querySelector('.anv-right').textContent), brk:!document.querySelector(".anv-hb.smash").classList.contains("dim") }));
  /* drag Law onto a bonus that can go up */
  const law = await ev(()=>{ const it = ENCH.sel; it.aff.forEach(a=>{ if (a.fam && !a.imp){ const F = AFFIX_FAM[a.fam]; afRollTier(it, a, F, 0); } }); renderOverlay(); const i = it.aff.findIndex(a=>enchCanLaw(it, a)); return { i, t:it.aff[i].t, n:skHave('es_law') }; });
  await drag('[data-anv-es="es_law"]', `[data-anv-ln="${law.i}"]`); await wait(600);
  out.law = await ev(l=>({ up:ENCH.sel.aff[l.i].t===l.t - 1, spent:l.n - skHave('es_law') }), law);
  /* tap Chaos, then the anvil */
  const ch = await ev(()=>({ n:skHave('es_chaos'), k:JSON.stringify(ENCH.sel.aff.filter(a=>!a.imp)) }));
  await tap('[data-anv-es="es_chaos"]'); await wait(150); out.held = await ev(()=>({ held:ENCH.held, hint:/holding an Essence of Chaos/.test(document.getElementById('overlay').textContent) }));
  await tap('.anv-stage'); await wait(600);
  out.chaos = await ev(c=>({ spent:c.n - skHave('es_chaos'), changed:JSON.stringify(ENCH.sel.aff.filter(a=>!a.imp))!==c.k, held:ENCH.held }), ch);
  /* smash: two taps */
  const e0 = await ev(()=>skHave('es_change'));
  await tap('.anv-hb.smash'); await wait(150); out.confirm = await ev(()=>({ txt:document.querySelector('.anv-hb.smash').textContent, still:G.inv.some(x=>x.zr) }));
  await tap('.anv-hb.smash'); await wait(700);
  out.smash = await ev(e=>({ gone:!G.inv.some(x=>x.zr), got:skHave('es_change') - e, last:(document.querySelector('.anv-last')||{}).textContent||'' }), e0);
  /* a made piece can't be smashed; the worn weapon masterworks */
  const madeSel = await ev(()=>`[data-anv-pc="${ENCH.list.findIndex(x=>x[0].zm)}"]`); await tap(madeSel); await wait(150);
  out.made = await ev(()=>({ dis:document.querySelector(".anv-hb.smash").classList.contains("dim"), why:/a piece you made/.test(document.querySelector('.anv-yield').textContent) }));
  const wSel = await ev(()=>`[data-anv-pc="${ENCH.list.findIndex(x=>x[0]===G.gear.weapon)}"]`); await tap(wSel); await wait(150);
  await tap('.anv-hb:not(.smash)'); await wait(600); out.mw = await ev(()=>G.gear.weapon.reinf||0);
  /* Ancestral: the list says so */
  out.anc = await ev(()=>{ const a = rsMakeArmour('metal', 4, 'legs'); a.anc = 1; a.ilvl = CB_HI; afDress(a, 126, 2); G.inv.push(a); anvPlace(a); return /Ancestral - the top tiers/.test(document.querySelector('.anv-right').textContent); });
  /* from the smith and back */
  await ev(()=>{ setUi('blacksmith'); }); await wait(150);
  await ev(()=>{ const b = [...document.querySelectorAll('#overlay .btn')].find(x=>/Work a piece at the anvil/.test(x.textContent)); b.scrollIntoView(); }); await wait(100);
  await page.evaluate(()=>[...document.querySelectorAll('#overlay .btn')].find(x=>/Work a piece at the anvil/.test(x.textContent)).click()); await wait(150);
  out.smith = await ev(()=>({ ui:G.ui, tab:ENCH.tab, from:ENCH.from, back:/back to the smith/.test(document.getElementById('overlay').textContent) }));
  await page.keyboard.press('Escape'); await wait(150); out.esc = await ev(()=>G.ui);
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(out)); };
  A(out.bench.ui==='bench' && out.bench.forge && out.bench.tab==='forge' && !out.bench.wide, 'an anvil bench opens the anvil on its Forge tab');
  A(out.work.tab==='work' && out.work.es===4 && /CAN BREAK DOWN 1/.test(out.work.groups) && /WORN/.test(out.work.groups) && /IN YOUR BAG 1/.test(out.work.groups) && out.work.wide, 'Work a piece: the essences, and your pieces by what can break down');
  A(out.placed.on && out.placed.lines >= 3 && out.placed.opts && out.placed.pre >= 6 && out.placed.txt && out.placed.brk, 'a piece dragged onto the anvil: each bonus with what Change and Law make of it, and what it could roll');
  A(out.law.up && out.law.spent===1, 'an Essence of Law dragged onto a bonus raises it a tier');
  A(out.held.held==='es_chaos' && out.held.hint && out.chaos.spent===1 && out.chaos.changed && !out.chaos.held, 'a tapped Essence of Chaos, then a tap on the anvil, rerolls the piece');
  A(/tap again/.test(out.confirm.txt) && out.confirm.still && out.smash.gone && out.smash.got >= 2 && /you smash the/.test(out.smash.last), 'the hammer smashes a piece on the second tap, into essences');
  A(out.made.dis && out.made.why && out.mw===1, "a piece you made can't be smashed; Masterwork raises a worn piece");
  A(out.anc, 'an Ancestral piece rolls from the top tiers, and says so');
  A(out.smith.ui==='bench' && out.smith.tab==='work' && out.smith.from==='blacksmith' && out.smith.back && out.esc==='blacksmith', "the smith's button opens Work a piece; Escape goes back to the smith");
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
