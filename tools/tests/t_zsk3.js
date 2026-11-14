// (probe, not in ALL) the sculpted skeleton's and a ghost's parts by triangles: what makes them heavy
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); for (let i=0;i<60;i++) await new Promise(r=>requestAnimationFrame(r));
    const out = {}; const parts = h=>{ const by = new Map(); h.traverse(o=>{ if (!o.isMesh) return; const g = o.geometry, t = Math.round((g.index ? g.index.count : g.attributes.position.count)/3); const k = (o.name||'') + '|' + g.type + '|' + (g.userData && g.userData.key ? String(g.userData.key).slice(0, 40) : '') + (o.material && o.material.transparent ? ' T' : ''); const e = by.get(k) || [0, 0]; e[0] += t; e[1]++; by.set(k, e); });
      return [...by.entries()].sort((a, b)=>b[1][0] - a[1][0]).slice(0, 16).map(([k, v])=>k + ' ' + v[0] + 'x' + v[1]); };
    let sk = null; for (let i=0;i<600 && !sk;i++){ sk = sk3Instance({ nm:'skeleton', x:0, y:0 }); if (!sk) await new Promise(r=>requestAnimationFrame(r)); } out.sk = sk ? parts(sk.holder) : 'none';
    const gh = necroProxy({ k:'ghost', x:G.player.x+1, y:G.player.y }); m3dUpdate(gh, gh._pos, 0); const e = M3D.inst.get(gh); out.ghost = e ? parts(e.holder) : 'none'; out.ghostPaint = e && e.paint; out.gnm = gh.nm;
    return out; });
  console.log(JSON.stringify(r, null, 1));
};
