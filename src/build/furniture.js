import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { extrudeXZ, worldUV } from '../geometry.js';
import { LV, rearZ, REAR_T, STAIR, STAIR_BATH, GUEST_WR, PLOT, GARDEN } from '../config.js';
const PLOT_W = PLOT.width;

// ---------------------------------------------------------------------------
// Furniture, placed where the furnished plan shows it (positions converted
// from the drawing). All pieces are simple procedural models.
// ---------------------------------------------------------------------------

// Finished floor and ceiling of the storey being furnished (switched for the first
// floor and the roof in buildFurniture)
let F = LV.gf;
let CEIL = LV.gfCeil;

let M; // material getter
let group;
let colliders;
let walkables;

function mesh(geo, mat, x, y, z, parent = group, { ry = 0, uv = true, shadow = true } = {}) {
  if (uv) worldUV(geo);
  const m = new THREE.Mesh(geo, typeof mat === 'string' ? M(mat) : mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
// The radius is kept at least 0.01 ft short of half the thinnest side: a flat strip
// thinner than that becomes a hair-thin sliver of triangles, which some renderers
// draw with a wrong depth (it then shows through walls as a dotted line).
const rbox = (w, h, d, r = 0.1, s = 3) =>
  new RoundedBoxGeometry(w, h, d, s, Math.max(0.001, Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01)));
const cyl = (r0, r1, h, s = 16) => new THREE.CylinderGeometry(r0, r1, h, s);

/** Creates an item group at (x, floor, z) rotated by ry and registers an optional collider. */
function item(x, z, ry = 0, y = F) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  group.add(g);
  return g;
}
function collide(x0, x1, z0, z1, h = 3, y0 = F) {
  colliders.push({ x0, x1, z0, z1, y0, y1: y0 + h, id: 'furniture' });
}

