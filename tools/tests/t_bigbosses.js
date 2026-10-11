// RS-340/341: the mythic beasts and the world bosses (the waking giants) are level 126, and big - sized by what they are,
// not by their own names, and bigger than the ordinary run of their kind
module.exports = async page=>{
  const shot = async nm=>{ if (process.env.SHOT_DIR) await page.screenshot({ path:process.env.SHOT_DIR+'/'+nm+'.png', timeout:180000 }); };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {};
    G.gameMode = 0; const ev = G.ow.ev || wevP(); ev.boss = ev.boss || { g:0, state:'sleep', until:0 }; const b = ev.boss; out.hasBoss = !!b;
    if (b){ Object.assign(b, { state:'awake', x:G.owPos.x, y:G.owPos.y, hp:0, maxHp:0 }); wevBossFight(b); setUi('playing');
      const m = G.mon.find(q=>q.worldBoss); out.boss = { cb:m.cb, size:monSizeK(m), nm:m.nm };
      out.tip = /126/.test(wevTipHtml(wevMapList().find(o=>o.k==='boss') || { k:'boss' }));
      G.mon = [m]; m.x = G.player.x - 1; m.y = G.player.y - 3; for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 70)); } }
    out.mythic = mythicLevel();
    const drag = { nm:'Vorath the Ashbound', baseNm:'ancient dragon', mythicBeastIdx:0 }; out.mythSize = monSizeK(drag);
    out.plainDragon = monSizeK({ nm:'blue dragon' }); out.troll = monSizeK({ nm:'troll' });
    return out; });
  console.log(JSON.stringify(r));
  await shot('worldboss');
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.hasBoss, 'the world has a giant');
  A(r.boss.cb===126 && r.tip, 'the world boss is level 126, and its map tip says so');
  A(r.boss.size >= 2.9, 'the world boss is sized bigger than any giant');
  A(r.mythic===126, 'mythic beasts are level 126');
  A(r.mythSize > r.plainDragon && r.plainDragon >= 2.5 && r.troll < 2, 'a named mythic dragon is sized as a dragon, and bigger than a plain one');
  console.log('bigbosses ok', JSON.stringify(r));
};
