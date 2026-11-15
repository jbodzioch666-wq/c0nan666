// RS-431: every tier of armour is finer than the one below - it keeps all the finery the lower one had and adds something - in plate,
// hide and robes alike; and a robe's trim band and runes are layers on the skirt that move with it, the mantle at the shoulders shown
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    const KEYS = ['pads','studs','trim','tabard','emblem','spikes','furCollar','robeTrim','robeRunes','mantle'];
    for (const fam of ['metal','hide','cloth']){ const rows = [];
      for (let t=0;t<RS_ARMOUR[fam].tiers.length;t++){ G.gear.chest = rsMakeArmour(fam, t, 'chest'); G.gear.legs = rsMakeArmour(fam, t, 'legs'); rsSync && rsSync();
        const o = rsPlayerLook().o, feats = KEYS.filter(k=>o[k]).map(k=>k + '=' + o[k]);
        let meshes = 0; const e = m3dInstance({}, rsPlayerLook()); e.root.traverse(m=>{ if (m.isMesh && m.visible) meshes++; });
        const sk = e.rig.skirt, layers = sk ? sk.children.filter(c=>c.userData.hemLayer).map(c=>c.name) : [];
        rows.push({ t:RS_ARMOUR[fam].tiers[t][0], feats, meshes, layers }); }
      out[fam] = rows; }
    return out; });
  for (const f in r) for (const x of r[f]) console.log(f, x.t, x.feats.length, x.layers.join(','));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  for (const f in r){ const rows = r[f];
    for (let i=1;i<rows.length;i++){ const a = rows[i-1], b = rows[i], ka = a.feats.map(s=>s.split('=')[0]), kb = b.feats.map(s=>s.split('=')[0]);
      A(ka.every(k=>kb.includes(k)), f + ': ' + b.t + ' keeps everything ' + a.t + ' had (' + ka.join(',') + ' -> ' + kb.join(',') + ')');
      A(kb.length > ka.length || b.feats.join()!==a.feats.join(), f + ': ' + b.t + ' is finer than ' + a.t); } }
  const cl = r.cloth; A(cl[1].layers.includes('trimHem') && cl[2].layers.includes('runeHem') && cl[4].feats.some(s=>s.startsWith('mantle')), 'robes: a trim band, then runes, then a mantle');
};
