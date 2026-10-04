// RS-130: nothing spawns on a road except the town hubs (and the ferry piers the roads run down to)
// RS-131: and nothing spawns on top of anything else
module.exports = async page=>{
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const bad = await ev(()=>{
    const out = [];
    for (let w=0; w<3; w++){
      goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false;
      const tag = 'world '+w+': ', onRoad = (x,y)=>!!wgRoadAt(x,y);
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (!onRoad(x,y)) continue; const t = G.ow.map[x][y];
        if (OW_SITE_TILES.includes(t) && t!==OW_TOWN) out.push(tag+'site '+t+' at '+x+','+y);
        const n = skNodeStatic(x, y); if (n) out.push(tag+'gathering spot '+n.k+'/'+n.type+' at '+x+','+y); }
      for (const p of (G.ow.pois||[])) if (p.k!=='ferry' && onRoad(p.x, p.y)) out.push(tag+'place '+p.k+' at '+p.x+','+p.y);
      for (const b of (G.ow.mythicBeasts||[])) if (onRoad(b.x, b.y)) out.push(tag+'mythic beast at '+b.x+','+b.y);
      for (const e of (G.ow.encounters||[])) if (onRoad(e.x, e.y)) out.push(tag+'roamer spawned at '+e.x+','+e.y);
      // and later, as the game goes on: roamers refill, meteors fall, sites move on
      let r = 0; for (let i=0;i<1500;i++){ const p = spawnOneEncounter(G.owPos.x, G.owPos.y, 10); if (p && onRoad(p.x, p.y)) r++; } if (r) out.push(tag+r+' of 1500 roamer refills on a road');
      G.ow.rich = []; for (let i=0;i<300;i++){ try{ wevMeteor(); }catch(e){} } const mr = (G.ow.rich||[]).filter(q=>onRoad(q.x, q.y)).length; if (mr) out.push(tag+mr+' meteors on a road');
      if (typeof wevCampOk==='function'){ let cr = 0; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (onRoad(x,y) && wevCampOk(x,y)) cr++; if (cr) out.push(tag+cr+' road tiles a war camp could be raised on'); }
      let fs = 0; for (let i=0;i<300;i++){ const p = findFreeSitePosition(G.owPos.x, G.owPos.y); if (p && onRoad(p.x, p.y)) fs++; } if (fs) out.push(tag+fs+' moved sites on a road');
      // RS-131: and one thing to a tile, after the world has run a while
      for (let i=0;i<40;i++){ try{ wevNewCamp(true); }catch(e){} } for (let i=0;i<60;i++){ try{ wevMeteor(); }catch(e){} }
      for (let i=0;i<200;i++){ const p = spawnOneEncounter(G.owPos.x, G.owPos.y, 10); if (p) G.ow.encounters.push(p); } for (let i=0;i<30;i++) moveOverworldEncounters();
      const occ = new Map(), put = (x,y,k)=>{ const key = x+','+y; (occ.get(key) || occ.set(key, []).get(key)).push(k); };
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (OW_SITE_TILES.includes(G.ow.map[x][y])) put(x,y,'site'); const n = skNodeStatic(x,y); if (n) put(x,y,'gathering spot'); }
      for (const p of G.ow.pois||[]) put(p.x,p.y,'place');
      for (const b of G.ow.mythicBeasts||[]) put(b.x,b.y,'beast');
      for (const q of G.ow.rich||[]) put(q.x,q.y,'fallen star');
      for (const c of (G.ow.ev && G.ow.ev.camps)||[]) put(c.x,c.y,'camp');
      const spawned = (G.ow.encounters||[]).slice(); for (const e of spawned) put(e.x,e.y,'roamer');
      for (const [k, v] of occ) if (v.length > 1 && !(v.every(z=>z==='roamer' || z==='gathering spot') && v.filter(z=>z==='roamer').length===1)) out.push(tag+'stacked '+v.sort().join('+')+' at '+k);
    }
    return out; });
  const kinds = {}; for (const b of bad){ const k = b.replace(/^world \d+: /, '').replace(/ at .*$/, '').replace(/^\d+ of \d+ /, '').replace(/^\d+ /, '').replace(/\/.*$/, ''); kinds[k] = (kinds[k]||0) + 1; }
  console.log(JSON.stringify(kinds)); console.log(bad.filter(b=>!/gathering/.test(b)).slice(0, 20).join('\n'));
  A(!bad.length, bad.length+' things on roads');
};
