// RS-382: the hooded figure sits in the tavern's corner chair by the bookshelf, a table before him; and a game saved in a
// town loads in that town, while one saved out on the land loads on the land
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    const out = {};
    enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing'); await frames(20);
    const h = G.villageNpcs.find(n=>n.service==='hooded'), L = ROOM_LAYOUT.tavern.benches;
    out.at = h && [h.x, h.y]; out.chair = L.some(b=>b[0]==='chair' && b[1]===6 && b[2]===10); out.books = L.some(b=>b[0]==='books' && b[1]===5 && b[2]===9);
    out.table = L.some(b=>b[0]==='table' && b[1]===6 && b[2]===11); out.vendor = tileAt(6, 10)===T_VENDOR;
    const p3 = (V3.npcs||[]).find(p=>p.n && p.n.service==='hooded'); out.model = !!p3;
    if (p3){ const hips = p3.e.rig.hips, y = hips.getWorldPosition(new THREE.Vector3()).y - p3.g.position.y; out.hipY = +y.toFixed(2); out.seated = !!p3.n.seat; }
    G.sqSeen = {}; G.player.sqSeen = {}; G.sqDeclined = null; villageInteract(6, 10); out.talk = G.ui; setUi('playing');
    // the login
    G.interior = null; enterVillage(); setUi('playing'); saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id;
    loadGame(id); out.loadTown = G.gameMode===3;
    G.gameMode = 0; setUi('playing'); saveCurrentGame(); loadGame(id); out.loadLand = G.gameMode===0;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.at && r.at[0]===6 && r.at[1]===10 && r.chair && r.books && r.table && r.vendor, 'the hooded figure is in the corner chair by the bookshelf, a table before him');
  A(r.model && r.seated, 'he is drawn sat in it');
  A(r.talk && r.talk!=='playing', 'and you can still talk to him there');
  A(r.loadTown, 'a game saved in a town loads in the town');
  A(r.loadLand, 'a game saved on the land loads on the land');
};
