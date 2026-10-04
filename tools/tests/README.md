# Depthcrawl tests

These tests open `depthcrawl.html` in Chromium through Playwright and play through each system. Each `t_<name>.js` exports `async (page) => {}` and throws if something is wrong. The runner also fails a test if the page logs any error.

## Setup (once)

```
cd tools/tests
npm install
npx playwright install chromium
```

## Running

```
node tools/tests/run.js              # every test
node tools/tests/run.js town eco     # just these
node tools/tests/run.js --headed     # in a visible window: the GPU draws the 3D, fastest on a desktop
node tools/tests/run.js --soft       # software WebGL, for machines with no GPU (slow)
node tools/tests/run.js --timeout=40 # minutes allowed per test (default 20)
```

Screenshots go to `tools/tests/shots/`.

| test | covers |
|---|---|
| boot | the page loads and a character starts |
| iso | isometric 3D everywhere: no key or saved setting switches to a flat view |
| xpt | tick skills in the skills menu to choose what the XP window shows |
| rooms | building interiors: floorboards and flagstones with depth, panelled walls, rugs, daylight through the windows |
| door | walking through a door: swings open, camera leans in, room appears, eases out; and back out with the door shutting |
| diag | diagonal steps: keys, numpad, corners, click paths, no diagonal strikes |
| touch | on an emulated phone: tap to walk, long-press menu, pinch zoom, map drag, the d-pad, the hotbar |
| bal | balance: monsters bite harder, the fixed-strength lair boss, coin trim, the smith's reinforcing |
| gen | world generation: broad mountain ranges with nothing in them but lairs, an open start, nothing out of reach, old saves keep their world |
| grave | the gravestone card: dismiss it, it stays dismissed after a reload, F6 shows it again |
| clock | real-time day and night: 20 minutes of day, 10 of night, steps don't move it, it pauses on menus |
| tasks | town NPCs: the slayer master, TzHaar and their tasks |
| soak | ten dungeon floors of fighting at high level |
| pace | fights keep a visible beat, a bow or spell stops in range, the bestiary box shows every creature |
| fpdres | the dungeon view's resolution steps between a few fixed sizes instead of resizing every half second |
| map | world map, zoom, map tools, 3D landmarks |
| wev | world events and festivals |
| wg | world generation |
| sail | sailing and islands |
| big | house and Construction, Archaeology, Necromancy |
| town | town tiers, temple, guilds, arena, games, gambling, townsfolk, upgrades, harbour |
| folk | townsfolk step out of your way without stopping you to chat, and walk in real time |
| eco | shop prices, bank, waypoint fees, property |
| gfx | post-processing, colour grades, seasons, 3D land, towns and dungeons |
| shore | 3D shorelines: land stays above the waves, water tiles stay under water |
| quest | journal, story quests, diaries, clue trails |
| audio | music tracks, the sequencer, stingers |

The worlds are random, so `wg` can fail now and then. Run it again before you start digging.
