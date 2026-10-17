// RS-495: a trim dye reaches all of a piece's trimming: the whole perimeter of a cape (its sides and top as well as the hem) and its
// embroidered band, a robe's stitched hem runes as well as its band, the device on a plate tabard, and a wizard hat's glow; and the
// trim strip down the front of a body follows its curve (a bust swallowed the flat bar, leaving two stubs that looked loose)
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, lk = ()=>rsPlayerLook().o, red = '#9a2a24'; skAdd('dye_red', 20); G.player.rsLastType = 'melee';
    const px = (o, x, y)=>{ const c = m3dCapeTex(o).tex.image, d = c.getContext('2d').getImageData(x, y, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(v=>v.toString(16).padStart(2, '0')).join(''); };
    /* a tier 1 cape: no edging until dyed, then all round */
    G.gear.cape = rsMakeCape(0, 'Black Cape'); out.side0 = px(lk(), 4, 256); trimDyeApply('g:cape', 'red'); const o1 = lk(); out.side1 = px(o1, 4, 256); out.top1 = px(o1, 128, 3); out.hem1 = px(o1, 128, 512 - 4);
    /* a legends cape: its gold edging and lozenges in the dye */
    G.gear.cape = rsMakeCape(0, 'Legends Cape'); out.side5 = px(lk(), 4, 256); trimDyeApply('g:cape', 'red'); out.side5d = px(lk(), 4, 256); out.band5d = px(lk(), 128, 512 - 62);
    /* a robe's hem runes */
    G.gear.chest = rsMakeArmour('cloth', 3, 'chest'); out.runes0 = lk().robeRunes; trimDyeApply('g:chest', 'red'); out.runes1 = lk().robeRunes; out.band1 = lk().robeTrim;
    /* a plate tabard's device */
    G.gear.chest = rsMakeArmour('metal', 5, 'chest'); out.dev0 = lk().emblem; trimDyeApply('g:chest', 'red'); out.dev1 = lk().emblem;
    /* a wizard hat's glow */
    G.gear.head = rsMakeArmour('cloth', 3, 'head'); trimDyeApply('g:head', 'red'); out.hat = lk().hatGlow;
    try{ m3dInstance({}, rsPlayerLook()); out.built = true; }catch(e){ out.built = String(e); }
    /* the cape emblem is big across the back */
    { const o = { cape:'#a02020', capeTier:0, capeEm:'cross', capeEmCol:'#d8b050' }, c = m3dCapeTex(o).tex.image, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (let y=0;y<c.height;y++) for (let x=0;x<c.width;x++){ const i = (y*c.width + x)*4; if (d[i] > 180 && d[i + 1] > 140 && d[i + 2] < 140){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
      out.emW = +((x1 - x0)/c.width).toFixed(2); out.emH = +((y1 - y0)/c.height).toFixed(2); }
    /* the front strip lies on the body all the way down, over a bust - not a flat bar it swallows */
    { const T = THREE, tor = new T.Group(), bust = new T.Mesh(new T.SphereGeometry(0.06, 24, 16), new T.MeshBasicMaterial()); bust.position.set(0, 0.15, 0.03); tor.add(bust);
      const body = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.4, 24), new T.MeshBasicMaterial()); body.position.y = 0.15; tor.add(body);
      m3dFrontStrip(tor, new T.MeshBasicMaterial(), 0.012, 0.004, 0.055, 0.245, 0.07); const segs = tor.children.filter(o=>o.userData.frontTrim);
      out.segs = segs.length; out.onBody = segs.every(m=>{ const zf = m3dFrontZ(tor, m.position.y, 0); return m.position.z >= zf - 0.004 && m.position.z <= zf + 0.012; });
      const mid = segs.find(m=>Math.abs(m.position.y - 0.15) < 0.012); out.overBust = mid ? +mid.position.z.toFixed(3) : null; }
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  const near = (a, b)=>{ const h = s=>[1, 3, 5].map(i=>parseInt(s.slice(i, i + 2), 16)); const x = h(a), y = h(b); return x.every((v, i)=>Math.abs(v - y[i]) < 40); };
  A(!near(r.side0, '#9a2a24') && near(r.side1, '#9a2a24') && near(r.top1, '#9a2a24') && near(r.hem1, '#9a2a24'), 'a dyed cape trim runs all round its perimeter');
  A(near(r.side5, '#d8b050') && near(r.side5d, '#9a2a24') && near(r.band5d, '#9a2a24'), 'a legends cape\'s gold edging and embroidery take the dye');
  A(r.runes0 && r.runes0!=='#9a2a24' && r.runes1==='#9a2a24' && r.band1==='#9a2a24', 'a robe\'s hem runes take the dye with its band');
  A(r.dev0 && r.dev1==='#9a2a24', 'the device on a plate tabard takes it');
  A(r.hat==='#9a2a24' && r.built===true, 'a wizard hat\'s glow takes it, and the figure builds');
};
