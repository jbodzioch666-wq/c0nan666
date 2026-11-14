// RS-469: tower shields - a tall, curved metal shield in every metal, forged from four bars or found as loot: half as much defence
// again as the kiteshield of its metal, but heavy and in the way, so your aim with a blade, a bow or a spell is worse
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const T = THREE, out = { tiers:[] };
    for (let t=0;t<7;t++){ const k = rsMakeArmour('metal', t, 'offhand'), w = rsMakeArmour('metal', t, 'tower'); out.tiers.push({ nm:w.nm, slot:w.slot, ac:[k.ac, w.ac], acc:[k.acc||0, w.acc], rng:[k.rngAcc||0, w.rngAcc], mag:[k.magAcc||0, w.magAcc] }); }
    out.forge = !!SK_FORGE.tower; skAdd('ironb', 4); skGainXP('smithing', 1e6); G.ui = 'bench'; const n0 = G.inv.length; skForge('ironb', 'tower'); const made = G.inv[G.inv.length - 1]; out.forged = G.inv.length > n0 ? made.nm : null; out.barsLeft = skHave('ironb');
    let towers = 0, kites = 0; for (let i=0;i<400;i++){ const it = rsMakeOffhand(60); if (it.basis==='Tower Shield') towers++; else if (it.basis==='Kiteshield') kites++; } out.loot = { towers, kites };
    const box = it=>{ G.gear.offhand = it; rsSync && rsSync(); const L = rsPlayerLook(), e = m3dInstance({}, L); e.holder.updateMatrixWorld(true); const sh = e.rig.shield, inv = new T.Matrix4().copy(sh.matrixWorld).invert(), b = new T.Box3(), v = new T.Vector3();
      sh.traverse(o=>{ if (!o.isMesh) return; const p = o.geometry.attributes.position; for (let i=0;i<p.count;i+=3){ v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv); b.expandByPoint(v); } }); return { tall:+(b.max.z - b.min.z).toFixed(3), wide:+(b.max.x - b.min.x).toFixed(3), tower:!!L.o.shield.tower }; };
    out.kiteBox = box(rsMakeArmour('metal', 3, 'offhand')); out.towerBox = box(rsMakeArmour('metal', 3, 'tower'));
    setUi('playing'); return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const t of r.tiers){ A(/Tower Shield$/.test(t.nm) && t.slot==='offhand', 'a tower shield in every metal, worn in the off hand');
    A(t.ac[1] >= t.ac[0]*1.4, t.nm+': much more defence'); A(t.acc[1] < t.acc[0] && t.rng[1] < t.rng[0] && t.mag[1] < t.mag[0], t.nm+': worse aim'); }
  A(r.forge && /Iron Tower Shield$/.test(r.forged||'') && r.barsLeft <= 1, 'forged at the anvil from four bars');
  A(r.loot.towers > 20 && r.loot.kites > r.loot.towers, 'found as loot now and then');
  A(r.towerBox.tower && !r.kiteBox.tower && r.towerBox.tall > r.kiteBox.tall + 0.06, 'it looks like a tall tower shield');
};
