// RS-337: the carpentry bench saws the best logs your Construction level can work (it used to pick your best logs of all and
// ask for Construction 45); resources are listed A to Z; a story quest's site that moves when its master falls (the Relic of
// Bone in a necromancer's tower) keeps the quest pointed at it, a relic left on a beaten site's floor comes with you, and a
// quest already pointed at vanished ground finds a new site
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const out = {};
    // the carpentry bench at Construction 1 with maple and plain logs
    skAdd('maple', 8); skAdd('logs', 8); houseCarpentry(); out.dlg = G.wevDlg.text; out.btn = G.wevDlg.opts[0][0];
    G.wevDlg.opts[0][1](); out.after = { logs:skHave('logs'), maple:skHave('maple') }; setUi('playing');
    skAdd('logs', -skHave('logs')); houseCarpentry(); out.onlyMaple = G.wevDlg.text; setUi('playing');
    out.con = SK_DEFS.some(d=>d[0]==='construction');
    // resources A to Z
    const cats = resCats(); out.catsSorted = cats.map(c=>c[0]).join('|')===cats.map(c=>c[0]).slice().sort((a,b)=>a.localeCompare(b)).join('|');
    out.itemsSorted = cats.every(([nm, ids])=>ids.every((id, i)=>!i || resName(ids[i-1]).localeCompare(resName(id)) <= 0));
    // the Lich's relic: the site moves when its master falls
    const S = sqP(), sites = []; for (let x=0;x<OW_COLS;x++) for (let y=0;y<OW_ROWS;y++) if (OW_SITE_TILES.includes(G.ow.map[x][y])) sites.push({ x, y });
    const fi = SQ.lich4.steps.findIndex(st=>st.k==='floor');
    S.lich4 = { step:fi, flags:{}, log:[], loc:{ [fi]:{ x:sites[0].x, y:sites[0].y } }, state:'active', n:0, started:0, home:G.owPos.x+','+G.owPos.y };
    sqSiteMoved(sites[0].x, sites[0].y, sites[1].x, sites[1].y); out.moved = S.lich4.loc[fi].x===sites[1].x && S.lich4.loc[fi].y===sites[1].y;
    // a save already pointed at empty ground finds another site
    let gx = -1, gy = -1; for (let x=5;x<OW_COLS-5 && gx<0;x++) for (let y=5;y<OW_ROWS-5;y++) if (G.ow.map[x][y]===OW_GRASS){ gx = x; gy = y; break; }
    S.lich4.loc[fi] = { x:gx, y:gy }; const t = sqTarget('lich4'); out.refound = !!t && OW_SITE_TILES.includes(G.ow.map[t.x][t.y]);
    // a relic left lying on a beaten site's floor comes with you
    G.gameMode = 1; G.floorItem = makeItemGrid(); const it = newItem(); Object.assign(it, { used:1, kind:'scroll', sqItem:'lich4', nm:'The Relic of Bone' }); G.floorItem[3][3] = it; G.map[3][3] = T_ITEM;
    sqTakeLeftRelic(); out.took = sqStep('lich4') && sqStep('lich4').k==='talk'; G.gameMode = 0;
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.con, 'Construction is still a skill');
  A(/logs/i.test(r.dlg) && !/maple/i.test(r.dlg) && r.btn==='Make a flatpack' && r.after.logs===4 && r.after.maple===8, 'at Construction 1 the bench saws plain logs, not maple');
  A(/Construction 45/.test(r.onlyMaple) && /logs/i.test(r.onlyMaple), 'with only maple it says which logs you can use');
  A(r.catsSorted && r.itemsSorted, 'resources are A to Z');
  A(r.moved && r.refound && r.took, 'the relic quest follows its site, finds a new one, and a left relic comes with you');
  console.log('rs337 ok', JSON.stringify(r).slice(0, 300));
};
