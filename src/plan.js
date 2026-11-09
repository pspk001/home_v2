import { rearZ, REAR_T, REAR_COL_D, DUCT, GARDEN, GUEST_WR, STAIR_BATH } from './config.js';
const PJ = GARDEN.puja;
import { FF_ROOMS, ROOF_ROOMS } from './plan-ff.js';

// ---------------------------------------------------------------------------
// Ground-floor plan data.
// Every value was measured off the supplied floor-plan drawing
// (22.73 px = 1 ft) and converted to feet. See config.js for the axes.
//
// WALLS: axis-aligned wall pieces. x/z = footprint extents.
//   s0 / s1 = finish on the "low" and "high" side of the wall
//   (vertical wall: s0 = -x face, s1 = +x face; horizontal wall: s0 = -z (rear) face, s1 = +z (front) face)
//   open[] = openings measured along the wall's long axis (a → b)
//     t: 'door' | 'main' | 'arch' | 'win' | 'kwin' | 'vent' | 'swin'
//     door: key into DOORS (leaf style / hinge / swing side)
// ---------------------------------------------------------------------------

export const WALLS = [
  // Outer walls ------------------------------------------------------------
  // north wall: the puja room is built against its back end; the open kitchen's big window
  // looks out over the small garden, and the main door opens from the entrance court
  { id: 'L-puja', x: [0.0, 0.792], z: [-48.748, -43.689], s0: 'pPujaBig', s1: 'pPuja', open: [{ t: 'main', a: -47.45, b: -44.15, door: 'puja' }] },
  { id: 'L-kit-a', x: [0.0, 0.792], z: [-43.689, PJ.z1], s0: 'pPujaBig', s1: 'pKitchen' },
  { id: 'L-kit-b', x: [0.0, 0.792], z: [PJ.z1, -31.6], s0: 'ext', s1: 'pKitchen', open: [{ t: 'bwin', a: PJ.z1 + 0.4, b: -31.95 }] },
  { id: 'L-bed1', x: [0.0, 0.792], z: [-31.6, -12.7], s0: 'ext', s1: 'pBed1', open: [{ t: 'win', a: -25.2, b: -21.0 }, { t: 'win', a: -17.6, b: -14.0 }] },
  { id: 'L-living', x: [0.0, 0.792], z: [-12.7, 0.0], s0: 'ext', s1: 'pLiving',
    open: [{ t: 'main', a: GARDEN.mainDoor[0], b: GARDEN.mainDoor[1], door: 'main' }, { t: 'win', a: -3.9, b: -1.5 }] },
  { id: 'R-kitchen', x: [34.581, 35.417], z: [-47.164, -38.321], s0: 'pBed2', s1: 'ext' },
  { id: 'R-bed2', x: [34.581, 35.417], z: [-38.321, -26.882], s0: 'accentBed2', s1: 'ext' },
  { id: 'R-toilet2', x: [34.581, 35.417], z: [-26.882, -20.282], s0: 'pToilet', s1: 'ext' },
  { id: 'R-duct', x: [35.021, 35.417], z: [-20.282, -9.635], s0: 'pDuct', s1: 'ext' },
  { id: 'R-stair', x: [34.581, 35.417], z: [-9.635, 0.0], s0: 'pToilet', s1: 'ext' },

  // Way to the puja room / old garden bay / open kitchen (rear strip) ---------------
  // (the old small puja room is the way through to the big puja room in the side strip;
  //  the old garden is part of the hall; the open kitchen backs onto both)
  { id: 'puja-R', x: [5.852, 6.643], z: [-48.616, -43.689], s0: 'pPuja', s1: 'pHall', open: [{ t: 'arch', a: -47.252, b: -44.173 }] },
  { id: 'G-puja', x: [0.792, 6.643], z: [-43.689, -42.941], s0: 'pPuja', s1: 'pKitchen' },
  { id: 'G-bed1', x: [6.643, 12.231], z: [-43.689, -42.941], s0: 'pHall', s1: 'pKitchen', open: [{ t: 'win', a: 7.171, b: 11.263 }] },

  // Big puja room in the side strip (13' × 13' outside): its own walls on three sides,
  // the house wall on the fourth -------------------------------------------------------
  { id: 'PJ-side', x: [PJ.x0, PJ.x0 + PJ.wall], z: [PJ.z0, PJ.z1], s0: 'ext', s1: 'pPujaBig' },
  { id: 'PJ-back', x: [PJ.x0 + PJ.wall, PJ.x1], z: [PJ.z0, PJ.z0 + PJ.wall], s0: 'ext', s1: 'pPujaBig' },
  { id: 'PJ-front', x: [PJ.x0 + PJ.wall, PJ.x1], z: [PJ.z1 - PJ.wall, PJ.z1], s0: 'pPujaBig', s1: 'ext',
    open: [{ t: 'win', a: PJ.x0 + 1.9, b: PJ.x0 + 4.9 }, { t: 'win', a: -4.9, b: -1.9 }] },

  // Hall / bedroom 2 / toilets ---------------------------------------------
  { id: 'C8', x: [22.174, 22.922], z: [-38.321, -37.529], s0: 'pHall', s1: 'pBed2' },
  { id: 'C-F5', x: [22.174, 22.922], z: [-31.326, -30.534], s0: 'pHall', s1: 'pBed2' }, // column added on grid F: carries the first-floor edge beam
  { id: 'B2-left', x: [22.174, 22.526], z: [-37.529, -27.322], s0: 'pHall', s1: 'pBed2', open: [{ t: 'door', a: -37.45, b: -33.89, door: 'bed2' }] }, // door at the kitchen end
  { id: 'C10', x: [22.174, 22.922], z: [-27.322, -26.53], s0: 'pHall', s1: 'pToilet' },
  { id: 'K-B2', x: [22.922, 34.581], z: [-38.321, -37.969], s0: 'pBed2', s1: 'pBed2', open: [{ t: 'arch', a: 26.25, b: 28.35 }] }, // into bedroom 2's walk-in closet
  // the walk-in closet (the old kitchen) is closed off from the dining hall on grid 5
  { id: 'CL-hall', x: [22.174, 22.526], z: [rearZ(22.922) + REAR_COL_D, -38.321], s0: 'pHall', s1: 'pBed2' },
  { id: 'T-top-a', x: [20.678, 22.174], z: [-26.882, -26.53], s0: 'pHall', s1: 'pToilet' },
  { id: 'T-top-b', x: [22.922, 34.581], z: [-26.882, -26.53], s0: 'pBed2', s1: 'pToilet' },
  { id: 'T1-left-a', x: [20.678, 21.03], z: [-26.53, -23.098], s0: 'pHall', s1: 'pToilet', open: [{ t: 'door', a: -26.266, b: -23.45, door: 'toilet1' }] }, // the bathroom's door, from the dining hall
  { id: 'T1-left-b', x: [20.678, 21.03], z: [-23.098, -21.074], s0: 'pLobby', s1: 'pToilet' },
  { id: 'C12', x: [20.634, 21.426], z: [-21.074, -20.282], s0: 'pLobby', s1: 'pGuest' },
  { id: 'T-bot', x: [21.426, 31.59], z: [-21.074, -20.678], s0: 'pToilet', s1: 'pGuest' }, // (old door from the guest room closed)
  { id: 'T2-duct', x: [32.382, 34.581], z: [-21.074, -20.282], s0: 'pToilet', s1: 'pDuct', open: [{ t: 'vent', a: 32.602, b: 34.185 }] },
  // wall between the shaft and the guest room's wardrobe in its front end
  { id: 'D-wr', x: [DUCT.x0, DUCT.x1], z: [DUCT.z1, GUEST_WR.z0], s0: 'pDuct', s1: 'wardrobeIn' },

  // Guest room / lobby ------------------------------------------------------
  { id: 'G-right', x: [31.59, 32.382], z: [-21.074, GUEST_WR.z0 - 0.375], s0: 'accentGuest', s1: 'pDuct', open: [{ t: 'win', a: -19.4, b: -15.8 }] },
  { id: 'G-right-wr', x: [31.59, 32.382], z: [GUEST_WR.z0 - 0.375, -9.635], s0: 'accentGuest', s1: 'wardrobeIn', open: [{ t: 'wr', a: GUEST_WR.z0, b: GUEST_WR.z1 }] },
  { id: 'G-left', x: [20.678, 21.03], z: [-20.282, -9.635], s0: 'pLobby', s1: 'pGuest', open: [{ t: 'door', a: -13.595, b: -10.031, door: 'guest' }] },
  { id: 'bump', x: [20.15, 20.678], z: [-18.831, -18.039], s0: 'pLobby', s1: 'pLobby' },
  { id: 'LP-lintel', x: [16.103, 20.15], z: [-18.831, -18.039], s0: 'pLobby', s1: 'pLobby', open: [{ t: 'arch', a: 16.103, b: 20.15 }] },
  { id: 'GB-lobby', x: [20.15, 21.03], z: [-9.635, -8.843], s0: 'pLobby', s1: 'pStair' },
  { id: 'GB-guest-a', x: [21.03, STAIR_BATH.well.x0], z: [-9.635, -8.843], s0: 'pGuest', s1: 'pStair' },
  { id: 'GB-guest-b', x: [STAIR_BATH.well.x0, 32.382], z: [-9.635, -8.843], s0: 'pGuest', s1: 'pToilet' },
  { id: 'GB-duct', x: [32.382, 34.581], z: [-9.635, -8.843], s0: 'wardrobeIn', s1: 'pToilet' },
  { id: 'LS-lintel', x: [16.103, 20.15], z: [-9.635, -8.843], s0: 'pLobby', s1: 'pStair', open: [{ t: 'arch', a: 16.103, b: 20.15 }] },

  // Front (stair room) + portico ---------------------------------------------
  { id: 'F-stair-a', x: [15.619, 25.298], z: [-0.792, 0.0], s0: 'pToilet', s1: 'extTan', open: [{ t: 'swin', a: 19.798, b: 22.79 }] },
  { id: 'F-stair-b', x: [25.298, 35.417], z: [-0.792, 0.0], s0: 'pToilet', s1: 'ext' },
  // bathroom under the stair: its wall to the stair passage, up to the first-floor slab
  // (under flight 2 it carries on with a sloping top, and under the landing a cross
  //  wall closes it off from flight 1: both in structure.js)
  { id: 'SB-wall', x: [STAIR_BATH.x0, 23.05], z: STAIR_BATH.wall, s0: 'pStair', s1: 'pToilet', open: [{ t: 'door', a: STAIR_BATH.door[0], b: STAIR_BATH.door[1], door: 'stairBath' }] },
  // (the old main door from the portico is now a wide arch from the living room to the lobby)
  { id: 'P-right-a', x: [14.827, 15.619], z: [-18.831, -9.239], s0: 'pLiving', s1: 'pLobby', open: [{ t: 'arch', a: -15.707, b: -11.615 }] },
  { id: 'P-right-b', x: [14.827, 15.619], z: [-9.239, STAIR_BATH.wall[0]], s0: 'pLiving', s1: 'pStair' },
  { id: 'P-right-c', x: [14.827, 15.619], z: [STAIR_BATH.wall[0], 0.0], s0: 'pLiving', s1: 'pToilet' },
  // the living room's front wall, where the portico was open: two big windows with the TV between them
  { id: 'F-living', x: [0.792, 14.827], z: [-0.792, 0.0], s0: 'pLiving', s1: 'extTan', open: [{ t: 'bwin', a: 1.7, b: 5.6 }, { t: 'bwin', a: 10.0, b: 13.9 }] },
  { id: 'stub-a', x: [15.619, 16.103], z: [-18.831, -18.039], s0: 'pLobby', s1: 'pLobby' },
  { id: 'stub-b', x: [15.619, 16.103], z: [-9.635, -8.843], s0: 'pLobby', s1: 'pStair' },
  // bedroom 1 reaches forward into the old portico (the old wall here is gone: the first-floor
  // wall above rests on a beam, structure.js); a passage beside it leads from the living
  // room to the arch into the lobby
  { id: 'P-top-b', x: [12.231, 14.827], z: [-18.831, -18.039], s0: 'pLobby', s1: 'pLiving' },
  { id: 'B1-front', x: [0.792, 11.879], z: [-13.5, -12.7], s0: 'accentBed1', s1: 'pLiving' },
  { id: 'B1-east', x: [11.879, 12.231], z: [-18.831, -12.7], s0: 'pBed1', s1: 'pLiving' },

  // Bedroom 1 (the old living room) / open kitchen (the old bedroom 1) / hall ------------
  // (the old bedroom-1 wall to the hall is gone: the kitchen is open to the dining table;
  //  the first-floor wall above it is carried on a beam between the columns, structure.js)
  { id: 'LV-right-a', x: [11.879, 12.231], z: [-30.534, -23.098], s0: 'pBed1', s1: 'pHall' },
  { id: 'LV-right-b', x: [11.879, 12.231], z: [-23.098, -18.831], s0: 'pBed1', s1: 'pLobby', open: [{ t: 'door', a: -22.658, b: -19.139, door: 'bed1' }] },
  { id: 'C7', x: [11.439, 12.231], z: [-31.326, -30.534], s0: 'pKitchen', s1: 'pBed1' },
  { id: 'B1-LV', x: [0.792, 11.439], z: [-31.6, -31.25], s0: 'pKitchen', s1: 'pBed1' },
  // bedroom 1's walk-in closet, between the kitchen and the bed, open at its east end
  { id: 'B1-cl', x: [0.792, 9.55], z: [-26.85, -26.5], s0: 'pBed1', s1: 'accentBed1' },
  // (the wall between the lobby passage and the dining hall is gone)
];

