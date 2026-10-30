// probe: a roadside fight seen in first person. Shots: shots/zfpfield-*.jpg
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const run = async n=>{ const t = performance.now() + n*20; for (let i=0; i<n || performance.now() < t; i++){ renderGame(); await new Promise(r=>requestAnimationFrame(r)); } }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    randomEncounter(false); setUi('playing'); SET.fpView = true; await run(60);
    const cv = ()=>FPD.r.domElement.toDataURL('image/jpeg', 0.85);
    /* face the nearest foe */
    const p = G.player, m = G.mon.filter(m=>m.alive).sort((a, b)=>Math.hypot(a.x-p.x, a.y-p.y) - Math.hypot(b.x-p.x, b.y-p.y))[0];
    out.info = { mode:G.gameMode, fpv:fpv(), y:FPD.cam.position.y, foe:m && [m.name, m.x-p.x, m.y-p.y], ceil:FPD.world.children.some(c=>c.userData.fk==='ceil') };
    if (m){ const dx = m.x-p.x, dy = m.y-p.y; p.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0); }
    await run(40); out.a = cv(); p.facing = (p.facing+2)%4; await run(40); out.b = cv();
    return out; });
  for (const k in r) if (typeof r[k]==='string' && r[k].startsWith('data:')) fs.writeFileSync(SHOTS + '/zfpfield-' + k + '.jpg', Buffer.from(r[k].split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info)); if (errs.length) console.log('ERRS', errs.join(' | '));
};
