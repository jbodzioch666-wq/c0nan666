// RS-331: in a dungeon a quest of yours is in, its name and objective show under the bar at the top; other dungeons show
// nothing. RS-332: the quest bar has its own Quests, Journal and Tasks tabs, shown in the bar itself
module.exports = async page=>{
  const shot = async nm=>{ if (process.env.SHOT_DIR) await page.screenshot({ path:process.env.SHOT_DIR+'/'+nm+'.png', clip:{ x:300, y:0, width:800, height:90 } }); };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const ds = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON) ds.push({ x, y });
    const [d1, d2] = ds, out = {};
    G.player.quests = [{ id:'qtest', kind:'rescue', title:'The Lost Miller', townName:'Testford', siteX:d1.x, siteY:d1.y, siteKind:'dungeon', floor:2, captive:'the miller', freed:false, target:1, progress:0 }];
    G.gameMode = 0; G.pendingDungeon = d1; enterDungeonConfirm(); setUi('playing'); renderGame(); clockBarSync();
    out.here = document.getElementById('dhClock').innerText;
    G.gameMode = 0; G.pendingDungeon = d2; enterDungeonConfirm(); setUi('playing'); renderGame(); clockBarSync();
    out.other = document.getElementById('dhClock').innerText;
    // the tracker's buttons
    G.gameMode = 0; G.pendingDungeon = d1; enterDungeonConfirm(); setUi('playing'); renderGame(); clockBarSync(); G.player.qtHidden = false; G.player.qtRolled = false; renderQuestTracker();
    const qt = document.getElementById('qtrack'), tabs = ()=>[...qt.querySelectorAll('.qt-tabs button')]; out.btns = tabs().map(b=>b.textContent);
    // (RS-332) the tabs are part of the bar: they switch what the bar itself shows, and never open the side window
    SP.open = false; tabs()[1].click(); out.j = { sideOpen:SP.open, tab:G.player.qtTab, on:tabs()[1].classList.contains('on'), shown:/YOU CAN START|IN PROGRESS/.test(qt.innerText), cards:qt.querySelectorAll('[data-qt-jq]').length };
    qt.querySelector('[data-qt-jq]').click(); out.j.log = !!qt.querySelector('.qt-log');
    tabs()[2].click(); out.t = { sideOpen:SP.open, tab:G.player.qtTab, text:/SLAYER/.test(qt.innerText) && /CONTRACTS/.test(qt.innerText) && /BOUNTIES/.test(qt.innerText) };
    tabs()[0].click(); out.back = /miller/i.test(qt.innerText);
    G.player.qtRolled = true; renderQuestTracker(); out.rolledBtns = tabs().length; tabs()[1].click(); out.unrolled = !G.player.qtRolled && G.player.qtTab==='journal';
    return out; });
  await shot('dgquest');
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(/miller/i.test(r.here), 'the quest in this dungeon shows under the bar');
  A(/floor 2/.test(r.here), 'with what is left to do');
  A(!/miller/i.test(r.other), 'another dungeon shows no quest');
  A(r.btns.join()==='Quests,Journal,Tasks', 'the quest bar has Quests, Journal and Tasks tabs');
  A(!r.j.sideOpen && r.j.tab==='journal' && r.j.on && r.j.shown && r.j.cards > 5 && r.j.log, 'Journal shows the story quests in the bar itself (tap one for its log)');
  A(!r.t.sideOpen && r.t.tab==='tasks' && r.t.text, 'Tasks shows Slayer, contracts and bounties in the bar itself');
  A(r.back, 'Quests goes back to the tracked quests');
  A(r.rolledBtns===3 && r.unrolled, 'the tabs stay on the rolled-up bar, and tapping one rolls it down on that tab');
  console.log('dgquest ok', JSON.stringify(r));
};
