// RS-448: any part of a shopkeeper's counter opens the shop - click its left, middle or right and you walk up and are served
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; trackVisitedTown(t.x, t.y); setUi('playing'); enterVillage(); setUi('playing');
    const out = {};
    for (const key of ['shop', 'alch', 'smith']){ enterInterior(key); setUi('playing'); for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
      const hits = V3.hits.filter(h=>h.isMesh && h.userData.act && h.userData.act.kind==='tile' && h.userData.act.y===6 && G.map[h.userData.act.x][6]===T_COUNTER && h.geometry.type==='BoxGeometry'), opened = [];
      for (const h of hits){ G.player.x = 7; G.player.y = 9; setUi('playing'); V3.path = []; v3WalkTo(h.userData.act);
        for (let s=0; s<40 && G.ui==='playing' && V3.path && V3.path.length; s++){ const [dx, dy] = V3.path.shift(); moveDir(dx, dy); }
        opened.push(G.ui); setUi('playing'); }
      out[key] = { parts:hits.length, opened, want:G.villageNpcs[0] && G.villageNpcs[0].service }; exitInterior(); setUi('playing'); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k in r){ A(r[k].parts >= 3, k + ': the whole counter can be clicked (its three parts, and the shopkeeper)'); A(r[k].opened.every(u=>u===r[k].want), k + ': each part of it opens the shop'); }
};
