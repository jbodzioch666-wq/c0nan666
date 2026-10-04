module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin();
    // into the spawn town
    G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage();
    const sm = G.villageNpcs.find(n=>n.service==='slayer'), tz = G.villageNpcs.find(n=>n.service==='tzhaar');
    A(sm && tz, 'npcs placed'); A(G.map[sm.x][sm.y]===T_VENDOR, 'slayer tile');
    out.npcs = G.villageNpcs.map(n=>n.name+'@'+n.x+','+n.y);
    // talk to the slayer master by walking into him
    G.player.x = sm.x; G.player.y = sm.y+1; tryMove(0,-1);
    A(G.ui==='tasks' && G.tkAt==='slayer', 'slayer ui opens: '+G.ui);
    A(document.getElementById('overlay').innerHTML.includes('SLAYER MASTER'), 'title');
    slayerAssign();
    const T = G.player.slay.task; A(T && T.fam && T.need>0, 'task assigned');
    out.task = tkText(T);
    // kill the task
    const fam = T.fam, mk = (k, i)=>{ const m = Object.assign(newMonster(), famEntry(k, i||0)); m.alive = 1; m.hp = 1; m.maxHp = 12; m.mlevel = 3; m.x = 1; m.y = 1; G.mon.push(m); return G.mon.length-1; };
    const xp0 = G.player.skills.slayer||0;
    for (let i=0;i<T.need;i++) monsterDies(mk(fam));
    A(!G.player.slay.task && G.player.slay.done===1, 'task completes');
    A(G.player.cur.slayer>0, 'points'); A((G.player.skills.slayer||0) > xp0, 'slayer xp');
    out.pts = G.player.cur.slayer; out.slxp = G.player.skills.slayer; out.sllvl = skLvl('slayer');
    // buy the helmet
    G.player.cur.slayer = 1000; tkBuy('slayer','helm'); tkBuy('slayer','eye');
    A(G.inv.some(x=>x && x.slayHelm), 'helm bought'); A(G.player.slay.un.eye, 'eye unlocked'); A(G.player.cur.slayer===350, 'points spent '+G.player.cur.slayer);
    // helm damage: equip, then compare
    const hi = G.inv.findIndex(x=>x && x.slayHelm); G.gear.head = G.inv[hi];
    slayerAssign(); const T2 = G.player.slay.task; const mi = mk(T2.fam);
    out.mult = tkDmgMult('melee', G.mon[mi]); A(Math.abs(out.mult-1.15) < 0.001, 'helm mult '+out.mult);
    A(tkAccBonus(G.mon[mi])===2, 'acc');
    const other = Object.keys(MON_FAMILIES).find(k=>k!==T2.fam); A(tkDmgMult('melee', G.mon[mk(other)])===1, 'off task no bonus');
    // skip and block
    G.player.cur.slayer = 200; slayerSkip(true); A(G.player.slay.blocked.length===1 && G.player.slay.task, 'block');
    // contracts and bounties
    const p = tkP(); out.daily = p.contracts.daily.map(tkText); out.weekly = p.contracts.weekly.map(tkText); out.bounties = p.bounties.list.map(tkText);
    A(p.contracts.daily.length===3 && p.contracts.weekly.length===1, 'contracts');
    // finish each daily
    for (const t of p.contracts.daily){
      if (t.kind==='fam') for (let i=0;i<t.need;i++) monsterDies(mk(t.fam));
      if (t.kind==='bag') skAdd(t.item, t.need);
      if (t.kind==='xp') skGainXP(t.skill, Math.ceil((t.need+5)/XP_RATE));
      A(tkReady(t), 'ready '+t.kind);
    }
    const g0 = p.gold, tok0 = p.cur.guild;
    // walk into the board
    setUi('playing'); G.player.x = tX(15); G.player.y = tY(9); tryMove(0,-1);
    A(G.ui==='tasks' && G.tkAt==='board', 'board opens');
    p.contracts.daily.forEach((t,i)=>tkClaim('daily', i));
    A(p.contracts.daily.every(t=>t.claimed), 'claimed'); A(p.gold > g0 && p.cur.guild > tok0, 'paid');
    // bounty kill
    const b = p.bounties.list[0]; const bi = Object.assign(newMonster(), { alive:1, hp:1, maxHp:9, nm:b.nm, mlevel:b.lvl, x:1, y:1 }); G.mon.push(bi); monsterDies(G.mon.length-1);
    A(tkReady(b), 'bounty ready'); tkClaim('bounty', 0); A(b.claimed, 'bounty claimed');
    // guild shop
    p.cur.guild = 200; for (const e of GUILD_SHOP) tkBuy('guild', e.id);
    A(G.inv.some(x=>x && x.nm==='Ring of Wealth') && G.inv.some(x=>x && x.lamp), 'guild items');
    // tokkul
    const dm = Object.assign(newMonster(), famEntry('demon', 1)); dm.alive=1; dm.hp=1; dm.maxHp=40; dm.mlevel=12; G.mon.push(dm); const tk0 = p.cur.tokkul; monsterDies(G.mon.length-1);
    A(p.cur.tokkul > tk0, 'tokkul drop'); out.tokkul = p.cur.tokkul;
    p.cur.tokkul = 100000; for (const e of TZHAAR_SHOP) tkBuy('tokkul', e.id);
    const om = G.inv.find(x=>x && x.nm==='Tzhaar-ket-om'), bn = G.inv.find(x=>x && x.berserker); A(om && bn && skHave('onyx')>=1, 'tzhaar items');
    G.gear.weapon = om; G.gear.necklace = bn; const off = mk(Object.keys(MON_FAMILIES).find(k=>k!==G.player.slay.task.fam)); out.bers = tkDmgMult('melee', G.mon[off]); A(Math.abs(out.bers-1.2)<0.001, 'berserker '+out.bers);
    tkOpen('tzhaar'); A(typeof tzSell==='undefined' && !document.getElementById('overlay').innerHTML.includes('ORE'), 'the TzHaar trader takes no ore');
    // quest points
    p.questPoints = 30; p.gold = 500000; for (const e of QP_SHOP) tkBuy('qp', e.id);
    A(G.inv.some(x=>x && x.nm==='Quest Point Cape') && G.inv.some(x=>x && x.nm==='Amulet of Glory'), 'qp shop');
    // every tab renders, from anywhere
    for (const at of [null,'slayer','board','tzhaar','captain']) for (const tab of ['slayer','contracts','bounties','currency','money']){ G.tkAt = at; G.tkTab = tab; G.ui = 'tasks'; renderOverlay(); A(document.getElementById('overlay').innerHTML.length > 500, 'render '+at+'/'+tab); }
    // each NPC has a screen of its own: no tabs, only its own trade
    const ov = (at)=>{ G.tkAt = at; G.tkTab = null; G.ui = 'tasks'; renderOverlay(); return document.getElementById('overlay').innerHTML; };
    const hs = ov('slayer'); A(hs.includes('SLAYER REWARDS') && hs.includes('get a task') && !hs.includes('Contracts</button>') && !hs.includes('TOKKUL') && !hs.includes('OBSIDIAN'), 'slayer master: slayer only');
    const ht = ov('tzhaar'); A(ht.includes('OBSIDIAN FOR TOKKUL') && !ht.includes('Slayer</button>') && !ht.includes('SLAYER REWARDS') && !ht.includes('QUEST POINT'), 'tzhaar: his trade only');
    const hb = ov('board'); A(hb.includes('Contracts</button>') && !hb.includes('Slayer</button>') && !hb.includes('Currencies'), 'board: its own tabs');
    G.ui = 'questgiver'; renderOverlay(); const hq = document.getElementById('overlay').innerHTML; A(hq.includes('QUEST POINT REWARDS') && hq.includes('Amulet of Glory'), 'the captain sells his rewards himself');
    setUi('playing');
    // the board's guild store has a tab of its own (and isn't repeated under contracts or bounties)
    const gs = (tab)=>{ G.tkAt = 'board'; G.tkTab = tab; G.ui = 'tasks'; renderOverlay(); return document.getElementById('overlay').innerHTML; };
    A(gs('guild').includes('THE GUILD STORE') && !gs('contracts').includes('THE GUILD STORE') && !gs('bounties').includes('THE GUILD STORE'), 'guild store: its own tab');
    G.ui = 'questgiver'; renderOverlay(); A(!document.getElementById('overlay').innerHTML.includes('the bounty board</button>'), 'the captain has no board button');
    // RS-113: posted work lives on the bounty board (its first tab); the Captain keeps the story quests and the quest point rewards
    const hw = ov('board'); A(hw.includes('POSTED WORK') && hw.includes('Posted work</button>') && G.tkTab==='work', 'the board opens on posted work');
    G.ui = 'questgiver'; renderOverlay(); const hc = document.getElementById('overlay').innerHTML; A(!hc.includes('POSTED WORK') && hc.includes("THE WATCH'S QUESTS") && hc.includes('QUEST POINT REWARDS'), 'the captain: story quests and rewards, no jobs');
    A(typeof captainQuestMarker()==='string', 'the captain has his own marker');
    const job = G.questBoard.find(q=>q.kind!=='escort'); A(job, 'a job is posted');
    tkOpen('board', 'work'); acceptQuest(job.id); const mine = G.player.quests.find(q=>q.id===job.id); A(mine, 'took the job at the board');
    mine.progress = mine.target; mine.freed = true; A(questIsReady(mine) && villageQuestMarker()==='?', 'a finished job puts a ? over the board');
    turnInQuest(job.id); A(G.ui==='questReward', 'handed in'); chooseQuestReward(0); A(G.ui==='tasks' && G.tkAt==='board' && G.tkTab==='work' && !G.player.quests.some(q=>q.id===job.id), 'back at the board after the reward');
    // no T teleport; the classic buttons press the keys
    setUi('playing'); handleKeydown({ key:'t', target:document.body, preventDefault(){} }); A(G.ui==='playing', 'T opens nothing');
    const st0 = rsStyle().nm; document.getElementById('btnAbility').click(); A(rsStyle().nm!==st0, 'the F button changes attack style');
    document.getElementById('btnAbility2').click(); A(G.ui==='rsmagic', 'the G button opens magic'); setUi('playing');
    out.money = mmMethods().filter(m=>m.ok).map(m=>m.nm+' '+m.rate).slice(0,6);
    // calendar rollover
    const d0 = p.contracts.day; G.tkClock = Date.now() + 86400000*8; tkP(); A(p.contracts.day!==d0 && p.contracts.daily.every(t=>!t.claimed), 'new day'); G.tkClock = 0;
    // side panel, item tooltips, skill guide
    out.panel = tkPanelHtml().length; out.desc = rsBonusLines(om).join(' | ');
    G.ui='skguide'; G.skGuideK='slayer'; try { openSkillGuide('slayer'); } catch(e){ throw new Error('guide '+e.message); }
    // save + reload
    saveCurrentGame(); out.saved = true;
    setUi('playing');
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
};
