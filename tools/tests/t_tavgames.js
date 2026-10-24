// RS-391: the tavern's games are real games. Dice poker (hold and reroll, ranked hands, the dealer plays its own hand),
// twenty-one (a shuffled deck, aces one or eleven, hit, stand and double, the dealer to seventeen), the wheel (red, black or
// the crown, spun and landed), and darts (aimed at a standard board, scored by where the dart lands)
module.exports = async page=>{
  const S = '/tmp/claude-0/-home-user-c0nan666/3bb54428-39f0-502a-8d60-2c5df0a710a2/scratchpad';
  const r = await page.evaluate(async ()=>{
    o3Pref = false; v3Pref = false; goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame = ()=>{};
    const p = G.player, out = {}; p.gold = 100000; G.gbBet = 100;
    // -- dice poker: the hands rank right, the whole hand settles once, money adds up
    const R = d=>gbPokerRank(d)[0]; out.ranks = [R([3,3,3,3,3]), R([2,2,2,2,5]), R([4,4,4,1,1]), R([2,3,4,5,6]), R([1,2,3,4,5]), R([6,6,6,2,1]), R([5,5,2,2,3]), R([1,1,2,3,6]), R([1,2,4,5,6])];
    out.tiebreak = gbCmp(gbPokerRank([6,6,2,3,4]), gbPokerRank([5,5,2,3,4]))===1 && gbCmp(gbPokerRank([2,2,2,6,6]), gbPokerRank([3,3,3,1,1]))===-1;
    out.dealerKeeps = gbDealerHold([4,4,1,2,6]).join()==='true,true,false,false,false' && gbDealerHold([2,3,4,5,5]).filter(Boolean).length >= 2;
    setUi('gamble'); let g0 = p.gold; gbPokerStart(); out.paid = g0 - p.gold; out.stage = gbS().poker.stage; out.busy = gbBusy(); gbLeave(); out.stayed = G.ui==='gamble';
    const before = gbS().poker.mine.slice(); gbPokerHold(0); gbPokerHold(1); gbPokerRoll(false); const P = gbS().poker; out.heldKept = P.mine[0]===before[0] && P.mine[1]===before[1]; out.pokerDone = P.stage==='done';
    const w = gbCmp(gbPokerRank(P.mine), gbPokerRank(P.theirs)); out.pokerMoney = p.gold - g0===(w > 0 ? 100 : w===0 ? 0 : -100);
    out.pokerUi = !!document.querySelector('#gbMine .gbdie') && document.querySelectorAll('#gbMine .gbdie').length===5;
    // -- twenty-one
    out.vals = [gbBjVal([[0,0],[12,0]]), gbBjVal([[0,0],[0,1],[8,0]]), gbBjVal([[9,0],[5,1],[7,2]]), gbBjVal([[0,0],[5,0],[9,1]])];
    gbS().game = 'bj'; let n = 0, wins = 0, losses = 0, pushes = 0, money = true;
    for (let k=0;k<40;k++){ g0 = p.gold; gbBjStart(); const B = gbS().bj; if (B.stage==='play'){ if (gbBjVal(B.mine) < 15) gbBjHit(); if (B.stage==='play') gbBjStand(); }
      const d = p.gold - g0, mine = gbBjVal(B.mine), theirs = gbBjVal(B.theirs); n++; if (d > 0) wins++; else if (d < 0) losses++; else pushes++;
      if (mine <= 21 && !(mine===21 && B.mine.length===2) && !(theirs===21 && B.theirs.length===2) && theirs < 17) money = false;   /* (the dealer always reaches seventeen) */ }
    out.bj = { n, wins, losses, pushes, dealer17:money };
    out.bjUi = (()=>{ gbBjStart(); renderOverlay(); const c = document.querySelectorAll('.gbcard').length, down = document.querySelectorAll('.gbcard.down').length, st = gbS().bj.stage; if (st==='play') gbBjStand(); return { c, down, st }; })();
    // -- the wheel
    gbS().game = 'wheel'; renderOverlay(); const tallies = { red:0, black:0, crown:0 }; let wheelMoney = true;
    for (let k=0;k<60;k++){ g0 = p.gold; const pick = ['red','black','crown'][k % 3]; gbWheelSpin(pick); const W = gbS().wheel; out.spinBusy = out.spinBusy || gbBusy(); gbWheelLand(); const col = gbWheelCol(W.land); tallies[col]++;
      const want = col===pick ? (col==='crown' ? 2900 : 100) : -100; if (p.gold - g0!==want) wheelMoney = false; }
    out.wheel = { tallies, wheelMoney, canvas:!!document.getElementById('gbWheel') };
    // -- darts
    out.score = [dartScore(0, 0)[0], dartScore(0, 0.06)[0], dartScore(0, -0.605)[0], dartScore(0, -0.97)[0], dartScore(0, -0.4)[0], dartScore(0, -1.2)[0], dartScore(0.6, 0)[0], dartScore(0, 0.4)[0]];
    G.gamesAt = 'tavern'; setUi('games'); renderOverlay(); g0 = p.gold; mgDarts(); out.dartPaid = g0 - p.gold; out.board = !!document.getElementById('dartBoard');
    for (let i=0;i<3;i++) dartsThrow(0, -0.6); out.mineN = G.darts.mine.length; out.dartStage = G.darts.stage; out.dartsBusy = dartsBusy();
    out.sway = [+dartSway().toFixed(3)];
    for (let i=0;i<100 && G.darts.stage!=='done';i++) await new Promise(r=>setTimeout(r, 100)); out.theirsN = G.darts.theirs.length; out.dartDone = G.darts.stage;
    const a = G.darts.mine.reduce((s, d)=>s + d.sc, 0), b = G.darts.theirs.reduce((s, d)=>s + d.sc, 0); out.dartMoney = p.gold - g0===(a > b ? 10 : -10);
    return out; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(r.ranks.join()==='8,7,6,5,4,3,2,1,0' && r.tiebreak, 'dice poker hands rank right, ties broken by the dice');
  A(r.dealerKeeps, 'the dealer keeps its pairs and its straights');
  A(r.paid===100 && r.stage==='hold' && r.busy && r.stayed, 'a hand of dice poker takes the stake, waits for your hold, and won\'t be walked out of');
  A(r.heldKept && r.pokerDone && r.pokerMoney && r.pokerUi, 'held dice stay, the rest are rolled, and the hand settles once');
  A(r.vals.join()==='21,21,24,17', 'twenty-one counts aces as one or eleven');
  A(r.bj.n===40 && r.bj.wins > 0 && r.bj.losses > 0 && r.bj.dealer17, 'twenty-one plays out: wins and losses, and the dealer always draws to seventeen: '+JSON.stringify(r.bj));
  A(r.bjUi.c >= 4 && (r.bjUi.st!=='play' || r.bjUi.down===1), 'the cards are on the table, the dealer\'s second face down while you play');
  A(r.wheel.wheelMoney && r.wheel.canvas && r.spinBusy && r.wheel.tallies.red + r.wheel.tallies.black + r.wheel.tallies.crown===60, 'the wheel pays double on its colour and thirty times on the crown');
  A(r.score.join()==='50,25,60,40,20,0,18,3', 'the dartboard scores like a real one: '+r.score);
  A(r.dartPaid===10 && r.board && r.mineN===3 && r.dartStage==='theirs' && r.dartsBusy, 'you throw three darts at the board');
  A(r.theirsN===3 && r.dartDone==='done' && r.dartMoney, 'then the local throws three, and the better total wins');
};
