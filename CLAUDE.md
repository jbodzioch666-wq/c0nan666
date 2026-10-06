# Depthcrawl

A RuneScape-flavoured roguelike in one file, `depthcrawl.html`. It uses three.js 0.149.0 from a CDN, and everything else is inline. The other files are:

- `CHANGELOG.md`: player-facing patch notes, newest first.
- `IDEAS.md`: the backlog.
- `tools/build-itch.sh`: builds the itch.io zip into `dist/`, which is gitignored.
- `tools/itch-art/make.sh`: makes the itch.io page art (cover, banner, page background, embed background) from in-game scenes into `dist/itch-art/out`. Slow: about half an hour of software rendering. Each run uses a fresh random world, so check the shots.
- `tools/tests/`: Playwright browser tests. See `tools/tests/README.md`.

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

## Editing the game

- The file is large: about 35k lines, and much of the code is dense one-line functions. Use Grep to find things, then read only nearby lines.
- For multi-spot changes, use a Python script that replaces exact strings and asserts each match count, so a missed match fails loudly.
- Never put a `//` comment in the middle of a one-line function. It comments out the rest of the line. Use `/* */` there.
- Saves must keep loading:
  - Default any new save field when it is missing.
  - Version world-generation changes. For example, `G.ow.genVer` / `OW_GEN_VER` keeps old saves on the old generator.
- Some useful entry points:

  | Area | Functions |
  |---|---|
  | Screens | `setUi(name)` |
  | Rendering | `renderGame()`, `renderOverlay()` |
  | Saving and loading | `saveCurrentGame()`, `loadGame(id)` |
  | Logging | `logMsg(text, kind)`, `notify(text, kind, sfx)` |
  | Skills | `skGainXP` (all xp scaled by `XP_RATE`), `skLvl`, `rsLvl` |

## Testing

```
cd tools/tests && npm install            # once per container: playwright + a local three.js
node tools/tests/run.js --soft grave boot   # named tests; --soft = software WebGL (no GPU in the cloud)
```

- Test names come from the `ALL` list in `tools/tests/run.js`. Add new tests to that list and to the README table.
- The full suite takes about an hour with `--soft`. Run it only for broad changes, and run it in the background with a long timeout.
- `wev`, `town`, `touch` and `wg` depend on the random world and sometimes fail. Rerun once before digging in.
- If `npm install` can't fetch three.js, get it from the npm registry tarball (see `build-itch.sh`) and point `THREE_JS=/path/to/three.min.js` at it.
- A test file exports `async page => {}` and throws on failure. Export `module.exports.mobile = true` to run it on an emulated phone.
- In shell wait loops, never use `pgrep -f`. It matches its own command line and never exits.

## Design notes

- The pace is about a tenth of RuneScape's (`XP_RATE = 0.3`). Gathering xp is weighted per skill by `GATHER_XP`.
- Towns have separate NPCs for separate jobs: the Slayer master, the trader, the quest giver, the smith and the Peddler. Don't duplicate a feature across menus.
- Day and night run on a real-time clock, `G.player.clock` (RS-104): 20 minutes of day and 10 of night, paused on menus. Read the hour through `dayPhase()` and `clockNow()`. Steps (`turnCount`) still drive weather, events, shop stock and daily limits. In tests, set the hour with `p.clock`.
- World generation is versioned (`OW_GEN_VER`, now 5; generator 4 adds lakes where rivers meet a hollow, see `owLakeFill`; generator 5 joins rivers edge to edge, see `owRiverJoin`). Generator 3 keeps mountains clear (`owMtnClear()`, `owAmidMtn(x,y)`): only dragon lairs go in a range. New placement code must skip mountains, passes and `owAmidMtn` tiles.
- The game is isometric 3D only (RS-108 to RS-111). There is no first-person view and no flat overworld, town or dungeon view; `no3dNotice()` shows when 3D can't run. The world map (M) is still drawn flat. Tests may set `o3Pref`/`v3Pref = false` to skip the 3D land for speed; the game then draws the notice.
- Towns are laid out on a fixed design grid, then stretched (`townStretch`, RS-118): extra columns at `TOWN_SEAM_X` and rows at `TOWN_SEAM_Y`. Any town coordinate used after generation must go through `tX(x)` / `tY(y)`.
- Fast travel is only through the waypoint world map, to attuned towns. There is no T teleport.
- The camera turns in quarter steps everywhere (RS-140): `ISO.rot`, saved as `G.player.viewRot`. Read the angle with `viewYaw()` / `viewYawNow()` (eased), never `ISO_YAW` directly. Walking keys in towns and the overworld go through `viewRotDir()`. Rooms inside buildings stay at `viewRot()` 0.
- Touch support lives in the `TOUCH` object and `touchUiSync()`. New UI should work by tap: the × buttons have bigger hit areas under `body.touch`.
