// RS-102 world generation: mountain ranges (not one central mass), an open start, nothing out of reach, old saves untouched
// RS-106 (generator 3): broader ranges, and nothing in or on them but a dragon's lair
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
    goToCharCreate(); ccBegin();
    A(G.ow.genVer===OW_GEN_VER, 'a new game uses the new generator');
    for (const kind of ['archipelago','pangaea','continents']) for (const seed of [11, 2024, 777777]){
      G.ow.continent = kind; wgRegenerate(seed);
      const W = OW_COLS, H = OW_ROWS, m = G.ow.map, sp = G.ow.spawnPos;
      let land = 0, mtn = 0, near = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++){ const t = m[x][y]; if (t!==OW_WATER && t!==OW_RIVER) land++; if (t===OW_MOUNTAIN) mtn++; }
      for (let a=-4;a<=4;a++) for (let b=-4;b<=4;b++) if ((m[sp.x+a]||[])[sp.y+b]===OW_MOUNTAIN) near++;
      const reach = new Uint8Array(W*H), q = [[sp.x, sp.y]]; reach[sp.y*W+sp.x] = 1;
      while (q.length){ const [a,b] = q.pop(); for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const c=a+dx, d=b+dy; if (c<0||d<0||c>=W||d>=H||reach[d*W+c]||m[c][d]===OW_MOUNTAIN) continue; reach[d*W+c]=1; q.push([c,d]); } }
      let cut = 0; for (let x=0;x<W;x++) for (let y=0;y<H;y++) if (OW_SITE_TILES.includes(m[x][y]) && !reach[y*W+x]) cut++;
      for (const p of (G.ow.pois||[])) if (!reach[p.y*W+p.x]) cut++;
      const pct = mtn/land*100; (out[kind] = out[kind] || []).push(+pct.toFixed(1));
      A(pct > 15 && pct < 45, `${kind}/${seed}: mountains ${pct.toFixed(1)}% of the land`);
      // nothing in the mountains but a lair: no site, point of interest, mythic beast or gathering spot on a pass or deep in a range
      const bad = [];
      for (let x=2;x<W-2;x++) for (let y=2;y<H-2;y++){ const t = m[x][y];
        if (OW_SITE_TILES.includes(t) && t!==OW_LAIR && owAmidMtn(x, y)) bad.push('site '+t+' '+x+','+y);
        if (t===OW_MOUNTAINPASS && skNodeStatic(x, y)) bad.push('node on a pass '+x+','+y); }
      for (const p of (G.ow.pois||[])) if (m[p.x][p.y]===OW_MOUNTAINPASS || m[p.x][p.y]===OW_MOUNTAIN || owAmidMtn(p.x, p.y)) bad.push('poi '+p.k+' '+p.x+','+p.y);
      for (const b of (G.ow.mythicBeasts||[])) if (m[b.x][b.y]===OW_MOUNTAIN || m[b.x][b.y]===OW_MOUNTAINPASS || owAmidMtn(b.x, b.y)) bad.push('beast '+b.x+','+b.y);
      A(!bad.length, `${kind}/${seed}: in the mountains: ${bad.slice(0,6).join('; ')}`);
      A(near===0, `${kind}/${seed}: the start is clear of mountains`);
      A(cut===0, `${kind}/${seed}: ${cut} things out of reach`);
    }
    // an old world keeps the old generator (saves rebuild their world from the seed)
    G.ow.continent = 'pangaea'; G.ow.genVer = 1; wgRegenerate(11); const oldSp = Object.assign({}, G.ow.spawnPos);
    G.ow.genVer = 2; wgRegenerate(11); A(oldSp.x!==G.ow.spawnPos.x || oldSp.y!==G.ow.spawnPos.y, 'old worlds are still built the old way');
    const d = serializeGame(); A(d.owGenVer===2, 'the save records the generator');
    // an RS-102 world keeps its narrower ranges; a new one is more mountainous
    const mtnPct = ()=>{ let l = 0, n = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ const t = G.ow.map[x][y]; if (t!==OW_WATER && t!==OW_RIVER) l++; if (t===OW_MOUNTAIN) n++; } return n/l*100; };
    const v2 = mtnPct(); G.ow.genVer = 3; wgRegenerate(11); const v3 = mtnPct(); out.v2v3 = [+v2.toFixed(1), +v3.toFixed(1)];
    A(v3 > v2*1.4, 'generator 3 has bigger mountains: '+out.v2v3);
    return out;
  });
  console.log(JSON.stringify(r));
};
