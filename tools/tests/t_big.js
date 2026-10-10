module.exports = async page=>{
  // ---- the house and Construction
  const r1 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing');
    const p = G.player; p.gold = 1e6; p.wildWarned = 1;
    const tp = Object.values(G.ow.townPositions).find(Boolean); G.owPos = { x:tp.x, y:tp.y }; trackVisitedTown(tp.x, tp.y); enterVillage(); setUi('playing');
    A(G.gameMode===3, 'in town');
    const agent = G.villageNpcs.find(n=>n.service==='estate'); A(agent, 'estate agent on the square'); out.agent = [agent.x, agent.y];
    villageInteract(agent.x, agent.y); A(G.ui==='estate' && document.getElementById('overlay').innerHTML.includes('HOLLIS'), 'estate screen');
    houseBuy(); A(houseP() && p.gold===1e6-HOUSE_PRICE, 'bought'); checkAchievements(); A(p.achievements.includes('homeowner'), 'homeowner');
    renderOverlay(); A(document.getElementById('overlay').innerHTML.includes('go home'), 'go home button');
    enterHouse(); A(G.interior && G.interior.key==='house' && G.ui==='playing', 'inside the house');
    A(ROOM_LAYOUT.house.benches.length===HOUSE_SPOTS.length && ROOM_LAYOUT.house.benches.every(b=>b[0].startsWith('spot_')), 'empty spaces');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    out.v3 = v3Active();
    // too low a level: nothing happens
    houseBench('spot_portal'); A(G.ui==='wevent', 'build dialog'); wevChoose(0); A(!houseTier('portal'), 'portal needs the level');
    // build everything
    skP().skills.construction = SK_XP[99]; skAdd(SK_LOG[0].id, 2000); skAdd('ironb', 500); skAdd('essence', 2000);
    for (const s of HOUSE_SPOTS){ for (let t=0; t<(s.tiers ? s.tiers.length : 1); t++){ houseBuildDialog(s); A(G.ui==='wevent', 'dialog for '+s.id); wevChoose(0); } A(houseTier(s.id)===(s.tiers ? 3 : 1), 'built '+s.id); }
    checkAchievements(); A(p.achievements.includes('master_builder'), 'master builder');
    A(ROOM_LAYOUT.house.benches.every(b=>!b[0].startsWith('spot_')), 'furniture in place');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    out.hits = (V3.hits||[]).length;
    // the furniture works
    p.hp = 1; useBench('bed'); A(p.hp===effMaxHp(), 'slept');
    skAdd('bones', 10); const px0 = skP().skills.prayer||0; useBench('altar'); A(G.ui==='wevent', 'altar dialog'); wevChoose(0); A((skP().skills.prayer||0) > px0 && !skHave('bones'), 'offered bones');
    const cx0 = skP().skills.construction; useBench('carpentry'); A(G.ui==='wevent', 'carpentry dialog'); wevChoose(1); A(skP().skills.construction > cx0, 'flatpacks');
    G.ui = 'playing'; useBench('trophy'); A(G.ui==='trophies' && document.getElementById('overlay').innerHTML.includes('TROPHY WALL'), 'trophy wall'); setUi('playing');
    useBench('hearth'); A(G.ui==='cook', 'hearth cooks'); setUi('playing');
    useBench('furnace'); A(G.ui==='bench', 'furnace bench'); setUi('playing');
    useBench('portal'); A(G.ui==='housePortal', 'portal screen'); out.dests = housePortalDests().map(d=>d.kind+':'+d.nm);
    A(housePortalDests().length >= 1, 'portal dests');
    G.gameMode = 3; renderGame();   // (the house interior draws in the 3D town view)
    // out through the portal to a town
    housePortalGo(0); A(!G.interior && G.gameMode===3, 'through the portal to town');
    return out;
  });
  console.log('house', JSON.stringify(r1));
  await page.evaluate(async ()=>{ G.wevDlg = null; setUi('playing'); const a = G.villageNpcs.find(n=>n.service==='estate'); setUi('estate'); enterHouse(); for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } });
  await page.screenshot({ path: SHOTS+'/shot_house.png', timeout:120000 });
  await page.evaluate(()=>{ exitInterior(); });

  // ---- Archaeology
  const r2 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const p = G.player; G.gameMode = 0; setUi('playing'); o3Pref = false;
    const sites = G.ow.pois.filter(o=>o.k==='digsite'); out.sites = sites.map(s=>s.name+' @'+s.x+','+s.y+' d'+Math.round(Math.hypot(s.x-G.ow.spawnPos.x, s.y-G.ow.spawnPos.y)));
    A(sites.length >= 3, 'dig sites '+sites.length); A(G.ow.digTiles.size > 10, 'hotspots '+G.ow.digTiles.size);
    const barrow = sites.find(s=>s.site==='barrow'); A(barrow, 'barrow');
    let hs = null; for (const [key, k] of G.ow.digTiles) if (k==='barrow'){ hs = [Math.floor(key/4096), key%4096]; break; }
    const n = skNodeAt(hs[0], hs[1]); A(n && n.k==='archaeology' && n.type==='barrow', 'hotspot node');
    A(skNodeItems(n).some(e=>e.id==='am_barrow') && skNodeName(n)==='Excavation hotspot', 'hotspot items');
    skNodeTipHtml(n);
    // dig: no pickaxe, then with one
    skP().tools = skP().tools || {}; delete skP().tools.pick;
    G.owPos = { x:hs[0], y:hs[1] }; skDo(skNodeOption(n)); A(!G.gather, 'needs a pickaxe');
    skP().tools.pick = 3; skP().skills.archaeology = SK_XP[99];
    let mats = 0, arts = 0, guard = 0;
    while (guard++ < 400 && (mats < 3 || arts < 1)){
      if (G.gameMode!==0){ G.gameMode = 0; G.mon = []; } if (G.ui!=='playing') setUi('playing');
      delete skUsed()[hs[0]+','+hs[1]]; G.owPos = { x:hs[0], y:hs[1] };
      if (!G.gather) skDo(skNodeOption(skNodeAt(hs[0], hs[1])));
      if (G.gather){ G.gather.next = 0; skGatherTick(performance.now()); }
      mats = skHave('am_barrow'); arts = ['urn','torc','mask','horn'].reduce((a,id)=>a+skHave('ad_'+id), 0);
    }
    out.dug = { mats, arts, guard, xp:skP().skills.archaeology - SK_XP[99] }; A(mats >= 1 && arts >= 1, 'dug finds');
    skStop();
    // restore at the camp
    skAdd('am_barrow', 100); for (const id of ['urn','torc','mask','horn']) skAdd('ad_'+id, 1);
    G.owPos = { x:barrow.x, y:barrow.y }; setUi('playing'); wgStep(); A(G.ui==='arch' && document.getElementById('overlay').innerHTML.includes('DIG CAMP'), 'dig camp');
    const inv0 = G.inv.length;
    for (const id of ['urn','torc','mask','horn']) archRestore(id);
    A(archDone('barrow') && Object.keys(archP().col).length >= 4, 'collection done');
    checkAchievements(); A(p.achievements.includes('relic_barrow') && p.achievements.includes('archaeologist'), 'relic honour');
    A(G.inv.some(it=>it && it.nm==="Barrow King's mask"), 'mask wearable'); out.invGain = G.inv.length - inv0;
    out.mask = itemDesc(G.inv.find(it=>it && it.nm==="Barrow King's mask"));
    setUi('playing');
    // wearables of the other kinds build
    for (const id of ['trident','gauntlet','circlet','egg']) A(archWearable(ARCH_ART[id]), 'wearable '+id);
    // the map and 3D, by the dig site
    G.owPos = { x:barrow.x, y:barrow.y+1 }; owReveal(barrow.x, barrow.y, 6);
    G.owZoomedOut = false; toggleOwZoom(); for (const z of [3, 8]){ G.owZoomScale = z; renderGame(); } toggleOwZoom();
    o3Pref = true; for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    out.o3 = o3Active();
    return out;
  });
  console.log('arch', JSON.stringify(r2, null, 1));
  await page.screenshot({ path: SHOTS+'/shot_dig3d.png', timeout:120000 });
  await page.evaluate(()=>{ o3Pref = false; G.owZoomedOut = false; toggleOwZoom(); G.owZoomScale = 8; renderGame(); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'/shot_dig_map.png', timeout:120000 });

  // ---- Necromancy
  const r3 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    const p = G.player; G.owZoomedOut = false; G.gameMode = 0; setUi('playing');
    necroRaise(); A(!necroMinions().length, 'no raising on the overworld');
    randomEncounter(false); setUi('playing'); A(G.gameMode===2, 'a fight '+G.gameMode);
    for (const m of G.mon){ m.hp = m.maxHp = 400; }
    necroRaise(); A(!necroMinions().length, 'no bones, no minion');
    skAdd('bones', 30); skAdd('bigbones', 5);
    const lvlBefore = rsCombatLevel();
    skP().skills.necromancy = SK_XP[85]; rsSync(); out.cb = [lvlBefore, rsCombatLevel()]; A(rsCombatLevel() > lvlBefore, 'necromancy counts to combat level');
    for (let i=0;i<5;i++) necroRaise();
    out.minions = necroMinions().map(m=>m.nm); A(necroMinions().length===necroMax() && necroMax()===4, 'four minions');
    A(necroMinions().some(m=>m.k==='knight'), 'death knight at 85');
    checkAchievements(); A(p.achievements.includes('necromancer'), 'necromancer honour');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    necroHudSync(); const btn = document.getElementById('necroBtn'); A(btn && btn.style.display==='block', 'raise button'); out.btn = btn.textContent;
    for (const m of G.mon){ m.hp = m.maxHp = 3000; }
    const xp0 = skP().skills.necromancy, hp0 = G.mon.reduce((a,m)=>a+m.hp, 0);
    for (let i=0;i<30 && !G.gameOver;i++){ for (const m of G.mon) m.hp = Math.max(m.hp, 50); p.hp = effMaxHp(); tickMonsters(); }
    out.dmg = hp0 - G.mon.reduce((a,m)=>a+Math.max(0,m.hp), 0); out.xp = skP().skills.necromancy - xp0;
    A(out.dmg > 0 && out.xp > 0, 'minions fight');
    for (let i=0;i<6;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    return out;
  });
  console.log('necro', JSON.stringify(r3));
  const n0 = await page.evaluate(()=>G.player.necroRaised);
  await page.keyboard.press('-'); await page.waitForTimeout(100);
  const n1 = await page.evaluate(()=>G.player.necroRaised);
  console.log('raised by key', n0, '->', n1); if (n1!==n0+1) throw new Error('raise by key');
  await page.screenshot({ path: SHOTS+'/shot_necro.png', timeout:120000 });
  const r4 = await page.evaluate(()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    G.gameMode = 0; G.mon = []; setUi('playing'); tickMonsters(); A(!(G.player.minions||[]).length, 'minions go when the fight ends');
    renderGame(); necroHudSync(); A(document.getElementById('necroBtn').style.display==='none', 'button hidden');
    // save and load
    const built = Object.keys(houseP().built).length, col = Object.keys(archP().col).length;
    saveCurrentGame(); const id = G.saveId || (saveIndexList()[0]||{}).id; loadGame(id); setUi('playing');
    A(houseP() && Object.keys(houseP().built).length===built, 'house survives');
    A(Object.keys(archP().col).length===col && G.ow.pois.some(o=>o.k==='digsite') && G.ow.digTiles.size > 0, 'arch survives');
    A(skLvl('necromancy') >= 85, 'necromancy survives');
    setUi('skills'); const ov = document.getElementById('overlay').innerHTML; A(ov.includes('Construction') && ov.includes('Archaeology'), 'skills screen'); setUi('playing');
    setUi('achievements'); setUi('playing');
    return 'ok';
  });
  console.log('save', r4);
};
