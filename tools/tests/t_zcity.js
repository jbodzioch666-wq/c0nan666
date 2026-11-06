// (art probe, not in ALL; RS-757) the Lost City's surface: the first land temple of world ZSEED entered, shots from the way in, in the
// plaza before the pyramid and with the camera turned. ZHOUR sets the hour (0-1 of the day, default 0.45); ZDIST the camera distance.
// Shots: shots/zcity_<n>.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ([seed, hour])=>{ goToCharCreate(); ccBegin(); wgRegenerate(seed); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{};
    G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; G.player.clock = DAY_LENGTH*hour; const m = G.ow.map; let c = null;
    for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && !owSeaSite(x, y)){ c = { x, y }; break; }
    if (!c) return { none:true };
    G.gameMode = 0; G.pendingDungeon = { x:c.x, y:c.y }; enterDungeonConfirm(); setUi('playing'); G.mon.forEach(mo=>mo.alive = false);
    for (let i=0;i<40;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const rows = []; for (let y=0;y<ROWS;y++){ let s = ''; for (let x=0;x<COLS;x++){ const t = G.map[x][y], d = G.dungeonDeco[x][y]; s += t===T_WALL ? (d==='jung' ? 'J' : d==='pyr' ? 'P' : '#') : t===T_STAIRSD ? '>' : x===G.player.x && y===G.player.y ? '@' : d ? d[0] : cityPaved(x, y) ? '.' : ','; } rows.push(s); }
    return { kind:G.siteKind, theme:fpTheme().key, env:fpEnv().night, rows, at:[G.player.x, G.player.y] }; }, [+(process.env.ZSEED || 12345), +(process.env.ZHOUR || 0.45)]);
  console.log(JSON.stringify({ kind:r.kind, theme:r.theme, night:r.env, at:r.at })); if (r.rows) console.log(r.rows.join('\n'));
  if (r.none) return;
  const P = await page.evaluate(()=>{ const P = cityPyr(); return { cx:COLS >> 1, y1:P.y1 }; });
  const shots = [[[P.cx, P.y1 + 8], 0, 22], [null, 0, 9], [[P.cx, P.y1 + 2], 0, 9], [[P.cx, P.y1 + 2], 1, 11], [[P.cx - 6, P.y1 + 6], 2, 9]];
  for (let i=0;i<shots.length;i++){ const [at, rot, dist] = shots[i];
    await page.evaluate(async ([at, rot, dist])=>{ if (at){ G.player.x = at[0]; G.player.y = at[1]; } ISO.rot = rot; ISO.dist = +(window.ZDIST || dist); for (let k=0;k<50;k++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } }, [at, rot, +(process.env.ZDIST || dist)]);
    await page.screenshot({ path: SHOTS + '/zcity_' + i + '.png' }); }
  console.log(JSON.stringify(await page.evaluate(()=>{ let tri = 0, jt = 0; FPD.world.traverse(o=>{ if (o.isMesh && o.geometry){ const n = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; tri += n; if (o.material && FPD.mats && Object.keys(FPD.mats).some(k=>/^cityJ/.test(k) && FPD.mats[k]===o.material)) jt += n; } }); return { worldTri:Math.round(tri), jungleTri:Math.round(jt), frameTri:FPD.r.info.render.triangles, calls:FPD.r.info.render.calls }; })));
  if (errs.length) console.log('errors: ' + errs.join(' | '));
};
