// RS-152: exporting a save works on the claude.ai page (through the viewer's save prompt) and everywhere else (a plain download)
module.exports = async page=>{
  const A = (c, m)=>{ if (!c) throw new Error('assert: '+m); };
  await page.evaluate(()=>{ goToCharCreate(); ccBegin(); if (G.ui==='worldPreview') confirmWorldPreview(); setUi('playing'); saveCurrentGame(); });
  // a plain page: the browser download
  const [dl] = await Promise.all([ page.waitForEvent('download', { timeout:10000 }), page.evaluate(()=>exportSave()) ]);
  A(/^depthcrawl-.*\.json$/.test(dl.suggestedFilename()), 'a plain download: '+dl.suggestedFilename());
  // on the claude.ai page: the downloads capability's save prompt gets the file
  const r = await page.evaluate(async ()=>{
    let got = null, links = 0; const click = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function(){ links++; };
    window.claude = { use: async n=>n==='downloads' ? { save: async q=>{ got = q; return { status:'saved' }; } } : null };
    exportSave(); for (let i=0; i<20 && !got; i++) await new Promise(r=>setTimeout(r, 50));
    const ok = got ? JSON.parse(got.data) : null;
    // the viewer says no: nothing saved, no fallback download
    window.claude = { use: async ()=>({ save: async ()=>{ throw { code:'declined', message:'no' }; } }) };
    exportSave(); await new Promise(r=>setTimeout(r, 300));
    // a view where saves can't run: falls back to the plain link
    window.claude = { use: async ()=>null }; const before = links; exportSave(); await new Promise(r=>setTimeout(r, 300));
    HTMLAnchorElement.prototype.click = click; delete window.claude;
    return { file:got && got.filename, save:!!(ok && ok.depthcrawlSave && ok.data && ok.data.player), declinedLinks:before, fallback:links - before };
  });
  console.log(JSON.stringify(r));
  A(/\.json$/.test(r.file||'') && r.save, 'the save prompt gets the save file: '+JSON.stringify(r));
  A(r.declinedLinks===0 && r.fallback===1, 'a declined prompt saves nothing; an unusable one falls back to the link: '+JSON.stringify(r));
};
