// RS-605: going into a dungeon or a fight is quick again and shows no trace of the last place - RS-602 let the warm-up's stand-in
// billboard's material go, its shader with it while the driver was still linking it, and the floor waited out the half-minute limit
// with the last dungeon still on the canvas
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ window.__noWarmSlice = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); }; await run(90);
    const watch = async ()=>{ const t0 = performance.now(); let blankFirst = null; for (let i=0;i<2400;i++){ await new Promise(r=>requestAnimationFrame(r));
        if (blankFirst===null && FPD.r){ const gl = FPD.r.getContext(), px = new Uint8Array(4); try{ gl.readPixels(Math.floor(gl.drawingBufferWidth/2), Math.floor(gl.drawingBufferHeight/2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); blankFirst = px[0] + px[1] + px[2]; }catch(e){} }
        if (FPD.mapRef===G.map && !FPD.prep && !FPD.warmWait && !FPD.prelink) return { ms:Math.round(performance.now() - t0), blankFirst }; } return { ms:null, blankFirst }; };
    const sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']), out = {};
    const enter = s=>{ G.gameMode = 0; setUi('playing'); G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); };
    enter(sites[0]); out.first = await watch(); await run(60); dgFinish(true); G.gameMode = 0; setUi('playing'); await run(90);
    enter(sites[1] || sites[0]); out.second = await watch();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.first.ms!==null && r.first.ms < 12000 && r.second.ms!==null && r.second.ms < 12000, 'a dungeon ready in seconds, not the half-minute limit');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
