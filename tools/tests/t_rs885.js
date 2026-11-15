// RS-885: the towns on the open land remade for every people (o3TownBuild). Each builds without error at every size, its fixed parts merged
// by material (a handful of draws, not hundreds), no stray point; the timbered houses carry their beams, doors and lit windows (the panes
// their own, for the night), towers their roofs and finials, walls their merlons; the dwarves' hill is a craggy, shaded mountain; the wood
// elves' great tree and the town trees are grown (leaf cards); every tree's leaves and the hill stay unmerged. Shot: shots/rs885-town.jpg
const path = require('path'), fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg, r)=>{ if (!c) throw new Error('assert: ' + msg + ' ' + JSON.stringify(r || {})); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); }), T = THREE, out = { t:{} };
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.4; window.__trans = true; await fr(60);
    const mats = o3Mats(); let keep = null;
    for (const race of ['human', 'halfelf', 'elf', 'dwarf', 'woodelf', 'orc', 'gnome', 'dragon', 'tiefling']) for (const tier of [0, 1, 2]){
      const g = new T.Group(), rnd = k=>{ const v = Math.sin(k*127.1 + tier*311.7)*43758.5453; return v - Math.floor(v); }, flame = (x, y, z)=>{ const f = o3Glow('rgba(255,170,60,1)', 0.28); f.position.set(x, y, z); g.add(f); }, w0 = O3.windows.length;
      o3TownBuild(g, race, tier, mats, rnd, flame, 0, 0); const o = out.t[race + tier] = { meshes:0, bad:0, panes:O3.windows.length - w0, beam:0, leafy:0, hill:0, liveLeft:0 };
      g.traverse(m=>{ if (!m.isMesh) return; o.meshes++; const a = m.geometry.attributes.position.array; for (const v of a) if (!isFinite(v)) o.bad++; if (m.material===mats.beam) o.beam++; if (m.material.userData && m.material.userData.cards) o.leafy++; if (m.geometry===mats.dwarfHill && m.geometry.attributes.color) o.hill++; });
      if (race==='human' && tier===2) keep = g; }
    const sc = new T.Scene(); sc.background = new T.Color(0x9ab4cc); sc.add(new T.HemisphereLight(0xe8f0ff, 0x4a4030, 1.0)); const d = new T.DirectionalLight(0xfff0d8, 2.4); d.position.set(3, 5, 3); sc.add(d); keep.scale.setScalar(1.5); sc.add(keep);
    const cam = new T.PerspectiveCamera(36, O3.cam.aspect, 0.05, 50); cam.position.set(0.9, 1.9, 2.4); cam.lookAt(0, 0.25, 0); O3.renderer.render(sc, cam); out.shot = O3.renderer.domElement.toDataURL('image/jpeg', 0.85); return out; });
  fs.writeFileSync(path.join(__dirname, 'shots', 'rs885-town.jpg'), Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot;
  console.log(JSON.stringify(r));
  for (const [k, o] of Object.entries(r.t)){ A(o.bad===0, k + ': no stray point', o); A(o.meshes < 90, k + ': its fixed parts merged', o); }
  for (const k of ['human2', 'halfelf2', 'human0']) A(r.t[k].beam===1 && r.t[k].panes >= 6, k + ': timbered houses (their beams merged in one) with lit windows', r.t[k]);
  for (const k of ['dwarf0', 'dwarf2']) A(r.t[k].hill===1, k + ': the dwarves\' craggy, shaded hill', r.t[k]);
  for (const k of ['woodelf0', 'woodelf2', 'elf2', 'halfelf1']) A(r.t[k].leafy >= 2, k + ': grown trees with leaf cards', r.t[k]);
  for (const k of ['gnome2', 'dragon2', 'elf2', 'woodelf2']) A(r.t[k].panes >= 3, k + ': lit windows', r.t[k]);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