// ---------------------------------------------------------------------------
// Pieces. Local frame: the piece "faces" +z (its front), centred on x/z,
// sitting on y = 0.
// ---------------------------------------------------------------------------
function bed(g, w, l, blanket) {
  mesh(rbox(w, 1.0, l, 0.08), 'furnWood', 0, 0.55, 0, g);
  mesh(rbox(w - 0.2, 0.7, l - 0.3, 0.2), 'sheet', 0, 1.35, 0.1, g);
  mesh(rbox(w + 0.1, 3.6, 0.35, 0.1), 'furnWood', 0, 1.8, -l / 2 - 0.1, g); // back face at -l/2 - 0.275
  mesh(rbox(w - 0.5, 1.9, 0.2, 0.15), 'sofa', 0, 2.6, -l / 2 + 0.12, g);
  for (const s of [-1, 1]) mesh(rbox(w * 0.42, 0.45, 1.1, 0.2), 'pillow', s * w * 0.23, 1.85, -l / 2 + 0.85, g);
  mesh(rbox(w + 0.1, 0.18, l * 0.58, 0.08), blanket, 0, 1.73, l * 0.2, g);
  mesh(rbox(w + 0.12, 0.5, 0.12, 0.05), blanket, 0, 1.5, l * 0.2 + l * 0.29, g);
}
function sideTable(g, withLamp = true) {
  mesh(rbox(1.2, 1.8, 1.1, 0.05), 'furnWood', 0, 0.9, 0, g);
  mesh(box(1.0, 0.03, 0.02), 'brass', 0, 1.3, 0.56, g);
  if (withLamp) {
    mesh(cyl(0.1, 0.18, 0.8), 'brass', 0, 2.2, 0, g);
    mesh(cyl(0.3, 0.42, 0.55, 20), 'lampShade', 0, 2.85, 0, g, { uv: false });
  }
}
function wardrobe(g, w, h = 7.2, d = 1.9, mat = 'laminate') {
  mesh(box(w, h, d), mat, 0, h / 2, 0, g);
  const doors = Math.max(2, Math.round(w / 1.6));
  for (let i = 1; i < doors; i++) mesh(box(0.03, h - 0.4, 0.02), 'laminateGrey', -w / 2 + (w * i) / doors, h / 2, d / 2 + 0.005, g, { uv: false });
  for (let i = 0; i < doors; i++) {
    const cx = -w / 2 + (w * (i + 0.5)) / doors + (i % 2 ? -1 : 1) * (w / doors) * 0.35;
    mesh(box(0.05, 1.4, 0.06), 'brass', cx, h * 0.5, d / 2 + 0.03, g, { uv: false });
  }
  mesh(box(w, 0.25, d - 0.2), 'laminateGrey', 0, 0.12, -0.1, g);
}
function tv(g, w = 3.7, h = 2.1) {
  mesh(rbox(w, h, 0.12, 0.03), 'screen', 0, 0, 0, g);
  mesh(box(w - 0.1, h - 0.1, 0.01), 'tvScreen', 0, 0, 0.065, g, { uv: false });
}
function tvConsole(g, w) {
  mesh(rbox(w, 1.4, 1.25, 0.05), 'furnWood', 0, 0.8, 0, g);
  for (let i = 0; i < 3; i++) mesh(box(w / 3 - 0.1, 1.1, 0.02), 'laminate', -w / 3 + (w / 3) * i, 0.8, 0.63, g, { uv: false });
  mesh(box(w, 0.1, 1.0), 'blackMatte', 0, 0.05, -0.05, g);
}
function sofa(g, len, depth = 2.85, seats = 3, mat = 'sofa') {
  const h = 1.3;
  mesh(rbox(len, h, depth, 0.15), mat, 0, h / 2 + 0.3, 0, g);
  mesh(rbox(len, 1.6, 0.6, 0.2), mat, 0, 2.3, -depth / 2 + 0.3, g);
  for (const s of [-1, 1]) mesh(rbox(0.55, 1.1, depth, 0.2), mat, s * (len / 2 - 0.27), 2.0, 0, g);
  const sw = (len - 1.1) / seats;
  for (let i = 0; i < seats; i++) {
    const x = -len / 2 + 0.55 + sw * (i + 0.5);
    mesh(rbox(sw - 0.05, 0.45, depth - 0.7, 0.18), mat, x, h + 0.5, 0.25, g);
    mesh(rbox(sw - 0.1, 1.3, 0.45, 0.2), mat, x, 2.25, -depth / 2 + 0.75, g);
  }
  mesh(rbox(1.1, 1.0, 0.35, 0.2), 'cushionMustard', -len / 2 + 1.1, 2.1, -depth / 2 + 1.05, g, { ry: 0.15 });
  mesh(rbox(1.1, 1.0, 0.35, 0.2), 'sofaAccent', len / 2 - 1.1, 2.1, -depth / 2 + 1.05, g, { ry: -0.15 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(cyl(0.06, 0.04, 0.3, 8), 'blackMatte', sx * (len / 2 - 0.3), 0.15, sz * (depth / 2 - 0.3), g, { uv: false });
}
function armchair(g, w = 3.0, d = 2.7) {
  sofa(g, w, d, 1, 'sofaAccent');
}
function coffeeTable(g, w, d) {
  mesh(rbox(w, 0.12, d, 0.04), 'furnWood', 0, 1.35, 0, g);
  mesh(box(w - 0.3, 0.04, d - 0.3), 'glass', 0, 1.43, 0, g, { uv: false, shadow: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(box(0.14, 1.3, 0.14), 'furnWood', sx * (w / 2 - 0.15), 0.65, sz * (d / 2 - 0.15), g);
  mesh(box(w - 0.3, 0.06, d - 0.3), 'furnWood', 0, 0.35, 0, g);
  mesh(cyl(0.35, 0.25, 0.3, 16), 'ceramic', 0.1, 1.56, -0.4, g, { uv: false });
}
function diningTable(g, w, l) {
  mesh(rbox(w, 0.18, l, 0.06), 'furnWood', 0, 2.45, 0, g);
  for (const sz of [-1, 1]) {
    mesh(box(0.25, 2.35, 0.25), 'furnWood', 0, 1.18, sz * (l / 2 - 0.7), g);
    mesh(box(w - 0.6, 0.2, 0.3), 'furnWood', 0, 0.12, sz * (l / 2 - 0.7), g);
  }
  mesh(box(0.2, 0.15, l - 1.4), 'furnWood', 0, 1.4, 0, g);
  mesh(cyl(0.45, 0.35, 0.35, 20), 'ceramic', 0, 2.72, 0, g, { uv: false });
  for (let i = 0; i < 3; i++) mesh(new THREE.SphereGeometry(0.16, 12, 8), i === 1 ? 'saffron' : 'leaf', -0.1 + i * 0.12, 2.95, (i - 1) * 0.1, g, { uv: false });
}
function chair(g) {
  mesh(rbox(1.5, 0.3, 1.45, 0.06), 'chairFabric', 0, 1.55, 0, g);
  mesh(rbox(1.5, 1.8, 0.22, 0.08), 'chairFabric', 0, 2.55, -0.65, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(box(0.12, 1.45, 0.12), 'furnWood', sx * 0.62, 0.72, sz * 0.6, g);
}
/** Swivel office chair facing local +z: padded seat and back, gas column, five-star base on castors. */
function officeChair(g) {
  mesh(rbox(1.55, 0.32, 1.5, 0.12), 'sofaGrey', 0, 1.62, 0.05, g);
  mesh(rbox(1.45, 1.9, 0.25, 0.12), 'sofaGrey', 0, 2.85, -0.68, g);
  mesh(box(0.12, 0.9, 0.08), 'blackMatte', 0, 2.0, -0.62, g);
  for (const sx of [-1, 1]) {
    mesh(box(0.1, 0.5, 0.1), 'blackMatte', sx * 0.72, 1.98, 0.05, g);
    mesh(rbox(0.16, 0.08, 0.95, 0.03), 'blackMatte', sx * 0.72, 2.26, 0.05, g);
  }
  mesh(cyl(0.07, 0.07, 1.05, 12), 'chrome', 0, 0.95, 0, g, { uv: false });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const leg = mesh(box(0.14, 0.09, 1.0), 'blackMatte', Math.sin(a) * 0.5, 0.33, Math.cos(a) * 0.5, g);
    leg.rotation.y = a;
    mesh(new THREE.SphereGeometry(0.09, 10, 8), 'blackMatte', Math.sin(a) * 0.98, 0.1, Math.cos(a) * 0.98, g, { uv: false });
  }
}
/** Work desk along a wall: x, z = centre, w = length along z; the wall is on -x, the user sits on +x. */
function studyDesk(x, z, w) {
  const g = item(x, z, Math.PI / 2); // local +z → world +x (into the room), local x along the wall
  mesh(rbox(w, 0.12, 2.0, 0.03), 'furnWood', 0, 2.44, 0, g);
  for (const sx of [-1, 1]) mesh(box(0.1, 2.38, 1.8), 'blackMatte', sx * (w / 2 - 0.15), 1.19, 0, g);
  mesh(box(w - 0.3, 0.08, 0.08), 'blackMatte', 0, 2.3, -0.85, g);
  // drawer pedestal under one end
  mesh(box(1.3, 1.9, 1.7), 'laminate', w / 2 - 0.95, 0.97, 0.05, g);
  for (const y of [0.6, 1.25, 1.75]) mesh(box(0.6, 0.04, 0.03), 'steel', w / 2 - 0.95, y, 0.91, g, { uv: false });
  // laptop on a stand, open
  mesh(box(0.9, 0.05, 0.7), 'blackMatte', -0.4, 2.62, -0.15, g, { uv: false });
  const lid = mesh(box(1.15, 0.8, 0.03), 'screen', -0.4, 3.02, -0.52, g, { uv: false });
  lid.rotation.x = -0.18;
  mesh(box(1.1, 0.04, 0.78), 'laminateGrey', -0.4, 2.67, -0.12, g, { uv: false });
  // keyboard, mouse, notebook, mug, lamp, plant
  mesh(box(1.2, 0.04, 0.4), 'laminateGrey', -0.4, 2.52, 0.55, g, { uv: false });
  mesh(box(0.14, 0.05, 0.22), 'blackMatte', 0.45, 2.52, 0.55, g, { uv: false });
  mesh(box(0.7, 0.05, 0.95), 'saffron', 1.1, 2.53, 0.25, g, { uv: false });
  mesh(cyl(0.12, 0.11, 0.3, 14), 'ceramic', 1.55, 2.65, -0.35, g, { uv: false });
  mesh(cyl(0.22, 0.25, 0.06, 16), 'blackMatte', -1.75, 2.53, -0.55, g, { uv: false });
  const arm = mesh(cyl(0.035, 0.035, 1.3, 8), 'blackMatte', -1.75, 3.15, -0.45, g, { uv: false });
  arm.rotation.x = 0.35;
  const shade = mesh(cyl(0.12, 0.26, 0.32, 16), 'blackMatte', -1.75, 3.75, -0.1, g, { uv: false });
  shade.rotation.x = 0.55;
  mesh(cyl(0.11, 0.11, 0.02, 14), 'lampShade', -1.75, 3.62, -0.02, g, { uv: false });
  plant(x - 0.6, z - w / 2 + 0.35, 0.45, F + 2.5);
}
/** Open bookshelf against a wall, facing local +z. */
function bookshelf(g, w, h, d) {
  mesh(box(w, h, 0.06), 'furnLight', 0, h / 2, -d / 2 + 0.03, g);
  for (const sx of [-1, 1]) mesh(box(0.08, h, d), 'furnLight', sx * (w / 2 - 0.04), h / 2, 0, g);
  const shelves = 5;
  for (let i = 0; i <= shelves; i++) mesh(box(w - 0.16, 0.07, d - 0.06), 'furnLight', 0, 0.12 + (i * (h - 0.2)) / shelves, 0.03, g);
  const colours = ['blanketBlue', 'blanketRust', 'sofaGrey', 'blanketSage', 'cushionMustard', 'blanketMaroon'];
  for (let i = 0; i < shelves; i++) {
    const y0 = 0.16 + (i * (h - 0.2)) / shelves;
    let x = -w / 2 + 0.15, k = i * 3;
    while (x < w / 2 - 0.5) {
      if ((k + i) % 7 === 3) { x += 0.45; k++; continue; } // a gap now and then
      const bw = 0.1 + ((k * 37) % 5) * 0.03, bh = 0.62 + ((k * 13) % 4) * 0.08;
      mesh(box(bw, bh, d * 0.7), colours[k % colours.length], x + bw / 2, y0 + bh / 2, 0.05, g, { uv: false });
      x += bw + 0.015;
      k++;
    }
  }
}
function ceilingFan(x, z, blades = 'furnWood') {
  const g = item(x, z, Math.random() * 3, CEIL);
  mesh(cyl(0.05, 0.05, 1.2, 8), 'white', 0, -0.6, 0, g, { uv: false, shadow: false });
  mesh(cyl(0.38, 0.32, 0.32, 20), 'white', 0, -1.3, 0, g, { uv: false });
  for (let i = 0; i < 3; i++) {
    const b = mesh(box(1.85, 0.03, 0.38), blades, 0, -1.33, 0, g, { shadow: false });
    b.geometry.translate(1.25, 0, 0);
    b.rotation.y = (i * Math.PI * 2) / 3;
  }
  mesh(new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 'lampShade', 0, -1.47, 0, g, { uv: false }).rotation.x = Math.PI;
}
function ceilingLight(x, z, r = 0.45) {
  mesh(cyl(r, r, 0.06, 24), 'lightPanel', x, CEIL - 0.03, z, group, { uv: false, shadow: false });
}
/** Cascade of frosted glass globes hanging on long wires from the double-height ceiling. */
function globeChandelier(cx, cz) {
  const top = LV.ffCeil;
  mesh(cyl(1.1, 1.1, 0.06, 32), 'brass', cx, top - 0.03, cz, group, { uv: false, shadow: false });
  const n = 15;
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996;                        // golden-angle spiral
    const r = 0.2 + 0.75 * Math.sqrt((i + 0.5) / n);
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    const y = LV.gf + 7.4 + ((i * 7) % n) / n * 4.6; // 7′-4″ … 12′ above the floor
    const len = top - y - 0.3;
    mesh(cyl(0.012, 0.012, len, 4), 'blackMatte', x, y + 0.3 + len / 2, z, group, { uv: false, shadow: false });
    mesh(cyl(0.05, 0.05, 0.12, 8), 'brass', x, y + 0.3, z, group, { uv: false, shadow: false });
    mesh(new THREE.SphereGeometry(0.27, 16, 12), 'globeGlass', x, y, z, group, { uv: false, shadow: false });
  }
}
/** Long cylindrical pendant lamp hanging from the double-height ceiling (bottom at y). */
function pendant(x, z, y) {
  const len = LV.ffCeil - y - 0.9;
  mesh(cyl(0.015, 0.015, len, 4), 'blackMatte', x, y + 0.9 + len / 2, z, group, { uv: false, shadow: false });
  mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 20, 1, true), 'blackMatte', x, y + 0.45, z, group, { uv: false });
  mesh(cyl(0.28, 0.28, 0.02, 20), 'lampShade', x, y + 0.05, z, group, { uv: false, shadow: false });
  mesh(cyl(0.3, 0.3, 0.04, 16), 'blackMatte', x, LV.ffCeil - 0.02, z, group, { uv: false, shadow: false });
}
function plant(x, z, s = 1, y = F, pot = 'pot') {
  const g = item(x, z, 0, y);
  mesh(cyl(0.55 * s, 0.4 * s, 1.1 * s, 16), pot, 0, 0.55 * s, 0, g, { uv: false });
  mesh(cyl(0.5 * s, 0.5 * s, 0.05, 16), 'soil', 0, 1.08 * s, 0, g, { uv: false });
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    const leaf = mesh(new THREE.IcosahedronGeometry(0.45 * s, 0), i % 2 ? 'leaf' : 'leafDark', Math.cos(a) * 0.35 * s, (1.6 + i * 0.28) * s, Math.sin(a) * 0.35 * s, g, { uv: false });
    leaf.scale.set(1, 1.5, 1);
  }
  return g;
}
function wallArt(x, y, z, ry, w = 3, h = 2, mat = 'art') {
  const g = item(x, z, ry, y);
  mesh(box(w + 0.2, h + 0.2, 0.08), 'blackMatte', 0, 0, 0, g, { uv: false });
  const a = mesh(new THREE.PlaneGeometry(w, h), mat, 0, 0, 0.045, g, { uv: false, shadow: false });
  a.castShadow = false;
}
function curtainGeo(w, h) {
  const geo = new THREE.PlaneGeometry(w, h, 24, 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin((p.getX(i) / w) * Math.PI * 9) * 0.12);
  geo.computeVertexNormals();
  return geo;
}
/** Curtains on both sides of a window. axis: 'x' wall runs along x, 'z' along z. face: plane coordinate, dir: +1/-1 into room */
function curtains(axis, face, a, b, dir, mat = 'sofa') {
  const h = 7.6, y = F + 0.1 + h / 2;
  const cw = 1.3;
  const off = face + dir * 0.35;
  for (const [c] of [[a - 0.3 + cw / 2], [b + 0.3 - cw / 2]]) {
    const m = new THREE.Mesh(curtainGeo(cw, h), M(mat));
    m.castShadow = true; m.receiveShadow = true;
    if (axis === 'x') { m.position.set(c, y, off); }
    else { m.position.set(off, y, c); m.rotation.y = Math.PI / 2; }
    group.add(m);
  }
  const rod = new THREE.Mesh(cyl(0.04, 0.04, b - a + 1.2, 8), M('brass'));
  rod.rotation.z = Math.PI / 2;
  if (axis === 'x') rod.position.set((a + b) / 2, F + 7.85, off);
  else { rod.position.set(off, F + 7.85, (a + b) / 2); rod.rotation.set(Math.PI / 2, 0, 0); }
  group.add(rod);
}

