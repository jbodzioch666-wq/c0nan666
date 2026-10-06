// RS-177: the quest window rolls up to its title bar instead of closing, and rolls back down when tapped again;
// dragging the title bar moves it without rolling it; the choice is kept in the save
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a);
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.player.qtRolled = false;
    window._keep = [questsShown, questTitle, questObjective, questTarget];
    questsShown = ()=>[{ id:'fake1', kind:'fetch' }, { id:'fake2', kind:'fetch' }]; questTitle = q=>'Quest '+q.id; questObjective = ()=>'do a thing'; questTarget = ()=>null;
    renderGame(); });
  await page.waitForTimeout(300);
  const st = ()=>ev(()=>{ const el = document.getElementById('qtrack'); return { shown:el.style.display!=='none', rolled:el.classList.contains('rolled'), cards:el.querySelectorAll('.qt-q').length, h:el.querySelector('.qt-h').textContent, height:Math.round(el.getBoundingClientRect().height), flag:!!G.player.qtRolled }; });
  const out = { open:await st() };
  await page.click('#qtrack .qt-h'); await page.waitForTimeout(300); out.rolled = await st();
  // dragging the title bar moves the window and leaves it rolled
  const b = await ev(()=>{ const r = document.querySelector('#qtrack .qt-h').getBoundingClientRect(); return { x:r.left + 20, y:r.top + r.height/2 }; });
  await page.mouse.move(b.x, b.y); await page.mouse.down(); await page.mouse.move(b.x - 60, b.y + 40, { steps:6 }); await page.mouse.up(); await page.waitForTimeout(300);
  out.dragged = await st();
  // it stays rolled across a reload
  await ev(()=>{ saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); renderGame(); }); await page.waitForTimeout(300);
  out.reload = await st();
  await page.click('#qtrack .qt-h'); await page.waitForTimeout(300); out.down = await st();
  await ev(()=>{ [questsShown, questTitle, questObjective, questTarget] = window._keep; resetLayout && resetLayout(); renderGame(); });
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.open.shown && !out.open.rolled && out.open.cards===2, 'the quest window starts open');
  A(out.rolled.shown && out.rolled.rolled && out.rolled.cards===0 && /\(2\)/.test(out.rolled.h) && out.rolled.height < 50, 'tapping the title bar rolls it up to just the bar (with the count) - it does not close');
  A(out.dragged.rolled, 'dragging the bar moves it without rolling it down');
  A(out.reload.rolled && out.reload.flag, 'it stays rolled up after a reload');
  A(out.down.shown && !out.down.rolled && out.down.cards===2, 'tapping again rolls it back down');
};
