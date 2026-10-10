// RS-315: a search box on the world map finds named things you've discovered (towns, sites, landmarks, places...) by name or
// kind, rings them on the map and lists them to jump to; nothing you haven't discovered is found. Also: a wandering merchant
// is settled as one when its group first shows, walks the land as a merchant figure under a green purse sign, and meeting it
// opens the merchant, never a fight
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const out = {};
    owReveal(G.owPos.x, G.owPos.y, 30); for (let i=0;i<3;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    // a town you've seen and one you haven't
    const towns = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_TOWN) towns.push({ x, y, nm:o3TownName(x, y) });
    const seen = towns.find(t=>owSeen(t.x, t.y)), unseen = towns.find(t=>!owSeen(t.x, t.y) && t.nm.slice(0, 5)!==seen.nm.slice(0, 5));
    out.have = { seen:!!seen, unseen:!!unseen };
    toggleOwZoom(); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    out.box = !!document.getElementById('mapSearch');
    mapSearchSet(seen.nm.slice(0, 5)); out.found = mapSearchHits().some(h=>h.x===seen.x && h.y===seen.y);
    out.listed = (document.getElementById('mapSearchList').textContent||'').includes(seen.nm);
    if (unseen){ mapSearchSet(unseen.nm); out.hidden = !mapSearchHits().some(h=>h.x===unseen.x && h.y===unseen.y); }
    // by kind: 'town' finds every town you've seen and no other
    mapSearchSet('town'); const th = mapSearchHits().filter(h=>h.what==='town'); out.kind = th.length===towns.filter(t=>owSeen(t.x, t.y)).length;
    // jump to one: the map centres on it
    mapSearchSet(seen.nm); mapSearchGo(0); out.jump = G.owZoomCenter.x===seen.x && G.owZoomCenter.y===seen.y;
    // typing in the box doesn't work the game's keys (M would shut the map)
    const inp = document.getElementById('mapSearch'); inp.focus(); inp.dispatchEvent(new KeyboardEvent('keydown', { key:'m', bubbles:true })); out.stillOpen = owMapOpen();
    // a wandering merchant
    G.ow.encounters = []; const e = { x:G.owPos.x + 3, y:G.owPos.y, merchant:true }; G.ow.encounters.push(e); encParty(e);
    out.merch = { party:e.party.length, chance:encMerchantChance(e.x, e.y) };
    let opened = null; const keep = merchantEncounter; merchantEncounter = ()=>{ opened = 'merchant'; }; const rk = randomEncounter; randomEncounter = ()=>{ opened = 'fight'; };
    try{ G.owPos = { x:e.x, y:e.y }; checkOverworldEncounterTrigger(); } finally { merchantEncounter = keep; randomEncounter = rk; }
    out.merch.opened = opened;
    const fig = o3MerchantFig(); out.merch.fig = !!(fig && fig.rig.pack && fig.rig.lantern);
    out.merch.art = MERCHANT_ART.length > 0 && MERCHANT_COL==='#3ad85a';
    { const k = mapSearchIndex().find(h=>h.what==='site'); mapSearchSet(k ? k.nm : 'temple'); out.siteWord = !k || mapSearchHits().length > 0; } G.owZoomCenter = { x:G.owPos.x, y:G.owPos.y }; G.mapSearchI = -1; mapToolsSync(true); for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 50)); }
    return out; });
  await page.screenshot({ path:'/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad/mapsearch.png' });
  console.log(JSON.stringify(r));
  if (!r.box || !r.found || !r.listed) throw new Error('a seen town is found and listed '+JSON.stringify(r));
  if (r.have.unseen && !r.hidden) throw new Error('a town you have not discovered is not found');
  if (!r.kind) throw new Error('searching a kind finds every one you have seen');
  if (!r.siteWord) throw new Error('a site is found by the legend word for it');
  if (!r.jump) throw new Error('picking a result centres the map on it');
  if (!r.stillOpen) throw new Error('typing in the search box does not work the game keys');
  if (r.merch.party!==0 || r.merch.opened!=='merchant' || !r.merch.fig || !r.merch.art) throw new Error('the wandering merchant '+JSON.stringify(r.merch));
};
