// RS-645: the fps meter's diagnosis on a phone. A phone's browser has no GPU timer, so the diagnosis (a double click on the meter, RS-355)
// never moved; now it reads each frame's own time there, starts from a double tap, and has a dungeon's steps - its torches' shadows,
// the figures, the cloth, the post-processing, the ambient occlusion and half the resolution - and puts everything back when it's done
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0;
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999; await fr(120);
    SET.fps = true; await fr(40); const P = PROF.gpu; P.r = FPD.r; P.ext = null;   /* (no GPU timer, as on a phone) */
    const before = { torches:(FPD.torches||[]).map(L=>L.castShadow), skinned:(()=>{ let n = 0; FPD.scene.traverse(o=>{ if (o.isSkinnedMesh && o.visible) n++; }); return n; })(), scale:window.__fpdScale };
    /* a double tap on the meter */
    let el = null; for (let i=0;i<200 && !(el = document.getElementById('fpsCounter'));i++) await fr(5); el.dispatchEvent(new Event('touchend')); await fr(2); el.dispatchEvent(new Event('touchend'));
    const on = DIAG.on; let t0 = performance.now(); while (DIAG.cyc < 1 && performance.now() - t0 < 120000) await fr(30);
    const res = Object.assign({}, DIAG.res), text = diagText(), frame = DIAG.frame, cyc = DIAG.cyc;
    diagToggle(); await fr(5);
    const after = { torches:(FPD.torches||[]).map(L=>L.castShadow), skinned:(()=>{ let n = 0; FPD.scene.traverse(o=>{ if (o.isSkinnedMesh && o.visible) n++; }); return n; })(), scale:window.__fpdScale, cloth:!!window.__noCloth, post:!!window.__noPost, ao:!!window.__noAo };
    return { on, frame, cyc, res:Object.fromEntries(Object.entries(res).map(([k, v])=>[k, v==null ? v : +v.toFixed(2)])), text:text.slice(0, 400), before, after, secs:+((performance.now() - t0)/1000).toFixed(1), mode:G.gameMode }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.mode===1 && r.on, 'a double tap on the meter starts the diagnosis, in a dungeon');
  A(r.frame && r.cyc >= 1 && /\(frame ms\)/.test(r.text), 'with no GPU timer it reads the frames\' own time, and says so');
  A(typeof r.res.base==='number' && r.res.base > 0, 'a base frame time read');
  for (const k of ['torchshadow', 'figures', 'cloth', 'post', 'halfres']) A(k in r.res, 'the dungeon\'s step "' + k + '" measured (or found nothing to switch)');
  A(r.after.torches.join()===r.before.torches.join() && r.after.skinned===r.before.skinned && r.after.scale===r.before.scale && !r.after.cloth && !r.after.post && !r.after.ao, 'everything put back when it stops');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
