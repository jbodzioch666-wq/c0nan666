module.exports = async page=>{
  const wait = ms=>page.waitForTimeout(ms);
  await wait(800);
  const t0 = await page.evaluate(()=>({ ctx:!!AUD.ctx, state:AUD.ctx && AUD.ctx.state, cur:AUD.cur && AUD.cur.id }));
  console.log('title', JSON.stringify(t0)); if (t0.cur!=='title') throw new Error('title theme');
  const r = await page.evaluate(async ()=>{
    const out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false; v3Pref = false;
    const p = G.player; p.clock = p.turnCount = 60; G.gameMode = 0; await frames(6);
    out.land = AUD.cur.id; A(/^land:/.test(AUD.cur.id) && !AUD.cur.id.endsWith(':night'), 'region track');
    p.clock = p.turnCount = DAY_LENGTH + 5; await frames(4); out.night = AUD.cur.id; A(AUD.cur.id.endsWith(':night'), 'night version');
    p.clock = p.turnCount = DAY_LENGTH + 60;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await frames(4); out.town = AUD.cur.id; A(AUD.cur.id.startsWith('town'), 'town track');
    enterInterior('tavern'); await frames(3); A(AUD.cur.id==='interior', 'interior'); A(Math.abs(audReverbFor() - 0.05) < 1e-9, 'dry indoors'); exitInterior();
    G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; G.gameMode = 0; randomEncounter(false); setUi('playing'); await frames(3); out.fight = AUD.cur.id; A(AUD.cur.id==='combat', 'combat music');
    G.mon[0].namedElite = true; G.mon[0].nm = 'Gorrak the Unbroken'; await frames(3); out.boss = AUD.cur.id; A(AUD.cur.id==='boss:Gorrak the Unbroken', 'boss theme');
    G.mon = []; G.gameMode = 1; out.dungeon = audWantTrack(); A(out.dungeon==='dungeon' || out.dungeon.startsWith('site:'), 'dungeon track'); A(audReverbFor() > 0.4, 'caves echo');
    G.gameMode = 0;
    // every kind of track composes into sane notes
    const ids = ['title','town','town:night','interior','house','dungeon','combat','arena','boss:Test','site:castle','site:crypt','site:mine','site:temple','site:lair'].concat(Object.values(AUD_LAND).map(l=>'land:'+l), Object.values(AUD_LAND).map(l=>'land:'+l+':night'));
    for (const id of ids){ const tr = audCompose(id); A(tr.total > 0 && tr.ev.length===tr.total, 'steps '+id); let n = 0; for (const e of tr.ev) for (const x of e){ n++; if (!['kick','snare','hat','tamb'].includes(x.v)) for (const m of x.m) A(isFinite(m) && m > 0 && m < 110, 'midi '+id); } A(n > 20, 'notes '+id); }
    A(JSON.stringify(audCompose('land:grass').ev)===JSON.stringify(audCompose('land:grass').ev), 'same seed, same tune');
    out.nTracks = ids.length;
    // the stingers and sounds play without trouble
    for (const k of ['quest','rare','ninetynine','boss','discover']) audStinger(k);
    for (const k of ['woodcutting','mining','fishing','reel','foraging','cooking','smith','fire','archaeology']) audSkill(k);
    for (const k of ['door','chest','portal','trap']) audEnv(k);
    G.gear.weapon = rsMakeWeapon(1, 0); audWeaponHit(); audWeaponMiss(); out.wk = audWeaponKind();
    for (const it of [rsMakeArmour('metal', 1, 'chest'), rsMakeWeapon(1, 0), genPotion(3), null]) audPickup(it);
    for (const nm of ['red dragon','giant snake','wolf','skeleton','giant spider','green slime','harpy','stone golem','demon','goblin']){ audMonster({ nm }, 'attack'); audMonster({ nm }, 'die'); }
    out.voices = ['red dragon','wolf','skeleton','goblin'].map(nm=>audMonVoiceKind({ nm }));
    G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; for (let i=0;i<4;i++){ AUD.stepAt = 0; audStep(); } out.surface = audSurface();
    audPage(); audCoins();
    // ambience follows the weather
    G.weather = 'storm'; G.ui = 'playing'; await frames(20); out.rain = +(AUD.amb.rain ? AUD.amb.rain.lv : 0).toFixed(3); A(out.rain > 0.05, 'rain');
    G.weather = 'clear';
    // the music player
    G.jukeBack = 'playing'; setUi('jukebox'); A(document.getElementById('overlay').innerHTML.includes('MUSIC PLAYER') && audUnlocked().length >= 6, 'music player'); out.unlocked = audUnlocked().map(audTrackName);
    audPick(0); A(AUD.force===audUnlocked()[0], 'picked'); await frames(2); A(AUD.cur.id===AUD.force, 'playing the pick'); AUD.force = null; setUi('playing');
    // volume and the sound switch
    setUi('settings'); A(document.getElementById('overlay').innerHTML.includes('vol.music'), 'music slider'); setSetting('vol.music', 0.3); A(Math.abs(_gains.music.gain.value - 0.3) < 1e-6, 'music volume'); setUi('playing');
    toggleSound(); audFrame(); await new Promise(r=>setTimeout(r, 200)); out.offState = AUD.ctx.state; toggleSound(); audFrame();
    out.ctx = AUD.ctx.state;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  for (let i=0;i<12;i++){ await wait(500); if (await page.evaluate(()=>AUD.cur && AUD.cur.step > 0)) break; }
  const r2 = await page.evaluate(()=>({ old:(AUD.old||[]).length, step:AUD.cur && AUD.cur.step, state:AUD.ctx.state, ct:AUD.ctx.currentTime, t:AUD.cur && AUD.cur.t, cur:AUD.cur && AUD.cur.id, on:isSoundOn(), go:AUD.userGo, timer:!!AUD.timer }));
  console.log('sched', JSON.stringify(r2)); if (!(r2.step > 0)) throw new Error('the sequencer runs');
};
