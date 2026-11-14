// (probe, not in ALL) the textures a session makes and keeps: each texture made is marked with where it was made; after ZROUNDS rounds into a
// dungeon (three floors) and out, the places whose textures are still on the card (uploaded, never disposed of) are listed, most first
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  await page.addInitScript(()=>{ window.__texSites = new Map(); });
  const r = await page.evaluate(async rounds=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    const T = THREE, made = [];
    const wrap = name=>{ const C0 = T[name]; T[name] = class extends C0 { constructor(...a){ super(...a); made.push(this); this.__site = (new Error().stack||'').split('\n').slice(2, 5).map(s=>s.trim().replace(/^at /, '').replace(/\(.*?:(\d+):\d+\)/, ':$1')).join(' < '); } }; };
    for (const n of ['CanvasTexture', 'DataTexture', 'Texture']) wrap(n);
    const site = ()=>(new Error().stack||'').split(String.fromCharCode(10)).slice(3, 6).map(s=>s.trim()).join(' < ');
    const tc = T.Texture.prototype.clone; T.Texture.prototype.clone = function(){ const c = tc.apply(this, arguments); if (!made.includes(c)) made.push(c); c.__site = 'clone of ' + ((this.image && this.image.width) || '?') + 'px: ' + site(); return c; };   /* (and every copy, of whatever was made before) */
    goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0;
    for (const k of ['attack','strength','defence','hitpoints']) G.player.skills[k] = SK_XP[70]; rsSync(); await fr(60);
    let dx = -1, dy = -1; for (let x=0;x<OW_COLS && dx<0;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dx = x; dy = y; break; }
    const snap = ()=>{ const by = {}; for (const t of made){ const up = !!(t._listeners && t._listeners.dispose && t._listeners.dispose.length); if (!up) continue; const k = t.__site || '?'; by[k] = (by[k]||0) + 1; } return by; };
    const per = [];
    for (let k=0; k<rounds; k++){ G.owPos = { x:dx, y:dy }; G.pendingDungeon = { x:dx, y:dy }; enterDungeonConfirm(); setUi('playing'); G.player.hp = G.player.maxHp = 99999;
      for (let d=1; d<=3; d++){ if (d > 1) loadLevel(d, false); setUi('playing'); await fr(60); for (let i=0;i<G.mon.length;i++) if (G.mon[i].alive) try{ monsterDies(i); }catch(e){} await fr(30); }
      dgFinish(true); setUi('playing'); await fr(60); per.push(snap()); }
    /* the places whose kept textures grow from the first round to the last */
    const a = per[0], b = per[per.length - 1], keys = new Set([...Object.keys(a), ...Object.keys(b)]), grow = [];
    for (const k of keys){ const d = (b[k]||0) - (a[k]||0); if (d > 0) grow.push([d, b[k]||0, k]); }
    return { made:made.length, grow:grow.sort((x, y)=>y[0] - x[0]).slice(0, 15), mem:FPD.r ? FPD.r.info.memory : null }; }, +(process.env.ZROUNDS || 4));
  console.log('made', r.made, JSON.stringify(r.mem));
  for (const [d, n, k] of r.grow) console.log('+' + String(d).padStart(3), String(n).padStart(4), k);
  if (errs.length) console.log('ERRORS', errs.slice(0, 5).join(' | '));
};