// ---------------------------------------------------------------------------
// Wardrobes you can see into: clothes on a rail, folded things on shelves
// ---------------------------------------------------------------------------
const GARMENTS = ['blanketBlue', 'sheet', 'blanketMaroon', 'curtainBeige', 'blanketSage', 'sofa', 'blanketRust', 'pillow', 'curtainBlue', 'blanketOlive'];
/** Clothes hanging on a rail (at height F + 6.3) from a to b along axis 'x' or 'z', at plane coordinate c. */
function closetClothes(c, a, b, axis) {
  const rod = mesh(cyl(0.04, 0.04, b - a, 8), 'chrome', 0, F + 6.3, 0, group, { uv: false });
  if (axis === 'z') { rod.rotation.x = Math.PI / 2; rod.position.set(c, F + 6.3, (a + b) / 2); }
  else { rod.rotation.z = Math.PI / 2; rod.position.set((a + b) / 2, F + 6.3, c); }
  let i = 0;
  for (let u = a + 0.2; u < b - 0.1; u += 0.32, i++) {
    const len = [3.2, 2.4, 3.6, 2.8, 2.2][i % 5];
    const g = rbox(0.12, len, 1.45, 0.05);
    const m = mesh(g, GARMENTS[(i * 3) % GARMENTS.length], 0, 0, 0, group, { uv: false });
    if (axis === 'z') m.position.set(c, F + 6.15 - len / 2, u);
    else { m.position.set(u, F + 6.15 - len / 2, c); m.rotation.y = Math.PI / 2; }
  }
}
/** Open wardrobe unit (no doors), back on local -z: hanging sections, shelves and drawers. */
function openCloset(g, w, h = 7.8, d = 1.9) {
  const n = Math.max(2, Math.round(w / 2.6)), sw = w / n;
  mesh(box(w, h, 0.06), 'laminate', 0, h / 2, -d / 2 + 0.03, g);         // back panel
  mesh(box(w, 0.1, d), 'laminate', 0, h - 0.05, 0, g);                   // top
  mesh(box(w, 0.3, d - 0.1), 'laminateGrey', 0, 0.15, -0.05, g);         // plinth
  for (let i = 0; i <= n; i++) mesh(box(0.08, h, d), 'laminate', -w / 2 + i * sw, h / 2, 0, g);
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + i * sw + 0.04, x1 = x0 + sw - 0.08, cx = (x0 + x1) / 2;
    mesh(box(sw - 0.08, 0.06, d - 0.1), 'laminate', cx, h - 1.0, 0, g); // loft shelf
    for (let k = 0; k < 3; k++) mesh(rbox(0.6, 0.3, 0.9, 0.08), GARMENTS[(i * 2 + k) % GARMENTS.length], x0 + 0.45 + k * (sw - 0.98) / 2, h - 0.8, 0, g, { uv: false });
    if (i % 2 === 0) {
      // hanging section over a block of drawers
      mesh(box(sw - 0.08, 1.4, d - 0.1), 'laminate', cx, 1.0, 0, g);
      for (const y of [0.75, 1.25]) mesh(box(sw - 0.3, 0.03, 0.02), 'laminateGrey', cx, y, d / 2 - 0.04, g, { uv: false });
      mesh(box(0.5, 0.05, 0.05), 'brass', cx, 1.0, d / 2, g, { uv: false });
      const rod = mesh(cyl(0.04, 0.04, sw - 0.1, 8), 'chrome', cx, h - 1.35, 0, g, { uv: false });
      rod.rotation.z = Math.PI / 2;
      let j = 0;
      for (let u = x0 + 0.18; u < x1 - 0.1; u += 0.3, j++) {
        const len = [3.0, 2.3, 3.4, 2.6][j % 4];
        mesh(rbox(0.12, len, 1.4, 0.05), GARMENTS[(i + j * 3) % GARMENTS.length], u, h - 1.5 - len / 2, 0, g, { uv: false });
      }
    } else {
      // shelves of folded clothes and shoe racks at the bottom
      for (let k = 1; k <= 5; k++) {
        const y = 0.3 + k * 1.05;
        mesh(box(sw - 0.08, 0.06, d - 0.1), 'laminate', cx, y, 0, g);
        if (k < 5) for (let q = 0; q < 2; q++) mesh(rbox(0.7, 0.32, 1.0, 0.08), GARMENTS[(i + k + q * 4) % GARMENTS.length], cx + (q ? 0.5 : -0.5) * (sw - 0.9), y + 0.2, 0, g, { uv: false });
      }
      for (let q = 0; q < 3; q++) mesh(rbox(0.35, 0.3, 0.9, 0.08), q % 2 ? 'blackMatte' : 'furnWood', cx - 0.6 + q * 0.6, 0.48, 0.1, g, { uv: false });
    }
  }
}

/** First floor: walk-in wardrobe and dressing room over the ground-floor kitchen. */
function dressingRoom(slant) {
  const back = (x) => rearZ(x) + REAR_T;
  const xw = 22.674, xe = 34.667, zf = -38.321, d = 1.9;
  // open wardrobes along the back wall and the south wall
  const bx0 = 22.85, bx1 = xe - d - 0.02, bcx = (bx0 + bx1) / 2;
  openCloset(item(bcx, back(bcx) + d / 2 + 0.02, slant), bx1 - bx0, 7.8, d);
  for (let x = bx0; x < bx1; x += 1) colliders.push({ x0: x, x1: Math.min(bx1, x + 1), z0: back(x), z1: back(x) + d + 0.1, y0: F, y1: F + 7.8, id: 'furniture' });
  const sz0 = back(xe) + 0.02, sz1 = zf - 0.6;
  openCloset(item(xe - d / 2 - 0.02, (sz0 + sz1) / 2, -Math.PI / 2), sz1 - sz0, 7.8, d);
  collide(xe - d - 0.05, xe, sz0, sz1, 7.8);
  // dressing table with a lit mirror against the wall to the double-height hall
  const dt = item(xw + 0.72, -42.6, Math.PI / 2);
  mesh(rbox(3.4, 2.5, 1.4, 0.04), 'laminate', 0, 1.25, 0, dt);
  for (const y of [1.0, 1.7]) mesh(box(3.2, 0.03, 0.02), 'laminateGrey', 0, y, 0.71, dt, { uv: false });
  mesh(box(3.0, 3.2, 0.06), 'furnWood', 0, 4.4, -0.66, dt);
  mesh(box(2.7, 2.9, 0.03), 'mirror', 0, 4.4, -0.62, dt, { uv: false });
  for (let i = 0; i < 6; i++) {
    for (const sx of [-1.38, 1.38]) mesh(new THREE.SphereGeometry(0.08, 10, 8), 'lampShade', sx, 3.1 + i * 0.52, -0.58, dt, { uv: false, shadow: false });
  }
  mesh(cyl(0.6, 0.55, 1.5, 20), 'sofaAccent', 0, 0.75, 1.35, dt, { uv: false }); // stool
  collide(xw, xw + 1.45, -44.3, -40.9, 2.5);
  collide(xw + 1.4, xw + 2.7, -43.2, -42.0, 1.5);
  // upholstered island with drawers in the middle, on a rug
  rug(28.3, -41.8, 6.6, 4.0);
  const isl = item(28.3, -41.9);
  mesh(rbox(4.0, 2.6, 2.1, 0.05), 'laminate', 0, 1.3, 0, isl);
  mesh(rbox(4.1, 0.12, 2.2, 0.04), 'marble', 0, 2.66, 0, isl);
  for (const sz of [-1, 1]) for (const y of [0.8, 1.6]) mesh(box(3.6, 0.03, 0.02), 'laminateGrey', 0, y, sz * 1.06, isl, { uv: false });
  mesh(rbox(1.0, 0.3, 0.7, 0.08), 'blanketRust', -1.1, 2.88, 0, isl, { uv: false });
  mesh(rbox(0.5, 0.3, 0.35, 0.05), 'blackMatte', 1.2, 2.87, 0.2, isl, { uv: false });
  collide(26.25, 30.35, -43.0, -40.8, 2.8);
  // full-length mirror on the wall to bedroom 4
  const fm = item(30.4, zf - 0.06, Math.PI);
  mesh(box(2.1, 6.4, 0.08), 'furnWood', 0, 3.5, 0, fm);
  mesh(box(1.85, 6.1, 0.03), 'mirror', 0, 3.5, 0.05, fm, { uv: false });
  ceilingLight(25.6, -42.4, 0.35);
  ceilingLight(31.0, -42.4, 0.35);
}

// ---------------------------------------------------------------------------
function openKitchen() {
  const top = (x0, x1, z0, z1) => {
    mesh(box(x1 - x0, 0.15, z1 - z0), 'graniteBlack', (x0 + x1) / 2, F + 2.83, (z0 + z1) / 2, group, { uv: false });
    mesh(box(x1 - x0 - 0.1, 2.4, z1 - z0 - 0.12), 'laminateSage', (x0 + x1) / 2, F + 1.55, (z0 + z1) / 2, group, { uv: false });
    mesh(box(x1 - x0 - 0.3, 0.35, z1 - z0 - 0.35), 'blackMatte', (x0 + x1) / 2, F + 0.175, (z0 + z1) / 2, group, { uv: false });
    colliders.push({ x0, x1, z0, z1, y0: F, y1: F + 3, id: 'counter' });
  };
  const zF = -31.6;  // the kitchen's wall to bedroom 1's closet
  // counter along the back wall, and along the north wall under the window (an L)
  top(0.792, 11.3, -42.941, -40.9);
  top(0.792, 2.85, -38.75, zF - 0.05);
  for (let z = -38.2; z < zF - 0.5; z += 1.6) mesh(box(0.06, 0.05, 0.7), 'steel', 2.87, F + 2.45, z, group, { uv: false });
  for (let x = 1.4; x < 11.0; x += 1.6) mesh(box(0.7, 0.05, 0.06), 'steel', x, F + 2.45, -40.86, group, { uv: false });
  // sink + faucet under the window
  const sz = -33.8;
  mesh(box(1.5, 0.04, 2.3), 'steel', 1.8, F + 2.93, sz, group, { uv: false });
  mesh(box(1.0, 0.05, 1.0), 'blackMatte', 1.85, F + 2.955, sz - 0.55, group, { uv: false });
  mesh(box(1.0, 0.05, 1.0), 'blackMatte', 1.85, F + 2.955, sz + 0.55, group, { uv: false });
  mesh(cyl(0.05, 0.05, 1.1, 8), 'chrome', 1.1, F + 3.45, sz, group, { uv: false });
  const spout = mesh(cyl(0.04, 0.04, 0.7, 8), 'chrome', 1.4, F + 3.95, sz, group, { uv: false });
  spout.rotation.z = Math.PI / 2;
  // hob and chimney on the back wall, left of the window to the hall
  const hx = 4.6;
  const hob = item(hx, -41.9);
  mesh(rbox(2.0, 0.08, 1.5, 0.03), 'screen', 0, 2.95, 0, hob, { uv: false });
  for (const sx of [-0.5, 0.5]) mesh(cyl(0.3, 0.3, 0.06, 20), 'steel', sx, 3.0, 0, hob, { uv: false });
  mesh(box(2.4, 0.9, 1.6), 'steel', hx, F + 5.8, -42.15, group, { uv: false });
  mesh(box(0.9, 4.2, 0.9), 'steel', hx, F + 8.3, -42.5, group, { uv: false });
  // tall fridge in the corner beside the back counter, on the north wall
  const fr = item(1.82, -39.8, Math.PI / 2);
  mesh(rbox(1.75, 6.0, 1.95, 0.06), 'steel', 0, 3.0, 0, fr);
  mesh(box(0.06, 1.5, 0.08), 'blackMatte', 0.7, 4.9, 1.0, fr, { uv: false });
  mesh(box(0.06, 1.6, 0.08), 'blackMatte', 0.7, 2.6, 1.0, fr, { uv: false });
  collide(0.792, 2.85, -40.85, -38.8, 6);
  // upper cabinets beside the chimney (the window to the hall stays clear)
  mesh(box(2.0, 2.0, 1.1), 'laminate', 2.1, F + 6.3, -42.35, group);
  // small breakfast island facing the dining table, with two stools on the hall side
  const ix0 = 7.8, ix1 = 9.6, iz0 = -38.2, iz1 = -34.4;
  mesh(box(ix1 - ix0 + 0.5, 0.15, iz1 - iz0 + 0.2), 'graniteBlack', (ix0 + ix1) / 2 + 0.25, F + 2.93, (iz0 + iz1) / 2, group, { uv: false });
  mesh(box(ix1 - ix0 - 0.1, 2.85, iz1 - iz0 - 0.1), 'furnWood', (ix0 + ix1) / 2, F + 1.43, (iz0 + iz1) / 2, group, { uv: false });
  collide(ix0, ix1 + 0.5, iz0, iz1, 3.1);
  for (const z of [-37.2, -35.4]) {
    const st = item(10.65, z);
    mesh(cyl(0.55, 0.5, 0.18, 18), 'sofaAccent', 0, 2.5, 0, st, { uv: false });
    mesh(cyl(0.06, 0.06, 2.4, 8), 'steel', 0, 1.2, 0, st, { uv: false });
    mesh(cyl(0.45, 0.45, 0.04, 18), 'steel', 0, 0.05, 0, st, { uv: false });
    collide(10.15, 11.15, z - 0.5, z + 0.5, 2.6);
  }
  for (const z of [-37.3, -35.3]) pendant(8.7, z, F + 6.6);
  ceilingLight(5.0, -36.2, 0.4);
  // a few objects on the counters
  mesh(cyl(0.3, 0.3, 0.8, 16), 'steel', 9.5, F + 3.3, -42.2, group, { uv: false });
  mesh(cyl(0.22, 0.22, 0.5, 16), 'pot', 10.4, F + 3.15, -42.1, group, { uv: false });
  mesh(box(1.1, 0.8, 0.9), 'laminateGrey', 1.8, F + 3.3, -36.6, group, { uv: false });
}

