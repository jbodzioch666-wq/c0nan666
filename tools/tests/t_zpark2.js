// (probe, not in ALL) each scene build as you come back into a town from the land: what called it, whether the map and the grid key
// changed, who reset the map reference, and any siege staged on the way
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async shop=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } };
    const where = ()=>(new Error().stack||'').split(String.fromCharCode(10)).slice(2, 7).map(l=>l.trim().replace(/^at /, '').replace(/ \(.*$/, '')).join(' < ');
    const log = []; let lastMap = null, lastKey = null; const b0 = v3BuildScene;
    { let mr = V3.mapRef; Object.defineProperty(V3, 'mapRef', { get(){ return mr; }, set(v){ if (v!==mr) log.push({ mapRefSet:v===null ? 'null' : v===G.map ? 'G.map' : 'other', stack:where() }); mr = v; }, configurable:true }); }
    const st0 = siegeTownStage; siegeTownStage = function(){ log.push({ siegeStage:true, worldParent:!!(V3.world && V3.world.parent) }); return st0.apply(this, arguments); };
    v3BuildScene = function(){ const key = G.interior ? 'room' : v3GridKey(); const st = where();
      const t0 = performance.now(); const parkedBefore = !!V3.parked, fits = V3.parked ? v3ParkFits(V3.parked) : null; b0.apply(this, arguments);
      log.push({ build:Math.round(performance.now() - t0), sameMap:G.map===lastMap, sameKey:key===lastKey, parkedBefore, fits, stack:st }); lastMap = G.map; lastKey = key; };
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await fr(60);
    window.addEventListener('error', e=>log.push({ error:String(e.message).slice(0, 200), at:(e.filename||'') + ':' + e.lineno }));
    if (shop){ townClosedCheck = ()=>false; const key = (G.townVendors||[]).map(v=>v.key).find(k=>ROOM_LAYOUT[k]); for (let i=0;i<2;i++){ log.push('into the shop'); enterInterior(key); await fr(40); log.push('out of the shop'); exitInterior(); await fr(60); } return log; }
    for (let i=0;i<3;i++){ log.push('to the land'); G.gameMode = 0; G.villageNpcs = []; setUi('playing'); await fr(30); log.push('back into town'); enterVillage(); setUi('playing'); await fr(90); }
    return log; }, !!process.env.ZSHOP);
  for (const q of r) console.log(typeof q==='string' ? '## ' + q : JSON.stringify(q));
};
