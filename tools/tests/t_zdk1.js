// (art probe, not in ALL) FP-022's sculpted dungeon kit: the game's own view below ground, drawn and kit, into shots/zdk1_<name>.png;
// ZK_THEME picks the site kind's theme by walking to such a site (dungeon by default), ZK_WALL/ZK_CORNER yaw tweaks in quarter turns
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300))); page.on('console', m=>{ if (m.type()==='error') errs.push(m.text().slice(0, 300)); });
  const ev = (f, a)=>page.evaluate(f, a), wait = ms=>ev(async ms=>{ const t = performance.now() + ms; while (performance.now() < t){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, ms);
  const KIND = process.env.ZK_THEME || 'dungeon', TAG = process.env.ZK_TAG || '';
  await ev(([K, wy, cy])=>{ window.__noLock = true; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999; PFX.camp = -1e9;
    window.__dkWallYaw = wy*Math.PI/2; window.__dkCornerYaw = cy*Math.PI/2;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 400, [K])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.mon.length = 0; }, [KIND, +(process.env.ZK_WALL || 0), +(process.env.ZK_CORNER || 0)]);
  await wait(1500);
  const info = ()=>ev(()=>{ const out = { theme:FPD.theme, dk:dkOn(), inst:[] }; if (FPD.world) FPD.world.traverse(o=>{ if (o.isInstancedMesh) out.inst.push(o.userData.fk + ':' + o.count); }); out.meshes = FPD.world ? FPD.world.children.filter(o=>o.isMesh).map(o=>o.userData.fk) : null; return out; });
  const shot = n=>page.screenshot({ path:SHOTS + '/zdk1_' + TAG + n + '.png' });
  console.log('drawn', JSON.stringify(await info())); await shot('drawn');
  await ev(()=>{ SET.tpDungeon = 'model'; }); await wait(2500); console.log('model', JSON.stringify(await info())); await shot('model');
  await ev(()=>{ ISO.rot = (ISO.rot + 1) % 4; }); await wait(1200); await shot('model_r1');
  await ev(()=>{ ISO.rot = (ISO.rot + 1) % 4; }); await wait(1200); await shot('model_r2');
  if (errs.length) console.log('ERRS', errs.slice(0, 8).join(' | '));
};
