// (probe, not in ALL) the point lights each room has against the town's, and the fog in each: a room with more lights than the town's
// ceiling (gfxPadLights) keys every program afresh, so its first entry builds them all. ZSAVE a save
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const txt = fs.readFileSync(process.env.ZSAVE, 'utf8');
  const r = await page.evaluate(async txt=>{ window.__noWarmSlice = false; const d = JSON.parse(txt).data; importSaveText(txt); loadGame(d.id); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999; setUi('playing');
    G.interior = null; const t = G.ow.spawnPos; G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
    const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>{ renderGame(); ++i >= n ? res() : requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const settle = async ()=>{ const t0 = performance.now(); while (performance.now() - t0 < 30000){ await fr(1); if (!V3.warmWait && !V3.prelink && !V3.peopleQ && performance.now() - t0 > 800) break; } };
    const count = ()=>{ let pt = 0, pad = 0, sh = 0, other = []; V3.scene.traverse(o=>{ if (!o.isLight) return; if (o.isPointLight){ if (o.userData && o.userData.padL) pad++; else { pt++; if (o.castShadow) sh++; } } else other.push(o.type + (o.castShadow ? '*' : '')); }); return { pt, pad, sh, other:other.join(','), fog:V3.scene.fog ? V3.scene.fog.type : null, ceil:V3.lightCeil, progs:V3.renderer.info.programs.length }; };
    await settle(); const out = { town:count(), rooms:{} };
    for (const b of VILLAGE_BUILDINGS){ enterInterior(b.key); setUi('playing'); await settle(); out.rooms[b.key] = count(); exitInterior(); setUi('playing'); await settle(); }
    out.townAfter = count(); return out; }, txt);
  console.log(JSON.stringify(r, null, 1));
};
