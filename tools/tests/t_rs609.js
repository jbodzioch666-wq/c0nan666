// RS-609: into a dungeon's portal - you walk up to the gate, it flares, and you are drawn into it (turning, shrinking, lifting into its
// light) before the dark and the road; you come out at your full size. And the RS-608 robe's top carries none of the hem's runes or trim.
// Shots: shots/rs609-walk.png, shots/rs609-drawn.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 300)));
  const out = await page.evaluate(async ()=>{ window.__trans = true; goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const out = {};
    /* the robe's top: its uvs for the hem's layers all on the blank middle of their textures */
    { G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); const e = m3dInstance({}, rsPlayerLook()), sk = e.rig.skirt, q = sk.geometry.attributes.position, uv = sk.geometry.attributes.uv, yJ = sk.userData.extFrom; let bad = 0, n = 0;
      for (let i=0;i<q.count;i++) if (q.getY(i) + sk.position.y > yJ + 0.01){ n++; if (Math.abs(uv.getY(i) - 0.5) > 1e-4) bad++; } out.robeUv = [n, bad]; }
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (const m of G.mon) m.alive = 0; for (let i=0;i<200;i++) await new Promise(r=>requestAnimationFrame(r));
    let ex = null; for (let x=0;x<COLS && !ex;x++) for (let y=0;y<ROWS;y++) if (G.map[x][y]===T_EXIT){ ex = { x, y }; break; }
    if (!ex) return { none:true };
    let st = null; for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){ const x = ex.x + dx, y = ex.y + dy; if (G.map[x] && G.map[x][y]===T_FLOOR){ st = { x, y }; break; } }
    G.player.x = st.x; G.player.y = st.y; for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r)); await new Promise(r=>setTimeout(r, 3000));
    out.s0 = ISO.player.holder.scale.x; moveDir(ex.x - st.x, ex.y - st.y); out.started = !!FPD.portal; out.modeAt = G.gameMode; return out; });
  if (out.none) throw new Error('no portal out on the first floor');
  await page.waitForTimeout(300); await page.screenshot({ path: SHOTS + '/rs609-walk.png' });
  await page.waitForTimeout(650); await page.screenshot({ path: SHOTS + '/rs609-drawn.png' });
  Object.assign(out, await page.evaluate(()=>{ const S = FPD.portal; return { mid:S ? { flare:+(S.pt.flare||0).toFixed(2), sc:+ISO.player.holder.scale.x.toFixed(3), h:+ISO.player.holder.position.y.toFixed(2) } : null, modeMid:G.gameMode }; }));
  await page.waitForTimeout(1800);
  Object.assign(out, await page.evaluate(()=>({ end:{ portal:!!FPD.portal, mode:G.gameMode, sc:ISO.player ? +ISO.player.holder.scale.x.toFixed(3) : null, fade:(document.getElementById('transFade')||{ style:{} }).style.display } })));
  console.log(JSON.stringify(out));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(out)); };
  A(out.robeUv[0] > 0 && out.robeUv[1]===0, 'the robe above the waist reads none of the hem\'s runes or trim');
  A(out.started && out.modeAt===1, 'stepping onto the portal starts the walk in, still in the dungeon');
  A(out.mid && out.modeMid===1 && out.mid.flare > 0.5 && out.mid.sc < out.s0*0.8 && out.mid.h > 0.03, 'half way: the gate flaring, you shrinking and lifting into it');
  A(!out.end.portal && out.end.mode===0, 'then out on the road');
  A(out.end.sc==null || Math.abs(out.end.sc - out.s0) < 1e-3, 'at your full size again');
  A(out.end.fade!=='block', 'the dark lifted');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
