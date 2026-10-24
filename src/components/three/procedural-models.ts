import * as THREE from 'three';

/**
 * 1. Kyoto Pagoda (7-part composite procedural model)
 * Silhouette: Multi-tiered Japanese pagoda with vermilion lacquer, stone base, and golden spire
 */
export function createKyotoPagoda(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'KyotoPagoda';

  // Materials with varied roughness and metalness
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x4a4d48,
    roughness: 0.9,
    metalness: 0.1,
  });

  const vermilionMat = new THREE.MeshStandardMaterial({
    color: 0xb3382c,
    roughness: 0.45,
    metalness: 0.15,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x2d221e,
    roughness: 0.8,
    metalness: 0.05,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x252b28,
    roughness: 0.6,
    metalness: 0.3,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.85,
  });

  // Part 1: Stone foundation plinth (flush with ground at y=0)
  const baseGeom = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 8);
  const baseMesh = new THREE.Mesh(baseGeom, stoneMat);
  baseMesh.position.y = 0.2;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Part 2: Main lower temple pavilion core
  const core1Geom = new THREE.BoxGeometry(1.8, 1.1, 1.8);
  const core1Mesh = new THREE.Mesh(core1Geom, vermilionMat);
  core1Mesh.position.y = 0.95;
  core1Mesh.castShadow = true;
  group.add(core1Mesh);

  // Part 3: Eaves Roof Level 1 (wide Japanese curved flare)
  const roof1Geom = new THREE.ConeGeometry(2.2, 0.5, 4);
  const roof1Mesh = new THREE.Mesh(roof1Geom, roofMat);
  roof1Mesh.position.y = 1.6;
  roof1Mesh.rotation.y = Math.PI / 4;
  roof1Mesh.castShadow = true;
  group.add(roof1Mesh);

  // Part 4: Mid tower body
  const core2Geom = new THREE.BoxGeometry(1.3, 0.9, 1.3);
  const core2Mesh = new THREE.Mesh(core2Geom, vermilionMat);
  core2Mesh.position.y = 2.15;
  core2Mesh.castShadow = true;
  group.add(core2Mesh);

  // Part 5: Eaves Roof Level 2
  const roof2Geom = new THREE.ConeGeometry(1.7, 0.45, 4);
  const roof2Mesh = new THREE.Mesh(roof2Geom, roofMat);
  roof2Mesh.position.y = 2.7;
  roof2Mesh.rotation.y = Math.PI / 4;
  roof2Mesh.castShadow = true;
  group.add(roof2Mesh);

  // Part 6: Top tower body
  const core3Geom = new THREE.BoxGeometry(0.9, 0.7, 0.9);
  const core3Mesh = new THREE.Mesh(core3Geom, vermilionMat);
  core3Mesh.position.y = 3.15;
  group.add(core3Mesh);

  // Part 7: Top Eaves Roof Level 3
  const roof3Geom = new THREE.ConeGeometry(1.2, 0.4, 4);
  const roof3Mesh = new THREE.Mesh(roof3Geom, roofMat);
  roof3Mesh.position.y = 3.6;
  roof3Mesh.rotation.y = Math.PI / 4;
  roof3Mesh.castShadow = true;
  group.add(roof3Mesh);

  // Part 8: Golden Spire Finial (Sorin)
  const spireGeom = new THREE.CylinderGeometry(0.04, 0.08, 1.1, 8);
  const spireMesh = new THREE.Mesh(spireGeom, goldMat);
  spireMesh.position.y = 4.3;
  group.add(spireMesh);

  // Part 9: Golden spire jewel ball tip
  const tipGeom = new THREE.SphereGeometry(0.12, 12, 12);
  const tipMesh = new THREE.Mesh(tipGeom, goldMat);
  tipMesh.position.y = 4.85;
  group.add(tipMesh);

  // Part 10: Torii Gate accent placed at entrance
  const toriiGroup = new THREE.Group();
  const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
  const leftPost = new THREE.Mesh(postGeom, vermilionMat);
  leftPost.position.set(-0.6, 0.6, 2.0);
  const rightPost = new THREE.Mesh(postGeom, vermilionMat);
  rightPost.position.set(0.6, 0.6, 2.0);

  const topBeamGeom = new THREE.BoxGeometry(1.6, 0.12, 0.15);
  const topBeam = new THREE.Mesh(topBeamGeom, vermilionMat);
  topBeam.position.set(0, 1.2, 2.0);

  toriiGroup.add(leftPost, rightPost, topBeam);
  group.add(toriiGroup);

  return group;
}

