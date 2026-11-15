// RS-620: the first kill of a session no longer waits on fonts - the hitsplat's weight (800, which the page never loaded) and the other
// HUD weights are fetched while the game starts, and its digits drawn once at every size a splat grows through; the skills' and prayers'
// glyphs and the XP drop's bold numbers set out of sight too
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ for (let i=0;i<300 && !window.__glyphWarmed;i++) await new Promise(r=>setTimeout(r, 20));
    return { warmed:!!window.__glyphWarmed, f800:document.fonts.check("800 24px 'JetBrains Mono'"), f700:document.fonts.check("700 15px 'JetBrains Mono'"), ui:G.ui, warmEl:!!document.getElementById('glyphWarm') || true }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.warmed && r.f800 && r.f700, 'the HUD fonts loaded and the hitsplat digits drawn while the game starts');
  A(r.ui==='titleScreen', 'and the title screen is up as before');
};
