// RS-717: the guild hall's banners are masters now, and the Cooks' Guild is its range. In a city's guild hall six masters stand where
// the banners were (each drawn in 3D in its guild's look), and walking into one opens its guild - turned away until you qualify, its
// training once you do; the range against the west wall is a bench: too low and the cooks wave you off, at Cooking 32 you cook on it
// (cookAt 'guild'). Shots: shots/rs717_hall.png, rs717_range.png
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const ev = (f, a)=>page.evaluate(f, a), A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); };
  const r0 = await ev(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player; p.clock = p.turnCount = 60; townClosedCheck = ()=>false;
    const city = townList().find(t=>townInfo(t.x, t.y).tier===2); if (!city) return { noCity:true };
    G.owPos = { x:city.x, y:city.y }; trackVisitedTown(city.x, city.y); enterVillage(); setUi('playing'); enterInterior('guild');
    const out = {};
    out.reps = G.villageNpcs.filter(n=>n.service==='guildrep').map(n=>`${n.guild}@${n.x},${n.y}:${G.map[n.x][n.y]===T_VENDOR ? 'v' : '-'}`);
    out.banners = ROOM_LAYOUT.guild.benches.filter(b=>b[0].startsWith('g_')).length; out.range = benchAt(5, 8);
    G.player.x = 10; G.player.y = 10; G.player.facing = 0; renderGame();
    for (let i=0;i<30;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); }
    out.people = (V3.people||[]).length;
    return out; });
  if (r0.noCity){ console.log('no city in this world - skipped'); return; }
  await page.waitForTimeout(2500); await page.screenshot({ path:SHOTS + '/rs717_hall.png' });
  await ev(()=>{ G.player.x = 7; G.player.y = 9; G.player.facing = 3; renderGame(); }); await page.waitForTimeout(1500); await page.screenshot({ path:SHOTS + '/rs717_range.png' });
  const R = await ev(()=>{
    const out = {}, p = G.player, ui = ()=>({ ui:G.ui, txt:(document.getElementById('overlay')||{}).textContent||'' });
    /* the Warriors' master: not yet, then a member's training */
    skP().skills.attack = SK_XP[10]; skP().skills.strength = SK_XP[10]; rsSync(); p.x = 7; p.y = 7; villageInteract(6, 7); out.wNo = ui(); setUi('playing');
    skP().skills.attack = SK_XP[40]; skP().skills.strength = SK_XP[40]; rsSync(); villageInteract(6, 7); out.wYes = ui(); const ax = skP().skills.attack; wevChoose(0); out.spar = skP().skills.attack > ax; setUi('playing');
    villageInteract(13, 7); out.wiz = ui(); setUi('playing');
    /* the range: too low, then a member */
    skP().skills.cooking = SK_XP[10]; p.x = 6; p.y = 8; useBench('grange'); out.rNo = ui(); setUi('playing');
    skP().skills.cooking = SK_XP[40]; G.cookAt = null; useBench('grange'); out.rYes = { ui:G.ui, at:G.cookAt }; setUi('playing');
    out.desk = (()=>{ setUi('guild'); const t = document.getElementById('overlay').textContent; setUi('playing'); return /talk to its master/.test(t); })();
    return out; });
  console.log(JSON.stringify(Object.assign({}, r0, R, { wNo:R.wNo.txt.slice(0, 160), wYes:R.wYes.txt.slice(0, 160), wiz:R.wiz.txt.slice(0, 100), rNo:R.rNo.txt.slice(0, 160) })));
  A(r0.reps.length===6 && r0.reps.every(s=>/:v$/.test(s)) && r0.banners===0 && r0.range==='grange', 'six masters where the banners were, and the range: ' + JSON.stringify(r0));
  A(R.wNo.ui==='wevent' && /Sir Tiffany/.test(R.wNo.txt) && /Not yet/.test(R.wNo.txt), "the Warriors' master turns you away till you qualify");
  A(R.wYes.ui==='wevent' && /a member/.test(R.wYes.txt) && R.spar, "then trains you");
  A(/Archmage Sedridor/.test(R.wiz.txt), "the Wizards' master");
  A(R.rNo.ui==='wevent' && /Members only/.test(R.rNo.txt) && /Cooking 32/.test(R.rNo.txt), 'the range: too low, waved off');
  A(R.rYes.ui==='cook' && R.rYes.at==='guild', 'at Cooking 32 you cook on it');
  A(R.desk, "the front desk says to talk to the masters");
  A(!errs.length, 'no errors: ' + errs.join(' | '));
};
