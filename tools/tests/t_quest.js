module.exports = async page=>{
  page.on('console', m=>{ if (m.text().startsWith('DBG')) console.log(m.text()); });
  const r = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false; v3Pref = false;
    const p = G.player; p.gold = 50000; p.turnCount = 60; p.wildWarned = 1;
    const sp = G.ow.spawnPos, home = townList().find(t=>t.x===sp.x && t.y===sp.y) || townList()[0];
    const goHome = ()=>{ G.gameMode = 0; G.mon = []; G.owPos = { x:home.x, y:home.y }; trackVisitedTown(home.x, home.y); enterVillage(); setUi('playing'); };
    const ok = ()=>{ A(G.ui==='wevent', 'a dialogue is open'); wevChoose(0); };
    const winFight = ()=>{ A(G.gameMode===2, 'a fight'); for (const m of G.mon){ m.alive = 0; m.hp = 0; } wevArenaWon(); };
    goHome();
    // 256: the innkeeper's rats
    setUi('tavern'); A(G.ui==='wevent' && /Rats/.test(G.wevDlg.title), 'the innkeeper offers a job'); wevChoose(0); ok(); winFight();
    A(sqStep('rats') && sqStep('rats').k==='talk', 'back to the innkeeper'); setUi('tavern'); ok(); A(sqDone('rats'), 'rats done'); out.qp = tkP().questPoints;
    // the smith's ore
    skP().skills.mining = SK_XP[20]; skAdd('iron', 12); setUi('blacksmith'); ok(); ok(); A(sqStep('ore').k==='bring', 'bring the ore'); setUi('blacksmith'); ok(); A(sqDone('ore') && G.inv.some(it=>it && it.questItem==='smithhammer'), 'ore done, hammer');
    // 258: trapped below - a quest object deep in a dungeon
    out.pre = { ui:G.ui, offered:G.sqOffered, declined:G.sqDeclined, bypass:G.sqBypass, can:sqCanStart('trapped'), seen:G.player.sqSeen, act:SQ_ORDER.filter(sqActive) };
    setUi('questgiver'); if (!G.wevDlg){ console.log('DBG '+JSON.stringify(out.pre)+' ui='+G.ui); } A(G.wevDlg && /Trapped/.test(G.wevDlg.title), 'the Captain offers'); wevChoose(0); ok();
    let s = sqP().trapped, L = s.loc[s.step]; A(L, 'the dungeon is chosen');
    G.gameMode = 0; G.owPos = { x:L.x, y:L.y }; G.pendingDungeon = { x:L.x, y:L.y }; enterDungeonConfirm(); setUi('playing');
    const fl = Math.min(3, G.dungeonMaxDepth); if (G.depth!==fl) loadLevel(fl, false);
    let qi = null; for (let x=0;x<COLS && !qi;x++) for (let y=0;y<ROWS;y++){ const it = G.floorItem[x] && G.floorItem[x][y]; if (it && it.sqItem==='trapped'){ qi = [x,y,it]; break; } }
    A(qi, 'the signet lies on the floor'); addToInventory(qi[2]); ok(); A(sqStep('trapped').k==='talk', 'found him');
    goHome(); setUi('questgiver'); ok(); A(sqDone('trapped'), 'trapped done');
    // 259 + 255 + 261: the Goblin War, with a choice and a boss
    setUi('questgiver'); A(/Goblin War I/.test(G.wevDlg.title), 'the chain begins'); wevChoose(0); ok();
    for (let i=0;i<6;i++) sqOnKill({ nm:'goblin raider' }); A(sqStep('gob1').k==='talk', 'scouts killed'); setUi('questgiver'); ok(); A(sqDone('gob1'), 'part I');
    setUi('questgiver'); wevChoose(0); ok(); s = sqP().gob2; L = s.loc[s.step]; G.gameMode = 0; G.owPos = { x:L.x, y:L.y }; setUi('playing'); sqFrame(); ok(); winFight();
    A(G.ui==='wevent' && G.wevDlg.sub==='a choice', 'the young goblin'); wevChoose(0); A(sqP().gob2.flags.mercy, 'mercy'); goHome(); setUi('questgiver'); ok(); A(sqDone('gob2'), 'part II');
    p.combatLevel = Math.max(p.combatLevel||3, 20); setUi('questgiver'); wevChoose(0); ok(); s = sqP().gob3; L = s.loc[s.step]; G.gameMode = 0; G.owPos = { x:L.x, y:L.y }; setUi('playing'); sqFrame();
    A(/young goblin/.test(G.wevDlg.text), 'the spared goblin opens the door'); ok();
    A(G.gameMode===2 && G.sqBossState, 'the Goblin King'); const king = G.mon.find(m=>m.sqBoss); const n0 = G.mon.length; king.hp = Math.round(king.maxHp*0.5); sqBossTurn(); A(G.mon.length > n0, 'he calls his guards');
    winFight(); goHome(); setUi('questgiver'); ok(); A(sqDone('gob3') && G.inv.some(it=>it && it.questItem==='goblincrown'), 'the Goblin Crown');
    // 257 + 260: the hermit, a riddle door, a tome and a teleport
    const hermit = G.ow.pois.find(o=>o.k==='hermit');
    if (hermit){ G.gameMode = 0; G.owPos = { x:hermit.x, y:hermit.y }; setUi('playing'); WG_POI.hermit(hermit); A(/Hermit/.test(G.wevDlg.title), 'the hermit offers'); wevChoose(0); ok();
      s = sqP().hermit; L = s.loc[s.step]; G.owPos = { x:L.x, y:L.y }; setUi('playing'); sqFrame(); ok(); A(G.ui==='sqpuzzle' && G.sqPz.kind==='riddle', 'the riddle door');
      sqPzRiddle((G.sqPz.q[2] + 1) % 4); A(G.sqPz && G.sqPz.wrong, 'a wrong answer'); sqPzRiddle(G.sqPz.q[2]); A(sqStep('hermit').k==='talk', 'the door opens');
      G.owPos = { x:hermit.x, y:hermit.y }; setUi('playing'); WG_POI.hermit(hermit); ok(); A(sqDone('hermit'), 'hermit done');
      const ti = G.inv.findIndex(it=>it && it.tome); A(ti >= 0, 'a tome'); useFromInv(ti); A((p.tomes||[]).includes('insight'), 'learned'); checkAchievements(); A(p.achievements.includes('tome_insight'), 'tome bonus');
      const tb = G.inv.findIndex(it=>it && it.tablet); G.owPos = { x:home.x, y:home.y }; useFromInv(tb); A(G.ow.pois.some(o=>o.k==='hermit' && Math.abs(G.owPos.x - o.x) + Math.abs(G.owPos.y - o.y) <= 1), 'teleported'); out.hermit = 'done'; }
    // the other puzzles
    sqP().mine2 = { step:2, state:'active', flags:{}, log:[], loc:{}, n:0 }; sqPuzzle('mine2'); A(G.sqPz.kind==='brazier', 'braziers'); sqPzBrazier((G.sqPz.order[0] + 1) % 5); A(G.sqPz.wrong, 'wrong order'); for (const k of G.sqPz.order.slice()) if (G.sqPz) sqPzBrazier(k); A(sqP().mine2.step===3, 'braziers lit');
    sqP().thief2 = { step:1, state:'active', flags:{}, log:[], loc:{}, n:0 }; sqPuzzle('thief2'); A(G.sqPz.kind==='sliding', 'sliding lock');
    { const start = G.sqPz.b.join(','), goal = '1,2,3,4,5,6,7,8,0', prev = new Map([[start, null]]), q = [start]; while (q.length){ const c = q.shift(); if (c===goal) break; const b = c.split(',').map(Number), e = b.indexOf(0);
        for (const k of [e-3, e+3, e%3 ? e-1 : -1, e%3!==2 ? e+1 : -1]) if (k>=0 && k<9){ const nb = b.slice(); nb[e] = nb[k]; nb[k] = 0; const key = nb.join(','); if (!prev.has(key)){ prev.set(key, [c, k]); q.push(key); } } }
      const path = []; let c = goal; while (prev.get(c)){ const [pc, k] = prev.get(c); path.unshift(k); c = pc; } for (const k of path) sqPzSlide(k); }
    A(sqP().thief2.step===2, 'lock cracked');
    sqP().lich8 = { step:2, state:'active', flags:{}, log:[], loc:{}, n:0 }; sqPuzzle('lich8'); A(G.sqPz.kind==='knight', 'knight floor');
    { const z = G.sqPz, prev = new Map([[0, null]]), q = [0]; while (q.length){ const c = q.shift(); if (c===z.goal) break; for (const n of sqKnightMoves(c)) if (!prev.has(n) && !z.crack.includes(n)){ prev.set(n, c); q.push(n); } }
      const path = []; let c = z.goal; while (c!==0){ path.unshift(c); c = prev.get(c); } for (const k of path) if (G.sqPz) sqPzKnight(k); }
    A(G.gameMode===1 && G.dungeonMaxDepth >= 6, 'into the Black Spire'); out.spire = sqSpire();
    loadLevel(G.dungeonMaxDepth, false); A(G.isBossFloor && G.mon[G.bossIdx] && G.mon[G.bossIdx].sqBoss==='wakener', 'the Wakener waits');
    sqP().lich8.state = 'abandoned'; G.gameMode = 0; G.mon = []; G.isBossFloor = 0; setUi('playing');
    // 262: factions shut each other out, until you leave
    sqP().thief1 = { state:'done', step:2, flags:{}, log:[], loc:{} }; p.faction = { thieves:1 }; A(sqReqText('guard1').length, 'the Guard won\'t have a thief'); sqLeaveFaction('thieves'); A(!sqReqText('guard1').length, 'leaving opens the way');
    // 250 + 251: the journal and the markers
    setUi('journal'); for (const t of ['story','jobs','diaries','clues']){ G.jTab = t; renderOverlay(); } G.jTab = 'story'; renderOverlay(); A(document.getElementById('overlay').innerHTML.includes('Rats in the Cellar'), 'journal');
    setUi('playing'); sqP().mine1 = undefined; delete sqP().mine1; skP().skills.mining = SK_XP[20]; goHome(); const mayor = G.villageNpcs.find(n=>n.service==='mayor'); villageInteract(mayor.x, mayor.y); if (G.ui==='wevent') wevChoose(0);
    if (sqActive('mine1')){ if (G.ui==='wevent') wevChoose(0); A(questsShown().some(q=>q.kind==='story'), 'story quests on the tracker'); renderQuestTracker(); A(document.getElementById('qtrack').innerHTML.includes('Haunted Mine'), 'tracker line'); A(questTarget(questsShown().find(q=>q.sq==='mine1')), 'a marker'); }
    // 265: a diary tier
    for (const t of townList().slice(0, 3)) trackVisitedTown(t.x, t.y); p.killCount = 30; skP().skills.woodcutting = SK_XP[12]; p.questsDone = Math.max(p.questsDone||0, 1);
    diaryClaim('heart', 0); A((p.diary||{}).heart===1 && G.inv.some(it=>it && /Heartlands cloak 1/.test(it.nm)), 'diary reward');
    // 268 + 269: a clue trail and a treasure map
    G.inv.length = Math.min(G.inv.length, 40); goHome(); G.gameMode = 0; setUi('playing');
    const clue = mkClue(); addToInventory(clue); useFromInv(G.inv.indexOf(clue)); if (G.ui==='wevent') wevChoose(0); A(clue.trail && clue.trail.steps.length >= 2, 'a trail');
    let guard = 0; while (G.inv.includes(clue) && guard++ < 10){ const st = clue.trail.steps[clue.trail.i]; if (st.x!==undefined){ G.owPos = { x:st.x, y:st.y }; useFromInv(G.inv.indexOf(clue)); if (G.ui==='wevent') wevChoose(0); } else sqClueStep(clue); }
    A(!G.inv.includes(clue) && (p.caskets||0) >= 1, 'the casket'); const tm = sqTreasureMap(); addToInventory(tm); G.owPos = { x:tm.mx, y:tm.my }; useFromInv(G.inv.indexOf(tm)); A((p.caskets||0) >= 2, 'treasure dug up');
    // 257: a ghost by night
    let gy = null; for (let x=1;x<OW_COLS-1 && !gy;x++) for (let y=1;y<OW_ROWS-1;y++) if (G.ow.map[x][y]===OW_GRAVEYARD && [OW_GRASS,OW_FOREST].includes(G.ow.map[x][y+1])){ gy = [x, y+1]; break; }
    if (gy){ p.turnCount = DAY_LENGTH*7 + 5; G.owPos = { x:gy[0], y:gy[1] }; setUi('playing'); A(sqWorldStep() && /ghost/i.test(G.wevDlg.title), 'a ghost'); wevChoose(0); if (G.ui==='wevent') wevChoose(0); A(sqActive('ghost'), 'the ghost\'s quest'); }
    await frames(4);
    // save and load
    const qp = tkP().questPoints; saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(sqDone('gob3') && tkP().questPoints===qp, 'quests survive');
    out.done = SQ_ORDER.filter(k=>sqDone(k)); out.qpEnd = qp;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(()=>{ setUi('journal'); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_journal.png', timeout:120000 });
};
