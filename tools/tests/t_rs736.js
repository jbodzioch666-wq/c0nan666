// RS-736 (rewritten for RS-909's plans): your house. The estate agent sells a cottage (and, from RS-909, the bigger houses outright); its
// bed is the first thing to build, at its place in the bedroom; every piece of furniture is built at its place on the plan, the portal to its
// last grade; a back wall fades when it hides you. An old one-room house (from before the rooms) is carried to the plan of a house big
// enough for what it had, its furniture kept. Shots: shots/rs736_cottage.png, rs736_estate.png, rs736_back.png
const SHOTS = require('path').join(__dirname, 'shots');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const frames = n=>ev(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r0 = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; townClosedCheck = ()=>false;
    const p = G.player; p.clock = p.turnCount = 60; G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; enterVillage(); setUi('playing');
    p.gold = 2000000; houseBuy(1); setUi('estate'); const est = document.getElementById('overlay').textContent;
    enterHouse(); const [dx, dy] = houseDoorXY();
    const spots0 = ROOM_LAYOUT.house.benches.map(b=>b[0]); skAdd('logs', 6); houseBuildDialog(HOUSE_SPOTS.find(s=>s.id==='bed')); wevChoose(0);
    return { spots0, bed:ROOM_LAYOUT.house.benches.some(b=>b[0]==='bed'), est:/cottage/i.test(est) && /Estate/.test(est), at:[p.x, p.y], door:[dx, dy], doorTile:G.map[dx][dy]===T_DOOROUT }; });
  await frames(20); await page.screenshot({ path:SHOTS + '/rs736_cottage.png' });
  /* an estate, every piece built */
  const r3 = await ev(()=>{ const out = {}, p = G.player; skGainXP('construction', 6e7); exitInterior(); const g0 = p.gold; out.moved = houseBuy(4); out.cost = g0 - p.gold; enterHouse();
    for (const s of HOUSE_SPOTS) for (let t=houseTier(s.id); t<(s.tiers ? s.tiers.length : 1); t++){ const tier = s.tiers ? s.tiers[t] : s; for (const k in tier.cost) skAdd(k, tier.cost[k]); houseBuildDialog(s); wevChoose(0); }
    setUi('playing'); const h = houseP(); out.built = HOUSE_SPOTS.every(s=>(h.built[s.id]||0)===(s.tiers ? s.tiers.length : 1)); out.nSpots = HOUSE_SPOTS.length; out.portal = houseTier('portal');
    out.spots = ROOM_LAYOUT.house.benches.filter(b=>/^spot_/.test(b[0])).length; houseStair(); out.spots += ROOM_LAYOUT.house.benches.filter(b=>/^spot_/.test(b[0])).length; houseStair(); return out; });
  await frames(20); await page.screenshot({ path:SHOTS + '/rs736_estate.png' });
  /* a back wall fades when it hides you: stood at the front of the craft room, behind the great hall's back wall */
  const r4 = await ev(async ()=>{ const p = G.player, P = housePlan(), r = P.floors[0].rooms.find(o=>o.k==='craft'); p.x = r.x0 + 2; p.y = r.y1; for (let i=0;i<25;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    const faded = (V3.occ||[]).filter(o=>o.userData.grp && o.userData.grp.userData.faded).length; return { faded, occ:(V3.occ||[]).length }; });
  await page.screenshot({ path:SHOTS + '/rs736_back.png' });
  /* an old one-room house: rooms (RS-736), then its plan (RS-909) */
  const r5 = await ev(()=>{ setUi('playing'); exitInterior(); const p = G.player; p.house = { built:{ bed:1, hearth:1, altar:1, portal:2, trophy:1 } }; const h = houseP();
    enterHouse(); const k0 = ROOM_LAYOUT.house.benches.map(b=>b[0]); houseStair(); const k1 = ROOM_LAYOUT.house.benches.map(b=>b[0]); houseStair();
    const out = { v:h.v, size:h.size, portal:houseTier('portal'), kinds:k0.concat(k1).filter(k=>!/^spot_|patch|hstair|coop|byre|trough/.test(k)).sort() }; exitInterior(); return out; });
  console.log(JSON.stringify({ r0, r3, r4, r5 }));
  A(r0.est && r0.doorTile && !r0.spots0.some(k=>/^spot_/.test(k)) && r0.bed, 'a cottage: no empty spaces (RS-911: built from Decorate), its bed built at its place: ' + JSON.stringify(r0));
  A(r0.at[0]===r0.door[0] && r0.at[1]===r0.door[1] - 1, 'you come in at the front door');
  A(r3.moved && r3.cost===750000 - 50000 && r3.built && r3.portal===3 && r3.spots===0, 'an estate for the difference, every piece of furniture built: ' + JSON.stringify(r3));
  A(r4.occ > 0 && r4.faded > 0, 'a back wall fades when it hides you: ' + JSON.stringify(r4));
  A(r5.v===3 && r5.size===3 && r5.portal===2 && r5.kinds.join()==='altar,bed,hearth,portal,trophy', 'an old house carried to its plan, its furniture kept: ' + JSON.stringify(r5));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
