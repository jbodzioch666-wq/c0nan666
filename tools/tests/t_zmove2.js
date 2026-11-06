// (probe, not in ALL) where a step fails on a Planet: each stage of a move by hand
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); setWorldSizeTier('planet'); confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; if (G.gameMode===3){ G.gameMode = 0; G.interior = null; }
    for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    const out = { pos:[G.owPos.x, G.owPos.y], frame:O3F.face, id:O3F.id, turn:o3FrameTurn(G.owPos.x, G.owPos.y), dirG:o3DirToG(0, -1), nb:owNb(G.owPos.x, G.owPos.y, 0, -1), lag:figLag(), lagMax:FIG_LAG_MAX, inTick:ISO.inTick, inPath:ISO.inPath, sleep:!!G.sleepFx, ui:G.ui };
    const nb = out.nb; out.tile = nb ? G.ow.map[nb[0]][nb[1]] : null; out.pass = nb ? o3Passable(nb[0], nb[1]) : null; out.diag = diagClear(G.owPos.x, G.owPos.y, 0, -1, o3Passable);
    const p0 = [G.owPos.x, G.owPos.y]; try{ tryMoveOverworld(0, -1); }catch(e){ out.tmErr = String(e); } out.afterTM = [G.owPos.x, G.owPos.y];
    G.owPos = { x:p0[0], y:p0[1] }; try{ moveDir(0, -1); }catch(e){ out.mdErr = String(e); } out.afterMD = [G.owPos.x, G.owPos.y];
    G.owPos = { x:p0[0], y:p0[1] }; try{ moveInput(0, -1); }catch(e){ out.miErr = String(e) + ' ' + (e.stack||'').split('\n').slice(0,3).join('/'); } out.afterMI = [G.owPos.x, G.owPos.y]; out.buf = G.moveBuf;
    return out; });
  console.log(JSON.stringify(r)); if (errs.length) console.log('ERRORS', errs.slice(0, 8).join(' || '));
};
