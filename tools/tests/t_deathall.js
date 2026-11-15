// RS-413: every creature dies a death of its own and ends on the floor. The octopus and its kin slump and spread, sharks,
// frogs, treants, the xorn and the roper tumble as bodies, swarms scatter, a dust devil blows itself out - none topple stiffly
// any more. Nothing floats over the floor once it settles (beetles on their backs, legs curled, used to hang a hand's width
// up), and a two-legged body's thighs swing back no more than about twenty degrees at the hips
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const names = ['giant octopus','the kraken','reef shark','giant shark','giant frog','giant toad','treant','xorn','roper','quipper swarm','dust devil',
    'giant scorpion','kalphite queen','giant spider','giant mole','ogre','goblin','hill giant','wolf','black dragon'];
  const r = await page.evaluate(async names=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; for (const m of G.mon) m.alive = 0; G.mon = []; tickMonsters = ()=>{};
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } }
      p.x = best[0]; p.y = best[1]; }
    const spots = []; for (let dx=-2;dx<=2;dx++) for (let dy=-2;dy<=2;dy++){ if (!dx && !dy) continue; const x = p.x+dx, y = p.y+dy; if (G.map[x][y]===T_FLOOR && (Math.abs(dx)+Math.abs(dy))%2===0) spots.push([x,y]); }
    const out = [], T = THREE, v = new T.Vector3(), fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } };
    // the lowest point of the skin itself (a skinned body's bounding box is its standing shape)
    const low = (e, all)=>{ e.holder.updateMatrixWorld(true); const y0 = e.holder.matrixWorld.elements[13]; let lo = Infinity;
      e.holder.traverseVisible(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || (o.material && o.material.visible===false)) return; const pa = o.geometry.attributes.position, st = all ? 1 : Math.max(1, Math.floor(pa.count/300));
        for (let i=0;i<pa.count;i+=st){ v.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); lo = Math.min(lo, v.y - y0); } });
      return lo; };
    for (let i0=0;i0<names.length;i0+=spots.length){
      const batch = names.slice(i0, i0+spots.length); G.mon = [];
      batch.forEach((nm, i)=>{ const [x,y] = spots[i]; const m = newMonster(); Object.assign(m, { alive:1, x, y, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'s', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m); });
      await fr(45);
      const es = G.mon.map(m=>M3D.inst.get(m)), lo0 = es.map(e=>e ? low(e) : 0);
      for (const m of G.mon){ m.alive = 0; m3dKill(m, { dmg:20, maxHp:20, kind:'melee' }); }
      FP.dt = 1/60; const hip = es.map(()=>90);
      for (let f=0;f<360;f++){ FP.t += 1/60; m3dSweep();
        es.forEach((e,i)=>{ if (!e || !e.chain || !e.chain.hipLim) return; const P = e.chain.p, x = new T.Vector3().subVectors(P[7].x, P[4].x).normalize(), y = new T.Vector3().subVectors(P[2].x, P[1].x).normalize(), fw = new T.Vector3().crossVectors(x, y).normalize();
          const sp = new T.Vector3().subVectors(P[0].x, P[1].x).normalize(); fw.addScaledVector(sp, -fw.dot(sp)).normalize();   /* (RS-427: the hip's own angle, in the body's plane from straight down the spine) */
          for (const [h,k] of [[10,11],[14,15]]){ const t = new T.Vector3().subVectors(P[k].x, P[h].x); hip[i] = Math.min(hip[i], Math.atan2(t.dot(fw), t.dot(sp))*57.3); } }); }
      es.forEach((e, i)=>{ out.push({ nm:batch[i], model:!!e, kind:e ? e.dkind || 'topple' : null, lo:e && e.holder.parent ? low(e, true) : null, lo0:lo0[i], hip:e && e.chain && e.chain.hipLim ? hip[i] : null }); });
      for (const e of es) if (e && e.holder.parent){ e.holder.parent.remove(e.holder); M3D.live.delete(e); }
    }
    return out; }, names);
  for (const x of r) console.log(x.nm, x.kind, x.lo===null ? '-' : x.lo.toFixed(3), x.hip===null ? '' : 'hip ' + x.hip.toFixed(0));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  const by = nm=>r.find(x=>x.nm===nm);
  A(r.every(x=>x.model), 'every creature has a model: '+r.filter(x=>!x.model).map(x=>x.nm));
  A(r.every(x=>x.kind!=='topple'), 'nobody topples stiffly any more: '+r.filter(x=>x.kind==='topple').map(x=>x.nm));
  A(['giant octopus','the kraken'].every(n=>by(n).kind==='tent') && ['reef shark','giant shark','giant frog','giant toad','treant','xorn','roper'].every(n=>by(n).kind==='body') && by('quipper swarm').kind==='swarm' && by('dust devil').kind==='ghost',
    'each gets its own death: '+r.map(x=>x.nm+'='+x.kind).join(', '));
  // on the floor: no gap under it (a hovering octopus's own hover allowed), and nothing more than a hand's width through it (a dragon's lower wing aside)
  const gaps = r.filter(x=>x.lo!==null && x.kind!=='ghost' && x.lo > Math.max(0.03, x.lo0 + 0.01));
  A(!gaps.length, 'nothing floats over the floor once it settles: '+gaps.map(x=>x.nm+' '+x.lo.toFixed(3)).join(', '));
  const sunk = r.filter(x=>x.lo!==null && x.kind!=='ghost' && x.kind!=='dragon' && x.lo < -0.15);
  A(!sunk.length, 'nor deep through it: '+sunk.map(x=>x.nm+' '+x.lo.toFixed(3)).join(', '));
  const hips = r.filter(x=>x.hip!==null);
  A(hips.length >= 3 && hips.every(x=>x.hip > -25), 'thighs swing back no more than about 20 degrees: '+hips.map(x=>x.nm+' '+x.hip.toFixed(0)).join(', '));
};
