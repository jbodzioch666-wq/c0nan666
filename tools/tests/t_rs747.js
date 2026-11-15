// RS-747: the guild store and the quest point rewards of the loot system. Guild tokens buy essences for the smith, a strongbox of rare
// gear, and a Ring of Wealth and an Adventurer's Cape rolled as rares for your level, each with its own bonus built in; the Captain's
// rewards are rares for your level, the Quest Point Cape an Ancestral rare of six bonuses (no longer coloured as a set piece).
// Shots: rs747_guild.png, rs747_qp.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player; p.clock = p.turnCount = 60*12; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const tk = tkP(); tk.cur.guild = 500; G.inv = [];
    const rolled = it=>it ? (it.aff||[]).filter(a=>a && !a.imp).length : -1, imp = (it, k)=>!!(it && (it.aff||[]).some(a=>a.kind===k && a.imp));
    for (const e of GUILD_SHOP) tkBuy('guild', e.id);
    const find = nm=>G.inv.find(x=>x && x.nm===nm), L = tkRewardLvl();
    const ring = find('Ring of Wealth'), cape = find("Adventurer's Cape"), box = G.inv.find(x=>x && x.used && !x.consumable && x.nm!=='Ring of Wealth' && x.nm!=="Adventurer's Cape" && !x.lamp && x.kind!=='scroll' && !x.clue && x.quality===2);
    const out = { L, tokens:tk.cur.guild, es:['es_change', 'es_blood', 'es_chaos', 'es_law'].map(k=>skHave(k)),
      ring:ring && { q:ring.quality, n:rolled(ring), gold:imp(ring, 'goldfind'), ilvl:ring.ilvl }, cape:cape && { q:cape.quality, n:rolled(cape), xp:imp(cape, 'xpfind'), ilvl:cape.ilvl, ac:cape.ac },
      box:box && { q:box.quality, n:rolled(box), ilvl:box.ilvl, nm:box.nm } };
    /* the strongbox at a higher level rolls higher */
    const b2 = (()=>{ const c0 = cbLvl; cbLvl = ()=>90; try{ return tkStrongbox(); } finally { cbLvl = c0; } })(); out.box90 = { q:b2.quality, ilvl:b2.ilvl };
    G.tkAt = 'board'; G.tkTab = 'guild'; setUi('tasks'); out.guildHtml = /Essences of Change/.test(document.getElementById('overlay').innerHTML) && /Guild Strongbox/.test(document.getElementById('overlay').innerHTML);
    return out; });
  await page.screenshot({ path:SHOTS + '/rs747_guild.png' });
  const r1 = await ev(async ()=>{
    const p = G.player, tk = tkP(); tk.questPoints = 30; p.gold = 1e6; G.inv = [];
    for (const e of QP_SHOP) tkBuy('qp', e.id);
    const rolled = it=>it ? (it.aff||[]).filter(a=>a && !a.imp).length : -1, find = nm=>G.inv.find(x=>x && x.nm===nm), o = it=>it && { q:it.quality, n:rolled(it), ilvl:it.ilvl, anc:!!it.anc };
    const out = { glory:o(find('Amulet of Glory')), legends:o(find('Cape of Legends')), dsq:o(find('Dragon Sq Shield')), qpcape:o(find('Quest Point Cape')), gold:p.gold };
    const g = find('Amulet of Glory'); out.gloryBase = g && g.acc===10 && g.dmgB===8;
    G.ui = 'questgiver'; renderOverlay();   /* (setUi would let the Captain offer his quest first) */
    out.capUi = G.ui; out.capHtml = /rolled for your level/.test(document.getElementById('overlay').innerHTML);
    return out; });
  await page.screenshot({ path:SHOTS + '/rs747_qp.png' });
  console.log(JSON.stringify(r0)); console.log(JSON.stringify(r1));
  A(r0.tokens===500 - GUILD_COST && r0.es.join()==='3,2,1,1', 'essences for the smith: ' + JSON.stringify(r0));
  A(r0.ring && r0.ring.q===2 && r0.ring.n >= 3 && r0.ring.gold && r0.ring.ilvl >= r0.L, 'a rare Ring of Wealth, its 20% gold built in: ' + JSON.stringify(r0.ring));
  A(r0.cape && r0.cape.q===2 && r0.cape.n >= 3 && r0.cape.xp && r0.cape.ilvl >= r0.L, "a rare Adventurer's Cape, its 5% xp built in: " + JSON.stringify(r0.cape));
  A(r0.box && r0.box.q===2 && r0.box.n >= 3 && r0.box.ilvl===r0.L && r0.box90.q===2 && r0.box90.ilvl > r0.L, 'the strongbox: rare gear for your level: ' + JSON.stringify(r0));
  A(r0.guildHtml, 'the guild store lists them: ' + JSON.stringify(r0));
  for (const k of ['glory', 'legends', 'dsq']) A(r1[k] && r1[k].q===2 && r1[k].n >= 3 && r1[k].ilvl >= r0.L, k + ': a rare for your level: ' + JSON.stringify(r1[k]));
  A(r1.capUi==='questgiver' && r1.capHtml, "the Captain's page says so: " + JSON.stringify(r1));
  A(r1.gloryBase, 'glory keeps its own stats: ' + JSON.stringify(r1));
  A(r1.qpcape && r1.qpcape.q===2 && r1.qpcape.anc && r1.qpcape.n===6, 'the Quest Point Cape: an Ancestral rare of six: ' + JSON.stringify(r1.qpcape));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
const GUILD_COST = 4 + 5 + 6 + 7 + 8 + 8 + 12 + 14 + 20 + 40 + 60;
