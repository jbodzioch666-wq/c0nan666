// RS-773: a cape's emblem in your dye on the finest capes too. A tier-6 cape's thread glows, and the glow painted the emblem gold whatever
// its dye - a black cross showed gold. The glow now takes the emblem's own colour (dimmed): black shows black, red glows red, an undyed
// emblem is gold thread glowing gold. Read from the figure's cape: its cloth and its glow at the cross
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r = await page.evaluate(async ()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.gameMode = 0; G.interior = null;
    const fr = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 30)); } };
    const P = G.player, cp = rsMakeCape(87, 'Legends Cape'); cp.capeTier = 6; G.gear.cape = cp; P.capeEmblem = 'cross';
    const px = im=>{ const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const x = cv.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(im.width/2|0, im.height*0.4|0, 1, 1).data; return [d[0], d[1], d[2]]; };
    const out = {};
    for (const [k, dye] of [['black', '#222024'], ['red', '#9a2a24'], ['none', null]]){ if (dye) P.capeEmblemDye = dye; else delete P.capeEmblemDye; delete P.emblemDye; await fr(25);
      const c = O3.player && O3.player.e.rig.cape, m = c && [].concat(c.material).find(m=>m.map); out[k] = m ? { cloth:px(m.map.image), glow:m.emissiveMap ? px(m.emissiveMap.image) : null } : null; }
    return out; });
  console.log(JSON.stringify(r));
  const lum = c=>c[0]*0.3 + c[1]*0.59 + c[2]*0.11;
  A(r.black && r.black.glow, 'a tier-6 cape, its thread glowing');
  A(lum(r.black.cloth) < 50 && lum(r.black.glow) < 30, 'a black cross: black cloth, no gold glow over it: ' + JSON.stringify(r.black));
  A(r.red.glow[0] > r.red.glow[1]*2 && r.red.glow[0] > 60, 'a red cross glows red: ' + JSON.stringify(r.red));
  A(r.none.glow[0] > 120 && r.none.glow[1] > 80 && r.none.glow[2] < 60, 'undyed: gold thread glowing gold: ' + JSON.stringify(r.none));
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
