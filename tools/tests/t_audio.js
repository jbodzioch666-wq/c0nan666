module.exports = async page=>{
  const wait = ms=>page.waitForTimeout(ms);
  await wait(800);
  const t0 = await page.evaluate(()=>({ ctx:!!AUD.ctx, state:AUD.ctx && AUD.ctx.state, cur:AUD.cur && AUD.cur.id }));
  console.log('title', JSON.stringify(t0)); if (t0.cur) throw new Error('no music on the title screen (RS-212)');
  const r = await page.evaluate(async ()=>{
    const W = ()=>({ id:audWantTrack() }), out = {}, A = (c, msg)=>{ if (!c) throw new Error('assert: '+msg); }, frames = async n=>{ for (let i=0;i<n;i++){ renderGame(); await new Promise(r=>setTimeout(r, 40)); } };
    goToCharCreate(); ccBegin(); setUi('playing'); o3Pref = false; v3Pref = false;
    const p = G.player; p.clock = p.turnCount = 60; G.gameMode = 0; await frames(6);
    out.land = W().id; A(/^land:/.test(W().id) && !W().id.endsWith(':night'), 'region track');
    p.clock = p.turnCount = DAY_LENGTH + 5; await frames(4); out.night = W().id; A(W().id.endsWith(':night'), 'night version');
    p.clock = p.turnCount = DAY_LENGTH + 60;
    const t = townList()[0]; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing'); await frames(4); out.town = W().id; A(W().id.startsWith('town'), 'town track');
    enterInterior('tavern'); await frames(3); A(W().id==='interior', 'interior'); A(Math.abs(audReverbFor() - 0.05) < 1e-9, 'dry indoors'); exitInterior();
    G.owPos = { x:G.ow.spawnPos.x, y:G.ow.spawnPos.y }; G.gameMode = 0; randomEncounter(false); setUi('playing'); await frames(3); out.fight = W().id; A(W().id==='combat', 'combat music');
    G.mon[0].namedElite = true; G.mon[0].nm = 'Gorrak the Unbroken'; await frames(3); out.boss = W().id; A(W().id==='boss:Gorrak the Unbroken', 'boss theme');
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
    /* RS-188: a step in sand is a soft hush with no click - nothing high-passed, nothing up near the old snap, and it swells in rather than starting at full */
    { const keepS = audSurface, mk = AUD.ctx.createBiquadFilter.bind(AUD.ctx), fl = [], keepR = AudioParam.prototype.linearRampToValueAtTime; let rises = 0;
      AUD.ctx.createBiquadFilter = ()=>{ const f = mk(); fl.push(f); return f; }; AudioParam.prototype.linearRampToValueAtTime = function(){ rises++; return keepR.apply(this, arguments); };
      const keepC = G.gear.chest; audSurface = ()=>'sand'; G.gear.chest = newItem(); AUD.stepAt = 0; audStep(); G.gear.chest = keepC;
      audSurface = keepS; AUD.ctx.createBiquadFilter = mk; AudioParam.prototype.linearRampToValueAtTime = keepR;
      out.sand = { n:fl.length, high:fl.some(f=>f.type==='highpass'), top:Math.max(...fl.map(f=>f.frequency.value)), rises };
      A(out.sand.n >= 3 && !out.sand.high && out.sand.top < 2300 && out.sand.rises >= 3, 'sand steps are a soft hush, not a snap: '+JSON.stringify(out.sand)); }
    audPage(); audCoins();
    // ambience follows the weather
    // RS-124: rain is six rendered loops, picked by weather, place and how long it has rained
    G.weather = 'storm'; G.ui = 'playing'; for (let i=0;i<150 && !(AUD.amb['rain:storm'] && AUD.amb['rain:storm'].lv > 0.05);i++) await frames(1);
    out.rain = +(AUD.amb['rain:storm'] ? AUD.amb['rain:storm'].lv : 0).toFixed(3); A(out.rain > 0.05, 'the storm is heard: '+out.rain); A(!AUD.amb.rain, 'the old hiss is gone');
    A(AUD.rainBuf.storm.duration > 15 && AUD.rainBuf.storm.getChannelData(0).some(v=>Math.abs(v) > 0.05), 'the storm loop has sound in it');
    const mix = ()=>{ const m = rainMix(); return Object.keys(m).filter(k=>m[k] > 0).sort().join('+'); }, top = ()=>{ const m = rainMix(); return Object.keys(m).sort((a,b)=>m[b]-m[a])[0]; };
    const was = { t:G.ow.map[G.owPos.x][G.owPos.y] }; G.ow.map[G.owPos.x][G.owPos.y] = OW_GRASS;
    G.weather = 'rain'; AUD.wetT = 0; out.mixStart = mix(); A(top()==='drizzle', 'drizzle as the rain sets in: '+out.mixStart);
    AUD.wetT = 120; out.mixLater = mix(); A(out.mixLater==='steady', 'then steady rain: '+out.mixLater);
    G.ow.map[G.owPos.x][G.owPos.y] = OW_FOREST; out.mixForest = mix(); A(top()==='leaves', 'rain on the leaves in a forest: '+out.mixForest);
    G.weather = 'storm'; out.mixForestStorm = mix(); A(top()==='storm' && rainMix().leaves > 0, 'a downpour over the leaves: '+out.mixForestStorm);
    G.ow.map[G.owPos.x][G.owPos.y] = was.t;
    G.weather = 'clear'; A(mix()==='', 'no rain when it is dry');
    G.weather = 'rain'; G.interior = { key:'tavern' }; A(mix()==='roof', 'rain on the roof indoors'); G.interior = null;
    G.gameMode = 1; G.depth = 1; G.siteKind = 'crypt'; A(mix()==='cave', 'rain echoing into the first floor of a dungeon');
    G.depth = 3; A(mix()==='', 'no rain heard deep down'); G.gameMode = 0; G.depth = 1;
    // lightning and thunder come together: a strike lights the sky and schedules its own thunder, later the farther it is
    G.weather = 'storm'; const calls = [], realT = rainThunder; rainThunder = (...a)=>calls.push(a); STORM.flash = 0; stormStrike(); rainThunder = realT;
    A(STORM.flash > 0.2 && STORM.last, 'a strike flashes'); A(calls.length===1 && calls[0][0] > AUD.ctx.currentTime + 0.1, 'and its thunder follows: '+JSON.stringify(calls));
    A(calls[0][0] - AUD.ctx.currentTime < 3 && (STORM.last.dist < 0.4)===calls[0][3], 'sooner and with a crack when it is near');
    let f = STORM.flash; for (let i=0;i<10;i++) f = stormTick(0.05); A(f < STORM.flash + 1e-9 && f < 0.3, 'the flash fades');
    for (let i=0;i<40 && STORM.flash > 0;i++) stormTick(0.05); A(STORM.flash===0, 'and is gone');
    STORM.seenAt = performance.now(); out.strike = STORM.last;
    AUD.wetT = 0; G.weather = 'storm';
    G.weather = 'clear';
    // the music player
    A(!AUD.cur, 'no background tune ever plays (RS-212)'); A(!document.getElementById('overlay').innerHTML.includes('music player'), 'no music player');
    // volume and the sound switch
    setUi('settings'); A(document.getElementById('overlay').innerHTML.includes('fanfares') && !document.getElementById('overlay').innerHTML.includes('music player'), 'fanfare slider, no music player'); setSetting('vol.music', 0.3); A(Math.abs(_gains.music.gain.value - 0.3) < 1e-6, 'music volume'); setUi('playing');
    toggleSound(); audFrame(); await new Promise(r=>setTimeout(r, 200)); out.offState = AUD.ctx.state; toggleSound(); audFrame();
    out.ctx = AUD.ctx.state;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await wait(1500);
  const r2 = await page.evaluate(()=>({ old:(AUD.old||[]).length, step:AUD.cur && AUD.cur.step, state:AUD.ctx.state, ct:AUD.ctx.currentTime, t:AUD.cur && AUD.cur.t, cur:AUD.cur && AUD.cur.id, on:isSoundOn(), go:AUD.userGo, timer:!!AUD.timer }));
  console.log('sched', JSON.stringify(r2)); if (r2.cur) throw new Error('no music plays');
};
