# Depthcrawl

A RuneScape-flavoured roguelike in one file, `depthcrawl.html`. It uses three.js 0.149.0 from a CDN, and everything else is inline. The other files are:

- `CHANGELOG.md`: player-facing patch notes, newest first.
- `IDEAS.md`: the backlog.
- `tools/build-itch.sh`: builds the itch.io zip into `dist/`, which is gitignored.
- `tools/itch-art/make.sh`: makes the itch.io page art (cover, banner, page background, embed background) from in-game scenes into `dist/itch-art/out`. Slow: about half an hour of software rendering. Each run uses a fresh random world, so check the shots.
- `tools/tests/`: Playwright browser tests. See `tools/tests/README.md`.
- `tools/sim/`: balance simulators that drive the game's own code in a browser (`node tools/sim/run.js --soft combat gather produce economy gear world`, same harness and `THREE_JS` as the tests; `world` compares the sizes' land, towns, sites, walking distances, roamers and how crowded the sites are). Run them before and after touching xp rates, drops, prices or world layout, and quote the numbers in the changelog.

## Model choice

The user wants to know when a request deserves Fable 5.1 instead of the default Opus 5.5. At the start of any request, say so in one line if it does, before starting the work. Fable fits:
- hard bugs whose cause is unknown, especially ones that span distant systems (freezes, save loading, rendering);
- system rewrites, such as world generation, combat, save format or a renderer performance pass;
- balance passes across many skills, using `tools/sim`;
- audits of many releases before a merge to `main`.
Ordinary feature releases and small edits stay on Opus. If you are already running as Fable on a request that doesn't need it, say that too.

## Branches

- Work **only** on `claude/depthcrawl-runescape`. Commit and push there, even if the session names a different branch.
- Leave `main`, `claude/depthcrawl-modern-graphics-qo0xgf` and pull request #1 alone.
- Update `main` only when the user asks. It is then a fast-forward to the runescape branch.

## Every change ships as a release

1. Make the change. Add or extend a test in `tools/tests/` that covers it.
2. Run the tests for the area you touched, plus `boot` (see Testing below).
3. Run the checks:
   - Syntax: pull the largest `<script>` block out to a temp file and run `node --check` on it.
   - ASCII: `LC_ALL=C grep -c -P '[^\x00-\x7F]' depthcrawl.html` must print 0. Use HTML entities (`&times;`, `&middot;`) instead of raw symbols. `CHANGELOG.md` may contain non-ASCII.
4. Bump `const GAME_VERSION = 'rs-NNN';` in `depthcrawl.html` by one.
5. Add a `## RS-NNN - Title` entry at the top of `CHANGELOG.md`. Write it for players: what changed and why, in short bold-led bullets.
6. Commit with a message starting `RS-NNN: ...`, then `git push -u origin claude/depthcrawl-runescape`.
7. Run `bash tools/build-itch.sh`. It writes `dist/depthcrawl-rs-NNN-itch.zip`.
8. Publish `depthcrawl.html` to the existing artifact https://claude.ai/artifact/HbAcDu7KguzBDBaXMuopFz with a short label. Always use that URL; never create a new artifact. The artifact declares the `downloads` capability (RS-152, for the export-save prompt); leave `capabilities` out when publishing so it stays.
9. Post the playable link https://claude.ai/artifact/HbAcDu7KguzBDBaXMuopFz in the reply, so the user can play on their phone without downloading anything. Also send the itch zip as an attachment. Don't send `depthcrawl.html` as a download.
10. In the reply, always list what each new patch added: one short bullet per change, under its `RS-NNN` heading, for every release since the last reply.

## Editing the game

- The file is large: about 35k lines, and much of the code is dense one-line functions. Use Grep to find things, then read only nearby lines.
- For multi-spot changes, use a Python script that replaces exact strings and asserts each match count, so a missed match fails loudly.
- Sculpted models are cached in IndexedDB between sessions (RS-500, `M3D_SCULPT_VER` in `depthcrawl.html`). **Bump `M3D_SCULPT_VER` whenever any sculpted shape changes** (the SDF kit, `SK3_PARTS`, any `m3dSculpt` build), or players keep seeing the old shape.
- Never put a `//` comment in the middle of a one-line function. It comments out the rest of the line. Use `/* */` there.
- Saves must keep loading:
  - Default any new save field when it is missing.
  - World-generation changes don't need to keep existing worlds as they were: the player can make a new world and keep their character. Old saves must still load without errors, but they may regenerate on the new generator. Bump `OW_GEN_VER` when the generator changes.
- Some useful entry points:

  | Area | Functions |
  |---|---|
  | Screens | `setUi(name)` |
  | Rendering | `renderGame()`, `renderOverlay()` |
  | Saving and loading | `saveCurrentGame()`, `loadGame(id)` |
  | Logging | `logMsg(text, kind)`, `notify(text, kind, sfx)` |
  | Skills | `skGainXP` (all xp scaled by `XP_RATE`), `skLvl`, `rsLvl` |
  | Levels | Everything is a combat level, 3 to 126 (RS-240): `cbLvl()`, `floorCb(d)`, `lootLevel()`, `clampCb`. The 20 bestiary rows are archetypes (`e.cb`, `archOf(cb)`, `monScaleCb`); `cbT()`/`tierOfCb` give the old 1-20 tier as a smooth number for reward and price curves. `p.level` is only kept for old saves |

