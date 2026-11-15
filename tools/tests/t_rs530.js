// RS-530: no flat cards on the face - a human man's square jaw is sculpted into the jaw (it was a box whose corners stuck out below
// it), scars and war paint are laid onto the skin and follow its curve, and a moustache is strands over the lip (it was two boxes)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const build = (lk, race)=>{ const L = Object.assign(lookDefault(race || 'Human'), { body:0, hair:2 }, lk), pt = rsPlayerLook({ race:race || 'Human', look:L, bare:true }), root = m3dBuilders().get(pt.paint)(pt.o); return M3D.meta.get(root).rig.head; };
    const boxes = h=>{ let n = 0; h.traverse(o=>{ if (o.isMesh && o.geometry.type==='BoxGeometry') n++; }); return n; };
    out.plainBoxes = boxes(build({ beard:0, scar:0 })); out.scarBoxes = boxes(build({ beard:0, scar:3 })); out.forkBoxes = boxes(build({ beard:8, scar:0 })); out.dwarfBoxes = boxes(build({ beard:3 }, 'Dwarf'));
    /* the decals sit on the skin: every point of them within a hair of the face beneath */
    const h = build({ beard:0, scar:3, paint:1 }); let head = null; h.children.forEach(c=>{ if (c.isMesh && c.geometry.attributes.position.count > 3000 && c.material.userData.kind==='skin' && (!head || c.geometry.attributes.position.count > head.geometry.attributes.position.count)) head = c; });
    const hp = head.geometry.attributes.position, sx = head.scale.x; let worst = 0, decals = 0;
    h.children.forEach(c=>{ if (!(c.isMesh && c.material && c.material.userData.special==='decal')) return; decals++; const p = c.geometry.attributes.position;
      for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i); let d = 1; for (let j=0;j<hp.count;j++){ const dx = hp.getX(j)*sx - x, dy = hp.getY(j) - y, dz = hp.getZ(j) - z; const dd = dx*dx + dy*dy + dz*dz; if (dd < d) d = dd; } if (Math.sqrt(d) > worst){ worst = Math.sqrt(d); out.at = [decals, x, y, z].map(v=>+(+v).toFixed(4)); out.hdPos = [head.position.x, head.position.y, head.position.z, head.scale.x, head.scale.y]; } } });
    out.decals = decals; out.worst = +worst.toFixed(4);
    /* the square jaw: a human man's jaw is wider at its base than a woman's or a sculpt without it */
    out.jawKey = (()=>{ const L = Object.assign(lookDefault('Human'), { body:0 }); return !!rsPlayerLook({ race:'Human', look:L, bare:true }).o.squareJaw; })();
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.plainBoxes===0, 'no box on a plain human face (the square jaw is sculpted)');
  A(r.scarBoxes===0 && r.forkBoxes===0 && r.dwarfBoxes===0, 'no boxes for scars or moustaches');
  A(r.decals >= 5 && r.worst < 0.004, 'the scars and paint lie on the skin');
  A(r.jawKey, 'a human man still has his square jaw');
};
