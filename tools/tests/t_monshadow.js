// RS-163: monsters have no round blob - they cast real shadows from the torches; the fps meter sits centred under the clock bar
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    let dx=-1, dy=-1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx=x; dy=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<10;i++){ renderGame(); await new Promise(r=>setTimeout(r, 60)); }
    // RS-165: torches spaced evenly along straight walls - none within six tiles of another
    const ts = []; for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) if (G.dungeonDeco[x][y]==='torch') ts.push([x,y]);
    let minGap = 99; for (let i=0;i<ts.length;i++) for (let j=i+1;j<ts.length;j++) minGap = Math.min(minGap, Math.hypot(ts[i][0]-ts[j][0], ts[i][1]-ts[j][1]));
    const straight = ts.every(([x,y])=>[G.map[x-1][y], G.map[x+1][y], G.map[x][y-1], G.map[x][y+1]].filter(t=>t===T_FLOOR).length===1);
    const torches = { n:ts.length, minGap:+minGap.toFixed(1), straight };
    // RS-167: mid-step, the lantern stays over you (it used to sit on the tile you were heading for, throwing a long shadow every step)
    let step = null; for (const [dx2,dy2] of [[1,0],[0,1],[-1,0],[0,-1]]) if (tileAt(G.player.x+dx2, G.player.y+dy2)===T_FLOOR){ moveDir(dx2, dy2); renderGame(); await new Promise(r=>requestAnimationFrame(r)); renderGame();
      const pp = ISO.player.pos, L = FPD.lan.position; step = { gap:+Math.hypot(L.x - pp.x, L.z - pp.y).toFixed(2), tileGap:+Math.hypot(L.x - (G.player.x+0.5), L.z - (G.player.y+0.5)).toFixed(2) }; break; }
    const live = [...M3D.live]; let blobs = 0, casters = 0, monsters = 0;
    for (const e of live){ monsters++; e.holder.traverse(o=>{ if (o.isMesh && o.material===m3dShadowMat()) blobs++; if (o.isMesh && o.castShadow) casters++; }); }
    const lit = FPD.torches.filter(L=>L.castShadow).length, lantern = !!(FPD.lan && FPD.lan.castShadow), lanNear = FPD.lan ? FPD.lan.shadow.camera.near : 0;
    // a fresh creature, whatever is about
    const gm = { nm:'goblin', sym:'g' }, gpt = (()=>{ try{ return m3dPortrait(gm); }catch(err){ return null; } })(), e = gpt ? m3dInstance(gm, gpt) : null;
    let fb = 0, fc = 0; if (e) e.holder.traverse(o=>{ if (o.isMesh && o.material===m3dShadowMat()) fb++; if (o.isMesh && o.castShadow) fc++; });
    SET.fps = true; for (let i=0;i<40;i++) await new Promise(r=>requestAnimationFrame(r));
    const fps = document.getElementById('fpsCounter'), ck = document.getElementById('dhClock'), a = fps && fps.getBoundingClientRect(), b = ck && ck.getBoundingClientRect();
    SET.fps = false;
    return { step, torches, lantern, lanNear, monsters, blobs, casters, lit, fresh:e ? { blobs:fb, casters:fc } : null, fps:a && b ? { under:a.top >= b.bottom - 1 && a.top <= b.bottom + 12, centre:Math.round((a.left + a.width/2) - (b.left + b.width/2)) } : null };
  });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.torches.n >= 2 && r.torches.minGap >= 6 && r.torches.straight, 'torches evenly spaced along straight walls');
  A(!r.step || r.step.gap <= 0.12, 'the lantern stays over you mid-step');
  A(r.blobs===0 && (!r.fresh || r.fresh.blobs===0), 'no round blob under any creature');
  A((r.monsters===0 || r.casters > 0) && (!r.fresh || r.fresh.casters > 0), 'creatures cast real shadows');
  A(r.lit > 0 && r.lantern && r.lanNear >= 0.7, 'the torches and your lantern cast shadows - but not of your own hat, right under the lantern');
  A(r.fps && r.fps.under && Math.abs(r.fps.centre) <= 2, 'the fps meter is centred under the clock bar');
};
