// (probe, not in ALL) going down and back up a dungeon's floors over and over: the graphics card's geometries and textures after each
// trip - a cache levels off, a leak climbs; and what's new in the scene graph by kind
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.hp = G.player.maxHp = 99999;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing'); G.dungeonMaxDepth = Math.max(G.dungeonMaxDepth, 4);
    const run = async n=>{ for (let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); }; await run(120);
    const R = FPD.r, out = [], mem = ()=>({ geos:R.info.memory.geometries, tex:R.info.memory.textures, progs:R.info.programs.length });
    /* every geometry and texture three has uploaded, by where it came from: kept to see what survives */
    const seenG = new Set(), seenT = new Set();
    let prevT = new Map(); const left = []; const snapKinds = ()=>{ const now = new Map(); FPD.scene.traverse(o=>{ if (o.geometry) seenG.add(o.geometry); for (const m of [].concat(o.material||[])){ if (!m) continue; for (const k in m){ const v = m[k]; if (v && v.isTexture){ seenT.add(v); now.set(v, (o.name||o.type) + '.' + k + ' ' + (m.name||m.type) + ' ' + (v.image ? (v.image.width + 'x' + v.image.height + ' ' + (v.image.tagName||v.image.constructor.name)) : '')); } } if (m.uniforms) for (const u in m.uniforms){ const v = m.uniforms[u].value; if (v && v.isTexture){ seenT.add(v); now.set(v, (o.name||o.type) + ' uniform ' + u + ' ' + (v.image ? v.image.width + 'x' + v.image.height : '')); } } } }); for (const [v, d] of prevT) if (!now.has(v)) left.push(d); prevT = now; };
    out.push(Object.assign({ trip:0 }, mem()));
    const drawn = new Map(), freed = new Set(), dsp = THREE.Texture.prototype.dispose; THREE.Texture.prototype.dispose = function(){ freed.add(this); return dsp.apply(this, arguments); };
    const rr = R.render.bind(R); R.render = function(sc, cam){ sc.traverse(o=>{ if (!o.visible) return; for (const m of [].concat(o.material||[])){ if (!m) continue; for (const k in m){ const v = m[k]; if (v && v.isTexture && !drawn.has(v)) drawn.set(v, { trip, what:(o.name||o.type) + '.' + k + ' ' + (m.name||m.type) + ' ' + (v.image ? (v.image.width + 'x' + v.image.height) : '') + (sc===FPD.scene ? '' : ' [other scene]') }); } if (m.uniforms) for (const u in m.uniforms){ const v = m.uniforms[u].value; if (v && v.isTexture && !drawn.has(v)) drawn.set(v, { trip, what:(o.name||o.type) + ' u.' + u + ' ' + (v.image ? v.image.width + 'x' + v.image.height : '') }); } } }); return rr(sc, cam); };
    const gl = R.getContext(), live = new Map(), mk = gl.createTexture.bind(gl), del = gl.deleteTexture.bind(gl); let trip = 0;
    gl.createTexture = function(){ const t = mk(); live.set(t, { trip, at:(new Error().stack||'').split(String.fromCharCode(10)).slice(2, 9).map(l=>l.trim().replace(/^at /, '').replace(/ \(.*depthcrawl.html:/, ' (')).join(' < ') }); return t; };
    gl.deleteTexture = function(t){ live.delete(t); return del(t); };
    for (let k=1;k<=10;k++){ trip = k; saveLevelCache(G.depth); loadLevel(2 + (k%2), k%2===0, false); setUi('playing'); for (const m of G.mon) m.alive = false; await run(90); snapKinds(); out.push(Object.assign({ trip:k, depth:G.depth }, mem())); }
    /* how many of the geometries ever drawn are still in the scene now */
    const inScene = new Set(); FPD.scene.traverse(o=>{ if (o.geometry) inScene.add(o.geometry); });
    const gone = [...seenG].filter(g=>!inScene.has(g)), types = {}; for (const g of gone){ const k = g.type + (g.userData && g.userData.fpd ? ':fpd' : ''); types[k] = (types[k]||0) + 1; }
    const endT = new Set(); FPD.scene.traverse(o=>{ for (const m of [].concat(o.material||[])){ if (!m) continue; for (const k in m) if (m[k] && m[k].isTexture) endT.add(m[k]); if (m.uniforms) for (const u in m.uniforms){ const v = m.uniforms[u].value; if (v && v.isTexture) endT.add(v); } } }); const cand = new Map(); for (const [v, d] of drawn){ if (d.trip < 2 || freed.has(v) || endT.has(v)) continue; cand.set(d.what, (cand.get(d.what)||0) + 1); } out.push({ leaked:[...cand.entries()] });
    const byAt = new Map(); for (const v of live.values()){ if (v.trip < 2) continue; byAt.set(v.at, (byAt.get(v.at)||0) + 1); } out.push({ liveMade:[...byAt.entries()].sort((a, b)=>b[1] - a[1]).slice(0, 6) }); out.push({ everDrawn:seenG.size, nowDrawn:inScene.size, notDrawnNow:gone.length, byType:types, texEver:seenT.size });
    return out; });
  for (const x of r) console.log(JSON.stringify(x));
};
