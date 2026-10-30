// RS-683: half as many wandering groups - a medium world keeps about 25 (was 50), the bigger sizes up to 75 (was 150), and a fresh world
// starts with no more than that. An old save that already has more thins out a group a step, always the one farthest from you, until it
// is down to the target; the Wilderness keeps its extra 40%.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const out = { target:owEncTarget(), base:OW_ENCOUNTER_TARGET, fresh:G.ow.encounters.length };
    /* an old save's 50: add groups on open ground until there are 50 */
    for (let t=0;t<20000 && G.ow.encounters.length < 50;t++){ const p = spawnOneEncounter(G.owPos.x, G.owPos.y, 4); if (p) G.ow.encounters.push(p); }
    out.old = G.ow.encounters.length; const far = e=>Math.hypot(e.x - G.owPos.x, e.y - G.owPos.y);
    const near0 = G.ow.encounters.slice().sort((a, b)=>far(a) - far(b)).slice(0, out.target);   /* (the target's worth nearest you, kept) */
    const wild0 = G.ow.wild; G.ow.wild = false; let farFirst = true, steps = 0;
    for (;steps<200 && G.ow.encounters.length > out.target;steps++){ const before = G.ow.encounters.slice(), dMax = Math.max(...before.map(far)); moveOverworldEncounters();
      const gone = before.filter(e=>!G.ow.encounters.includes(e)); if (gone.length > 1 || (gone.length===1 && far(gone[0]) < dMax - 2)) farFirst = false; }
    out.steps = steps; out.after = G.ow.encounters.length; out.farFirst = farFirst; out.nearKept = near0.filter(e=>G.ow.encounters.includes(e)).length;
    for (let i=0;i<300;i++) moveOverworldEncounters(); out.later = G.ow.encounters.length;
    G.ow.wild = true; for (let i=0;i<20;i++) G.ow.encounters.push(spawnOneEncounter(G.owPos.x, G.owPos.y, 4) || { x:G.ow.encounters[0].x, y:G.ow.encounters[0].y });
    for (let i=0;i<200;i++) moveOverworldEncounters(); out.wild = G.ow.encounters.length; out.wildCap = Math.ceil(out.target*1.4); G.ow.wild = wild0;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.base===25 && r.target >= 25 && r.target <= 31, 'a medium world keeps about 25 groups (half the old 50)');
  A(r.fresh <= r.target && r.fresh >= r.target - 5, 'a fresh world starts with about that many');
  A(r.old===50, 'an old save with 50');
  A(r.after===r.target && r.steps >= 50 - r.target && r.steps < 200, 'thins out to the target, one a step');
  A(r.farFirst && r.nearKept >= r.target - 3, 'always the farthest from you first, so none vanish in sight');
  A(r.later <= r.target, 'and stays there');
  A(r.wild <= r.wildCap && r.wild > r.target, 'the Wilderness keeps its extra 40%');
};
