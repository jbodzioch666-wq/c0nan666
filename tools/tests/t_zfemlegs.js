// probe: a woman (human) in each kind of legwear - bare (underclothes), cloth trousers, leather, plate - from the front and the side,
// with and without body armour, as one sheet: shots/zfemlegs.png. ZBODY = 0 for a man instead; ZHIP = 1 close on the hips
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0);
  const r = await page.evaluate(async ([fem, zoom])=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const T = THREE, W = 1600, H = 900, R = new T.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }); R.setSize(W/4, H/2, false); R.outputColorSpace = T.SRGBColorSpace;
    const sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H; const sx = sheet.getContext('2d'); sx.fillStyle = '#888'; sx.fillRect(0, 0, W, H);
    const L = Object.assign(lookDefault('Human'), { body:fem });
    const cols = [['skin', null], ['cloth', 'cloth'], ['leather', 'hide'], ['plate', 'metal']], out = {};
    for (let ci=0;ci<cols.length;ci++){ const [nm, fam] = cols[ci];
      for (const sl of Object.keys(G.gear)) G.gear[sl] = newItem();
      if (fam){ G.gear.legs = rsMakeArmour(fam, 1, 'legs'); G.gear.chest = rsMakeArmour(fam, 1, 'chest'); }
      const pt = rsPlayerLook({ race:'Human', look:L }); const o = pt.o; out[nm] = { legWear:o.legWear, outfit:o.outfit, under:!!o.under };
      const root = m3dBuilders().get(pt.paint)(o);
      for (let k=0;k<2;k++){ const sc = new T.Scene(); sc.background = new T.Color(0x9aa4ae); sc.add(new T.HemisphereLight(0xffffff, 0x404040, 1.6)); const dl = new T.DirectionalLight(0xffffff, 2.2); dl.position.set(2, 4, 3); sc.add(dl);
        const g = root.clone(); g.rotation.y = k ? Math.PI/2 : 0; sc.add(g); const bb = new T.Box3().setFromObject(g), c = bb.getCenter(new T.Vector3()); let h = bb.max.y - bb.min.y; if (zoom){ c.y = bb.min.y + h*0.5; h *= 0.38; }
        const cam = new T.PerspectiveCamera(30, (W/4)/(H/2), 0.01, 50); cam.position.set(c.x, c.y, c.z + h*2.1); cam.lookAt(c); R.render(sc, cam);
        sx.drawImage(R.domElement, ci*W/4, k*H/2, W/4, H/2); }
      sx.fillStyle = '#000'; sx.font = '20px sans-serif'; sx.fillText(nm, ci*W/4 + 10, 24); }
    return { out, shot:sheet.toDataURL('image/png') }; }, [+(process.env.ZBODY || 1), +(process.env.ZHIP || 0)]);
  fs.writeFileSync(SHOTS + '/zfemlegs.png', Buffer.from(r.shot.split(',')[1], 'base64')); delete r.shot; console.log(JSON.stringify(r));
};
