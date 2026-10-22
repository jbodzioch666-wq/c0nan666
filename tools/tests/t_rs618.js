// RS-618: world generator 11 - the land made by its weather. Mountains in long, narrow chains (they were blobs a quarter of the land);
// moisture brought by the wind, so the far side of a range lies dry and the coasts are damp; rivers from the wet uplands, running into
// one another; green banks; no specks of land under 25 tiles; towns on a fair-sized landmass. And a world made by generator 10 comes
// out exactly as it did (old saves keep their worlds)
const V10_HASH = process.env.V10_HASH || '7f728adb';   // (a generator 10 world's map, as RS-617 made it)
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); const out = { ver:OW_GEN_VER, worlds:[] };
    const hash = ()=>{ let h = 2166136261; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ h ^= G.ow.map[x][y]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
    const stats = ()=>{ const W = OW_COLS, H = OW_ROWS, M = G.ow.map; let land = 0, mtn = 0, river = 0, deskRiver = 0; const lab = new Int32Array(W*H).fill(-1), sz = [];
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = M[x][y]; if (t!==OW_WATER) land++; if (t===OW_MOUNTAIN || t===OW_MOUNTAINPASS) mtn++; if (t===OW_RIVER) river++;
        if (t===OW_DESERT){ for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = x + dx, v = y + dy; if (u>=0 && v>=0 && u<W && v<H && M[u][v]===OW_RIVER){ deskRiver++; break; } } } }
      for (let x=0;x<W;x++) for (let y=0;y<H;y++){ if (M[x][y]===OW_WATER || lab[y*W + x] >= 0) continue; const id = sz.length, c = [y*W + x]; lab[y*W + x] = id;
        for (let h=0; h<c.length; h++){ const j = c[h], a = j % W, b = (j/W)|0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const u = a + dx, v = b + dy; if (u<0||v<0||u>=W||v>=H) continue; const k = v*W + u; if (lab[k] >= 0 || M[u][v]===OW_WATER) continue; lab[k] = id; c.push(k); } } sz.push(c.length); }
      const towns = Object.entries(G.ow.townPositions || {}).filter(e=>e[1] && e[0]!=='0').map(e=>e[1]), smallTown = towns.filter(t=>sz[lab[t.y*W + t.x]] < 300).length;
      return { masses:sz.length, minMass:Math.min(...sz), mtnPct:100*mtn/land, riverPct:100*river/land, deskRiver, towns:towns.length, smallTown, rivers:(G.ow.riverStats||{}).rivers, joins:((G.ow.riverStats||{}).joins11||0) + ((G.ow.riverStats||{}).joined||0) }; };
    /* generator 11 */
    for (const seed of [3393459147, 1947342953, 2659250257, 1666331332, 777, 424242]){ G.ow.genVer = 11; wgRegenerate(seed); out.worlds.push(Object.assign({ seed }, stats())); }
    /* the same seed makes the same world again - as a save is loaded */
    G.ow.genVer = 11; wgRegenerate(777); const h1 = hash(), t1 = JSON.stringify(G.ow.townPositions); wgRegenerate(424242); wgRegenerate(777); out.again = h1===hash() && t1===JSON.stringify(G.ow.townPositions);
    /* generator 10, as it was */
    G.ow.genVer = 10; wgRegenerate(1947342953); out.v10 = Object.assign({ hash:hash() }, stats());
    G.ow.genVer = OW_GEN_VER;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const W = r.worlds, avg = k=>W.reduce((s, w)=>s + w[k], 0)/W.length;
  A(r.ver===11, 'new worlds are made by generator 11');
  A(W.every(w=>w.minMass >= 25), 'no speck of land under 25 tiles');
  A(avg('masses') < 18, 'the land in fewer pieces: ' + avg('masses'));
  A(avg('mtnPct') < 20 && avg('mtnPct') > 4, 'mountains in chains, not a quarter of the land: ' + avg('mtnPct').toFixed(1) + '%');
  A(avg('riverPct') > 1.2 && W.every(w=>w.joins > 0), 'more rivers, running into one another: ' + avg('riverPct').toFixed(2) + '%');
  A(W.every(w=>w.deskRiver===0), 'no desert at a river\'s edge');
  A(W.every(w=>w.towns >= 9 && w.smallTown===0), 'every town (but the one you start in) on a landmass of some size');
  A(r.v10.masses > avg('masses') && (V10_HASH==='FILL' || r.v10.hash===V10_HASH), 'a generator 10 world comes out as it did: ' + r.v10.hash);
  A(r.again, 'the same seed makes the same world again, towns and all (as a save is loaded)');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
