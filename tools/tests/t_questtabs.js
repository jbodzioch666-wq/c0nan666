// RS-330: the quests tab of the side window has three tabs - Active (what you're doing now), Journal (the story quests by
// state, click one for its log) and Tasks (Slayer, each contract and bounty with its progress)
module.exports = async page=>{
  const shot = async nm=>{ if (process.env.SHOT_DIR){ const b = await (await page.$('#sidePanel')).boundingBox(); await page.screenshot({ path:process.env.SHOT_DIR+'/'+nm+'.png', clip:b }); } };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    tkP(); SP.open = true; SP.tab = 'quests'; SP.qTab = null; hudLayout();
    const sp = ()=>document.getElementById('sidePanel'), out = {};
    out.tabs = [...sp().querySelectorAll('[data-sp-qtab]')].map(b=>b.textContent);
    out.activeOn = !!sp().querySelector('[data-sp-qtab="now"].on');
    sp().querySelector('[data-sp-qtab="journal"]').click(); await new Promise(r=>setTimeout(r, 50));
    out.jq = sp().querySelectorAll('[data-sp-jq]').length; out.jText = /YOU CAN START|NOT YET/.test(sp().innerText); out.jFull = /open the full journal/.test(sp().innerText);
    const first = sp().querySelector('[data-sp-jq]'); first.click(); await new Promise(r=>setTimeout(r, 50)); out.jOpen = !!sp().querySelector('.sp-qlog');
    sp().querySelector('[data-sp-qtab="tasks"]').click(); await new Promise(r=>setTimeout(r, 50));
    const t = sp().innerText; out.tSlayer = /SLAYER/.test(t); out.tContracts = /CONTRACTS/.test(t); out.tBounties = /BOUNTIES/.test(t);
    const P = tkP(); out.nTasks = P.contracts.daily.length + P.contracts.weekly.length + P.bounties.list.length;
    out.tRows = sp().querySelectorAll('.sp-q').length;
    return out; });
  await shot('qtabs-tasks');
  await page.evaluate(()=>{ SP.qTab = 'journal'; hudLayout(); }); await shot('qtabs-journal');
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.tabs.join()==='Active,Journal,Tasks' && r.activeOn, 'three tabs, Active first');
  A(r.jq > 5 && r.jText && r.jFull, 'the journal tab lists the story quests');
  A(r.jOpen, 'clicking a quest opens its details');
  A(r.tSlayer && r.tContracts && r.tBounties, 'the tasks tab: Slayer, contracts and bounties');
  A(r.tRows >= 1 + r.nTasks, 'each contract and bounty has its own row');
  console.log('questtabs ok', JSON.stringify(r));
};