// Door leaves: which jamb carries the hinge ('a' | 'b'), which side of the
// wall the leaf swings into (0 = s0 side, 1 = s1 side), and the leaf style.
export const DOORS = {
  main:    { double: true, side: 1, style: 'teak', flat: true }, // main door (north side), pushed fully open against the living-room wall
  puja:    { double: true, side: 0, style: 'teak', flat: true }, // into the big puja room
  bed1:    { hinge: 'b', side: 0, style: 'wood' },
  bed2:    { hinge: 'a', side: 1, style: 'wood' },
  guest:   { hinge: 'b', side: 1, style: 'wood' },
  toilet1: { hinge: 'a', side: 1, style: 'pvc' },
  stairBath: { hinge: 'a', side: 1, style: 'pvc' },
};

// Rooms: floor rectangles [x0, x1, z0, z1]. `rear:true` rooms run under the
// slanted rear wall. `level` → floor height key in LV.
export const ROOMS = [
  { id: 'living', name: 'Living Room', size: '14′-0″ × 11′-11″', rects: [[0.792, 14.827, -12.7, -0.792], [12.231, 14.827, -18.039, -12.7]], floor: 'tileWarm', level: 'gf',
    note: 'In the front part of the old portico. The main door opens into it from the entrance court on the north side; a passage beside bedroom 1 leads to a wide arch into the lobby. Two big windows to the street with the TV between them, a 3-seater sofa, an armchair and a coffee table.' },
  { id: 'lobby', name: 'Lobby', size: '5′-0″ × 9′-0″ + passage', rects: [[15.619, 20.678, -18.831, -9.635], [12.231, 20.678, -22.922, -18.831]], floor: 'tileMarble', level: 'gf',
    note: 'Through the arch from the living room. Leads to the stair, the guest room and bedroom 1, and opens straight into the dining hall (no wall between them).' },
  { id: 'bed1', name: 'Bedroom 1', size: '11′-0″ × 13′-0″ + closet', rects: [[0.792, 11.879, -26.5, -13.5], [9.55, 11.879, -31.25, -26.5]], floor: 'wood', level: 'gf',
    note: 'Where the old living room was, reaching forward into the old portico. Door from the lobby. Queen bed against the closet wall, two north windows, TV on the front wall, and a walk-in closet behind the bed.' },
  { id: 'bed1Closet', name: 'Walk-in Closet', size: '8′-9″ × 4′-5″', rects: [[0.792, 9.55, -31.25, -26.85]], floor: 'wood', level: 'gf',
    note: 'Bedroom 1’s walk-in closet: open hanging rails, shelves and drawers along the back wall, a full-length mirror at the end.' },
  { id: 'hall', name: 'Drawing / Dining Hall', size: '10′-0″ × 24′-0″ + old garden bay', floor: 'tileMarble', level: 'gf', rear: true,
    rects: [[12.231, 22.174, -43.689, -26.882], [12.231, 20.678, -26.882, -22.922], [6.643, 22.174, -48.836, -43.689]],
    note: 'One open space with the open kitchen and the old garden bay. The dining end and the middle of the hall rise double height up to the first-floor railing on grid F, lit by a tall glass wall above door height facing the sunrise and a glass sunroof; the old garden bay keeps a normal ceiling. A glass-globe chandelier hangs over the table; wash basin against the rear wall.' },
  { id: 'kitchen', name: 'Open Kitchen', size: '11′-0″ × 10′-8″', rects: [[0.792, 12.231, -42.941, -31.6]], floor: 'tileKitchen', level: 'gf',
    note: 'In the back part of the old bedroom 1, open to the dining table (no wall). L-shaped counter with the sink under the window onto the garden, hob and chimney on the back wall, fridge, and a small breakfast island with two stools.' },
  { id: 'bed2', name: 'Bedroom 2', size: '12′-0″ × 11′-0″', rects: [[22.526, 34.581, -37.969, -26.882]], floor: 'wood', level: 'gf',
    note: 'Queen bed with side tables, wardrobe, TV wall, and a walk-in closet behind (the old kitchen).' },
  { id: 'bed2Closet', name: 'Walk-in Closet (Bed 2)', size: '12′-0″ × 8′-0″', rects: [[22.526, 34.581, -48.176, -38.321]], floor: 'woodLight', level: 'gf', rear: true,
    note: 'Where the kitchen was, through an arch from bedroom 2: open hanging rails, shelves and drawers along the back and east walls, and a dressing table.' },
  { id: 'guest', name: 'Guest Room', size: '10′-6″ × 11′-0″', rects: [[21.03, 31.59, -20.282, -9.635]], floor: 'woodLight', level: 'gf',
    note: 'Queen bed, TV, an armchair and a built-in wardrobe in the old shaft space, beside the window.' },
  { id: 'toilet2', name: 'Bathroom', size: '13′-6″ × 5′-6″', rects: [[21.03, 34.581, -26.53, -21.074]], floor: 'tileBath', level: 'gf',
    note: 'The two old toilets made into one bathroom for the family, entered from the dining hall (no door from the guest room): a double vanity, WC, and a shower with a glass screen beside the ventilator to the pipe line shaft.' },
  { id: 'stairBath', name: 'Common Bathroom', size: '19′-0″ × 4′-2″ + 3′-11″ × 3′-11″', floor: 'tileBath', level: 'gf',
    rects: [
      [STAIR_BATH.x0, STAIR_BATH.steps[0], STAIR_BATH.wall[1], STAIR_BATH.z1],
      [STAIR_BATH.steps[0], STAIR_BATH.steps[1], STAIR_BATH.wall[1], STAIR_BATH.z1, 1.5],
      [STAIR_BATH.steps[1], STAIR_BATH.steps[2], STAIR_BATH.wall[1], STAIR_BATH.z1, 1.0],
      [STAIR_BATH.steps[2], STAIR_BATH.x1, STAIR_BATH.wall[1], STAIR_BATH.z1, 0.5],
      [STAIR_BATH.well.x0 + 0.25, STAIR_BATH.x1, STAIR_BATH.well.z0, STAIR_BATH.wall[1], 0.5],
    ],
    note: 'Under the stair, off the passage from the lobby. Shower and wash basin at floor level under the tall front window; three steps lead down to a floor 1′-6″ lower, so there is 6′-9″ clear under the mid landing, where the WC is.' },
  { id: 'pujaWay', name: 'Way to Puja Room', size: '5′-0″ × 4′-0″', rects: [[0.792, 5.852, -48.836, -43.689]], floor: 'marble', level: 'gf', rear: true,
    note: 'The old small puja room, now the way from the back of the hall through teak doors into the big puja room.' },
  { id: 'puja', name: 'Puja Room', size: '13′-0″ × 13′-0″', rects: [[PJ.x0 + PJ.wall, PJ.x1, PJ.z0 + PJ.wall, PJ.z1 - PJ.wall]], floor: 'marble', level: 'gf',
    note: 'Built in the side strip against the north wall of the house, entered from the way through the old puja room. A carved mandir on the back wall, two windows onto the garden, and a small temple spire on its roof.' },
  { id: 'stair', name: 'Staircase', size: '19′-0″ × 8′-0″', rects: [[15.619, STAIR_BATH.well.x0, -8.843, STAIR_BATH.wall[0]]], floor: 'graniteGrey', level: 'gf',
    note: 'Dog-legged stair, 20 risers to the first floor. The space under the second flight and the landing is the common bathroom.' },
  { id: 'duct', name: 'Pipe Line Area', size: '2′-7″ × 5′-5″', rects: [[DUCT.x0, DUCT.x1, DUCT.z0, DUCT.z1]], floor: 'concrete', level: 'duct',
    note: 'Service shaft for plumbing, open to the sky: it runs up through the first floor and the roof. The guest room window and the bathroom ventilator open onto it; its front end is now the guest room wardrobe.' },
  { id: 'garden', name: 'Garden', size: '12′-5″ × 6′-9″', rects: [[GARDEN.x0 + GARDEN.wall, 0, GARDEN.lawn[0], GARDEN.lawn[1]]], floor: 'grass', level: 'garden',
    note: 'A small lawn between the puja room and the parked car, outside the kitchen window: a tulsi chaura, flower beds and a small tree.' },
  { id: 'parking', name: 'Car Parking & Entrance', size: '12′-5″ × 29′-10″', rects: [[GARDEN.x0 + GARDEN.wall, 0, GARDEN.parking[0], GARDEN.z1]], floor: 'pavers', level: 'garden',
    note: 'The side strip (13 ft wide, north side) from the street: a car gate and a pedestrian gate open into a paved entrance court with steps up to the main door, and an open car parking behind it.' },
];

