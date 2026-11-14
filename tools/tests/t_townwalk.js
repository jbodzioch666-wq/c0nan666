// RS-369: townsfolk walk the whole town on their errands - to work, the shops, a neighbour's door, the gate - finding their
// way round the houses, instead of standing about the common; in the evening most go into the tavern rather than
// crowding round its door
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player, D = DAY_LENGTH; G.weather = 'clear'; weatherSync = ()=>{};
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    p.x = 1; p.y = 1;   /* (out of everyone's way) */
    const folk = G.villagers.filter(v=>!v.guard && !v.animal);
    p.clock = Math.ceil(p.clock/D)*D + D*0.36;
    const start = new Map(folk.map(v=>[v, [v.x, v.y]])), far = new Map(folk.map(v=>[v, 0])), cells = new Set();
    for (let i=0;i<400;i++){ townMoveVillagers(); for (const v of folk){ if (v.indoors) continue; const [x0,y0] = start.get(v); far.set(v, Math.max(far.get(v), Math.abs(v.x-x0) + Math.abs(v.y-y0))); cells.add(v.x+','+v.y); } }
    const fs = [...far.values()].sort((a,b)=>a-b);
    const out = { folk:folk.length, medFar:fs[fs.length>>1], cells:cells.size, cols:COLS, rows:ROWS };
    // the busiest single tile during the day: nobody piles up
    // evening: into the tavern
    p.clock += D*(0.70 - 0.36);
    const tav = townFolkSpots().tavern;
    let crowdMax = 0; for (let i=0;i<200;i++){ townMoveVillagers(); if (i > 120) crowdMax = Math.max(crowdMax, folk.filter(v=>!v.indoors && Math.abs(v.x-tav[0]) + Math.abs(v.y-tav[1]) <= 2).length); }
    out.inTav = folk.filter(v=>v.inTav).length; out.crowdMax = crowdMax;
    // night: home; morning: out again, from the tavern too
    p.clock += D*(0.95 - 0.70); for (let i=0;i<300;i++) townMoveVillagers(); out.night = folk.filter(v=>v.indoors).length;
    p.clock += D*0.4; for (let i=0;i<20;i++) townMoveVillagers(); out.morning = folk.filter(v=>!v.indoors).length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.folk >= 4, 'townsfolk');
  A(r.medFar >= 12, 'most walk a long way across town in a day');
  A(r.cells >= r.folk*20, 'they cover a lot of the town');
  A(r.inTav >= 2 && r.crowdMax <= 3, 'evenings: into the tavern, no crowd at its door');
  A(r.night >= r.folk - 1 && r.morning >= r.folk - 1, 'home at night, out again in the morning');
};
