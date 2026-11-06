// (art probe, not in ALL) plate on builds from slight to heavy, full figure from three sides
const shotlib = require('./shotlib');
module.exports = async page=>{
  await shotlib.install(page);
  const sets = process.env.ZPLATE ? JSON.parse(process.env.ZPLATE) : [['slight', { frame:0, fat:0, muscle:0.1 }], ['mid', {}], ['heavy', { frame:1, fat:0.9, muscle:0.8 }], ['fslight', { frame:0, fat:0, muscle:0.1 }, 1]];
  for (const [nm, bd, fem, outfit, pads, race, cape] of sets){ await page.evaluate(c=>{ window.__cape = c ? c.col : null; window.__helm = c ? c.helm : null; window.__hood = c ? c.hood : null; }, cape || null);
    const urls = await page.evaluate(([bd, fem, outfit, pads, process_pose, race])=>{ race = race || 'Human'; if (!window.__inCC){ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); window.__inCC = 1; }
      const L = Object.assign(lookDefault(race), { body:fem ? 1 : 0, beard:0 }); L.bd = Object.assign(lookBodyDefault(L), bd); const pt = rsPlayerLook({ race, look:L, bare:true }); pt.o.outfit = outfit || 'plate'; if (!outfit || outfit==='plate'){ pt.o.legWear = 'plate'; pt.o.legCol = '#8a9098'; } if (pads) pt.o.pads = pads; if (outfit==='leather') pt.o.cloth = '#6a4a2a'; if (outfit==='robe'){ pt.o.cloth = '#3040a0'; pt.o.legWear = null; } pt.o.cape = window.__cape || null; pt.o.helm = window.__helm || null; if (window.__hood) pt.o.hoodDown = window.__cape;
      const root = m3dBuilders().get(pt.paint)(pt.o); if (process_pose) try{ const rg = M3D.meta.get(root).rig; m3dPoseHumanoid(rg, 1, 0, 0, 0, 0, null); rg.arms[0].sh.rotation.x = 0; rg.arms[0].el.rotation.x = -0.2; }catch(e){} root.updateMatrixWorld(true);
      const us = __shot(root, { yaws:[0.4, 1.57, 2.8], w:300, h:520, pitch:0.08 }); const cv = document.createElement('canvas'); cv.width = 900; cv.height = 520; const x = cv.getContext('2d');
      return Promise.all(us.map((u, i)=>new Promise(r=>{ const im = new Image(); im.onload = ()=>{ x.drawImage(im, i*300, 0); r(); }; im.src = u; }))).then(()=>[cv.toDataURL('image/png')]); }, [bd, fem, outfit, pads, !!process.env.ZPOSE, race]);
    shotlib.save(urls, 'zplate_' + nm);
  }
};
