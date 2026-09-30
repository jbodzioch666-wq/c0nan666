# Depthcrawl patch notes

## RS-46 - Tabbed message log

- **The message log has tabs along its bottom: All, Combat, Loot, Skills and Quests.** Each message is sorted into one as it's written. The tab you choose is remembered.
- **Every message shows the time** it happened.
- **Clicking a tab doesn't walk you anywhere.** Clicks elsewhere on the log still pass through to the world behind it.

## RS-45 - Site status on map badges

- **Every site badge on the world map shows its recommended combat level** underneath, such as "Lv 48". It's coloured green, yellow or red against your own combat level, so you can spot safe places at a glance.
- **Sites you've started** get a gold ring around the badge that fills as you go deeper. The label also shows your progress, such as "2/6 - Lv 74".
- **The site hover** adds a "recommended" row.

## RS-44 - World map hover details

- **Hover any dungeon, castle, tower, temple, graveyard, mine or dragon lair on the world map (M)** to see:
  - its history
  - how many floors it has
  - the level of its first monsters and of its boss, coloured against your combat level
  - the tier of loot the boss drops
  - how far you've explored it
  - your best clear time for that kind of site
- **Floor progress:** the game now remembers the deepest floor you've reached in each site.
- **Best clear time:** the game now records your best clear time, in turns from walking in to the boss falling, for each kind of site. A new record is announced in the log.

## RS-43 - Quest difficulty and length

- **Every quest on the Captain's board shows how hard and how long it is** before you take it.
- **Difficulty** is rated Easy, Moderate, Hard or Very hard. It compares the monsters the quest will put in front of you with your own level. The line also shows the foes' level in the same green, yellow or red as monster levels.
- **Length** is Short, Medium or Long, from how many tiles the target is from town and how many floors you have to go down.
- **Your quests in progress** show the same line until they're ready to hand in.

## RS-42 - Monster levels in RuneScape colours

- **Monster levels now use the same scale as your combat level**, from 3 to 126, instead of the old 1-20 tier.
- **Levels are coloured by how they compare with your combat level:** green when the monster is below you, yellow when it's even, and red when it's above. The shade deepens as the gap grows, reaching full green or red at 10 levels apart.
- **Where the coloured level shows:** the hover label over a monster ("Attack goblin (level 9)"), the foe plate next to yours, examine text and the bestiary.

## RS-41 - Examine

- **Shift+click anything** in the overworld, a town or a dungeon to examine it, RuneScape style. A short description appears in the message log.
- **Monsters** get a line about what they are, plus their level, fighting style, and what they're weak to or resist.
- **Places and objects:** terrain and sites on the overworld, town buildings, workbenches, the waypoint, the stash and townsfolk. In dungeons it covers stairs, portals, vaults, chests, altars, ore veins, pools, traps you've spotted and other props.
- **Item tooltips** now start with the item's examine line.
- **The Key Binds page** lists Shift + click.

## RS-40 - Prayer drain shown

- **The prayer screen (N)** now shows your total drain per turn of a fight and about how many turns your points will last.
- **Every prayer** lists its own drain and how long a full prayer bar would last with only that prayer on.
- **Hover the N hotbar slot or the prayer orb** to see your current drain and turns left.

## RS-39 - Spell details on hover

- **Hover any spell** in the spellbook (G), the spells panel or the G and R hotbar slots to see its details.
- **Details shown:** element, Magic level needed (green or red), max hit, damage range, the matching-staff bonus, xp per cast, and each rune in the cost with how many you have (free runes from your staff in cyan). It also shows how many casts you have left.
- **In a fight** it also shows the spell's damage and chance to hit against the monster you're fighting, and what that monster is weak to or resists.

## RS-38 - Item compare tooltip

- **Item tooltips now compare stat by stat** against what you have equipped in that slot. Each stat shows a green +, red - or grey +/- for the change you'd get by swapping the item in.
- **Stats compared:** average damage, attack or ranged, strength, defence, ranged, magic, spell damage and range.
- **An empty slot** compares against wearing nothing.
- The overall upgrade or downgrade verdict stays at the bottom.

## RS-37 - Item values everywhere

- **Every gear tooltip shows what the item is worth:** its value, what shops pay for it, and its high and low alchemy value. RuneScape's ratios apply: shops and low alchemy give 40%, high alchemy 60%.
- **Every resource tooltip shows a value too:** ores, bars, fish, cooked food, logs, herbs, bones, runes and crafting materials. For ore and bars it also shows what the blacksmith pays.
- The alchemy values are ready for the High and Low Alchemy spells, which are still in the ideas queue.

## RS-36 - Better tooltips

- **One tooltip style everywhere.** Every hover text in the game now uses the same styled box as the item tooltips, instead of the browser's plain grey popup. That covers hotbar buttons, skill cards, spell runes, map icons and the rest. Hotkeys show as key caps.
- **Item tooltips have a picture** of the item beside its name.
- **Requirements** stay green when you meet them and red when you don't.
- **Where each stat comes from.** Hover Armour, Melee/Ranged/Magic to hit or Strength dmg on the character sheet (P), or AC on your plate, to see every part that adds up to the number: base, skill level, gear bonuses, prayers, attack style and other gear effects.

## RS-35 - Fullscreen by default

- **The game now starts in fullscreen.** Browsers only allow fullscreen after a click or key press, so the page goes fullscreen on your first click or key.
- **Starting or resuming a character** also goes back to fullscreen.
- **Leaving fullscreen mid-game** is respected until the next game starts. To leave, hold Esc or use the corner button.
- **Where fullscreen is blocked** (for example, some embedded players), the game simply stays windowed.
- **Esc on itch.io:** browsers won't let a game inside a frame (as itch.io uses) keep the Escape key, so Esc there always leaves fullscreen.
  - The game now treats that as the Esc press it was, so the menu opens as usual.
  - Your next click or key puts it back into fullscreen.
  - Only the fullscreen button in the corner switches to windowed play for good, until the next game starts.
  - Outside a frame, in Chrome and Edge, Esc still stays in the game and holding it leaves fullscreen.

## RS-34 - No more X crafting menu

- **The X key no longer opens a crafting menu.** Crafting happens at the workbenches inside the Tailor, the Blacksmith and the other shops.
  - The Skills page's "crafting recipes" button is removed.
  - Help text that pointed to it is removed too.
  - X now only turns the camera, in dungeons and roadside fights.

## RS-33 - Key binds page and a new legend

- **The Esc page now has three tabs.** The page opens on Key Binds; Legend and Guide are the other two.
- **Key Binds** lists every key by what it's for: moving, fighting, skills and camping, windows, keys inside windows, and the title screen. Each key sits next to its hotbar icon. It also covers the mouse: click to walk, fight, gather or use, and the wheel to zoom. It notes where a key does something different; for example, X turns the camera in dungeons but opens crafting everywhere else.
- **Legend** now matches the current 3D game instead of the old letter glyphs:
  - the world map's site badges, painted from the map itself, plus your marker and quest pins;
  - what you can gather on the land, quest pillars, roaming monsters and water;
  - every town building and what its workbenches do, plus the Captain's ! and ?, the waypoint, the stash and the road out;
  - dungeon stairs, portals, vaults, corrupted chests, ore veins, cave pools and herbs, altars and minimap colours;
  - the attack-style and spell icons and the melee/ranged/magic colours.
- **Guide** keeps the longer how-to-play text. The quest and teleport paragraphs are updated.
- **Footnote:** the one-line key summary under the game is updated.

## RS-32 — Stairs back against the walls

- **Stairs in the graveyard's catacombs sit against a wall again.** Stair placement skipped every graveyard floor, because the surface's way down is inside the mausoleum. That also skipped the catacomb floors below, so their stairs could stand in the middle of a passage and block it. Only the surface is skipped now.
- **A stair always finds a wall:** the search for a spot now covers the whole floor, not just the 12 steps around it. This fixed an occasional stair left out in the open in the mines. Checked across 150 floors of every site type: every stair is against a wall.
- **Floors you've already visited get fixed too:** floors saved in your game have their stairs moved against a wall the next time you enter them.

## RS-31 — No more jumping across the map

- **A long click-to-walk on the overworld (or in town) no longer teleports you to the end of the path, then freezes.** Taking a step redrew the screen, and that redraw took the next step before the step timer had been reset. So one frame walked the whole path at once and drew a full 3D frame for every tile on the way, which caused the pause. Now each frame takes at most one step, and you walk the whole way at the normal pace, about a third of a second per tile. (This was also the real reason short clicks used to "zoom" you to the spot.)

## RS-30 — Far clicks walk where you point

