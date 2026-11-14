// raid (RS-851): a castle raid's defence (RS-847/848) fought out - three waves of raiders built as the game builds them (castleRaider:
// castleRaidWave and castleRaidCb: 2, 3 and 5 of them at your level less four; under 45, 1, 2 and 2 at seven below), against you in "found" gear (the best of eight drops a slot, as in the mobs
// sim) with your wardens beside you (castleWardenAct's spear: 12-22% of a raider's life, a wound on 35% of thrusts, down at four).
// Every raider swings at you each beat (they all crowd you; the worst case) or, with RAID_ADJ=3, the nearest three only.
// Prints, per level and garrison: raids lost (you died), food eaten a raid, the share of your life taken, wardens lost, minutes.
module.exports = async page=>{
  const ADJ = +(process.env.RAID_ADJ || 99), W0 = process.env.RAID_WARDENS ? JSON.parse(process.env.RAID_WARDENS) : [2, 4];
  const r = await page.evaluate(([ADJ, W0])=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); o3Pref = false; try{ v3Pref = false; }catch(e){}
    saveCurrentGame = ()=>{}; renderGame = ()=>{}; renderOverlay = ()=>{}; logMsg = ()=>{}; sfx = ()=>{}; notify = ()=>{};
    const p = G.player, out = [];
    G.gameMode = 2; generateArena(); G.mon = []; p.rsStyle = 3;
    const ARM = ['head','chest','legs','arms','feet','offhand'], JEW = { cape:'cape', necklace:'necklace', ring1:'ring', ring2:'ring', trinket:'trinket' };
    const score = (it, sl)=>itemScoreFor(it, 'melee') + (sl==='weapon' ? itemScore(it) : 0);
    const found = (L, n)=>{ const g = {};
      for (const sl of ['weapon'].concat(ARM, Object.keys(JEW))){ const kind = JEW[sl] || sl; let best = null, bs = -1e9;
        for (let got=0, tries=0; got<n && tries<n*30; tries++){ const it = genItem(L, kind, 3); if (!it || !it.used) continue; if (sl==='weapon' && (it.range || it.rsStaff || it.slot!=='weapon')) continue;
          if (ARM.includes(sl) && it.rsFam && it.rsFam!=='metal') continue; got++; const s = score(it, sl); if (s > bs){ bs = s; best = it; } }
        g[sl] = best; } return g; };
    const raid = (L, gear, wardens)=>{
      for (const k of ['attack','strength','defence']) p.skills[k] = SK_XP[L]; for (const k of ['ranged','magic','necromancy','prayer']) p.skills[k] = SK_XP[1]; p.skills.hitpoints = SK_XP[Math.max(10, L)]; p.prayers = []; rsSync();
      for (const sl of ['weapon'].concat(ARM, Object.keys(JEW))) G.gear[sl] = gear[sl] || newItem();
      const fish = SK_FISH.filter(f=>f.lvl <= L && !f.hard).pop() || SK_FISH[0]; p.bag = {}; skAdd('c_'+fish.id, 1e6); const food0 = skHave('c_'+fish.id);
      p.hp = effMaxHp(); G.gameOver = 0; const hp = effMaxHp();
      const S = { foe:'orc', cb:castleRaidCb({ cb:floorCb(1) }) };
      const ws = []; for (let i=0;i<wardens;i++) ws.push({ hp:4 });
      let beats = 0, taken = 0, died = 0;
      for (let wave=0; wave<RAID_WAVES && !died; wave++){
        const n = castleRaidWave(S, wave); G.mon = []; for (let i=0;i<n;i++) castleRaider(p.x + i - 1, p.y - 1, S);
        for (let b=0; b<4000; b++){ beats++; const live = G.mon.map((m, i)=>i).filter(i=>G.mon[i].alive && G.mon[i].hp > 0); if (!live.length) break;
          if (p.hp < hp*0.5){ eatFood(); } else { try{ singlePlayerAttack(live[0]); }catch(e){} }
          for (const w of ws){ if (w.hp <= 0) continue; const li = G.mon.findIndex(m=>m.alive && m.hp > 0); if (li < 0) break; const m = G.mon[li];
            m.hp -= Math.max(1, Math.round(m.maxHp*(0.12 + Math.random()*0.1))); if (m.hp <= 0) m.alive = 0; if (Math.random() < 0.35) w.hp--; }
          let k = 0; for (let i=0;i<G.mon.length;i++){ const m = G.mon[i]; if (!m.alive || m.hp <= 0 || k++ >= ADJ) continue; const ph = p.hp; try{ monsterAttacks(i); }catch(e){} taken += Math.max(0, ph - p.hp); }
          if (G.gameOver || p.hp <= 0){ died = 1; G.gameOver = 0; break; } } }
      return { died, food:food0 - skHave('c_'+fish.id), taken:taken/hp, lostW:ws.filter(w=>w.hp <= 0).length, min:beats*ISO_SWING_MS/60000, cb:S.cb };
    };
    for (const L of [20, 30, 40, 60, 80, 99]) for (const w of W0){ const rs = []; for (let t=0;t<6;t++) rs.push(raid(L, found(L, 8), w));
      const avg = k=>+(rs.reduce((a, x)=>a + x[k], 0)/rs.length).toFixed(2), o = { L, cb:p.combatLevel, raidCb:rs[0].cb, wardens:w, lost:rs.filter(x=>x.died).length + '/' + rs.length, food:avg('food'), lifeTaken:avg('taken'), wardensLost:avg('lostW'), min:avg('min') };
      out.push(o); console.log('SIM ' + JSON.stringify(o)); }
    return out; }, [ADJ, W0]);
  console.log('DONE ' + r.length);
};