/**
 * 2. Eiffel Tower (8-part composite procedural model)
 * Silhouette: Tapered lattice tower, arched base, mid deck, spire beacon
 */
export function createEiffelTower(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'EiffelTower';

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x6e6259, // Classic Eiffel bronze/warm grey
    roughness: 0.5,
    metalness: 0.7,
  });

  const goldBeaconMat = new THREE.MeshStandardMaterial({
    color: 0xffe680,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x554411,
    emissiveIntensity: 0.5,
  });

  // 4 Angled Base Legs
  const legGeom = new THREE.CylinderGeometry(0.14, 0.28, 2.0, 6);
  const legOffsets = [
    [-0.9, -0.9],
    [0.9, -0.9],
    [-0.9, 0.9],
    [0.9, 0.9],
  ];

  legOffsets.forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeom, ironMat);
    leg.position.set(x, 1.0, z);
    leg.rotation.x = z > 0 ? 0.2 : -0.2;
    leg.rotation.z = x > 0 ? -0.2 : 0.2;
    leg.castShadow = true;
    group.add(leg);
  });

  // Base platform deck
  const deck1Geom = new THREE.BoxGeometry(1.8, 0.15, 1.8);
  const deck1Mesh = new THREE.Mesh(deck1Geom, ironMat);
  deck1Mesh.position.y = 2.0;
  deck1Mesh.castShadow = true;
  group.add(deck1Mesh);

  // Arched lattice cross brace
  const archGeom = new THREE.TorusGeometry(0.7, 0.08, 6, 12, Math.PI);
  const archMesh1 = new THREE.Mesh(archGeom, ironMat);
  archMesh1.position.set(0, 1.2, 0);
  group.add(archMesh1);

  // Second tier body (tapering pyramid)
  const tier2Geom = new THREE.CylinderGeometry(0.45, 0.75, 2.2, 4);
  const tier2Mesh = new THREE.Mesh(tier2Geom, ironMat);
  tier2Mesh.position.y = 3.1;
  tier2Mesh.rotation.y = Math.PI / 4;
  tier2Mesh.castShadow = true;
  group.add(tier2Mesh);

  // Upper observation gallery platform
  const deck2Geom = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 8);
  const deck2Mesh = new THREE.Mesh(deck2Geom, ironMat);
  deck2Mesh.position.y = 4.25;
  group.add(deck2Mesh);

  // Soaring Spire needle
  const spireGeom = new THREE.CylinderGeometry(0.04, 0.35, 2.8, 6);
  const spireMesh = new THREE.Mesh(spireGeom, ironMat);
  spireMesh.position.y = 5.65;
  spireMesh.castShadow = true;
  group.add(spireMesh);

  // Beacon Lantern Finial
  const beaconGeom = new THREE.SphereGeometry(0.1, 10, 10);
  const beaconMesh = new THREE.Mesh(beaconGeom, goldBeaconMat);
  beaconMesh.position.y = 7.1;
  group.add(beaconMesh);

  return group;
}

/**
 * 3. Alpine Mountain Peak (6-part composite procedural model)
 * Silhouette: Jagged crag with glistening snow crown and pine foothills
 */
