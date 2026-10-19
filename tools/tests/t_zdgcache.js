// (probe, not in ALL) does the browser's own shader cache help a second visit? Loads a dungeon floor (t_zdgload's measure), reloads the
// page in the same browser, and loads it again. ZSAVE a save
const load = require('./t_zdgload.js');
module.exports = async page=>{
  page.setDefaultTimeout(0);
  console.log('--- first visit'); await load(page);
  await page.reload(); await page.waitForTimeout(2500);
  console.log('--- second visit (same browser, page reloaded)'); await load(page);
};
