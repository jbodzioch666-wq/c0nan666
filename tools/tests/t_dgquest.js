// RS-331: in a dungeon a quest of yours is in, its name and objective show under the bar at the top; other dungeons show
// nothing. The quest tracker has Journal and Tasks buttons that open those tabs in the side window
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
    const qt = document.getElementById('qtrack'), bs = [...qt.querySelectorAll('.qt-foot button')].map(b=>b.textContent); out.btns = bs;
    SP.open = false; qt.querySelector('.qt-foot button').click(); out.j = { open:SP.open, tab:SP.tab, q:SP.qTab, shown:/YOU CAN START|IN PROGRESS/.test(document.getElementById('sidePanel').innerText) };
    qt.querySelectorAll('.qt-foot button')[1].click(); out.t = { tab:SP.tab, q:SP.qTab };
    G.player.qtRolled = true; renderQuestTracker(); out.rolledBtns = qt.querySelectorAll('.qt-foot button').length;
    return out; });
  await shot('dgquest');
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(/miller/i.test(r.here), 'the quest in this dungeon shows under the bar');
  A(/floor 2/.test(r.here), 'with what is left to do');
  A(!/miller/i.test(r.other), 'another dungeon shows no quest');
  A(r.btns.join()==='Journal,Tasks', 'the tracker has Journal and Tasks buttons');
  A(r.j.open && r.j.tab==='quests' && r.j.q==='journal' && r.j.shown, 'Journal opens the journal tab');
  A(r.t.tab==='quests' && r.t.q==='tasks', 'Tasks opens the tasks tab');
  A(r.rolledBtns===2, 'the buttons stay when the tracker is rolled up');
  console.log('dgquest ok', JSON.stringify(r));
};