- **Clicking far away walks you there again, on the overworld, in town and in the dungeons.** Seen from the high camera, a far click comes in at a shallow angle and used to clip something standing up in between:
  - **Overworld:** the tall click boxes over trees, herb patches and fishing spots, which sent you to that spot instead, or nowhere.
  - **Town:** the click boxes of people, benches and buildings.
  - **Dungeons:** the walls. The flat floor behind a wall picked a tile you couldn't see or reach.

  Now a gathering spot, person or building only counts when the ground you clicked is on or right beside it. In the dungeons a click takes the surface you actually see: a wall face picks the floor in front of it, and anything else picks the nearest walkable tile.
- **The overworld teleport uses the waypoint's portal:** the same swirling rune-ring you walk into at a town waypoint.

## RS-29 — Teleport from the map, clicks that always walk, a version number

- **Teleport from anywhere in the open with T:** the list shows every town you've visited by name, with its race, distance and direction. Press its number or click it. On the overworld a portal opens beside you. You walk into it and step out of a portal in the plaza of the town you chose, the same as the town waypoints. It works from a town, too.
- **World map towns are clickable:** on the world map (M), hovering a town shows its name and whether you can teleport there. A visited town gets a glowing ring, and clicking it teleports you. Dragging still pans the map.
- **Clicking behind you walks again:** the combat log floats over the lower-left of the scene, which is where you click to walk "backwards" at the start. It used to swallow those clicks. Clicks on it now pass through to the scene, in dungeons, town and the overworld. The log still scrolls.
- **Version number:** the title screen shows the build's version (now RS-29), and the itch.io zip is named after it (`depthcrawl-rs-29-itch.zip`).

## RS-28 — No more painted cut-outs in the dungeons

In the isometric dungeons, everything that was still a flat painted picture standing in the 3D scene is now a real 3D model, lit by the torches:
- **Gold** is a scattered pile of coins.
- **Chests:** the vault chest is banded in gold. The corrupted chest is violet-black with glowing cracks.
- **Items on the floor** turn slowly and bob, shaped by what they are:
  - the actual weapon model (sword, axe, hammer, bow, staff and so on), tinted with its metal
  - a helm, platebody, robe, legs or gloves in their own colour
  - a ring or amulet with its gem, a potion bottle, a rolled scroll or a wand
  - fine and better items glow on the floor in their quality colour
- **Room fixtures:** a carved throne with red velvet and gold finials, banners that sway (violet in necromancer towers), a candle-lit stone altar with a glowing rune, and an idol with glowing eyes.
- **Arena exits** have a signpost, crossed out in red while the fight holds you in.
- **Wall-torch flames** are layered, flickering fire instead of a painted flame.

## RS-27 — Fishing rods, waypoint portals, an unhurried pace

- **You hold a fishing rod while you fish:** a long tapering rod with a cork grip, a reel and rings, tipped in your rod's tier of metal. Your weapon is put away while you fish, on the overworld and at dungeon cave pools. The line and float now run from the rod's tip.
- **Waypoint travel goes through a portal:** a glowing portal opens beside you at the waypoint and you walk into it and fade away. In the town you chose, another portal opens in the plaza, just south of the waypoint (instead of dropping you at the town gate). You step out of it, and it closes behind you.
- **The last text-only hotbar slots have drawn icons:**
  - **F:** a target, sword, shield or balance for your attack style, with its three letters.
  - **R:** a spell orb in your selected spell's element colour (or the bow when you carry one).
  - **M and O:** a map and a 3D cube.
  - **E:** a tool matching what's beside you: pickaxe, hatchet, rod, a flower in the herb's colour, a cooking pot or a flame. A stop sign while you're working.
  - **J:** a skills chart with a gold star.
- **Click-to-walk is slower:** you now walk at an even pace, about a third of a second per tile, in town, on the overworld and in the dungeons, instead of rushing to the spot you clicked.

## RS-26 — Resources in the inventory

- **The inventory has a Resources section** listing everything you gather, loot or craft with, grouped into:
  - ores & bars
  - logs
  - fish & food
  - herbs & flax
  - crafting materials
  - runes & ammunition
  - bones

  By default it shows what you're carrying. **Show every resource** lists the whole catalogue, with the ones you don't have greyed out.
- **Hover any resource to see where it comes from and what it's for.** It lists every source:
  - which trees, fishing spots, herb patches or mine floors give it, and the level each needs
  - which monsters drop or can be skinned for it
  - which bench and recipe make it
  - which shop sells it

  It also lists every use: what it smelts, forges, cooks, brews or crafts into, which spells burn it, how much it heals, or how much Prayer xp it gives. The Skills panel's bag uses the same tooltips.
- **Gathering-spot tooltips list everything the spot can give or cause:**
  - trees: bird's nests, bark from maples, yews and magic trees, and the treant risk on yews and magic trees
  - fishing spots: which monster might take the line
  - herb patches: the glowing double yield

## RS-25 — Shops with rooms, workbenches for every craft

- **Vendors work inside their buildings now.** Walk through a shop's door and you step into its room. The vendor stands behind a counter against the back wall, among shelves of their wares, lit by hanging lanterns. The near walls are cut away so you can see in. Bump the counter to trade, and step back onto the doorway to go out into the street. Only the Captain of the Watch still stands in the square.
- **A workbench for each craft:** walk into a bench to use it.
  - **The Blacksmith:** a furnace to smelt ore into bars, and two anvils to forge. The smith sells gear and tools at the counter.
  - **The Alchemist:** two brewing cauldrons, bubbling green.
  - **The Tavern:** a hearth to cook at, plus tables and stools.
  - **The Tailor:** a spinning wheel for linen and bowstrings, a tanning rack for leather, an orb kiln for orbs, a loom for robes and leather armour, and a fletching bench for staves, bows and arrows.
  - **The Peddler:** crates and barrels, and the counter.
