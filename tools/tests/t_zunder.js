// (art probe, not in ALL) the creator's undressed figures, by race and sex, from three sides
const shotlib = require('./shotlib');
module.exports = async page=>{
  await shotlib.install(page);
  const sets = process.env.ZUNDER ? JSON.parse(process.env.ZUNDER) : [['human_m', 'Human', 0], ['human_f', 'Human', 1], ['dwarf_m', 'Dwarf', 0], ['woodelf_f', 'Wood Elf', 1], ['gnome_m', 'Gnome', 0], ['tiefling_f', 'Tiefling', 1]];
  for (const [nm, race, fem, lk] of sets){
    const urls = await page.evaluate(([race, fem, lk])=>{ if (!window.__inCC){ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); window.__inCC = 1; }
      const L = Object.assign(lookDefault(race), { body:fem }, lk || {}); const pt = rsPlayerLook({ race, look:L, bare:true, undress:true });
      const root = m3dBuilders().get(pt.paint)(pt.o);  root.updateMatrixWorld(true);
      const us = __shot(root, { yaws:[0.3, 1.57, -1.57], w:300, h:520, pitch:0.08 }); const cv = document.createElement('canvas'); cv.width = 900; cv.height = 520; const x = cv.getContext('2d');
      return Promise.all(us.map((u, i)=>new Promise(r=>{ const im = new Image(); im.onload = ()=>{ x.drawImage(im, i*300, 0); r(); }; im.src = u; }))).then(()=>[cv.toDataURL('image/png')]); }, [race, fem, lk]);
    shotlib.save(urls, 'zunder_' + nm);
  }
};
