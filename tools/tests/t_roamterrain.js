// RS-369: a wandering group keeps to the ground it turned up on - the land's own never walk out over the sea or a river,
// and sea creatures never come ashore
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const wet = (x,y)=>owWetT(G.ow.map[x][y]);
    // a land group and a sea group on a shore, side by side, plus everything already wandering
    let shore = null; for (let x=2;x<OW_COLS-2 && !shore;x++) for (let y=2;y<OW_ROWS-2;y++){ if (encounterEligible(G.ow.map[x][y]) && !owWetT(G.ow.map[x][y]) && G.ow.map[x+1][y]===OW_WATER && !G.ow.encounters.some(e=>Math.abs(e.x-x) <= 2 && Math.abs(e.y-y) <= 2) && !wgRoadAt(x, y)){ shore = [x, y]; break; } }
    const land = { x:shore[0], y:shore[1] }, sea = { x:shore[0]+1, y:shore[1] }; G.ow.encounters.splice(0, 2); G.ow.encounters.push(land, sea);   /* (RS-683: room for the pair, or the thinning could take them) */
    const out = { n:G.ow.encounters.length, wetN:0, bad:0, moves:0, landSteps:0, seaSteps:0 };
    for (const e of G.ow.encounters){ encWet(e); if (e.wet) out.wetN++; }
    G.owPos = { x:1, y:1 };
    const start = new Map(G.ow.encounters.map(e=>[e, e.x+','+e.y]));
    for (let i=0;i<400;i++){ moveOverworldEncounters(); for (const e of G.ow.encounters){ if (e.wet===undefined) encWet(e); if (!!wet(e.x, e.y)!==!!e.wet) out.bad++; } }
    for (const e of G.ow.encounters) if (start.has(e) && start.get(e)!==e.x+','+e.y) out.moves++;
    out.land = [land.x-shore[0], land.y-shore[1]]; out.landWet = land.wet; out.seaWet = sea.wet; out.seaMoved = sea.x!==shore[0]+1 || sea.y!==shore[1]; out.landMoved = land.x!==shore[0] || land.y!==shore[1];
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n > 12 && r.wetN >= 1, 'roamers on the land and on the water');
  A(r.landWet===0 && r.seaWet===1, 'the shore pair are one of each');
  A(r.moves > 10 && (r.seaMoved || r.landMoved), 'they wander');
  A(r.bad===0, 'none ever crosses onto the other kind of ground');
};
