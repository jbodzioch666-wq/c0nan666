// RS-746: property bought from the estate agent is kept through a save, a page reload and a load, and every agent lists what you own
// in the other towns; a record whose town has moved goes to the nearest town. The Release box stands high on the screen.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const p = G.player; p.gold = 1e6; p.clock = p.turnCount = 60*12; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    const n = G.villageNpcs.find(o=>o.service==='estate'); p.x = n.x; p.y = n.y + 1; moveDir(0, -1); const ui = G.ui;
    const btn = [...document.querySelectorAll('#overlay button')].find(b=>/ecoBuyProp\('stall'\)/.test(b.getAttribute('onclick')||'')); if (btn) btn.click();
    const out = { ui, btn:!!btn, n:ecoPropCount(), saveId:G.saveId, key:townInfo().key, yours:/yours/.test(document.getElementById('overlay').innerHTML) };
    /* a record left at a place where no town stands now */
    const far = townList().find(t=>t.x!==G.owPos.x || t.y!==G.owPos.y); townRec((far.x + 1) + ',' + (far.y + 1)).prop = { rooms:1 }; out.far = far.x + ',' + far.y;
    setUi('playing'); saveCurrentGame(); return out; });
  console.log(JSON.stringify(r0));
  await page.reload(); await page.waitForTimeout(3000);
  const r1 = await ev(async a=>{ loadGame(a.saveId); setUi('playing'); const t = G.ow.wg.towns, out = { n:ecoPropCount(), home:!!(t[a.key].prop||{}).stall, moved:!!((t[a.far]||{}).prop||{}).rooms };
    const [fx, fy] = a.far.split(',').map(Number); out.orphan = !!(t[(fx+1)+','+(fy+1)] && t[(fx+1)+','+(fy+1)].prop);
    /* another town's agent lists the stall back home */
    const other = townList().find(q=>q.x+','+q.y!==a.key && q.x+','+q.y!==a.far); G.gameMode = 0; G.owPos = { x:other.x, y:other.y }; enterVillage(); setUi('estate');
    const html = document.getElementById('overlay').innerHTML; out.list = /YOUR PROPERTY IN OTHER TOWNS/.test(html) && /a market stall/.test(html) && /rooms over the tavern/.test(html);
    /* the Release box */
    setUi('playing'); for (const m of G.mon||[]) m.alive = 0; G.player.hp = 0; playerDies('a goblin');
    for (let i=0;i<50;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const b = document.querySelector('#downBox .dbx'), rc = b && b.getBoundingClientRect(); out.boxTop = rc ? Math.round(rc.top/innerHeight*100) : -1; out.boxBot = rc ? Math.round(rc.bottom/innerHeight*100) : -1;
    return out; }, r0);
  await page.screenshot({ path:SHOTS + '/rs746_release.png' });
  console.log(JSON.stringify(r1));
  A(r0.ui==='estate' && r0.btn && r0.n===1 && r0.yours, 'bought a stall from the agent: ' + JSON.stringify(r0));
  A(r1.home && r1.moved && !r1.orphan && r1.n===2, 'kept through a reload, and a moved town\'s record rehomed: ' + JSON.stringify(r1));
  A(r1.list, 'another agent lists the property: ' + JSON.stringify(r1));
  A(r1.boxTop >= 5 && r1.boxBot <= 45, 'the Release box stands high: ' + JSON.stringify(r1));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