export function createAlpinePeak(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AlpinePeak';

  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x48494b,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
  });

  const snowMat = new THREE.MeshStandardMaterial({
    color: 0xf5f8fa,
    roughness: 0.35,
    metalness: 0.1,
    flatShading: true,
  });

  const pineWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
  });

  const pineNeedleMat = new THREE.MeshStandardMaterial({
    color: 0x1c3a27,
    roughness: 0.8,
  });

  // Mountain Base Rock
  const baseRockGeom = new THREE.ConeGeometry(3.5, 4.0, 7);
  const baseRock = new THREE.Mesh(baseRockGeom, rockMat);
  baseRock.position.y = 2.0;
  baseRock.castShadow = true;
  baseRock.receiveShadow = true;
  group.add(baseRock);

  // Mountain Top Snow Cap
  const snowCapGeom = new THREE.ConeGeometry(1.6, 2.2, 7);
  const snowCap = new THREE.Mesh(snowCapGeom, snowMat);
  snowCap.position.y = 3.6;
  snowCap.castShadow = true;
  group.add(snowCap);

  // Secondary Jagged Ridge Peak
  const subPeakGeom = new THREE.ConeGeometry(2.0, 2.8, 6);
  const subPeak = new THREE.Mesh(subPeakGeom, rockMat);
  subPeak.position.set(1.6, 1.4, -0.6);
  subPeak.rotation.z = -0.15;
  subPeak.castShadow = true;
  group.add(subPeak);

  // Pine tree cluster at the base
  const treeOffsets = [
    [-1.8, 0.4, 1.5],
    [-2.2, 0.3, 0.8],
    [1.8, 0.3, 1.6],
    [0.5, 0.3, 2.2],
  ];

  treeOffsets.forEach(([x, y, z]) => {
    const treeGroup = new THREE.Group();
    const trunkGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.6, 5);
    const trunk = new THREE.Mesh(trunkGeom, pineWoodMat);
    trunk.position.y = 0.3;

    const foliage1Geom = new THREE.ConeGeometry(0.45, 0.8, 5);
    const f1 = new THREE.Mesh(foliage1Geom, pineNeedleMat);
    f1.position.y = 0.7;

    const foliage2Geom = new THREE.ConeGeometry(0.32, 0.6, 5);
    const f2 = new THREE.Mesh(foliage2Geom, pineNeedleMat);
    f2.position.y = 1.05;

    treeGroup.add(trunk, f1, f2);
    treeGroup.position.set(x, y, z);
    group.add(treeGroup);
  });

  return group;
}

/**
 * 4. Tropical Atoll Island & Palm Grove (8-part composite procedural model)
 */
export function createAtollIsland(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TropicalAtoll';

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xe8d8b5,
    roughness: 0.9,
    metalness: 0.05,
  });

  const palmWoodMat = new THREE.MeshStandardMaterial({
    color: 0x6e5238,
    roughness: 0.85,
  });

  const palmLeafMat = new THREE.MeshStandardMaterial({
    color: 0x2d633c,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });

  const thatchRoofMat = new THREE.MeshStandardMaterial({
    color: 0x99794e,
    roughness: 0.9,
  });

  // Sandy Knoll
  const sandGeom = new THREE.CylinderGeometry(2.4, 2.8, 0.4, 16);
  const sandMesh = new THREE.Mesh(sandGeom, sandMat);
  sandMesh.position.y = 0.2;
  sandMesh.receiveShadow = true;
  group.add(sandMesh);

  // Thatched Stilt Bungalow
  const bungalow = new THREE.Group();
  const floorGeom = new THREE.BoxGeometry(1.1, 0.1, 1.1);
  const floor = new THREE.Mesh(floorGeom, palmWoodMat);
  floor.position.y = 0.6;

  // Stilt poles
  const stiltGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
  [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => {
    const stilt = new THREE.Mesh(stiltGeom, palmWoodMat);
    stilt.position.set(x, 0.3, z);
    bungalow.add(stilt);
  });

  const wallsGeom = new THREE.BoxGeometry(0.9, 0.6, 0.9);
  const walls = new THREE.Mesh(wallsGeom, sandMat);
  walls.position.y = 0.95;

  const roofGeom = new THREE.ConeGeometry(0.85, 0.6, 4);
  const roof = new THREE.Mesh(roofGeom, thatchRoofMat);
  roof.position.y = 1.5;
  roof.rotation.y = Math.PI / 4;

  bungalow.add(floor, walls, roof);
  bungalow.position.set(-0.8, 0.2, 0.4);
  group.add(bungalow);

  // Curved Palm Trees
  const palm1 = createPalmTree(palmWoodMat, palmLeafMat);
  palm1.position.set(0.7, 0.4, -0.4);
  palm1.rotation.y = 0.5;

  const palm2 = createPalmTree(palmWoodMat, palmLeafMat);
  palm2.position.set(1.1, 0.4, 0.5);
  palm2.scale.set(0.8, 0.8, 0.8);
  palm2.rotation.y = -1.2;

  group.add(palm1, palm2);

  return group;
}

function createPalmTree(trunkMat: THREE.Material, leafMat: THREE.Material): THREE.Group {
  const tree = new THREE.Group();

  // Segmented curving trunk
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.1, 0.8, 0.05),
    new THREE.Vector3(0.3, 1.6, 0.1),
    new THREE.Vector3(0.6, 2.3, 0.2),
  ]);
  const trunkGeom = new THREE.TubeGeometry(trunkCurve, 8, 0.1, 6, false);
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.castShadow = true;
  tree.add(trunk);

  // Crown fronds
  const frondCount = 6;
  const crownPos = new THREE.Vector3(0.6, 2.3, 0.2);

  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const frondGeom = new THREE.ConeGeometry(0.25, 1.2, 4);
    const frond = new THREE.Mesh(frondGeom, leafMat);
    frond.position.copy(crownPos);
    frond.rotation.y = angle;
    frond.rotation.z = Math.PI / 3;
    tree.add(frond);
  }

  return tree;
}

