// RS-758: the Lost City's entrance (o3LostCityGate, in the Guardians' Gate's footprint and way in): a temple-pyramid of mossy jungle stone,
// a sun on the portal's lintel that wakes gold, two serpents' heads whose eyes kindle, a shrine and roof comb on top, vines and leaves on it.
// Generator 27: a Lost City with no jungle to stand in takes land a jungle can grow on (owJungleRoom) - never desert or snow round it
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); const out = { cities:[] };
    for (let sd=1; sd<=6; sd++){ wgRegenerate(sd*7919); const m = G.ow.map; out.gen = G.ow.genVer;
      for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++){ if (m[x][y]!==OW_TEMPLE || owSeaSite(x, y)) continue; let bad = 0, j = 0, n = 0;
        for (let dx=-2;dx<=2;dx++) for (let dy=-2;dy<=2;dy++){ if (dx*dx + dy*dy > 5) continue; const q = owNbG(x, y, dx, dy); if (!q) continue; const t = m[q[0]][q[1]]; n++; if (t===OW_DESERT || t===OW_TUNDRA) bad++; if (wgBioAt(q[0], q[1])===2) j++; }
        out.cities.push({ sd, bad, jung:+(j/n).toFixed(2) }); } }
    /* the entrance in 3D */
    wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; weatherSync = ()=>{}; G.player.wildWarned = 1; G.gameMode = 0; G.player.clock = DAY_LENGTH*0.45;
    const m = G.ow.map; let c = null; for (let x=0;x<OW_COLS && !c;x++) for (let y=0;y<OW_ROWS;y++) if (m[x][y]===OW_TEMPLE && !owSeaSite(x, y)){ c = { x, y }; break; }
    G.owPos = { x:c.x, y:c.y + 3 }; owReveal(c.x, c.y, 8); await fr(150);
    const C = o3C(c.x, c.y), g = O3.doors && O3.doors.get(Math.floor(C[0]) + ',' + Math.floor(C[1])); if (!g || !g.doorWay) return Object.assign(out, { nog:true });
    const P = g.doorWay.parts, S = g.scale.x, box = new THREE.Box3().setFromObject(g);
    out.h = +((box.max.y - box.min.y)).toFixed(2);
    out.gold = P.sig.emissive.r > 0.8 && P.sig.emissive.g > 0.5 && P.sig.emissive.b < 0.5; out.kin = P.kin.length;
    g.doorWay.anim(1.5, 0); out.wake = { sig:+P.sig.emissiveIntensity.toFixed(2), eyes:P.kin.filter(e=>e.visible).length }; g.doorWay.anim(0, 0); out.sleep = P.sig.emissiveIntensity < 0.1 && P.kin.every(e=>!e.visible);
    let leaf = 0, vine = 0, black = 0; g.traverse(o=>{ if (!o.isMesh) return; if (o.material && o.material.vertexColors && !o.geometry.attributes.color) black++; if (o.material===O3.mats?.cityLeaf) leaf++; if (o.material===O3.mats?.cityVine) vine++; });
    const mats = []; g.traverse(o=>{ if (o.isMesh && o.material && !mats.includes(o.material)) mats.push(o.material); });
    out.leafy = mats.some(mt=>mt.flatShading && mt.color && mt.color.g > mt.color.r*1.5); out.black = black;
    out.jungleStone = mats.some(mt=>mt.vertexColors && mt.map && mt.color.g > mt.color.b*1.15);
    return out; });
  console.log(JSON.stringify(r));
  A(r.gen >= 27, 'generator 27: ' + r.gen);
  A(r.cities.length >= 5 && r.cities.every(c=>c.bad===0 && c.jung >= 0.9), 'every Lost City in its jungle, no desert or snow round it: ' + JSON.stringify(r.cities));
  A(!r.nog, 'its entrance is built');
  A(r.h > 2.6, 'a pyramid, tall: ' + r.h);
  A(r.gold && r.kin===4, 'a sun of gold, two serpents\' eyes each');
  A(r.wake.sig > 1.5 && r.wake.eyes===4 && r.sleep, 'they wake as you come and sleep again: ' + JSON.stringify(r.wake));
  A(r.leafy && r.jungleStone && r.black===0, 'mossy green stone, leaves on it, every stone coloured');
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
