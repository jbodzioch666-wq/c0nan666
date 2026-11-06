// RS-335: clicking the hooded figure in a tavern walks you up to them and opens their talk (it used to walk you to the empty
// floor in front of them, as if they stood behind a counter); trees and rocks can be searched for on the world map
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {};
    // the world map: search for trees
    G.gameMode = 0; owReveal(G.owPos.x, G.owPos.y, 25); mapSearchIndex.c = null; mapForageIndex.c = null;
    G.mapQuery = 'oak'; const oak = mapSearchHits(); out.oak = oak.length; out.oakWhat = oak[0] && oak[0].what;
    G.mapQuery = 'tree'; out.trees = mapSearchHits().filter(h=>h.what==='tree').length;
    G.mapQuery = 'logs'; out.logs = mapSearchHits().filter(h=>h.what==='tree').length;
    G.mapQuery = '';
    // the hooded figure
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing');
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const n = G.villageNpcs.find(n=>n.service==='hooded'), p = V3.npcs.find(q=>q.n===n), act = p.sp.userData.act;
    out.act = [act.x - n.x, act.y - n.y];
    v3WalkTo(act); for (let i=0;i<120 && G.ui==='playing';i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    out.ui = G.ui; out.dlg = G.wevDlg && G.wevDlg.title;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.oak > 0 && r.oakWhat==='tree', 'oaks can be searched for');
  A(r.trees > 0 && r.logs > 0, 'so can "tree" and "logs"');
  A(r.act[0]===0 && r.act[1]===0, 'the hooded figure is clicked where they stand');
  A(r.ui!=='playing', 'clicking them walks you up and opens their talk');
  console.log('rs335 ok', JSON.stringify(r));
};
