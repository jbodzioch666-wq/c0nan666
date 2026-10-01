# Depthcrawl (RuneScape rules) - ideas for later

**Picked** is the build queue, sorted so it can be built efficiently: items are grouped by the part of the game they change, so each area is worked on in one go, and foundations come before the features that build on them. The top item is next. Numbers in brackets are the original idea numbers. Everything else is in the **Backlog**.

## Picked

### Info and tooltips
_One pass over the tooltip, hover and label code_

1. [x] (212) Better tooltips - one style everywhere, icons, requirements in red or green, where each stat comes from
2. [x] (315) Item values everywhere - shop and high-alchemy value on every tooltip
3. [x] (184) Item compare tooltip - green and red numbers against what you're wearing
4. [x] (377) Spell details on hover - max hit, rune cost, accuracy against the target, element weakness
5. [x] (442) Prayer drain shown - points per turn on the prayer screen and hotbar
6. [x] (211) Examine text for any object, monster or item
7. [x] (243) Monster levels in RuneScape colours - green easy, yellow even, red dangerous against your combat level
8. [x] (162) Quest difficulty and length shown before you accept
9. [x] (99) Hover details for everything - site name, history, boss, depth, loot tier, your best clear time
10. [x] (97) Site status on badges - cleared, in progress (deepest floor reached) or untouched, plus recommended combat level

### HUD feedback and log
_The log panel, hitsplats and HUD overlays_

11. [x] (215) Chat-style log with tabs - all, combat, loot, skills, quests - and timestamps
12. [x] (60) Combat log filters and a kill-count tracker per monster
13. [x] (59) Colour-coded damage numbers - melee, ranged, magic, poison and crit
14. [x] (51) Crits and hit feedback - bigger hitsplats, screen shake on big hits, miss and block splashes
15. [x] (23) XP drops and a skill tracker
16. [x] (216) Notifications - crops ready, inventory full, low health - with sounds
17. [x] (217) Low health warning - red screen edges and a heartbeat under 25% life
18. [x] (209) Buff and debuff bar - icons with timers for poison, prayers, potion boosts, stun
19. [x] (208) Cooldown and charge overlays on hotbar icons

### Inventory management
_The inventory and stash code_

20. [x] (185) Inventory sort, filter and search
21. [x] (186) Lock items so they can't be sold or dropped by mistake
22. [x] (314) Coin pouch - gold goes to a pouch instead of taking an inventory slot (gold never used a slot; the inventory now shows the coin pouch and pack slots)
23. [x] (187) Salvage - break junk gear into bars, leather or cloth
24. [x] (188) Loot filter - hide junk drops, highlight uniques with a beam of light
25. [x] (192) Rarity-coloured drop beams on the ground
26. [x] (11) Ammo and rune pouches so they stop cluttering the inventory (already the case: arrows and runes live in the resource bag, not pack slots)
27. [x] (339) Crafted bags and pouches - gem bag, herb sack, coal bag holding resources outside the inventory (already the case: every gathered resource lives in the unlimited resource bag)
28. [x] (189) Storable item sets - keep a full armour set as one item
29. [x] (361) Inventory-full prompt - drop, bank, or process on the spot (cook fish, burn logs)

### Settings, saves and menus
_Title, pause, death and settings screens in one go_

30. [x] (25) Save export and import
31. [x] (274) Volume sliders - master, music, effects, ambience, UI (master, effects and interface now; music and ambience sliders come with the music system)
32. [x] (295) Graphics quality settings - low, medium, high for shadows, draw distance and effects
33. [x] (296) FPS counter in settings
34. [x] (202) UI scale slider for small or huge screens
35. [x] (203) Compact mode - hide everything but the orbs and hotbar
36. [x] (219) Pause menu - resume, settings, key binds, save and quit, separate from help
37. [x] (218) Main menu redesign - animated 3D scene with your character, save slots with portrait and play time
38. [x] (220) Loading screens with tips and art between areas
39. [x] (222) Stats page - kills, deaths, gold earned, play time, damage dealt, longest dungeon run
40. [x] (317) Wealth tracker - net worth (gold plus item values) on the stats page
41. [x] (318) Loot value - running total of a dungeon run's loot, shown when you leave
42. [x] (221) Death screen redesign - cause-of-death recap, what you lost, a return-to-gravestone button
43. [x] (28) Death gravestone to return to for your items
44. [x] (438) Protect Item prayer - keep one extra item on death

### UI overhaul
_The HUD layout rebuilt once, before more windows are added_

45. [x] (200) RuneScape-style side panel - tabbed inventory, equipment, skills, prayer, spellbook and quests that stays open while you play
46. [x] (201) Draggable, resizable windows - move the log, tracker and panels; the layout is remembered
47. [x] (204) Several windows open at once - inventory beside a shop, stash beside inventory
48. [x] (205) Customisable hotbar - drag spells, potions, food and prayers onto slots 1-9
49. [x] (206) Quick-prayer button - one click turns on your saved prayers
50. [x] (207) Run/walk toggle with a run energy orb
51. [x] (21) Right-click menus (Attack, Examine, Walk here, Use)
52. [x] (213) Hover highlight (outline or glow) on anything clickable in the 3D world
53. [x] (214) Floating name tags over NPCs and players in towns
54. [x] (22) Minimap on the overworld and in towns
55. [x] (223) Themed UI skin - stone-and-wood frames, parchment for quest text
56. [x] (225) Smooth UI animations - sliding panels, counting numbers, filling bars

