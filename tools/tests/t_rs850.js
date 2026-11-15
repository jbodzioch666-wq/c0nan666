// RS-850: the rival kings - a king marches on a neighbouring realm's town (a siege on the map, with its own tooltip, gate dialog and a
// line in the Realms panel); left alone, the town falls to him and the borders move (names kept, the chart redrawn, kept through a
// save); broken, the town stays and the chronicle says so
const assert = require('assert');
module.exports = async page=>{ page.setDefaultTimeout(0); const errs = []; page.on('pageerror', e=>errs.push(String(e).slice(0, 300)));
  const r = await page.evaluate(async ()=>{ const out = {};
    goToCharCreate(); ccBegin(); setWorldSizeTier('medium'); wgRegenerate(12345); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame();
    const e = wevP(); e.dyn = e.dyn.filter(d=>d.kind!=='siege'); const rw = realmWarState(); rw.next = 0;
    const names0 = owProvinces().list.map(p=>p.name + '|' + p.ruler).join(';');
    const d = realmWarTick(); out.war = !!(d && d.war && d.kind==='siege'); if (!d) return out;
    const A = realmWarSide(d.war.a), B = realmWarSide(d.war.b); out.fromB = provIdAt(d.x, d.y)===B.id && A.id!==B.id;
    const o = wevMapList().find(o=>o.k==='siege' && o.d===d); out.onMap = !!o; out.tip = !!o && /wants it from/.test(wevTipHtml(o));
    wevTownGate(d.x, d.y); out.gate = G.ui==='wevent' && /army of/.test(G.wevDlg.text) && /falls to/.test(G.wevDlg.text); setUi('playing');
    setUi('realms'); out.panel = /War:/.test(document.getElementById('overlay').innerHTML) && /Of late/.test(document.getElementById('overlay').innerHTML); setUi('playing');
    /* left alone: it falls */ const key0 = pmMapKey(); d.until = wevTurn() - 1; wevTick();
    out.gone = !e.dyn.includes(d); out.taken = provIdAt(d.x, d.y)===A.id && realmWarSide(A.id).towns.includes(d.key) && !realmWarSide(B.id).towns.includes(d.key);
    out.names = owProvinces().list.map(p=>p.name + '|' + p.ruler).join(';')===names0; out.chart = pmMapKey()!==key0; out.fellLog = /fell to/.test(rw.log[0].s);
    /* through a save */ saveCurrentGame(); const id = G.saveId; loadGame(id); setUi('playing'); out.kept = provIdAt(d.x, d.y)===A.id && owProvinces().list.map(p=>p.name + '|' + p.ruler).join(';')===names0;
    /* another, broken */ const e2 = wevP(), rw2 = realmWarState(); e2.dyn = e2.dyn.filter(d=>d.kind!=='siege'); rw2.next = 0; const d2 = realmWarTick(); out.war2 = !!d2;
    if (d2){ const own0 = provIdAt(d2.x, d2.y); G.siegeWar = { id:d2.id, key:d2.key, x:d2.x, y:d2.y, camp:'bandit', L:30, wave:3, phase:2 }; G.allies = []; try{ siegeWarWon({ kind:'siegewar', id:d2.id }); }catch(er){ out.wonErr = String(er); }
      out.broken = !wevP().dyn.includes(d2) && provIdAt(d2.x, d2.y)===own0 && /you broke/.test(realmWarState().log[0].s); }
    setUi('playing');
    return out; });
  console.log(JSON.stringify(r)); assert.equal(errs.length, 0, errs.join('|'));
  assert.ok(r.war && r.fromB, 'no war on a neighbour\'s town'); assert.ok(r.onMap && r.tip, 'the war on the map'); assert.ok(r.gate, 'the gate dialog'); assert.ok(r.panel, 'the Realms panel');
  assert.ok(r.gone && r.taken, 'the town did not fall'); assert.ok(r.names, 'a realm renamed by a conquest'); assert.ok(r.chart && r.fellLog, 'the chart or the chronicle');
  assert.ok(r.kept, 'the conquest lost in the save'); assert.ok(r.war2 && r.broken, 'the broken siege ' + (r.wonErr||'')); };
