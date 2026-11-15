// (probe, not in ALL) a robe's cord: where the cloth starts above the hips, its top, and the cord's height, on a woman and a man; and the waist's girth by height
module.exports = async page=>{
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async ()=>{ goToCharCreate(); G.chosenKit = 2; ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); const out = {};
    for (const body of [1, 0]){ const L = rsPlayerLook({ look:Object.assign(lookDefault('Human'), { body }) }), e = m3dInstance({}, L), sk = e.rig.skirt;
      out[body ? 'fem' : 'male'] = { extFrom:sk && sk.userData.extFrom, top:sk && sk.userData.extTop, cord:e.rig.robeWaistY, hipSeam:e.rig.hips && e.rig.hips.position.y, torsoY:e.rig.torso.position.y }; }
    return out; });
  console.log(JSON.stringify(r));
};
