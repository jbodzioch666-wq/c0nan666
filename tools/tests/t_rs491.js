// RS-491: the Archer kit starts with a leather quiver, worn on the back with arrows in it (monster archers carry one too); and a
// bow put away lies across the back - its hidden nocked arrow no longer throws its sling off to one side, floating by the hip
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {};
    rsApplyKit(1); G.player.rsLastType = 'ranged'; rsSync && rsSync(); out.cape = G.gear.cape && G.gear.cape.nm; out.saves = G.gear.cape && G.gear.cape.saveArrows;
    const me = m3dInstance({}, rsPlayerLook()), rg = me.rig, q = rg.quiver;
    const inTorso = (o, v)=>{ me.holder.updateMatrixWorld(true); return rg.torso.worldToLocal(o.localToWorld(v.clone())); };
    if (q){ let a = q; while (a && a!==rg.torso) a = a.parent; out.onTorso = a===rg.torso; const bot = inTorso(q, new T.Vector3()), top = inTorso(q, new T.Vector3(0, 0.36, 0));
      out.behind = +Math.max(bot.z, top.z).toFixed(3); out.mouthRight = +(top.x - bot.x).toFixed(3); out.rises = +(top.y - bot.y).toFixed(3); let n = 0; q.traverse(o=>{ if (o.isMesh && o.visible) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count)/3; });
      me.root.traverse(o=>{ if (!o.isSkinnedMesh || !o.skeleton) return; const under = new Set(); o.skeleton.bones.forEach((b, k)=>{ let a = b; while (a && a!==q) a = a.parent; if (a===q) under.add(k); }); if (!under.size) return;   /* (RS-578: the quiver's parts ride in the figure's one skinned mesh, on the quiver's joints) */
        const si = o.geometry.attributes.skinIndex, ix = o.geometry.index; if (ix){ for (let i=0;i<ix.count;i+=3) if (under.has(si.getX(ix.getX(i)))) n++; } else { for (let i=0;i<si.count;i+=3) if (under.has(si.getX(i))) n++; } }); out.qTris = Math.round(n); }
    /* the bow put away */
    for (let i=0;i<30;i++) rsSheath(me, false, 0.1, i*0.1, 0); me.holder.updateMatrixWorld(true);
    const box = new T.Box3(), inv = new T.Matrix4().copy(rg.torso.matrixWorld).invert();
    rg.weapon.traverse(o=>{ if (!o.isMesh) return; for (let a = o; a; a = a.parent){ if (!a.visible) return; if (a===rg.weapon) break; } const g = o.geometry; g.computeBoundingBox(); box.union(g.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld))); });
    const c = box.getCenter(new T.Vector3()), sz = box.getSize(new T.Vector3()); out.bowAway = rg.weapon.parent===rg.torso; out.bowX = +c.x.toFixed(3); out.bowZ = +c.z.toFixed(3); out.bowSpan = +Math.max(sz.x, sz.y).toFixed(3); out.bowDepth = +sz.z.toFixed(3);
    out.gob = !!m3dInstance({}, m3dPortrait({ nm:'goblin archer' })).rig.quiver;
    rsApplyKit(0); G.player.rsLastType = 'melee'; rsSync && rsSync(); out.warrior = !!m3dInstance({}, rsPlayerLook()).rig.quiver;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.cape==='Leather Quiver' && r.saves > 0, 'the Archer kit starts with a leather quiver');
  A(r.onTorso && r.behind < -0.05 && r.qTris > 1000, 'the quiver hangs on your back, arrows in it');
  A(r.mouthRight < -0.02 && r.rises > 0.25, 'slung from the left hip up to the right shoulder');
  A(r.gob && !r.warrior, 'monster archers carry one; a warrior without a quiver does not');
  A(r.bowAway && Math.abs(r.bowX) < 0.12 && r.bowZ < -0.05, 'the bow put away lies across the middle of your back');
  A(r.bowSpan > 0.3 && r.bowDepth < 0.15, 'laid flat against the back');
};
