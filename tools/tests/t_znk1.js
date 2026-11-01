// (art probe, not in ALL) FP-023's nature kit on the open land: the game's own view by a forest, drawn and kit, into shots/znk1_<name>.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const TAG = process.env.ZN_TAG || '', TILE = process.env.ZN_TILE || 'forest';
  await ev(TILE=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4; PFX.camp = -1e9;
    const want = { forest:OW_FOREST, grass:OW_GRASS, swamp:OW_SWAMP, tundra:OW_TUNDRA, desert:OW_DESERT }[TILE], m = G.ow.map; let best = null, bd = 1e9;
    for (let x=2;x<OW_COLS-2;x++) for (let y=2;y<OW_ROWS-2;y++){ if (m[x][y]!==OW_GRASS) continue; let n = 0; for (let i=-2;i<=2;i++) for (let j=-2;j<=2;j++) if (m[x+i][y+j]===want) n++; if (n < 8) continue; const d = Math.hypot(x - G.owPos.x, y - G.owPos.y); if (d < bd){ bd = d; best = [x, y]; } }
    if (best){ G.owPos = { x:best[0], y:best[1] }; } G.gameMode = 0; setUi('playing'); }, TILE);
  await wait(3500);
  const info = ()=>ev(()=>{ const out = { on:nkOn(), kinds:{} }; if (O3.world) O3.world.traverse(o=>{ if (o.isInstancedMesh && o.userData.kind){ const k = o.userData.kind + (o.material.map ? '*' : ''); out.kinds[k] = (out.kinds[k]||0) + o.count; } }); return out; });
  const shot = n=>page.screenshot({ path:SHOTS + '/znk1_' + TAG + n + '.png' });
  console.log('drawn', JSON.stringify(await info())); await shot('drawn');
  await ev(()=>{ setSetting('tpLand', 'model'); }); await wait(4000); console.log('model', JSON.stringify(await info())); await shot('model');
  await ev(()=>{ ISO.rot = (ISO.rot + 1) % 4; }); await wait(1500); await shot('model_r1');
  await ev(()=>{ setSetting('tpLand', 'drawn'); }); await wait(3000); console.log('back', JSON.stringify(await info()));
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