/** WC with its cistern towards local -z (ry turns it; ry = -π/2 puts the cistern on the +x wall). */
function wcUnit(x, z, ry) {
  const wc = item(x, z, ry);
  mesh(rbox(1.3, 1.2, 0.6, 0.12), 'ceramic', 0, 1.9, -0.95, wc, { uv: false });
  mesh(rbox(1.15, 1.25, 1.7, 0.35), 'ceramic', 0, 0.62, 0.05, wc, { uv: false });
  mesh(rbox(1.2, 0.08, 1.75, 0.3), 'ceramic', 0, 1.3, 0.08, wc, { uv: false });
}
/** Wall-hung basin and mirror; the wall is on local -z. */
function basinUnit(x, z, ry) {
  const b = item(x, z, ry);
  mesh(rbox(1.6, 0.55, 1.25, 0.15), 'ceramic', 0, 2.75, 0, b, { uv: false });
  mesh(box(1.3, 0.05, 0.9), 'basinInner', 0, 3.03, 0.05, b, { uv: false });
  mesh(cyl(0.04, 0.04, 0.5, 8), 'chrome', 0, 3.25, -0.45, b, { uv: false });
  mesh(box(1.6, 2.1, 0.04), 'mirror', 0, 4.9, -0.62, b, { uv: false });
}
/** Shower head, mixer and towel rail on a wall at local z = 0, facing +z. */
function showerUnit(x, z, ry) {
  const s = item(x, z, ry);
  mesh(cyl(0.3, 0.3, 0.05, 20), 'chrome', 0, 6.5, 0.45, s, { uv: false }).rotation.x = Math.PI / 2 - 0.4;
  mesh(cyl(0.03, 0.03, 0.5, 8), 'chrome', 0, 6.6, 0.25, s, { uv: false }).rotation.x = Math.PI / 2;
  mesh(box(0.35, 0.35, 0.1), 'chrome', 0, 3.6, 0.03, s, { uv: false });
  mesh(cyl(0.03, 0.03, 1.4, 8), 'chrome', 0.9, 4.2, 0.12, s, { uv: false }).rotation.z = Math.PI / 2;
}
function toiletSet(wcX, wcZ, basin, shower) {
  // WC facing -x (cistern against the east wall)
  wcUnit(wcX, wcZ, -Math.PI / 2);
  collide(wcX - 1.2, wcX + 1.2, wcZ - 0.7, wcZ + 0.7, 2);
  basinUnit(basin[0], basin[1], basin[2]);
  showerUnit(shower[0], shower[1], shower[2]);
}
/** Frameless glass shower screen between two plan points. */
function showerScreen(x0, z0, x1, z1, h = 6.6) {
  const w = Math.hypot(x1 - x0, z1 - z0);
  const s = mesh(box(w, h, 0.03), 'glass', (x0 + x1) / 2, F + 0.1 + h / 2, (z0 + z1) / 2, group, { uv: false, shadow: false });
  s.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  mesh(box(w, 0.06, 0.06), 'chrome', (x0 + x1) / 2, F + 0.13, (z0 + z1) / 2, group, { uv: false }).rotation.y = s.rotation.y;
  collide(Math.min(x0, x1) - 0.06, Math.max(x0, x1) + 0.06, Math.min(z0, z1) - 0.06, Math.max(z0, z1) + 0.06, h);
}
/** Floor rug (walkable, so walk mode stands on it). */
function rug(x, z, w, d, ry = 0) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), M('rug'));
  r.position.set(x, F + 0.02, z);
  r.rotation.y = ry;
  r.receiveShadow = true;
  group.add(r);
  walkables.push(r);
  return r;
}

/** The big puja room in the side strip: a carved mandir on the back wall, lamps, a bell, mats. */
function bigMandir() {
  const P = GARDEN.puja, cx = (P.x0 + P.wall + P.x1) / 2, zb = P.z0 + P.wall;
  const g = item(cx, zb + 1.3);
  // stepped platform, carved cabinet and a canopy with a small spire
  mesh(rbox(7.2, 0.5, 2.6, 0.05), 'marble', 0, 0.25, 0, g);
  mesh(rbox(6.4, 2.0, 2.2, 0.05), 'furnWood', 0, 1.5, -0.1, g);
  mesh(box(6.6, 0.16, 2.4), 'furnLight', 0, 2.58, -0.1, g);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mesh(cyl(0.1, 0.1, 3.4, 12), 'gold', sx * 2.9, 4.33, -0.1 + sz * 0.9, g, { uv: false });
  mesh(box(6.6, 0.3, 2.4), 'furnLight', 0, 6.18, -0.1, g);
  mesh(box(6.0, 3.3, 0.1), 'furnWood', 0, 4.3, -1.15, g);
  mesh(new THREE.ConeGeometry(2.0, 2.0, 4), 'gold', 0, 7.33, -0.1, g, { uv: false }).rotation.y = Math.PI / 4;
  mesh(new THREE.SphereGeometry(0.2, 12, 8), 'gold', 0, 8.45, -0.1, g, { uv: false });
  // idols, lamps, flowers
  for (const [ix, s] of [[-1.6, 0.8], [0, 1.0], [1.6, 0.8]]) {
    mesh(cyl(0.3 * s, 0.42 * s, 0.9 * s, 12), 'gold', ix, 2.66 + 0.45 * s, -0.5, g, { uv: false });
    mesh(new THREE.SphereGeometry(0.27 * s, 12, 10), 'gold', ix, 2.66 + 1.12 * s, -0.5, g, { uv: false });
  }
  for (const sx of [-2.6, 2.6]) {
    mesh(cyl(0.08, 0.14, 1.6, 10), 'brass', sx, F + 0.8, 1.9, group, { uv: false }).position.set(cx + sx, F + 0.8, zb + 3.1);
  }
  for (const sx of [-0.9, 0.9]) {
    mesh(cyl(0.12, 0.08, 0.08, 12), 'pot', sx, 2.7, 0.7, g, { uv: false });
    mesh(new THREE.SphereGeometry(0.05, 8, 6), 'lampShade', sx, 2.8, 0.7, g, { uv: false });
  }
  collide(cx - 3.6, cx + 3.6, zb, zb + 2.6, 8.5);
  // floor mats for sitting, a brass bell hanging from the ceiling, lights
  rug(cx, zb + 6.2, 6.0, 4.0);
  const bell = mesh(new THREE.ConeGeometry(0.35, 0.6, 16, 1, true), 'brass', cx + 3.2, CEIL - 3.2, zb + 4.0, group, { uv: false });
  mesh(cyl(0.02, 0.02, 2.9, 6), 'brass', cx + 3.2, CEIL - 1.45, zb + 4.0, group, { uv: false });
  ceilingLight(cx, zb + 4.0, 0.45);
  ceilingLight(cx, zb + 8.5, 0.45);
  wallArt(P.x0 + P.wall + 0.05, F + 5.5, (P.z0 + P.z1) / 2, Math.PI / 2, 3.0, 2.2, 'art2');
}

/**
 * Full-size 7-seat SUV (an original, generic design with no make or badges), parked
 * nose-out in the portico. Built in a local frame with the nose towards -z and the
 * wheels on y = 0, then turned round so it faces the gate.
 */
