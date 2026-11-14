// probe (RS-691): the lobster on the grill, raw and cooked, from three sides; its bag icons; and a fishing spot close up over a few
// seconds (the shoal circling, a fish leaping). Shots: shots/zchicken-*.png, zchicken-icons.png, zfish-*.png
const fs = require('fs');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const shots = await page.evaluate(async ()=>{ const fr = n=>new Promise(res=>{ let i = 0; const f = ()=>++i >= n ? res() : requestAnimationFrame(f); requestAnimationFrame(f); });
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; G.player.wildWarned = 1; G.player.clock = DAY_LENGTH*0.4;
    const T = THREE, out = {}, W = 900, H = 640, R = new T.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true }); R.setSize(W, H); R.outputColorSpace = T.SRGBColorSpace || R.outputColorSpace;
    const sc = new T.Scene(); sc.background = new T.Color(0x3a3430); sc.add(new T.HemisphereLight(0xfff0e0, 0x302820, 1.1)); const dl = new T.DirectionalLight(0xffe8d0, 1.6); dl.position.set(1, 2, 1.2); sc.add(dl);
    const fire = new T.PointLight(0xff8030, 1.2, 1.5); fire.position.set(0, -0.1, 0); sc.add(fire);
    const rg = cookRigMake(T, {}); sc.add(rg.g); const rg2 = cookRigMake(T, { pan:true }); rg2.g.position.x = 0.6; sc.add(rg2.g); const cam = new T.PerspectiveCamera(32, W/H, 0.01, 10);
    for (const [nm, done] of [['raw', false], ['cooked', true]]){ G.ui = 'cook'; CQ.list = [{ kind:'cook', a:'chicken', n:3, done:0, ui:'cook' }]; CQ.next = done ? performance.now() - 1 : performance.now() + cqStepOf({ kind:'cook' }); cookRigSync(rg, true, 1); cookRigSync(rg2, true, 1);
      out.vis = Object.keys(rg.foods).filter(k=>rg.foods[k].visible);
      for (const [an, p] of [['iso', [0.42, 0.42, 0.42]], ['side', [0.05, 0.12, 0.5]], ['top', [0.01, 0.6, 0.02]], ['close', [0.16, 0.14, 0.2]], ['pan', [0.9, 0.4, 0.4, 0.6]]]){ cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3]!==undefined ? p[3] : 0, 0.02, 0); R.render(sc, cam); out['l_' + nm + '_' + an] = R.domElement.toDataURL('image/png'); } } G.ui = 'playing'; CQ.list = [];
    /* the icons, big */
    { const c = document.createElement('canvas'); c.width = 4*48*2 + 30; c.height = 4*48; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#2a2420'; x.fillRect(0, 0, c.width, c.height);
      for (const [i, id] of [[0, 'chicken'], [1, 'c_chicken']]){ const im = new Image(); im.src = foodIconUrl(id); await new Promise(r=>{ im.onload = r; }); x.drawImage(im, i*(4*48 + 30), 0, 4*48, 4*48); }
      out.icons = c.toDataURL('image/png'); }
    return out; });
  for (const k in shots){ if (typeof shots[k]==='string' && shots[k].startsWith('data:')){ const f = k.startsWith('l_') ? 'zchicken-' + k.slice(2) : k==='icons' ? 'zchicken-icons' : 'zfish-' + k; fs.writeFileSync(SHOTS + '/' + f + '.png', Buffer.from(shots[k].split(',')[1], 'base64')); delete shots[k]; } }
  console.log(JSON.stringify(shots)); if (errs.length) console.log('ERRS', errs);
};
