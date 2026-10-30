// RS-322: taking a ferry is a voyage, not a jump - your boat sails out from the landing over open water to the far one, the
// camera following, and you come ashore there; nothing you press steers it on the way; it costs the time it always did
module.exports = async page=>{
  const r0 = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    for (let k=0; k<6 && !(G.ow.ferries||[]).length; k++) setContinentType(k%2 ? 'continents' : 'archipelago');
    const poi = (G.ow.pois||[]).filter(p=>p.k==='ferry').sort((a,b)=>G.ow.ferries[b.ferry].d - G.ow.ferries[a.ferry].d)[0]; if (!poi) return { none:true };   /* (the longest crossing) */
    const f = G.ow.ferries[poi.ferry], to = poi.end==='a' ? f.b : f.a;
    G.owPos = { x:poi.x, y:poi.y }; O3.win = null; G.player.gold = 9999;
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    window.__fr = { poi, to, f, t0:G.player.turnCount||0, from:[poi.x, poi.y] };
    ferrySail(poi, to, f);
    return { from:[poi.x, poi.y], to, d:f.d, route:G.owFerry && G.owFerry.route.length, active:!!G.owFerry, saved:G.player.ferryTo };
  });
  if (r0.none){ console.log('no ferry in these worlds - skipped'); return; }
  const seen = { water:0, boat:0, steps:new Set(), blocked:null };
  let shot = false;
  for (let k=0; k<600; k++){
    const s = await page.evaluate(()=>{ renderGame(); const w = G.ow.map[G.owPos.x][G.owPos.y]===OW_WATER;
      return { on:!!G.owFerry, w, boat:!!(O3.boat && O3.boat.visible), at:G.owPos.x+','+G.owPos.y }; });
    if (s.w) seen.water++; if (s.boat) seen.boat++; seen.steps.add(s.at);
    if (seen.water===6 && seen.blocked===null){ seen.blocked = await page.evaluate(()=>{ const a = G.owPos.x+','+G.owPos.y; tryMoveOverworld(1, 0); return G.owPos.x+','+G.owPos.y===a && !!G.owFerry; }); }
    if (!shot && seen.water >= 10){ shot = true; await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/ferry.png' }); }
    if (!s.on) break;
    await page.waitForTimeout(30);
  }
  const end = await page.evaluate(()=>({ at:[G.owPos.x, G.owPos.y], on:!!G.owFerry, dt:(G.player.turnCount||0) - window.__fr.t0, saved:G.player.ferryTo, step:G.stepLen }));
  console.log(JSON.stringify({ r0, water:seen.water, boat:seen.boat, tiles:seen.steps.size, blocked:seen.blocked, end }));
  if (!r0.active || !r0.route || !r0.saved) throw new Error('the voyage starts '+JSON.stringify(r0));
  if (seen.water < 3 || seen.boat < 3 || seen.steps.size < 4) throw new Error('you sail across the water in your boat '+JSON.stringify({ water:seen.water, boat:seen.boat, tiles:seen.steps.size }));
  if (seen.blocked===false) throw new Error('a key press does not steer the ferry');
  if (end.on || end.at.join()!==r0.to.join()) throw new Error('you come ashore at the far landing '+JSON.stringify(end));
  if (end.dt !== Math.ceil(r0.d/2) || end.saved || end.step!==1) throw new Error('it costs the same time as before, and leaves nothing behind '+JSON.stringify(end));
};