for (const r of ROOMS) r.floorId = 'gf';

/** The three levels you can visit, and every room on them (first floor and roof in plan-ff.js). */
export const FLOORS = [
  { id: 'gf', name: 'Ground floor', short: 'Ground' },
  { id: 'ff', name: 'First floor', short: 'First' },
  { id: 'roof', name: 'Roof', short: 'Roof' },
];
export const ALL_ROOMS = [...ROOMS, ...FF_ROOMS, ...ROOF_ROOMS];
export const roomById = (id) => ALL_ROOMS.find((r) => r.id === id) || null;

// Helpers -------------------------------------------------------------------
export function roomBounds(room) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [a, b, c, d] of room.rects) {
    x0 = Math.min(x0, a); x1 = Math.max(x1, b); z0 = Math.min(z0, c); z1 = Math.max(z1, d);
  }
  return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
}

/** Point used for the room's label / camera target (centre of its largest rectangle). */
export function roomAnchor(room) {
  let best = room.rects[0], area = 0;
  for (const r of room.rects) {
    const a = (r[1] - r[0]) * (r[3] - r[2]);
    if (a > area) { area = a; best = r; }
  }
  return { x: (best[0] + best[1]) / 2, z: (best[2] + best[3]) / 2 };
}

export function roomArea(room) {
  // rectangles that run under the slanted rear wall are measured to its inside face
  return room.rects.reduce((s, [x0, x1, z0, z1]) => {
    const back = room.rear && z0 < rearZ(x0) + 1 ? (rearZ(x0) + rearZ(x1)) / 2 + REAR_T : z0;
    return s + (x1 - x0) * (z1 - back);
  }, 0);
}

/** Room containing the plan point on the given floor ('gf' | 'ff' | 'roof'). */
export function findRoomAt(x, z, floor = 'gf') {
  for (const room of ALL_ROOMS) {
    if (room.floorId !== floor) continue;
    for (const [a, b, c, d] of room.rects) {
      if (x >= a && x <= b && z >= c && z <= d) return room;
    }
  }
  return null;
}