### Equipment slots
_The gear slots, paper doll and stat code_

57. [x] (172) Boots and gloves slots - split from arms, with their own tiers (climbing boots, dragon boots, barrows gloves)
58. [x] (173) Cape slot - obsidian cape, fire cape, Ava's attractor (saves arrows), skill capes
59. [x] (174) Ammo slot - arrows, bolts and runes equipped as real items with stats (arrows as ammo items with ranged strength; bolts come with crossbows, runes stay in the rune pouch)
60. [x] (175) Second ring slot or a trinket slot for charms and totems
61. [x] (50) Shields as a real choice - one-handed weapon and shield for defence, or a two-handed weapon for damage
62. [x] (178) Two-handed and dual wield - off-hand daggers for double hits, two-handers for big single hits
63. [x] (379) Mage off-hand - a book or tome for magic accuracy and damage
64. [x] (401) Quiver - holds more ammo with a small bonus
65. [x] (39) Cosmetic override slots - wear a look item over your real gear
66. [x] (10) Set bonuses - full Barrows-style sets do something special
67. [x] (441) Prayer bonus on gear - holy items, god robes and blessings slow prayer drain
68. [x] (176) Rerolling - spend gold or a rare scroll to reroll one stat on a piece of gear

### Player model and looks
_The player 3D model and character creator, including every animation_

