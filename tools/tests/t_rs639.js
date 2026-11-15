// RS-639: the names and badges on the globe's chart stand upright on the polar faces too - drawn for the globe, each is turned back by
// the angle the face's grid lies at on the screen. Shots: shots/rs639-north.png (the north face), shots/rs639-equator.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 200)); });
  const shot = async (face, nm)=>{ const r = await page.evaluate(async face=>{ const raf = ()=>new Promise(r=>requestAnimationFrame(r)), N = cubeN(), o = CUBE_O[face];
      G.owZoomCenter = { x:o[0]*N + Math.round(N*0.3), y:o[1]*N + Math.round(N*0.35) }; GLOBE.distGoal = globeZsDist(3); for (let i=0;i<200;i++) await raf();
      /* what a name drawn in the chart ends at on screen: the turn the chart's writing gets, against the grid's own angle */
      const an = GLOBE.an || 0, turned = (()=>{ let got = null; const un = globeUprightOn(-an), f = ctx.fillText; ctx.save(); const keep = ctx.getTransform(); ctx.fillText = function(t, x, y){ got = this.getTransform(); }; try{ ctx.fillText('x', 10, 10); } finally { ctx.restore(); } un(); return got ? Math.atan2(got.b, got.a) : 0; })();
      /* (the test's own fillText stands in for drawing: the upright wrapper turns it by -an) */
      return { face, an:+an.toFixed(2), net:+(an + 0).toFixed(2), pa:GLOBE.pa }; }, face);
    await page.screenshot({ path: SHOTS + '/rs639-' + nm + '.png' }); return r; };
  await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    owSeenArr().fill(1); G.ow.seenVer = (G.ow.seenVer||0) + 1; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); toggleOwZoom(); for (let i=0;i<30;i++) await new Promise(r=>requestAnimationFrame(r)); });
  const n = await shot(4, 'north'), e = await shot(1, 'equator');
  /* the wrapper itself: a name drawn at (100, 50) with the chart turned by a, comes out turned by -a about that point */
  const w = await page.evaluate(()=>{ const out = []; for (const a of [0.8, -1.4]){ let m = null; const f0 = CanvasRenderingContext2D.prototype.fillText; ctx.fillText = function(){ m = this.getTransform(); };
      const un = globeUprightOn(a); try{ ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillText('x', 100, 50); ctx.restore(); } finally { un(); delete ctx.fillText; } out.push({ a, rot:m ? +Math.atan2(m.b, m.a).toFixed(2) : null, at:m ? [+m.e.toFixed(1), +m.f.toFixed(1)] : null }); } return out; });
  const r = { n, e, w }; console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(Math.abs(n.an) > 0.12 && n.pa > 0.9, 'on the north face the grid lies turned on the screen, the chart laid over it');
  A(Math.abs(e.an) < 0.12, 'on the equator it lies square');
  A(w.every(x=>Math.abs(x.rot - x.a) < 0.01 && Math.abs(x.at[0] - 100) < 0.01 && Math.abs(x.at[1] - 50) < 0.01), 'writing is turned about its own place by the turn asked');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
