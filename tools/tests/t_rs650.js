// RS-650: the bar at the top names the rarer lands painted over the ground (a haunted forest, a jungle, volcanic land, snowy highlands, a
// crystal waste) - it said the ground under them, "grassland" in the dark of a haunted wood; the plain ground, the sea and a lake keep their names
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const out = { tiers:{} };
    for (const tier of ['medium', 'planet']){ goToCharCreate(); ccBegin(); setWorldSizeTier(tier); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; await fr(30);
      const m = G.ow.map, land = [OW_GRASS, OW_FOREST, OW_DESERT, OW_SWAMP, OW_TUNDRA], o = { bio:{}, plain:null, water:null };
      const say = (x, y)=>{ G.owPos = { x, y }; G._bioK = null; return clockBiome(); };
      for (let x=0; x<OW_COLS; x++) for (let y=0; y<OW_ROWS; y++){ const t = m[x][y], bv = wgBioAt(x, y);
        if (land.includes(t) && bv && BIO[bv] && !o.bio[BIO[bv].id]) o.bio[BIO[bv].id] = { want:BIO[bv].nm, got:say(x, y), base:OW_BIOME_NM[t] };
        else if (!o.plain && t===OW_GRASS && !bv) o.plain = say(x, y);
        else if (!o.water && t===OW_WATER && bv) o.water = say(x, y); }
      o.bar = (G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }, G._bioK = null, clockBarText()).slice(-40);
      out.tiers[tier] = o; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  let n = 0;
  for (const [tier, o] of Object.entries(r.tiers)){
    for (const [id, b] of Object.entries(o.bio)){ n++; A(b.got===b.want, tier + ': in ' + id + ' the bar says ' + b.want + ', not the ground under it'); }
    A(o.plain==='grassland', tier + ': plain grass is still grassland');
    if (o.water) A(o.water==='sea' || o.water==='lake', tier + ': the water is still the sea or a lake'); }
  A(n >= 3, 'some of the rarer lands found to stand in');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
