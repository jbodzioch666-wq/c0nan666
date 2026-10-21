// RS-606: the robe's cloth over the shoulders to the neck, and the shoulders and sleeves in the same cloth - its weave laid as theirs
// (a second set of uvs, flat across each face, seven to the unit) and its shade their sculpt's own; the top slopes in to the neck
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 200)));
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    G.gear.chest = rsMakeArmour('cloth', 4, 'chest'); G.gear.chest.dye = '#e4ddcc'; G.player.look.body = 1;
    const e = m3dInstance({}, rsPlayerLook()), rig = e.rig, sk = rig.skirt, m = sk.material, out = {};
    out.top = sk.userData.extTop; out.uv1 = !!sk.geometry.attributes.uv1; out.tri = !!sk.geometry.attributes.aTri && !!rig.chestMesh.geometry.attributes.aTri; out.triKey = m.customProgramCacheKey ? m.customProgramCacheKey() : ''; out.ch = m.map ? m.map.channel : null; out.rep = m.map ? [m.map.repeat.x, m.map.repeat.y] : null;
    out.bodice = rig.chestMesh.material===m; let sl = 0, slSame = 0; for (const A of rig.arms) A.sh.traverse(o=>{ if (o.isMesh && o.geometry.attributes.uv1){ sl++; if (o.material===m) slSame++; } }); out.sleeves = [sl, slSame];
    /* the top of the cloth: in to the neck, no shelf out at the shoulders' breadth */
    { const q = sk.geometry.attributes.position; let maxR = 0; for (let i=0;i<q.count;i++){ const Y = q.getY(i) + sk.position.y; if (Y > out.top - 0.004) maxR = Math.max(maxR, Math.hypot(q.getX(i)*sk.scale.x, q.getZ(i)*sk.scale.z)); } out.topR = +maxR.toFixed(3); }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.tri && /m3dtri/.test(r.triKey), 'RS-607: the weave blended three ways from one frame across the robe and its bodice - no panels: ' + r.triKey);
  A(r.top > 0.3, 'the cloth over the shoulders to the neck: ' + r.top);
  A(r.uv1 && r.ch===1 && r.rep && r.rep[0]===1, 'its weave laid as the body\'s, flat across each face');
  A(r.bodice, 'the shoulders above the cloth in the same cloth (the sleeves too, merged into the figure after)');
  A(r.topR < 0.075, 'its top in to the neck, no shelf: ' + r.topR);
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
