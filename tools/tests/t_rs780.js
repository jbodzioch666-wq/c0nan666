// RS-780: hobbit feet and the shire's boatyard. A halfling is barefoot even with boots on, on a sculpted foot with toenails and hair, while other races keep their boots.
// In every size of shire the boatyard stands on the pond, away from the gate, its door reached on foot; in other towns it stays by the main street
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: ' + msg); };
  const r = await page.evaluate(async ()=>{ window.__noLock = true; goToCharCreate(); ccSelectRace(RACES.findIndex(r=>r[0]==='Halfling')); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.hp = G.player.maxHp = 99999;
    const out = { towns:{} }, nap = ms=>new Promise(r=>setTimeout(r, ms));
    /* barefoot out of boots, and in them */
    const look = ()=>rsPlayerLook().o; for (const sl of ['head','chest','legs','arms','feet']) G.gear[sl] = newItem(); out.bare = { feet:look().feet, hair:look().footHair, boots:look().boots };
    G.gear.feet = rsMakeArmour('metal', 1, 'feet'); out.booted = { feet:look().feet, hair:look().footHair, boots:look().boots, used:!!G.gear.feet.used };
    m3dInstance({}, rsPlayerLook()); { let sc = 0; M3D.sculpt.forEach((v, k)=>{ if (/^hobbit[LR]\|/.test(k)) sc++; }); let hairV = 0; (M3D.hobHair || new Map()).forEach(g=>{ hairV = g.attributes.position.count; }); const tipX = kind=>{ let g = null; M3D.sculpt.forEach((v, k)=>{ if (k.startsWith(kind + '|')) g = v; }); const P = g.attributes.position; let z = -9, x = 0; for (let i=0;i<P.count;i++) if (P.getZ(i) > z){ z = P.getZ(i); x = P.getX(i); } return x; }; out.bigToe = { atPlus:tipX('hobbitL'), atMinus:tipX('hobbitR') }; out.parts = { foot:sc, hair:(M3D.hobHair || new Map()).size, verts:hairV }; }
    /* other races keep their boots */
    { const k = G.player.race; G.player.race = 'Human'; out.human = { feet:look().feet, boots:!!look().boots }; G.player.race = k; }
    /* each size of town */
    const ti = townInfo, t = townList().find(t=>(townFlavorAt(t.x, t.y)||{}).race==='halfling'); for (const tier of [0, 1, 2]){ townInfo = ()=>Object.assign({}, ti(), { tier }); G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await nap(1500);
      const b = VILLAGE_BUILDINGS.find(b=>b.key==='boatyard'), o = doorOut(b), P = shirePond(), seen = new Set([G.player.x + ',' + G.player.y]), q = [[G.player.x, G.player.y]]; while (q.length){ const [x, y] = q.pop(); for (const [a, c] of DIR8){ const nx = x + a, ny = y + c, k = nx + ',' + ny; if (seen.has(k) || !v3Walkable(nx, ny) || !diagClear(x, y, a, c, v3Walkable)) continue; seen.add(k); q.push([nx, ny]); } }
      let lane = 0; for (let a=-1;a<=1;a+=0.25) for (let c=-1;c<=1;c+=0.25) lane = Math.max(lane, V3.shire.mask.at(o.x + 0.5 + a, o.y + 0.5 + c));
      const blocked = VILLAGE_BUILDINGS.filter(b=>!seen.has(doorOut(b).x + ',' + doorOut(b).y)).map(b=>b.key), gx = TOWN_CX, gy = ROWS - 1;
      out.towns[tier] = { race:G.villageRace, gateD:Math.hypot(o.x - gx, o.y - gy), pond:!!P, pondD:P ? Math.hypot(o.x - P.x1, o.y - P.cz) : 99, water:!!V3.world.getObjectByName('shirePond'), walk:seen.has(o.x + ',' + o.y), lane:+lane.toFixed(2), blocked }; }
    townInfo = ti;
    /* a human town keeps its boatyard where it was */
    { const h = townList().find(t=>{ const f = townFlavorAt(t.x, t.y)||{}; return f.race && f.race!=='halfling'; }); G.owPos = { x:h.x, y:h.y }; enterVillage(); setUi('playing'); await nap(1000); const b = VILLAGE_BUILDINGS.find(b=>b.key==='boatyard'); out.other = { race:G.villageRace, w:b.w, h:b.h, pond:!!shirePond() }; }
    return out; });
  console.log('rs780', JSON.stringify(r));
  A(r.bare.feet==='bare' && r.bare.hair && !r.bare.boots, 'bare hairy feet out of boots: ' + JSON.stringify(r.bare));
  A(r.booted.feet==='bare' && r.booted.hair && !r.booted.boots, 'and in boots: ' + JSON.stringify(r.booted));
  A(r.parts.foot===2 && r.parts.hair===2 && r.parts.verts > 8000, 'two sculpted feet with real hair: ' + JSON.stringify(r.parts));
  A(r.bigToe.atPlus < 0 && r.bigToe.atMinus > 0, 'the big toe on the inside of each foot: ' + JSON.stringify(r.bigToe));
  A(r.human.boots, 'other races keep their boots: ' + JSON.stringify(r.human));
  for (const k of [0, 1, 2]){ const t = r.towns[k]; A(t.race==='halfling', 'tier ' + k + ' is a shire'); A(t.gateD > 8, 'tier ' + k + ' boatyard away from the gate: ' + t.gateD); A(t.pond && t.water && t.pondD < 3.5, 'tier ' + k + ' on the pond: ' + JSON.stringify(t)); A(t.walk && t.lane > 0.4, 'tier ' + k + ' reached by a lane: ' + JSON.stringify(t)); A(!t.blocked.length, 'tier ' + k + ' every door reached: ' + t.blocked); }
  A(r.other.race!=='halfling' && r.other.w===2 && r.other.h===4 && !r.other.pond, 'other towns unchanged: ' + JSON.stringify(r.other));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
};