/**
 * 5. Mediterranean Villa (Amalfi Coast) (7-part composite procedural model)
 */
export function createAmalfiVilla(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AmalfiVilla';

  const stuccoMat = new THREE.MeshStandardMaterial({
    color: 0xf6ebd6, // Soft cream pastel stucco
    roughness: 0.7,
  });

  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0xb85d38, // Terracotta baked clay
    roughness: 0.6,
  });

  const pergolaMat = new THREE.MeshStandardMaterial({
    color: 0x473426,
    roughness: 0.85,
  });

  const vineMat = new THREE.MeshStandardMaterial({
    color: 0xb53c64, // Magenta bougainvillea flowers
    roughness: 0.6,
  });

  // Stone terrace cliff wall
  const terraceGeom = new THREE.BoxGeometry(2.6, 0.6, 2.2);
  const terrace = new THREE.Mesh(terraceGeom, stuccoMat);
  terrace.position.y = 0.3;
  terrace.receiveShadow = true;
  group.add(terrace);

  // Main villa block
  const mainBlockGeom = new THREE.BoxGeometry(1.6, 1.2, 1.3);
  const mainBlock = new THREE.Mesh(mainBlockGeom, stuccoMat);
  mainBlock.position.set(-0.3, 1.2, -0.2);
  mainBlock.castShadow = true;
  group.add(mainBlock);

  // Main terracotta tiled pitched roof
  const mainRoofGeom = new THREE.ConeGeometry(1.3, 0.6, 4);
  const mainRoof = new THREE.Mesh(mainRoofGeom, terracottaMat);
  mainRoof.position.set(-0.3, 2.05, -0.2);
  mainRoof.rotation.y = Math.PI / 4;
  mainRoof.castShadow = true;
  group.add(mainRoof);

  // Villa side tower wing
  const towerGeom = new THREE.BoxGeometry(0.8, 1.6, 0.8);
  const tower = new THREE.Mesh(towerGeom, stuccoMat);
  tower.position.set(0.7, 1.4, 0.1);
  tower.castShadow = true;
  group.add(tower);

  // Tower roof
  const towerRoofGeom = new THREE.ConeGeometry(0.7, 0.5, 4);
  const towerRoof = new THREE.Mesh(towerRoofGeom, terracottaMat);
  towerRoof.position.set(0.7, 2.4, 0.1);
  towerRoof.rotation.y = Math.PI / 4;
  group.add(towerRoof);

  // Pergola trellis with bougainvillea vines
  const pergola = new THREE.Group();
  const postGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6);
  const p1 = new THREE.Mesh(postGeom, pergolaMat);
  p1.position.set(-0.6, 0.45, 0.7);
  const p2 = new THREE.Mesh(postGeom, pergolaMat);
  p2.position.set(0.1, 0.45, 0.7);

  const beamGeom = new THREE.BoxGeometry(0.9, 0.05, 0.05);
  const beam = new THREE.Mesh(beamGeom, pergolaMat);
  beam.position.set(-0.25, 0.9, 0.7);

  const flowersGeom = new THREE.SphereGeometry(0.2, 8, 8);
  const flowers = new THREE.Mesh(flowersGeom, vineMat);
  flowers.position.set(-0.25, 0.95, 0.7);

  pergola.add(p1, p2, beam, flowers);
  group.add(pergola);

  return group;
}

/**
 * 6. Traveler Glider Airplane (6-part composite procedural model)
 */
