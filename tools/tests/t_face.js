// RS-280: faces - eyes set in sculpted sockets under an upper and a lower lid (an almond opening, not a ball stuck on the
// cheek), a glossy eyeball with an iris, a pupil and a glint; brows; nostrils; hair grown as strands merged into one mesh
// over a scalp dome, with a mass behind the neck when it is long; beards of strands with a moustache
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const lids = fem=>{ const g = m3dHeadGeo('human', fem), p = g.attributes.position; const prof = []; for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (Math.abs(x - 0.026) < 0.003 && y > 0.06 && y < 0.095) prof.push([+y.toFixed(3), z]); }
      const at = y0=>Math.max(-1, ...prof.filter(q=>Math.abs(q[0] - y0) < 0.002).map(q=>q[1])); return { verts:p.count, upper:+at(0.086).toFixed(4), gap:+at(0.077).toFixed(4), lower:+at(0.069).toFixed(4) }; };
    out.m = lids(false); out.f = lids(true);
    const info = pt=>{ const e = m3dInstance({}, pt), h = e.rig.head; let balls = 0, iris = 0, hairMesh = null, hairVerts = 0, beardVerts = 0, dome = 0;
      h.traverse(x=>{ if (!x.isMesh) return; const g = x.geometry; if (g.type==='SphereGeometry' && (Math.abs(g.parameters.radius - 0.0116) < 0.0003 || Math.abs(g.parameters.radius - 0.0122) < 0.0003) && Math.abs(x.position.y - 0.077) < 0.001) balls++;
        if (g.type==='SphereGeometry' && Math.abs(g.parameters.radius - 0.0058) < 0.0005) iris++;
        if (g.type==='SphereGeometry' && g.parameters.thetaLength < Math.PI*0.6 && x.rotation.x < -0.5) dome++;
        if (x.name==='hair'){ hairMesh = x; hairVerts += g.attributes.position.count; } if (x.name==='beard') beardVerts += g.attributes.position.count; });
      return { balls, iris, dome, hairVerts, beardVerts, hairDraws:hairMesh ? 1 : 0 }; };
    out.man = info(HUM({ outfit:'leather', hair:'#3a2618', hairStyle:'long', beard:'#4a3018', beardStyle:3 }));
    out.woman = info(HUM({ outfit:'leather', hair:'#8a6a3a', hairStyle:'short', fem:true }));
    out.tail = info(HUM({ outfit:'leather', hair:'#1a1210', hairStyle:'ponytail', beard:'#1a1210', beardStyle:2 }));
    out.glow = info(HUM({ outfit:'rags', head:'fiend', eyes:'255,80,40' }));
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  for (const k of ['m','f']){ const d = r[k]; A(d.upper > d.gap + 0.003 && d.lower > d.gap + 0.002, k+': the lids stand proud of the opening between them'); A(d.verts > 7000, k+': the head is sculpted finely'); }
  A(r.man.balls===2 && r.man.iris===2 && r.woman.balls===2, 'two eyeballs in their sockets, each with an iris');
  A(r.glow.balls===0, 'a fiend keeps its glowing eyes');
  A(r.man.hairDraws===1 && r.man.hairVerts > 3000 && r.man.dome===1, 'long hair is one merged mesh of strands over a scalp dome');
  A(r.woman.hairDraws===1 && r.woman.hairVerts > 2000 && r.woman.dome===1, 'short hair too');
  A(r.man.beardVerts > 2000 && r.tail.beardVerts > 800 && r.tail.beardVerts < r.man.beardVerts, 'a full beard and a smaller goatee of strands');
  console.log('face ok', JSON.stringify(r));
};
