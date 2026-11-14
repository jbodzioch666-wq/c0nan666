// RS-891: the open land's wild flowers are plants - a curving stalk with two leaves and a five-petalled head (tinted per flower, a gold eye)
// on top, each turned and sized its own way - not little balls floating over the grass. Two instanced meshes (heads, stalks) share each
// flower's place. Shot: shots/rs891-flowers.jpg (close, through a camera in the meadow)
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true;
    if (isWinter()) G.player.clock = 0;
    const m = G.ow.map; let f = null; for (let dd=1; dd<70 && !f; dd++) for (let xx=G.owPos.x - dd; xx<=G.owPos.x + dd && !f; xx++) for (const yy of [G.owPos.y - dd, G.owPos.y + dd]){ let g = 0; for (let a=-2;a<=2;a++) for (let b=-2;b<=2;b++){ const q = owNb(xx, yy, a, b); if (q && m[q[0]][q[1]]===OW_GRASS) g++; } if (g >= 22){ f = [xx, yy]; break; } }
    if (f){ G.owPos = { x:f[0], y:f[1] }; owReveal(f[0], f[1], 8); O3.ppos = null; } await fr(160);
    const WF = o3WildFlowerGeo(T), heads = [], stalks = [], balls = []; O3.scene.traverse(o=>{ if (!o.isInstancedMesh) return; if (o.geometry===WF.head) heads.push(o); if (o.geometry===WF.stalk) stalks.push(o); if (o.geometry.type==='IcosahedronGeometry' && Math.abs((o.geometry.parameters||{}).radius - 0.035) < 1e-6) balls.push(o); });
    out.winter = isWinter(); out.heads = heads.length; out.stalks = stalks.length; out.balls = balls.length; out.n = heads.reduce((s, o)=>s + o.count, 0);
    const hc = WF.head.attributes.color, cols = new Set(); for (let i=0;i<hc.count;i++) cols.add([hc.getX(i), hc.getY(i), hc.getZ(i)].map(v=>v.toFixed(2)).join(',')); out.headCols = [...cols];
    out.together = heads.length && stalks.length ? (()=>{ const a = new T.Matrix4(), b = new T.Matrix4(); let ok = heads[0].count===stalks[0].count; for (let i=0;i<heads[0].count && ok;i++){ heads[0].getMatrixAt(i, a); stalks[0].getMatrixAt(i, b); ok = a.equals(b); } return ok; })() : false;
    const bb = new T.Box3().setFromBufferAttribute(WF.head.attributes.position), sb = new T.Box3().setFromBufferAttribute(WF.stalk.attributes.position); out.headY = [+bb.min.y.toFixed(3), +bb.max.y.toFixed(3)]; out.stalkTop = +sb.max.y.toFixed(3);
    if (heads.length && heads[0].count){ const mm = new T.Matrix4(), p = new T.Vector3(); heads[0].getMatrixAt(0, mm); p.setFromMatrixPosition(mm); const c2 = new T.PerspectiveCamera(40, O3.cam.aspect, 0.02, 60); c2.position.set(p.x + 0.42, p.y + 0.3, p.z + 0.42); c2.lookAt(p.x, p.y + 0.1, p.z); O3.renderer.render(O3.scene, c2); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.9); }
    return out; });
  if (r.shot){ fs.writeFileSync(path.join(__dirname, 'shots', 'rs891-flowers.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot; }
  console.log(JSON.stringify(r));
  A(!r.balls, 'no ball flowers left', r);
  if (!r.winter){ A(r.heads >= 1 && r.stalks===r.heads && r.n > 10, 'the meadow has its flowers, a head and a stalk each', r); A(r.together, 'each head stands on its own stalk', r); }
  A(r.headCols.length===2 && r.headCols.includes('1.00,1.00,1.00'), 'white petals the instance tints, and a gold eye', r);
  A(r.headY[0] > 0.1 && Math.abs(r.stalkTop - 0.132) < 0.03, 'the head sits on top of its stalk', r);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
