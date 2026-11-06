// RS-454: the D&D ability score improvements and feats are gone - no screens, no feat effects - and an old save still carrying feats, a
// pending improvement or Lucky's rerolls loads and plays without them
module.exports = async page=>{
  const r = await page.evaluate(()=>{
    goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing');
    const gone = ['hasFeat','buildASI','buildFeatPick','featChoose','asiConfirm','availableFeats','featBonusI'].filter(f=>typeof window[f]==='function');
    const p = G.player, hp0 = effMaxHp(); p.feats = ['tough','lucky','prodigy']; p.pendingASI = 2; p.luckyCharges = 3;
    const hp1 = effMaxHp(); let err = null; try{ setUi('asi'); setUi('featpick'); setUi('playing'); p.hp = 1; fullyRestPlayer(); renderGame(); }catch(e){ err = String(e); }
    return { gone, hp0, hp1, err, healed:p.hp===effMaxHp() }; });
  console.log(JSON.stringify(r));
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m+' '+JSON.stringify(r)); };
  A(!r.gone.length, 'the feat and improvement code is gone');
  A(r.hp1===r.hp0, 'an old save\'s feats do nothing (Tough gave +20 life)');
  A(!r.err && r.healed, 'and it plays on without error - a rest still heals');
};
