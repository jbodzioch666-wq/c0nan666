// (probe, not in ALL) what the dungeon leaves on the graphics card: every object taken out of a 3D scene is noted, and its geometries and textures
// that are never disposed of afterwards (nor back in a scene) are counted by kind - over ZROUNDS (default 3) rounds into a dungeon, down three
// floors and out again
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  if (process.env.ZTIER) await page.evaluate(t=>{ window.__ztier = t; }, process.env.ZTIER);
  const r = await page.evaluate(async rounds=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (window.__ztier) setWorldSizeTier(window.__ztier); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0;
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync(); await fr(60);
    const T = THREE, gone = new Set(), stackOf = new WeakMap();
    const gd = T.BufferGeometry.prototype.dispose, td = T.Texture.prototype.dispose;
    T.BufferGeometry.prototype.dispose = function(){ this.__disp = 1; return gd.apply(this, arguments); }; T.Texture.prototype.dispose = function(){ this.__disp = 1; return td.apply(this, arguments); };
    const rm = T.Object3D.prototype.remove; T.Object3D.prototype.remove = function(...objs){ for (const o of objs) if (o && o.isObject3D){ gone.add(o); if (!stackOf.has(o)) stackOf.set(o, (new Error().stack||'').split('\n').slice(2, 5).map(s=>s.trim().replace(/^at /, '').replace(/\(.*?:(\d+):\d+\)/, ':$1')).join(' < ')); } return rm.apply(this, objs); };
    const cl = T.Object3D.prototype.clear; T.Object3D.prototype.clear = function(){ for (const o of this.children) gone.add(o); return cl.apply(this, arguments); };
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    const mem0 = FPD.r ? { geo:FPD.r.info.memory.geometries, tex:FPD.r.info.memory.textures } : null;
    for (let k=0; k<rounds; k++){ G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
      for (let d=1; d<=3; d++){ if (d > 1) loadLevel(d, false); setUi('playing'); await fr(60); for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive) try{ monsterDies(i); }catch(e){} await fr(30); }
      dgFinish(true); setUi('playing'); await fr(60); }
    /* what's in a scene now (not leaked) */
    const live = new Set(); for (const sc of [FPD.scene, O3.scene, typeof V3!=='undefined' && V3.scene]) if (sc) sc.traverse(o=>{ if (o.geometry) live.add(o.geometry); for (const m of [].concat(o.material||[])) for (const k in m) if (m[k] && m[k].isTexture) live.add(m[k]); });
    const tally = {}, seenG = new Set();
    for (const o of gone) o.traverse(c=>{ const items = []; if (c.geometry) items.push(['geo', c.geometry]); for (const m of [].concat(c.material||[])) for (const k in m) if (m[k] && m[k].isTexture) items.push(['tex:' + k, m[k]]);
      for (const [kind, it] of items){ if (it.__disp || live.has(it) || seenG.has(it)) continue; seenG.add(it); if (!(it._listeners && it._listeners.dispose && it._listeners.dispose.length)) continue;   /* (only what a renderer has uploaded: it listens for its disposal) */ let top = o; const where = stackOf.get(o) || '';
        const key = kind + ' | ' + (kind==='geo' ? it.type : (it.image && it.image.constructor ? it.image.constructor.name : '?') + (it.isDataTexture ? ' data' : '')) + ' | ' + (c.name || c.type) + ' | ' + where.slice(0, 160);
        tally[key] = (tally[key]||0) + 1; } });
    const mem1 = FPD.r ? { geo:FPD.r.info.memory.geometries, tex:FPD.r.info.memory.textures } : null;
    return { mem0, mem1, removed:gone.size, top:Object.entries(tally).sort((a, b)=>b[1] - a[1]).slice(0, 25) }; }, +(process.env.ZROUNDS || 3));
  console.log(JSON.stringify(r.mem0), JSON.stringify(r.mem1), 'removed', r.removed);
  for (const [k, n] of r.top) console.log(String(n).padStart(5), k);
  if (errs.length) console.log('ERRORS', errs.slice(0, 5).join(' | '));
};
