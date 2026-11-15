// RS-860: the town's buildings and gate made properly - squared, braced gate towers with a parapet of boards and a hipped roof whose
// shingles run along the eaves (it was a four-sided cone, its rows stepping round it), a boarded gate under an iron-strapped lintel;
// houses with turned timbers, framed windows with sills, lintels and board shutters, a dressed-stone door surround and steps, a lantern
// in an iron cage, barge boards, fascias and a rounded ridge on the roofs; casks and crates. Shots: shots/rs860-gate.png, rs860-house.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, m, d)=>{ if (!c) throw new Error(m + ' :: ' + JSON.stringify(d)); };
  const r = await page.evaluate(async ()=>{ const w = ms=>new Promise(r=>setTimeout(r, ms)), out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.clock = Math.round(0.42*DAY_LENGTH) + 3*DAY_LENGTH;
    const t = townList().find(t=>townInfo(t.x, t.y).race==='human' && !(townInfo(t.x, t.y).style||{}).walled) || townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); townClosedCheck = ()=>false;
    for (let i=0;i<20;i++){ renderGame(); await w(25); }
    /* the gate, built on its own */ const T = THREE, mats = V3.mats, g1 = new T.Group(); v3Palisade(mats, g1);
    let cone = 0, hip = 0, rb = 0; g1.traverse(o=>{ if (!o.isMesh) return; if (o.geometry.type==='ConeGeometry' && o.material===mats.roof) cone++; if (o.material===mats.roof && o.geometry.type==='BufferGeometry') hip++; if (Object.values(V3_RB).includes(o.geometry)) rb++; });
    out.gate = { cone, hip, rb, walled:!!(G.townLy && G.townLy.info.style.walled), race:G.villageRace };
    /* a house, built on its own */ const b = VILLAGE_BUILDINGS.find(b=>b.door) || VILLAGE_BUILDINGS[0], g2 = new T.Group(), keep = V3.windows; V3.windows = []; v3Building(b, mats, g2, { face:b.face, door:b.door, floors:b.floors, sign:null }); const glass = V3.windows.length; V3.windows = keep;
    const sb = v3RBoxGeo(0.085, 0.48, 0.03, 0.01); let shut = 0, rbH = 0, plainWood = 0; g2.traverse(o=>{ if (!o.isMesh) return; if (o.geometry===sb) shut++; if (Object.values(V3_RB).includes(o.geometry)) rbH++; else if (o.geometry.type==='BoxGeometry' && o.material===mats.wood) plainWood++; });
    out.house = { glass, shut, rbH, plainWood };
    /* a cask and a crate */ const g3 = new T.Group(); v3Barrel(0, 0, mats, g3); v3Crate(1, 0, mats, g3); let lathe = 0, hoops = 0; g3.traverse(o=>{ if (o.isMesh && o.geometry.type==='LatheGeometry') lathe++; if (o.isMesh && o.geometry.type==='TorusGeometry') hoops++; }); out.props = { lathe, hoops, n:g3.children.length };
    G.player.x = TOWN_CX; G.player.y = ROWS - 6; V3.dist = 11; for (let i=0;i<30;i++){ renderGame(); await w(25); }
    return out; });
  await page.screenshot({ path: SHOTS + '/rs860-gate.png' });
  await page.evaluate(async ()=>{ const b = VILLAGE_BUILDINGS.find(b=>b.door) || VILLAGE_BUILDINGS[0]; G.player.x = b.door.x; G.player.y = b.door.y + 2; V3.dist = 7; for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 25)); } });
  await page.screenshot({ path: SHOTS + '/rs860-house.png' }); console.log(JSON.stringify(r)); A(errs.length===0, errs.join('|'));
  if (!r.gate.walled) A(r.gate.cone===0 && r.gate.hip >= 2 && r.gate.rb > 80, 'the gate towers', r.gate);
  A(r.house.glass >= 2 && r.house.shut >= 4*r.house.glass - 4 && r.house.rbH > 40 && r.house.plainWood===0, 'the house', r.house);
  A(r.props.lathe===1 && r.props.hoops===4, 'the cask', r.props); };
