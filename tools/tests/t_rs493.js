// RS-493: the trim on gear takes a dye of its own at the dye works, apart from the piece's colour - a body's trim band, a great helm's
// bands, a coif's stitching, a hat's band, a cape's hem and a metal shield's rim - and shows at once; pieces with no trim get no trim row
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const out = {}, d = DYES.find(x=>x[0]==='blue'), lk = ()=>rsPlayerLook().o; skAdd('dye_blue', 40); G.player.rsLastType = 'melee';
    const try1 = (slot, it, read)=>{ G.gear[slot] = it; const k0 = rsLookKey(), before = read(lk()); trimDyeApply('g:' + slot, 'blue'); const after = read(lk()), body = lk().helmCol;
      const res = { ok:trimmable(it), before, after, dyed:after===d[2], moved:rsLookKey()!==k0, ownCol:it.dye || null }; trimDyeApply('g:' + slot, null); res.washed = read(lk())===before; return res; };
    out.plate = try1('chest', rsMakeArmour('metal', 3, 'chest'), o=>o.trim);
    out.hide = try1('chest', rsMakeArmour('hide', 4, 'chest'), o=>o.trim);
    out.robe = try1('chest', rsMakeArmour('cloth', 2, 'chest'), o=>o.robeTrim);
    out.helm = try1('head', rsMakeArmour('metal', 2, 'head'), o=>o.helmTrim);
    out.coif = try1('head', rsMakeArmour('hide', 2, 'head'), o=>o.helmTrim);
    out.hat = try1('head', rsMakeArmour('cloth', 2, 'head'), o=>o.helmTrim);
    out.cape = try1('cape', rsMakeCape(0, 'Black Cape'), o=>o.capeTrimCol);
    out.shield = try1('offhand', rsMakeArmour('metal', 2, 'offhand'), o=>o.shield && o.shield.rim);
    /* none on pieces without a trim */
    out.none = [rsMakeArmour('metal', 0, 'chest'), rsMakeCape(0, 'Red Cape'), rsMakeCape(0, 'Leather Quiver'), rsMakeArmour('hide', 0, 'legs')].map(trimmable);
    /* the body's own dye and its trim apart */
    G.gear.chest = rsMakeArmour('metal', 3, 'chest'); dyeApply('g:chest', 'blue'); skAdd('dye_red', 2); trimDyeApply('g:chest', 'red'); out.apart = [G.gear.chest.dye, G.gear.chest.trimDye];
    /* the 3D figure builds with each, and the dye works shows trim rows */
    G.gear.head = rsMakeArmour('hide', 3, 'head'); trimDyeApply('g:head', 'blue'); G.gear.offhand = rsMakeArmour('metal', 2, 'offhand'); trimDyeApply('g:offhand', 'blue');
    try{ m3dInstance({}, rsPlayerLook()); out.built = true; }catch(e){ out.built = String(e); }
    setUi('dyeworks'); const h = buildDyeWorks(); out.rows = (h.match(/its trim &middot;/g) || []).length;
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  for (const k of ['plate', 'hide', 'robe', 'helm', 'coif', 'hat', 'cape', 'shield']){ const o = r[k];
    A(o.ok && o.dyed && o.moved && o.washed, k + ': its trim dyed blue at once, and washed out again'); }
  A(r.none.every(x=>!x), 'no trim row for a plain bronze body, a red cape, a quiver or chaps');
  A(r.apart[0]==='#2a4a9a' && r.apart[1]==='#9a2a24', 'the body blue, its trim red');
  A(r.built===true, 'the figure builds with dyed trims');
  A(r.rows >= 3, 'the dye works offers a trim row under each trimmed piece');
};
