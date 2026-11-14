// RS-161: standing on your campfire with trees or rocks in reach, E asks what to do - and cooking is first on the list
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; o3Pref = false;
    let spot = null;
    for (let x=2; x<OW_COLS-2 && !spot; x++) for (let y=2; y<OW_ROWS-2; y++){ const n = skNodeAt(x, y); if (!n || n.k==='fishing' || n.k==='runecrafting') continue;
      for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const t = G.ow.map[x+dx][y+dy]; if ((t===OW_GRASS || t===OW_FOREST || t===OW_DESERT) && !skNodeAt(x+dx, y+dy)){ spot = { x:x+dx, y:y+dy }; break; } } if (spot) break; }
    if (!spot) return { none:true };
    G.owPos = { x:spot.x, y:spot.y }; skAdd(SK_FISH[0].id, 3); skP().fire = { x:spot.x, y:spot.y, until:(G.player.turnCount||0) + 200 };
    const opts = skOptions().map(o=>o.k);
    skStartOrStop();
    const menu = document.getElementById('ctxMenu'), items = menu ? [...menu.querySelectorAll('.cm-o')].map(e=>e.textContent) : [];
    const cook = menu ? [...menu.querySelectorAll('.cm-o')].find(e=>/Cook/.test(e.textContent)) : null; if (cook) cook.click();
    const ui = G.ui; setUi('playing');
    // just the fire in reach: E goes straight to cooking
    G.owPos = { x:spot.x, y:spot.y }; const only = skOptions().filter(o=>o.k==='cooking');
    // RS-162: right beside the fire counts too - the cook option is there from any of the 8 tiles round it, and gone two away
    const besides = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]].map(([dx,dy])=>{ G.owPos = { x:spot.x+dx, y:spot.y+dy }; return skOptions()[0] && skOptions()[0].k==='cooking'; });
    G.owPos = { x:spot.x+2, y:spot.y }; const far = skOptions().some(o=>o.k==='cooking'); G.owPos = { x:spot.x, y:spot.y };
    return { besides, far, opts, open:!!(menu && CTX.open !== undefined), items, ui, only:only.length };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none, 'a resource node with open ground beside it');
  A(r.opts[0]==='cooking' && r.opts.length > 1, 'the fire you stand on is the first option, with the resources after it');
  A(r.items.some(t=>/Cook at the fire/.test(t)) && r.items.length >= 3, 'E asks what to do');
  A(r.ui==='cook', 'choosing cooking opens the cooking screen');
  A(r.besides.every(Boolean) && !r.far, 'you can cook from right beside the fire, not from two tiles away');
};
