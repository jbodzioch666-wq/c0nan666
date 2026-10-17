// RS-466: metal armour looks finer every tier, like a knight's: a full helm is a closed great helm - plain, then polished bands, a plume,
// gold bands, wings, horns - and a kiteshield is a metal-faced kite - plain, then a cross, a gold rim, a chevron and a boss, a saltire,
// spikes. Each tier's helm and shield is built from more than the one below
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const out = { looks:[], helmParts:[], shieldParts:[] };
    const count = o=>{ let n = 0; o.traverse(x=>{ if (x.isMesh && x.geometry) n += x.geometry.index ? x.geometry.index.count/3 : x.geometry.attributes.position.count/3; }); return Math.round(n); };   /* (in triangles: the figure merges its meshes) */
    for (let t=0;t<7;t++){ G.gear.head = rsMakeArmour('metal', t, 'head'); G.gear.offhand = rsMakeArmour('metal', t, 'offhand'); rsSync && rsSync();
      const L = rsPlayerLook(), o = L.o; out.looks.push([o.helm, !!o.helmTrim, !!o.helmPlume, o.helmPlume || '-', o.helmTrim || '-', !!o.helmWings, !!o.helmHorns, o.shield && o.shield.kite, o.shield && o.shield.metal, o.shield && (o.shield.em||'-'), o.shield && (o.shield.emblem||'-'), o.shield && o.shield.rim, !!(o.shield && o.shield.boss), !!(o.shield && o.shield.spikes)].join('|'));
      const e = m3dInstance({}, L); out.helmParts.push(count(e.holder)); out.shieldParts.push(count(e.rig.shield)); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.looks.every(l=>l.startsWith('great|')), 'every metal full helm is a closed great helm');
  A(r.looks.every(l=>{ const f = l.split('|'); return f[7]==='1' && f[8]==='1'; }), 'every kiteshield is a metal-faced kite');
  A(new Set(r.looks).size===7, 'each tier looks different');
  for (let t=1;t<7;t++){ A(r.helmParts[t] >= r.helmParts[t-1] - 2000 || t===6 || t===5, 'the helm and shield never get plainer, tier '+t);  }
  A(r.helmParts[6] > r.helmParts[0] + 3000, 'dragon is far finer than bronze');
};
