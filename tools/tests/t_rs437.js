// RS-437: the people on the road and a story quest's finds are there to be seen: someone turns up a few leagues off and waits - walk up
// to meet them (it sprang on you unseen); a skeleton with its note lies where it is, to be searched
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const out = {}, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }, e = G.ow.ev;
    // someone on the road: seen first, no dialog yet
    e.side = []; e.next.road = 0; const c0 = chn; chn = ()=>true; const fired = wevRoadRoll(); chn = c0;
    const s = e.side[0]; out.side = { fired, k:s && s.k, d:s ? +Math.hypot(s.x - G.owPos.x, s.y - G.owPos.y).toFixed(1) : -1, ui:G.ui };
    await frames(6); out.side.fig = !!(O3.side && s && O3.side.get(s.id) && O3.side.get(s.id).people.length);
    // walk up to them: the meeting
    if (s){ G.owPos = { x:s.x, y:s.y }; const met = wevRoadRoll(); out.side.met = met && G.ui==='wevent'; out.side.gone = !e.side.includes(s); setUi('playing'); }
    // a skeleton by the path, to be searched
    let b = null; for (let x=10;x<OW_COLS-10 && !b;x++) for (let y=10;y<OW_ROWS-10;y++) if (sqBonesAt(x, y)){ b = [x, y]; break; }
    if (b){ G.owPos = { x:b[0] - 2, y:b[1] }; await frames(6); const vis = (O3.finds && O3.finds.bones || []).filter(g=>g.visible && Math.floor(g.position.x)===b[0] && Math.floor(g.position.z)===b[1]).length;
      G.owPos = { x:b[0], y:b[1] }; const st = sqWorldStep(); out.bones = { shown:vis, search:st && G.ui==='wevent' && /skeleton/i.test(document.getElementById('overlay').innerHTML) }; setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.side.fired && r.side.k && r.side.d >= 3.5 && r.side.d <= 8 && r.side.ui==='playing', 'someone turns up a few leagues off - no dialog sprung on you');
  A(r.side.fig, 'and stands there to be seen');
  A(r.side.met && r.side.gone, 'walk up to them and you meet them');
  A(r.bones && r.bones.shown===1 && r.bones.search, 'a skeleton lies where you can see it, and you search it there');
};
