// RS-150: shots, arrows and spells don't slip past a wall's corner, and a line is only clear if it is clear from both ends
module.exports = async page=>{
  const r = await page.evaluate(()=>{ goToCharCreate(); ccBegin();
    const keep = G.map, kc = COLS, kr = ROWS; COLS = 40; ROWS = 40; G.map = Array.from({ length:COLS }, ()=>Array(ROWS).fill(T_FLOOR));
    const W = (x, y)=>{ G.map[x][y] = T_WALL; }, out = {};
    out.open = shotClear(2, 2, 8, 5);
    // two walls meeting at a corner, with the shot squeezing diagonally between them
    W(11, 10); W(10, 11);
    out.squeezeSight = hasLineOfSight(10, 10, 12, 12); out.squeeze = shotClear(10, 10, 12, 12); out.squeezeBack = shotClear(12, 12, 10, 10);
    // a solid wall between
    for (let y=0; y<ROWS; y++) W(20, y); out.wall = shotClear(18, 5, 23, 5);
    // every pair either way round gives the same answer
    let asym = 0; for (let k=0; k<400; k++){ const a = [1+Math.floor(Math.random()*28), 1+Math.floor(Math.random()*20)], b = [1+Math.floor(Math.random()*28), 1+Math.floor(Math.random()*20)];
      if (Math.random()<0.3) W(a[0]+1, a[1]); if (shotClear(a[0], a[1], b[0], b[1]) !== shotClear(b[0], b[1], a[0], a[1])) asym++; }
    out.asym = asym; out.style = rsMonStyle({ nm:'cult acolyte' });
    G.map = keep; COLS = kc; ROWS = kr; return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.open, 'an open line is clear');
  A(r.squeeze===false && r.squeezeBack===false, 'a shot cannot squeeze past a wall corner');
  A(r.wall===false, 'a wall stops a shot');
  A(r.asym===0, 'a shot line is the same both ways');
  A(r.style==='magic', 'a cult acolyte is a caster');
};
