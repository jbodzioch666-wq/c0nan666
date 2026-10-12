// RS-353: the fps meter says where a frame's time goes - "3d" (the view's draw submission), "hud" (the HUD and DOM work
// round it), "loop" (the rest of the frame) and "gpu" (the card's own time, where the browser can say) - so a slow machine
// can be read instead of guessed at. Measured only while the meter is on
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const t = townList()[0]; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const out = { wrapped: !!renderGame.__prof && !!v3Render.__prof };
    SET.fps = false; for (let i=0;i<3;i++) renderGame(); out.offCost = Object.keys(PROF.t).length;
    SET.fps = true; PROF.t = {}; let ts = 5000; for (let i=0;i<12;i++){ frameLoop(ts); ts += 16; await new Promise(r=>setTimeout(r, 10)); }
    out.keys = Object.keys(PROF.t).sort(); out.d3 = PROF.t['3d']||0; out.game = PROF.t.game||0; out.loop = PROF.t.loop||0;
    FPSC.t0 = ts - 600; FPSC.n = 12; fpsTick(ts); out.meter = document.getElementById('fpsCounter').textContent; SET.fps = false; fpsTick(ts + 1000);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.wrapped, 'the view and game renders are timed');
  A(r.offCost===0, 'nothing is measured while the meter is off');
  A(r.d3 > 0 && r.game >= r.d3 && r.loop >= r.game, 'the 3D view sits inside the game render inside the loop');
  A(/\d+ fps \u00b7 [^\n]+\n3d \d+\.\d hud \d+\.\d loop \d+\.\d gpu (\d+\.\d|-) ms$/.test(r.meter), 'the meter reads the split on its second line: '+r.meter);
};