- **Nobody sells crafting materials any more.** You gather or loot everything you craft with. The Tailor now sells ready-made gear instead: plain Wizard robes, leather and hard leather, a shortbow, an oak shortbow, a plain staff and a staff of air. The Alchemist still sells runes, since they're spell ammunition rather than a crafting material.
- **The spells panel lists your spells:** it no longer says "Adventurer has no spells". It shows every spell your Magic level allows, with its damage range, how many casts your runes cover (∞ for your staff's element), and the next spell you'll unlock. Click a spell to select it.

## RS-24 — The Tailor

- **Every town has a Tailor:** a two-storey workshop in the south-east corner of the square, where a house used to stand. The tailor waits out front in leathers and a violet cape. Walk into them or through the door to go in.
- **Crafting happens at the Tailor's.** The loom, tanning vats and fletching bench are there, the same way smithing happens at the Blacksmith. Pressing **X** elsewhere still shows every recipe, so you can plan what to gather. The crafting bench is no longer at the Alchemist's.
- **The Tailor sells the basics to get you started:** flax, cowhides, bowstrings, linen cloth and unpowered orbs.

## RS-23 — Crafting: gear for mages and archers

Warriors could always mine and smith their own gear. Now mages and archers can make theirs, with a new **Crafting** skill (1–99). Open it with **X**, from the Skills panel or at the alchemist's crafting bench. Like forged metal, everything you craft beats a drop: **+15% to +45%** bonuses depending on how far your level is above the recipe's. The best ones are Masterwork, which also adds +1 spell damage to staves and robes, or +1 damage to bows.

- **Materials:**
  - **Flax** grows in blue-flowered patches on grassland, mostly near rivers and the coast. Spin it into **linen cloth** or **bowstrings**.
  - **Hides:** beasts drop cowhides and dragons drop dragonhide, green, blue, red or black by the dragon's level. Tan them for a few coins into leather, hard leather or dragon leather.
  - **Bark** comes off maple, yew and magic trees as you chop them.
  - **Orbs:** blow a silver bar into an unpowered orb, then charge it with 20 runes of an element.
- **Magic gear:**
  - **Robes** (hat, gloves, bottom, top) in every tier. Wizard robes take linen. Splitbark adds bark, Mystic adds ghostcap, Infinity adds starlily, and Ahrim's adds dragon's tongue and death runes.
  - **Staves** carved from logs, with a charged orb for an element: elemental staves from logs, battlestaves from maple, mystic staves from yew, and master staves from magic logs. An orbless magic-log staff makes an **Ancient Staff**.
- **Ranged gear:**
  - **Leather armour** (coif, vambraces, chaps, body) from Leather through Hard and Studded (which adds an iron bar) to green, blue, red and black dragonhide.
  - **Shortbows and longbows** from every wood, plus a bowstring.
  - **Arrows** from any logs: 10 to 40 per log, depending on the wood.
- **More spell damage from gear:**
  - Mystic, Infinity and Ahrim's robe tops and bottoms add spell damage. Robes you already own gain it too.
  - Two new amulets: the **Amulet of Mysticism** (magic +18, spell damage +1) and the **Occult Necklace** (+10% spell damage).

## RS-22 — One-handed tool swings

- **Only your right arm swings the pickaxe or hatchet:** your left arm now stays still at your side while you mine or chop. Before, it swung along with the tool.

## RS-21 — Your foe beside you

- **The monster you're fighting now shows in a window right next to your player window, top left.** It has its portrait, name and level, a life bar with its current and maximum life, its attack style (melee, ranged or magic) and its elemental weakness or resistance.
- **It follows the fight:** it appears as soon as you attack a monster or one attacks you, and it switches when you turn on another. It disappears when the monster dies or you leave the floor. It now works in the isometric view too; before, it was hidden there.

## RS-20 — Your figure wears what you wear

- **Helmets cover your head:** metal helmets are now a dome that covers the whole head and hair down to the brow, with a brim. Before, the top and back of the head poked through. Great helms were enlarged the same way.
- **Legs follow your legs slot:** before, the whole outfit came from your body armour, so a platebody made robe bottoms look like plate legs. Now:
  - platelegs draw as plate, in their metal's colour
  - chaps draw as leather
  - robe bottoms draw as a robe skirt, even under a platebody
  - an empty legs slot shows plain trousers
- **Your figure updates when you change leg armour.** Before, only a new weapon, helmet or body armour redrew you.

## RS-19 — Gathering spots: trees, fishing spots and herb patches

Woodcutting, fishing and foraging now work like mining. Instead of standing anywhere and pressing E forever, you find real spots on the land, work them until they run out, and move on.

- **Visible spots:** marked trees, bubbling fishing spots and flowering herb patches, each with a soft glow in its own colour. They also show as coloured dots on the flat map.
  - Hover a spot to see what it gives, the level it needs and how much is left.
  - Click it to walk over and start. E works the nearest spot beside you.
- **Spots run out:**
  - A tree gives a few logs, then creaks and crashes down, leaving a stump that regrows after a while.
  - A fishing spot gives a few catches, then the shoal moves on. Fish also drift up and down the water over time, so you follow them.
  - A herb patch is picked clean, then grows back.
- **Where things grow:**
  - **Trees:** ordinary trees at forest edges and on open grass, oaks inside forests, willows by rivers and in swamps, maples deeper in, yews deep in forests and near graveyards and temples, and rare glowing magic trees in the oldest woods.
  - **Fish:** trout, salmon and pike in rivers; shrimp, sardines and lobster along the shore. Tuna, swordfish, sharks and kraken spawn are only in deep water, which you reach by boat.
  - **Herbs:** silverleaf and sunpetal on grass, sunpetal in the desert, bloodmoss in swamps, ghostcap near graveyards, and dragon's tongue on mountain slopes. Starlily grows on high ground and tundra and only opens at night.
- **Surprises:**
  - Bird's nests fall while you chop, holding gold, a herb or a ring.
  - A yew or magic tree may wake as a **treant**.
  - Something big may take your line: a giant eel, a crab, an octopus or a shark.
  - Rare **glowing** herb patches give double.
- **Animations:** your fishing line and float stretch out to the spot you're fishing, and a felled tree topples before it leaves its stump.
- **In the dungeons:** cave pools where you fish cave eels, and patches of glowing cave herbs and mushrooms. The herbs are bloodmoss near the top, then ghostcap, then dragon's tongue deeper down. They sit alongside the mine's ore veins: hover to see them, click to walk over and work them, and they run out the same way.

## RS-18 — Rescues stick

- **A freed captive stays freed when you die.** Before, dying anywhere after a rescue dragged the captive back into their cell. That reset the quest to "clear floor N" on a floor that had filled back up with monsters. Now they slip away and make for the town that posted the quest. All that's left is to turn it in there.
- **"Clear the floor" only counts monsters you can reach.** A monster sealed in a walled-off pocket no longer keeps a captive locked up forever.
- **The quest tracker shows how many monsters are left** while you're on the rescue floor.

## RS-17 — Stats drawer below the top-right buttons

- **The stats drawer (Tab) no longer covers the menu, fullscreen, layout and help buttons:** it now opens just below them, and so does the spell panel beside it.
- **The quest list moves out of the way:** while the stats drawer is open, the quest tracker slides down to sit under it. It slides back up when the drawer closes. If the list gets too long for the space left, it scrolls.

## RS-16 — Escape no longer throws you out of fullscreen

- **Escape stays in the game in fullscreen:** after you go fullscreen with the game's own fullscreen button, the game asks the browser to lock the Escape key. In Chrome, Edge and Opera, tapping Esc then closes menus as usual. Holding Esc leaves fullscreen.
- **` (backtick) works as Escape everywhere:** it closes panels and opens the help screen. Use it in browsers without the Escape lock, such as Firefox and Safari.

## RS-15 — Unique abilities explained on hover

- **Every special effect on gear now explains itself.** This covers a unique's on-hit ability and effects like life steal, regeneration, damage reduction, deadly strike, thorns, elemental damage, gold/magic/XP find and heal on kill. Each one gets a short plain-language line under it. Hovering the line shows the full explanation. For example, Doombringer's "strike of pure dread" says: "Each time you hit, a 15% chance: terrifies the foe for 2 turns - it runs from you instead of fighting."
- **Hover tooltips wherever gear is listed:** hovering an item in the inventory list or the character sheet's pack list now opens the item tooltip. The paperdoll, shops and quest rewards already did. Every tooltip includes these explanations.

## RS-14 — Spell damage in the spellbook

- **Damage range for every spell:** each spell in the spellbook (G) now shows its damage range as you stand now, with your Magic level, gear and prayers counted. It also shows the extra 20% from an elemental staff of the same element, and the XP it gives.
- **Against your current target:** another line shows the damage against the monster you're fighting, your chance to hit, and whether it's weak to that element or resists it. For example: "vs skeleton: 15–28, 95% to hit · weak to fire".
- **Colour-coded elements:** each spell's name carries its element's colour, and the page's explanation is shorter.

## RS-13 — Elements matter

- **Monsters have elemental weaknesses, as in RuneScape:**
  - **Fire** burns the undead, frozen things, spiders, plants and oozes.
  - **Water** douses fire creatures and demons.
  - **Earth** brings down fliers: birds, bats, wyverns, harpies and blue dragons.
  - **Air** wears away stone, golems, trolls, ogres, giants and black dragons, as well as the creatures of the deep.
- **Weakness and resistance:** a spell of the element a monster is weak to does 50% more damage; its own element does only half.
- **Hover a monster** to see its weakness, for example "Attack troll (level 14) - weak to air".
- **Elemental staves focus their element:** a Staff of Fire gives endless fire runes, and your fire spells gain +2 to hit and +20% damage. The same goes for Air, Water and Earth (and the battlestaves and mystic staves).
- **Example:** against a skeleton, Fire Strike from a Staff of Fire averaged about 26 damage, against about 11 for Water Strike. Against a fire creature, water does twice what fire does.

## RS-12 — Every staff casts

- **Why only the Staff of Air seemed to work:** as in RuneScape, every combat spell costs air runes as well as its own element's. Water Strike, for example, needs water, air and mind runes. A Staff of Air covers the air, but a Staff of Water, Earth or Fire covers only its own element. Without air runes in your pouch, autocast used to give up silently and you simply swung the staff.
- **Now, when you run out of a rune:**
  - Autocast and R cast the strongest spell you can still afford, and say so: "out of runes for Fire Bolt (needs 1 chaos) - casting Fire Strike instead".
  - If you can't cast anything at all, the log tells you exactly which runes you're missing, and that your staff only supplies its own element.
- **Spellbook:** each spell you can't afford shows what it still needs, and the page explains the air-rune rule.
- **Air runes drop more often:** they're now the commonest rune monsters drop. The alchemist also sells them.

## RS-11 — Swinging a pickaxe

- **Mining is animated:** you take up a real pickaxe in both hands, in the colour of your pick's tier (bronze through rune), and put your weapon and shield away while you work.
  - You turn to face the vein, heave the pick up over your shoulder, bring it down hard and recover, over and over.
  - In a mine, every blow sends chips of the vein's own ore flying with a spark and rings on the rock.
- **On the overworld:** the same swing and pickaxe when you mine the rock beside mountains, and a hatchet when you chop trees.
- **Weapon comes back:** your weapon returns to your hand when you stop.

## RS-10 — Forged gear is the best gear

- **Forged gear beats drops:** anything you forge yourself is better made than anything a monster drops.
  - Every bonus rises by 15%, plus 1% for each Smithing level you have past the bar's own, up to +45%.
  - Up to +24% it's **Fine**; from +25% it's a **Masterwork**, coloured as a rarer find.
  - It says who forged it: "forged by <your name>: +45% bonuses".
- **Example:** a steel scimitar dropped by a monster is attack +16 / strength +14. Forged at Smithing 60 it's a Masterwork at +23 / +20. A Masterwork steel platebody matches a dropped mithril one.

## RS-9 — Shops with a purpose, and a reason to mine

- **The blacksmith only racks bronze and iron.**
  - Steel, mithril, adamant and rune come from your own forge: mine the ore, smelt it into bars at the blacksmith, then forge the gear. Deep-dungeon drops are the other source.
  - Dragon still only ever drops.
- **The smith buys your ore and bars,** so mining pays even before you can use what you dig up.

  | Ore / bar | Gold each |
  |---|---|
  | Copper ore | 3 |
  | Iron ore | 8 |
  | Coal | 10 |
  | Silver ore | 15 |
  | Mithril ore | 40 |
  | Adamantite ore | 90 |
  | Runite ore | 250 |
  | Steel bar | 60 |
  | Mithril bar | 150 |
  | Adamant bar | 360 |
  | Rune bar | 1000 |

- **The peddler no longer sells metal.** Its stock is what a smith doesn't make: bows, leather and dragonhide, robes, staves and jewellery, all of tiers you can already use. It still sells arrows and boats.

## RS-8 — Stronger uniques, the same you everywhere, and your rune pouch

- **Stronger uniques:** no unique is weak for its level any more. Each one's bonuses add up to at least a budget set by its item level and slot, and the budget goes to its natural stat when it had none. Crown of Thieves, for example, goes from defence +5 to defence +55. Uniques in existing saves are topped up when you load.
- **The same figure everywhere:**
  - In town and on the overworld, your figure now wears your actual gear, as it already did in dungeons: plate in its metal's colour, hide, robes, your helm and your very weapon (or your bow after shooting).
  - The figure is re-dressed the moment you change gear.
- **You can always see yourself in town:** anything between the camera and you now fades out of the way, not only buildings. That covers trees, the market stall, lamp hoods and well roofs.
- **Rune pouch:**
  - The inventory (I) now has a rune pouch showing every rune you carry, plus your arrows.
  - **Staff runes:** an elemental staff's runes show as ∞ ("your staff"). In RuneScape, a Staff of Air gives endless air runes, which is why Wind Strike cast without spending any.
  - The spellbook marks those runes "(staff)", and the first time a staff saves you runes the log says so.
  - The Mage kit now also carries 100 air runes, for when you put the staff down.

## RS-7 — All gear on the RuneScape system

- **Uniques use RuneScape bonuses:** every named unique now carries attack, strength, defence, ranged and magic bonuses instead of D&D stats.
  - Each one is a cut above its metal tier.
  - Its old stat mods convert: strength becomes strength bonus, dexterity becomes ranged, intelligence and wisdom become magic, and "+% damage" or "+armour" become strength and defence bonus.
  - What makes a unique special stays: life, life steal, regeneration, resistances, elemental damage, a crit edge, gold or xp find, and its named on-hit power.
  - Uniques in existing saves are converted when you load.
- **The blacksmith sells metal gear:**
  - Every tier from bronze up to the one you can use, plus the next one (greyed out) so you can see what's coming.
  - Stock: dagger, scimitar, longsword, battleaxe, 2h sword, full helm, platebody, platelegs and gauntlets.
  - Dragon is never for sale; it only drops.
  - A panel shows what you're wearing, and tools, smelting and forging are still there. The old socket drilling is gone.
- **Quests:**
  - Delivery quests ask for a metal tier, for example "bring back a piece of mithril gear or better".
  - Item rewards are the best of a handful of pieces you can already use.
  - The heavy purse now holds magic runes (chaos, death or blood) instead of a socket rune.
- **New Game+:** you keep your skills and start again from your kit's bronze gear, instead of the old class kit.
- **Item names:** they no longer carry the old "Magic" or "Rare" quality words; the metal tells you everything.

## RS-6 — Crypts, ores and your weapon

- **The mausoleum roof fades away:** as you come up to (or into) a graveyard's mausoleum, its roof fades so you can see the stairs down inside. It returns when you walk off.
- **Your character carries your actual weapon:** a scimitar is a scimitar, a battleaxe a battleaxe and a 2h sword a 2h sword, with the blade in its metal's colour. After you shoot, the bow is in hand until you next swing.
- **Mines deepen like RuneScape's rocks:**

  | Mine floor | Veins |
  |---|---|
  | 1 | Copper |
  | 2 | Copper and iron |
  | 3 | Iron and copper |
  | 4 | Iron and coal |
  | 5 | Coal, silver and iron |
  | 6 | Silver, coal and mithril |
  | 7 | Mithril and coal |
  | 8 | Mithril and adamantite |
  | 9 and deeper | Adamantite and runite |

  - Each vein holds one ore and needs that ore's Mining level. Hovering over a vein shows it, for example "Mine iron ore (Mining 15)".
- **Each vein is a real rock:** dark stone studded with nuggets of its own ore's colour (copper orange, iron rust-red, coal black, silver white, mithril blue, adamant green, runite cyan).
  - The gold outline is gone; a faint glow in the ore's colour remains (coal doesn't glow).

## RS-5 — Portals, and gear bonuses that matter

- **Portals are real:** the way out of a dungeon is now a carved stone arch.
  - It holds a swirling, pulsing gate of blue light (red for a flee portal).
  - Glowing runes run down its pillars, and it lights the floor around it.
  - It stands against a wall facing into the room, and you arrive in front of it rather than inside it.
- **Every tier is a real upgrade:** gear now carries RuneScape-style bonuses, so bronze to iron (and every step after) improves every piece.
  - **Metal armour defence:**

    | Piece | Bronze | Iron | Steel | Mithril | Adamant | Rune | Dragon |
    |---|---|---|---|---|---|---|---|
    | Full helm | 4 | 6 | 9 | 13 | 19 | 30 | 45 |
    | Platebody | 15 | 21 | 32 | 46 | 65 | 82 | 109 |
    | Platelegs | 8 | 11 | 17 | 24 | 33 | 51 | 68 |
    | Gauntlets | 2 | 3 | 4 | 6 | 8 | 11 | 15 |

  - **Weapons:** they carry attack and strength bonuses (a scimitar goes from +7/+6 in bronze to +70/+66 in dragon). Daggers lean on accuracy, and 2h swords and battleaxes on strength.
  - **Ranged and magic gear:** bows, dragonhide, staves, robes and jewellery all carry ranged, magic, strength and defence bonuses in the same units.
- **How bonuses convert:**
  - 10 attack, ranged or magic = +1 to hit.
  - 8 strength = +1 damage.
  - 20 defence = +1 armour class.
  - A leftover fraction counts as a chance of the next point, so even a small upgrade shows in your fights.
- **Character sheet (P):** now lists your total attack, strength, defence, ranged and magic bonuses.
- **Existing saves:** gear from older saves is converted automatically.

## RS-4 — Veins and stairs

- **Ore veins stand out:** in a mine, every vein you've seen glows.
  - It has a pulsing gold ring on the ground, and a glint runs over the rock.
  - The rock is fully lit, even in the dark.
  - Hover over one to see "Mine ore vein".
  - Click one to walk beside it and start mining (you need a pickaxe).
- **Old workings dimmed:** the gold flecks in mine walls are now dull traces of old workings. Bright gold now always means a vein you can mine.
- **Stairs sit against a wall:** every floor's stairs (and its way in) are moved to the nearest spot squarely against a straight wall.
  - The spot has open floor in front and to both sides, so a staircase never plugs a doorway, a corridor or the middle of a room.
  - Stairs prefer the north and west walls, the ones the camera looks at, so a flight reads as climbing the wall rather than standing free.
  - Down stairs open in the floor beside the wall, with the steps dropping away from you.
- **Arriving on a floor:** you now land on the floor in front of the stairs, not inside them.

## RS-3 — Bones and motion

- **Skeletons are full 3D models** in the dungeon scene. Each has its own copy of the sculpted skeleton, with rusted sword, round shield and glowing eyes. They stand braced, stride, cut at you, rock back when struck and topple when they fall.
- **Walking is one continuous stride.** You and every creature glide from tile to tile at an even pace, so a walked path no longer hops and stops at each tile. The camera eases after you.
- **Hold a direction to keep walking.** Holding WASD or an arrow key walks at the same pace as a clicked path. Holding it toward a monster keeps swinging at the steady beat of a fight.
- **Blows land:**
  - You step into each swing and rock back when you're hit.
  - Monsters lunge in when they strike and are knocked back by your blows.
- **Arrows and spells fly:** arrows arc through the air, and spells streak across in their element's colour (white wind, blue water, brown earth, orange fire) and burst on impact. The hitsplat waits until the shot lands.
- **Hover a monster** to see "Attack skeleton (level 4)" over it, with its tile outlined in red. Hovering the ground outlines the tile you'd walk to.

## RS-2 — An isometric world

Everything is now seen from above at an isometric angle, like RuneScape.

- **Dungeons are isometric:** castles, towers, temples, graveyards, mines and roadside fights too.
  - The first-person view is gone. The same 3D scenes are now seen from above and to the south-east, with the ceilings lifted off.
  - The walls on the camera's side of a room drop away, so they never hide you.
- **You're in the scene:** your character is a 3D figure wearing what you have equipped.
  - Plate takes its metal's colour, hide and robes show their colour, and you carry your sword, axe, mace, dagger, staff or bow.
  - Your character walks, swings and flinches.
- **Click to move:**
  - **Click the ground** to walk there. The path avoids stairs, portals and traps unless you click right on them.
  - **Click a monster** to walk up to it and fight it. You keep attacking until it dies, you click elsewhere, press a key, or fall below a fifth of your life.
  - **Ranged targets:** with a bow, or a staff set to autocast, clicking a foe out of reach shoots or casts at it.
- **Keys:** WASD and the arrow keys step one tile along the screen diagonals. Z and X turn the camera a quarter-turn, and the mouse wheel zooms.
- **Hitsplats:** damage pops up as a red splash, and health bars are green over red.
- **Towns and the overworld:** their cameras now use the same 45° angle.
- **M in a dungeon** flips to a flat isometric map instead of the old top-down one.

## RS-1 — The RuneScape branch

This branch of Depthcrawl drops the D&D rules for RuneScape's. There are no classes and no character levels any more. You become whatever you train.

### Skills, not classes
- **Character creation:** pick a race and a starting kit.
  - **Warrior:** bronze sword, full helm, platebody and platelegs.
  - **Archer:** shortbow, 150 arrows, bronze dagger, and a leather coif, body and chaps.
  - **Mage:** staff of air, wizard hat and robes, and a pouch of runes. Wind Strike is set to autocast.
- **Seven combat skills,** 1 to 99, trained by use:
  - **Attack:** accuracy, and the level metal weapons need.
  - **Strength:** how hard you hit.
  - **Defence:** armour, and the level armour needs.
  - **Hitpoints:** 2 life per level. Starts at 10.
  - **Ranged:** bows.
  - **Magic:** spells.
  - **Prayer:** prayer points and new prayers.
- **Combat level** comes from your skills, using RuneScape's formula. Everyone starts at combat 3. The Skills screen (J) shows every skill along with your combat level and total level.

### How you train
- **XP from hits:** every hit you land gives 3 XP per point of damage to the skill your attack style trains, plus 1 XP to Hitpoints.
- **Attack styles (F):**
  - **Accurate:** +2 to hit. Trains Attack.
  - **Aggressive:** +2 damage. Trains Strength.
  - **Defensive:** +2 armour. Trains Defence.
  - **Controlled:** +1 to all three, and the XP is shared.
  - Bows and spells always train Ranged or Magic. In the Defensive style they share the XP with Defence.
- **Quest rewards:** they give a lump of XP to the skill you're training.

### The combat triangle
- **Melee beats ranged, ranged beats magic, and magic beats melee.**
  - Attacking with the style that beats a monster gives +3 to hit and 20% more damage. The wrong style gives -3 and 15% less.
- **It works on defence too:**
  - Plate armour (melee gear) turns arrows but lets spells through.
  - Dragonhide (ranged gear) turns spells.
  - Robes (magic gear) turn blades.
- **Monster styles:** spellcasters count as magic foes, and archers and scouts count as ranged foes.

### Gear tiers
- **Metal:** bronze, iron, steel, mithril, adamant, rune and dragon.
  - Weapons need an Attack level: steel 5, mithril 20, adamant 30, rune 40, dragon 60. Armour needs the same Defence levels.
  - Melee weapons: daggers, maces, swords, scimitars, spears, longswords, warhammers, battleaxes, halberds and 2h swords.
- **Bows:** shortbow, oak, willow, maple, yew and magic. Each needs a Ranged level.
- **Leather and dragonhide:** coifs, bodies, chaps and vambraces. They need Ranged, and add to ranged accuracy.
- **Staves:** elemental staves give an endless supply of their element's runes. Battlestaves, mystic staves and the Ancient Staff need Magic.
- **Robes:** wizard, splitbark, mystic, infinity and Ahrim's. They need Magic and add to magic accuracy. Metal armour spoils spellcasting.
- **Jewellery:**
  - Amulets of accuracy, strength, defence, magic, power, glory and fury.
  - Gem rings, the Ring of Recoil and the Ring of Wealth.
  - Warrior, Berserker, Archers and Seers rings.
- **What's gone:** random affixes, sockets, runewords and sets are gone.
- **Uniques:** they're still here, as rare named boss and champion drops.
- **Gear you can't use yet:** it still drops, and shows as the upgrade it will be. The shops stock gear you can already use.
- **First-person weapons:** your weapon's blade takes its metal's colour.

### Magic (G)
- **The standard spellbook:** strikes, bolts, blasts, waves and surges of wind, water, earth and fire. They unlock as your Magic level rises, from Wind Strike at 1 to Fire Surge at 95.
- **Runes:** every spell costs runes. They drop from monsters and the alchemist sells them.
- **R** casts your selected spell at the nearest foe in sight when you don't have a bow equipped.
- **Autocast:** with a staff in hand you can turn on autocast, and every melee bump casts your spell.

### Prayer (N)
- **Burying bones:** kills leave bones, big bones or dragon bones. Bury them to train Prayer.
- **Twenty prayers,** from Thick Skin at level 1 to Piety at 70, including the three protection prayers at 37, 40 and 43. Each protection prayer blocks 60% of that style's damage.
- **Drain and recharge:** prayers drain points every turn of a fight. Pray at a dungeon altar, rest at an inn or make camp to restore them.
- **HUD:** the right-hand orb now shows your prayer points.

### Smithing
- **Coal:** you can now mine coal (Mining 30).
- **Steel bars:** smelt 1 iron ore and 2 coal into a steel bar. Mithril, adamant and rune bars need more coal.
- **Forging:** each bar forges its own metal's dagger, sword, scimitar, longsword, warhammer, battleaxe, 2h sword, full helm, gauntlets, platelegs or platebody. Silver bars make rings and amulets.

## v160 — Skills & Trades

RuneScape-style skills. Eight skills and eight weapon masteries each level from **1 to 99** on the classic curve (every level costs about a tenth more than the last), completely apart from your character level. Press **J** to see them all.

### Gathering (press E)
- **Fishing:** stand by a river or the sea, or fish from your boat.
  - Rivers give trout, salmon, pike and cave eels.
  - The sea gives shrimp, sardines, tuna, lobster, swordfish, sharks and, at level 85, kraken spawn.
- **Mining:** mine the rock beside mountains for copper, iron and silver. The rich ores (mithril, adamantite and runite) are only found in the veins in mines, and each vein runs out after a few ores.
- **Woodcutting:** fell trees in forests and marshes for logs, oak, willow (marsh only), maple, yew and magic logs.
- **Foraging:** search open ground for herbs: Silverleaf, Bloodmoss, Ghostcap, Sunpetal, Dragon's Tongue and Starlily.

How it works:
- **Automatic:** once you start, you keep working on your own, a catch every few tries, until you press E again or move away.
- **Your character works:** you swing at rock and timber, cast a line over the water, or stoop to search the ground.
- **Time passes while you work,** and out in the wilds something may creep up on you.
- **Better skill** means better finds and fewer failed tries.

### Tools
- The blacksmith sells a **fishing rod, pickaxe and hatchet**, and upgrades them from bronze through iron, steel, mithril and adamant to rune as your skill allows. Better tools work faster.

### Trades
- **Cooking:** cook fish and meat at the tavern hearth or your own campfire.
  - Beasts you kill drop raw meat, big beasts drop prime cuts, and dragons and hydras drop dragon steaks.
  - At low levels food sometimes burns. Open fires burn a little more than the hearth.
- **Eating (U):** eat the cooked food that best fits the health you're missing. Better food heals more, from a tenth of your health for shrimp to half for kraken spawn. Eating in a fight takes your turn.
- **Firemaking:** burn logs to light a campfire where you stand (E). Better logs burn longer.
  - You can cook at it.
  - Camping beside it (C) is much safer from ambushes.
- **Smithing:** at the blacksmith, smelt 2 ore into a bar, then forge bars into gear:
  - bronze, iron, mithril, adamant and rune bars make weapons, helms, body armour, leg armour and gauntlets;
  - silver bars make rings and amulets.
  - The further your Smithing is past a metal's level, the finer the gear: magic at +10, rare at +30.
- **Alchemy:** at the alchemist, brew 2 herbs into a healing potion. Each herb makes its own tier, up to Supreme.

### Weapon mastery
- **Every kind of weapon has its own mastery,** raised by landing hits with it: swords, axes, maces and hammers, spears and polearms, daggers, staves, bows, and your bare fists.
- **Bonuses:** mastery gives +1 to hit every 20 levels and +1 damage every 25, on top of everything your class and gear give you.

### Screens and controls
- **Skills & Trades (J):** every skill and mastery with its level and progress bar, your bag of gathered goods, and buttons for whatever you can do where you stand.
- **New keys:** **E** gathers or works, **U** eats and **J** opens Skills. All three are also on the action bar. The E button shows what you can do where you are.
- **Level-ups** get a fanfare and a banner, and tell you what you've unlocked.
- Everything saves with your character.

### Fixes
- The merchant you escort on a quest now walks beside you properly as a 3D figure. The previous update had left them stiff and not turning.

## v159 — A living town

### People in 3D
- Everyone in town is now a real 3D figure, built the same way as the monsters: you, the vendors, the Captain of the Watch and the wandering townsfolk. They replace the flat painted cut-outs.
  - Each keeps its look: the smith's leather apron and hammer, the alchemist's hood and staff, the captain's chainmail, tabard, cape and spear.
  - Townsfolk wear their own clothes and hair, dwarves are stocky and bearded, and orcs have tusks.
  - Your character carries their own class's gear.
- In town everyone stands at ease, with arms hanging loose and swinging as they walk. They turn to face the way they're going.
- Vendors and the captain turn to face you as you come near.
- Out on the overworld you're a 3D figure too, and at sea you face the bow of your boat.

### Greener, fuller town
- **Grass:** grassy ground is a carpet of real blades swaying in the breeze, both inside the walls and on the land around the town.
- **Wildflowers:** yellow, white, pink and violet flowers are dotted through the grass.
- **Trees:** trees have a trunk that forks into boughs, under a crown of soft, leafy clumps with a real leaf texture, instead of faceted green blobs.

## v158 — Graveyard fixes

- **Stairs:** staircases are now real stone steps inside the 3D scene instead of a picture painted over it.
  - Headstones, candles, columns and monsters in front of a staircase now hide it properly. Before, the crypt's way down showed through whatever stood in front of it.
  - A stair down is a real opening in the floor, with steps dropping into a dark shaft. Before, the grass underneath showed through the crypt's opening.
- **Crypt ceiling:** the ceiling inside the crypt no longer flickers. It was sitting exactly on the roof ledge above it.
- **Crosses:** the middle of stone crosses on graves, tombs and the crypt no longer flickers where the two arms meet.
- **Crypt entrance:** the stonework above the crypt's entrance no longer flickers. The beam over the porch now hangs just below the roof ledge instead of sharing its underside.
- **Tomb edges:** the corner pillars on the small tombs stand slightly proud of their sides, so the tomb edges no longer shimmer.
- **Roof ridges:** the ends of the roof ridges no longer flicker where the two slopes meet.

## v157 — Eye to eye

### Heads that face you
- **Dragons:** the dragon's head now turns down and looks straight at you, instead of staring off over your head, and it tips forward when it strikes.
- **Hydras:** all five heads turn to face you, each weaving on its own neck.
- **Snakes and eels:** snakes, wyrms and eels keep their eyes on you as they sway.

### Sculpted serpent heads
- **The head:** snakes, wyrms, eels and every hydra head have a real serpent's head:
  - a flat, wedge-shaped skull swelling at the venom glands;
  - scaled brows over the eyes;
  - nostrils and heat pits;
  - a separate jaw that opens wide.
- **Mouth:** a pair of curved fangs, and a forked tongue that flicks out.

### Shields
- **Shape:** shields are now proper round shields held by the centre grip, with a face of painted wooden planks that domes gently outward.
- **Metalwork:** a thin iron band round the rim, a domed iron boss in the middle, and a ring of rivets.

## v156 — Flesh and scale

The 3D monsters are sculpted in far more detail: real anatomy instead of tubes and balls, and surfaces you can see up close.

### Sculpted bodies
- **Humanoids** have one smoothly sculpted body from hip to neck:
  - a ribcage and chest, shoulder muscles and shoulder blades, a waist, flanks and a seat;
  - a groove down the spine and lines across the stomach.
- **Arms and legs:** biceps and triceps, forearms tapering to the wrist, thighs with a kneecap, calves and ankle bones.
- **Hands and feet:** hands have knuckles, curled fingers and a thumb closed round the weapon grip, and feet wear real boots with heels and soles.
- **Faces:** every kind of face is sculpted, with a brow ridge, deep eye sockets, cheekbones, a nose, lips, a chin and ears:
  - the goblin's long nose and huge swept ears;
  - the orc's broad flat nose, heavy jaw and tusks;
  - the troll's drooping nose;
  - the hag's hooked nose and sunken cheeks;
  - the kobold's and lizardfolk's scaly snouts and crests;
  - the gnoll's hyena muzzle.
- **Beasts:** one sculpted body with a deep chest, tucked-up belly, a ridge of spine, shoulders and haunches. Their legs are muscled, with paws and toes, and their heads have real muzzles, cheeks, brows and a parting jaw.
- **Dragons:** long snouts with flared nostrils, heavy brow ridges, cheek frills, a crest down the skull, a separate jaw lined with teeth, and a second pair of horns.

### Real surfaces
- **Materials:** every material has its own texture and relief:
  - fine pores on skin and grain on leather;
  - woven cloth and strands of fur;
  - overlapping scales on dragons, hydras, serpents and lizardfolk;
  - linked rings on chainmail, and brushed, scratched plate;
  - growth rings on horn and cracks in stone.
- **Eyes:** eyes that don't glow now have whites and irises.
- **Cloth:** robes hang in pleats that deepen toward the hem, and capes fall in folds.
- **Lighting:** a soft rim of light traces every monster's outline, so it stands out from the dark behind it.

### Smooth play
- Each new kind of monster is sculpted while the floor loads, so detailed models never stall a fight.

## v155 — Monsters in 3D, part two

Every monster in the game is now a real 3D model in first person: 170 creatures and 30 kinds of undead.

### New models
- **Dragons:**
  - dragons with great bat wings spread wide, horned heads, jaws that open, a glow of fire, frost or acid in the throat, and a long tail;
  - wyverns that stand on two legs, with a stinger in the tail;
  - plesiosaurs with flippers;
  - the dragon turtle under its great shell.
- **Hydras:** five heads on swaying necks, each snapping on its own.
- **Serpents:** snakes coiled on the ground and reared to strike, with a flicking tongue and a hooded frill on the poison wyrm. Also eels, leeches, the remorhaz with its glowing back spines, and purple worms and sandworms rearing out of the ground with a ring of teeth.
- **Tentacled horrors:** octopuses and the kraken, tentacled horrors crowned in gold, floating eye-beasts ringed with eyestalks, and the stony roper.
- **Oozes:** quivering translucent jellies with bubbles rising inside, drifting jellyfish, a surging water elemental, the vine-heaped shambling mound, and the will-o'-wisp with its orbiting sparks.
- **Arachnids:** giant spiders, frost spiders, crabs with snapping pincers, and scorpions with their stingers arched to strike.
- **And the rest:**
  - sharks with sweeping tails;
  - owls, hawks and vultures in flapping flight;
  - frogs and toads with lashing tongues, and snapping crocodiles;
  - treants and the thorned verdant horror;
  - the xorn;
  - the dust devil's spinning funnel;
  - packs and swarms moving together.

### The undead
- **Zombies:** shamble with arms outstretched, and the Rot King wears his crown.
- **Ghouls and ghasts:** hunch low on clawed feet.
- **Wights and revenants:** stand in mail and grave-cloaks.
- **Wraiths, specters, shadows and banshees:** translucent, glowing hooded shapes that drift above the floor.
- **Mummies:** wrapped in bandages, with the pharaoh's striped headdress and golden mask.
- **Others:** death knights in black plate, pale vampires with red eyes, and liches with bare skulls, crowns and staves.
- Skeletons keep their sculpted model.

### Fixes
- Capes on knights, warlords, giant jarls and other caped foes weren't showing. They're back.

## v154 — Monsters in 3D, part one

In first person, monsters are becoming real 3D models instead of painted cut-outs. This update covers every humanoid and four-legged beast, 108 kinds of creature in all. The rest follow in later updates.

### Humanoids
- **Covered:** goblins, kobolds, orcs, hobgoblins, gnolls, bugbears, ogres, trolls, giants, fiends, cultists, knights and every other two-legged foe.
- **Built to match its painting:**
  - the face, with pointed goblin ears, orc tusks, kobold snouts, gnoll muzzles, fiendish horns, hooded faces with glowing eyes, and golem heads;
  - its skin and outfit: robes, rags, leather, chain, plate with pauldrons, fur, loincloths, or a body of living stone or ice;
  - helmets, crowns, capes, tabards, wings and tails.
- **Weapons and shields:** each one wields its real weapon, from the same 3D models you fight with, and carries its shield on its arm.

### Beasts
- **Covered:** rats, wolves, dire wolves, winter wolves, bears, panthers, boars, elk, jackals, owlbears, displacer beasts, the rust monster and the manticore.
- **Built from their parts:** each has its own head, fur, tail, claws or hooves, plus manes, bristles, antlers, carapaces, wings or tentacles where they have them.

### Alive
- **Idle:** monsters breathe, turn to face you, and walk with a real stride when they move. Beasts stand side-on and look about until they strike.
- **Attacking:** humanoids draw their weapon back over the shoulder and bring it down, and beasts lunge.
- **Hit and killed:** a hit makes a monster flash and flinch, and a killing blow knocks it over.
- **In the world:** monsters are lit by the torches and your lantern, are hidden properly behind walls, and cast a soft shadow on the ground.

### Fixes
- Roadside fights were quietly falling back to the old flat renderer after the graveyard update. They now use the full 3D view again.

## v153 — The crypt and the catacombs

Graveyards are now a real place: carved headstones and stone tombs up top, a crypt holding the way down, and catacombs below.

### The graveyard
- **Tombs:** every tomb is a real stone mausoleum:
  - a weathered, rain-streaked body on a plinth, with corner pilasters and a cornice;
  - a gabled roof topped with a cross, or a stepped top with a stone urn;
  - a framed, riveted iron door, or a sealed slab carved with a worn inscription.
- **Headstones:** real carved stones in five shapes: round-topped, shouldered, plain crosses, Celtic crosses with a ring, and obelisks. They're weathered and spotted with lichen, a little tilted, and lettered.
- **Graves:** each headstone stands over its grave, either a grassy mound or a stone ledger slab.
- **The crypt:** the way down is inside a large walk-in crypt in the corner of the plot:
  - a pitched roof topped with a cross;
  - a columned porch with its own small gable over the doorway;
  - a stone hall inside, with candles burning and the stair down at the back.

### The catacombs
- Every floor below a graveyard is now catacombs, a warren of burial passages and chambers. Before, every floor was another open graveyard.
- Their walls are lined with two rows of real burial niches cut into the stone. The niches hold:
  - skulls resting on heaps of bones;
  - bodies wrapped in shrouds;
  - little clusters of candles.
- Heaps of bones and skulls, and guttering candles, line the passages.
- Wall torches light the catacombs.

## v152 — Under open skies

The graveyard and every roadside fight now use the new 3D renderer too, so all of first person is in full 3D.

### Roadside fights
- **Sky:** a real sky with drifting clouds by day, and stars and the moon by night. Clouds thicken in rain and storms, and an overcast night has no stars.
- **Sun and moon:** the sun, or the moon at night, lights the field and casts shadows from everything standing on it.
- **Horizon:** the land runs on to the horizon, with a far tree line in forests and marshes, and rolling hills in deserts and snowfields. It fades into the haze and vanishes in thick fog.
- **Obstacles are real objects:**
  - leafy bushes in forests and marshes;
  - boulders on rocky ground, in the desert and in the snow;
  - stacked cargo crates and a barrel on a ship's deck.
- **Grass:** forest and marsh grass is a carpet of real blades swaying in the wind.
- **Water:** marsh water is dark and murky instead of sea-blue, and the sea runs to the horizon beyond a ship's deck.

### The graveyard
- The wrought-iron railings are real see-through fences with spear-tipped bars and stone posts.
- Mausoleums stand as solid little tombs, with their gabled roofs against a starry sky.
- Grass sways between the graves, and a dark tree line rings the plot.

### Fixes
- Your lantern in dungeons now has its proper brightness and reach. The previous update had left it at a fixed default.

## v151 — Deeper dungeons

Dungeons in first person are now drawn by your graphics card in full 3D, instead of the old software renderer.

### Sharper stone
- The view is drawn at your screen's full resolution, so walls, floors and ceilings are crisp instead of chunky.
- Stone has real depth: mortar joints, cracks and chisel marks catch the light and cast tiny shadows as you move past.
- Floors have a faint sheen, and pools of water are glossy.
- Lava seams, glowing runes and gold ore shine on their own in the dark.

### Light and shadow
- Every nearby wall torch is a real light: it throws a warm pool across the floor and walls, and casts shadows around pillars and corners.
- Your lantern lights the stone around you, and the dark closes in beyond it.
- Corners are softly shaded where walls meet the floor and ceiling.
- Dust drifts in the air around you.

### Built like a dungeon
- Square stone pillars stand wherever a wall turns a corner.
- A low stone plinth runs along the foot of every wall.
- Corridors have ribs across the ceiling. Mines and keeps are shored up with timber frames: a post on each side and a beam overhead.
- Up-staircases climb into a dark stairwell in the ceiling.
- Every site keeps its own look: stone halls, castle keeps, necromancer towers, overgrown temples, mines and lava lairs.

### Performance
- If your computer struggles, the dungeon view lowers its resolution until it runs smoothly, then raises it again when it can.
- If 3D graphics aren't available, the game falls back to the classic renderer.

## v150 — Every weapon fights its own way

Each weapon type now has its own grip, stance and attack in first person, modelled on how melee games handle first-person weapons.

### Grips and stances
- **Swords, scimitars, sickles:** held upright at your right side, ready to cut.
- **Daggers:** held low and point-forward, close to the body.
- **Rapiers:** held point-first toward the enemy in a fencing line.
- **Greatswords, greataxes, mauls and halberds** are held upright in a proper two-handed grip:
  - the right hand high on the grip, by the guard, with its arm coming in from the lower right;
  - the left hand just below it, with its arm coming in from the lower left;
  - both sets of knuckles face forward, with the fingers wrapped round the grip toward you.
- **Axes, maces, hammers, clubs, picks, morningstars:** held upright by the haft, head up and ready to fall.
- **Spears:** both hands on the shaft and the point levelled at the enemy.
- **Quarterstaves:** both hands on the staff, held across your body.
- **Unarmed:** both fists raised in a guard.
- The flail's head hangs from its chain and sways as you move.

### Attacks
- Swords **slash** across from upper right to lower left.
- Daggers **stab** forward; rapiers **lunge** with a long reach.
- One-handed axes and blunt weapons **chop** down from overhead.
- Greatswords **cleave** in a heavy two-handed arc.
- Greataxes, mauls and halberds **smash** down with a long windup.
- Spears **thrust** straight out; staves **sweep** across.
- Fists **punch** straight ahead.
- The flail whirls its head round on the chain as you swing.
- Hits connect with a brief hitstop, and heavy blows jolt the view.

### Feel
- The weapon lags a little behind when you turn and bobs as you walk.
- Your arms follow your hands, with slim leather sleeves and steel cuffs.

## v149 — Steel in hand

### First-person weapons in 3D
- The weapon in your hand in first person is now a real 3D model instead of a flat painting, gripped in an armoured gauntlet.
- Every weapon type has its own model:
  - **Blades:** a dagger, shortsword, longsword and greatsword, a curved scimitar and a swept-hilt rapier.
  - **Axes and picks:** a hand axe, battleaxe and double-headed greataxe, a sickle and a war pick.
  - **Blunt weapons:** a knotted club, a light hammer, warhammer and maul, a flanged mace, a spiked morningstar and a chained flail.
  - **Polearms and staves:** a spear, a halberd, and a quarterstaff topped with a glowing crystal.
- The weapon is lit by the torch or lantern light where you stand, and polished steel catches the light.
- Better weapons look better: rare blades have glowing runes etched along them, and uniques have gold fittings.
- Fire, frost and poison enchantments glow along the weapon, with drifting motes of their colour.

## v148 — Quests worth taking

Quests now send you to real places, track your progress on screen, and let you choose your reward.

### Quests with a place
- Every town's Captain of the Watch has their own board of three jobs, set in the land around that town:
  - **Conquer** a specific dungeon, keep, tower, temple, graveyard, mine or lair.
  - **Wanted:** hunt down a named villain, like *Skarn the Cruel*, who roams near where they were last seen.
  - **Break a camp:** storm a bandit hideout, orc raiding camp or cultist circle and defeat its chieftain.
  - **Rescue** a captive held on a given floor of a site: clear that floor to free them, then bring them home. If you fall, they're dragged back.
  - **Escort** a merchant to another town. They walk at your heels, and if you fall, they're lost.
  - The old errands are still around too: hunts, supply runs and deliveries.
- Each job tells you where to go, like "29 leagues south of Ingrid's Crossing", and uncovers that spot on your world map.
- Objectives are marked on the 3D land with a pillar of light and a floating **!** (a blue **?** when it's time to turn in). Wanted foes have a bounty marker, and camps have tents and a campfire.
- The world map shows a pin for each objective, with a dashed trail to the one you're tracking.
- When a site moves (a conquered site rises again somewhere else), any quest about it follows it to its new home, or points to the nearest site of the same kind. You're told where the new mark is.

### Quest tracker
- Your active quests sit on the right of the screen with live progress. Click one to track it.
- The tracked quest shows an arrow pointing the way, with the distance and direction.
- A banner pops up whenever a quest moves forward.

### Better rewards
- Turning in a quest lets you pick **one of three rewards**: a weapon, a piece of armour or jewellery, or a heavy purse with a rune.
- Harder jobs (conquests, wanted foes and rescues) offer a **legendary pick** in place of the purse: a unique item when one exists.
- Reward gear is always at least magic quality and matched to your level.
- **Town reputation:** every quest raises your standing with the town that posted it.
  - **Friend:** 5% off in its shops.
  - **Ally:** 10% off, and the peddler keeps an extra piece back for you.
  - **Champion:** 15% off, and the peddler's best stock is yours.
  - The Captain shows your standing and how close you are to the next rank.

## v147 — The open world

The overworld has been rebuilt as a 3D landscape, and the world map is now a painted parchment chart.

### 3D overworld
- The wilds are real 3D land, seen from the same angled camera as the town:
  - rolling grassland, dense forests, snow-capped mountains, sandy deserts, frozen tundra and murky swamps that blend into each other;
  - lakes, rivers and the sea under rippling water, with beaches along the shore;
  - oaks, pines, snowy pines, swamp willows, dead trees, bushes, rocks and cacti.
- Every place you can visit is a landmark you can see from a distance:
  - walled villages with chimney smoke and glowing windows at night;
  - cave mouths flanked by torches, and castles with towers and a flag;
  - a necromancer's spire with a floating violet light, and a sunken temple glowing teal;
  - graveyards with a crypt and drifting mist, mines with a timber entrance and a cart track;
  - dragon's lairs ringed by jagged rocks, with smoke and an ember glow.
- Village names float over the towns. Other landmarks show their name when you're close or hover over them.
- Roaming encounters and mythic beasts are marked on the land, so you can see danger coming.
- The sun moves across the sky with the in-game clock. Nights are dark with your lantern lit, and rain, fog and thunderstorms are real weather.
- You sail open water in a proper little boat: a curved plank hull with benches and rails, a mast with a striped sail and pennant, and a foam wake. You stand aboard, and it turns to face the way you're sailing.
- Click anywhere to walk there, or click a landmark to travel to it and go in. WASD still works, and the mouse wheel zooms.
- Zooming the camera out keeps you and the land around you clear; weather haze only closes in beyond that.
- **O** switches between the 3D view and the classic flat map.
- When you conquer a site, it disappears from the 3D land as soon as you come back out, and its replacement appears elsewhere.

### Painted world map (M)
- The world map is an old parchment chart that fills the screen:
  - inked coastlines, a blue-grey sea with ripple lines along the shore, and land washed in the colour of each region;
  - hand-drawn mountains, forests, marsh tufts, dunes and rivers;
  - every site in coloured ink, village names lettered on, a compass rose and an illustrated legend.
- Sites are bright icons on dark round badges, with a large illustrated legend.
- A big red "You" marker always shows where you are.
- **Fog of war:** land you haven't been near is hidden under drifting cloud until you explore it. Your explored map is saved with your game.
  - For saves from before this update, the land around every town you've visited starts uncovered.

## v146 — The 3D update

Everything since v145: dungeons in first-person 3D, a hub town you can walk around, hand-painted monsters, a new action-RPG HUD, loot that keeps up with you, and item comparisons you can trust.

### First-person 3D dungeons
- Dungeons and roadside fights can be played in first person. **M** switches between 3D and the classic top-down map.
- Controls:
  - **W/S** step forward and back, **A/D** strafe.
  - Arrow keys or **Z/X** turn. Turning doesn't use up your turn.
  - You can also click the edges of the screen to turn.
- Every kind of site has its own look:
  - stone dungeons, castle masonry, rune-carved necropolises, mossy temples, crypts, timbered mines and lava lairs;
  - grass, sand and snow fields under an open sky with stars and rain.
- Torches flicker, and you carry a lantern. There are floating damage numbers, particles and a visible weapon that swings in first person.
- A minimap, a compass, your current target, and warnings when you're being flanked.
- Stairs are real staircases: up-flights rise into the ceiling, and down-flights drop through the floor.
- The graveyard is outdoors:
  - no ceiling, a misty moonlit sky, and grass underfoot;
  - wrought-iron railings instead of walls, and free-standing mausoleums.
- Falling through a pit lands you on open floor instead of on the up-staircase, and the game remembers which floor you fell from.

### 3D skeleton warriors
- Skeletons are fully sculpted 3D models:
  - a hollow skull with a chattering jaw and individual teeth, and real ribs, spine, pelvis, hands and feet;
  - lit by the torch or moonlight where they stand;
  - drawn sharp at whatever size they appear on screen.
- They're dressed as barbarians:
  - a shaggy fur mantle, a strapped leather bracer, a buckled belt with a pouch, and fur-cuffed wrapped boots;
  - a rusted sword and a weathered round shield.
- They stand in a guard with the sword raised beside the head, walk, stagger when you hit them, and wind up and cut when they strike.

### Hand-painted monsters
- Every monster in the game has a painted portrait: humanoids, beasts, dragons, serpents, spiders, oozes, tentacled horrors, hydras, swarms and more.
- 30 undead in 9 painted styles: skeletons, zombies, ghouls, wights, spirits, mummies, a death knight, vampire spawn and liches.
  - Spirits float and are see-through, undead eyes glow, and corrupted undead have a violet taint.
- Monsters are shaded with lighting, rim light and glossy eyes. The same art appears in 3D, on the map, in the bestiary and on the Last Foe panel.
- Treasure, potions, scrolls, gear, portals, altars, thrones, headstones, ore, shops and torches are all painted objects too.

### The town hub
- Villages are a full 3D town seen from an angled action-RPG camera:
  - timber and stone buildings whose windows glow at night, chimney smoke, a smithy with sparks, and an alchemist's bubbling cauldron;
  - a market stall and a palisade with a torch-lit gate.
- Each town's look matches its region (forest, swamp, desert, tundra, mountain) and its people. Day and night follow the in-game clock.
- New features in town:
  - a **waypoint** on the plaza, for travel to any town you've visited;
  - a **stash** chest with 60 slots, shared between every town;
  - the **Captain of the Watch**, who now hands out quests (look for the ! or ? overhead).
- Every vendor is a named character standing outside their shop.
- Click the ground or a person to walk there. WASD still works, and the mouse wheel zooms.
- Buildings between you and the camera fade out so they never hide you.

### New action-RPG HUD
- The game fills the whole window:
  - life and charges orbs on either side of a skill bar that matches your hotkeys;
  - an XP bar, a character plate and a target frame;
  - a combat log that fades out.
- Stats and spells slide out as a drawer (**Tab**).
- A button switches back to the classic three-column layout if you prefer it.

### Loot that levels with you
- Drops now scale with what you're fighting instead of with the floor number.
  - Dungeon loot keeps pace with shop gear all the way to level 20. Before, it was about half as good by the endgame.
  - Roadside fights drop loot for your level. Before, it never improved.
  - Boss loot drops at the boss's level with a steady bonus. Before, it was always level 20, which was far too strong early and then never got better.
- Uniques get stronger as their item level rises.
- Newly unlocked base items and mods turn up more often around the level they unlock, and half of your gear drops are usable by your class.
- Potions, scrolls, wands, vaults and chests follow the same scaling, so the higher-tier potions can actually drop.

### Item comparison you can trust
- Upgrade arrows and the shop's upgrade/downgrade verdict now try the item on and score your whole kit with it, using the same maths combat uses. They count:
  - every mod, runeword and set bonus, including completing or breaking a set;
  - your stats, as your class actually uses them;
  - weapon proficiency, crit, deadly strike, elemental damage, life steal, regen, thorns, damage reduction and unique on-hit effects.
- Gear is scored against the real monsters around your level and against a boss, so armour class, attack and regen still count on a strong character.
- A weapon your class isn't trained with is no longer marked as junk. You can wield it without your proficiency bonus to hit, and it's compared on that basis.
- New rings replace whichever of your two rings you'd miss least.

### Fixes
- Bonus damage from anything other than your weapon now actually applies to your attacks:
  - +damage and +% damage from armour, jewellery, runewords and sets;
  - Dragonborn's Draconic Might;
  - the Battle Master, War Domain and Berserker subclasses.
- Crit bonuses from gear other than your weapon now count.
- The death recap log is no longer hidden behind the new HUD.

### Under the hood
- The game runs fully offline. The itch.io build includes its 3D library and fonts, so it doesn't depend on any outside site.
- If 3D can't start on a device, the game falls back to the classic painted and top-down views.
