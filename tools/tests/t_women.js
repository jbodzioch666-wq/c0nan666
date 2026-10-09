// RS-265: women look like women - a feminine head sculpt (narrower jaw, small chin and nose, fuller lips) with lashes, lip colour
// and fine brows, a fringe of hair, slimmer arms and smaller hands; masculine race traits (square jaw, heavy brow) are left off;
// and about two in five townsfolk are women, without beards
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    const out = {};
    const span = (g, f)=>{ const p = g.attributes.position; let jaw = 0, lipZ = -1; for (let i=0;i<p.count;i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (Math.abs(y - 0.03) < 0.004) jaw = Math.max(jaw, Math.abs(x)); if (Math.abs(x) < 0.004 && y > 0.028 && y < 0.048) lipZ = Math.max(lipZ, z); } return { jaw:+jaw.toFixed(4), lipZ:+lipZ.toFixed(4) }; };
    out.mh = span(m3dHeadGeo('human', false)); out.fh = span(m3dHeadGeo('human', true));
    goToCharCreate(); G.ccLookTouched = false; ccSelectRace(RACES.findIndex(r=>r[0]==='Human')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    for (const sl of ['head','chest','legs','arms','feet','cape']) G.gear[sl] = newItem();
    const build = (fem)=>{ G.player.look.body = fem ? 1 : 0; if (fem) G.player.look.beard = 0; const pt = rsPlayerLook(), e = m3dInstance({}, pt); let tori = 0, boxes = 0, arm = 0;
      e.rig.head.traverse(x=>{ if (x.isMesh && x.geometry.type==='TorusGeometry') tori++; if (x.isMesh && x.geometry.type==='BoxGeometry' && Math.abs(x.position.y - 0.024) < 0.002) boxes++; });
      const up = e.rig.arms[0].sh.children[0]; arm = up.children[0].scale.x;
      return { hipY:+e.rig.hipY.toFixed(3), fem:!!pt.o.fem, squareJawFlag:!!pt.o.squareJaw, tori, jawBox:boxes, arm:+arm.toFixed(2) }; };
    out.f = build(true); out.m = build(false);
    G.villageRace = 'human'; const folk = [0,1,2,3,4,5,6,7,8,9].map(i=>v3RaceDress(v3VillagerLook(i), i).o);
    out.folk = { women:folk.filter(o=>o.fem).length, bearded:folk.filter(o=>o.fem && o.beard).length, hair:folk.filter(o=>o.fem).every(o=>o.hairStyle && o.hair) };
    G.villageRace = 'dwarf'; const df = [0,1,2,3,4].map(i=>v3RaceDress(v3VillagerLook(i), i).o); out.dwarfWomen = df.filter(o=>o.fem && !o.beardStyle).length;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.fh.jaw < r.mh.jaw - 0.003, 'a narrower jaw on a woman');
  A(r.f.fem && r.f.tori >= 2 && r.m.tori===0, 'a woman has lashes; a man does not');
  A(r.f.jawBox===0 && r.m.jawBox===1, 'the human square jaw is left off a woman');
  A(r.f.hipY > r.m.hipY + 0.02, 'longer legs');
  A(r.f.arm < 0.95 && r.m.arm===1, 'slimmer arms');
  A(r.folk.women >= 3 && r.folk.women <= 5 && r.folk.bearded===0 && r.folk.hair, 'about two in five townsfolk are women, beardless, with hair: '+JSON.stringify(r.folk));
  A(r.dwarfWomen >= 1, 'dwarf towns have women too');
  console.log('women ok', JSON.stringify(r));
};
