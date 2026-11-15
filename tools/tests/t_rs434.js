// RS-434: what used to spring on you from nowhere - camping, gathering - is a real roamer: it turns up a few leagues off, comes for you
// step by step (and stroke by stroke while you work), stops your work when it's on you, fights you when it reaches you, and loses
// your trail if you outrun it
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0;
    const out = {}, p = G.player;
    // somewhere open in the wilds
    let spot = null; const sp = G.ow.spawnPos;
    for (let rr=3; rr<30 && !spot; rr++) for (let dx=-rr; dx<=rr && !spot; dx++) for (let dy=-rr; dy<=rr; dy++){ const x = sp.x+dx, y = sp.y+dy, t = G.ow.map[x] && G.ow.map[x][y]; if (t===OW_GRASS && !owSpotTaken(x, y) && !wgRoadAt(x, y)){ let ok = 0; for (let i=-4;i<=4;i++) for (let j=-4;j<=4;j++) if (G.ow.map[x+i] && G.ow.map[x+i][y+j]===OW_GRASS) ok++; if (ok > 60){ spot = { x, y }; break; } } }
    const at = ()=>{ G.gameMode = 0; G.owPos = { x:spot.x, y:spot.y }; G.ow.encounters = G.ow.encounters.filter(e=>Math.hypot(e.x - spot.x, e.y - spot.y) > 16); setUi('playing'); };
    // camping: caught - a hunter shows, a few leagues off, and no fight yet
    at(); const ca = campAmbushChance; campAmbushChance = ()=>1; campOutside(); campAmbushChance = ca;
    const h = G.ow.encounters.find(e=>e.hunt), d0 = h ? Math.hypot(h.x - spot.x, h.y - spot.y) : -1;
    out.camp = { hunter:!!h, d0:+d0.toFixed(1), mode:G.gameMode, why:h && h.why };
    // it closes in as you wait about, and the fight starts when it reaches you
    let steps = 0; while (G.gameMode===0 && steps < 12){ moveOverworldEncounters(); checkOverworldEncounterTrigger(); steps++; }
    out.camp.fight = G.gameMode===2; out.camp.steps = steps;
    // at your work: one turns up, and closes in stroke by stroke; your work stops when it's on you
    at(); const hw = owHunterSpawn('work', 4, 6), wd0 = hw ? +Math.hypot(hw.x - spot.x, hw.y - spot.y).toFixed(1) : -1; G.gather = { o:{ k:'mining', label:'Mining' }, iv:1, next:0, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 };
    let stopped = -1, fought = -1; for (let i=0;i<12;i++){ const had = !!G.gather; const r2 = owHuntersStep(); if (had && !G.gather && stopped < 0) stopped = i; if (G.gameMode===2){ fought = i; break; } if (!G.gather) G.gather = { o:{ k:'mining', label:'Mining' }, iv:1, next:0, pos:G.owPos.x+','+G.owPos.y, mode:0, n:0 }; }
    out.work = { hunter:!!hw, d0:wd0, stopped, fought };
    // outrun: far enough off, it gives up
    at(); const ho = owHunterSpawn('work', 4, 6); if (ho){ ho.x = spot.x + 15; ho.y = spot.y; } moveOverworldEncounters(); out.lost = ho ? !ho.hunt : null;
    G.gather = null; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.camp.hunter && r.camp.d0 >= 2 && r.camp.d0 <= 4.5 && r.camp.mode===0 && r.camp.why==='camp', 'caught camping: a hunter shows a few leagues off, no fight sprung yet');
  A(r.camp.fight && r.camp.steps >= 2, 'it comes for you and the fight starts when it reaches you');
  A(r.work.hunter && r.work.d0 >= 3.5 && r.work.stopped >= 0 && r.work.fought > r.work.stopped, 'at work: it closes in, your work stops when it\'s on you, then it fights you');
  A(r.lost===true, 'outrun, it loses your trail');
};
