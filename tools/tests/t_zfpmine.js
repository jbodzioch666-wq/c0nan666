// probe: through your eyes in a mine, mine a vein and watch the hidden figure's swing (mineT) and the pick in your hands move
module.exports = async page=>{ page.setDefaultTimeout(0); page.on('pageerror', e=>console.log('PAGEERR', String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const r0 = await ev(()=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    let mx=-1, my=-1; for (let x=0;x<OW_COLS && mx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_MINE){ mx=x; my=y; break; }
    G.gameMode = 0; G.pendingDungeon = { x:mx, y:my }; enterDungeonConfirm(); setUi('playing');
    
    let at = null; for (let x=1;x<COLS-1 && !at;x++) for (let y=1;y<ROWS-1;y++){ const d = G.dungeonDeco[x][y]; if (d && /vein/.test(d)){ for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if (tileAt(x+dx, y+dy)===T_FLOOR && !G.dungeonDeco[x+dx][y+dy]){ at = { x, y, sx:x+dx, sy:y+dy, d }; break; } if (at) break; } }
    if (!at) return { none:true };
    const p = G.player; p.x = at.sx; p.y = at.sy; G.mon = []; p.tools = Object.assign(p.tools||{}, { pick:1 }); p.skills.mining = Math.max(p.skills.mining||0, 1e6);
    if (!SET.fpView) fpvToggle(); return { at, site:G.siteKind, mode:G.gameMode }; });
  console.log(JSON.stringify(r0)); if (r0.none) return;
  await wait(1500); if (process.env.ZM_P) await ev(v=>{ window.__zMineP = v; }, +process.env.ZM_P); if (process.env.ZM_B) await ev(v=>{ window.__zMineB = v[0]; window.__zMineU = v[1]; }, JSON.parse(process.env.ZM_B));
  const r1 = await ev(()=>{ const o = skOptions().find(o=>o.cave && /vein/.test(o.cave) || o.k==='mining'); if (!o) return { noopt:skOptions().map(o=>o.label) }; skDo(o); return { opt:o.label, g:!!G.gather }; });
  console.log(JSON.stringify(r1));
  for (let i=0;i<12;i++){ await wait(+(process.env.ZM_DT||250)); if (process.env.ZM_SHOT) await page.screenshot({ path:'tools/tests/out/zfpmine'+i+'.png' });
    console.log(JSON.stringify(await ev(()=>{ const e = ISO.player, h = FPW.held, m = h ? h.matrix.elements : null;
      return { ui:G.ui, g:G.gather && G.gather.o.k, fpv:fpv(), work:FPW.work, mir:!!FPW.mir, toolKey:e && e.toolKey, mineT:e && e.mineT!=null ? +e.mineT.toFixed(2) : null, mv:e && e.pos && e.pos.mv,
        held:m ? [m[12], m[13], m[14], m[4], m[5]].map(v=>+v.toFixed(3)) : null, pitch:+(FP.pitch||0).toFixed(2), eye:(()=>{ const v = fpwEyeOf(e); return v ? [v.x, v.y, v.z].map(x=>+x.toFixed(2)) : null; })(), aim:ISO.mineAim ? [ISO.mineAim.c.x, ISO.mineAim.c.y, ISO.mineAim.c.z].map(x=>+x.toFixed(2)) : null, sc:+e.holder.scale.x.toFixed(2), hand:e && e.rig && e.rig.arms ? +e.rig.arms[0].sh.rotation.x.toFixed(2) : null }; }))); }
};
