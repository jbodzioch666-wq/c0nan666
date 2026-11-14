// probe: the town grid as text, for a town of each tier
module.exports = async page=>{
  const R = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){} saveCurrentGame = ()=>{};
    const out = [];
    for (const tier of [0, 1, 2]){ const t = townList().find(t=>townInfo(t.x, t.y).tier===tier); if (!t) continue; G.owPos = { x:t.x, y:t.y }; enterVillage();
      const ch = (x, y)=>{ const n = (G.villageNpcs||[]).find(n=>n.x===x && n.y===y); if (n) return 'N'; const t = G.map[x][y], d = G.villageDeco[x][y];
        if (t===T_FLOOR) return d==='path' ? '.' : d==='grass' ? ' ' : d==='range' ? ',' : d==='sand' ? ':' : d==='pier' ? '=' : '?';
        if (t===T_WALL){ if (d==='hedge') return '#'; if (d==='water') return '~'; if (/^building/.test(d)) return ({ buildingSmith:'S', buildingTavern:'T', buildingAlch:'A', buildingShop:'P', buildingTailor:'L', buildingBank:'B', buildingTannery:'K', buildingFletcher:'F', buildingPottery:'O', buildingJeweller:'J', buildingBarber:'R', buildingTemple:'M', buildingGuild:'G', buildingHouse:'h' })[d] || 'b'; return d==='tree' ? 't' : d==='lamp' ? 'l' : '*'; }
        return 'D'; };
      let s = `tier ${tier} ${COLS}x${ROWS} port:${townInfo().port}\n`; for (let y=0;y<ROWS;y++){ let r = ''; for (let x=0;x<COLS;x++) r += ch(x, y); s += r + '\n'; } out.push(s);
      G.gameMode = 0; }
    return out; });
  console.log(R.join('\n'));
};
