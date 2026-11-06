// RS-121: tick skills in the skills menu (J) to choose what the XP window shows
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  await ev(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); skGainXP('attack', 100); skGainXP('woodcutting', 100); });
  await page.waitForTimeout(400);
  A(await ev(()=>xptList().includes('attack') && xptList().includes('woodcutting')), 'before any tick: the window follows what you trained');
  // tick fishing, untick attack and woodcutting, in the skills menu, with real clicks
  await ev(()=>setUi('skills')); await page.waitForTimeout(300);
  const box = k=>`.skcard:has(input[onchange*="'${k}'"]) input[type=checkbox]`;
  await page.click(box('fishing')); await page.click(box('attack')); await page.click(box('woodcutting'));
  const st = await ev(()=>({ ui:G.ui, pick:G.player.xpPick }));
  A(st.ui==='skills', 'ticking a box does not open the skill guide: '+st.ui);
  A(JSON.stringify(st.pick)===JSON.stringify(['fishing']), 'only fishing is picked: '+JSON.stringify(st.pick));
  await ev(()=>{ setUi('playing'); renderXpTracker(); }); await page.waitForTimeout(300);
  const rows = await ev(()=>[...document.querySelectorAll('#xpTracker .xpt-row b')].map(b=>b.textContent));
  A(rows.length===1 && /fish/i.test(rows[0]), 'the XP window shows one row, fishing: '+JSON.stringify(rows));
  // gaining attack xp doesn't add it back while you've picked
  await ev(()=>{ skGainXP('attack', 100); }); await page.waitForTimeout(300);
  A(await ev(()=>xptList().length===1), 'training another skill leaves your pick alone');
  // it's kept with the save
  await ev(()=>{ saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); });
  A(await ev(()=>JSON.stringify(G.player.xpPick)==='["fishing"]'), 'the pick is saved');
  // nothing ticked: the window stays away
  await ev(()=>{ xptToggle('fishing', false); renderXpTracker(); }); await page.waitForTimeout(200);
  A(await ev(()=>document.getElementById('xpTracker').style.display==='none'), 'nothing ticked: no XP window');
  console.log(JSON.stringify(rows));
};
