// RS-664: no sheer turf beside the barrow's door. Outside the door stones the hood of turf is banked forward down to the ground beside
// the door (or beside the stair), as earth heaped against the stone frame: read straight down onto the turf in each barrow's own space,
// the bank reaches forward of the lintel beside the door and nowhere along it is the turf steeper than about 65 degrees; the doorway and
// the stair stay clear. Every barrow near the start. Shot: shots/rs664.png
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map, sites = questNearbySites(G.owPos.x, G.owPos.y, 1, 80, ['dungeon']).filter(s=>m[s.x][s.y]===OW_DUNGEON);
    let s = null; for (const c of sites) for (const [dx, dy] of [[1,1],[0,1],[1,0],[-1,1]]){ const q = owNb(c.x, c.y, dx, dy); if (s || !q || ![OW_GRASS, OW_FOREST, OW_DESERT, OW_TUNDRA, OW_SWAMP].includes(m[q[0]][q[1]])) continue; s = { x:q[0], y:q[1] }; }
    if (!s) return { none:true }; G.owPos = s; owReveal(s.x, s.y, 8); await fr(150);
    const out = [], rc = new THREE.Raycaster(), r2 = x=>x===null ? null : +x.toFixed(2);
    for (const [k, g] of (O3.doors || new Map())){ if (!g.doorLintel || !g.doorTurf) continue; g.updateMatrixWorld(true); const inv = g.matrixWorld.clone().invert(), v = new THREE.Vector3();
      const lb = new THREE.Box3(), lp = g.doorLintel.geometry.attributes.position, LM = new THREE.Matrix4().multiplyMatrices(inv, g.doorLintel.matrixWorld); for (let i=0;i<lp.count;i++) lb.expandByPoint(v.fromBufferAttribute(lp, i).applyMatrix4(LM));
      const at = (x, z)=>{ const o = new THREE.Vector3(x, 5, z).applyMatrix4(g.matrixWorld), d = new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld).sub(o).normalize(); rc.set(o, d); const h = rc.intersectObject(g.doorTurf, false)[0]; return h ? Math.max(0, h.point.applyMatrix4(inv).y) : 0; };
      const L = { top:lb.max.y, back:lb.min.z, mid:(lb.min.z + lb.max.z)/2, x1:Math.max(-lb.min.x, lb.max.x) };
      let steep = 0, at_ = null; for (const sx of [-1, 1]) for (const x of [0.45, 0.55, 0.65, 0.75, 0.85]) for (let z=L.back - 0.4; z<L.mid + 0.5; z+=0.025){ const a = at(sx*x, z), b = at(sx*x, z + 0.025), sl = Math.abs(b - a)/0.025; if (sl > steep){ steep = sl; at_ = [sx*x, +z.toFixed(2)]; } }
      out.push({ k, pit:!!g.doorPit, steep:r2(steep), at:at_, beside:[-1, 1].map(s=>r2(at(s*0.55, L.mid + 0.05))), door:r2(at(0, L.mid + 0.15)) }); }
    return { at:s, doors:out }; });
  await page.screenshot({ path: SHOTS + '/rs664.png' });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.none && r.doors.length >= 1, 'barrows found');
  for (const d of r.doors){ const j = JSON.stringify(d);
    for (const b of d.beside) A(b > 0.08, 'the bank comes forward beside the door, past the lintel: ' + j);
    A(d.steep < 2.1, 'no sheer turf beside the door (steepest under ~65 degrees): ' + j);
    A(d.door < 0.05, 'the doorway and the stair stay clear: ' + j); }
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
