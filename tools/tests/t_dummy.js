// RS-333: the archery butts are training dummies - walk into one to hit it in melee, shoot or cast at it from a distance;
// every try is tallied by style (hits, average, best) against the armour you pick; nothing is spent and no xp given
module.exports = async page=>{
  const r = await page.evaluate(async ()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{}; o3Pref = false; v3Pref = false;   /* (no 3D town: entering towns is slow in software rendering) */
    let bx = -1, by = -1;
    for (const t of townList()){ G.gameMode = 0; G.owPos = { x:t.x, y:t.y }; enterVillage(); setUi('playing');
      for (let x=0;x<COLS && bx<0;x++) for (let y=0;y<ROWS;y++) if (G.villageDeco[x] && G.villageDeco[x][y]==='target'){ bx = x; by = y; break; }
      if (bx >= 0) break; }
    if (bx < 0) return { none:true };
    const out = { bx, by }, P = G.player, xp0 = JSON.stringify(P.skills || {}), arrows0 = P.arrows;
    // stand beside it and walk into it: a melee blow
    let side = null; for (const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]) if (v3Walkable(bx+a, by+b)){ side = [bx+a, by+b]; break; }
    P.x = side[0]; P.y = side[1];
    for (let i=0;i<30;i++){ G._dumAt = 0; townBumpWall(bx, by); }
    out.melee = Object.assign({}, dummyRec().melee);
    // from a distance with a bow: a shot (nothing spent)
    const bow = rsMakeBow(0, false); G.gear.ranged = bow; G.gear.ammo = rsMakeAmmo(0); P.arrows = 50; P.rangedMode = 'bow'; P.x = bx + (side[0]-bx)*3; P.y = by + (side[1]-by)*3;
    out.far = Math.max(Math.abs(P.x-bx), Math.abs(P.y-by)); out.bowReady = rangedPick(); out.bowWhy = { bow:!!bow, range:bow.range, ammo:rangedAmmoN(bow) };
    for (let i=0;i<30;i++){ G._dumAt = 0; dummyClick(bx, by); }
    out.ranged = Object.assign({}, dummyRec().ranged); out.arrowsKept = P.arrows===50;
    // heavier armour: fewer hits
    dummyReset(); P.x = side[0]; P.y = side[1]; G.dummyArm = 'light'; for (let i=0;i<200;i++){ G._dumAt = 0; dummyStrike(bx, by, 'melee'); } const lt = dummyRec().melee.hit;
    dummyReset(); G.dummyArm = 'heavy'; for (let i=0;i<200;i++){ G._dumAt = 0; dummyStrike(bx, by, 'melee'); } const hv = dummyRec().melee.hit; out.light = lt; out.heavy = hv;
    out.noXp = JSON.stringify(P.skills || {})===xp0;
    G.gamesAt = 'range'; setUi('games'); const h = document.getElementById('overlay').innerText; out.panel = /TRAINING RANGE/.test(h) && /Melee/.test(h) && /Bow/.test(h) && /Magic/.test(h) && /Heavy armour/.test(h);
    setUi('playing');
    return out; });
  const A = (c, m)=>{ if (!c) throw new Error(m+' :: '+JSON.stringify(r)); };
  A(!r.none, 'the town has butts');
  A(r.melee.n===30 && r.melee.hit > 0 && r.melee.sum > 0, 'walking into a dummy hits it in melee, and the blows are tallied');
  A(r.far >= 2 && r.bowReady==='bow' && r.ranged.n===30 && r.ranged.hit > 0, 'clicking it from a distance with a bow shoots it');
  A(r.arrowsKept, 'no arrows are spent');
  A(r.light > r.heavy, 'heavier armour turns more blows');
  A(r.noXp, 'no xp is given');
  A(r.panel, 'the range screen shows the tally by style and the armour choice');
  console.log('dummy ok', JSON.stringify(r));
};
