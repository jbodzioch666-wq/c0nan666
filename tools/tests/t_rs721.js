// RS-721: a click on the game view outside a menu closes the menu, as Escape would, and goes no further (you don't walk there); a click
// inside the menu leaves it open; the title screen isn't closed by a click. The glassblower has nothing to sell, so no menu: a word in
// the log instead
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const outside = ()=>ev(()=>{ for (let y=120; y<innerHeight-120; y+=37) for (let x=40; x<innerWidth-40; x+=41){ const t = document.elementFromPoint(x, y); if (ovGameView(t)) return [x, y]; } return null; });
  const click = async xy=>{ await page.mouse.click(xy[0], xy[1]); await page.waitForTimeout(250); };
  /* the title screen stays */
  const t0 = await ev(()=>G.ui); const tp = await outside(); if (tp) await click(tp); const t1 = await ev(()=>G.ui);
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; const city = townList().find(t=>townInfo(t.x, t.y).tier >= 1); if (!city) return { none:true };
    G.owPos = { x:city.x, y:city.y }; enterVillage(); setUi('playing'); for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    return { at:[p.x, p.y] }; });
  if (r0.none){ console.log('no village - skipped'); return; }
  const out = {};
  /* a shop: a click inside stays open, a click outside closes it, and you stay put */
  await ev(()=>setUi('shop')); const box = await ev(()=>{ const r = document.getElementById('overlay').getBoundingClientRect(); return [r.left + r.width/2, r.top + 30]; });
  await click(box); out.inside = await ev(()=>G.ui);
  let xy = await outside(); out.pt = xy; await click(xy); await page.waitForTimeout(600);
  out.shop = await ev(()=>({ ui:G.ui, at:[G.player.x, G.player.y], path:(V3.path||[]).length }));
  /* the bag (a floating book) and a crafting bench */
  await ev(()=>setUi('inventory')); xy = await outside(); await click(xy); out.inv = await ev(()=>G.ui);
  await ev(()=>{ enterInterior('tailor'); G.bench = 'loom'; setUi('bench'); }); xy = await outside(); await click(xy); out.bench = await ev(()=>G.ui);
  /* the glassblower: no menu, a word */
  out.potter = await ev(()=>{ exitInterior(); enterInterior('pottery'); const n = (document.getElementById('log')||document.body).textContent.length; villageInteract(10, 5); const u = G.ui; exitInterior(); return { ui:u, said:/kiln/.test((document.getElementById('log')||document.body).textContent) }; });
  console.log(JSON.stringify({ t0, t1, r0, out }));
  A(t0==='titleScreen' && t1==='titleScreen', 'a click on the title screen leaves it');
  A(out.inside==='shop', 'a click inside the menu leaves it open');
  A(out.pt && out.shop.ui==='playing', 'a click outside the shop closes it: ' + JSON.stringify(out.shop));
  A(out.shop.at[0]===r0.at[0] && out.shop.at[1]===r0.at[1] && !out.shop.path, 'and goes no further - you stay where you were');
  A(out.inv==='playing' && out.bench==='playing', 'the bag and a bench close the same way: ' + out.inv + ' ' + out.bench);
  A(out.potter.ui==='playing' && out.potter.said, 'the glassblower: no menu, a word in the log');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
