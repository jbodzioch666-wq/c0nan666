// RS-367: deaths stay above the floor. Spiders, scorpions, crabs and beetles die as a little rigid-body ragdoll - thrown by
// the blow, tumbling, bouncing and sliding on the floor until they settle on their backs, legs curling in and twitching,
// never through a wall. Anything else topples as before but is lifted so its lowest corner rests on the floor. After a few
// turns a corpse fades away instead of sinking through the floor
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 9999; for (const m of G.mon) m.alive = 0; G.mon = [];
    // stand in the most open spot on the floor, so everything has room and is in view
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; for (let i=0;i<4;i++){ renderGame(); await new Promise(r=>setTimeout(r, 20)); } }
    const names = ['giant spider','giant scorpion','giant crab','tomb scarab','ogre','giant spider'], spots = [];
    // the last spider stands with a wall right behind it, the blow driving it into the wall
    let wallSpot = null; for (let r=1;r<=5 && !wallSpot;r++) for (let dx=-r;dx<=r && !wallSpot;dx++) for (let dy=-r;dy<=r;dy++){ if (Math.max(Math.abs(dx), Math.abs(dy))!==r) continue; const x = p.x+dx, y = p.y+dy; if (!G.map[x] || G.map[x][y]!==T_FLOOR) continue;
      const ux = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0, uy = ux ? 0 : Math.sign(dy); if (G.map[x+ux] && G.map[x+ux][y+uy]===T_WALL){ wallSpot = [x, y]; break; } }   /* (a wall right behind it, the way the blow will drive it) */
    const near = []; for (let dx=-3;dx<=3;dx++) for (let dy=-3;dy<=3;dy++) if (Math.max(Math.abs(dx), Math.abs(dy)) >= 2) near.push([dx, dy]); near.sort((a, b)=>Math.hypot(...a) - Math.hypot(...b));
    for (const [dx,dy] of near){ const x = p.x+dx, y = p.y+dy; if (G.map[x] && G.map[x][y]===T_FLOOR && !(wallSpot && x===wallSpot[0] && y===wallSpot[1]) && !spots.some(q=>Math.abs(q[0]-x) + Math.abs(q[1]-y) < 2)) spots.push([x,y]); if (spots.length>=5) break; }
    if (wallSpot){ while (spots.length < 5) spots.push(null); spots[5] = wallSpot; }
    names.forEach((nm, i)=>{ if (!spots[i]) return; const [x,y] = spots[i]; const m = newMonster(); Object.assign(m, { alive:1, x, y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
    if (false) names.slice(0, spots.length).forEach((nm, i)=>{ const [x,y] = spots[i]; const m = newMonster(); Object.assign(m, { alive:1, x, y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
    for (let i=0;i<8;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const out = { names:G.mon.map(m=>m.nm).join(), n:G.mon.length, wallCase:!!wallSpot }, T = THREE;
    for (const m of G.mon){ m.alive = 0; m3dKill(m); }
    const es = G.mon.map(m=>M3D.inst.get(m)); out.rd = es.map(e=>!!(e && e.rd));
    const low = es.map(()=>9), inWall = es.map(()=>0);
    const lowOf = e=>{ e.holder.updateMatrixWorld(true); return new T.Box3().setFromObject(e.holder).min.y - e.holder.position.y; };
    const comTile = e=>{ const R = e.rd, dx = R.x.x - R.c0.x, dz = R.x.z - R.c0.z, a = R.rot; return [Math.floor(R.hx + dx*Math.cos(a) + dz*Math.sin(a)), Math.floor(R.hz - dx*Math.sin(a) + dz*Math.cos(a))]; };
    FP.dt = 1/60;
    for (let f=0;f<240;f++){ m3dSweep(); es.forEach((e,i)=>{ if (!e || !e.holder.parent) return; low[i] = Math.min(low[i], lowOf(e)); if (e.rd){ const [tx, ty] = comTile(e); if (!G.map[tx] || G.map[tx][ty]===T_WALL) inWall[i]++; } }); }
    out.minLow = low.map(v=>+v.toFixed(3)); out.inWall = inWall;
    out.up = es.map(e=>e && e.rd ? +new T.Vector3(0,1,0).applyQuaternion(e.rd.q).y.toFixed(2) : null);
    out.rest = es.map(e=>e && e.rd ? e.rd.rest > 0.3 : null);
    out.legs = es.map(e=>e && e.rd && e.rd.legs.length ? +Math.max(...e.rd.legs.map(L=>Math.abs(L.a - L.a0))).toFixed(2) : null);
    out.held = es.map(e=>e ? e.dying===1.4 && !!e.holder.parent : null);
    // a few turns later the corpses fade away and are gone
    G.player.turnCount = (G.player.turnCount||0) + 6; for (let f=0;f<30;f++) m3dSweep();
    out.fading = es.map(e=>{ let op = 1; e.holder.traverse(o=>{ if (o.material) for (const m of [].concat(o.material)) op = Math.min(op, m.opacity); }); return +op.toFixed(2); });
    for (let f=0;f<60;f++) m3dSweep(); out.gone = es.map(e=>!e.holder.parent);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.n===6 && r.wallCase, 'six creatures, one against a wall');
  A(r.names==='giant spider,giant scorpion,giant crab,tomb scarab,ogre,giant spider' && r.rd.join()==='true,true,true,true,true,true' && r.up[4] < 0.6, 'the spiders, scorpion, crab and scarab die as ragdolls; the ogre too now (RS-371), knocked off its feet');
  A(r.minLow.every(v=>v >= -0.03), 'nothing goes through the floor, ever: '+r.minLow);
  A(r.inWall.every(n=>n===0), 'no ragdoll ends up in a wall: '+r.inWall);
  const bugUp = r.up.filter((u, i)=>i!==4), bugRest = r.rest.filter((x, i)=>i!==4);
  A(bugUp.filter(u=>u!==null && u < -0.5).length >= 3 && bugUp.every(u=>u===null || u < 0.5) && bugRest.filter(x=>x).length===5 && bugRest.filter(x=>x!==null).length===5, 'the bugs settle, most on their backs and none on their feet: '+r.up);
  A(r.legs.filter(x=>x!==null).every(a=>a > 0.5), 'the legs curl in: '+r.legs);
  A(r.held.every(x=>x), 'the corpses lie there while the turns pass');
  A(r.fading.every(op=>op < 1) && r.gone.every(x=>x), 'then they fade away and are gone');
};