function suv() {
  const cx = -7.5, cz = (GARDEN.parking[0] + GARDEN.parking[1]) / 2;
  const g = item(cx, cz, Math.PI, LV.garden);
  const L = 15.6, W = 6.05, R = 1.2;            // length, body width, wheel radius (ft)
  const axF = 4.9, axR = -4.3;                  // axles, measured forwards (u) from the middle
  const part = (geo, mat, x = 0, y = 0, z = 0) => mesh(geo, mat, x, y, z, g, { uv: false });
  // side profile (u forwards, v up) extruded across the car: shape +u becomes -z
  const side = (shape, width, bevel = 0.08) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 20 });
    geo.translate(0, 0, -width / 2);
    geo.rotateY(Math.PI / 2);
    return geo;
  };
  const pts = (list) => list.map(([u, v]) => new THREE.Vector2(u, v));

  // ---- body: sills, wheel arches, bumpers, bonnet and waist ----
  const Ra = R + 0.26, a0 = 0.14, ax = Ra * Math.cos(a0), ay = R - Ra * Math.sin(a0);
  const b = new THREE.Shape();
  b.moveTo(-7.62, 1.12);
  b.lineTo(axR - ax - 0.2, 1.0);
  b.lineTo(axR - ax, ay);
  b.absarc(axR, R, Ra, Math.PI + a0, -a0, true);
  b.lineTo(axR + ax + 0.1, 0.8);
  b.lineTo(axF - ax - 0.1, 0.8);
  b.lineTo(axF - ax, ay);
  b.absarc(axF, R, Ra, Math.PI + a0, -a0, true);
  b.lineTo(7.45, 1.08);
  b.lineTo(7.78, 1.55);
  b.lineTo(7.86, 2.95);
  b.quadraticCurveTo(7.84, 3.45, 7.4, 3.56);
  b.lineTo(3.1, 3.86);
  b.lineTo(-7.45, 3.8);
  b.quadraticCurveTo(-7.78, 3.76, -7.8, 3.45);
  b.lineTo(-7.78, 1.45);
  b.closePath();
  part(side(b, W - 0.16), 'carPaint');

  // ---- glasshouse, roof and window frames ----
  const gw = W - 0.62;
  const gh = new THREE.Shape(pts([[3.05, 3.84], [0.95, 5.84], [-6.95, 5.82], [-7.3, 5.55], [-7.5, 3.8]]));
  part(side(gh, gw, 0.06), 'carGlass');
  const roof = new THREE.Shape(pts([[1.05, 5.78], [-7.0, 5.76], [-7.02, 5.98], [0.8, 6.0]]));
  part(side(roof, gw - 0.1, 0.05), 'carPaint');
  // body-coloured frame on each side: A/B/C/D pillars round three windows
  const frame = new THREE.Shape(pts([[3.12, 3.8], [0.98, 5.88], [-6.98, 5.86], [-7.36, 5.56], [-7.54, 3.78]]));
  const win = (list) => frame.holes.push(new THREE.Path(pts(list)));
  win([[2.53, 4.0], [0.83, 5.62], [-1.3, 5.62], [-1.3, 4.0]]);         // front door
  win([[-1.75, 4.0], [-1.75, 5.62], [-4.45, 5.62], [-4.45, 4.0]]);     // rear door
  win([[-4.85, 4.0], [-4.85, 5.62], [-6.75, 5.62], [-7.12, 5.28], [-7.22, 4.0]]); // third row
  for (const sx of [-1, 1]) part(side(frame, 0.05, 0), 'carPaint', sx * (gw / 2 + 0.085));
  // window line trim, door shut lines, handles
  for (const sx of [-1, 1]) {
    const xs = sx * (W / 2 + 0.005);
    part(box(0.03, 0.09, 10.7), 'chrome', sx * (gw / 2 + 0.12), 3.93, 2.1);
    for (const [u, v0, v1] of [[2.95, 1.35, 3.8], [-1.52, 0.95, 3.82], [-4.62, 2.2, 3.8]]) part(box(0.02, v1 - v0, 0.035), 'blackMatte', xs, (v0 + v1) / 2, -u);
    for (const u of [0.55, -2.75]) part(rbox(0.07, 0.1, 0.5, 0.04), 'chrome', sx * (W / 2 + 0.03), 3.38, -u);
    // mirror on a short arm
    part(rbox(0.36, 0.38, 0.62, 0.12), 'carPaint', sx * (W / 2 + 0.36), 4.12, -2.45);
    part(box(0.34, 0.1, 0.18), 'blackMatte', sx * (W / 2 + 0.1), 4.0, -2.62);
  }

  // ---- black cladding: wheel-arch flares, sills and bumpers ----
  const arch = new THREE.Shape();
  const ro = Ra + 0.26, ri = Ra - 0.03;
  arch.moveTo(ro * Math.cos(-a0), ro * Math.sin(-a0));
  arch.absarc(0, 0, ro, -a0, Math.PI + a0, false);
  arch.lineTo(ri * Math.cos(Math.PI + a0), ri * Math.sin(Math.PI + a0));
  arch.absarc(0, 0, ri, Math.PI + a0, -a0, true);
  arch.closePath();
  for (const axle of [axF, axR]) for (const sx of [-1, 1]) {
    const geo = new THREE.ExtrudeGeometry(arch, { depth: 0.12, bevelEnabled: false, curveSegments: 20 });
    geo.translate(0, 0, -0.06);
    geo.rotateY(Math.PI / 2);
    part(geo, 'blackMatte', sx * (W / 2 + 0.02), R, -axle);
  }
  for (const sx of [-1, 1]) {
    part(box(0.08, 0.5, 5.9), 'blackMatte', sx * (W / 2 + 0.02), 1.08, -0.3);        // sill cladding
    part(rbox(0.5, 0.12, 6.0, 0.04), 'steel', sx * (W / 2 + 0.22), 0.9, -0.3);       // side step
    part(box(0.12, 0.25, 0.3), 'blackMatte', sx * (W / 2 + 0.05), 0.85, -2.6);
    part(box(0.12, 0.25, 0.3), 'blackMatte', sx * (W / 2 + 0.05), 0.85, 2.0);
  }
  // front: bumper, skid plate, grille, lamps, number plate
  part(rbox(W - 0.3, 0.72, 0.5, 0.12), 'blackMatte', 0, 1.42, -7.72);
  part(rbox(W - 2.0, 0.26, 0.42, 0.08), 'steel', 0, 1.2, -7.86);
  part(box(3.5, 1.12, 0.12), 'blackMatte', 0, 2.62, -7.9);
  for (const v of [2.3, 2.62, 2.94]) part(box(3.3, 0.07, 0.05), 'steel', 0, v, -7.97);
  for (const sx of [-1, 1]) {
    part(rbox(1.05, 0.52, 0.14, 0.06), 'screen', sx * 2.4, 3.02, -7.84);           // headlamp housing
    part(box(0.95, 0.06, 0.04), 'headlight', sx * 2.4, 3.22, -7.92);               // LED strip
    const lens = cyl(0.17, 0.17, 0.06, 20); lens.rotateX(Math.PI / 2);
    part(lens, 'headlight', sx * 2.55, 2.96, -7.92);
    const fog = cyl(0.14, 0.14, 0.06, 18); fog.rotateX(Math.PI / 2);
    part(fog, 'headlight', sx * 2.35, 1.5, -7.99);
  }
  part(box(1.6, 0.42, 0.04), 'siteWhite', 0, 1.62, -7.99);
  // rear: bumper, lamps, plate, wiper, high stop lamp
  part(rbox(W - 0.3, 0.72, 0.5, 0.12), 'blackMatte', 0, 1.42, 7.72);
  part(rbox(W - 2.4, 0.22, 0.4, 0.08), 'steel', 0, 1.18, 7.84);
  for (const sx of [-1, 1]) {
    part(rbox(0.62, 0.95, 0.12, 0.05), 'taillight', sx * 2.62, 3.05, 7.84);
    part(box(0.45, 0.12, 0.04), 'headlight', sx * 2.62, 2.7, 7.9);
  }
  part(box(1.6, 0.42, 0.04), 'siteWhite', 0, 2.3, 7.86);
  part(box(0.9, 0.04, 0.04), 'taillight', 0, 5.9, 7.06);
  const wiper = part(box(0.05, 0.05, 1.2), 'blackMatte', 0, 4.05, 7.62);
  wiper.rotation.x = Math.PI / 2 - 0.2;
  // roof rails
  for (const sx of [-1, 1]) {
    part(rbox(0.12, 0.1, 7.2, 0.04), 'steel', sx * (gw / 2 - 0.35), 6.14, 3.05);
    for (const z of [-0.1, 3.05, 6.2]) part(box(0.12, 0.14, 0.3), 'blackMatte', sx * (gw / 2 - 0.35), 6.03, z);
  }

  // ---- wheels: rounded tyres, six-spoke alloys ----
  const tyre = new THREE.LatheGeometry(pts([[0.8, -0.42], [1.08, -0.43], [1.17, -0.36], [1.2, -0.22], [1.2, 0.22], [1.17, 0.36], [1.08, 0.43], [0.8, 0.42]]).map((p) => new THREE.Vector2(p.x, p.y)), 32);
  tyre.rotateZ(Math.PI / 2);
  for (const axle of [axF, axR]) for (const sx of [-1, 1]) {
    const x = sx * (W / 2 - 0.38), z = -axle, xo = x + sx * 0.36;
    part(tyre.clone(), 'tyre', x, R, z);
    const barrel = cyl(0.8, 0.8, 0.7, 28); barrel.rotateZ(Math.PI / 2);
    part(barrel, 'blackMatte', x, R, z);
    const lip = new THREE.TorusGeometry(0.78, 0.04, 8, 32); lip.rotateY(Math.PI / 2);
    part(lip, 'rim', xo, R, z);
    const hub = cyl(0.17, 0.17, 0.1, 16); hub.rotateZ(Math.PI / 2);
    part(hub, 'rim', xo, R, z);
    for (let k = 0; k < 6; k++) {
      const t = (k / 6) * Math.PI * 2;
      const sp = part(box(0.07, 0.62, 0.13), 'rim', xo - sx * 0.02, R + 0.42 * Math.cos(t), z + 0.42 * Math.sin(t));
      sp.rotation.x = t;
    }
  }
  collide(cx - W / 2 - 0.45, cx + W / 2 + 0.45, cz - L / 2 - 0.2, cz + L / 2 + 0.2, 6.2, LV.garden);
}

