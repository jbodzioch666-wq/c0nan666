// RS-404: coming out of a grotto, a cave or a ruin - won, fled, or turned away at its mouth - you stand in front of it, not
// inside its rock
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } };
    const pois = (G.ow.pois||[]).filter(p=>['grotto','cave','ruin'].includes(p.k)); const poi = pois.find(p=>p.k==='grotto') || pois[0];
    if (!poi) return { none:true };
    const out = { k:poi.k }, off = ()=>!(G.owPos.x===poi.x && G.owPos.y===poi.y) && Math.max(Math.abs(G.owPos.x-poi.x), Math.abs(G.owPos.y-poi.y))===1 && o3Passable(G.owPos.x, G.owPos.y);
    // fled
    G.owPos = { x:poi.x, y:poi.y }; wgDelve(poi); out.inFight = G.gameMode===2 && G.wevFight && G.wevFight.kind==='delve';
    G.gameMode = 0; wevFrame(); out.fled = off(); out.fledAt = [G.owPos.x - poi.x, G.owPos.y - poi.y];
    // won
    G.owPos = { x:poi.x, y:poi.y }; wgDelve(poi); wgDelveWon(G.wevFight); out.won = off();
    // turned away at the mouth
    G.gameMode = 0; G.wevFight = null; delete wgState().done[poi.id]; G.owPos = { x:poi.x, y:poi.y }; wgStepOff(poi); out.notNow = off();
    // somewhere else, it doesn't move you
    const p0 = { x:G.owPos.x, y:G.owPos.y }; wgStepOff(poi); out.stays = G.owPos.x===p0.x && G.owPos.y===p0.y;
    G.ui = 'playing'; await fr(3);
    return out;
  });
  console.log(JSON.stringify(r));
  if (r.none) return;
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.inFight, 'the delve starts');
  A(r.fled && r.won && r.notNow, 'out of it you stand on the next tile, not in the model');
  A(r.stays, 'stepping off only moves you from the site itself');
};
