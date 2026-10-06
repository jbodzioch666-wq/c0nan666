// RS-163: monsters have no round blob - they cast real shadows from the torches; the fps meter sits centred under the clock bar
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    const live = [...M3D.live]; let blobs = 0, casters = 0, monsters = 0;
    for (const e of live){ monsters++; e.holder.traverse(o=>{ if (o.isMesh && o.material===m3dShadowMat()) blobs++; if (o.isMesh && o.castShadow) casters++; }); }
    const lit = FPD.torches.filter(L=>L.castShadow).length, lantern = !!(FPD.lan && FPD.lan.castShadow);
    // a fresh creature, whatever is about
    const gm = { nm:'goblin', sym:'g' }, gpt = (()=>{ try{ return m3dPortrait(gm); }catch(err){ return null; } })(), e = gpt ? m3dInstance(gm, gpt) : null;
    let fb = 0, fc = 0; if (e) e.holder.traverse(o=>{ if (o.isMesh && o.material===m3dShadowMat()) fb++; if (o.isMesh && o.castShadow) fc++; });
    SET.fps = true; for (let i=0;i<40;i++) await new Promise(r=>requestAnimationFrame(r));
    const fps = document.getElementById('fpsCounter'), ck = document.getElementById('dhClock'), a = fps && fps.getBoundingClientRect(), b = ck && ck.getBoundingClientRect();
    SET.fps = false;
    return { lantern, monsters, blobs, casters, lit, fresh:e ? { blobs:fb, casters:fc } : null, fps:a && b ? { under:a.top >= b.bottom - 1 && a.top <= b.bottom + 12, centre:Math.round((a.left + a.width/2) - (b.left + b.width/2)) } : null };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.blobs===0 && (!r.fresh || r.fresh.blobs===0), 'no round blob under any creature');
  A((r.monsters===0 || r.casters > 0) && (!r.fresh || r.fresh.casters > 0), 'creatures cast real shadows');
  A(r.lit > 0 && r.lantern, 'the torches and your lantern cast shadows');
  A(r.fps && r.fps.under && Math.abs(r.fps.centre) <= 2, 'the fps meter is centred under the clock bar');
};
