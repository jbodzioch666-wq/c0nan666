// RS-877: a werewolf falls as a ragdoll - its body a chain of joints (hips, spine, neck, arms and wolf's legs) thrown by the blow,
// sprawling limp on the floor, never stiff, never through it, never flung away; and the ferries are gone (generator 33), from older worlds too
// Shots: shots/rs877-fall.png, shots/rs877-down.png, and close in on the body as it falls, shots/rs877-t{0,8,109}{a,b}.jpg
const path = require('path'), SHOTS = path.join(__dirname, 'shots');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); window.__corpseTime = 0; goToCharCreate(); ccBegin(); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    let dg = null; for (let x=0;x<OW_COLS && !dg;x++) for (let y=0;y<OW_ROWS;y++) if (G.ow.map[x][y]===OW_DUNGEON){ dg = [x, y]; break; }
    G.gameMode = 0; G.owPos = { x:dg[0], y:dg[1] }; G.pendingDungeon = { x:dg[0], y:dg[1] }; enterDungeonConfirm(); setUi('playing'); G.mon = []; for (let i=0;i<10;i++){ renderGame(); await wait(30); }
    const out = {}; let best = null; for (let x=3;x<COLS-8 && !best;x++) for (let y=3;y<ROWS-4;y++){ let ok = true; for (let i=-1;i<=4 && ok;i++) for (let j=-1;j<=1;j++) if (G.map[x+i][y+j]!==T_FLOOR){ ok = false; break; } if (ok){ best = [x, y]; break; } }
    out.room = !!best; if (!best) return out; G.player.x = best[0]; G.player.y = best[1]; try{ computeDungeonVisible(); }catch(e){}
    const w = { nm:'werewolf', alive:true, hp:60, maxHp:60, x:best[0] + 4, y:best[1], sym:'W', col:'#a08060', cb:61, ac:12, atkBonus:5, dmg1:2, dmg2:8, xp:50, abilities:[] }; G.mon = [w]; ISO.dist = 5.5;
    renderGame(); tickMonsters(); w.x = best[0] + 2; w.y = best[1]; for (let i=0;i<50;i++){ renderGame(); await wait(30); }
    const e = M3D.inst.get(w); out.wolf = !!(w.wolf && e && e.pt.o && e.pt.o.were); if (!out.wolf) return out;
    const hipsY = ()=>{ const v = new THREE.Vector3(); e.rig.hips.getWorldPosition(v); return v.y - e.holder.position.y; }; out.hip0 = +hipsY().toFixed(2);
        w.alive = 0; m3dKill(w, { dmg:40, maxHp:60, kind:'melee' }); out.kind = e.dkind; out.chain = !!e.chain; out.rigPose = !!(e.chain && e.chain.pose===m3dChainPoseRig);
    ISO.dist = 3.2; G.player.x = w.x - 1; G.player.y = w.y - 2; for (let i=0;i<12;i++){ renderGame(); await wait(30); } window.__wwE = e; return out; });
  console.log(JSON.stringify(r)); await page.screenshot({ path:SHOTS + '/rs877-fall.png' });
  const r2 = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)), e = window.__wwE, out = {}; let bad = 0;
    const shots = {}, cam = new THREE.PerspectiveCamera(35, 1.4, 0.05, 50), shoot = nm=>{ const c = e.holder.getWorldPosition(new THREE.Vector3()); for (const [k, ax, az] of [['a', 1.7, 1.2], ['b', -1.2, 1.7]]){ cam.position.set(c.x + ax, c.y + 1.3, c.z + az); cam.lookAt(c.x, c.y + 0.25, c.z); FPD.r.render(FPD.scene, cam); shots[nm + k] = FPD.r.domElement.toDataURL('image/jpeg', 0.8); } };
    for (let i=0;i<110;i++){ renderGame(); if (i===0 || i===8 || i===109) shoot('t' + i); await wait(30); if (e.chain) for (const p of e.chain.p) if (!isFinite(p.x.x + p.x.y + p.x.z)) bad++; } out.shots = shots;
    const v = new THREE.Vector3(); e.rig.hips.getWorldPosition(v); out.hip = +(v.y - e.holder.position.y).toFixed(2); out.bad = bad; out.upY = e.chain ? +e.chain.upY.toFixed(2) : null;
    out.moved = e.chain ? +Math.max(...e.chain.p.map((p, i)=>Math.hypot(p.x.x - e.chain.x0.x, p.x.z - e.chain.x0.z))).toFixed(2) : null;
    const bb = new THREE.Box3().setFromObject(e.root); out.hgt = +(bb.max.y - bb.min.y).toFixed(2);
    /* the lowest point of the body itself (its skin, every vertex; the box is its standing shape and reaches lower) */
    e.holder.updateMatrixWorld(true); let lo = Infinity; const vv = new THREE.Vector3(); e.root.traverseVisible(o=>{ if (!o.isMesh || o.isInstancedMesh || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position;
      for (let i=0;i<pa.count;i++){ vv.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, vv); vv.applyMatrix4(o.matrixWorld); if (vv.y < lo) lo = vv.y; } }); out.low = +(lo - e.holder.matrixWorld.elements[13]).toFixed(3);
    return out; });
  for (const [k, v] of Object.entries(r2.shots||{})) require('fs').writeFileSync(SHOTS + '/rs877-' + k + '.jpg', Buffer.from(v.split(',')[1], 'base64')); delete r2.shots;
  console.log(JSON.stringify(r2)); await page.screenshot({ path:SHOTS + '/rs877-down.png' });
  /* and the ferries are gone: none on a new world, and an older world's landings taken away though the rest of it stands as it was */
  const r3 = await page.evaluate(()=>{ const out = {}; out.genVer = G.ow.genVer; out.newF = (G.ow.ferries||[]).length + G.ow.pois.filter(p=>p.k==='ferry').length;
    G.ow.genVer = 32; generateOverworld(G.ow.seed); out.oldF = (G.ow.ferries||[]).length + G.ow.pois.filter(p=>p.k==='ferry').length; out.oldPois = G.ow.pois.length;
    return out; });
  console.log(JSON.stringify(r3));
  A(r3.genVer===33 && r3.newF===0, 'a new world has no ferries', r3); A(r3.oldF===0 && r3.oldPois > 5, 'an old world loses its landings, keeping its other places', r3);
  A(r.room && r.wolf, 'a werewolf, changed', r);
  A(r.kind==='man' && r.chain && r.rigPose, 'it dies as a chain of joints, posed from its own rig', r);
  A(r2.bad===0, 'no point flies off to nowhere', r2);
  A(r2.upY < 0.5 && r2.hip < r.hip0*0.8, 'it ends lying on the floor, not standing: its hips ' + r2.hip + ' high (from ' + r.hip0 + '), their up ' + r2.upY, r2);
  A(r2.low > -0.05, 'nothing through the floor', r2); A(r2.moved < 2.5, 'not flung away', r2);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