69. [x] (41) Better base model - hands with fingers, visible boots and gloves, shoulder pads matched to the armour tier
70. [x] (30) Character creator - a live rotating 3D preview on the creation screen, with arrows for each part
71. [x] (31) Body type - masculine or feminine, and lean, average or stocky builds
72. [x] (32) Skin tone - a palette per race (orc greens and greys, tiefling reds and purples, natural tones for the rest)
73. [x] (33) Hair - 8 to 10 styles (bald, short, long, ponytail, braids, mohawk, topknot, dreadlocks) plus colour
74. [x] (34) Facial hair - none, stubble, goatee, full beard, long dwarf braid, plus colour
75. [x] (35) Face details - eye colour, scars, war paint and tattoos, tiefling horns, orc tusks, elf ear length
76. [x] (36) Starting clothes - pick shirt and trouser colours instead of everyone in brown rags
77. [x] (42) Gear detail per tier - rune plate trims, dragon spikes, mystic robes with stitched runes
78. [x] (190) Glowing and animated high-tier gear - dragon weapons glint, magic staves swirl
79. [x] (191) Unique items get their own 3D models instead of the base shape
80. [x] (43) Idle animations - breathing, looking around, sitting at camp
81. [x] (422) Swing animations per weapon type - stab, slash, overhead crush, halberd spin
82. [x] (403) Bow draw animation - pull, aim, release; arrows stick in monsters briefly
83. [x] (381) Casting animations - raise the staff, gather energy, release
84. [x] (444) Bone burying animation with a small effect
85. [x] (443) Overhead prayer icons - the active protection prayer glows over your head, plus a light aura for boosts
86. [x] (37) Barber and tailor make-over - pay gold in town to restyle hair and beard or re-dye clothes
87. [x] (38) Dyes - craft dyes from herbs and dye any armour or robe (colour changes, stats don't)
88. [x] (40) Skill capes - reach 99 in a skill for its cape, trimmed if you have more than one 99
89. [x] (26) Level-up fireworks and jingle - a column of light and fireworks around your character

### Skills framework
_Shared skill code: guides, perks, tools, progress and crafting window_

90. [x] (78) Skill guides - a panel per skill showing items, spots and perks unlocked at each level
91. [x] (76) Milestone perks - every skill gives a bonus at 25, 50, 75 and 99 (e.g. Woodcutting 50: sometimes a double log)
92. [x] (77) Tool tiers with real effects - dragon pickaxe is faster, infernal axe burns logs for Firemaking xp
93. [x] (80) Total-level gates - areas and rewards that open at total level 500, 1000 and 1500
94. [x] (359) Gathering progress bar over your head with the chance per swing from level and tool
95. [x] (360) Continuous gathering - keep working nearby nodes until the inventory is full
96. [x] (340) Crafting interface - recipe window with make 1, 5, 10 or all, a queue and a progress bar
97. [x] (341) Recipe discovery - recipes unlock by level or are learned from books, drops and quests
98. [x] (342) Masterwork chance - a rare critical craft with an extra stat or special effect
99. [x] (344) Crafting milestones - level 99 unlocks the best armours and a material-saving cape perk

### Resources and gathering
_Resource nodes, done before the crafts that use them_

100. [x] (353) More resource variety - clay, sand, seaweed, gems and essence rocks as sources for the new crafts
101. [x] (354) Rich and rare nodes - sparkling gold vein, ancient oak, legendary fishing spot with triple yield, marked on the map while they last
102. [x] (355) Node size and quality - small, medium and large nodes; better quality deeper in the wild
103. [x] (356) Biome-specific resources - desert cacti and scarab shells, tundra frost lilies and ice fish, swamp bog iron and leeches
104. [x] (357) Seasonal and time-of-day resources - dawn-only fish, spring-only herbs
105. [x] (363) Trophy fish and record ore - size and quality variants you can mount in your house

### Production skills
_New crafts and skills on top of the framework and resources_

106. [x] (72) Fletching as its own skill - bows, arrows and bolts split out of Crafting, with bolt tips cut from gems
107. [x] (332) Gem cutting - uncut gems from mining, nests and monsters cut with a chisel (sapphire to onyx)
108. [x] (333) Jewellery - gold or silver bars plus gems at a furnace with moulds: rings, necklaces, amulets, bracelets
109. [x] (334) Pottery - clay on a potter's wheel, fired in a kiln: pots, bowls, pie dishes for Cooking and Herblore
110. [x] (335) Glassblowing - sand and seaweed into molten glass: vials, orbs, lantern lenses, fishbowls
111. [x] (336) Holy and unholy symbols - silver cast into Prayer-boosting amulets
112. [x] (337) Battlestaves for every element, plus mystic staves
113. [x] (338) Crafted lanterns and torches for dark dungeons
114. [x] (81) Better Cooking - pies, stews and pizzas from several ingredients that heal more; burn rate drops with level
115. [x] (82) Better Smithing - cannonballs, nails for Construction, dart tips, upgradable gear
116. [x] (343) Rare boss materials - dragon hide, abyssal parts, zenyte shards for top-tier crafts
117. [x] (5) Runecrafting - make your own runes at altars (settles whether the Alchemist should stop selling runes)

### Melee
_The melee combat code_

118. [ ] (415) Stab, slash and crush damage types - monsters and armour have weak spots per type (skeletons weak to crush)
119. [ ] (48) Weapon-type differences - daggers hit twice, spears reach 2 tiles, battleaxes and halberds hit everything around you, maces stun, scimitars bleed
120. [ ] (420) Cleave - big axes and swords also hit monsters beside the target
121. [ ] (49) Flanking and positioning - bonus for hitting from behind or the side, penalty when surrounded
122. [ ] (421) Weapon mastery - using a weapon type unlocks small permanent bonuses and moves
123. [ ] (416) Abyssal whip - fast, accurate mid-level upgrade
124. [ ] (417) Dragon scimitar, dragon longsword and dragon dagger as sought-after drops
125. [ ] (419) Barrows weapons - Dharok's greataxe, Guthan's spear (heals), Verac's flail (ignores armour), Torag's hammers
126. [ ] (8) Poison and venom weapons, plus antipoison potions
127. [ ] (177) Weapon poison and enchant - apply poison or bolt enchantments to weapons

### Ranged
_The ranged combat code_

128. [ ] (396) Ranged attack styles - Accurate, Rapid, Longrange (more distance, Defence xp)
129. [ ] (397) Range per weapon - each bow has its own reach
130. [ ] (398) Line of sight - walls and pillars block shots, so cover matters
131. [ ] (394) Shortbows and longbows - shortbows fire faster, longbows shoot further and hit harder
132. [ ] (393) Crossbows - a slower, harder-hitting weapon line using bolts, bronze to dragon
133. [ ] (57) Ammo types - broad bolts, fire arrows, ruby bolt effects; thrown darts, knives and chinchompas
134. [ ] (395) Famous bows - dark bow (two arrows), crystal bow (no ammo, degrades), twisted bow, seercull
135. [ ] (399) Ammo recovery - some arrows land on the ground to pick up after a fight
136. [ ] (400) Ranged prayers - Sharp Eye, Hawk Eye, Eagle Eye, Rigour
137. [ ] (402) Better projectiles - arrow trails, bolt sparks, spinning knives

### Magic and prayer
_The spell and prayer code_

138. [ ] (371) Crowd control spells - Bind, Snare, Entangle root a monster; Confuse, Weaken, Curse lower its stats
139. [ ] (372) Area spells - fire burst, ice barrage hitting a group for extra runes
140. [ ] (374) Healing and support spells - Heal Self, Cure Poison, Stat Restore, Vengeance
141. [ ] (373) God spells - Saradomin Strike, Claws of Guthix, Flames of Zamorak, with god capes and staves
142. [ ] (375) Multiple spellbooks switched at an altar - Standard, Ancient, Lunar, Arceuus
143. [ ] (376) Spell hotbar - favourite spells on number keys
144. [ ] (378) Combination runes - mist, dust, mud, lava, steam, smoke count as two elements
145. [ ] (380) Spell animations per tier - small strike bolts up to huge surges with a screen effect
146. [ ] (294) Better spell effects - per-element particles (fire trails, water splash, earth rocks, swirling air)
147. [ ] (316) High and low alchemy spells - turn items into gold with Magic
148. [ ] (437) Redemption prayer - heals you when you drop below 10% health
149. [ ] (439) Ancient Curses - a second prayer book from a quest: soul split, deflect, leech, Turmoil

### Dungeon overhaul
_Bigger floors and layouts before the monsters and content that fill them_

150. [ ] (29) Dungeon overhaul - floors are only 20x20 with 6-9 small box rooms today
    - Bigger floors: about 48x48, sized by depth and site type. Make floor size a per-floor setting (towns stay 20x20) and only build the 3D scene near the camera
    - Better layouts: L-shaped, cross and round rooms, pillared halls, cave caverns; loops so there's more than one route; wider halls, a grand hall and a boss arena
    - A layout per site: castle courtyards, a keep and towers; flooded temple sections; necro tower rings; long mine tunnels with rail carts
    - More to do: locked doors and keys, levers, secret walls, visible and disarmable traps, puzzle rooms, mini-bosses guarding treasure rooms, monster packs with a purpose, shrines, a deep merchant, lore notes, hazards (lava, collapsing floors, darkness)
    - Across floors: branching safe and dangerous stairs, shortcuts or checkpoints every few floors, named set-piece floors
    - Suggested order: bigger floors and layouts first, then the content
151. [ ] (293) Wall cutaway fades smoothly instead of popping
152. [ ] (290) Richer dungeon dressing - cobwebs, bones, barrels, moss, chains, banners, rubble, per site type
153. [ ] (291) Better wall and floor textures per site - castle stone, temple tiles, mine timbers, crypt carvings
154. [ ] (292) Animated hazards - bubbling lava, dripping water, glowing crystals, swinging blades
155. [ ] (284) Dynamic torchlight - flickering light and moving shadows, a lantern to carry in dark dungeons
156. [ ] (179) Utility items - light source for dark dungeons, rope, shovel, keys for locked doors and chests
157. [ ] (362) Skill-gated resource areas - mining guild, fishing platform, magic tree grove
158. [ ] (240) Raid - a multi-room challenge with several bosses, puzzles and a big reward chest

### Monster behaviour
_Monster AI and visuals_

159. [ ] (56) Aggression levels - some monsters ignore you until provoked; low-level monsters flee from a high-level player
160. [ ] (52) Monster roles - tanks guard healers, archers keep distance, casters teleport away, swarms surround you
161. [ ] (241) Pack hunting - wolves circle and attack from several sides
162. [ ] (242) Summoners - necromancers raise the dead, shamans call spirits
163. [ ] (54) RuneScape monster abilities - drain your stats, freeze you in place, disarm, poison
164. [ ] (55) Elite and champion modifiers - random affixes on tougher monsters (fast, vampiric, shielded, explosive)
165. [ ] (53) Boss phases - tactics change at 66% and 33% health: summon adds, enrage, or switch style (Jad-style prayer switch)
166. [ ] (440) Boss prayer checks - bosses switch attack styles so you must swap protection prayers in time
167. [ ] (248) Status visuals - green when poisoned, icy when frozen, smoking when burning
168. [ ] (61) Death animations and ragdolls, with corpses that stay a few turns
169. [ ] (247) Size variety - tiny rats to giants and dragons filling several tiles
170. [ ] (245) Monster animations - idle, walk, attack, cast, hurt and death per body type
171. [ ] (244) Better monster 3D models - more detail, unique silhouettes for big monsters

### Monster content and bestiary
_New monsters, bosses, drops and the bestiary_

172. [ ] (236) Monster families with tiers - goblin to warlord, skeleton to champion; each area has an ecosystem
173. [ ] (231) Classic RuneScape monsters - hill and moss giants, lesser and greater demons, hellhounds, abyssal demons, gargoyles, dagannoths, TzHaar, black knights, dark wizards
174. [ ] (232) Regional monsters - desert scarabs and mummies, swamp bog-beasts and leeches, tundra ice trolls and yetis, coastal sea monsters
175. [ ] (233) Night-only monsters - werewolves, vampyres, ghosts after dark
176. [ ] (234) Rare spawns - golden goblin, shiny variants, treasure imps with big loot
177. [ ] (235) Mimics - chests that bite back
178. [ ] (237) Named RuneScape-style bosses - King Black Dragon, Kalphite Queen, Giant Mole, Barrows brothers, Dagannoth Kings, Corporeal Beast, Zulrah, each with a lair and mechanics
179. [ ] (418) Godswords - Armadyl, Bandos, Saradomin, Zamorak two-handers built from boss shards
180. [ ] (9) Boss drop tables with a collection log of every unique found per boss
181. [ ] (183) Rare drop table - any monster has a small chance of big gems, rune items, half-keys or clue scrolls
182. [ ] (239) Boss kill counts and personal best times in the bestiary
183. [ ] (249) Full bestiary entries - 3D model viewer, lore, drop table, weaknesses, where found
184. [ ] (250) Bestiary completion rewards - bonuses per monster family, a title for finishing it
185. [ ] (210) Target info panel - a monster's stats, weaknesses and drop table on inspect

### Slayer and tasks
_Task and currency systems that share one framework_

186. [ ] (6) Slayer - a slayer master who assigns kill tasks, points to spend on unlocks
187. [ ] (311) Daily and weekly contracts - deliver 50 logs, kill 20 goblins, for bigger rewards
188. [ ] (312) Bounty board - wanted monsters with bonus gold, refreshed daily
189. [ ] (313) Multiple currencies - tokkul, slayer points, quest points, guild tokens, each with its own shop
190. [ ] (310) Money-making guide - good ways to earn gold at your level

### Economy and banking
_Shops and the bank_

191. [ ] (306) Dynamic shop prices - each copy you sell to a shop pays less, recovering over time
192. [ ] (307) Shop restocking - limited stock that refills over time; rare items sell out
193. [ ] (308) Teleport fees - waypoint travel costs gold, cheaper at high reputation
194. [ ] (124) Bank building with a banker, replacing the stash chest
195. [ ] (18) Bank tabs and search for the stash
196. [ ] (309) Property - buy a house or a shop that earns passive gold

### World generation and overworld
_World generation and overworld content_

197. [ ] (474) World size choice at the start - small, medium or large
198. [ ] (475) World seed sharing - play the same world as a friend
199. [ ] (476) Continent types - archipelago, one big landmass, several continents
200. [ ] (462) New biomes - volcanic region, jungle, haunted forest, snowy highlands, crystal wasteland
201. [ ] (463) Level-banded regions - each region shows its recommended combat level on entry
202. [ ] (101) Roads between towns - faster and safer to walk, fewer encounters
203. [ ] (464) Bridges, ferries and fords - river crossings, some broken until a quest repairs them
204. [ ] (16) Weather that matters (rain boosts fishing, storms make sailing dangerous)
205. [ ] (465) Wildlife - deer, rabbits, birds and boars roaming, some huntable, fleeing when you get close
206. [ ] (466) Farms and hamlets between towns - farmer, mill, well, small jobs and trades
207. [ ] (469) Scenic viewpoints - lookouts that reveal the map around them with a discovery bonus
208. [ ] (470) Hidden caves and grottos in cliffs and behind waterfalls
209. [ ] (471) Small walk-in ruins - 1-2 room mini-dungeons with a chest and lore
210. [ ] (102) Points of interest - ruins, standing stones, abandoned camps, wishing wells, hermits, each with a small event or reward
211. [ ] (472) Better camps - campfire, tent, cooking spit, upgradable camp kit for safer rest
212. [ ] (473) Auto-walk along roads to a chosen destination
213. [ ] (58) Wilderness zone - a lawless region with riskier encounters and better loot, where you drop items on death

### World map
_The parchment map, after the world it draws_

214. [ ] (94) Place names - regions, forests, mountains, lakes and roads lettered in calligraphy on the parchment
215. [ ] (95) Custom map markers - drop your own pins (star, skull, pick) with a note
216. [ ] (96) Map filters - toggle layers: sites, quests, resources, cleared or uncleared, danger
217. [ ] (98) Route planner - click to draw a dotted walking path, optionally auto-walk it
218. [ ] (100) Travel log - discoveries, towns visited, % of the map explored, exploration achievements
219. [ ] (106) Animated parchment - drifting clouds, coastal waves, town smoke, birds
220. [ ] (107) Explored areas fill with colour - from rough sketch to full painting as you explore
221. [ ] (108) Detailed zoom levels - zoomed out shows regions, zoomed in shows buildings and trees
222. [ ] (105) Landmarks visible from afar in 3D - wizard tower, smoking volcano, giant tree

### World events
_Timed events on the overworld_

223. [ ] (103) World bosses - a giant that sometimes roams the map, with a marker when it's awake
224. [ ] (104) Dynamic events - town under siege, a new bandit camp, a meteor strike with rare ore; shown on the map with a timer
225. [ ] (14) Random events on the road (lost child, travelling wizard, sandwich lady)
226. [ ] (467) Growing monster camps - goblin or bandit camps expand if left alone and threaten nearby towns
227. [ ] (468) Territory control - clear a region's camps to make it safer, with friendlier travellers
228. [ ] (132) Town events - festivals, market days with rare traders, monster raids to defend against

### Towns
_Town generation and town content_

229. [ ] (118) Town layouts that differ - port towns, walled cities, hill villages, swamp villages on stilts, built around the terrain
230. [ ] (119) Town size tiers - hamlet (2 shops), village (5), city (10+ with districts)
231. [ ] (13) More towns with their own identity (desert trading post, dwarven mine town, elven village)
232. [ ] (120) Day and night in town - lamps light up, shops close at night, busy tavern, guards patrol with torches
233. [ ] (121) Townsfolk routines - NPCs walk between home, work and the tavern; talk to them for gossip and hints
234. [ ] (122) Ambient life - chickens, dogs, cats, market chatter, hammering, chimney smoke
235. [ ] (123) Weather in town - puddles, snow on roofs, people ducking indoors
236. [ ] (133) Better building interiors - upstairs rooms, cellars, usable furniture (sit on chairs, read books)
237. [ ] (134) Shop signs and banners that show what each building sells from a distance
238. [ ] (135) Town welcome banner with the town's name and your reputation level when you arrive
239. [ ] (136) Notice board news - rumours of nearby dungeons, bounty posters, events on the map
240. [ ] (125) Temple or chapel - restore prayer, bless holy symbols, a priest with undead-hunting quests
241. [ ] (126) Guild halls - Warriors', Rangers', Wizards', Cooks', Miners' and Crafting guilds with skill-level entry and better benches and resources
242. [ ] (127) Arena or duel pit - fight waves of monsters for prizes and titles
243. [ ] (129) Minigames - fishing contest, cooking competition, archery range, darts in the tavern
244. [ ] (130) Tavern gambling - dice, cards, a wheel of fortune
245. [ ] (131) Town upgrades - donate gold and materials for walls, a bigger market or new buildings, unlocking better stock
246. [ ] (128) Docks and harbour master - boat travel to other port towns and islands

### Sailing and islands
_Boats, islands and sea fishing_

247. [ ] (15) Boats between islands, with island-only resources
248. [ ] (74) Sailing - build and upgrade your boat, chart sea routes to the islands (ties into the boats idea)
249. [ ] (358) Harpoon fishing from a boat and ice fishing through holes

### Quests
_The quest system first, then the quest content_

250. [ ] (150) Quest journal - every quest with its status and a written log of what happened
251. [ ] (161) Quest map markers for every step, and a 'next step' line in the tracker
252. [ ] (163) Abandon and retry failed quests - no permanent lockouts
253. [ ] (147) Quest points - a running total that unlocks areas, guilds and gear, with a quest cape at the end
254. [ ] (148) Quest requirements - skill levels and earlier quests needed, so the world opens up gradually
255. [ ] (149) Dialogue choices that change rewards, allies or how a quest ends
256. [ ] (154) Quest givers all over town - the blacksmith wants rare ore, the alchemist needs herbs, the innkeeper has rats
257. [ ] (155) Quests found in the world - a note on a skeleton, a hermit in the woods, a ghost in a graveyard
258. [ ] (156) Dungeon quests - a trapped adventurer on floor 3, a lost relic on the boss floor
259. [ ] (153) Chain quests - multi-part series (goblin war, haunted mine) where each part unlocks the next
260. [ ] (151) Puzzle quests - brazier order, riddle doors, sliding-tile locks, chess-knight crossings
261. [ ] (152) Boss quests - a quest built around one named boss with a unique arena and mechanics
262. [ ] (157) Faction quests - Mages' Circle, Thieves' Guild, Royal Guard; quest lines, ranks and rewards
263. [ ] (158) Unique quest rewards - gear, spells, prayers and shortcuts only quests give
264. [ ] (159) Quest unlocks - new teleports, areas, shops or spellbooks
265. [ ] (160) Achievement diaries - easy to elite task lists per region, with a reward item per tier
266. [ ] (12) Story quests - hand-made quest chains with dialogue
267. [ ] (146) Main storyline - a continent-wide threat (waking lich or dragon cult) over 8-10 quests, ending in a unique final dungeon
268. [ ] (79) Clue scrolls - treasure trails from drops and skilling (dig, search, do tasks) with cosmetic rewards
269. [ ] (180) Treasure maps and clue scroll rewards - rare cosmetics and gilded armour
270. [ ] (181) Tomes - use once to learn a spell or perk permanently

### Audio
_The whole sound system in one pass_

271. [ ] (258) Music system - tracks per area (overworld, towns, sites, bosses) with crossfades; synthesized in the browser to keep the file small
272. [ ] (259) Region themes - grassland, desert, swamp, tundra, sea, with night versions
273. [ ] (260) Combat music that fades in when a fight starts and out when it ends
274. [ ] (261) Boss themes - a unique track per named boss
275. [ ] (262) Music player - unlock tracks by visiting places, replay any of them
276. [ ] (263) Stingers - short cues for quest complete, rare drop, level 99, boss appears, new place discovered
277. [ ] (264) Title screen theme
278. [ ] (265) Ambient soundscapes - wind, birds, insects outdoors; waves on the coast; drips and rumbles in dungeons; market chatter in towns
279. [ ] (266) Day and night ambience - birds by day, crickets and owls at night
280. [ ] (267) Weather sounds - rain, thunder, storm wind
281. [ ] (268) Room reverb - caves echo, small rooms sound dry
282. [ ] (269) Footsteps by surface - grass, stone, wood, sand, snow, water; armour clank for plate
283. [ ] (270) Weapon-specific sounds - sword clang, mace thud, bow twang, per-element spell sounds, arrow whistle
284. [ ] (271) Skilling sounds - axe chops, pickaxe clinks, fishing splash and reel, cooking sizzle, anvil hammering, fire crackle
285. [ ] (272) Environment sounds - doors, chests, stairs, portals, traps, levers
286. [ ] (273) Pickup sounds by item type - coins jingle, gems chime, armour clanks, potions slosh
287. [ ] (246) Monster sounds - growls, hisses, roars, per-attack sounds
288. [ ] (224) UI sounds - clicks, page turns, coins, level-up chime

### Graphics and lighting
_Renderer and world visuals_

289. [ ] (280) Better lighting - soft shadows, warm sunrise and sunset, blue moonlight, light shafts through trees and dungeon cracks
290. [ ] (281) Bloom and glow - magic, lava, torches and glowing gear bleed light
291. [ ] (282) Colour grading per region - warm desert, murky green swamp, cold blue tundra, dark red volcanic
292. [ ] (283) Volumetric fog and mist - low mist over swamps and graveyards, dust in mines
293. [ ] (285) Better terrain - blended ground textures (grass, dirt, rock), cliffs, height detail
294. [ ] (286) Swaying grass and plants, plus flowers, rocks and bushes
295. [ ] (287) Better water - reflections, waves, shore foam, animated rivers and waterfalls
296. [ ] (288) Better trees - more species shapes, falling autumn leaves, snow-covered in the north
297. [ ] (289) Sky - moving clouds, stars and moon at night, sunrise colours

### Big standalone systems
_Large self-contained systems, best done last_

298. [ ] (19) Player house built with Construction (workshop, trophy room, portal chamber)
299. [ ] (73) Archaeology - dig sites on the overworld; restore relics into lore, gear and permanent perks
300. [ ] (75) Necromancy - a fourth combat style that raises skeletons and ghosts to fight for you
## Backlog

### Skills and gathering
- (1) Gathering sites - dedicated groves, fishing docks and herb gardens with richer nodes
- (2) Thieving - pickpocket town NPCs, steal from stalls, crack dungeon chests, angry guards
- (3) Agility - obstacle shortcuts (log balances, wall climbs, rope swings)
- (4) Farming - plant seeds in town patches, come back later to harvest

### Combat and gear
- (7) Special attacks - a spec bar that fills over time, a special move per weapon

### Economy and social
- (17) Grand Exchange-style market with shifting prices

### Quality of life
- (20) Key rebinding on the Key Binds page
- (24) Settings page (volume, camera speed, click-to-walk speed, graphics quality)


### Character design
- (44) Rare cosmetics from drops - party hats, masks, boss pets that follow you
- (45) Emotes - wave, bow, dance, cheer, unlockable skill-cape emote
- (46) Titles - "the Slayer", "Dragonbane", shown over your head and on your plate
- (47) Aura effects for milestones (glow at total level 1000, flames at combat 100)

### Combat
- (62) Blocking and parrying - skip your attack to block; a shield reflects damage
- (63) Readable enemy attacks - telegraphed tiles light up a turn before a big hit
- (66) Staves with built-in spells - trident-style staves that cast without runes
- (67) Tick-eating and combo food - eat and attack in the same turn
- (68) Stat-boosting potions - super attack, strength and defence; prayer and restore potions
- (69) Combat XP lamps and stat restore at altars and shrines
- (70) Multi-combat and single-combat areas
- (71) Health bars over every visible monster

### Skills
- (83) Hunter - box traps, snares, bird nets, tracking; furs, feathers and meat
- (84) Herblore as its own skill - clean herbs, unfinished potions, secondaries, combat potions
- (85) Summoning - pouches from monster charms; familiars that fight, carry or heal
- (86) Divination - energy wisps turned into boosts and xp for other skills
- (87) Dungeoneering - a randomized start-from-nothing dungeon mode with token rewards
- (88) Skilling outfits - lumberjack, angler and prospector pieces for bonus xp, set bonus
- (89) Skilling pets - rare pet drops while gathering
- (90) Random skilling events - nests, bonus veins, big fish, ents
- (91) Daily skilling tasks and challenges for bonus xp and gold
- (92) Skill boosts - potions and foods that raise a skill for a while
- (93) Better Firemaking - coloured fires, bonfires with a health boost, beacons

### World map
- (109) Resource layer - seen trees, fishing spots, herb patches and ore as icons
- (110) Danger heat map - regions tinted by monster level
- (111) Signposts at crossroads pointing to nearby towns and sites
- (112) Mounts - buy or tame a horse for faster travel, with upgrades
- (113) Fairy rings or spirit trees - a second fast-travel network, unlocked by finding its nodes
- (114) Teleport runes and tablets to specific places
- (115) Caravans - paid rides between towns, sometimes ambushed
- (116) Hidden treasure - buried chests found from map fragments
- (117) Seasons - spring to winter, changing resources and encounters, snow in the north

### Towns
- (137) General store and market square with rotating stalls (fish, gems, silk, furs)
- (138) Magic shop - runes, staves and spell tomes, so the Alchemist focuses on potions
- (139) Archery shop or fletcher
- (140) Stable for buying mounts
- (141) Library - lore books, bestiary entries, skill guides
- (142) Jail, for players caught thieving
- (143) Town jobs - deliveries, rat catching, firewood for the inn
- (144) Town specialities - one rare item per town
- (145) Rival towns - helping one annoys its rival and changes prices

### Quests
- (164) Cutscenes - short camera moments for villains, waking bosses, opening doors
- (165) Mystery quests - talk to suspects, find clues, accuse the right person
- (166) Gathering and crafting quests - a wedding feast, a sword for the captain, a plague cure
- (167) Delivery and courier quests with time limits or fragile cargo
- (168) Stealth quests - sneak into a bandit fort unseen
- (169) Defence quests - hold a town or tower against waves
- (170) Companion quests - recruit an NPC ally who travels and fights with you
- (171) Quest xp lamps - put xp into any skill you choose

### Items and gear
- (193) Item upgrading - smith or imbue gear +1 to +5, with a failure chance at high levels
- (194) Sockets and gems - gem slots in gear, gems cut with Crafting
- (195) Enchanting jewellery - ring of recoil, games necklace, amulet of glory
- (196) Charged items - trident, blowpipe, charged staves refilled with runes or scales
- (197) Degrading gear - barrows armour wears down and needs repairs
- (198) Consumables - stat potions, anti-fire, stamina, teleport tablets, bombs
- (199) Equipment presets - save melee, ranged and magic loadouts, switch in one click

### UI
- (226) Special attack orb (if special attacks are added)
- (227) Better touch controls - tap to walk, long-press menu, pinch to zoom
- (228) Colour-blind modes for minimap, rarity and combat-triangle colours
- (229) Text size option and high-contrast mode
- (230) Screen shake and flashing toggles

### Monsters
- (251) Slayer-only monsters needing special gear (banshees, cockatrices, turoths, gargoyles)
- (252) Boss rematch altar - refight killed bosses for loot
- (253) Monsters that interact with the world - goblins grab items, rats flee to holes, bats sleep until disturbed
- (254) Monster infighting - undead against the living, orcs against elves
- (255) Ambushers - hidden in sand, chests or statues
- (256) Fleeing and calling for help - wounded monsters run to their pack
- (257) Sleeping monsters - sneak up for a first-hit bonus

### Sound and music
- (275) Adaptive music - layers added as danger rises, tense at low health, calm at camp
- (276) Positional sound - louder when closer, panned left and right
- (277) Hit feedback sounds - armour, flesh, bone, shield block
- (278) Mute when the tab isn't focused
- (279) Recorded or sampled sounds as an option (makes the file larger)

### Graphics
- (297) Weather visuals - rain streaks, piling snow, lightning, sandstorms
- (298) Distant view - far mountains and landmarks with haze
- (299) Hit effects - blood or spark particles, landing dust
- (300) Footprints and trails in snow and sand
- (301) Portal and teleport particle effects
- (302) Art style choice - 2007-style low-poly or smoother modern
- (303) Outline or cel shading option
- (304) Pixel-art filter option
- (305) Level of detail - simpler models in the distance

### Economy
- (319) Supply and demand between towns - buy cheap in one town, sell high in another
- (320) Trade routes and caravans - haul goods for profit, more for dangerous routes
- (321) Price history graph per item
- (322) Haggling - reputation knocks a few percent off
- (323) Repair costs for degrading gear
- (324) Upkeep - mount feed, companion wages
- (325) Temple donations for temporary blessings
- (326) Cosmetics as a gold sink
- (327) Grand Exchange trade tax
- (328) Treasure hunting and selling relics to collectors
- (329) Run your own shop stall and sell crafted goods over time
- (330) Bank interest on stored gold
- (331) Bank loans with interest

### Pets (on hold)
- (182) Pet items - eggs and stones that hatch into pets
- (238) Boss pets - a rare drop from each boss that follows you

### Crafting
- (345) Snakeskin, spined and carapace armour from specific monster hides
- (346) Signed items - 'Crafted by' your name
- (347) Crafting outfit - bonus xp and a chance to save materials
- (348) Portable crafting kits
- (349) Tool quality - better needles, chisels and moulds
- (350) Crafting quests
- (351) Commissions from townsfolk for gold and reputation
- (352) Repair kits for degrading gear

### Gathering
- (364) Gathering mini-game - a timing bar for bonus yield
- (365) Auto-bank or note resources at high level
- (366) Bonus drops while gathering - clues, gems, seeds
- (367) Portable processing - portable furnace, range, fletching kit
- (368) Double processing - gather and process in one step at high level
- (369) Shared world resources with NPC gatherers
- (370) Gathering leaderboard of personal records

### Magic
- (382) Utility spells - Bones to Bananas, Telekinetic Grab, Superheat Item, Charge
- (383) Teleport spells to each town, house and dungeon entrances
- (384) Elemental combos - water then lightning, fire then air
- (385) Enchant spells for bolts, jewellery and staves
- (386) Spell tomes as drops unlocking rare spells
- (387) Staff special effects - Staff of the Dead, Kodai wand rune saving
- (388) Magic armour set bonuses (Ahrim's, Infinity, Virtus)
- (389) Rune-saving chance from Magic level and gear
- (390) Magic Training Arena minigame
- (391) Mage Arena challenge for the god spells
- (392) Magic xp from utility spells

### Ranged
- (404) Thrown weapons as a main weapon - throwing axes, javelins, knives
- (405) Dwarf multicannon using cannonballs
- (406) Ballista - heavy two-handed ranged weapon
- (407) Kiting - step back and shoot with bonus accuracy
- (408) Height advantage when shooting from higher ground
- (409) Trick shots - piercing and ricochet at high level
- (410) Ranged set bonuses (Karil's, Armadyl, void-style)
- (411) Ranged amulets and rings (Archer's ring, anguish)
- (412) Ranging guild target minigame
- (413) Shooting birds for feathers and meat
- (414) Ranged challenges and festival trick-shot contests

### Melee
- (423) Attack style options per weapon (e.g. scimitar Chop or Lunge)
- (424) Armour defence per damage type
- (425) Granite maul - slow hit with an instant extra blow
- (426) Obsidian weapons with a matching-necklace bonus
- (427) Knockback from maces and hammers
- (428) Lunge - step and strike in one turn
- (429) Riposte - double damage after a block
- (430) Execute - bonus damage under 20% health
- (431) Offensive and defensive stances
- (432) Strength and attack prayer ladder (Burst of Strength to Chivalry)
- (433) Warriors' Guild minigame
- (434) Defenders - tiered off-hand from bronze to dragon
- (435) Impact feedback - sparks, heavier shake for two-handers, crit pause
- (436) Weapon trails coloured by metal tier

### Prayer
- (445) More bone types - bat, wolf, dragon, dagannoth, superior dragon
- (446) Gilded altar - offer bones for 3.5x xp
- (447) Ashes and ensouled heads for Prayer xp
- (448) Bonecrusher - auto-buries bones
- (449) Chaos altar in the Wilderness
- (450) Retribution - damage nearby monsters when you die
- (451) Smite - drain monsters' prayer
- (452) Rapid Heal and Rapid Restore
- (453) Preserve - potion boosts last longer
- (454) Augury - the top magic prayer
- (455) Swap prayer books at a special altar
- (456) Prayer flicking rewarded against style-switching bosses
- (457) Gods to follow - Saradomin, Zamorak, Guthix
- (458) Priest blessings for a donation
- (459) Holy and unholy books as a prayer off-hand
- (460) Overworld shrines with timed buffs
- (461) Prayer activation and out-of-points sounds

### Overworld
- (477) Climbable mountains, passes and ledges (Agility or rope)
- (478) Swimming and wading
- (479) Underground tunnel network linking regions
- (480) Travellers on the roads with rumours or requests
- (481) Collectibles across the world with set rewards
- (482) Discovery xp for new places
- (483) Travel fatigue and rations (optional)
- (484) Gliders and balloons for fast travel
