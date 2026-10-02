module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); return { ui:G.ui, mode:G.gameMode, lvl:G.player.combatLevel, ver:GAME_VERSION }; });
  console.log(JSON.stringify(r));
};
