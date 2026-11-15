// RS-584: lakes are fresh water. A body of water that doesn't reach the world's edge and isn't sea-sized is a lake: its fishing spots
// are lake spots with river fish (trout, pike, salmon, dawn trout at dawn), never sea fish; it has no deep-sea spots, no surf and no
// gulls, only a soft lapping. The sea keeps its own. And the bar at the top says what land you're in, after the time
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = {}, W = OW_COLS, H = OW_ROWS, m = G.ow.map, wk = owWaterKind();
    let sea = 0, lake = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++) if (m[x][y]===OW_WATER){ if (wk[y*W+x]===2) lake++; else sea++; }
    out.water = { sea, lake, edgeSea:[0, W-1].some(x=>[...Array(H).keys()].some(y=>m[x][y]===OW_WATER && wk[y*W+x]===1)) || [...Array(W).keys()].some(x=>[0, H-1].some(y=>m[x][y]===OW_WATER && wk[y*W+x]===1)) };
    /* no lake in this world? make one: a pond dug in open grass, well away from any water */
    let pond = null; if (!lake){ for (let x=8;x<W-8 && !pond;x++) for (let y=8;y<H-8 && !pond;y++){ let ok = true; for (let i=-4;i<=4 && ok;i++) for (let j=-4;j<=4 && ok;j++) if (m[x+i][y+j]!==OW_GRASS) ok = false; if (ok) pond = [x, y]; }
      if (pond){ for (let i=-1;i<=1;i++) for (let j=-1;j<=1;j++) m[pond[0]+i][pond[1]+j] = OW_WATER; G.ow._wk = null; out.dug = pond; } }
    const wk2 = owWaterKind(); const lakes = [], seas = []; for (let x=1;x<W-1;x++) for (let y=1;y<H-1;y++) if (m[x][y]===OW_WATER){ (wk2[y*W+x]===2 ? lakes : seas).push([x, y]); }
    out.lakeTiles = lakes.length;
    /* every lake tile: a lake spot or an ice hole, never shore, deep or pearl; and the fish on offer all fresh */
    const types = {}, fish = new Set(); for (const [x, y] of lakes){ const n = skNodeAt(x, y); const k = n ? n.k + ':' + n.type : 'none'; types[k] = (types[k]||0) + 1; if (n && n.k==='fishing') for (const f of SK_SPOT[n.type].fish) fish.add(f); }
    out.lakeTypes = types; out.lakeFish = [...fish];
    const stypes = {}; for (const [x, y] of seas.slice(0, 4000)){ const n = skNodeAt(x, y); if (n && n.k==='fishing') stypes[n.type] = (stypes[n.type]||0) + 1; } out.seaTypes = stypes;
    out.spot = SK_SPOT.lake && { nm:SK_SPOT.lake.nm, fish:SK_SPOT.lake.fish };
    /* the sound: by a lake no surf, by the sea surf */
    const L = lakes[Math.floor(lakes.length/2)], S = seas.find(([x, y])=>skWithin(x, y, 1, [OW_GRASS, OW_FOREST, OW_DESERT]));
    const stand = (x, y)=>{ G.gameMode = 0; G.owPos = { x, y }; };
    if (L){ stand(L[0], L[1]); out.lakeSound = { surf:audNearWater(), lap:audNearLake(), bar:clockBarText() }; }
    if (S){ stand(S[0], S[1]); out.seaSound = { surf:audNearWater(), bar:clockBarText() }; }
    /* the bar: the land after the time - in grass, in a forest, in a town */
    const find = t=>{ for (let x=2;x<W-2;x++) for (let y=2;y<H-2;y++) if (m[x][y]===t) return [x, y]; return null; };
    const g = find(OW_GRASS), f = find(OW_FOREST); if (g){ stand(g[0], g[1]); out.grassBar = clockBarText(); } if (f){ stand(f[0], f[1]); out.forestBar = clockBarText(); }
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); out.townBar = clockBarText(); out.townBiome = clockBiome();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.water.sea > 0 && r.water.edgeSea, 'the sea reaches the edge of the world');
  A(r.lakeTiles > 0, 'there is a lake (found or dug)');
  A(Object.keys(r.lakeTypes).every(k=>/^(fishing:lake|fishing:ice|none)$/.test(k)) && (r.lakeTypes['fishing:lake']||0) + (r.lakeTypes['fishing:ice']||0) > 0, 'a lake has lake spots (or ice holes), never sea ones: ' + JSON.stringify(r.lakeTypes));
  A(r.lakeFish.length && r.lakeFish.every(id=>['trout','pike','salmon','icefish'].includes(id)), 'and only fresh-water fish: ' + r.lakeFish);
  A(!r.seaTypes.lake && (r.seaTypes.shore||0) > 0, 'the sea keeps its shore spots: ' + JSON.stringify(r.seaTypes));
  A(r.lakeSound && !r.lakeSound.surf && r.lakeSound.lap, 'no surf by a lake, a soft lapping: ' + JSON.stringify(r.lakeSound));
  A(r.seaSound && r.seaSound.surf, 'the surf by the sea');
  A(/ · lake$/.test(r.lakeSound.bar) && / · sea$/.test(r.seaSound.bar), 'the bar says lake or sea: ' + r.lakeSound.bar + ' / ' + r.seaSound.bar);
  A(/ · grassland$/.test(r.grassBar) && / · forest$/.test(r.forestBar), 'the bar says the land after the time: ' + r.grassBar + ' / ' + r.forestBar);
  A(r.townBiome && r.townBar.endsWith(' · ' + r.townBiome), 'and in a town, the country round it: ' + r.townBar);
};
