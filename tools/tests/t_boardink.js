// RS-316: the bounty board's parchment cards carry dark ink - rewards, difficulty, foe level, "legendary pick" and the progress
// bars all contrast with the cream paper instead of pale yellow on it. RS-317: so do the quest tracker's cards (a finished quest's
// name, and the arrow pointing the way)
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const lum = c=>{ const m = c.match(/[\d.]+/g).map(Number), f = v=>{ v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(m[0]) + 0.7152*f(m[1]) + 0.0722*f(m[2]); };
    const paper = lum('rgb(230,215,176)'), contrast = c=>(paper + 0.05)/(lum(c) + 0.05), out = { worst:99, n:0 };
    for (const tab of ['work', 'contracts', 'bounties']){ tkOpen('board', tab); renderOverlay(); await new Promise(r=>setTimeout(r, 100));
      for (const el of document.querySelectorAll('#overlay .qoffer .price, #overlay .qoffer .qsize b, #overlay .qoffer .qleg')){ const k = contrast(getComputedStyle(el).color); out.n++; if (k < out.worst){ out.worst = k; out.at = el.textContent.trim().slice(0, 30); } } }
    setUi('playing'); G.gameMode = 0; for (const q of G.questBoard.slice(0, 2)) acceptQuest(q.id); setUi('playing'); const q0 = G.player.quests[0]; q0.progress = q0.target;
    G.player.trackedQuest = (G.player.quests[1]||q0).id; G.player.grave = { x:G.owPos.x+5, y:G.owPos.y+2, items:[1], gold:5, place:'the open land' }; renderQuestTracker();
    out.qt = []; for (const el of document.querySelectorAll('#qtrack .qt-q:not(.qt-grave) .qt-n, #qtrack .qt-q:not(.qt-grave) .qt-o, #qtrack .qt-q:not(.qt-grave) .qt-d, #qtrack .qt-ar')){ const k = contrast(getComputedStyle(el).color); out.qt.push(+k.toFixed(1)); if (k < out.worst){ out.worst = k; out.at = 'tracker: ' + el.className; } }
    out.yellow = contrast(parchInk('#e8d040').replace(/hsl\((\d+),(\d+)%,(\d+)%\)/, (m, h, s, l)=>{ const d = document.createElement('i'); d.style.color = m; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }));
    return out; });
  console.log(JSON.stringify(r));
  if (!r.qt.length) throw new Error('found the tracker cards');
  if (!r.n) throw new Error('found the card texts to check');
  if (r.worst < 4.5) throw new Error('every reward, difficulty and level on the cards reads against the paper (4.5:1): '+JSON.stringify(r));
  if (r.yellow < 4.5) throw new Error('a yellow "Moderate" is inked dark enough: '+r.yellow);
};