// ---------------------------------------------------------------------------
export function buildFurniture(ctx) {
  M = (k) => ctx.mats.get(k);
  colliders = ctx.colliders;
  walkables = ctx.walkables;
  F = LV.gf;
  CEIL = LV.gfCeil;
  group = new THREE.Group();
  group.name = 'furniture';
  ctx.house.add(group);

  // ---- Bedroom 1 (11′ × 13′, the old living room and the back of the old portico): bed
  //      against the closet wall, TV on the front wall, walk-in closet behind -------------
  bed(item(5.6, -23.25), 5.0, 6.3, 'blanketBlue');
  collide(3.1, 8.1, -26.5, -20.0, 2.2);
  sideTable(item(2.25, -25.9));
  sideTable(item(8.95, -25.9));
  collide(1.6, 2.9, -26.5, -25.3, 2); collide(8.3, 9.6, -26.5, -25.3, 2);
  tvConsole(item(5.6, -14.15, Math.PI), 4.4);
  collide(3.4, 7.8, -14.8, -13.5, 1.5);
  tv(item(5.6, -13.56, Math.PI, F + 4.2), 3.4, 1.95);
  ceilingFan(6.3, -19.5);
  curtains('z', 0.792, -25.2, -21.0, 1, 'curtainBlue');
  curtains('z', 0.792, -17.6, -14.0, 1, 'curtainBlue');
  wallArt(5.6, F + 5.9, -26.45, 0, 3.6, 1.4, 'art2');
  plant(11.0, -14.2, 1.0);
  // the walk-in closet: open wardrobe along the kitchen wall, a mirror at the far end
  openCloset(item(5.17, -31.25 + 0.97), 8.7, 7.8, 1.9);
  collide(0.8, 9.55, -31.25, -29.3, 7.8);
  const bm = item(0.84, -28.0, Math.PI / 2);
  mesh(box(1.9, 6.3, 0.06), 'furnWood', 0, 3.5, 0, bm);
  mesh(box(1.7, 6.0, 0.03), 'mirror', 0, 3.5, 0.04, bm, { uv: false });
  ceilingLight(5.0, -28.9, 0.3);

  // ---- Living room (the front of the old portico): sofa against the bedroom wall, TV between
  //      the two front windows, the main door on the north side ------------------------------
  const lrug = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.04, 5.6), M('rug'));
  lrug.position.set(7.0, F + 0.02, -7.4);
  lrug.receiveShadow = true;
  group.add(lrug);
  ctx.walkables.push(lrug);
  sofa(item(7.0, -11.3, 0), 6.8);
  collide(3.6, 10.4, -12.7, -9.85, 2.8);
  armchair(item(13.2, -6.2, -Math.PI / 2));
  collide(11.8, 14.6, -7.6, -4.8, 2.8);
  coffeeTable(item(7.0, -7.3), 3.4, 1.9);
  collide(5.3, 8.7, -8.25, -6.35, 1.5);
  sideTable(item(2.85, -12.0), false);
  sideTable(item(11.15, -12.0));
  collide(2.2, 3.5, -12.7, -11.4, 2); collide(10.5, 11.8, -12.7, -11.4, 2);
  tvConsole(item(7.8, -1.45, Math.PI), 5.6);
  collide(5.0, 10.6, -2.1, -0.792, 1.5);
  tv(item(7.8, -0.85, Math.PI, F + 4.3), 4.2, 2.4);
  ceilingFan(7.4, -6.8);
  curtains('x', -0.792, 1.7, 5.6, -1, 'curtainBeige');
  curtains('x', -0.792, 10.0, 13.9, -1, 'curtainBeige');
  wallArt(7.0, F + 5.6, -12.65, 0, 4.4, 2.0, 'art');
  plant(1.5, -1.6, 1.1);
  plant(13.9, -17.0, 1.0);

  // ---- Open kitchen (the old bedroom 1): counters on the north and back walls, island facing
  //      the dining table, store in the corner ------------------------------------------------
  openKitchen();

  // ---- Drawing / dining hall (open to the kitchen and the old garden) ------------
  // the dining table stands in the double-height space, under the chandelier
  const tx = 17.2, tz = -41.4;
  diningTable(item(tx, tz), 2.76, 4.75);
  collide(tx - 1.39, tx + 1.41, tz - 2.35, tz + 2.35, 2.6);
  chair(item(tx, tz - 3.2, 0));
  chair(item(tx, tz + 3.3, Math.PI));
  chair(item(tx - 2.24, tz - 0.91, Math.PI / 2));
  chair(item(tx - 2.24, tz + 0.9, Math.PI / 2));
  chair(item(tx + 2.21, tz - 0.91, -Math.PI / 2));
  chair(item(tx + 2.21, tz + 0.9, -Math.PI / 2));
  globeChandelier(tx, tz);
  // wash basin against the rear wall, beside the kitchen counter (the wall is slightly slanted)
  const wbx = 20.85, wbz = rearZ(wbx) + REAR_T + 0.8;
  const wb = item(wbx, wbz, -Math.atan(rearZ(1) - rearZ(0)));
  mesh(cyl(0.35, 0.25, 2.5, 16), 'ceramic', 0, 1.25, 0, wb, { uv: false });
  mesh(cyl(0.75, 0.55, 0.4, 24), 'ceramic', 0, 2.7, 0, wb, { uv: false });
  mesh(cyl(0.6, 0.6, 0.02, 24), 'basinInner', 0, 2.91, 0, wb, { uv: false });
  mesh(box(1.8, 2.4, 0.05), 'mirror', 0, 5.0, -0.76, wb, { uv: false });
  collide(wbx - 0.75, wbx + 0.75, wbz - 0.8, wbz + 0.75, 3);
  // a big leafy plant in the old garden bay, beside the way to the puja room
  plant(11.3, -46.6, 1.35);
  collide(10.55, 12.05, -47.35, -45.85, 3);
  // crockery unit on the bedroom-2 wall, where that room's old door was
  const cu = item(21.47, -30.6, -Math.PI / 2);
  mesh(box(5.0, 3.0, 1.4), 'furnWood', 0, 1.5, 0, cu);
  mesh(box(4.8, 2.8, 0.02), 'laminate', 0, 1.5, 0.71, cu, { uv: false });
  mesh(box(5.0, 2.8, 1.0), 'glass', 0, 5.2, -0.2, cu, { uv: false, shadow: false });
  mesh(box(5.0, 0.1, 1.0), 'furnWood', 0, 3.8, -0.2, cu);
  mesh(box(5.0, 0.1, 1.0), 'furnWood', 0, 6.6, -0.2, cu);
  collide(20.77, 22.17, -33.1, -28.1, 7);
  ceilingFan(17.2, -27.0); // under the first floor, clear of the edge beam on grid F
  ceilingLight(9.4, -45.7); // the old garden bay now has a normal ceiling
  plant(13.2, -23.9, 1.2);
  wallArt(12.28, F + 5.5, -24.9, Math.PI / 2, 2.4, 3.0, 'art2');

  // ---- Bedroom 2 ------------------------------------------------------------
  bed(item(31.24, -34.3, -Math.PI / 2), 5.1, 6.1, 'blanketMaroon');
  collide(28.4, 34.5, -36.9, -31.7, 2.2);
  sideTable(item(34.0, -37.3, -Math.PI / 2));
  sideTable(item(34.0, -31.15, -Math.PI / 2));
  wardrobe(item(31.6, -27.9, Math.PI), 5.8);
  collide(28.67, 34.5, -28.95, -26.88, 7.2);
  // TV on a low console, standing just clear of the column on grid F (F5)
  mesh(box(1.2, 1.5, 3.8), 'furnWood', 23.55, F + 0.75, -30.6);
  mesh(box(0.5, 0.12, 0.9), 'blackMatte', 23.4, F + 1.56, -30.6, group, { uv: false });
  mesh(box(0.08, 0.5, 0.08), 'blackMatte', 23.4, F + 1.82, -30.6, group, { uv: false });
  tv(item(23.4, -30.6, Math.PI / 2, F + 3.1));
  collide(22.9, 24.2, -32.5, -28.7, 1.5);
  ceilingFan(28.3, -32.6);
  wallArt(34.53, F + 6.0, -34.3, -Math.PI / 2, 3.2, 1.2, 'art');

  // ---- Guest room: bed in the middle of the bathroom wall, TV opposite it in the middle
  //      of the stair wall, the built-in wardrobe in the old shaft space on the east wall ----
  const gx = (21.03 + 31.59) / 2;
  bed(item(gx, -17.0), 5.0, 6.0, 'blanketOlive');
  collide(gx - 2.6, gx + 2.6, -20.28, -13.95, 2.2);
  sideTable(item(gx - 3.25, -19.6));
  sideTable(item(gx + 3.25, -19.6));
  collide(gx - 3.9, gx - 2.6, -20.28, -19.0, 2); collide(gx + 2.6, gx + 3.9, -20.28, -19.0, 2);
  tvConsole(item(gx, -10.3, Math.PI), 4.0);
  collide(gx - 2.0, gx + 2.0, -10.95, -9.635, 1.5);
  tv(item(gx, -9.7, Math.PI, F + 4.1), 3.4, 1.95);
  ceilingFan(gx, -15.2);
  // inside the built-in wardrobe: clothes on a rail, folded things on the loft shelf
  closetClothes(GUEST_WR.x0 + 1.25, GUEST_WR.z0 + 0.25, GUEST_WR.z1 - 0.25, 'z');

  // ---- Bedroom 2's walk-in closet (the old kitchen) ----------------------------------
  {
    const slant = -Math.atan(rearZ(1) - rearZ(0));
    const back = (x) => rearZ(x) + REAR_T;
    const d = 1.9, xe = 34.581, bx0 = 22.6, bx1 = xe - d - 0.02, bcx = (bx0 + bx1) / 2;
    openCloset(item(bcx, back(bcx) + d / 2 + 0.02, slant), bx1 - bx0, 7.8, d);
    for (let x = bx0; x < bx1; x += 1) colliders.push({ x0: x, x1: Math.min(bx1, x + 1), z0: back(x), z1: back(x) + d + 0.1, y0: F, y1: F + 7.8, id: 'furniture' });
    const sz0 = back(xe) + 0.02, sz1 = -38.4;
    openCloset(item(xe - d / 2 - 0.02, (sz0 + sz1) / 2, -Math.PI / 2), sz1 - sz0, 7.8, d);
    collide(xe - d - 0.05, xe, sz0, sz1, 7.8);
    // dressing table against the wall to the hall, with a stool
    const dt = item(23.25, -41.7, Math.PI / 2);
    mesh(rbox(3.0, 2.5, 1.3, 0.04), 'laminate', 0, 1.25, 0, dt);
    mesh(box(2.6, 3.0, 0.04), 'mirror', 0, 4.5, -0.6, dt, { uv: false });
    mesh(cyl(0.55, 0.5, 1.5, 20), 'sofaAccent', 0, 0.75, 1.3, dt, { uv: false });
    collide(22.526, 23.9, -43.2, -40.2, 2.5);
    ceilingLight(26.4, -42.4, 0.35);
    ceilingLight(30.6, -42.4, 0.35);
  }

  // ---- Bathroom (the two old toilets in one), door from the dining hall ---------------
  const van = item(26.5, -25.88);
  mesh(rbox(4.2, 2.45, 1.3, 0.04), 'furnWood', 0, 1.23, 0, van);
  mesh(box(4.3, 0.1, 1.4), 'graniteBlack', 0, 2.5, 0, van);
  for (const bxv of [-1.05, 1.05]) {
    mesh(cyl(0.55, 0.42, 0.35, 24), 'ceramic', bxv, 2.72, 0.05, van, { uv: false });
    mesh(cyl(0.47, 0.47, 0.02, 24), 'basinInner', bxv, 2.9, 0.05, van, { uv: false });
    mesh(cyl(0.04, 0.04, 0.6, 8), 'chrome', bxv, 2.85, -0.45, van, { uv: false });
  }
  mesh(box(4.0, 2.3, 0.04), 'mirror', 0, 5.0, -0.62, van, { uv: false });
  collide(24.4, 28.6, -26.53, -25.2, 3);
  wcUnit(29.8, -22.34, Math.PI);
  collide(29.15, 30.45, -23.5, -21.07, 2);
  showerUnit(34.56, -23.8, -Math.PI / 2);
  showerScreen(31.9, -26.5, 31.9, -23.3);
  ceilingLight(25.0, -23.8, 0.35);
  ceilingLight(33.2, -23.8, 0.32);

  // ---- Common bathroom under the stair ----------------------------------------------
  {
    const SB = STAIR_BATH;
    showerUnit(SB.x0 + 0.02, -2.75, Math.PI / 2);
    showerScreen(18.35, SB.wall[1] + 0.05, 18.35, -2.3);
    basinUnit(24.3, SB.z1 - 0.64, Math.PI);
    collide(23.5, 25.1, SB.z1 - 1.3, SB.z1, 3);
    // WC under the mid landing, on the sunken floor (6′-9″ clear above it)
    F = LV.gfSunk;
    wcUnit(32.75, SB.well.z0 + 1.27, 0);
    collide(32.1, 33.4, SB.well.z0, SB.well.z0 + 2.2, 2);
    // towel shelf and a plant on the sunken floor along the front wall
    const sh = item(30.2, SB.z1 - 0.5, Math.PI);
    mesh(rbox(2.2, 2.6, 0.9, 0.04), 'laminate', 0, 1.3, 0, sh);
    for (const [yy, mm] of [[1.0, 'sheet'], [1.9, 'blanketSage']]) mesh(rbox(1.8, 0.35, 0.7, 0.1), mm, 0, yy + 0.8, 0.02, sh, { uv: false });
    collide(29.1, 31.3, SB.z1 - 0.95, SB.z1, 3);
    F = LV.gf;
    // lights: under the slab over the shower and basin, and flush under the landing
    ceilingLight(16.9, -2.75, 0.3);
    ceilingLight(20.6, -2.75, 0.3);
    const landBot = LV.gf + 10 * STAIR.rise - SB.landSlab;
    mesh(cyl(0.3, 0.3, 0.05, 24), 'lightPanel', 32.7, landBot - 0.03, -4.9, group, { uv: false, shadow: false });
  }

  // ---- Puja room (in the side strip) and the way to it --------------------------------
  bigMandir();
  plant(3.3, rearZ(3.3) + REAR_T + 0.8, 0.9);

  // ---- Lobby / passage / stair -----------------------------------------------------
  const cons = item(20.0, -16.2, -Math.PI / 2);
  mesh(rbox(3.4, 2.8, 1.2, 0.05), 'furnWood', 0, 1.4, 0, cons);
  mesh(box(2.4, 3.0, 0.05), 'mirror', 0, 4.8, -0.58, cons, { uv: false });
  collide(19.4, 20.68, -17.9, -14.5, 3);
  plant(16.4, -17.4, 0.9);
  ceilingLight(18.1, -14.0, 0.4);
  ceilingLight(16.4, -20.9, 0.4);
  ceilingLight(19.2, -6.9, 0.4);

  // ---- Open car parking in the side strip ---------------------------------------------
  suv();

  // ---- First floor and roof ----------------------------------------------------------
  F = LV.ffFloor; CEIL = LV.ffCeil;
  firstFloorFurniture();
  F = LV.roof; CEIL = LV.mumtyCeil;
  roofFurniture();
  F = LV.gf; CEIL = LV.gfCeil;

  group.traverse((o) => { if (o.isMesh) o.userData.furniture = true; });
  return group;
}

