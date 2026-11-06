// RS-713: the anvil says why an essence won't work. A tap on an essence that can't work here, a drop, or a tap on a bonus it can't touch
// puts the reason on the anvil (.anv-msg) and in the log; the essence's gem is marked and its title says why; while dragging, a label
// under the essence says what letting go would do or why not; holding Law, a bonus it can't raise says why under it (and Law stays held);
// Masterwork and Smash are dimmed, not dead, and a tap says why
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const out = {}, ev = (f, a)=>page.evaluate(f, a), wait = ms=>page.waitForTimeout(ms);
  const at = async sel=>{ const b = await page.evaluate(s=>{ const el = document.querySelector(s); if (!el) return null; el.scrollIntoView({ block:'nearest' }); const r = el.getBoundingClientRect(); return { x:r.left + r.width/2, y:r.top + r.height/2 }; }, sel); if (!b) throw new Error('no ' + sel); return b; };
  const tap = async sel=>{ const p = await at(sel); await page.mouse.click(p.x, p.y); };
  const msg = ()=>ev(()=>{ const m = document.querySelector('.anv-msg'); return m ? m.textContent : ''; });
  const pick = async k=>{ const sel = await ev(k=>`[data-anv-pc="${ENCH.list.findIndex(x=>x[0][k])}"]`, k); await tap(sel); await wait(120); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false;
    for (const e of ESSENCES) skAdd(e[0], 20); G.player.gold = 0;
    const top = rsMakeArmour('metal', 4, 'chest'); top.ilvl = 126; afDress(top, 126, 2); top.zt = 1;
    for (const a of top.aff) if (a.fam && !a.imp){ const F = AFFIX_FAM[a.fam]; afRollTier(top, a, F, F.tiers.length - 1); }
    const mix = rsMakeArmour('metal', 4, 'legs'); mix.ilvl = 126; afDress(mix, 126, 2); mix.zx = 1;
    const R = mix.aff.filter(a=>a.fam && !a.imp); { const F = AFFIX_FAM[R[0].fam]; afRollTier(mix, R[0], F, F.tiers.length - 1); } { const F = AFFIX_FAM[R[1].fam]; afRollTier(mix, R[1], F, 0); }
    const plain = rsMakeArmour('metal', 3, 'feet'); plain.zp = 1;
    const relic = rsMakeArmour('metal', 4, 'arms'); afDress(relic, 90, 2); relic.relic = 1; relic.zr = 1;
    const six = rsMakeArmour('metal', 4, 'head'); six.ilvl = 126; afDress(six, 126, 2); for (let i=0;i<12 && enchRolls(six).length < 6;i++) enchBlood(six); six.zs = 1;
    const w = rsMakeWeapon(4, 3); afDress(w, 60, 1); G.gear.weapon = w; w.zw = 1;
    for (const e of ESSENCES) skAdd(e[0], 20 - skHave(e[0]));
    G.inv = [top, mix, plain, relic, six]; const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); anvilOpen(null); });
  await wait(300);
  /* nothing on the anvil yet */
  await tap('[data-anv-es="es_chaos"]'); await wait(120); out.empty = { msg:await msg(), held:await ev(()=>ENCH.held), log:await ev(()=>/lay a piece on the anvil/.test(document.getElementById('log') ? document.getElementById('log').textContent : (G.log||[]).map(x=>x.text||x).join(' '))) };
  /* a plain piece: Chaos and Change say why, and the gems are marked */
  await pick('zp'); out.plainGems = await ev(()=>({ chaos:document.querySelector('[data-anv-es="es_chaos"]').classList.contains('cant'), blood:document.querySelector('[data-anv-es="es_blood"]').classList.contains('cant'),
    title:document.querySelector('[data-anv-es="es_chaos"]').title, msgGone:!document.querySelector('.anv-msg') }));
  await tap('[data-anv-es="es_change"]'); await wait(120); out.plainChange = await msg();
  /* every bonus T1: Law can't */
  await pick('zt'); await tap('[data-anv-es="es_law"]'); await wait(120); out.topLaw = { msg:await msg(), held:await ev(()=>ENCH.held), n:await ev(()=>skHave('es_law')) };
  /* one at T1, one low: Law is held; the T1 bonus says why under it, a tap on it says so and Law stays held */
  await pick('zx'); await tap('[data-anv-es="es_law"]'); await wait(120);
  const L = await ev(()=>{ const it = ENCH.sel; return { hi:it.aff.findIndex(a=>a.fam && !a.imp && a.t===1), lo:it.aff.findIndex(a=>a.fam && !a.imp && enchCanLaw(it, a)) }; });
  out.mixHeld = await ev(l=>({ held:ENCH.held, why:(document.querySelector(`[data-anv-ln="${l.hi}"] .anv-why`)||{}).textContent||'', no:document.querySelector(`[data-anv-ln="${l.hi}"]`).classList.contains('no'),
    okWhy:!!document.querySelector(`[data-anv-ln="${l.lo}"] .anv-why`) }), L);
  await tap(`[data-anv-ln="${L.hi}"]`); await wait(120); out.mixTap = { msg:await msg(), held:await ev(()=>ENCH.held), n:await ev(()=>skHave('es_law')) };
  await ev(()=>anvHold(null));
  /* a drag: the label under the essence over a bonus it can't raise, then over one it can */
  const p = await at('[data-anv-es="es_law"]'), q = await at(`[data-anv-ln="${L.hi}"]`), r = await at(`[data-anv-ln="${L.lo}"]`);
  await page.mouse.move(p.x, p.y); await page.mouse.down(); for (let i=1;i<=10;i++){ await page.mouse.move(p.x + (q.x - p.x)*i/10, p.y + (q.y - p.y)*i/10); await wait(16); }
  out.dragNo = await ev(()=>{ const g = document.querySelector('.anv-ghost .anv-gl'); return g ? { txt:g.textContent, no:g.classList.contains('no'), shown:g.style.display!=='none', mark:!!document.querySelector('.dropno') } : null; });
  for (let i=1;i<=6;i++){ await page.mouse.move(q.x + (r.x - q.x)*i/6, q.y + (r.y - q.y)*i/6); await wait(16); }
  out.dragOk = await ev(()=>{ const g = document.querySelector('.anv-ghost .anv-gl'); return g ? { txt:g.textContent, no:g.classList.contains('no') } : null; });
  await page.mouse.move(q.x, q.y); await wait(30); await page.mouse.up(); await wait(150);
  out.dropNo = { msg:await msg(), n:await ev(()=>skHave('es_law')), ghost:await ev(()=>!!document.querySelector('.anv-ghost')) };
  /* six bonuses: Blood can't */
  await pick('zs'); out.six = await ev(()=>enchRolls(ENCH.sel).length); await tap('[data-anv-es="es_blood"]'); await wait(120); out.sixBlood = await msg();
  /* a relic: its bonuses are its own */
  await pick('zr'); await tap('[data-anv-es="es_chaos"]'); await wait(120); out.relic = await msg();
  /* no gold: Masterwork dimmed, a tap says what it costs; the worn weapon can't be smashed */
  await pick('zw'); out.mwDim = await ev(()=>document.querySelector('.anv-hb:not(.smash)').classList.contains('dim'));
  await tap('.anv-hb:not(.smash)'); await wait(120); out.mw = { msg:await msg(), reinf:await ev(()=>G.gear.weapon.reinf||0) };
  await tap('.anv-hb.smash'); await wait(120); out.smash = { msg:await msg(), dim:await ev(()=>document.querySelector('.anv-hb.smash').classList.contains('dim')), worn:await ev(()=>!!G.gear.weapon) };
  /* none of an essence left */
  await ev(()=>{ skAdd('es_chaos', -skHave('es_chaos')); renderOverlay(); }); await pick('zx'); await tap('[data-anv-es="es_chaos"]'); await wait(120); out.none = await msg();
  /* the fixed and no-classes reasons */
  out.unit = await ev(()=>{ const u = rsMakeArmour('metal', 4, 'chest'); u.uniqueId = 'x'; const s = rsMakeArmour('metal', 4, 'chest'); s.setId = 'y'; return { u:anvEsWhy('es_blood', u), s:anvEsWhy('es_blood', s) }; });
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(out)); };
  A(/Chaos won't work: lay a piece on the anvil first/.test(out.empty.msg) && !out.empty.held, 'no piece: the anvil says to lay one on it');
  A(out.plainGems.chaos && out.plainGems.blood===false && /won't work here: Chaos rerolls a magic or rare piece/.test(out.plainGems.title) && out.plainGems.msgGone, "a plain piece: Chaos's gem marked, with the reason in its title; laying a piece clears the message");
  A(/Change won't work: it has no bonuses yet - Blood adds one/.test(out.plainChange), 'Change on a plain piece: no bonuses yet');
  A(/Law won't work: every bonus on it is T1 already/.test(out.topLaw.msg) && !out.topLaw.held && out.topLaw.n===20, 'Law on an all-T1 piece: says so, spends nothing');
  A(out.mixHeld.held==='es_law' && /Law won't work here: it is T1 already/.test(out.mixHeld.why) && out.mixHeld.no && !out.mixHeld.okWhy, 'holding Law: the T1 bonus says why under it, the one it can raise does not');
  A(/Law won't work: it is T1 already/.test(out.mixTap.msg) && out.mixTap.held==='es_law' && out.mixTap.n===20, 'a tap on the T1 bonus says why and Law stays held');
  A(out.dragNo && out.dragNo.shown && out.dragNo.no && /T1 already/.test(out.dragNo.txt) && out.dragNo.mark, 'dragging Law over a T1 bonus: the label says why, the bonus outlined red');
  A(out.dragOk && !out.dragOk.no && /let go to use it/.test(out.dragOk.txt), 'over a bonus it can raise: let go to use it');
  A(/T1 already/.test(out.dropNo.msg) && out.dropNo.n===20 && !out.dropNo.ghost, 'dropped on the T1 bonus: the reason on the anvil, nothing spent');
  A(out.six===6 && /Blood won't work: six bonuses is the most a piece holds/.test(out.sixBlood), 'Blood on a six-bonus piece: six is the most');
  A(/Chaos won't work: a relic's bonuses are its own/.test(out.relic), "a relic: its bonuses are its own");
  A(out.mwDim && /masterworking to \+1 costs [\d,]+ gold - you have 0/.test(out.mw.msg) && out.mw.reinf===0, 'no gold: Masterwork dimmed, a tap says what it costs');
  A(/won't smash it: take it off to break it down/.test(out.smash.msg) && out.smash.dim && out.smash.worn, 'Smash on a worn piece: take it off first');
  A(/Chaos won't work: you have no Essence/.test(out.none), 'none left: says where they come from');
  A(/a Unique's bonuses are its own/.test(out.unit.u) && /a set piece's bonuses are its own/.test(out.unit.s), 'Unique and set pieces say so');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
