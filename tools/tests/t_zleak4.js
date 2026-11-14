// (probe, not in ALL) geometries left on the card with nothing using them: every geometry a renderer uploads is noted (three listens for its
// disposal then); after ZROUNDS rounds into a dungeon (three floors) and out, those still uploaded, never disposed of, and in no scene and no
// kept template are counted by kind - with the stack of the frame that first drew each. ZTIER=planet
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ([rounds, tier])=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const T = THREE, up = new Map(), site = ()=>(new Error().stack||'').split(String.fromCharCode(10)).slice(3, 9).map(s=>s.trim().replace(/^at /, '').replace(/ \(.*?:(\d+):\d+\)$/, ':$1')).filter(s=>!/^[a-zA-Z$_]{1,3}:\d+$/.test(s) && !/three/.test(s)).slice(0, 4).join(' < ');
    const upT = new Map();
    const ael = T.EventDispatcher.prototype.addEventListener; T.EventDispatcher.prototype.addEventListener = function(type, fn){ if (type==='dispose' && this.isBufferGeometry && !up.has(this)) up.set(this, site()); if (type==='dispose' && this.isTexture && !upT.has(this)) upT.set(this, G.gameMode + '@' + (G.depth||0)); return ael.apply(this, arguments); };
    const txd = T.Texture.prototype.dispose; T.Texture.prototype.dispose = function(){ upT.delete(this); return txd.apply(this, arguments); };
    const gd = T.BufferGeometry.prototype.dispose; T.BufferGeometry.prototype.dispose = function(){ up.delete(this); return gd.apply(this, arguments); };
    goToCharCreate(); ccBegin(); if (tier) setWorldSizeTier(tier); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0;
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync(); await fr(60);
    let dx = -1, dy = -1, bd = 1e9; const sp = G.owPos; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ const d = Math.hypot(x - sp.x, y - sp.y); if (d < bd){ bd = d; dx = x; dy = y; } }
    const first = up.size;
    for (let k=0; k<rounds; k++){ G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
      for (let d=1; d<=3; d++){ if (d > 1) loadLevel(d, false); setUi('playing'); await fr(60);
        const fl = []; for (let x=1;x<COLS-1;x++) for (let y=1;y<ROWS-1;y++) if (G.map[x][y]===T_FLOOR) fl.push([x, y]);
        for (let w=0; w<3; w++){ const [x, y] = fl[(k*7 + d*13 + w*31) % fl.length]; ISO.path = isoFindPath(x, y, false) || []; ISO.nextStep = 0; await fr(40); }
        for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive) try{ monsterDies(i); }catch(e){} await fr(30); }
      dgFinish(true); setUi('playing'); await fr(60); }
    const used = new Set(); for (const sc of [FPD.scene, O3.scene, typeof V3!=='undefined' && V3.scene, typeof GLOBE!=='undefined' && GLOBE.scene]) if (sc) sc.traverse(o=>{ if (o.geometry) used.add(o.geometry); });
    for (const t of M3D.tpl.values()) t.traverse(o=>{ if (o.geometry) used.add(o.geometry); });
    const tally = {}; let orphans = 0, verts = 0;
    for (const [g, st] of up){ if (used.has(g)) continue; orphans++; const n = g.attributes && g.attributes.position ? g.attributes.position.count : 0; verts += n;
      const k = g.type + (g.userData && Object.keys(g.userData).length ? ' {' + Object.keys(g.userData).join(',') + '}' : '') + ' | ' + st.slice(0, 200); (tally[k] = tally[k] || [0, 0]); tally[k][0]++; tally[k][1] += n; }
    const usedT = new Set(), noteT = o=>{ for (const m of [].concat(o.material||[])) for (const k in m){ const v = m[k]; if (v && v.isTexture) usedT.add(v); } if (o.isLight && o.shadow && o.shadow.map) usedT.add(o.shadow.map.texture); };
    for (const sc of [FPD.scene, O3.scene, typeof V3!=='undefined' && V3.scene, typeof GLOBE!=='undefined' && GLOBE.scene]) if (sc) sc.traverse(noteT); for (const t of M3D.tpl.values()) t.traverse(noteT);
    const tt = {}; let tOrph = 0; for (const [x, when] of upT){ if (usedT.has(x)) continue; tOrph++; const im = x.image, k = (x.isRenderTargetTexture ? 'RT ' : '') + (x.isDataTexture ? 'data ' : '') + (x.isCanvasTexture ? 'canvas ' : '') + (im ? (im.width||'?') + 'x' + (im.height||'?') : 'noimg') + (x.name ? ' ' + x.name : '') + (x.userData && Object.keys(x.userData).length ? ' {' + Object.keys(x.userData).join(',') + '}' : '') + ' made in ' + when; tt[k] = (tt[k]||0) + 1; }
    return { tex:{ uploaded:upT.size, orphans:tOrph, top:Object.entries(tt).sort((a, b)=>b[1] - a[1]).slice(0, 15) }, first, uploaded:up.size, orphans, verts, mem:FPD.r && FPD.r.info.memory, top:Object.entries(tally).sort((a, b)=>b[1][0] - a[1][0]).slice(0, 18) }; }, [+(process.env.ZROUNDS || 4), process.env.ZTIER || '']);
  console.log('uploaded at start', r.first, 'now', r.uploaded, 'orphans', r.orphans, 'verts', r.verts, JSON.stringify(r.mem));
  if (!process.env.ZTEX) for (const [k, [n, v]] of r.top) console.log(String(n).padStart(5), String(v).padStart(8), k);
  console.log('textures uploaded', r.tex.uploaded, 'orphans', r.tex.orphans); for (const [k, n] of r.tex.top) console.log(String(n).padStart(5), k);
  if (errs.length) console.log('ERRORS', errs.slice(0, 5).join(' | '));
};
