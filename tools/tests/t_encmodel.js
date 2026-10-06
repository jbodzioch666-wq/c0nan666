// RS-181: a wandering monster group shows on the land as the 3D figure of its strongest member, with the crossed swords over its
// head; walking into it, you fight the group you saw
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; G.interior = null;
    // a group near you
    let e = (G.ow.encounters||[]).find(o=>Math.hypot(o.x-G.owPos.x, o.y-G.owPos.y) < 20);
    if (!e){ for (let d=3; d<8 && !e; d++) for (const [a,b] of [[d,0],[0,d],[-d,0],[0,-d]]){ const x = G.owPos.x+a, y = G.owPos.y+b; if (encounterEligible(G.ow.map[x][y]) && !wgRoadAt(x,y)){ e = { x, y }; G.ow.encounters.push(e); break; } } }
    const party = encParty(e), lead = encLeader(e), out = { party:party.map(p=>p.nm+':'+p.lvl), lead:lead && lead.nm, strongest:party.every(p=>(p.lvl||0) <= (lead.lvl||0)) };
    for (let i=0;i<5;i++){ renderGame(); try{ o3Render(); }catch(err){} await new Promise(r=>setTimeout(r, 60)); }
    const f = O3.beasts && [...O3.beasts.entries()].find(([k])=>k.startsWith('enc'+e.id+':'));
    out.fig = f ? { model:!!f[1].e, icon:!!(f[1].icon && f[1].icon.parent), above:f[1].icon ? +(f[1].icon.position.y - f[1].e.holder.position.y).toFixed(2) : 0, top:+f[1].top.toFixed(2) } : null;
    let sprite = 0; if (O3.encGrp) O3.encGrp.traverse(o=>{ if (o.isSprite && Math.abs(o.position.x - (e.x+0.5)) < 0.01 && Math.abs(o.position.z - (e.y+0.5)) < 0.01) sprite++; });
    out.oldSprite = sprite;
    // walking into it: the fight is the group you saw
    G.owPos = { x:e.x, y:e.y }; const keepR = Math.random; Math.random = ()=>0.99;   // (a plain fight, not a merchant or a set piece)
    try{ checkOverworldEncounterTrigger(); }finally{ Math.random = keepR; }
    out.fight = (G.mon||[]).map(m=>m.baseNm||m.nm).sort();
    out.want = party.map(p=>p.nm).sort();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.party.length >= 1 && r.lead && r.strongest, 'the group is rolled, and its leader is its strongest');
  A(r.fig && r.fig.model && r.fig.icon && r.fig.above > r.fig.top, 'the leader stands on the land as a 3D figure, with the crossed swords over its head');
  A(r.oldSprite===0, 'and the old flat icon is gone');
  A(JSON.stringify(r.fight)===JSON.stringify(r.want), 'walking into it, you fight the group you saw');
};
