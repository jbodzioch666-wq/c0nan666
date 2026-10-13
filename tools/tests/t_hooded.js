// RS-325: the Thieves' Guild's work comes from a hooded figure in the tavern's corner, not the tavernkeeper
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}; enterVillage(); setUi('playing'); enterInterior('tavern'); setUi('playing');
    for (let i=0;i<20;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const h = G.villageNpcs.find(n=>n.service==='hooded'); out.there = !!h && tileAt(h.x, h.y)===T_VENDOR && G.map[h.x][h.y+1]!==T_WALL;
    out.model = !!(V3.npcs||[]).find(p=>p.n && p.n.service==='hooded');
    out.givers = ['thief1','thief2','thief3'].map(id=>SQ[id].giver);
    // the tavernkeeper doesn't offer it
    G.player.sqSeen = {}; G.sqDeclined = null; G.sqOffered = null; sqP()['rats'] = { state:'done' };
    setUi('tavern'); out.keeper = /Thieves/.test(document.getElementById('overlay').textContent) || (G.sqOffered||'').startsWith('thief'); G.sqOffered = null; setUi('playing');
    // the hooded figure does
    G.player.sqSeen = {}; G.sqDeclined = null; villageInteract(h.x, h.y); out.offer = G.sqOffered; out.ui = G.ui;
    return out; });
  await page.evaluate(async ()=>{ G.sqOffered = null; setUi('playing'); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/hooded.png', timeout:150000 });   /* (software rendering on a loaded machine can take over half a minute) */
  console.log(JSON.stringify(r));
  if (!r.there || !r.model) throw new Error('a hooded figure stands in the tavern '+JSON.stringify(r));
  if (r.givers.some(g=>g!=='hooded')) throw new Error('the thieves\' quests are the hooded figure\'s');
  if (r.keeper) throw new Error('the tavernkeeper no longer offers them');
  if (r.offer!=='thief1') throw new Error('the hooded figure offers the first one '+JSON.stringify(r));
};
