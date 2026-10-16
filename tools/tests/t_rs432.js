// RS-432: a frog or a bird slumps where it dies, belly down (the frog's legs splayed, the bird's wings drooped and legs folded) - it used to
// tip over onto its side, the bird standing on legs through the floor; and a four-legged beast's legs stay outside its body as it falls
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1;
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    const p = G.player; p.hp = p.maxHp = 99999; for (const m of G.mon) m.alive = 0; G.mon = []; tickMonsters = ()=>{};
    { let best = null, bn = -1; for (let x=4;x<COLS-4;x++) for (let y=4;y<ROWS-4;y++){ if (G.map[x][y]!==T_FLOOR) continue; let n = 0; for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) if (G.map[x+i][y+j]===T_FLOOR) n++; if (n > bn){ bn = n; best = [x, y]; } } p.x = best[0]; p.y = best[1]; }
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 16)); } }, T = THREE, out = {};
    const low = e=>{ e.holder.updateMatrixWorld(true); const y0 = e.holder.matrixWorld.elements[13], v = new T.Vector3(); let lo = Infinity, hi = -Infinity; e.holder.traverseVisible(o=>{ if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count/300)); for (let i=0;i<pa.count;i+=st){ v.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); lo = Math.min(lo, v.y - y0); hi = Math.max(hi, v.y - y0); } }); return [lo, hi]; };
    for (const nm of ['giant frog','giant vulture','giant boar','wolf']) for (let rep=0; rep<3; rep++){
      G.mon = []; const m = newMonster(); Object.assign(m, { alive:1, x:p.x+1, y:p.y+1, hp:20, maxHp:20, ac:5, atkBonus:1, dmg1:1, dmg2:2, xp:5, sym:'o', nm, col:'#8f8', art:null, abilities:[] }); G.mon.push(m);
      await fr(25); const e = M3D.inst.get(m); if (!e) continue; const st = low(e);
      m.alive = 0; m3dKill(m, { dmg:20, maxHp:20, kind:['melee','ranged','magic'][rep], crit:rep===0 }); FP.dt = 1/60; let inside = 0;
      const d0 = {}; for (let f=0; f<200; f++){ FP.t += 1/60; m3dSweep(); const C = e.chain; if (C && e.dkind==='quad') for (const [c, o] of [[1, 6], [1, 10], [0, 14], [0, 18]]) for (const q of [o+1, o+2, o+3]){ const d = C.p[c].x.distanceTo(C.p[q].x), k = c + ':' + q; if (d0[k]===undefined) d0[k] = d; if (C.t > 0.1 && d < Math.min(C.p[c].r*0.95, d0[k]*0.6)) inside++; } }   /* (RS-438: inside its body, or drawn in well past where it stood - a boar's short legs stand partly within its body's round already) */
      const R = e.rd, up = R ? new T.Vector3(0, 1, 0).applyQuaternion(R.q).y : null, dd = low(e);
      (out[nm] = out[nm] || []).push({ kind:e.dkind, up:up===null ? null : +up.toFixed(2), lo:+dd[0].toFixed(3), hi:+dd[1].toFixed(3), standHi:+st[1].toFixed(3), inside });
      if (e.holder.parent){ e.holder.parent.remove(e.holder); M3D.live.delete(e); } }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r['giant frog'].every(x=>x.up > 0.75 && x.hi < x.standHi*1.4), 'a frog slumps belly down, not onto its side');
  A(r['giant vulture'].every(x=>x.up > 0.6 && x.lo > -0.03), 'a bird slumps onto its breast, its legs not through the floor');
  A(r['giant boar'].concat(r.wolf).every(x=>x.kind==='quad' && x.inside===0), 'a beast\'s legs stay outside its body as it falls');
};
