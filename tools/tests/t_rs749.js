// RS-749: the liches (the necromancers of the towers) are the sculpted skeleton in their own robes: a robe split at the front and torn
// at the hem, a mantle, a cloak (not the acolyte), sleeves on the arms, a hood or a crown, a staff crowned with a skull and soul-fire,
// green eyes. Each rank has its own class and colour; plain skeletons are as they were.
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    try{ sk3Build(); }catch(e){} for (let i=0;i<300 && !SK3.ok;i++) await new Promise(r=>setTimeout(r, 100));
    const out = { wanted:['lich acolyte','lich','archlich','risen lich-lord'].map(n=>sk3Wanted({ nm:n })), cls:['lich acolyte','lich','archlich','risen lich-lord','skeleton mage','skeleton'].map(sk3Class) };
    const look = nm=>{ const e = sk3Instance({ nm, x:0, y:0 }); let cloth = 0, sleeves = 0, sword = false, eye = null, robe = null;
      e.holder.traverse(o=>{ if (o.isMesh && o.material && o.material.userData && o.material.userData.cloth){ cloth++; if (!robe){ const c = o.geometry.attributes.color.array; robe = [c[0], c[1], c[2]].map(v=>+v.toFixed(3)); } } });
      for (const n of [e.rig.R.sh, e.rig.L.sh, e.rig.R.el, e.rig.L.el]) n.children.forEach(o=>{ if (o.material && o.material.userData && o.material.userData.cloth) sleeves++; });
      e.holder.traverse(o=>{ if (o.isMesh && o.material && o.material.isMeshBasicMaterial && !o.material.transparent && o.parent===e.rig.head && o.material.color.g > 0.3) eye = eye || o.material.color.getHexString(); });
      return { cloth, sleeves, eye, robe, H:+e.H.toFixed(2) }; };
    out.acolyte = look('lich acolyte'); out.lich = look('lich'); out.arch = look('archlich'); out.lord = look('risen lich-lord'); out.plain = look('skeleton');
    /* in a dungeon, beside you */
    const s = questNearbySites(G.owPos.x, G.owPos.y, 1, 60, ['dungeon'])[0]; G.gameMode = 0; G.pendingDungeon = { x:s.x, y:s.y }; enterDungeonConfirm(); setUi('playing');
    for (let i=0;i<40;i++) await new Promise(r=>requestAnimationFrame(r));
    const p = G.player, m = G.mon.find(m=>m.alive); out.inDungeon = !!m;
    if (m){ m.nm = m.baseNm = 'archlich'; const sp = [[1,0],[0,1],[-1,0],[0,-1],[1,1]].find(([dx, dy])=>G.map[p.x+dx] && G.map[p.x+dx][p.y+dy]!==1 && !G.mon.some(o=>o!==m && o.alive && o.x===p.x+dx && o.y===p.y+dy)) || [1, 0];
      m.x = p.x + sp[0]; m.y = p.y + sp[1]; m.awake = false; const e0 = M3D.inst.get(m); if (e0 && e0.holder.parent) e0.holder.parent.remove(e0.holder); M3D.inst.delete(m);
      for (let i=0;i<90;i++) await new Promise(r=>requestAnimationFrame(r)); const e = M3D.inst.get(m); out.built = !!(e && e.sk && e.cls==='lichX'); }
    return out; });
  await page.screenshot({ path:SHOTS + '/rs749_lich.png' });
  console.log(JSON.stringify(r));
  A(r.wanted.every(Boolean), 'every lich is the sculpted skeleton: ' + r.wanted);
  A(r.cls.join()==='lichA,lich,lichX,lichL,mage,plain', 'each rank its own class: ' + r.cls);
  for (const k of ['acolyte','lich','arch','lord']) A(r[k].cloth >= 6 && r[k].sleeves===4 && r[k].eye==='6dff9a', k + ' robed, sleeved, green-eyed: ' + JSON.stringify(r[k]));
  A(r.arch.cloth > r.lich.cloth && r.lord.cloth > r.arch.cloth, 'a collar from the archlich, a hood on the lord too: ' + JSON.stringify(r));
  A(r.acolyte.robe.join()!==r.lord.robe.join(), 'each rank its own colour: ' + JSON.stringify([r.acolyte.robe, r.lord.robe]));
  A(r.plain.cloth===0 && r.plain.sleeves===0, 'a plain skeleton as it was: ' + JSON.stringify(r.plain));
  A(r.arch.H > r.acolyte.H, 'the higher ranks stand taller');
  A(r.built, 'built in a dungeon: ' + JSON.stringify(r));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
