// RS-768: the season turning while the land was being rebuilt in the background crashed the game ("Cannot read properties of null
// (reading 'cx')" in o3Render): the season's reset dropped the land's window but left the build running. Now the build is dropped too,
// and the land comes back in the new season's colours
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, out = { thrown:[] };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.interior = null; await fr(40);
    const cr = window.crashShow || null; const errs2 = []; const oe = console.error; console.error = (...a)=>{ errs2.push(String(a[0] && a[0].stack || a[0]).slice(0, 200)); return oe(...a); };
    for (let k=0;k<3;k++){ o3BuildStart(G.owPos.x + 30, G.owPos.y); o3BuildSlice(2); out.pend = !!O3.pend;
      GFX.season = (seasonIdx() + 1) % 4;   /* (the season has just turned) */
      try{ await fr(6); }catch(e){ out.thrown.push(String(e).slice(0, 200)); } }
    console.error = oe; out.errs = errs2.filter(t=>/cx|null/.test(t)); out.win = !!O3.win; out.season = GFX.season===seasonIdx(); out.pendAfter = !!O3.pend; return out; });
  console.log(JSON.stringify(r));
  A(r.pend, 'a build was under way when the season turned');
  A(!r.thrown.length && !r.errs.length && !errs.length, 'no crash: ' + JSON.stringify([r.thrown, r.errs, errs]));
  A(r.win && r.season, 'the land rebuilt in the new season: ' + JSON.stringify(r));
};
