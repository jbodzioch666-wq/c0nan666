// (probe, not in ALL) a marsh town on stilts (ZH: 'hill' for a hill town): the tavern's stair from the square, then you half way up it
// as you walk in. Shots: shots/zstilts-stair.png, shots/zstilts-up.png
module.exports = async page=>{
  page.setDefaultTimeout(0);
  await page.evaluate(async hill=>{ window.__trans = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    detectRegionBiome = ()=>hill ? OW_MOUNTAIN : OW_SWAMP; let found = false;
    for (const t of townList()){ if (t.x===G.ow.spawnPos.x && t.y===G.ow.spawnPos.y) continue; G.gameMode = 0; G.interior = null; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      for (let i=0;i<90;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } if ((V3.steps||[]).some(q=>q.key==='tavern')){ found = true; break; } }   /* (a town whose layout takes the marsh: some were laid out before) */
    townClosedCheck = ()=>false; G.player.clock = DAY_LENGTH*10 + DAY_LENGTH*0.3; V3.dist = 8;
    for (let i=0;i<120;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); }
    const st = (V3.steps||[]).find(q=>q.key==='tavern'), b = VILLAGE_BUILDINGS.find(q=>q.key==='tavern'); G.player.x = b.door.x + Math.round(st.nx) + 1; G.player.y = b.door.y + Math.round(st.nz) + 1;
    for (let i=0;i<60;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, process.env.ZH==='hill');
  await page.waitForTimeout(1500); await page.screenshot({ path: SHOTS + '/zstilts-stair.png' });
  await page.evaluate(async ()=>{ const st = V3.steps.find(q=>q.key==='tavern'), b = VILLAGE_BUILDINGS.find(q=>q.key==='tavern'); G.player.x = b.door.x + Math.round(st.nx); G.player.y = b.door.y + Math.round(st.nz); for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } moveDir(-Math.round(st.nx), -Math.round(st.nz)); });
  await page.waitForTimeout(+(process.env.ZMS || 330)); await page.screenshot({ path: SHOTS + '/zstilts-up.png' });
};
