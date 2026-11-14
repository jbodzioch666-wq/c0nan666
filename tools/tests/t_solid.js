// RS-238: landmarks are solid - nothing walks through the tower, the great tree or the volcano's cone, and nothing is placed
// in them (sites, points of interest, roads, gathering spots, wandering groups); each can still be reached and found
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const R = await ev(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0;
    const out = { worlds:[], bad:[] };
    for (const kind of ['archipelago','pangaea']) for (const seed of [11, 2024, 777777]){ G.ow.continent = kind; wgRegenerate(seed); G.ow.geo = null;
      const L = owGeo().landmarks; out.worlds.push(kind+'/'+seed+':'+L.map(l=>l.kind).join(','));
      for (const lm of L){ const Rf = lmFootR(lm), Rc = Math.ceil(Rf); let foot = 0, reach = 0;
        for (let i=-Rc-3;i<=Rc+3;i++) for (let k=-Rc-3;k<=Rc+3;k++){ const x = lm.x+i, y = lm.y+k; if (x<0||y<0||x>=OW_COLS||y>=OW_ROWS) continue; const d = Math.hypot(i, k), t = G.ow.map[x][y];
          if (d <= Rf && t!==OW_MOUNTAINPASS){ foot++;
            if (o3Passable(x, y)) out.bad.push(kind+'/'+seed+' '+lm.kind+' walkable '+x+','+y);
            if (lm.kind!=='volcano' && (OW_SITE_TILES.includes(t) || wgPoiAt(x, y) || (G.ow.road && G.ow.road[y*OW_COLS+x]))) out.bad.push(kind+'/'+seed+' '+lm.kind+' has something in it at '+x+','+y);
            if (skNodeStatic(x, y)) out.bad.push(kind+'/'+seed+' '+lm.kind+' gathering spot at '+x+','+y);
            if ((G.ow.encounters||[]).some(e=>e.x===x && e.y===y)) out.bad.push(kind+'/'+seed+' '+lm.kind+' monsters in it at '+x+','+y); }
          else if (d <= lm.r && o3Passable(x, y)) reach++; }
        if (!foot) out.bad.push(kind+'/'+seed+' '+lm.kind+' has no footprint');
        if (!reach) out.bad.push(kind+'/'+seed+' '+lm.kind+' cannot be reached to find it'); }
      // and a step into the tower is refused
      const tw = L.find(l=>l.kind==='tower');
      if (tw) for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const sx = tw.x + dx*2, sy = tw.y + dy*2; if (!o3Passable(sx, sy)) continue;
        G.owPos = { x:sx, y:sy }; tryMoveOverworld(-dx, -dy); out.step = out.step || []; out.step.push(G.owPos.x===sx && G.owPos.y===sy); break; }
    }
    return out; });
  A(R.bad.length===0, 'landmarks are solid and clear: '+R.bad.slice(0, 8).join('; ')+' ('+R.worlds.join(' ')+')');
  A(R.step && R.step.length && R.step.every(Boolean), 'walking into the tower is refused: '+JSON.stringify(R.step));
};
