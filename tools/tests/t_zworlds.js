// (probe, not in ALL) a dozen worlds side by side, for reviewing the world generator: ZN seeds (default 12) of ZSIZE (default the
// game's) through the game's own generator (wgRegenerate), each drawn tile by tile - terrain, the rarer biomes tinted, rivers, roads,
// towns by race, sites - with its difficulty bands beside it and the numbers that matter (landmasses, biome shares, towns cut off,
// river and road lengths). Writes shots/zworlds.png (a contact sheet) and Downloads/Depthcrawl world maps.html
const fs = require('fs'), path = require('path'), os = require('os');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const N = +(process.env.ZN || 12), seeds = (process.env.ZSEEDS || '').split(',').filter(Boolean).map(Number);
  const r = await page.evaluate(async ([N, seeds])=>{
    goToCharCreate(); ccBegin();
    const out = [], S = 3;   /* (pixels a tile) */
    const COL = { [OW_GRASS]:'#86a85c', [OW_FOREST]:'#3e6a34', [OW_WATER]:'#2c567f', [OW_RIVER]:'#5a9ad8', [OW_MOUNTAIN]:'#8d857a', [OW_MOUNTAINPASS]:'#b3a582', [OW_TUNDRA]:'#e6ecef', [OW_DESERT]:'#d8c07a', [OW_SWAMP]:'#5d6a44' };
    const SITE = { [OW_TOWN]:'#ffffff', [OW_DUNGEON]:'#c0392b', [OW_CASTLE]:'#e67e22', [OW_NECROTOWER]:'#8e44ad', [OW_TEMPLE]:'#f1c40f', [OW_GRAVEYARD]:'#7f8c8d', [OW_MINE]:'#2c3e50', [OW_LAIR]:'#e74c3c', [OW_PYRAMID]:'#f39c12' };
    const RACE = { human:'#d94c3a', elf:'#3fb0a8', woodelf:'#4f8a2a', halfelf:'#9ac040', dwarf:'#6a7a90', orc:'#8a6a20', halfling:'#7ac050', gnome:'#3a7ad0', dragon:'#c03020', tiefling:'#8a4ab0' };
    const BIOC = ['', '#d0402a', '#2a9a40', '#6a3a8a', '#f0f4ff', '#40d0e0', '#c0a060', '#a0a0a0'];
    for (let n=0;n<N;n++){
      const seed = seeds[n]!=null ? seeds[n] : Math.floor(Math.random()*4294967295); const t0 = performance.now();
      wgRegenerate(seed); const ms = performance.now() - t0;
      const W = OW_COLS, H = OW_ROWS, map = G.ow.map, cv = document.createElement('canvas'); cv.width = W*S; cv.height = H*S; const c = cv.getContext('2d');
      const cnt = {}; let land = 0;
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = map[x][y]; const col = COL[t] || COL[OW_GRASS];
        cnt[t] = (cnt[t]||0) + 1; if (t!==OW_WATER) land++;
        c.fillStyle = col; c.fillRect(x*S, y*S, S, S);
        const b = typeof wgBioAt==='function' ? wgBioAt(x, y) : 0; if (b && BIOC[b]){ c.globalAlpha = 0.45; c.fillStyle = BIOC[b]; c.fillRect(x*S, y*S, S, S); c.globalAlpha = 1; }
        if (G.ow.road && G.ow.road[y*W + x]){ c.fillStyle = '#c8a46a'; c.fillRect(x*S + 1, y*S + 1, S - 2 || 1, S - 2 || 1); } }
      /* sites over the land, towns bigger, by race */
      const towns = Object.entries(G.ow.townPositions || {}).filter(e=>e[1]).map(([i, p])=>({ x:p.x, y:p.y, race:(G.ow.townFlavor && G.ow.townFlavor[i] && G.ow.townFlavor[i].race) || '?' })); const races = {};
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = map[x][y]; if (!SITE[t] || t===OW_TOWN) continue; c.fillStyle = SITE[t]; c.fillRect(x*S - 1, y*S - 1, S + 2, S + 2); }
      for (const tw of towns){ const race = tw.race; races[race] = (races[race]||0) + 1;
        c.fillStyle = '#000'; c.fillRect(tw.x*S - 4, tw.y*S - 4, S + 8, S + 8); c.fillStyle = RACE[race] || '#fff'; c.fillRect(tw.x*S - 3, tw.y*S - 3, S + 6, S + 6); }
      const sp = G.ow.spawnPos; c.strokeStyle = '#ff0'; c.lineWidth = 2; c.strokeRect(sp.x*S - 6, sp.y*S - 6, S + 12, S + 12);
      /* landmasses, and towns on a landmass with no other town */
      const lab = new Int32Array(W*H).fill(-1), sizes = []; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (map[x][y]===OW_WATER || lab[y*W + x] >= 0) continue; const id = sizes.length; let s = 0; const q = [[x, y]]; lab[y*W + x] = id;
        while (q.length){ const [a, b] = q.pop(); s++; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = a + dx, v = b + dy; if (u<0||v<0||u>=W||v>=H) continue; const k = v*W + u; if (lab[k] >= 0 || map[u][v]===OW_WATER) continue; lab[k] = id; q.push([u, v]); } } sizes.push(s); }
      const big = sizes.filter(s=>s >= 60).length, perMass = {}; for (const tw of towns){ const id = lab[tw.y*W + tw.x]; perMass[id] = (perMass[id]||0) + 1; } const loneTowns = towns.filter(tw=>perMass[lab[tw.y*W + tw.x]]===1).length;
      /* difficulty bands */
      const bv = document.createElement('canvas'); bv.width = W; bv.height = H; const bc = bv.getContext('2d'), img = bc.createImageData(W, H); let bmin = 1e9, bmax = -1e9; const band = new Float32Array(W*H);
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ let v = 0; try{ const a = wgArea(x, y); v = a && a.band!=null ? (Array.isArray(a.band) ? a.band[0] : (a.band.lo!=null ? a.band.lo : +a.band)) : 0; }catch(e){} band[y*W + x] = v; if (map[x][y]!==OW_WATER){ bmin = Math.min(bmin, v); bmax = Math.max(bmax, v); } }
      for (let i=0;i<W*H;i++){ const x = i % W, y = Math.floor(i/W), f = map[x][y]===OW_WATER ? -1 : (band[i] - bmin)/Math.max(1, bmax - bmin); const k = i*4;
        if (f < 0){ img.data[k] = 30; img.data[k+1] = 40; img.data[k+2] = 60; } else { img.data[k] = Math.round(60 + f*195); img.data[k+1] = Math.round(200 - f*160); img.data[k+2] = 60; } img.data[k+3] = 255; }
      bc.putImageData(img, 0, 0);
      const pct = t=>+(100*(cnt[t]||0)/Math.max(1, land)).toFixed(1), river = cnt[OW_RIVER]||0; let roadN = 0; if (G.ow.road) for (let i=0;i<W*H;i++) if (G.ow.road[i]) roadN++;
      let bioN = 0; if (G.ow.bio) for (let i=0;i<W*H;i++) if (G.ow.bio[i]) bioN++;
      out.push({ seed, code:worldCode(), size:W + 'x' + H, ms:Math.round(ms), map:cv.toDataURL('image/png'), band:bv.toDataURL('image/png'), bandRange:[bmin, bmax],
        landPct:+(100*land/(W*H)).toFixed(0), masses:sizes.length, bigMasses:big, towns:towns.length, loneTowns, races, sites:Object.keys(SITE).reduce((s, k)=>s + (+k===OW_TOWN ? 0 : (cnt[k]||0)), 0),
        biome:{ grass:pct(OW_GRASS), forest:pct(OW_FOREST), desert:pct(OW_DESERT), swamp:pct(OW_SWAMP), tundra:pct(OW_TUNDRA), mountain:pct(OW_MOUNTAIN) + pct(OW_MOUNTAINPASS), river:pct(OW_RIVER) }, rareBiomePct:+(100*bioN/Math.max(1, land)).toFixed(1), roadTiles:roadN, rivers:G.ow.riverStats || null });
    }
    return out; }, [N, seeds]);
  /* the page */
  const esc = s=>String(s).replace(/[&<>]/g, c=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c]));
  const card = w=>`<div class="w"><div class="h"><b>${esc(w.code || w.seed)}</b> <span>${w.size} &middot; built in ${w.ms} ms</span></div>
    <div class="maps"><img class="m" src="${w.map}"><img class="b" src="${w.band}" title="difficulty: green easy, red hard"></div>
    <table><tr><td>land</td><td>${w.landPct}% in ${w.masses} pieces (${w.bigMasses} big)</td></tr>
    <tr><td>towns</td><td>${w.towns} (${w.loneTowns} alone on their landmass) &middot; ${Object.entries(w.races).map(([k, v])=>k + (v > 1 ? '&times;' + v : '')).join(', ')}</td></tr>
    <tr><td>biomes</td><td>${Object.entries(w.biome).map(([k, v])=>k + ' ' + v + '%').join(' &middot; ')} &middot; rare ${w.rareBiomePct}%</td></tr>
    <tr><td>other</td><td>${w.sites} sites &middot; ${w.roadTiles} road tiles &middot; rivers ${w.rivers ? w.rivers.rivers + ' (' + (w.rivers.lakes||0) + ' lakes, ' + (w.rivers.joined||0) + ' joins)' : '?'} &middot; difficulty ${w.bandRange[0]}&ndash;${w.bandRange[1]}</td></tr></table></div>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Depthcrawl world maps</title><style>
    body{background:#16130f;color:#e8dcc4;font:13px/1.4 system-ui,sans-serif;margin:16px} h1{font-size:18px;margin:0 0 4px} p{margin:0 0 14px;color:#b8ab92}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:14px} .w{background:#221d17;border:1px solid #3a3126;border-radius:8px;padding:10px}
    .h span{color:#9a8e78;font-size:12px} .maps{display:flex;gap:8px;align-items:flex-start;margin:6px 0} .m{width:360px;image-rendering:pixelated} .b{width:120px;image-rendering:pixelated}
    table{border-collapse:collapse;width:100%} td{padding:2px 4px;vertical-align:top} td:first-child{color:#9a8e78;width:52px}
    .key span{display:inline-block;margin-right:12px} .key i{display:inline-block;width:11px;height:11px;vertical-align:-1px;margin-right:4px;border:1px solid #000}</style></head><body>
    <h1>Depthcrawl world maps (generator ${esc(String(process.env.ZGEN || 'current'))})</h1><p>${r.length} worlds from the game's own generator. Yellow square: where you start. Town squares are coloured by race. The small map is difficulty: green easy, red hard.</p>
    <p class="key"><span><i style="background:#86a85c"></i>grass</span><span><i style="background:#3e6a34"></i>forest</span><span><i style="background:#d8c07a"></i>desert</span><span><i style="background:#5d6a44"></i>swamp</span><span><i style="background:#e6ecef"></i>tundra</span><span><i style="background:#8d857a"></i>mountain</span><span><i style="background:#5a9ad8"></i>river</span><span><i style="background:#c8a46a"></i>road</span><span><i style="background:#c0392b"></i>dungeon</span><span><i style="background:#e67e22"></i>castle</span><span><i style="background:#8e44ad"></i>tower</span></p>
    <div class="grid">${r.map(card).join('')}</div></body></html>`;
  const dl = path.join(os.homedir(), 'Downloads', 'Depthcrawl world maps.html'); fs.writeFileSync(dl, html);
  /* a contact sheet for a quick look: the maps alone, four across */
  const sheet = await page.evaluate(async maps=>{ const S = 360, cols = 4, rows = Math.ceil(maps.length/cols), cv = document.createElement('canvas'); cv.width = cols*S; cv.height = rows*S; const c = cv.getContext('2d');
    for (let i=0;i<maps.length;i++){ const im = new Image(); im.src = maps[i]; await im.decode(); c.imageSmoothingEnabled = false; c.drawImage(im, (i % cols)*S, Math.floor(i/cols)*S, S, S); }
    return cv.toDataURL('image/png'); }, r.map(w=>w.map));
  fs.writeFileSync(path.join(SHOTS, 'zworlds.png'), Buffer.from(sheet.split(',')[1], 'base64'));
  for (const w of r) console.log(JSON.stringify(Object.assign({}, w, { map:undefined, band:undefined })));
  console.log('page:', dl);
};
