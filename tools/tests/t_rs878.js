// RS-878: the dragons remade - the drake (every coloured dragon, the ancients, the three-headed king), the wyvern (and the forest wyrm)
// and the great wyrm (a mythic beast) - each on the jointed dragon rig: they build, stand on their feet, walk, breathe and bite with no
// joint gone astray, are lighter than the old dragons, and fall as a ragdoll; the hydra, the sea serpent and the turtle stay as they were
// Shots: shots/rs878-down.jpg (a black dragon fallen in a dungeon)
const path = require('path'), SHOTS = path.join(__dirname, 'shots');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(()=>{ const T = THREE, out = { k:{} }, tris = root=>{ let n = 0; root.traverse(o=>{ if (o.isMesh && o.geometry){ const g = o.geometry; n += (g.index ? g.index.count : g.attributes.position.count)/3*(o.isInstancedMesh ? o.count : 1); } }); return Math.round(n); };
    const want = { 'ancient dragon':'drake', 'blue dragon wyrmling':'drake', 'white dragon':'drake', 'king black dragon':'drake', 'greater forest wyrm':'drake', 'wyvern':'wyvern', 'forest wyrm':'wyvern', 'great wyrm':'wyrm', 'hydra':'hydra', 'plesiosaurus':'plesio', 'dragon turtle':'turtle' };   /* (RS-879: the last three remade too) */
    for (const nm in want){ const pt = m3dPortrait({ nm }); if (!pt){ out.k[nm] = { none:1 }; continue; } const e = m3dInstance({ nm }, pt), R = e.rig, k = out.k[nm] = { drk:R.drk||null, want:want[nm] };
      if (!R.drk) continue;
      k.necks = R.necks.length; k.tail = R.tailJ.length; k.legs = R.legs.length; k.wings = (R.wings||[]).length; k.skinned = 0; e.root.traverse(o=>{ if (o.isSkinnedMesh) k.skinned++; });
      let bad = 0; const chk = ()=>{ e.holder.updateMatrixWorld(true); e.root.traverse(o=>{ if (!o.matrixWorld.elements.every(isFinite)) bad++; }); };
      for (const [t, mv, wind, strike, bk] of [[0.5, 0, 0, 0, 9], [1.2, 1, 0, 0, 9], [2.0, 0, 1, 0, 9], [2.5, 0, 0, 1, 9], [3.1, 0, 0, 0, 0.6]]){ e.breathK = bk; e.anim(R, t, mv, wind, strike, 0, e); chk(); }
      k.bad = bad; e.breathK = 9; e.anim(R, 0.5, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true);
      /* (the lowest point of its skin against its height: on the ground, give or take) */
      let lo = Infinity; const v = new T.Vector3(); e.root.traverse(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position; for (let i=0;i<pa.count;i+=3){ v.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, v); v.applyMatrix4(o.matrixWorld); if (v.y < lo) lo = v.y; } });
      const bb = new T.Box3().setFromObject(e.root); k.low = +((lo - e.holder.position.y)/(bb.max.y - bb.min.y)).toFixed(3);
      k.tris = tris(m3dDragon(Object.assign({}, pt.o))); if (k.drk!=='wyrm'){ const f = DRK.formOf; DRK.formOf = ()=>null; try{ k.old = tris(m3dDragon(Object.assign({}, pt.o))); } finally { DRK.formOf = f; } } }
    out.mythic0 = MYTHIC_KINDS[0]; out.mythicKind = mythicKind({ i:0 }); return out; });
  console.log(JSON.stringify(r));
  for (const [nm, k] of Object.entries(r.k)){
    A(!k.none, nm + ' has a portrait', k); A(k.drk===k.want, nm + ' is built as ' + k.want, k); if (!k.drk) continue;
    if (!/hydra|turtle|plesio/.test(k.drk)) A(k.necks===(nm==='king black dragon' ? 3 : 1) && k.tail >= 8 && k.legs===(k.drk==='wyvern' ? 2 : 4) && k.wings===2, nm + ': necks, tail, legs and wings on its rig', k);
    A(k.skinned > 0, nm + ' is skinned into a few meshes', k); A(k.bad===0, nm + ': no joint goes astray as it walks, rears, bites and breathes', k);
    A(Math.abs(k.low) < (k.drk==='plesio' ? 0.07 : 0.04), nm + ' stands on its feet, neither floating nor sunk (a swimmer paddles just above it)', k);
    if (k.old && !/hydra|turtle|plesio/.test(k.drk)) A(k.tris < k.old*0.85, nm + ' is lighter than the old dragon', k);
    A(k.tris < (nm==='king black dragon' || k.drk==='hydra' ? 280000 : k.drk==='wyrm' ? 340000 : 160000), nm + ' within its triangle budget', k); }
  A(r.mythic0==='great wyrm' && r.mythicKind==='great wyrm', 'the great wyrm is a mythic beast', r);
  /* a drake killed in a dungeon falls as a ragdoll */
  const r2 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); window.__corpseTime = 0; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    const out = {}; let best = null; for (let tries=0; tries<6 && !best; tries++){   /* (each way in is laid out afresh: in again until there's open floor) */
      G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
      for (let x=3;x<COLS-8 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-1;i<=4 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } } }
    out.room = !!best; if (!best) return out; G.player.x = best[0]; G.player.y = best[1]; try{ computeDungeonVisible(); }catch(e){}
    const d = { nm:'black dragon', alive:true, hp:200, maxHp:200, x:best[0] + 3, y:best[1], sym:'D', col:'#203028', cb:90, ac:18, atkBonus:9, dmg1:2, dmg2:12, xp:500, abilities:[] }; G.mon = [d]; ISO.dist = 7;
    for (let i=0;i<60;i++){ renderGame(); await wait(30); const e = M3D.inst.get(d); if (e && e.rig && e.rig.drk && i > 20) break; }
    const e = M3D.inst.get(d); out.built = !!(e && e.rig && e.rig.drk); if (!out.built) return out; e.holder.updateMatrixWorld(true); { const bb = new THREE.Box3(); e.rig.body.children.forEach(c=>{ if (c.isMesh) bb.expandByObject(c); }); e.root.traverse(o=>{ if (o.isSkinnedMesh) bb.expandByObject(o); }); out.hgt = +(bb.max.y - bb.min.y).toFixed(2); }
    d.alive = 0; m3dKill(d, { dmg:120, maxHp:200, kind:'melee' }); out.kind = e.dkind; out.chain = !!e.chain;
    let bad = 0; for (let i=0;i<110;i++){ renderGame(); await wait(30); if (e.chain) for (const p of e.chain.p) if (!isFinite(p.x.x + p.x.y + p.x.z)) bad++; } out.bad = bad;
    out.moved = e.chain ? +Math.max(...e.chain.p.map(p=>Math.hypot(p.x.x - e.chain.x0.x, p.x.z - e.chain.x0.z))).toFixed(2) : null;
    e.holder.updateMatrixWorld(true); let lo = Infinity; const vv = new THREE.Vector3(); e.root.traverseVisible(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position;
      for (let i=0;i<pa.count;i+=3){ vv.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, vv); vv.applyMatrix4(o.matrixWorld); if (vv.y < lo) lo = vv.y; } }); out.low = +(lo - e.holder.matrixWorld.elements[13]).toFixed(3);
    const c = e.holder.getWorldPosition(new THREE.Vector3()), cam = new THREE.PerspectiveCamera(40, 1.4, 0.05, 60); cam.position.set(c.x + 2.6, c.y + 2.2, c.z + 2.4); cam.lookAt(c.x, c.y + 0.3, c.z); FPD.r.render(FPD.scene, cam); out.shot = FPD.r.domElement.toDataURL('image/jpeg', 0.8);
    return out; });
  if (r2.shot) require('fs').writeFileSync(SHOTS + '/rs878-down.jpg', Buffer.from(r2.shot.split(',')[1], 'base64')); delete r2.shot;
  console.log(JSON.stringify(r2));
  A(r2.room && r2.built, 'a black dragon in a dungeon, built as the new drake', r2);
  A(r2.kind==='dragon' && r2.chain, 'it dies as a chain of joints', r2); A(r2.bad===0, 'no point flies off to nowhere', r2);
  A(r2.moved < 3, 'not flung away', r2); A(r2.low > -0.2*r2.hgt, 'it lies on the floor, not through it (a folded wing tip under it, at most)', r2);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
