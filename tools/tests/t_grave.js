// the gravestone card in the tracker: it can be dismissed (the grave stays), F6 brings it back, a new death shows it again
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a);
  const vis = ()=>ev(()=>{ const el = document.getElementById('qtrack'); return !!el && el.style.display!=='none' && el.innerHTML.includes('Your gravestone'); });
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.player.grave = { x:G.owPos.x+5, y:G.owPos.y, items:[], gold:40, place:'the overworld wilds', cause:'a test', when:Date.now() }; renderGame(); });
  await page.waitForTimeout(300);
  if (!await vis()) throw new Error('the gravestone card shows');
  // with no quests the header reads Gravestone, and its x dismisses the card
  const hdr = await ev(()=>document.querySelector('#qtrack .qt-h').textContent);
  if (!/Gravestone/.test(hdr)) throw new Error('header reads Gravestone: '+hdr);
  await page.click('#qtrack .qt-h .qt-x'); await page.waitForTimeout(300);
  if (await vis()) throw new Error('dismissed');
  let st = await ev(()=>({ grave:!!G.player.grave, hidden:G.player.grave.hidden, qt:!!G.player.qtHidden }));
  if (!st.grave || !st.hidden || st.qt) throw new Error('the grave stays, only the card is hidden '+JSON.stringify(st));
  // the dismissal survives a reload
  await ev(()=>{ saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); renderGame(); });
  await page.waitForTimeout(300);
  if (await vis()) throw new Error('still dismissed after a reload');
  // the quests tab (F6) offers it back
  if (!await ev(()=>spBody('quests').includes('show my gravestone again'))) throw new Error('F6 offers it back');
  await ev(()=>graveTrackerShow()); await page.waitForTimeout(300);
  if (!await vis()) throw new Error('shown again');
  // with quests in the tracker too, the card has its own x, and dismissing it leaves the quests up
  const withQ = await ev(()=>{ const keep = [questsShown, questTitle, questObjective, questTarget];
    questsShown = ()=>[{ id:'fake', kind:'fetch' }]; questTitle = ()=>'A test quest'; questObjective = ()=>'do a thing'; questTarget = ()=>null;
    try { renderGame(); return [document.querySelectorAll('#qtrack .qt-grave .qt-x').length, document.querySelector('#qtrack .qt-h').textContent]; }
    finally { [questsShown, questTitle, questObjective, questTarget] = keep; renderGame(); } });
  if (withQ[0]!==1 || !/Quests/.test(withQ[1])) throw new Error('the card has its own x under a Quests header: '+withQ);
  console.log(JSON.stringify({ hdr, withQ }));
};
