// RS-246: the dwarf after Bakshi's - short and immensely broad on short thick legs, a big nose and heavy brow, and a great
// beard to the belt with gold-bound braids; a clean-shaven dwarf has no great beard; the dwarven townsfolk look the same
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const mk = nm=>{ goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]===nm)); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){} };
    const build = ()=>{ const pt = rsPlayerLook(), e = m3dInstance({}, pt), [R] = e.rig.arms; return { o:pt.o, hipY:e.rig.hipY, shX:Math.abs(R.sh.position.x) }; };
    mk('Human'); const hu = build();
    mk('Dwarf'); const dw = build(); out.dw = { beard:dw.o.greatBeard, nose:dw.o.bigNose, brow:dw.o.heavyBrow, buckle:dw.o.buckle, broad:dw.o.broad, head:dw.o.headScale, hipY:dw.hipY, shX:dw.shX }; out.hu = { hipY:hu.hipY, shX:hu.shX };
    // RS-247: a full beard and the long braid are different beards
    const beardSig = st=>{ G.player.look = Object.assign({}, lookOf(G.player), { beard:st }); const pt = rsPlayerLook(), e = m3dInstance({}, pt); let n = 0, rings = 0; e.rig.head.traverse(x=>{ if (x.isMesh){ n++; if (x.geometry && x.geometry.type==='TorusGeometry') rings++; } }); return [n, rings]; };
    out.full = beardSig(3); out.braid = beardSig(4);
    G.player.look = Object.assign({}, lookOf(G.player), { beard:0 }); out.shaven = !!rsPlayerLook().o.greatBeard;
    const f = v3RaceDress(v3VillagerLook(1), 1); G.villageRace = 'dwarf'; const f2 = v3RaceDress(v3VillagerLook(1), 1); out.folk = { beard:!!f2.o.greatBeard, broad:f2.o.broad, nose:!!f2.o.bigNose };
    return out; });
  // RS-247: the figure previews hold still until you drag them
  const spin = await page.evaluate(async ()=>{ const wait = ms=>new Promise(r=>setTimeout(r, ms)); goToCharCreate(); renderOverlay(); await wait(500); LP.hold = 0; const y0 = LP.yaw; await wait(3500); return [y0, LP.yaw]; });
  r.spin = spin;
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.dw.beard && r.dw.nose && r.dw.brow && r.dw.buckle && r.dw.broad > 1.1 && r.dw.head >= 1.14, 'the dwarf look');
  A(r.dw.hipY < r.hu.hipY && r.dw.shX > r.hu.shX, 'short legs, wide shoulders: '+JSON.stringify([r.dw, r.hu]));
  A(!r.shaven, 'a clean-shaven dwarf has no great beard');
  A(r.braid[1] - r.full[1]===3 && r.full[0]!==r.braid[0], 'a full beard and the long braid differ: the braid has its gold rings (RS-247): '+JSON.stringify([r.full, r.braid]));
  A(r.spin[0]===r.spin[1], 'the preview does not turn by itself: '+JSON.stringify(r.spin));
  A(r.folk.beard && r.folk.broad > 1.1 && r.folk.nose, 'the dwarven townsfolk look the same');
  console.log('dwarf ok');
};
