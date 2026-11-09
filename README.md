# HOME v2 — 3D home viewer

Version 2 of [pspk001/home](https://github.com/pspk001/home): the same 35′-5″ × 49′-9″ house, on the
same foundation and columns, with a reworked ground floor. The main entrance is now on the north side,
from a 13 ft side strip with an open car parking and a big puja room. Made with **three.js** (WebGL)
and plain HTML/CSS/JavaScript.

**Live site:** https://pspk001.github.io/home_v2/ · **Version 1:** https://pspk001.github.io/home/

## What changed in v2

The foundation and every column of the house are unchanged: only partitions, doors and windows move.

- **Portico → living room** (14′-0″ × 11′-11″, the front part of the old portico): enclosed with a front wall that has two big windows, the TV between them. A passage beside bedroom 1 leads to a wide arch into the lobby, where the old main door was.
- **Entrance on the north side:** the main door (teak, double) is in the north wall of the living room, with granite steps up from the side strip, a wood-clad surround, a canopy, lights and the house name plate. The north side is now the entrance face.
- **Bedroom 1, 11′-0″ × 13′-0″, with a walk-in closet:** it takes the old living room and the back of the old portico. The bed stands against the closet wall, with two north windows and the TV on the front wall. The walk-in closet behind the bed has open rails, shelves and drawers, and a full-length mirror. Its door is from the lobby, and the arch to the hall is closed.
- **Open kitchen, 11′-0″ × 10′-8″** (the back part of the old bedroom 1): there is no wall to the dining table, and no store. The old bedroom wall is gone, and the first-floor wall above it rests on a beam between the existing columns. The window on the garden side sits over the sink. There is an L-shaped counter, hob and chimney on the back wall, a tall fridge, and a small breakfast island with two stools.
- **Lobby open to the dining hall:** the wall between the lobby passage and the dining hall is gone.
- **Old kitchen → bedroom 2's walk-in closet:** reached through an arch from bedroom 2, and walled off from the dining hall on grid 5. Open wardrobes run along the back and east walls, with a dressing table.
- **Side strip, 13 ft wide (north side):** at the street there is a car gate and a pedestrian gate. Behind them come a paved entrance court with the steps to the main door, then an open car parking (the SUV), then a small garden with a tulsi chaura outside the kitchen window. The 13′ × 13′ puja room stands at the back.
- **Puja room (13′ × 13′ outside):** built against the house's north wall in the strip and entered through teak doors from the old small puja room, which is now the way to it from the back of the hall. Inside are a carved mandir on a marble platform, brass lamps, a bell, a floor rug, and windows onto the garden. On its roof stands a small temple spire with a kalash and flag.
- **Structure:** where first-floor walls now stand over open rooms, they rest on beams between the existing columns: grid 2 along the open kitchen, the bedroom-3 wall over bedroom 1's closet, and the terrace's back wall over bedroom 1.
- Because the 13′ × 13′ puja room covers the back part of the house's north wall, the kitchen's window fits in the part of that wall left open beyond it (about 3′-7″ wide, from counter height to 8′-6″).

| Open kitchen | Puja room | Entrance & parking |
|---|---|---|
| ![Open kitchen](docs/walk-kitchen.jpg) | ![Puja room](docs/walk-puja.jpg) | ![Entrance and parking](docs/walk-garden.jpg) |

![Exterior](docs/exterior.jpg)

| Dollhouse cut-away | Plan view | Walk-through |
|---|---|---|
| ![Dollhouse](docs/dollhouse.jpg) | ![Plan](docs/plan.jpg) | ![Walk](docs/walk-bedroom.jpg) |

| First floor (2BHK) | First-floor plan | Roof terrace |
|---|---|---|
| ![First floor](docs/dollhouse-ff.jpg) | ![First-floor plan](docs/plan-ff.jpg) | ![Roof](docs/roof.jpg) |

![Double-height dining hall](docs/walk-hall.jpg)
*The dining area rises double height, overlooked by the first-floor dining area across a glass railing. Along the back the wall is solid up to door height, with a tall glass wall above it facing the sunrise. The kitchen beside it has a normal ceiling, with the first-floor dressing room above.*

| Walk-in wardrobe & dressing (first floor) | Common bathroom under the stair |
|---|---|
| ![Walk-in wardrobe](docs/walk-dressing.jpg) | ![Under-stair bathroom](docs/walk-stair-bath.jpg) |

![First-floor dining](docs/walk-ff-dining.jpg)
*Upstairs, the dining table of the first-floor flat stands at the railing, with the living room behind a slatted teak screen.*


---

## Open it (no install)

Double-click **`Home-3D-Viewer.html`**. It is one self-contained file (~780 KB) with all code,
styles and textures inside, so it works offline in any recent Chrome, Edge, Safari or Firefox
(WebGL 2 required). It also works on phones and tablets.

## What you can do

| Control | What it does |
|---|---|
| **Exterior** | Orbit around the house: drag to rotate, scroll / pinch to zoom, right-drag / two fingers to pan |
| **Ground floor / First floor / Roof** | Choose the level to look at. The room list, labels and minimap follow it, and the dollhouse and plan views slice the walls just above that floor |
| **Dollhouse** | Walls sliced at 7′-7″ above the chosen floor so every room is visible from above, from any angle |
| **Plan** | Top-down view of the chosen floor, with furniture |
| **Walk** | First-person tour: drag to look, <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows to move (<kbd>Shift</kbd> to run), double-click the floor to walk there. The stairs climb from the ground floor to the first floor and on to the roof, and you can walk out onto the front terrace and the roof terrace. On phones use the on-screen joystick |
| **Rooms list / labels / minimap** | Click any room to fly into it. The info card shows level, size, area, floor finish and a **Walk inside** button |
| **Angle** | One-click Front / Left / Back / Right / Top views |
| **Wall cut** | Slice the whole house at any height (from 1 ft above the floor up to the full house) |
| **Sun** | Move the sun from 7 AM to 6:30 PM (shadows update). As on site, it rises behind the house and sets over the road |
| **Room labels / Furniture / Auto-rotate** | Toggles |
| 📷 | Save the current view as a PNG |

Keyboard: <kbd>1</kbd>–<kbd>4</kbd> views · <kbd>PgUp</kbd> / <kbd>PgDn</kbd> floor up / down · <kbd>L</kbd> labels · <kbd>F</kbd> furniture · <kbd>R</kbd> auto-rotate · <kbd>Esc</kbd> back.

## Tech stack

| Layer | Used |
|---|---|
| Markup / styling | HTML5, CSS3 (custom properties, backdrop blur, responsive bottom sheet for phones) |
| Language | JavaScript (ES modules) |
| 3D engine | [three.js](https://threejs.org) r186: WebGL 2 renderer, PBR materials, soft shadows, OrbitControls, CSS2DRenderer (labels), Sky, RoomEnvironment, RoundedBoxGeometry, BufferGeometryUtils |
| Tooling | [Vite](https://vite.dev) 8 (dev server + bundler) and `vite-plugin-singlefile` (builds the offline single HTML file) |
| Textures | Generated in code on `<canvas>`: vitrified and marble tiles, oak flooring, granite, subway and bathroom tiles, wood cladding, siding, pavers, plinth stone, grass, fabric, rug, asphalt. There are no image files |

## Edit and rebuild

Needs [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev      # live dev server (opens http://localhost:5173)
npm run build    # writes dist/index.html and refreshes Home-3D-Viewer.html
npm run preview  # serve the production build
```

### Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main`: it installs the packages, runs
`npm run build` and publishes `dist/` to GitHub Pages (**Settings → Pages → Source: GitHub Actions**).
Edit the code, push, and the live site updates in about a minute.

### Where things live

```
home/
├─ Home-3D-Viewer.html   standalone build: double-click to open
├─ index.html            page + UI markup (Vite entry)
├─ package.json          dependencies and scripts
├─ vite.config.js        single-file build setup
├─ .github/workflows/    GitHub Pages build + deploy
├─ docs/                 preview screenshots
└─ src/
   ├─ main.js            start-up and loading screen
   ├─ config.js          levels (plinth, ceilings, slabs, roof), door/window heights, plot, stair, colours
   ├─ plan.js            every ground-floor wall, opening, door and room, measured from the floor plan (in feet)
   ├─ plan-ff.js         the first-floor flat (walls, doors, windows, rooms) and the roof, plus their minimap outlines
   ├─ textures.js        procedural canvas textures
   ├─ materials.js       material library + the "wall cut" section shader
   ├─ geometry.js        batching, world-scale UVs, extrusion and mesh-merging helpers
   ├─ style.css          UI styles (desktop side panel, phone bottom sheet)
   ├─ build/
   │  ├─ structure.js    ground-floor walls, floors, ceiling slab, staircase, bathroom tiles, kitchen dado
   │  ├─ openings.js     ground-floor windows (frames, glass, grilles, sills, chajjas) and doors
   │  ├─ firstfloor.js   first-floor walls, doors and windows, floors, bathroom tiles, and the stair up to the roof
   │  ├─ exterior.js     stair tower front, roof terrace and parapets, rear glass wall, pipe line shaft, mumty, C-frame, cladding, gates, street
   │  └─ furniture.js    beds, wardrobes, sofas, dining, kitchens, toilets, mandir, SUV, fans, terrace and roof furniture…
   └─ viewer/
      ├─ viewer.js       renderer, lights, sky, view modes, room focus, picking
      ├─ walk.js         first-person walking (collisions, stairs, joystick)
      ├─ tween.js        camera animation helper
      └─ ui.js           panel, room list, minimap, info card, shortcuts
```

### Common tweaks

- **Wall paint:** `src/materials.js`, e.g. `paint('pBed1', 0xd3ddcb)`; feature walls are `accentBed1`, `accentBed2`, `accentGuest`, `accentLiving`, and upstairs `accentBed3`, `accentBed4` (first-floor rooms use `pFFLiving`, `pFFKitchen`, `pFFBed3`, `pFFBed4`).
- **Floor finish of a room:** `floor:` in `ROOMS` (`src/plan.js`) or `FF_ROOMS` (`src/plan-ff.js`). Options: `tileMarble`, `tileWarm`, `wood`, `woodLight`, `tileKitchen`, `tileBath`, `marble`, `graniteGrey`, `pavers`, `terrace`.
- **First-floor layout:** `FF_WALLS`, `FF_DOORS` and `FF_ROOMS` in `src/plan-ff.js` (opening heights there are measured from the first-floor slab).
- **Heights (plinth, ceiling, doors, windows):** `LV` and `OPENING` in `src/config.js`.
- **Move or add furniture:** `buildFurniture()` in `src/build/furniture.js` (positions are in feet).

## How the model was made

- **Walls, columns, doors and windows:** measured from the supplied floor plan (22.73 px = 1 ft) and converted to feet. The origin is the front-left corner of the building, and the rear boundary is slanted exactly as drawn (48′-9″ left, 47′-2″ right).
- **Furniture:** placed where the furnished plan shows it.
- **Assumed heights:** 2′ plinth, 11′ clear ground-floor height, 6″ slabs, 7′ door heads, window sills 3′ above the floor.
- **Facade:** colours and features come from the elevation image: sage walls, tan stair tower with tall windows, the white "C" frame around the first-floor terrace, the wood-cladding panel and its frame, the slatted box at the base, the gates, the portico canopy, the parapet with vents and the white railing.
- **Open double-height space (design change):** the walls between the drawing/dining hall, the kitchen and the old garden are gone, so the three share one space. The garden is paved in with the hall, and the puja room now opens onto it. There is no first-floor slab over the dining area and the middle of the hall: they rise about 22 ft to a solid roof with a board-formed concrete soffit. The kitchen has a normal ceiling (see below). The double height reaches forward to grid F, where the first floor ends in a glass railing over an exposed concrete beam. The old garden bay keeps a normal ceiling, with an exposed beam along its edge. Along the back, behind the dining area, the rear (east) wall is solid up to door height (7 ft above the floor) and a teak-framed glass wall above it rises to the roof between two columns, so the morning sun comes in over the lower wall. The old garden bay has a window from door height up to its ceiling. A cascade of glass globes hangs over the dining table. The wash basin stands against the rear wall beside the kitchen counter. The config is `VOID` in `src/config.js`.
- **Kitchen and dressing room (design change):** the kitchen is no longer double height: the first-floor slab now runs over it, on an exposed concrete beam along grid 5 (the line between the kitchen and the dining area), and its rear (east) wall is solid, with no windows. Above it, bedroom 4 extends back into a walk-in wardrobe and dressing room (12′-0″ × 8′-3″), entered through a door beside the study desk: open hanging rails, shelves and drawers along the back and south walls, a dressing table with a lit mirror against the wall to the double-height hall, a full-length mirror and an island with drawers.
- **Bathroom (design change):** the two ground-floor toilets are now one bathroom (13′-6″ × 5′-6″) for the family, entered from the dining hall; the door from the guest room is closed. A double vanity, WC, and a shower with a glass screen beside the ventilator to the pipe line shaft.
- **Common bathroom under the stair (design change):** the space under the second flight and the mid landing is a bathroom, entered from the passage to the stair. The shower and wash basin stand at floor level under the tall front window; three 6″ steps lead down to a floor sunk 1′-6″, so there is 6′-9″ clear under the landing, where the WC is. The landing is now a slab, and a wall rises beside flight 1 to the soffit of flight 2 (so flight 1 has no railing). Its layout is `STAIR_BATH` in `src/config.js`.
- **Guest room wardrobe (design change):** the front end of the pipe line shaft (4′-10″, next to the stair) is walled off as a built-in wardrobe opening into the guest room; the guest window moved towards the back to clear it, and the bed now stands in the middle of the bathroom wall with the TV opposite it in the middle of the stair wall. On the first floor the same space is an alcove off the kitchen for the fridge and a tall pantry unit. The config is `GUEST_WR` in `src/config.js`.
- **Bedroom 2's door (design change, v1):** moved to the old kitchen end of its wall; the hall's crockery unit stands where its old door was.
- **Car:** a full-size 7-seater SUV in graphite grey, parked nose-out in the side strip. It is a generic model, not a specific make.
- **Side strip (v2):** see *What changed in v2*. Its layout is `GARDEN` in `src/config.js` (width, puja room, lawn, parking, gates, main door).
- **Name plate:** raised brass letters on a black granite plate beside the main door on the north side: a name, with a designation in smaller letters below it. Its text is set in `src/materials.js` and is separate from the app's title ("HOME", in `index.html`).
- **Columns (design change):** two columns are added to the original column layout: one in the rear wall on grid 2 (where the old garden bay meets the dining area) and one on grid 5 at grid F (bedroom 2's wall, under the first-floor edge beam). Column B5 is shown standing in the rear glass wall. The config is `REAR_COLS` in `src/config.js` and `C-F5` in `src/plan.js`.
- **First floor (design proposal):** the supplied drawings cover only the ground floor, so the first floor is a proposed 2BHK flat. Its partitions sit over the ground-floor walls wherever possible. From the stair landing a teak main door opens into an entrance passage, with the kitchen off it through an arch (L-shaped counter, sink under a window onto the pipe line shaft, hob and chimney, and an alcove for the fridge and a pantry unit). The passage leads to the dining area, whose 6-seater table stands at the glass railing on grid F, looking down into the double-height hall. Beyond a slatted teak screen and TV unit is the living room, which opens onto the front terrace over the portico through a sliding glass door. Bedroom 3 (the master bedroom, over bedroom 1 and the puja room) is entered from the living room. It has an armchair, a dressing table beside the door, windows to the north and east, and a large teak-framed window into the double-height hall. The north-west corner is a study corner open to the rest of the room: a bookshelf on the west wall, and beside it a work desk and office chair, where the desk faces a window looking out to the north (this corner was an attached bathroom in the first version). Bedroom 4 (over bedroom 2) opens off the dining area: its bed stands in the middle of the south wall with a TV opposite, and its clothes are in its own walk-in wardrobe and dressing room over the ground-floor kitchen. One bathroom (the old common toilet and bedroom 4's bathroom combined, 12′-0″ × 5′-6″) opens off the dining area, with a wash basin, WC and a glass-screened shower. Wet areas are stacked over the ground-floor bathroom, and the bathroom and the kitchen take light and air from the pipe line shaft. A glazed door from the stair landing also opens onto the front terrace.
- **Glass sunroof (design change):** a 8′-7″ × 3′-10″ sunroof in the roof over the double-height dining area, along the rear wall just behind the chandelier. On the roof it sits on a white curb, with a teak-framed glass lid sloping gently forward on steel glazing bars. The config is `SUNROOF` in `src/config.js`.
- **Stair to the roof:** the dog-legged stair continues from the first-floor landing up to the roof in the same tower, with steel-and-teak railings, a balustrade round the stair well at the top, and a door from the mumty onto the roof terrace. The roof is walkable all over, including over the double-height space, behind a 3 ft parapet; the water tank and the pipe line shaft's parapet stand on it.
- **Pipe line area:** as in the original drawing, the plumbing shaft beside the guest room is open to the sky (now shortened: its front end is the guest room's wardrobe). The first-floor slab and the roof are cut away over it, walls enclose it on the first floor, and a parapet surrounds the opening on the roof. The config is `DUCT` in `src/config.js`.

## Assumptions and limitations

- The first-floor layout was not provided. The 2BHK flat shown is a proposal that fits the elevation (terrace over the portico, stair tower and mumty, parapets) and the ground-floor structure. Room sizes are in `src/plan-ff.js` and can be adjusted. The window positions on the side and rear walls of the first floor are part of the proposal too.
- The dashed "X" in the entrance lobby is treated as the entrance lobby. It is not modelled as a double-height cut-out.
- The plan shows no door swings, so doors are shown open and the main door is pushed back against the lobby wall.
- The plan labels the hall 10′×24′. As drawn, a partition separates the passage, which left about 10′×20′ of dining/drawing space. With the old garden merged in, the hall now runs about 24′ from that partition to the rear wall.
- Added for context: the road, footpath, trees and neighbouring compound walls.
- Orientation: the back of the house faces east and the road faces west, so the sun rises behind the house and sets over the road.
