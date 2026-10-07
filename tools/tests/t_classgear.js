// RS-200: monsters look like their trade. Every rank of the goblins, orcs and kobolds has its own figure (archers with bows, shamans
// with staves and robes, warriors in mail with a shield, warlords in plate), and every skeleton is the sculpted 3D skeleton dressed
// for its class - archers with a bow and quiver, mages hooded and robed with a staff, warriors helmed, champions armoured and caped.
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, out = {};
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const want = { archer:'bow', shaman:'staff', warrior:null, warlord:'greataxe', chieftain:'axe' };
    for (const fam of ['goblin','orc','kobold']) for (const [nm] of MON_FAMILIES[fam].t){
      const rank = nm.split(' ')[1]; if (!rank || rank==='miner') continue;
      A(MONSTER_PORTRAITS[nm], nm+' has its own figure'); const o = MONSTER_PORTRAITS[nm].o;
      A(o.head===fam, nm+' keeps its own head, not a human one: '+o.head);
      if (want[rank]) A(o.weapon===want[rank], nm+' carries a '+want[rank]+', not '+o.weapon);
      if (rank==='archer' || rank==='shaman') A(!o.shield, nm+' has no shield');
      if (rank==='warrior') A(o.shield && /chain|plate/.test(o.outfit), nm+' wears mail and a shield'); }
    // skeletons: all of them get the sculpted model, each with its own kit
    for (const [nm, cls] of [['skeleton','plain'],['skeleton warrior','warrior'],['skeleton archer','archer'],['skeleton mage','mage'],['skeleton champion','champion'],['skeletal knight','warrior'],['risen skeleton','plain']]){
      A(sk3Wanted({ nm }), nm+' is the sculpted skeleton'); A(sk3Class(nm)===cls, nm+' dresses as '+cls+', not '+sk3Class(nm)); }
    // and the kits really go on: build an archer and a mage and look at them
    for (let i=0;i<120 && !sk3Init();i++) await new Promise(r=>setTimeout(r, 150));
    A(SK3.ok, 'the sculpted skeleton builds');
    const vis = (e, o)=>{ let v = true; for (let p=o; p && p!==e.holder; p=p.parent) if (!p.visible) v = false; return v; };
    const arch = sk3Instance({ nm:'skeleton archer' }), mage = sk3Instance({ nm:'skeleton mage' }), plain = sk3Instance({ nm:'skeleton' });
    const count = e=>{ let n = 0; e.holder.traverse(o=>{ if (o.isMesh) n++; }); return n; };
    out.meshes = [count(plain), count(arch), count(mage)]; A(out.meshes[1] > out.meshes[0] && out.meshes[2] > out.meshes[0], 'kits add pieces: '+out.meshes);
    const torus = e=>{ let bow = false; e.holder.traverse(o=>{ if (o.isMesh && o.geometry.type==='TorusGeometry' && o.geometry.parameters.radius===0.6 && vis(e, o)) bow = true; }); return bow; };
    A(torus(arch) && !torus(plain), 'the archer holds a bow');
    A(arch.cls==='archer' && mage.cls==='mage' && plain.cls==='plain', 'classes recorded');
    // (RS-201) the bow and the staff ride on pivots kept upright in the hand; blades are turned edge-on in a humanoid's fist
    A(arch.rig.ups && arch.rig.ups.length===1 && mage.rig.ups && mage.rig.ups.length===1 && M3D_UPS.has(arch.rig.ups[0]), 'bow and staff on upright pivots');
    const orc = m3dInstance({ nm:'orc archer' }, monsterPortraitFor('orc archer')), sham = m3dInstance({ nm:'goblin shaman' }, monsterPortraitFor('goblin shaman')), war = m3dInstance({ nm:'hobgoblin' }, monsterPortraitFor('hobgoblin'));   /* (a sword; a one-handed axe is turned the other way, RS-204) */
    A(orc.rig.ups && orc.rig.ups.length===1 && sham.rig.ups && sham.rig.ups.length===1, 'humanoid bows and staves upright too');
    A(war.rig.weapon && Math.abs(war.rig.weapon.rotation.y - Math.PI/2) < 1e-6 && !war.rig.ups, 'a blade is turned edge-on');
    // render once and check the bow really stands up: its pivot's world up matches the model's
    const T = THREE, sc = new T.Scene(); sc.add(orc.holder); orc.holder.rotation.y = 1.1; orc.rig.arms[0].sh.rotation.x = -1.2;
    const rr = new T.WebGLRenderer({ canvas:document.createElement('canvas') }); rr.setSize(64, 64); rr.render(sc, new T.PerspectiveCamera());
    const up = new T.Vector3(0, 1, 0).applyQuaternion(orc.rig.ups[0].getWorldQuaternion(new T.Quaternion())); out.bowUp = +up.y.toFixed(3);
    A(up.y > 0.999, 'the bow stands upright: '+up.y); rr.dispose();
    return out;
  });
  console.log(JSON.stringify(r));
};