// ---------------------------------------------------------------------------
// First-floor flat (positions in feet, see plan-ff.js)
// ---------------------------------------------------------------------------
function firstFloorFurniture() {
  const slant = -Math.atan(rearZ(1) - rearZ(0)); // turn that lines a piece up with the slanted rear wall
  const backAt = (x) => rearZ(x) + REAR_T;      // inside face of the rear wall

  // ---- Living room: sofa on the north wall, TV unit screening the dining area ----
  rug(5.9, -24.7, 6.2, 8.4);
  sofa(item(2.35, -24.7, Math.PI / 2), 6.8, 2.85, 3, 'sofaGrey');
  collide(0.9, 3.8, -28.1, -21.3, 2.8);
  armchair(item(6.0, -29.0, 0));
  collide(4.5, 7.5, -30.4, -27.6, 2.8);
  coffeeTable(item(6.0, -24.7), 1.9, 3.2);
  collide(5.05, 6.95, -26.3, -23.1, 1.5);
  sideTable(item(2.3, -20.4));
  collide(1.7, 2.9, -21.0, -19.8, 2);
  plant(4.3, -19.7, 0.95);
  collide(3.75, 4.85, -20.25, -19.15, 2.5);
  // TV console with a slatted teak screen behind it (the open side towards the dining table)
  tvConsole(item(11.35, -24.7, -Math.PI / 2), 5.0);
  mesh(box(0.5, 0.12, 0.9), 'blackMatte', 11.35, F + 1.56, -24.7, group, { uv: false });
  mesh(box(0.08, 0.5, 0.08), 'blackMatte', 11.35, F + 1.82, -24.7, group, { uv: false });
  tv(item(11.35, -24.7, -Math.PI / 2, F + 3.1), 3.7, 2.1);
  for (let z = -27.15; z <= -22.2; z += 0.33) mesh(box(0.12, 7.6, 0.14), 'teakFrameV', 12.08, F + 3.8, z);
  mesh(box(0.16, 0.12, 5.1), 'teakFrame', 12.08, F + 7.66, -24.68);
  collide(10.7, 12.2, -27.25, -22.15, 7.6);
  ceilingFan(6.0, -24.7);
  ceilingLight(6.0, -20.3, 0.4);
  curtains('z', 0.75, -26.0, -21.0, 1, 'curtainSage');
  curtains('x', -18.831, 2.0, 10.0, -1, 'curtainSage'); // beside the sliding door to the terrace
  wallArt(2.9, F + 5.6, -30.48, 0, 3.0, 1.9, 'art');

  // ---- Dining & entrance passage ----
  const tx = 16.8, tz = -25.2;
  diningTable(item(tx, tz), 2.76, 4.75);
  collide(tx - 1.39, tx + 1.41, tz - 2.35, tz + 2.35, 2.6);
  chair(item(tx, tz - 3.2, 0));
  chair(item(tx, tz + 3.3, Math.PI));
  for (const dz of [-0.91, 0.9]) {
    chair(item(tx - 2.24, tz + dz, Math.PI / 2));
    chair(item(tx + 2.21, tz + dz, -Math.PI / 2));
  }
  pendant(tx, tz - 1.2, F + 5.4);
  pendant(tx, tz + 1.2, F + 5.4);
  // sideboard under the window onto the terrace
  const sb = item(14.2, -19.5, Math.PI);
  mesh(rbox(3.2, 2.6, 1.25, 0.04), 'furnWood', 0, 1.3, 0, sb);
  for (let i = 0; i < 3; i++) mesh(box(0.98, 2.2, 0.02), 'laminate', -1.05 + i * 1.05, 1.35, 0.63, sb, { uv: false });
  mesh(cyl(0.32, 0.22, 0.6, 16), 'ceramic', -0.9, 2.9, 0, sb, { uv: false });
  collide(12.6, 15.8, -20.15, -18.83, 2.7);
  curtains('x', -18.831, 11.0, 15.0, -1, 'curtainSage');
  plant(12.95, -30.3, 0.95);
  collide(12.35, 13.55, -30.9, -29.7, 2.5);
  ceilingLight(20.2, -21.0, 0.4);
  ceilingLight(20.2, -14.0, 0.4);
  // shoe cabinet and mirror inside the main door
  const sc = item(18.85, -15.0, Math.PI / 2);
  mesh(rbox(3.0, 3.0, 1.1, 0.04), 'furnLight', 0, 1.5, 0, sc);
  mesh(box(2.8, 0.02, 0.02), 'brass', 0, 2.6, 0.56, sc, { uv: false });
  mesh(box(0.04, 2.6, 2.2), 'mirror', 18.29, F + 5.1, -15.0, group, { uv: false });
  collide(18.25, 19.45, -16.5, -13.5, 3);
  wallArt(22.12, F + 5.3, -11.4, -Math.PI / 2, 1.6, 2.2, 'art2');

  // ---- Kitchen: L-shaped counter, sink under the shaft window, fridge ----
  ffKitchen();

  // ---- Bedroom 3 (master): bed against the rear wall, between its two windows ----
  // (set a little towards the north, so there is room to open the wardrobe beside it)
  const bx = 5.2;
  bed(item(bx, backAt(bx) + 3.3, slant), 5.0, 6.0, 'blanketSage');
  collide(bx - 2.6, bx + 2.6, backAt(bx) - 0.1, backAt(bx) + 6.4, 2.2);
  for (const sx of [1.8, 8.6]) {
    sideTable(item(sx, backAt(sx) + 0.62, slant));
    collide(sx - 0.65, sx + 0.65, backAt(sx), backAt(sx) + 1.2, 2);
  }
  // armchair further along the south wall, in front of that window, turned to the room
  armchair(item(10.3, -37.5, -2.2), 2.7, 2.5);
  collide(9.0, 11.6, -38.8, -36.2, 2.8);
  // dressing table against the front wall, beside the door from the living room
  const dt = item(7.1, -31.584, Math.PI);
  mesh(rbox(1.6, 2.5, 1.3, 0.04), 'furnLight', 0, 1.25, 0, dt);
  mesh(box(1.4, 2.2, 0.04), 'furnLight', 0, 4.1, -0.63, dt, { uv: false });
  mesh(box(1.15, 1.95, 0.03), 'mirror', 0, 4.1, -0.6, dt, { uv: false });
  mesh(cyl(0.5, 0.45, 1.4, 16), 'sofaAccent', 0, 0.7, 1.05, dt, { uv: false });
  collide(6.3, 7.9, -32.234, -30.934, 2.5);
  collide(6.55, 7.65, -33.2, -32.1, 1.5);
  ceilingFan(bx, -43.2);
  ceilingLight(9.1, -34.0, 0.35);
  curtains('z', 0.75, -45.0, -40.0, 1, 'curtainBlue');
  wallArt(bx, F + 5.9, backAt(bx) + 0.05, slant, 3.2, 1.2, 'art2');

  // ---- Bedroom 3's study corner: bookshelf on the west wall, work desk beside it
  //      under the north window, both open to the rest of the room ----
  bookshelf(item(2.3, -31.434, Math.PI), 3.0, 6.0, 1.0);
  collide(0.8, 3.8, -31.934, -30.934, 6.0);
  const dz = -35.6; // desk (and window) centre: midway between the bookshelf and the bed's window
  studyDesk(1.75, dz, 4.6);
  collide(0.75, 2.75, dz - 2.3, dz + 2.3, 2.6);
  officeChair(item(3.75, dz, -Math.PI / 2));
  collide(3.05, 4.45, dz - 0.7, dz + 0.7, 3.2);
  // roller blind, half down, inside the window reveal
  mesh(box(0.03, 1.8, 3.8), 'curtainBlue', 0.66, F + 6.4, dz, group, { uv: false });
  mesh(cyl(0.07, 0.07, 3.9, 10), 'white', 0.66, F + 7.33, dz, group, { uv: false }).rotation.x = Math.PI / 2;
  ceilingLight(3.4, dz, 0.32);

  // ---- Bedroom 4: bed in the middle of the party wall, TV opposite it (clothes are in
  //      the walk-in wardrobe behind) ----
  const b4 = (-37.821 + -26.882) / 2;
  bed(item(31.27, b4, -Math.PI / 2), 5.0, 6.1, 'blanketRust');
  collide(28.2, 34.6, b4 - 2.6, b4 + 2.6, 2.2);
  sideTable(item(34.0, b4 - 3.3, -Math.PI / 2));
  sideTable(item(34.0, b4 + 3.3, -Math.PI / 2));
  collide(33.4, 34.65, b4 - 3.9, b4 - 2.7, 2); collide(33.4, 34.65, b4 + 2.7, b4 + 3.9, 2);
  mesh(box(1.2, 1.5, 3.0), 'furnWood', 23.3, F + 0.75, b4);
  tv(item(22.75, b4, Math.PI / 2, F + 4.3), 3.2, 1.8);
  collide(22.67, 23.9, b4 - 1.5, b4 + 1.5, 1.5);
  ceilingFan(28.6, b4);
  wallArt(34.62, F + 5.8, b4, -Math.PI / 2, 3.2, 1.3, 'art');

  dressingRoom(slant);

  // ---- Bathroom (bathroom 4 and the common toilet in one), door from the dining area ----
  basinUnit(26.6, -21.73, Math.PI);
  collide(25.8, 27.4, -22.4, -21.07, 3);
  wcUnit(29.0, -25.26, 0);
  collide(28.4, 29.6, -26.53, -24.4, 2);
  showerUnit(PLOT_W - 0.77, -23.8, -Math.PI / 2);
  showerScreen(31.9, -26.45, 31.9, -23.3);
  ceilingLight(26.0, -23.8, 0.35);
  ceilingLight(33.2, -23.8, 0.32);

  // ---- Stair landing ----
  plant(18.95, -1.55, 1.0);
  collide(18.4, 19.5, -2.1, -1.0, 2.5);
  ceilingLight(20.6, -4.8, 0.4);

  // ---- Front terrace ----
  const tb = item(6.0, -8.5);
  mesh(cyl(1.25, 1.25, 0.1, 28), 'furnLight', 0, 2.4, 0, tb, { uv: false });
  mesh(cyl(0.1, 0.1, 2.35, 10), 'blackMatte', 0, 1.2, 0, tb, { uv: false });
  mesh(cyl(0.7, 0.75, 0.08, 20), 'blackMatte', 0, 0.04, 0, tb, { uv: false });
  collide(4.75, 7.25, -9.75, -7.25, 2.5);
  chair(item(6.0, -10.65, 0));
  chair(item(6.0, -6.35, Math.PI));
  collide(5.25, 6.75, -11.4, -9.9, 3); collide(5.25, 6.75, -7.1, -5.6, 3);
  for (const [x, z, s] of [[1.8, -2.6, 1.2], [1.7, -16.8, 1.0], [16.3, -16.8, 1.05], [16.2, -2.6, 1.15]]) {
    plant(x, z, s);
    collide(x - 0.6 * s, x + 0.6 * s, z - 0.6 * s, z + 0.6 * s, 2.5);
  }
}

