// (probe, not in ALL) the unmerged parts of a few figures: which rig key refers to each, whether posing moves it, what it is
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = {};
    const looks = { player:rsPlayerLook(), guard:(()=>{ try{ return v3PlayerLook ? null : null; }catch(e){ return null; } })() };
    const vl = []; try{ for (let i=0;i<4;i++) vl.push(['villager'+i, v3VillagerLook ? v3VillagerLook(i) : null]); }catch(e){}
    // the town's own people, as the town makes them
    const t = G.ow.spawnPos; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); }
    const cases = [].concat(V3.npcs||[], V3.villagers||[]).filter(p=>p.e && p.e.rig).slice(0, 12).map((p, i)=>['town' + i + ':' + (p.role || p.kind || p.name || ''), null, p.e]);
    for (const [nm, look, e0] of cases){
      const e = e0, root = e.root, rig = e.rig;
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
      const rows = left.map(L=>({ ref:L.ref ? L.ref.replace(/\.\d+/g, '.#') : null, moved:moved.has(L.o), prop:L.prop, geo:L.geo, nm:L.nm, v:L.v, ud:L.ud.join(','), mat:L.m.type + (L.m.transparent ? '+T' : '') + (L.m.userData.special ? '+sp:' + L.m.userData.special : '') + (L.m.userData.bend ? '+bend' : '') + (L.m.userData.rim ? '+rim' : '') }));
      const by = {}; for (const r of rows){ const k = (r.ref || 'noRef') + '|' + (r.moved ? 'MOVED' : 'still') + '|' + (r.prop ? 'prop' : '') + '|' + r.ud + '|' + r.mat + '|' + (r.nm || r.geo); by[k] = (by[k]||0) + 1; }
      out[nm] = { total:rows.length, verts:rows.reduce((a, r)=>a + r.v, 0), by:Object.entries(by).sort((a,b)=>b[1]-a[1]) };
      let sk = 0; const sks = []; root.traverse(o=>{ if (o.isSkinnedMesh){ sk++; const m = o.material; sks.push([o.geometry.attributes.position.count, m.type.replace('Mesh','').replace('Material',''), m.map ? 'map:' + m.map.uuid.slice(0, 6) + (m.map.image ? '@' + (m.map.image.width||'?') : '') : '', 'r' + m.roughness, 'm' + m.metalness, m.flatShading ? 'flat' : '', m.emissive && m.emissive.getHex() ? 'em' + m.emissive.getHex().toString(16) + '*' + m.emissiveIntensity : '', m.userData.rim ? 'rim' : '', m.side, m.transparent ? 'T' : '', m.alphaTest || '', m.vertexColors ? 'vc' : '', m.userData.special || ''].join('|')); } }); out[nm].skinned = sk; out[nm].sks = sks;
      // and the loose rim-standard meshes' maps too
      out[nm].loose = left.filter(L=>!L.m.transparent && !L.m.userData.special).map(L=>(L.nm || L.geo) + '|' + (L.m.map ? 'map:' + L.m.map.uuid.slice(0, 6) : '') + '|r' + L.m.roughness + '|m' + L.m.metalness + (L.m.userData.rim ? '|rim' : '') + '|' + L.v); }
    return out; });
  for (const k in r){ console.log('==', k, 'left', r[k].total, 'skinned', r[k].skinned); for (const a of r[k].sks) console.log('  SK', a); for (const a of r[k].loose) console.log('  LO', a); }
};
