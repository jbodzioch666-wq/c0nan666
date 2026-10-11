// RS-334: a quest step that happens where a "go to" led you (a fight, a boss like the Stormcaller, a puzzle, a choice) keeps
// its marker on the place when you leave it unfinished, and coming back there offers it again
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); G.gameMode = 0; saveCurrentGame = ()=>{};
    const out = {}, L = { x:G.owPos.x + 3, y:G.owPos.y + 2 }, S = sqP();
    // every quest: wherever such a step follows a "go to", the marker points at the place
    out.bad = []; out.checked = 0;
    for (const id of SQ_ORDER){ const steps = SQ[id].steps; for (let i=1;i<steps.length;i++){ if (steps[i-1].k!=='goto' || !['fight','boss','puzzle','choice','spire'].includes(steps[i].k)) continue;
      S[id] = { step:i, flags:{}, log:[], loc:{ [i-1]:{ x:L.x, y:L.y } }, state:'active', n:0, started:0, home:'0,0' }; out.checked++;
      const t = sqTarget(id); if (!t || t.x!==L.x || t.y!==L.y) out.bad.push(id+':'+steps[i].k); delete S[id]; } }
    // the Stormcaller: walk off, come back, fight, run away - the marker stays and the fight is offered again
    const id = 'mage3', bi = SQ[id].steps.findIndex(st=>st.k==='boss');
    S[id] = { step:bi, flags:{}, log:[], loc:{ [bi-1]:{ x:L.x, y:L.y } }, state:'active', n:0, started:0, home:'0,0' };
    G.owPos = { x:L.x - 4, y:L.y }; sqFrame(); out.awayUi = G.ui;
    G.owPos = { x:L.x, y:L.y }; sqFrame(); out.backUi = G.ui; out.opts = G.wevDlg && G.wevDlg.opts.map(o=>o[0]);
    G.wevDlg.opts[0][1](); out.fight = { mode:G.gameMode, boss:!!G.mon.find(m=>m.sqBoss==='stormcaller') };
    G.cellar = false; G.gameMode = 0; setUi('playing');   /* (what stepping off the edge of the fight does) */
    const t = sqTarget(id); out.after = { step:sqStep(id).k, marker:!!(t && t.x===L.x && t.y===L.y) };
    sqFrame(); out.noNag = G.ui==='playing';   /* (standing on the spot after running off doesn't throw you straight back in) */
    G.owPos = { x:L.x + 5, y:L.y }; sqFrame(); G.owPos = { x:L.x, y:L.y }; sqFrame(); out.again = G.ui==='wevent' && /still here/.test(G.wevDlg.text);
    // (RS-334) the Cracksman's sliding lock: it opens when the hooded figure sets it, and talking to them again re-opens it
    setUi('playing'); G.gameMode = 0; delete S[id];
    S.thief2 = { step:0, flags:{}, log:[], loc:{}, state:'active', n:0, started:0, home:G.owPos.x+','+G.owPos.y };
    sqOnTalk('hooded'); out.t1 = G.ui; G.wevDlg.opts[0][1](); out.lock = { ui:G.ui, kind:G.sqPz && G.sqPz.kind, step:sqStep('thief2').k };
    setUi('playing'); out.lockMarker = !!sqTarget('thief2');
    sqOnTalk('hooded'); out.again2 = G.ui==='wevent' && G.wevDlg.opts[0][0]==='Try the lock'; G.wevDlg.opts[0][1](); out.reopen = G.ui==='sqpuzzle';
    G.sqPz.b = [1,2,3,4,5,6,7,0,8]; sqPzSlide(8); out.solved = sqStep('thief2') && sqStep('thief2').k==='talk';
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(r.checked >= 10 && !r.bad.length, 'every fight, boss, puzzle and choice after a "go to" keeps its marker');
  A(r.awayUi==='playing' && r.backUi==='wevent' && r.opts[0]==='Fight', 'coming back to the place offers the fight');
  A(r.fight.mode===2 && r.fight.boss, 'the Stormcaller fight starts');
  A(r.after.step==='boss' && r.after.marker, 'running from the fight leaves the quest on the boss with its marker');
  A(r.noNag, 'it does not drag you straight back in');
  A(r.again, 'walking off and back offers it again');
  A(r.t1==='wevent' && r.lock.ui==='sqpuzzle' && r.lock.kind==='sliding' && r.lock.step==='puzzle', 'the sliding lock opens once the hooded figure sets it');
  A(r.lockMarker && r.again2 && r.reopen, 'stepping back from it keeps a marker, and the hooded figure lets you try again');
  A(r.solved, 'solving it moves the quest on');
  console.log('sqreturn ok', JSON.stringify(r));
};
