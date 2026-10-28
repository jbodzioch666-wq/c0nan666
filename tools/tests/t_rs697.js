// RS-697: felling a tree. You walk up to the trunk (an axe's reach from it, not the middle of the next tile), the tree stands on its
// own while you chop (its chunk leaves it out); the swing heaves the axe up over your shoulder and brings it in level at the trunk,
// the left hand on the haft; each blow throws chips, shakes leaves down and jolts the tree, the notch deepens with the logs taken;
// (RS-698: the tree well over your head, its crown up above the cut); stopping walks you back and puts the tree back in its chunk; the last log fells this tree, notch and all. Shot: shots/rs697.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), wait = ms=>new Promise(res=>setTimeout(res, ms));
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4;
    skP().tools.axe = Math.max(1, skP().tools.axe||0); owHunterSpawn = ()=>{}; owHuntersStep = ()=>false;
    let n = null, st = null; for (let rr=1; rr<40 && !n; rr++) for (let i=-rr;i<=rr && !n;i++) for (let j=-rr;j<=rr && !n;j++){ if (Math.max(Math.abs(i), Math.abs(j))!==rr) continue; const q = skNodeAt(G.owPos.x + i, G.owPos.y + j); if (!q || q.k!=='woodcutting' || q.gone || q.max < 3 || skNodeReq(q) > skLvl('woodcutting')) continue;
      for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]){ const x = q.x + dx, y = q.y + dy; if (o3Passable(x, y) && G.ow.map[x][y]!==OW_WATER && !skNodeAt(x, y)){ n = q; st = [x, y]; break; } } }
    if (!n) return { none:true };
    G.owPos = { x:st[0], y:st[1] }; owReveal(st[0], st[1], 8); await fr(120);
    const out = {}, T = THREE, [sx, sz] = o3C(n.x, n.y), [hx, hz] = o3C(st[0], st[1]), key = n.x+','+n.y, P = O3.player, e = P.e, trunk = (v)=>Math.hypot(v.x - sx, v.z - sz);
    const mine = k=>k.startsWith(key) && /^[a-z]/.test(k.slice(key.length)), chunkKey = ()=>{ for (const c of O3.nodeChunks.values()){ const k = c.key.split('|').find(mine); if (k) return k; } return null; };
    out.before = chunkKey();
    const real = skGatherTick; skGatherTick = ()=>{};
    skDo(skNodeOption(n)); await wait(1200);
    out.gather = !!G.gather; out.stand = +trunk(O3.ppos).toFixed(3); out.want = +(o3ChopTrunkR(skNodeAt(n.x, n.y)) + 0.42).toFixed(3); out.tile = +Math.hypot(hx - sx, hz - sz).toFixed(3);
    out.own = !!(O3.chop && O3.chop.obj.parent===O3.scene && O3.chop.key===key); out.during = chunkKey();
    /* (RS-698) the tree well over your head, its crown up above the cut */
    { const tree = O3.chop.obj.children[0], b = new T.Box3(), cr = new T.Box3(); tree.updateMatrixWorld(true); b.setFromObject(tree); tree.children.forEach((m, i)=>{ if (i) cr.expandByObject(m); }); const pb = new T.Box3().setFromObject(e.holder);
      out.tall = { you:+(pb.max.y - pb.min.y).toFixed(2), tree:+(b.max.y - b.min.y).toFixed(2), crown:+(cr.min.y - O3.chop.obj.position.y).toFixed(2), type:n.type, size:+o3ChopSize(n).toFixed(2) }; }
    /* the swing, held at moments of it */
    const hold = async ph=>{ for (let f=0; f<2; f++){ e.chopT = ph*CHOP_P + 3*CHOP_P - 0.017; e.chopPh = undefined; await fr(1); }
      const R = e.rig.arms[0], head = new T.Vector3(0, 0.66, 0.1); e.tool.updateWorldMatrix(true, false); e.tool.localToWorld(head); const lh = new T.Vector3(); e.rig.arms[1].hand.getWorldPosition(lh);
      return { arm:+R.sh.rotation.x.toFixed(2), twist:+e.rig.torso.rotation.y.toFixed(2), head:+trunk(head).toFixed(3), headY:+(head.y - O3.ppos.y).toFixed(2), left:+lh.distanceTo(e.tool.localToWorld(new T.Vector3(0, -0.06, 0))).toFixed(3) }; };
    out.ready = await hold(0); out.wound = await hold(0.42); out.blow = await hold(CHOP_HIT); out.back = await hold(0.85);
    { await hold(CHOP_HIT); const c2 = O3.cam.clone(), d = new T.Vector3(sx - O3.ppos.x, 0, sz - O3.ppos.z).normalize(); c2.position.set(O3.ppos.x - d.x*0.9 + d.z*0.9, O3.ppos.y + 1.0, O3.ppos.z - d.z*0.9 - d.x*0.9); c2.lookAt(sx, O3.ppos.y + 0.4, sz); c2.updateProjectionMatrix(); O3.renderer.render(O3.scene, c2); out.shot = O3.renderer.domElement.toDataURL('image/png'); }
    /* real blows */
    e.chopT = 0; e.chopPh = undefined; let jolt = 0, chips = 0, leaves = 0; const t0 = performance.now();
    while (performance.now() - t0 < 3000){ await fr(1); jolt = Math.max(jolt, Math.abs(O3.chop.obj.rotation.x) + Math.abs(O3.chop.obj.rotation.z)); chips = Math.max(chips, O3.crig.chips.filter(c=>c.t>=0).length); leaves = Math.max(leaves, O3.crig.leaves.filter(c=>c.t>=0).length); }
    out.hits = O3.chop.hits; out.jolt = +jolt.toFixed(3); out.chips = chips; out.leaves = leaves; out.notch = O3.chop.notch.visible;
    out.chipsDown = O3.crig.chips.filter(c=>c.t > 1).every(c=>Math.abs(c.m.position.y - O3.heightAt(c.m.position.x, c.m.position.z)) < 0.02);
    /* the notch deepens as the logs are taken */
    const h0 = O3.chop.notch.scale.y; skUsed()[key] = { left:1, until:0 }; await fr(3); out.deeper = [+h0.toFixed(4), +O3.chop.notch.scale.y.toFixed(4)];
    /* stopping: back to your tile, the tree back in its chunk, the wrist straight */
    skStop(); await wait(900); out.stopped = { chop:!!O3.chop, key:O3.chopKey, home:+Math.hypot(O3.ppos.x - hx, O3.ppos.z - hz).toFixed(3), chunk:chunkKey(), wrist:+e.rig.arms[0].hand.rotation.x.toFixed(3) };
    /* felled: the last log brings down this tree */
    skDo(skNodeOption(skNodeAt(n.x, n.y))); await wait(1500); const C = O3.chop; out.again = !!C;
    skGatherTick = real; { const rr = Math.random; Math.random = ()=>0.02; G.gather.next = 0; skGatherTick(performance.now()); Math.random = rr; }
    await fr(2); out.fell = { fall:!!O3.fall, same:!!(O3.fall && O3.fall.obj && C && C.obj.parent===O3.fall.obj), gone:!!skNodeAt(n.x, n.y).gone, chop:!!O3.chop };
    await wait(600); out.fell.stump = (chunkKey()||'').includes('g');
    return out; });
  if (r.shot) require('fs').writeFileSync(SHOTS + '/rs697.png', Buffer.from(r.shot.split(',')[1], 'base64')); r.shot = !!r.shot;
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: ' + m + ' ' + JSON.stringify(r)); };
  A(!r.none && r.gather, 'chopping a tree on the land');
  A(Math.abs(r.stand - r.want) < 0.04 && r.stand < r.tile - 0.25, 'walked up to the trunk, an axe\'s reach from it');
  A(r.own && r.before && !r.before.endsWith('c') && r.during && r.during.endsWith('c'), 'the tree stands on its own while you chop it, out of its chunk');
  A(r.tall.tree > r.tall.you*1.4 && r.tall.crown > r.blow.headY + 0.3, 'the tree stands well over you, its crown up above the cut (RS-698)');
  A(r.wound.arm < r.ready.arm - 0.6 && r.wound.twist > r.ready.twist + 0.4 && r.wound.headY > 0.9, 'wound up: the axe heaved up over the shoulder, the body turned away');
  A(r.blow.head < 0.12 && r.blow.headY > 0.2 && r.blow.headY < 0.6 && r.blow.twist < r.ready.twist - 0.5, 'the blow: the axe head at the trunk, at the waist, the body turned into it');
  A(r.ready.left < 0.06 && r.blow.left < 0.06 && r.back.left < 0.06, 'the left hand on the haft');
  A(r.hits >= 2 && r.jolt > 0.01 && r.chips >= 5 && r.leaves >= 2 && r.notch && r.chipsDown, 'blows: chips thrown (and lying on the ground), leaves shaken down, the tree jolted, the notch cut');
  A(r.deeper[1] > r.deeper[0]*1.2, 'the notch deepens with the logs taken');
  A(!r.stopped.chop && !r.stopped.key && r.stopped.home < 0.05 && r.stopped.chunk && !r.stopped.chunk.endsWith('c') && r.stopped.wrist===0, 'stopped: back on your tile, the tree back in its chunk, the wrist straight');
  A(r.again && r.fell.fall && r.fell.same && r.fell.gone && !r.fell.chop && r.fell.stump, 'the last log fells the tree you were chopping, a stump left');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
