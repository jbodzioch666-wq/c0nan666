// (probe, not in ALL) the unmerged parts of a few figures: which rig key refers to each, whether posing moves it, what it is
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {};
    const looks = { player:rsPlayerLook(), guard:(()=>{ try{ return v3PlayerLook ? null : null; }catch(e){ return null; } })() };
    const vl = []; try{ for (let i=0;i<4;i++) vl.push(['villager'+i, v3VillagerLook ? v3VillagerLook(i) : null]); }catch(e){}
    const cases = [['player', looks.player]].concat(vl.filter(v=>v[1]));
    for (const [nm, look] of cases){
      const pt = look.paint ? look : Object.assign({}, look); const e = m3dInstance({}, pt), root = e.root, rig = e.rig;
      // rig refs: every object reachable from the rig, with its path
      const refOf = new Map(), seen = new Set(); const walk = (v, path, d)=>{ if (!v || typeof v!=='object' || seen.has(v) || d > 6) return; seen.add(v); if (v.isObject3D){ if (!refOf.has(v)) refOf.set(v, path); return; } if (v.isMaterial || v.isBufferGeometry || v.isColor || v.isVector3) return; const ks = Array.isArray(v) ? v.map((x,i)=>[i,x]) : Object.entries(v); for (const [k, x] of ks) walk(x, path + '.' + k, d + 1); }; walk(rig, 'rig', 0);
      const props = new Set(); for (const k of ['weapon','shield','offWpn','tome']) if (rig && rig[k] && rig[k].isObject3D) rig[k].traverse(o=>props.add(o));
      // pose over a few frames; note which leftover meshes' own local transforms change
      const left = []; root.updateMatrixWorld(true);
      root.traverse(o=>{ if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || !o.visible) return; let hid = false; for (let q = o.parent; q && q!==root; q = q.parent) if (!q.visible) hid = true; if (hid) return;
        let ref = null; for (let q = o; q && q!==root; q = q.parent){ if (refOf.has(q)){ ref = refOf.get(q) + (q===o ? '' : ' (anc)'); break; } }
        left.push({ o, ref, prop:props.has(o), m:o.material, ud:Object.keys(o.userData), geo:o.geometry.type, nm:o.name, v:o.geometry.attributes.position.count, l0:o.matrix.clone(), vis0:o.visible }); });
      const moved = new Set(); const pose = (t, mv, strike)=>{ e.fol = 0; e.mvS = mv; e.wph = t*9; if (e.anim) e.anim(rig, t, mv, 0, strike, 0, e); else if (e.beast) m3dPoseBeast(rig, t, mv, 0, strike, 0, e); else m3dPoseHumanoid(rig, t, mv, 0, strike, 0, e); root.updateMatrixWorld(true);
        for (const L of left){ L.o.updateMatrix(); if (!L.o.matrix.equals(L.l0)) moved.add(L.o); if (L.o.visible!==L.vis0) moved.add(L.o); } };
      for (const t of [0.3, 0.7, 1.1, 1.6]){ pose(t, 0, 0); pose(t, 1, 0); pose(t, 0, 1); }
      const rows = left.map(L=>({ ref:L.ref, moved:moved.has(L.o), prop:L.prop, geo:L.geo, nm:L.nm, v:L.v, ud:L.ud.join(','), mat:L.m.type + (L.m.transparent ? '+T' : '') + (L.m.userData.special ? '+sp:' + L.m.userData.special : '') + (L.m.userData.bend ? '+bend' : '') + (L.m.userData.rim ? '+rim' : '') }));
      const by = {}; for (const r of rows){ const k = (r.ref || 'noRef') + '|' + (r.moved ? 'MOVED' : 'still') + '|' + (r.prop ? 'prop' : '') + '|' + r.ud + '|' + r.mat + '|' + (r.nm || r.geo); by[k] = (by[k]||0) + 1; }
      out[nm] = { total:rows.length, verts:rows.reduce((a, r)=>a + r.v, 0), by:Object.entries(by).sort((a,b)=>b[1]-a[1]) };
      let sk = 0; root.traverse(o=>{ if (o.isSkinnedMesh) sk++; }); out[nm].skinned = sk; }
    return out; });
  for (const k in r){ console.log('==', k, 'left', r[k].total, 'verts', r[k].verts, 'skinned', r[k].skinned); for (const [a, n] of r[k].by) console.log(' ', n, a); }
};
