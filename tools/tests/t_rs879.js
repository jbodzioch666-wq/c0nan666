// RS-879: the hydra (and the hydra of the tides), the dragon turtle and the plesiosaurus remade on the jointed dragon rig - five fanned
// necks on the hydra, a scuted shell on the turtle, four rowing flippers on the sea serpent; each builds, poses with no joint astray,
// stands on the ground, and dies as a ragdoll in a dungeon without being flung or sinking through the floor
// Shots: shots/rs879-<kind>.jpg (each fallen in a dungeon)
const path = require('path'), SHOTS = path.join(__dirname, 'shots');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const want = { 'hydra':'hydra', 'hydra of the tides':'hydra', 'dragon turtle':'turtle', 'plesiosaurus':'plesio' };
  const r = await page.evaluate(want=>{ const T = THREE, out = {};
    for (const nm in want){ const pt = m3dPortrait({ nm }), k = out[nm] = {}; if (!pt){ k.none = 1; continue; }
      const raw = m3dDragon(Object.assign({}, pt.o)); let shell = 0; raw.traverse(o=>{ if (o.isMesh && o.material && o.material.userData && o.material.userData.kind==='shell') shell++; });
      const e = m3dInstance({ nm }, pt), R = e.rig; Object.assign(k, { drk:R.drk||null, necks:R.necks.length, tail:R.tailJ.length, legs:R.legs.filter(L=>L.up).length, flip:R.legs.filter(L=>L.flip).length, shell });
      let bad = 0; for (const [t, mv, wind, strike, bk] of [[0.5, 0, 0, 0, 9], [1.2, 1, 0, 0, 9], [2.0, 0, 1, 0, 9], [2.5, 0, 0, 1, 9], [3.1, 0, 0, 0, 0.6]]){ e.breathK = bk; e.anim(R, t, mv, wind, strike, 0, e); e.holder.updateMatrixWorld(true); e.root.traverse(o=>{ if (!o.matrixWorld.elements.every(isFinite)) bad++; }); } k.bad = bad;
      /* the heads spread apart: no two closer than a head's length */
      e.anim(R, 0.5, 0, 0, 0, 0, e); e.holder.updateMatrixWorld(true); const hp = R.necks.map(N=>N.head.getWorldPosition(new T.Vector3())); let gap = Infinity; for (let i=0;i<hp.length;i++) for (let j=i+1;j<hp.length;j++) gap = Math.min(gap, hp[i].distanceTo(hp[j]));
      const bb = new T.Box3(); e.holder.traverse(o=>{ if (o.isMesh) bb.expandByObject(o, true); }); k.h = +(bb.max.y - bb.min.y).toFixed(3); k.gap = hp.length > 1 ? +(gap/k.h).toFixed(3) : null; k.low = +((bb.min.y - e.holder.position.y)/k.h).toFixed(3); }
    return out; }, want);
  console.log(JSON.stringify(r));
  for (const [nm, k] of Object.entries(r)){ A(!k.none, nm + ' has a portrait', k); A(k.drk===want[nm], nm + ' is built as the new ' + want[nm], k); A(k.bad===0, nm + ': no joint goes astray as it walks, rears, bites and breathes', k);
    A(Math.abs(k.low) < (k.drk==='plesio' ? 0.07 : 0.04), nm + ' rests on the ground', k); A(k.tail >= 6, nm + ' has a jointed tail', k);
    if (k.drk==='hydra') A(k.necks===5 && k.legs===4 && k.gap > 0.12, nm + ': five necks fanned out, the heads apart', k);
    if (k.drk==='turtle') A(k.necks===1 && k.legs===4 && k.shell > 0, nm + ': one neck, four legs and a shell', k);
    if (k.drk==='plesio') A(k.necks===1 && k.flip===4 && k.legs===0, nm + ': one long neck and four flippers', k); }
  /* each falls as a ragdoll in a dungeon */
  for (const nm of ['hydra', 'dragon turtle', 'plesiosaurus']){
    const r2 = await page.evaluate(async nm=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); window.__corpseTime = 0;
      if (!window.__rs879w){ goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; window.__rs879w = 1; } G.player.hp = G.player.maxHp = 99999;
      let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
      const out = {}; let best = null; for (let tries=0; tries<6 && !best; tries++){
        G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
        for (let x=3;x<COLS-8 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-1;i<=4 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } } }
      out.room = !!best; if (!best) return out; G.player.x = best[0]; G.player.y = best[1]; try{ computeDungeonVisible(); }catch(e){}
      const d = { nm, alive:true, hp:200, maxHp:200, x:best[0] + 3, y:best[1], sym:'D', col:'#203028', cb:90, ac:18, atkBonus:9, dmg1:2, dmg2:12, xp:500, abilities:[] }; G.mon = [d]; ISO.dist = 7;
      for (let i=0;i<60;i++){ renderGame(); await wait(30); const e = M3D.inst.get(d); if (e && e.rig && e.rig.drk && i > 20) break; }
      const e = M3D.inst.get(d); out.built = !!(e && e.rig && e.rig.drk); if (!out.built) return out; e.holder.updateMatrixWorld(true); { const bb = new THREE.Box3(); e.root.traverse(o=>{ if (o.isMesh && !o.isInstancedMesh) bb.expandByObject(o, true); }); out.hgt = +(bb.max.y - bb.min.y).toFixed(2); }
      d.alive = 0; m3dKill(d, { dmg:120, maxHp:200, kind:'melee' }); out.chain = !!e.chain;
      let bad = 0; for (let i=0;i<110;i++){ renderGame(); await wait(30); if (e.chain) for (const p of e.chain.p) if (!isFinite(p.x.x + p.x.y + p.x.z)) bad++; } out.bad = bad;
      out.moved = e.chain ? +Math.max(...e.chain.p.map(p=>Math.hypot(p.x.x - e.chain.x0.x, p.x.z - e.chain.x0.z))).toFixed(2) : null;
      e.holder.updateMatrixWorld(true); let lo = Infinity; const vv = new THREE.Vector3(); e.root.traverseVisible(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position;
        for (let i=0;i<pa.count;i+=3){ vv.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, vv); vv.applyMatrix4(o.matrixWorld); if (vv.y < lo) lo = vv.y; } }); out.low = +(lo - e.holder.matrixWorld.elements[13]).toFixed(3);
      const c = e.holder.getWorldPosition(new THREE.Vector3()), cam = new THREE.PerspectiveCamera(40, 1.4, 0.05, 60); cam.position.set(c.x + 2.6, c.y + 2.2, c.z + 2.4); cam.lookAt(c.x, c.y + 0.3, c.z); FPD.r.render(FPD.scene, cam); out.shot = FPD.r.domElement.toDataURL('image/jpeg', 0.8);
      return out; }, nm);
    if (r2.shot) require('fs').writeFileSync(SHOTS + '/rs879-' + nm.replace(/ /g, '') + '.jpg', Buffer.from(r2.shot.split(',')[1], 'base64')); delete r2.shot;
    console.log(nm, JSON.stringify(r2));
    A(r2.room && r2.built, nm + ' in a dungeon, built new', r2); A(r2.chain, nm + ' dies as a chain of joints', r2); A(r2.bad===0, nm + ': no point flies off to nowhere', r2);
    A(r2.moved < 3, nm + ' not flung away', r2); A(r2.low > -0.2*r2.hgt, nm + ' lies on the floor, not through it', r2); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
