module.exports = async page=>{
  const frames = (n)=>page.evaluate(async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } }, n);
  const r1 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = true; G.gameMode = 0; G.player.turnCount = 70;
    for (let i=0;i<12;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    out.o3 = o3Active(); A(o3Active(), 'the land in 3D');
    A(GFXP.has(O3.renderer), 'post-process on the land');
    A(O3.land.geometry.getAttribute('blend'), 'blended ground');
    A(Array.isArray(GFX.mist) && Array.isArray(GFX.rays) && Array.isArray(GFX.falls), 'mist, rays and falls');
    out.counts = { mist:GFX.mist.length, falls:GFX.falls.length, woods:GFX.woods.length };
    // the grade follows the region
    for (const [t, want] of [[OW_DESERT,'desert'], [OW_SWAMP,'swamp'], [OW_TUNDRA,'tundra']]){ let f = null; for (let x=0;x<OW_COLS && !f;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===t && !wgBioAt(x,y)){ f = [x,y]; break; }
      if (f){ const p0 = G.owPos; G.owPos = { x:f[0], y:f[1] }; A(gfxGradeKey('o3')===want, 'grade '+want); G.owPos = p0; } }
    return out;
  });
  console.log('land', JSON.stringify(r1));
  await page.screenshot({ path: SHOTS+'/shot_gfx_day.png', timeout:120000 });
  // dusk, night, a storm, autumn and winter
  await page.evaluate(()=>{ G.player.turnCount = Math.round(DAY_LENGTH*0.76); });
  await frames(10); await page.screenshot({ path: SHOTS+'/shot_gfx_dusk.png', timeout:120000 });
  await page.evaluate(()=>{ G.player.turnCount = Math.round(DAY_LENGTH*1.02); G.weather = 'storm'; });
  await frames(10); await page.screenshot({ path: SHOTS+'/shot_gfx_night.png', timeout:120000 });
  const r2 = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    G.weather = 'clear'; G.player.turnCount = DAY_LENGTH*6*2 + 60; seasonTick();
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    out.autumn = { season:seasonIdx(), leaves:(GFX.leaves||[]).length, built:GFX.season };
    A(GFX.season===seasonIdx(), 'rebuilt for the season');
    G.player.turnCount = DAY_LENGTH*6*3 + 60; seasonTick(); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    A(GFX.season===3, 'winter');
    // post-process off, then on
    SET.post = false; renderGame(); SET.post = true; renderGame();
    // a town
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    A(GFXP.has(V3.renderer), 'post-process in town'); out.townGrade = gfxGradeKey('v3');
    return out;
  });
  console.log('seasons', JSON.stringify(r2));
  await page.screenshot({ path: SHOTS+'/shot_gfx_town.png', timeout:120000 });
  const r3 = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    G.player.turnCount = DAY_LENGTH*6*3 + 70;
    const s = questNearbySites(G.ow.spawnPos.x, G.ow.spawnPos.y, 1, 80, ['dungeon'])[0] || questNearbySites(G.ow.spawnPos.x, G.ow.spawnPos.y, 1, 80, null)[0];
    G.gameMode = 0; G.owPos = { x:s.x, y:s.y }; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<14;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    A(G.gameMode===1, 'in a dungeon'); const shafts = FPD.world ? FPD.world.children.filter(o=>o.material && o.material.map===gfxTextures().beam).length : 0;
    A(FPD.r && GFXP.has(FPD.r), 'post-process below');
    return { shafts, kind:G.siteKind };
  });
  console.log('dungeon', JSON.stringify(r3));
  await page.screenshot({ path: SHOTS+'/shot_gfx_dungeon.png', timeout:120000 });
};
