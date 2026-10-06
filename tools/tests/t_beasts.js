// RS-173: the world's giant and the mythic beasts stand on the land as their own 3D creatures, walking from tile to tile;
// mythic beasts roam round their lairs as the giant does, and where they've wandered to is kept in the save
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    const out = {}, alive = ()=>(G.ow.mythicBeasts||[]).filter(b=>!b.slain);
    const b0 = alive()[0]; if (!b0) return { none:true };
    const home = [b0.hx, b0.hy];
    // they roam: over many turns each one moves, but never far from its lair, and never onto water or a site
    const seen = new Set(); let far = 0, bad = 0;
    for (let t=0;t<200;t++){ G.player.turnCount = (G.player.turnCount||0) + 1; mythicWander(G.player.turnCount);
      for (const b of alive()){ seen.add(b.i+':'+b.x+','+b.y); far = Math.max(far, Math.abs(b.x-b.hx), Math.abs(b.y-b.hy)); const tl = G.ow.map[b.x][b.y]; if (tl===OW_WATER || tl===OW_RIVER || OW_SITE_TILES.includes(tl)) bad++; } }
    out.roam = { spots:seen.size, far, bad, moved:b0.x!==home[0] || b0.y!==home[1] };
    // where they are is saved and comes back on load
    const at = alive().map(b=>[b.i, b.x, b.y]);
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing'); G.gameMode = 0;
    out.kept = at.every(([i, x, y])=>{ const b = G.ow.mythicBeasts.find(o=>o.i===i); return b && b.x===x && b.y===y; });
    out.homeKept = alive().every(b=>b.hx!=null);
    // on the map: wake the giant beside you, stand by a beast, and draw the land
    const b = alive()[0]; G.owPos = { x:b.x + 2, y:b.y };
    const ev = G.ow.ev || wevP(); ev.boss = ev.boss || { g:0, state:'sleep', until:0 }; Object.assign(ev.boss, { state:'awake', x:b.x - 2, y:b.y, hx:b.x - 2, hy:b.y, until:(G.player.turnCount||0) + 300 });
    for (let i=0;i<6;i++){ renderGame(); try{ o3Render(); }catch(err){} await new Promise(r=>setTimeout(r, 60)); }
    const F = O3.beasts || new Map(), fb = F.get('myth'+b.i), fg = F.get('boss'+ev.boss.g);
    let bossSprites = 0; const icon = O3.tex && O3.tex['wboss'+ev.boss.g]; if (O3.evGrp) O3.evGrp.traverse(o=>{ if (o.isSprite && icon && o.material.map===icon) bossSprites++; });
    out.map = { o3:o3Active(), beast:!!fb, giant:!!fg, giantMeshes:fg ? (()=>{ let n = 0; fg.e.holder.traverse(o=>{ if (o.isMesh) n++; }); return n; })() : 0, bossSprites };
    // it walks to its next tile rather than hopping there
    if (fb){ const x0 = fb.x; b.x += 1; O3.t += 0.1; o3SyncBeasts(0.1); out.walk = { step:+(fb.x - x0).toFixed(2), mv:+(fb.e.mvS||0).toFixed(2) }; for (let i=0;i<40;i++) o3SyncBeasts(0.05); out.walk.arrived = Math.abs(fb.x - (b.x+0.5)) < 0.01; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none, 'the world has a mythic beast');
  A(r.roam.moved && r.roam.spots > 6 && r.roam.far <= 8 && r.roam.bad===0, 'mythic beasts roam round their lairs, never far and never onto water or a site');
  A(r.kept && r.homeKept, 'where they have wandered to is kept in the save');
  if (r.map.o3){
    A(r.map.beast && r.map.giant && r.map.giantMeshes > 5 && r.map.bossSprites===0, 'the giant and the beast stand on the map as 3D creatures, not icons');
    A(r.walk && r.walk.step > 0 && r.walk.step < 0.5 && r.walk.mv > 0 && r.walk.arrived, 'a beast walks to its next tile instead of hopping there');
  }
};
