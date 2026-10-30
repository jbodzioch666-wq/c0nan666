// RS-603: making "all" says how many - the cooking card read "0 / all"; now "0 / 7" for seven raw shrimp, and the same for what's queued after
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const f = SK_FISH[0], g = SK_FISH[1]; skAdd(f.id, 7 - skHave(f.id)); skAdd(g.id, 4 - skHave(g.id)); G.cookAt = 'fire'; skP().fire = { x:G.owPos.x, y:G.owPos.y, until:(G.player.turnCount||0) + 500 }; setUi('cook');
    cqAdd('cook', f.id, '', 9999); cqAdd('cook', g.id, '', 9999); const h = cqHtml(); cqStop(); setUi('playing');
    const txt = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); return { txt, f:f.id, g:g.id }; });
  console.log(JSON.stringify(r));
  if (!/0 \/ 7/.test(r.txt) || /\ball\b/.test(r.txt) || !/then 4 /.test(r.txt)) throw new Error('assert: the card counts what it makes: ' + r.txt);
  if (errs.length) throw new Error('errors: ' + errs.join(' | '));
};