## Testing

```
cd tools/tests && npm install            # once per container: playwright + a local three.js
node tools/tests/run.js --soft grave boot   # named tests; --soft = software WebGL (no GPU in the cloud)
```

- Test names come from the `ALL` list in `tools/tests/run.js`. Add new tests to that list and to the README table.
- The full suite takes about an hour with `--soft`. Run it only for broad changes, and run it in the background with a long timeout.
- `wev`, `town`, `touch` and `wg` depend on the random world and sometimes fail. Rerun once before digging in. `rs651` and `rs652` (the barrow walk-in) depend on where the nearest barrow lies and fail about one run in three, on RS-671 too (checked 2026-10-26).
- If `npm install` can't fetch three.js, get it from the npm registry tarball (see `build-itch.sh`) and point `THREE_JS=/path/to/three.min.js` at it.
- A test file exports `async page => {}` and throws on failure. Export `module.exports.mobile = true` to run it on an emulated phone.
- In shell wait loops, never use `pgrep -f`. It matches its own command line and never exits.

## Design notes

- **Art direction:** new graphics (models, faces, costumes, buildings, landscapes) take their look from Ralph Bakshi's *The Lord of the Rings* (1978) and Rankin/Bass's *The Hobbit* (1977) cartoons wherever possible: their creature and race designs, faces and proportions, costumes and painterly colours. The wood elves (RS-242, `woodElfLook`) follow the Rankin/Bass ones.
- **Graphics quality bar (RS-260 to RS-262):** new and remade models get the effort of the high-detail crab, spider and scorpion in `m3dArachnid`: smooth many-sided parts (`sph` 32x22 spheres, 20-sided `seg` limbs), glossy or carefully chosen materials, vertex-colour gradients where colour should flow, and sculpted shapes (extruded, bevelled, curved) for distinctive parts like claws instead of plain cones. Render screenshots from several angles, check them closely, and iterate before releasing.
- The pace is about a tenth of RuneScape's (`XP_RATE = 0.3`). Gathering xp is weighted per skill by `GATHER_XP`.
- **Loot (RS-704):** a drop's `quality` is its rarity (0 plain, 1 magic, 2 rare, 3 set, 4 unique), not its metal. Magic and rare pieces roll prefixes and suffixes from `AFFIX_FAMS` (families with tiers by item level, T1 the best; `rollOneAffix`, `afDress`, `rollRarity` in `genItem`); a rolled bonus of a RuneScape kind (`acc`, `dmgB`, `ac`, `rngAcc`, `magAcc`, `magDmg`, `prayB`) feeds the numbers through `rsGearSum`/`afF`. A piece's built-in bonus is marked `imp` and doesn't colour it. Run `node tools/sim/run.js loot` after touching the table.
- Towns have separate NPCs for separate jobs: the Slayer master, the trader, the quest giver, the smith and the Peddler. Don't duplicate a feature across menus.
- Day and night run on a real-time clock, `G.player.clock` (RS-104): 20 minutes of day and 10 of night, paused on menus. Read the hour through `dayPhase()` and `clockNow()`. Weather runs on the clock too (RS-369, `weatherPlan()`): rain every 3 to 7 days, foggy mornings. Steps (`turnCount`) still drive events, shop stock and daily limits. In tests, set the hour with `p.clock`.
- World generation is versioned (`OW_GEN_VER`, now 24; generator 24 (RS-688) puts every other sunken temple on the land as the Guardians' Gate, with open land two tiles round it (`owTempleRoom`; `placeFeature`'s `strict` gives up instead of falling back), and the others at sea with open water 3.5 tiles round for the Rotunda's wider well (`o3TempleGate`/`o3TempleRotunda` from `o3TempleKit`, built in world units under `O3_TEMPLE_S`; the gate's footprint `O3_GATE_HX`/`O3_GATE_HZ` keeps nodes, trees and you clear, `o3NearTemple`, `o3YardNudge`); generator 23 (RS-687) puts every sunken temple out at sea (`placeSeaSite`: a water tile with water on all eight sides and a shore within five; `owSeaSite`/`o3SeaSiteL` tell one; reached by boat, the 3D land digs a well for it, `O3_SEA_TEMPLE`, and `o3DrownedShrine`'s sea mode parts the sea - the water sheet's `uHole`); generator 22 (RS-686) keeps a site's spacing before its liked terrain in `placeFeature` (its terrain only down to 60% of its distance, never nearer than 4 tiles; mines and pyramids keep their ground, `keepTerrain`) and halves the graveyards; generator 21 (RS-668) puts every mine at the foot of a mountain, a mountain beside it and open land across (`PREFER_MTN_SIDE`), and its Dwarf Gate turns its back to the mountain; generator 20 (RS-659) steps the neighbour loops (a site's surroundings, the spawn's clearing and tunnels, a pass, a region's biome) over a cube planet's face edges through `owNbG`; generator 19 (RS-642) names a cube planet's places over its seams (the map's regions flood with `owOff`, the void between the faces no sea); generator 18 (RS-640) trims a planet's dungeons, graveyards and mines to the other sizes' spacing (in `recomputeWorldSizeConstants`), and a planet's roaming groups scale with its land (`owEncTarget`); generator 17 (RS-637) drops the last narrow seas (only the eight cube corners keep one, `cubeCornerDist`), blows a cube planet's winds round true latitudes (`owGen17Moisture`) and takes its weather noise from the sphere (`owSphereNoise`); generator 16 (RS-633) drops the narrow seas from four of the cube's seven unjoined edges: ghost strips in the void while the land passes run (`owGhost`, `OW_GENCUBE`), rivers, lakes, roads and landmasses stepping with `owOff`; the 3D land on a cube-sphere builds in a frame turned from the face you're on (RS-632, `O3F`: read the world through `o3Tile`/`o3G`/`o3L`/`o3C` in 3D-land code, never `G.ow.map[x][y]` with window coordinates), and bends away at the horizon (RS-631, `DC_CURVE`); generator 15 (RS-630) makes a Planet a cube-sphere: six 124-tile faces unfolded in a cross in a 496x372 grid (`owCube()`, `cubeFace`, `cubeTileDir`/`cubeDirTile`, `owOff` for a step over any edge, `owNb` the one neighbour rule from RS-629), narrow seas kept along the seven unjoined edges until the 3D land can cross them (see the sphere-grid list in IDEAS.md), the globe a cube-sphere mesh (`globeGeo`) and the preview a world map (`renderWorldPreviewCube`); generator 14 (RS-625) adds the Planet size (`owIsPlanet()`, 432x216): land made on a sphere by tectonic plates (`owGen14Planet`, ranges from `OW_PLANET_OROG` via `owPlanetMtn`), climate by latitude, open sea down the seam, and the world map's globe (`GLOBE`, `globeRender`; RS-628: on a planet the map is always the globe, with the chart drawn by `renderOverworldMapZoomed` for the facing land (`GLOBE.decal`) and laid over the sphere (RS-642: on a cube planet, a chart for each face that shows, `globeCubeCharts`/`globeCubePatch`, the chart's base layers copying the land across the seams the grid doesn't join, `pmGhostSrc`), and every map click traced through it by `globeEv`); in every size, sea cliffs only on the open sea (`owOpenSea`); generator 13 (RS-622) adds sea cliffs (`owGen13Cliffs`, `owCliffAt`, `O3_CLIFF_H`); generator 12 (RS-621) runs roads along the valleys (the `v12` cost in `wgGenerate`) and lands island ferries near their towns; generator 11 (RS-618) makes the land from its weather: narrower ranges (`OW_RANGE_V[11]`, `OW_POCKET_MAX11`), wind-borne moisture with rain shadows (`owGen11Moisture`), more rivers from wet uplands, green banks, no specks of land and towns on fair-sized landmasses (`owGen11After`, `owGen11Town`); compare worlds with the `zworlds` probe; generator 10 adds a wood elf town race, so a medium world has ten towns, one per race; generator 9 puts landmarks on clear ground and makes them solid, see `owLandmarkFoot`; generator 6 adds pyramids, 7 deals one town per race from a shuffled deck, see `townRaceDeck`, 8 keeps roads clear of the volcano, which is built into the land, see `VOLC`; generator 4 adds lakes where rivers meet a hollow, see `owLakeFill`; generator 5 joins rivers edge to edge, see `owRiverJoin`). Generator 3 keeps mountains clear (`owMtnClear()`, `owAmidMtn(x,y)`): only dragon lairs go in a range. New placement code must skip mountains, passes and `owAmidMtn` tiles.
- The game is isometric 3D only (RS-108 to RS-111). There is no first-person view and no flat overworld, town or dungeon view; `no3dNotice()` shows when 3D can't run. The world map (M) is still drawn flat. Tests may set `o3Pref`/`v3Pref = false` to skip the 3D land for speed; the game then draws the notice.
- Towns are laid out on a fixed design grid, then stretched (`townStretch`, RS-118): extra columns at `TOWN_SEAM_X` and rows at `TOWN_SEAM_Y`. Any town coordinate used after generation must go through `tX(x)` / `tY(y)`.
- Fast travel is through the waypoint world map, to attuned towns (for a fee), and the hearthstone (T, RS-197): bound at a waypoint stone, free, usable from the open land or a town, with a cooldown (`HEARTH_CD`). Keep it from replacing the paid waypoints.
- The camera turns in quarter steps everywhere (RS-140): `ISO.rot`, saved as `G.player.viewRot`. Read the angle with `viewYaw()` / `viewYawNow()` (eased), never `ISO_YAW` directly. Walking keys in towns and the overworld go through `viewRotDir()`. Rooms inside buildings stay at `viewRot()` 0.
- Touch support lives in the `TOUCH` object and `touchUiSync()`. New UI should work by tap: the × buttons have bigger hit areas under `body.touch`.
