// (probe, not in ALL) every save in ZSAVES (a ;-list of files) imported and loaded, then played a moment: any error, where it stands,
// and the gear and skills it kept
const fs = require('fs');
module.exports = async page=>{
  page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e.stack || e).slice(0, 400))); page.on('console', m=>{ if (m.type()==='error') errs.push('console: ' + m.text().slice(0, 300)); });
  for (const f of (process.env.ZSAVES || '').split(';').filter(Boolean)){ const txt = fs.readFileSync(f, 'utf8'), e0 = errs.length;
    const r = await page.evaluate(async txt=>{ importSaveText(txt); const id = saveIndexList().slice(-1)[0].id; loadGame(id); setUi('playing'); saveCurrentGame = ()=>{};
      for (let i=0;i<240;i++) await new Promise(r=>requestAnimationFrame(r));
      const p = G.player; return { nm:p.name, mode:G.gameMode, depth:G.depth, ui:G.ui, cb:cbLvl(), gear:Object.keys(G.gear||{}).filter(k=>G.gear[k] && G.gear[k].used).length, inv:(G.inv||[]).length, ver:p.ver || null, three:!!(typeof FPD!=='undefined' && FPD.ok) || !!(typeof O3!=='undefined' && O3.ok) || !!(typeof V3!=='undefined' && V3.ok) }; }, txt);
    console.log(f.split(/[\/]/).pop(), JSON.stringify(r), 'errors:', errs.length - e0);
    await page.evaluate(()=>{ try{ setUi('title'); }catch(e){} }); }
  for (const e of errs) console.log('ERR', e);
  if (errs.length) throw new Error(errs.length + ' errors');
};
