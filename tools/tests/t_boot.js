module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); return { ui:G.ui, mode:G.gameMode, lvl:G.player.combatLevel, ver:GAME_VERSION }; });
  console.log(JSON.stringify(r));
  // RS-148: the classic layout is gone - a player who had picked it still gets the full-window one, with no button to switch back
  await page.evaluate(()=>{ try{ localStorage.setItem('depthcrawl_layout', 'classic'); }catch(e){} });
  await page.reload(); await page.waitForTimeout(1500);
  const l = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); renderGame(); return { imm:document.body.classList.contains('immersive'), toggle:typeof toggleLayout, icon:!!document.getElementById('layoutIcon'), btn:!!document.querySelector('[data-act="layout"]') }; });
  if (!l.imm || l.toggle!=='undefined' || l.icon || l.btn) throw new Error('the classic layout should be gone: '+JSON.stringify(l));
};
