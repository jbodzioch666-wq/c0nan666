// RS-418: breaking a siege is a battle. Before the gate, with the town's watch at your side, you hold the field against three
// waves of besiegers; then the gate gives way and the fight moves into the streets, where the watch and the townsfolk fight the
// raiders and their warlord holds the square. The town's people strike the monsters and are struck by them, and can fall. Win
// and you're back in the saved town, paid, the siege gone
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const step = async (n)=>{ for (let i=0;i<(n||6);i++){ await page.evaluate(()=>renderGame()); await page.waitForTimeout(40); } };
  const r0 = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const p = G.player; p.hp = p.maxHp = 99999;
    const t = G.ow.spawnPos, key = t.x+','+t.y, e = wevP(); e.dyn = e.dyn.filter(d=>d.kind!=='siege');
    const d = { id:++e.seq, kind:'siege', key, x:t.x, y:t.y, camp:'orc', until:wevTurn() + DAY_LENGTH }; e.dyn.push(d);
    G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; const gold0 = p.gold;
    wevSiegeFight(d);
    const S = G.siegeWar;
    return { mode:G.gameMode, theme:G.arenaTheme, kind:G.wevFight && G.wevFight.kind, wave:S && S.wave, phase:S && S.phase, allies:(G.allies||[]).length, mon:G.mon.filter(m=>m.alive).length,
      wall:(()=>{ let n = 0; for (let x=1;x<COLS-1;x++) if (G.map[x][ROWS-2]===T_WALL) n++; return n; })(), gold0, key }; });
  console.log('start', JSON.stringify(r0));
  await step(30);
  await page.screenshot({ path: SHOTS + '/siege_gates.png' });
  // the town's people fight: bring a guard beside a foe and let a few turns pass
  const fight = await page.evaluate(()=>{ const a = G.allies[0], m = G.mon.find(m=>m.alive); const hp0 = m.hp, ahp0 = G.allies.map(a=>a.hp);
    // stand you well back so the foe is free to pick its fight
    G.player.x = 1; G.player.y = ROWS-3;
    let hitFoe = false, hurt = false;
    for (let k=0;k<12 && !(hitFoe && hurt);k++){ const al = G.allies.find(o=>o.hp>0); const mm = G.mon.find(o=>o.alive); if (!al || !mm) break;
      if (Math.abs(al.x-mm.x)+Math.abs(al.y-mm.y)!==1){ const spot = [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[mm.x+dx, mm.y+dy]).find(([x,y])=>siegeFree(x,y)); if (spot){ al.x = spot[0]; al.y = spot[1]; } }
      const mh = mm.hp, ah = al.hp; tickMonsters(); if (mm.hp < mh || !mm.alive) hitFoe = true; if (al.hp < ah || al.hp<=0 || !G.allies.includes(al)) hurt = true; }
    return { hitFoe, hurt, allies:G.allies.length, ally:{ atk:a.atkBonus, ac:a.ac, hp:a.maxHp, dmg:a.dmg1+'d'+a.dmg2 }, mon:{ nm:m.nm, ac:m.ac, atk:m.atkBonus, hp:m.maxHp, dmg:m.dmg1+'d'+m.dmg2, cb:m.cb } }; });
  console.log('fight', JSON.stringify(fight));
  // clear the waves, one by one
  const waves = [];
  for (let w=0; w<3; w++){
    await page.evaluate(()=>{ G.player.x = Math.floor(COLS/2); G.player.y = ROWS-4; G.mon.forEach((m,i)=>{ if (m.alive){ m.hp = 0; monsterDies(i); } }); });
    await step(8);
    waves.push(await page.evaluate(()=>{ const S = G.siegeWar; return S ? { wave:S.wave, phase:S.phase, theme:G.arenaTheme, mon:G.mon.filter(m=>m.alive).length, warlord:G.mon.some(m=>m.alive && /^Warlord /.test(m.nm)), allies:G.allies.length, folk:G.allies.filter(a=>a.kind==='folk').length, mode:G.gameMode } : { done:true, mode:G.gameMode }; }));
  }
  console.log('waves', JSON.stringify(waves));
  await step(30);
  await page.screenshot({ path: SHOTS + '/siege_streets.png' });
  // the streets: a town laid out - walls of houses, open streets and a square
  const town = await page.evaluate(()=>{ let walls = 0, floor = 0; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++){ if (G.map[x][y]===T_WALL) walls++; else if (G.map[x][y]===T_FLOOR) floor++; } return { walls, floor, sq:G.map[9][9]===T_FLOOR && G.map[7][7]===T_FLOOR }; });
  // and win it
  await page.evaluate(()=>{ G.mon.forEach((m,i)=>{ if (m.alive){ m.hp = 0; monsterDies(i); } }); });
  await step(10);
  const end = await page.evaluate(key=>({ mode:G.gameMode, siege:!!G.siegeWar, allies:(G.allies||[]).length, dyn:wevP().dyn.some(d=>d.kind==='siege' && d.key===key), gold:G.player.gold, rep:repAt(key) }), r0.key);
  console.log('end', JSON.stringify(end), 'town', JSON.stringify(town));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  A(r0.mode===2 && r0.kind==='siegewar' && r0.theme==='siege' && r0.wave===1 && r0.phase===1, 'the battle starts at the gates: '+JSON.stringify(r0));
  A(r0.allies >= 3 && r0.mon >= 2 && r0.wall >= 16, 'the watch stands with you before the town wall, the first wave coming on: '+JSON.stringify(r0));
  A(fight.hitFoe && fight.hurt, 'the town\'s people strike the besiegers and are struck: '+JSON.stringify(fight));
  A(waves[0].phase===1 && waves[0].wave===2 && waves[0].mon > 0, 'the second wave: '+JSON.stringify(waves[0]));
  A(waves[1].phase===1 && waves[1].wave===3 && waves[1].mon > 0, 'the third: '+JSON.stringify(waves[1]));
  A(waves[2].phase===2 && waves[2].theme==='street' && waves[2].warlord && waves[2].mon >= 4 && waves[2].folk >= 1, 'then into the streets, the townsfolk fighting and the warlord in the square: '+JSON.stringify(waves[2]));
  A(town.walls > 100 && town.floor > 80 && town.sq, 'the streets are a town: '+JSON.stringify(town));
  A(end.mode===3 && !end.siege && end.allies===0 && !end.dyn && end.gold > r0.gold0, 'won: back in the saved town, paid, the siege over: '+JSON.stringify(end));
  // RS-419: the town's walls stand high with towers and a gate, its houses roofed; a raid is a battle in the streets
  const raid = await page.evaluate(async ()=>{ const key = curTownKey() || (G.owPos.x+','+G.owPos.y), e = wevP(), id = ++e.seq; e.town[key] = { kind:'raid', id, until:wevTurn() + 100, done:false };
    wevSiegeFight({ kind:'raid', id, camp:'goblin' }); const S = G.siegeWar;
    const out = { mode:G.gameMode, theme:G.arenaTheme, raid:!!(S && S.raid), leader:G.mon.some(m=>m.alive && /^Raid leader /.test(m.nm)), allies:(G.allies||[]).length, gate:G.arenaDeco[Math.floor(COLS/2)][ROWS-1]==='gate', houses:G.arenaDeco.flat().filter(d=>d==='house' || d==='house2').length };
    for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    let roofs = 0, tall = 0; FPD.world && FPD.world.traverse(o=>{ if (o.isMesh && o.material && /siegeRoof/.test(Object.keys(FPD.mats).find(k=>FPD.mats[k]===o.material)||'')) roofs++; if (o.isMesh && o.geometry && o.geometry.attributes.position){ const bb = new THREE.Box3().setFromObject(o); if (bb.max.y > 1.7 && bb.max.y < 3) tall++; } });
    out.roofs = roofs; out.tall = tall;
    G.mon.forEach((m,i)=>{ if (m.alive){ m.hp = 0; monsterDies(i); } }); return { out, key, id }; });
  await step(10);
  const raidEnd = await page.evaluate(k=>({ mode:G.gameMode, done:!!(wevP().town[k] && wevP().town[k].done), siege:!!G.siegeWar }), raid.key);
  console.log('raid', JSON.stringify(raid.out), JSON.stringify(raidEnd));
  A(raid.out.mode===2 && raid.out.theme==='street' && raid.out.raid && raid.out.leader && raid.out.allies >= 2, 'a raid is fought in the streets, the watch and townsfolk with you, its leader in the square: '+JSON.stringify(raid.out));
  A(raid.out.gate && raid.out.houses > 40 && raid.out.roofs >= 4 && raid.out.tall >= 2, 'the town wall stands high with its gate, the houses roofed: '+JSON.stringify(raid.out));
  A(raidEnd.mode===3 && raidEnd.done && !raidEnd.siege, 'the raid beaten off, you\'re back in town: '+JSON.stringify(raidEnd));
};
