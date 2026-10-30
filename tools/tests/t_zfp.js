// probe: a dungeon seen through the old first-person camera (ISO.on false), facing each way, and the usual view. Shots: shots/zfp-*.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const run = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    await run(60); const cv = ()=>FPD.r.domElement.toDataURL('image/jpeg', 0.85); out.iso = cv();
    SET.fpView = true; for (let f=0; f<4; f++){ G.player.facing = f; await run(40); out['fp' + f] = cv(); }
    /* a monster in front of you */
    { const p = G.player, F = FACING_VECT[p.facing], m = G.mon.find(m=>m.alive); if (m){ for (let k=2;k<5;k++){ const x = p.x + F[0]*k, y = p.y + F[1]*k; if (isoPassable(x, y)){ m.x = x; m.y = y; m.ai = 'idle'; break; } } await run(60); out.foe = cv(); out.foeAt = [m.x - p.x, m.y - p.y, m.name]; } }
    return out; });
  for (const k in r) if (typeof r[k]==='string' && r[k].startsWith('data:')) fs.writeFileSync(SHOTS + '/zfp-' + k + '.jpg', Buffer.from(r[k].split(',')[1], 'base64'));
  console.log(JSON.stringify(r.foeAt)); if (errs.length) console.log('ERRS', errs.join(' | '));
};