function ffKitchen() {
  const x0 = 22.674, x1 = 31.59, zr = -20.282, zf = -18.28; // run along the back (north) wall
  const ex = 29.59, ez = GUEST_WR.z0 - 0.08;                  // run along the shaft (east) wall, up to the alcove
  const top = (xa, xb, za, zb) => mesh(box(xb - xa, 0.15, zb - za), 'graniteBlack', (xa + xb) / 2, F + 2.825, (za + zb) / 2);
  const cab = (xa, xb, za, zb) => mesh(box(xb - xa, 2.4, zb - za), 'laminateSage', (xa + xb) / 2, F + 1.55, (za + zb) / 2);
  const kick = (xa, xb, za, zb) => mesh(box(xb - xa, 0.35, zb - za), 'blackMatte', (xa + xb) / 2, F + 0.175, (za + zb) / 2);
  top(x0, x1, zr, zf); cab(x0, x1, zr, zf - 0.1); kick(x0, x1, zr, zf - 0.3);
  top(ex, x1, zf, ez); cab(ex + 0.1, x1, zf, ez); kick(ex + 0.3, x1, zf, ez);
  for (let x = x0 + 0.8; x < ex - 0.6; x += 1.6) mesh(box(0.7, 0.05, 0.06), 'steel', x, F + 2.45, zf - 0.08, group, { uv: false });
  for (let z = zf + 1.0; z < ez - 0.4; z += 1.6) mesh(box(0.06, 0.05, 0.7), 'steel', ex + 0.08, F + 2.45, z, group, { uv: false });
  collide(x0, x1, zr, zf, 3);
  collide(ex, x1, zf, ez, 3);
  // hob and chimney on the back run
  const hob = item(26.0, -19.3);
  mesh(rbox(3.0, 0.08, 1.5, 0.03), 'screen', 0, 2.95, 0, hob, { uv: false });
  for (const s of [-1, 1]) {
    mesh(cyl(0.34, 0.34, 0.06, 20), 'steel', s * 0.75, 3.0, 0, hob, { uv: false });
    mesh(cyl(0.18, 0.18, 0.08, 16), 'blackMatte', s * 0.75, 3.03, 0, hob, { uv: false });
  }
  mesh(cyl(0.45, 0.4, 0.5, 18), 'steel', 25.25, F + 3.28, -19.3, group, { uv: false });
  mesh(box(2.8, 0.9, 1.6), 'steel', 26.0, F + 5.8, zr + 0.83, group, { uv: false });
  const duct = CEIL - (F + 6.25);
  mesh(box(1.0, duct, 0.9), 'steel', 26.0, F + 6.25 + duct / 2, zr + 0.48, group, { uv: false });
  // wall cupboards either side of the chimney
  for (const [xa, xb] of [[22.8, 24.4], [27.6, 31.45]]) {
    mesh(box(xb - xa, 2.0, 1.1), 'laminate', (xa + xb) / 2, F + 6.0, zr + 0.58, group);
    for (let x = xa + 1.6; x < xb - 0.3; x += 1.6) mesh(box(0.03, 1.9, 0.02), 'laminateGrey', x, F + 6.0, zr + 1.14, group, { uv: false });
  }
  // sink under the window onto the shaft
  mesh(box(1.5, 0.04, 2.3), 'steel', 30.6, F + 2.93, -17.0, group, { uv: false });
  mesh(box(1.0, 0.05, 1.0), 'blackMatte', 30.55, F + 2.955, -17.55, group, { uv: false });
  mesh(box(1.0, 0.05, 1.0), 'blackMatte', 30.55, F + 2.955, -16.45, group, { uv: false });
  mesh(cyl(0.05, 0.05, 1.1, 8), 'chrome', 31.3, F + 3.45, -17.0, group, { uv: false });
  const spout = mesh(cyl(0.04, 0.04, 0.7, 8), 'chrome', 31.0, F + 3.95, -17.0, group, { uv: false });
  spout.rotation.z = Math.PI / 2;
  // fridge and a tall pantry unit in the alcove over the guest room's wardrobe
  const fr = item(34.05, GUEST_WR.z0 + 1.0, -Math.PI / 2);
  mesh(rbox(1.75, 5.8, 1.9, 0.06), 'steel', 0, 2.9, 0, fr);
  mesh(box(1.7, 0.03, 0.02), 'blackMatte', 0, 3.9, 0.96, fr, { uv: false });
  mesh(box(0.06, 1.4, 0.08), 'blackMatte', -0.7, 4.8, 1.0, fr, { uv: false });
  mesh(box(0.06, 1.6, 0.08), 'blackMatte', -0.7, 2.6, 1.0, fr, { uv: false });
  collide(33.05, 35.02, GUEST_WR.z0, GUEST_WR.z0 + 1.9, 6);
  wardrobe(item(34.05, (GUEST_WR.z0 + 1.95 + GUEST_WR.z1) / 2, -Math.PI / 2), GUEST_WR.z1 - GUEST_WR.z0 - 2.05, 7.2, 1.9, 'laminateSage');
  collide(33.05, 35.02, GUEST_WR.z0 + 1.95, GUEST_WR.z1, 7.2);
  // a few things on the counter
  mesh(cyl(0.22, 0.22, 0.5, 16), 'pot', 23.6, F + 3.15, -19.5, group, { uv: false });
  mesh(box(1.1, 0.75, 0.85), 'laminateGrey', 30.6, F + 3.27, -19.2, group, { uv: false });
  ceilingLight(26.6, -15.0, 0.4);
}

// ---------------------------------------------------------------------------
// Roof terrace: a few planters and a bench
// ---------------------------------------------------------------------------
function roofFurniture() {
  for (const [x, z, s] of [[1.6, -19.6, 1.2], [6.0, -19.6, 1.0], [10.4, -19.6, 1.1], [1.6, -30.0, 1.15], [1.6, -40.0, 1.0], [27.0, -11.0, 1.1]]) {
    plant(x, z, s, F, 'potDark');
    collide(x - 0.6 * s, x + 0.6 * s, z - 0.6 * s, z + 0.6 * s, 2.5);
  }
  const bench = item(1.45, -35.0, Math.PI / 2);
  mesh(box(5.0, 0.16, 1.5), 'furnLight', 0, 1.45, 0, bench);
  mesh(box(5.0, 1.1, 0.12), 'furnLight', 0, 2.2, -0.7, bench);
  for (const sx of [-2.2, 2.2]) mesh(box(0.14, 1.4, 1.3), 'blackMatte', sx, 0.7, 0, bench);
  collide(0.65, 2.25, -37.6, -32.4, 2.8);
  ceilingLight(20.6, -4.8, 0.4); // in the mumty
}
