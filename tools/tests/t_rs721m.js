// RS-721 on a phone: a tap on the game view outside a menu (the strip above the panel) closes it, and the tap goes no further
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } setUi('shop'); return { at:[p.x, p.y] }; });
  const xy = await ev(()=>{ for (let y=innerHeight-10; y>5; y-=11) for (let x=20; x<innerWidth-20; x+=19){ const t = document.elementFromPoint(x, y); if (ovGameView(t)) return [x, y]; } return null; });
  if (xy){ await page.touchscreen.tap(xy[0], xy[1]); await page.waitForTimeout(800); }
  const r1 = await ev(()=>({ ui:G.ui, at:[G.player.x, G.player.y], path:(V3.path||[]).length }));
  console.log(JSON.stringify({ r0, xy, r1 }));
  A(xy, 'some of the game view shows round the menu');
  A(r1.ui==='playing', 'a tap outside the shop closes it: ' + JSON.stringify(r1));
  A(r1.at[0]===r0.at[0] && r1.at[1]===r0.at[1] && !r1.path, 'and you stay where you were');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
module.exports.mobile = true;