export function createTravelerAirplane(): THREE.Group {
  const plane = new THREE.Group();
  plane.name = 'TravelerAirplane';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.3,
    metalness: 0.6,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x2e5d4b, // Deep forest green accent stripe
    roughness: 0.4,
    metalness: 0.3,
  });

  const propMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Golden propeller
    roughness: 0.2,
    metalness: 0.9,
  });

  // Fuselage body
  const bodyGeom = new THREE.ConeGeometry(0.22, 1.4, 8);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.rotation.x = Math.PI / 2;
  plane.add(body);

  // Cockpit canopy accent
  const cockpitGeom = new THREE.SphereGeometry(0.12, 8, 8);
  const cockpit = new THREE.Mesh(cockpitGeom, accentMat);
  cockpit.position.set(0, 0.1, 0.2);
  plane.add(cockpit);

  // Main wings
  const wingGeom = new THREE.BoxGeometry(1.8, 0.04, 0.35);
  const wings = new THREE.Mesh(wingGeom, bodyMat);
  wings.position.set(0, 0, 0.1);
  plane.add(wings);

  // Wing green winglet accents
  const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.2), accentMat);
  wingletL.position.set(-0.9, 0.05, 0.1);
  const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.2), accentMat);
  wingletR.position.set(0.9, 0.05, 0.1);
  plane.add(wingletL, wingletR);

  // Tail vertical fin
  const tailFinGeom = new THREE.BoxGeometry(0.04, 0.3, 0.25);
  const tailFin = new THREE.Mesh(tailFinGeom, accentMat);
  tailFin.position.set(0, 0.18, -0.6);
  plane.add(tailFin);

  // Horizontal stabilizers
  const hStabGeom = new THREE.BoxGeometry(0.65, 0.03, 0.18);
  const hStab = new THREE.Mesh(hStabGeom, bodyMat);
  hStab.position.set(0, 0.05, -0.6);
  plane.add(hStab);

  // Propeller spinner & disk
  const propGeom = new THREE.BoxGeometry(0.5, 0.06, 0.02);
  const prop = new THREE.Mesh(propGeom, propMat);
  prop.position.set(0, 0, 0.72);
  prop.name = 'propeller';
  plane.add(prop);

  return plane;
}

/**
 * 7. Coastal Lighthouse (7-part composite procedural model)
 */
export function createLighthouse(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Lighthouse';

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x43484f,
    roughness: 0.9,
  });

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.5,
  });

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xa82b24,
    roughness: 0.5,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0x3d7065, // Patinated copper dome
    roughness: 0.4,
    metalness: 0.6,
  });

  const lightBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfff3c4,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Stone base ring
  const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 8), stoneMat);
  baseMesh.position.y = 0.25;
  baseMesh.castShadow = true;
  group.add(baseMesh);

  // Tapered tower sections (striped white & red)
  const sec1 = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.8, 8), whiteMat);
  sec1.position.y = 0.9;
  sec1.castShadow = true;
  const sec2 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.8, 8), redMat);
  sec2.position.y = 1.7;
  sec2.castShadow = true;
  const sec3 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.8, 8), whiteMat);
  sec3.position.y = 2.5;
  sec3.castShadow = true;
  group.add(sec1, sec2, sec3);

  // Observation Gallery Balcony
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 8), stoneMat);
  gallery.position.y = 2.95;
  group.add(gallery);

  // Lantern Glass Enclosure
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 8), whiteMat);
  lantern.position.y = 3.25;
  group.add(lantern);

  // Copper Dome Cap
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), copperMat);
  dome.position.y = 3.5;
  group.add(dome);

  // Rotating light beam cone
  const beamCone = new THREE.ConeGeometry(1.2, 5.0, 12, 1, true);
  const beamMesh = new THREE.Mesh(beamCone, lightBeamMat);
  beamMesh.position.set(0, 3.25, 2.5);
  beamMesh.rotation.x = -Math.PI / 2;
  beamMesh.name = 'lightBeam';
  group.add(beamMesh);

  return group;
}

/**
 * 8. Fluffy Atmospheric Cloud Group (Multi-puff procedural cloud)
 */
export function createProceduralCloud(): THREE.Group {
  const cloud = new THREE.Group();
  cloud.name = 'Cloud';

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf0f7fa,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
  });

  const puffs = [
    { x: 0, y: 0, z: 0, r: 0.8 },
    { x: 0.6, y: -0.1, z: 0.1, r: 0.6 },
    { x: -0.6, y: -0.15, z: -0.1, r: 0.55 },
    { x: 0.3, y: 0.3, z: 0.1, r: 0.5 },
    { x: -0.3, y: 0.25, z: 0, r: 0.45 },
  ];

  puffs.forEach(p => {
    const puffGeom = new THREE.SphereGeometry(p.r, 7, 6);
    const puffMesh = new THREE.Mesh(puffGeom, cloudMat);
    puffMesh.position.set(p.x, p.y, p.z);
    puffMesh.castShadow = true;
    cloud.add(puffMesh);
  });

  return cloud;
}
