/* ============================================================
   V11 STAGE / Three.js interactive disassembly viewer
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  GROUPS,
  MODEL,
  PART_TYPES,
  PART_ORDER,
  CATEGORY_LABELS
} from './data.js';

/* ------------------------------------------------------------
   DOM helpers
   ------------------------------------------------------------ */

const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const dom = {
  canvas: $('viewport'),
  loading: $('loadingScreen'),
  loadBar: $('loadBar'),
  loadPct: $('loadPct'),
  loadStatus: $('loadStatus'),
  labelLayer: $('labelLayer'),
  leaderLayer: $('leaderLayer'),
  groupsList: $('groupsList'),
  partsList: $('partsList'),
  filterRow: $('filterRow'),
  partSearch: $('partSearch'),
  groupsPane: $('groupsPane'),
  partsPane: $('partsPane'),
  tabGroups: $('tabGroups'),
  tabParts: $('tabParts'),
  infoPanel: $('infoPanel'),
  infoContent: $('infoContent'),
  infoActions: $('infoActions'),
  infoEyebrow: $('infoEyebrow'),
  infoStatus: $('infoStatus'),
  infoClose: $('infoClose'),
  btnLabels: $('btnLabels'),
  btnParts: $('btnParts'),
  btnHelp: $('btnHelp'),
  btnGuide: $('btnGuide'),
  btnFullscreen: $('btnFullscreen'),
  btnReset: $('btnReset'),
  btnExplode: $('btnExplode'),
  btnAuto: $('btnAuto'),
  explodeLabel: $('explodeLabel'),
  explodePct: $('explodePct'),
  explodeBar: $('explodeBar'),
  btnFocus: $('btnFocus'),
  btnIsolate: $('btnIsolate'),
  btnCollapse: $('btnCollapse'),
  toast: $('toast'),
  toastText: $('toastText'),
  helpModal: $('helpModal'),
  btnHelpClose: $('btnHelpClose'),
  partsPanel: $('partsPanel'),
  partsClose: $('partsClose'),
  btnMobileParts: $('btnMobileParts'),
  btnMobileInfo: $('btnMobileInfo'),
  telemetryParts: $('telemetryParts')
};

const GROUP_META = Object.fromEntries(GROUPS.map((group) => [group.id, group]));
const GROUP_IDS = GROUPS.map((group) => group.id);
const MAX_GROUP_COUNT = Math.max(...GROUPS.map((group) => group.count));

const ROMAN_BY_NAME = {
  XII: 'N01', I: 'N02', II: 'N03', III: 'N04', IV: 'N05', V: 'N06',
  VI: 'N07', VII: 'N08', VIII: 'N09', IX: 'N10', X: 'N11', XI: 'N12'
};

const SCREEN_BY_NAME = {
  E: 'P01', NE: 'P02', N: 'P03', NW: 'P04',
  W: 'P05', SW: 'P06', S: 'P07', SE: 'P08'
};

const CATEGORY_ACCENTS = {
  structure: '#6ccfff',
  function: '#e8b86d',
  screen: '#4b9cff',
  decor: '#e7bd77',
  fastener: '#aebdcc'
};

const LABEL_OFFSETS = {
  base: { x: 0, y: -10 },
  columns: { x: 0, y: -4 },
  deck: { x: 0, y: 18 },
  inlay: { x: 0, y: 28 },
  platform: { x: 0, y: 8 },
  numerals: { x: 0, y: 2 },
  roof: { x: 0, y: -6 },
  screens: { x: 0, y: -8 },
  drum: { x: 0, y: -14 }
};

/* ------------------------------------------------------------
   State
   ------------------------------------------------------------ */

const state = {
  ready: false,
  mode: 'assembled', // assembled | single | all
  selection: null,   // { kind, groupId, partCode }
  labelsVisible: true,
  autoRotate: false,
  isolate: false,
  partFilter: 'all',
  partQuery: '',
  pointerInside: false,
  dragging: false
};

/** Runtime scene groups, keyed by the static group id. */
const sceneGroups = {};

const nodes = [];
const codeNodes = new Map();
const groupCounts = {};

/* ------------------------------------------------------------
   Three.js handles
   ------------------------------------------------------------ */

let renderer;
let scene;
let camera;
let controls;
let model;
let clock;
let raycaster;
let aura;
let auraMaterial;
let selectionLight;
let particleField;
let particleGeometry;
let particleBase = null;
let hoverTip;
let hoveredNode = null;
let lastHoverPick = 0;
let lastFrameTime = 0;
let elapsed = 0;

let cameraTween = null;
let introTween = null;

let highlightedMeshes = [];
let highlightEdges = [];
const highlightMaterials = new Set();
const highlightMaterialCache = new Map();

let toastTimer = null;
let selectionVersion = 0;

let pointerDown = null;
const pointer = { x: 0, y: 0 };

const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempBox = new THREE.Box3();
const tempSphere = new THREE.Sphere();

const HOME_TARGET = new THREE.Vector3(0, 0.073, 0);
const EXPLODE_TARGET = new THREE.Vector3(0, 0.122, 0);
const HOME_DIRECTION = new THREE.Vector3(0.55, 0.34, 0.76).normalize();
const EXPLODE_DIRECTION = new THREE.Vector3(0.54, 0.39, 0.75).normalize();
const HOME_DISTANCE = 0.46;
const EXPLODE_DISTANCE = 0.72;

function getHomePosition() {
  const aspect = window.innerWidth / window.innerHeight;
  const base = aspect < 0.9 ? 0.92 : aspect < 1.25 ? 0.62 : HOME_DISTANCE;
  return HOME_TARGET.clone().addScaledVector(HOME_DIRECTION, base);
}

function getViewFitDistance(exploded = false) {
  const verticalFov = camera.fov * Math.PI / 180;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const width = exploded ? 0.4 : 0.255;
  const height = exploded ? 0.35 : 0.19;
  const fitV = height / (2 * Math.tan(verticalFov / 2));
  const fitH = width / (2 * Math.tan(horizontalFov / 2));
  return Math.max(fitV, fitH) * 1.16;
}

function getExplodePosition() {
  const distance = Math.max(EXPLODE_DISTANCE, getViewFitDistance(true));
  return EXPLODE_TARGET.clone().addScaledVector(EXPLODE_DIRECTION, distance);
}

/* ------------------------------------------------------------
   Utilities
   ------------------------------------------------------------ */

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < 0.5
  ? 4 * t * t * t
  : 1 - Math.pow(-2 * t + 2, 3) / 2;

function cleanMeshName(name = '') {
  return name.replace(/_CAD_Mesh$/i, '').replace(/_Mesh$/i, '');
}

function resolveGroupName(name = '') {
  if (name.startsWith('BASE_') || name.startsWith('J_BASE_')) return 'base';
  if (name.startsWith('COLUMN_') || name.startsWith('FOOT_')) return 'columns';
  if (name.startsWith('DECK_') || name.startsWith('J_DECK_')) return 'deck';
  if (name.startsWith('FLOOR_INLAY_') || name.startsWith('J_INLAY_')) return 'inlay';
  if (name.startsWith('CENTER_') || name.startsWith('J_CENTER_')) return 'platform';
  if (name.startsWith('NUMERAL_') || name.startsWith('J_NUM_')) return 'numerals';
  if (name.startsWith('ROOF_') || name.startsWith('J_ROOF_')) return 'roof';
  if (name.startsWith('SCREEN_') || name.startsWith('J_SCREEN_LOCK_')) return 'screens';
  if (name.startsWith('DRUM_')) return 'drum';
  return null;
}

function resolvePartCode(name = '', meshName = '') {
  const clean = cleanMeshName(meshName);

  if (name.startsWith('BASE_Q')) return 'B01';
  if (name.startsWith('BASE_SPLICE')) return 'B02';
  if (name.startsWith('FOOT_')) return 'C01';
  if (name === 'C02' || (name.startsWith('COLUMN_') && !name.startsWith('COLUMN_STUD') && !name.startsWith('COLUMN_TOP'))) return 'C02';
  if (name.startsWith('DECK_SPACER')) return 'B03';
  if (name.startsWith('DECK_Q')) return `F0${name.slice(-1)}`;
  if (name.startsWith('FLOOR_INLAY_')) return `F1${name.slice(-1)}`;
  if (name === 'CENTER_PLATFORM') return 'F05';
  if (name.startsWith('CENTER_SPACER')) return 'F06';
  if (name.startsWith('NUMERAL_SPACER')) return 'N13';
  if (name.startsWith('NUMERAL_')) {
    return ROMAN_BY_NAME[name.slice('NUMERAL_'.length)] || null;
  }
  if (name.startsWith('ROOF_Q')) return 'R01';
  if (name.startsWith('ROOF_SPLICE')) return 'R02';
  if (name.startsWith('SCREEN_LOCK_')) return 'P09';
  if (name.startsWith('SCREEN_CAP_COLLAR')) return 'P11';
  if (name.startsWith('SCREEN_CAP_')) return 'P10';
  if (name.startsWith('SCREEN_')) return SCREEN_BY_NAME[name.slice('SCREEN_'.length)] || null;
  if (name.startsWith('DRUM_SKIN')) return 'D01';
  if (name === 'DRUM_TOP_RING') return 'D02';
  if (name === 'DRUM_BOTTOM_DISC') return 'D03';
  if (name.startsWith('DRUM_SPACER')) return 'D05';
  if (clean.startsWith('H_')) return clean.split('.')[0];
  return null;
}

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.12, 'rgba(200,250,255,0.58)');
  gradient.addColorStop(0.34, 'rgba(100,228,255,0.18)');
  gradient.addColorStop(0.68, 'rgba(26,137,182,0.04)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeFloorTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(52,164,205,0.22)');
  gradient.addColorStop(0.22, 'rgba(29,117,154,0.12)');
  gradient.addColorStop(0.55, 'rgba(9,55,76,0.045)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function showToast(message, duration = 3200) {
  if (!dom.toast) return;
  dom.toastText.textContent = message;
  dom.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('is-visible'), duration);
}

function setLoadProgress(percent, status) {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));
  if (dom.loadBar) dom.loadBar.style.width = `${safe}%`;
  if (dom.loadPct) dom.loadPct.textContent = `${String(safe).padStart(2, '0')}%`;
  if (status && dom.loadStatus) dom.loadStatus.textContent = status;
}

/* ------------------------------------------------------------
   Scene
   ------------------------------------------------------------ */

function initScene() {
  renderer = new THREE.WebGLRenderer({
    canvas: dom.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.001, 8);
  camera.position.copy(getHomePosition());

  controls = new OrbitControls(camera, dom.canvas);
  controls.target.copy(HOME_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.62;
  controls.zoomSpeed = 0.85;
  controls.panSpeed = 0.65;
  controls.screenSpacePanning = true;
  controls.minDistance = 0.14;
  controls.maxDistance = 2.0;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI * 0.485;
  controls.autoRotateSpeed = 0.55;
  controls.update();

  controls.addEventListener('start', () => {
    cameraTween = null;
    introTween = null;
    if (state.labelsVisible) hideHoverTip();
  });

  setupEnvironment();
  setupLights();
  setupGround();
  setupAtmosphere();

  raycaster = new THREE.Raycaster();
  clock = new THREE.Clock();

  window.addEventListener('resize', onResize);
  dom.canvas.addEventListener('pointerdown', onPointerDown);
  dom.canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  dom.canvas.addEventListener('pointercancel', clearPointer);
  dom.canvas.addEventListener('pointerleave', () => {
    state.pointerInside = false;
    hideHoverTip();
  });

  hoverTip = document.createElement('div');
  hoverTip.className = 'hover-tip';
  hoverTip.innerHTML = '<span class="hover-tip-code"></span><span class="hover-tip-name"></span>';
  document.getElementById('app').appendChild(hoverTip);
}

function setupEnvironment() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const room = new RoomEnvironment();
  const renderTarget = pmrem.fromScene(room, 0.04);
  scene.environment = renderTarget.texture;
  scene.environmentIntensity = 0.68;
  room.dispose();
  pmrem.dispose();
}

function setupLights() {
  const hemisphere = new THREE.HemisphereLight(0xbfd8e6, 0x050b12, 0.58);
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(0xeaf7ff, 2.45);
  key.position.set(0.36, 0.62, 0.28);
  key.target.position.set(0, 0.07, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -0.24;
  key.shadow.camera.right = 0.24;
  key.shadow.camera.top = 0.24;
  key.shadow.camera.bottom = -0.24;
  key.shadow.camera.near = 0.01;
  key.shadow.camera.far = 1.2;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.0015;
  key.shadow.radius = 2.4;
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.DirectionalLight(0x3b66ff, 0.7);
  fill.position.set(-0.44, 0.32, -0.18);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x53dcff, 1.5);
  rim.position.set(0.18, 0.12, -0.56);
  scene.add(rim);

  const warm = new THREE.PointLight(0xffb862, 0.9, 0.55, 2);
  warm.position.set(-0.16, 0.1, 0.12);
  scene.add(warm);

  const overhead = new THREE.SpotLight(0x9ae8ff, 7, 0.8, 0.66, 0.85, 1.35);
  overhead.position.set(0.02, 0.58, 0.05);
  overhead.target.position.set(0, 0.07, 0);
  scene.add(overhead);
  scene.add(overhead.target);

  selectionLight = new THREE.PointLight(0x64e4ff, 0, 0.48, 2);
  scene.add(selectionLight);
}

function setupGround() {
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.25, 1.25),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.5 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.0004;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const glowDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.78),
    new THREE.MeshBasicMaterial({
      map: makeFloorTexture(),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  glowDisc.rotation.x = -Math.PI / 2;
  glowDisc.position.y = -0.0012;
  scene.add(glowDisc);

  const grid = new THREE.GridHelper(1.12, 56, 0x1d6f87, 0x0e3747);
  grid.position.y = -0.001;
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  grid.material.depthWrite = false;
  scene.add(grid);

  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0x4bc8e8,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  [0.128, 0.168, 0.225].forEach((radius, index) => {
    const segments = 160;
    const positions = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -0.0008 + index * 0.00006;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ring = new THREE.Line(geometry, ringMaterial.clone());
    ring.material.opacity = index === 1 ? 0.22 : 0.1;
    scene.add(ring);
  });

  const auraTexture = makeGlowTexture();
  auraMaterial = new THREE.SpriteMaterial({
    map: auraTexture,
    color: 0x64e4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });
  aura = new THREE.Sprite(auraMaterial);
  aura.scale.setScalar(0.18);
  aura.renderOrder = 8;
  aura.visible = false;
  scene.add(aura);
}

function setupAtmosphere() {
  const count = 130;
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 0.075 + Math.pow(Math.random(), 0.7) * 0.28;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.random() * 0.32 - 0.005;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    seeds[i * 3] = Math.random() * Math.PI * 2;
    seeds[i * 3 + 1] = 0.004 + Math.random() * 0.012;
    seeds[i * 3 + 2] = radius;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleBase = positions.slice();
  particleGeometry.userData.seeds = seeds;

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x79d9f2,
    size: 0.00135,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleField = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleField);
}

/* ------------------------------------------------------------
   Model loading + normalisation
   ------------------------------------------------------------ */

function handleModelLoaded(gltf) {
  setLoadProgress(86, 'INDEXING 461 COMPONENTS');
  try {
    processModel(gltf);
    setLoadProgress(100, 'ASSEMBLY READY');
    finishLoading();
  } catch (error) {
    console.error(error);
    failLoading(error);
  }
}

function handleModelError(error) {
  console.error(error);
  failLoading(error);
}

function loadEmbeddedModel(loader, base64) {
  setLoadProgress(12, 'DECODING EMBEDDED MODEL');
  window.setTimeout(() => {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      setLoadProgress(86, 'INDEXING 461 COMPONENTS');
      loader.parse(bytes.buffer, '', handleModelLoaded, handleModelError);
    } catch (error) {
      handleModelError(error);
    }
  }, 40);
}

function loadModel() {
  const loader = new GLTFLoader();
  const embedded = document.getElementById('v11-glb-data')?.textContent.replace(/\s+/g, '');

  if (embedded) {
    loadEmbeddedModel(loader, embedded);
    return;
  }

  setLoadProgress(2, 'CONNECTING TO MODEL / GLB');
  loader.load(
    './assets/stage-v11.glb',
    handleModelLoaded,
    (xhr) => {
      if (xhr.total > 0) {
        const progress = 4 + (xhr.loaded / xhr.total) * 78;
        setLoadProgress(progress, `LOADING GEOMETRY / ${(xhr.loaded / 1024 / 1024).toFixed(1)} MB`);
      } else if (xhr.loaded) {
        setLoadProgress(Math.min(82, 4 + xhr.loaded / 90000), 'LOADING GEOMETRY');
      }
    },
    handleModelError
  );
}

function processModel(gltf) {
  model = gltf.scene;
  model.name = 'V11_STAINLESS_STAGE';
  model.updateMatrixWorld(true);

  GROUPS.forEach((meta) => {
    sceneGroups[meta.id] = {
      ...meta,
      value: 0,
      target: 0,
      objects: [],
      center: new THREE.Vector3(),
      box: new THREE.Box3(),
      avgOffset: new THREE.Vector3(),
      auraScale: 0.18,
      labelShift: new THREE.Vector3(),
      runtimeCount: 0
    };
    groupCounts[meta.id] = 0;
  });

  for (const root of model.children) {
    if (!root) continue;

    const nodeName = root.name || '';
    const meshList = [];
    root.traverse((child) => {
      if (child.isMesh) meshList.push(child);
    });
    if (!meshList.length) continue;

    const meshName = getSourceMeshName(gltf, meshList[0]);
    const groupId = resolveGroupName(nodeName);
    const partCode = resolvePartCode(nodeName, meshName);

    if (!groupId || !partCode) {
      console.warn('[V11] Unmapped node', nodeName, meshName, groupId, partCode);
      continue;
    }

    const group = sceneGroups[groupId];
    if (!group) continue;

    root.updateMatrixWorld(true);
    const nodeBox = new THREE.Box3().setFromObject(root, true);
    const center = nodeBox.getCenter(new THREE.Vector3());
    const offset = computeExplodeOffset(groupId, partCode, nodeName, center, group.objects.length, meshList);

    const node = {
      object: root,
      name: nodeName,
      meshName,
      groupId,
      partCode,
      isHardware: partCode.startsWith('H_'),
      center,
      offset,
      originalPosition: root.position.clone(),
      order: group.objects.length
    };

    nodes.push(node);
    group.objects.push(node);
    group.runtimeCount += 1;
    groupCounts[groupId] += 1;
    group.box.union(nodeBox);
    group.avgOffset.add(offset);
    group.center.add(center);

    if (!codeNodes.has(partCode)) codeNodes.set(partCode, []);
    codeNodes.get(partCode).push(node);

    root.userData.v11 = node;
    for (const mesh of meshList) {
      mesh.userData.v11 = node;
      mesh.castShadow = !node.isHardware;
      mesh.receiveShadow = true;
      mesh.frustumCulled = true;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        if (material && 'envMapIntensity' in material) {
          material.envMapIntensity = Math.max(material.envMapIntensity ?? 1, 0.9);
        }
      }
    }
  }

  tuneMaterials();

  for (const id of GROUP_IDS) {
    const group = sceneGroups[id];
    if (group.objects.length) {
      group.avgOffset.multiplyScalar(1 / group.objects.length);
      group.center.multiplyScalar(1 / group.objects.length);
      const size = group.box.getSize(new THREE.Vector3());
      group.auraScale = Math.max(0.09, Math.max(size.x, size.z, size.y) * 1.05);
      group.labelShift.copy(group.avgOffset).multiplyScalar(0.62);
    }
  }

  scene.add(model);

  const runtimeTotal = nodes.length;
  if (runtimeTotal !== MODEL.total) {
    console.warn(`[V11] Expected ${MODEL.total} nodes, found ${runtimeTotal}`);
  }
  dom.telemetryParts.textContent = String(runtimeTotal);

  buildLabels();
  buildGroupList();
  buildPartsList();
  renderOverview();
  updateAllUI();

  state.ready = true;
  window.__STAGE__ = {
    scene,
    camera,
    controls,
    sceneGroups,
    nodes,
    codeNodes,
    partTypes: PART_TYPES,
    state,
    selectGroup,
    selectPart,
    resetAll,
    toggleExplodeAll,
    focusSelection,
    getHomePosition,
    getExplodePosition,
    getViewFitDistance,
    get selectedNodes() {
      return getSelectionNodes();
    }
  };

  console.info(
    `[V11] Loaded ${runtimeTotal} objects / ${codeNodes.size} part types.`,
    Object.fromEntries(Object.entries(groupCounts))
  );
}

function getSourceMeshName(gltf, mesh) {
  try {
    const association = gltf.parser.associations.get(mesh);
    if (association && Number.isInteger(association.meshes)) {
      const source = gltf.parser.json.meshes?.[association.meshes]?.name;
      if (source) return cleanMeshName(source);
    }
  } catch (error) {
    console.warn('[V11] Could not resolve source mesh name', error);
  }
  return cleanMeshName(mesh.name || '');
}

function tuneMaterials() {
  const specs = {
    Satin_Stage_Deck: {
      color: 0x434d5e, metalness: 0.86, roughness: 0.34, envMapIntensity: 0.84
    },
    '304_Brushed_Stainless': {
      color: 0xbcc5d2, metalness: 0.94, roughness: 0.29, envMapIntensity: 0.95
    },
    Optional_Champagne_Finish: {
      color: 0xc6924a, metalness: 0.92, roughness: 0.27, envMapIntensity: 1.0
    },
    Stainless_Fasteners: {
      color: 0xabb8c6, metalness: 0.95, roughness: 0.25, envMapIntensity: 0.88
    },
    Optional_Double_Face_Display_Film: {
      color: 0x0a4b88, metalness: 0.42, roughness: 0.22,
      emissive: 0x031b30, emissiveIntensity: 0.35, envMapIntensity: 0.7
    },
    Floor_Region_1: { color: 0x465365, metalness: 0.88, roughness: 0.36 },
    Floor_Region_2: { color: 0x303b4b, metalness: 0.9, roughness: 0.38 },
    Floor_Region_3: { color: 0x596577, metalness: 0.86, roughness: 0.35 },
    Floor_Region_4: { color: 0x3a4555, metalness: 0.88, roughness: 0.37 }
  };

  model.traverse((object) => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      const spec = specs[material.name];
      if (spec) {
        if (spec.color !== undefined) material.color.setHex(spec.color);
        if (spec.metalness !== undefined) material.metalness = spec.metalness;
        if (spec.roughness !== undefined) material.roughness = spec.roughness;
        if (spec.emissive !== undefined) material.emissive.setHex(spec.emissive);
        if (spec.emissiveIntensity !== undefined) material.emissiveIntensity = spec.emissiveIntensity;
        if (spec.envMapIntensity !== undefined) material.envMapIntensity = spec.envMapIntensity;
      }
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
    }
  });
}

function computeExplodeOffset(groupId, partCode, nodeName, center, index, meshList) {
  const radial = new THREE.Vector3(center.x, 0, center.z);
  if (radial.lengthSq() < 0.0000005) {
    radial.set(Math.cos(index * 1.7), 0, Math.sin(index * 1.7));
  } else {
    radial.normalize();
  }
  const tangent = new THREE.Vector3(-radial.z, 0, radial.x);
  const offset = new THREE.Vector3();
  const hardware = partCode.startsWith('H_');

  const add = (r, y, t = 0) => {
    offset.addScaledVector(radial, r);
    offset.y += y;
    offset.addScaledVector(tangent, t);
  };

  switch (groupId) {
    case 'base':
      if (partCode === 'B01') add(0.017, -0.028);
      else if (partCode === 'B02') add(0.028, -0.044);
      else add(0.038, -0.057);
      break;

    case 'columns':
      if (partCode === 'C01') add(0.012, -0.026);
      else if (partCode === 'C02') add(0.03, 0.038);
      else if (partCode === 'H_STUD_M3_L140') add(0.026, 0.018);
      else add(0.024, 0.082);
      break;

    case 'deck':
      if (partCode === 'F01' || partCode === 'F02' || partCode === 'F03' || partCode === 'F04') add(0.008, 0.045);
      else if (partCode === 'B03') add(0.022, 0.011);
      else add(0.022, 0.064);
      break;

    case 'inlay':
      if (partCode.startsWith('F1') && partCode !== 'F05') add(0.024, 0.069);
      else add(0.026, 0.083);
      break;

    case 'platform':
      if (partCode === 'F05') add(0.004, 0.062);
      else if (partCode === 'F06') add(0.02, 0.031);
      else add(0.022, 0.087);
      break;

    case 'numerals':
      if (partCode === 'N13') add(0.05, 0.004);
      else if (hardware) add(0.064, 0.02);
      else add(0.066, 0.012);
      break;

    case 'roof':
      if (partCode === 'R01') add(0.016, 0.086);
      else if (partCode === 'R02') add(0.026, 0.104);
      else add(0.009, 0.096);
      break;

    case 'screens':
      if (partCode.startsWith('P0') || partCode.startsWith('P1')) {
        if (partCode === 'P10') add(0.082, 0.04);
        else if (partCode === 'P11') add(0.082, 0.032);
        else if (partCode === 'P09') add(0.082, 0.022);
        else add(0.086, 0.022);
      } else {
        add(0.088, 0.045);
      }
      break;

    case 'drum':
      if (partCode === 'D01') add(0.062, 0.02, (index % 2 ? 1 : -1) * 0.002);
      else if (partCode === 'D02') add(0, 0.076);
      else if (partCode === 'D03') add(0, -0.016);
      else if (partCode === 'D05') add(0, 0.089);
      else if (partCode === 'H_STUD_M2_L65') add(0, 0.05);
      else if (nodeName.startsWith('DRUM_TOP')) add(0, 0.102);
      else if (nodeName.startsWith('DRUM_BOTTOM')) add(0, -0.035);
      else add(0, 0.06);
      break;
  }

  if (hardware) {
    offset.addScaledVector(tangent, Math.sin(index * 12.9898) * 0.0018);
  } else {
    offset.addScaledVector(tangent, Math.sin(index * 5.137) * 0.0007);
  }

  return offset;
}

/* ------------------------------------------------------------
   Loading lifecycle
   ------------------------------------------------------------ */

function finishLoading() {
  setTimeout(() => {
    dom.loading.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    setTimeout(() => {
      startIntroCamera();
      showToast('V11 总装已载入 · 461 个构件 / 点击任意部件开始拆解', 4600);
    }, 250);
  }, 520);
}

function failLoading(error) {
  dom.loading.classList.add('is-error');
  const sub = dom.loading.querySelector('.loader-sub');
  if (sub) sub.textContent = '模型加载失败 · 请通过本地服务器打开页面';
  setLoadProgress(0, 'LOAD ERROR / CHECK ASSETS');
  console.error('[V11] Failed to load model:', error);
}

function startIntroCamera() {
  const start = camera.position.clone().multiplyScalar(1.24);
  start.y += 0.055;
  camera.position.copy(start);
  controls.target.copy(HOME_TARGET);
  introTween = {
    elapsed: 0,
    duration: 2.1,
    fromPosition: start.clone(),
    toPosition: getHomePosition(),
    fromTarget: HOME_TARGET.clone(),
    toTarget: HOME_TARGET.clone()
  };
}

/* ------------------------------------------------------------
   Labels
   ------------------------------------------------------------ */

const labelEntries = [];

function buildLabels() {
  dom.labelLayer.innerHTML = '';
  dom.leaderLayer.innerHTML = '';
  labelEntries.length = 0;

  for (const meta of GROUPS) {
    const group = sceneGroups[meta.id];
    if (!group) continue;

    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'label';
    label.style.setProperty('--accent', meta.accent);
    label.dataset.group = meta.id;
    label.innerHTML = `
      <span class="label-code">${meta.code}</span>
      <span class="label-name">${meta.name}</span>
      <span class="label-qty">${meta.count}</span>
    `;
    label.addEventListener('click', (event) => {
      event.stopPropagation();
      selectGroup(meta.id);
    });
    dom.labelLayer.appendChild(label);

    const mark = document.createElement('span');
    mark.className = 'anchor-mark';
    mark.style.setProperty('--accent', meta.accent);
    dom.labelLayer.appendChild(mark);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', meta.accent);
    line.setAttribute('stroke-width', '0.7');
    line.setAttribute('opacity', '0.3');
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '1.35');
    dot.setAttribute('fill', meta.accent);
    dot.setAttribute('opacity', '0.55');
    dom.leaderLayer.append(line, dot);

    labelEntries.push({
      id: meta.id,
      group,
      meta,
      anchor: new THREE.Vector3(...meta.anchor),
      label,
      mark,
      line,
      dot,
      screenX: 0,
      screenY: 0,
      visible: false
    });
  }

}

function updateLabelContent() {
  for (const entry of labelEntries) {
    const { meta, group } = entry;
    let code = meta.code;
    let name = meta.name;
    let count = meta.count;

    if (state.selection?.kind === 'part' && state.selection.groupId === meta.id) {
      const part = PART_TYPES[state.selection.partCode];
      if (part) {
        code = state.selection.partCode;
        name = part.name;
        count = part.qty;
      }
    }

    entry.label.querySelector('.label-code').textContent = code;
    entry.label.querySelector('.label-name').textContent = name;
    entry.label.querySelector('.label-qty').textContent = count;
    entry.label.classList.toggle(
      'is-selected',
      state.selection?.groupId === meta.id
    );
    entry.width = 0;
  }
}

function updateLabels() {
  if (!state.ready || !state.labelsVisible) {
    if (state.labelsVisible === false) {
      dom.labelLayer.classList.add('is-hidden');
      dom.leaderLayer.classList.add('is-hidden');
    }
    return;
  }

  dom.labelLayer.classList.remove('is-hidden');
  dom.leaderLayer.classList.remove('is-hidden');

  const width = window.innerWidth;
  const height = window.innerHeight;
  const mobile = width <= 920;

  let safeLeft = 22;
  let safeRight = width - 22;
  if (!mobile) {
    const leftRect = dom.partsPanel.getBoundingClientRect();
    const rightRect = dom.infoPanel.getBoundingClientRect();
    if (leftRect.right > 0 && leftRect.right < width) safeLeft = leftRect.right + 14;
    if (rightRect.left > 0 && rightRect.left < width) safeRight = rightRect.left - 14;
  }

  const layouts = [];

  for (const entry of labelEntries) {
    const group = entry.group;
    const anchor = entry.anchor.clone().addScaledVector(entry.group.labelShift, group.value);
    anchor.y = Math.max(anchor.y, 0.007);

    tempVec.copy(anchor).project(camera);
    const behind = tempVec.z > 1 || tempVec.z < -1;
    const anchorX = (tempVec.x * 0.5 + 0.5) * width;
    const anchorY = (-tempVec.y * 0.5 + 0.5) * height;
    const offset = LABEL_OFFSETS[entry.id] || { x: 0, y: 0 };
    const baseX = Math.max(safeLeft + 58, Math.min(safeRight - 58, anchorX + offset.x));
    const baseY = Math.max(88, Math.min(height - 72, anchorY + offset.y));
    const inViewport = !behind && anchorX > -60 && anchorX < width + 60 && anchorY > 44 && anchorY < height - 54;
    const isolatedOut = state.isolate && state.selection
      ? (state.selection.groupId
        ? state.selection.groupId !== entry.id
        : true)
      : false;
    const mobileAllowed = !mobile || state.mode === 'all' || state.selection?.groupId === entry.id;
    const visible = inViewport && mobileAllowed && !isolatedOut;

    entry.visible = visible;
    entry.anchorX = anchorX;
    entry.anchorY = anchorY;

    if (!visible) {
      entry.label.classList.remove('is-visible');
      entry.mark.classList.remove('is-visible');
      entry.line.style.display = 'none';
      entry.dot.style.display = 'none';
      continue;
    }

    if (!entry.width) {
      entry.width = Math.max(82, entry.label.offsetWidth || 122);
    }

    layouts.push({
      entry,
      x: baseX,
      y: baseY,
      width: entry.width,
      height: 27,
      selected: state.selection?.groupId === entry.id
    });
  }

  // Keep the selected label first, then avoid collisions with a light
  // screen-space packing pass. Labels are allowed to slide vertically so
  // their leader lines still point to the actual 3D anchor.
  layouts.sort((a, b) => Number(b.selected) - Number(a.selected) || a.y - b.y);
  const placed = [];
  for (const item of layouts) {
    let x = item.x;
    let y = item.y;
    const preferDown = y > height * 0.52;
    let moved = 0;

    for (let attempt = 0; attempt < 9; attempt++) {
      const box = {
        left: x - item.width / 2 - 3,
        right: x + item.width / 2 + 3,
        top: y - 11 - item.height - 3,
        bottom: y - 11 + 3
      };
      const collision = placed.find((other) => (
        box.left < other.right && box.right > other.left
        && box.top < other.bottom && box.bottom > other.top
      ));

      if (!collision) break;

      const step = item.height + 7;
      const down = (preferDown || moved > 2) && y + step < height - 70;
      y += down ? step : -step;
      y = Math.max(86, Math.min(height - 70, y));
      moved += 1;
    }

    placed.push({
      left: x - item.width / 2 - 3,
      right: x + item.width / 2 + 3,
      top: y - 11 - item.height - 3,
      bottom: y - 11 + 3
    });

    const entry = item.entry;
    entry.screenX = x;
    entry.screenY = y;
    entry.label.style.left = `${x}px`;
    entry.label.style.top = `${y}px`;
    entry.label.classList.add('is-visible');
    entry.mark.style.left = `${entry.anchorX}px`;
    entry.mark.style.top = `${entry.anchorY}px`;
    entry.mark.classList.add('is-visible');

    entry.line.style.display = '';
    entry.dot.style.display = '';
    entry.line.setAttribute('x1', x.toFixed(1));
    entry.line.setAttribute('y1', (y - 12).toFixed(1));
    entry.line.setAttribute('x2', entry.anchorX.toFixed(1));
    entry.line.setAttribute('y2', entry.anchorY.toFixed(1));
    entry.dot.setAttribute('cx', entry.anchorX.toFixed(1));
    entry.dot.setAttribute('cy', entry.anchorY.toFixed(1));
  }
}

function toggleLabels(force) {
  state.labelsVisible = typeof force === 'boolean' ? force : !state.labelsVisible;
  dom.btnLabels.classList.toggle('is-active', state.labelsVisible);
  if (!state.labelsVisible) {
    dom.labelLayer.classList.add('is-hidden');
    dom.leaderLayer.classList.add('is-hidden');
  } else {
    dom.labelLayer.classList.remove('is-hidden');
    dom.leaderLayer.classList.remove('is-hidden');
  }
}

/* ------------------------------------------------------------
   Hover tooltip
   ------------------------------------------------------------ */

function showHoverTip(node, clientX, clientY) {
  if (!hoverTip) return;
  const info = node || null;
  if (!info) {
    hideHoverTip();
    return;
  }
  const part = PART_TYPES[info.partCode];
  hoverTip.querySelector('.hover-tip-code').textContent = info.partCode || '';
  hoverTip.querySelector('.hover-tip-name').textContent = part ? part.name : info.name;
  const x = Math.min(clientX + 16, window.innerWidth - 195);
  const y = Math.min(clientY + 18, window.innerHeight - 54);
  hoverTip.style.left = `${x}px`;
  hoverTip.style.top = `${y}px`;
  hoverTip.classList.add('is-visible');
}

function hideHoverTip() {
  if (hoverTip) hoverTip.classList.remove('is-visible');
  hoveredNode = null;
}

/* ------------------------------------------------------------
   Picking
   ------------------------------------------------------------ */

function updateRayFromPointer(clientX, clientY) {
  const rect = dom.canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camera);
}

function isVisibleInScene(object) {
  let current = object;
  while (current && current !== model) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function pickNode(clientX, clientY) {
  if (!model) return null;
  updateRayFromPointer(clientX, clientY);
  const intersections = raycaster.intersectObject(model, true);
  for (const hit of intersections) {
    if (!isVisibleInScene(hit.object)) continue;
    const node = hit.object.userData.v11;
    if (node) return node;
  }
  return null;
}

function updateHover(now) {
  if (!state.ready || !state.pointerInside || pointerDown) {
    hideHoverTip();
    return;
  }
  if (now - lastHoverPick < 55) return;
  lastHoverPick = now;

  const node = pickNode(pointer.x, pointer.y);
  if (!node) {
    dom.canvas.classList.remove('is-hovering');
    hideHoverTip();
    return;
  }

  dom.canvas.classList.add('is-hovering');
  const changed = hoveredNode?.object !== node.object;
  hoveredNode = node;
  if (changed) {
    showHoverTip(node, pointer.x, pointer.y);
  } else {
    const x = Math.min(pointer.x + 16, window.innerWidth - 195);
    const y = Math.min(pointer.y + 18, window.innerHeight - 54);
    hoverTip.style.left = `${x}px`;
    hoverTip.style.top = `${y}px`;
  }
}

/* ------------------------------------------------------------
   Pointer handlers
   ------------------------------------------------------------ */

function onPointerDown(event) {
  if (event.button !== 0) return;
  pointerDown = {
    x: event.clientX,
    y: event.clientY,
    time: performance.now(),
    moved: false
  };
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  hideHoverTip();
}

function onPointerMove(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  state.pointerInside = true;

  if (pointerDown) {
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    if (dx * dx + dy * dy > 30) {
      pointerDown.moved = true;
      state.dragging = true;
    }
  }
}

function onPointerUp(event) {
  if (!pointerDown) return;
  const wasClick = !pointerDown.moved && performance.now() - pointerDown.time < 900;
  const x = event.clientX;
  const y = event.clientY;
  pointerDown = null;
  state.dragging = false;

  if (!wasClick) return;
  if (event.pointerType === 'touch') {
    state.pointerInside = false;
    hideHoverTip();
  }

  const node = pickNode(x, y);
  if (!node) {
    handleEmptyClick();
    return;
  }

  if (node.partCode) {
    selectPart(node.partCode, node.groupId, { preserveAll: state.mode === 'all' });
  } else {
    selectGroup(node.groupId);
  }
}

function clearPointer() {
  pointerDown = null;
  state.dragging = false;
}

/* ------------------------------------------------------------
   Highlight system
   ------------------------------------------------------------ */

function getHighlightMaterial(baseMaterial, accent) {
  const key = `${baseMaterial.uuid}:${accent}`;
  if (highlightMaterialCache.has(key)) return highlightMaterialCache.get(key);

  const material = baseMaterial.clone();
  if (material.emissive) {
    material.emissive.set(accent);
    material.emissiveIntensity = 0.42;
  }
  material.envMapIntensity = 0.72;
  material.needsUpdate = true;
  highlightMaterialCache.set(key, material);
  return material;
}

function clearHighlight() {
  for (const mesh of highlightedMeshes) {
    mesh.material = mesh.userData.baseMaterial;
  }
  highlightedMeshes = [];
  highlightMaterials.clear();

  for (const edge of highlightEdges) {
    if (edge.parent) edge.parent.remove(edge);
    edge.geometry.dispose();
  }
  highlightEdges = [];
}

function highlightNodes(selectionNodes, accent) {
  clearHighlight();
  if (!selectionNodes.length) return;

  for (const node of selectionNodes) {
    node.object.traverse((child) => {
      if (!child.isMesh) return;
      if (!child.userData.baseMaterial) {
        child.userData.baseMaterial = child.material;
      }
      const base = child.userData.baseMaterial;
      if (Array.isArray(base)) return;
      const material = getHighlightMaterial(base, accent);
      child.material = material;
      highlightMaterials.add(material);
      highlightedMeshes.push(child);
    });
  }

  if (selectionNodes.length <= 80) {
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(accent),
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    });
    for (const node of selectionNodes) {
      if (selectionNodes.length > 22 && node.isHardware) continue;
      node.object.traverse((child) => {
        if (!child.isMesh || !child.geometry) return;
        if (child.geometry.attributes.position?.count > 32000) return;
        const edgeGeometry = new THREE.EdgesGeometry(child.geometry, 32);
        if (!edgeGeometry.attributes.position) {
          edgeGeometry.dispose();
          return;
        }
        const edge = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edge.renderOrder = 4;
        edge.raycast = () => {};
        child.add(edge);
        highlightEdges.push(edge);
      });
    }
  }
}

function pulseHighlight(time) {
  const intensity = 0.36 + Math.sin(time * 3.15) * 0.1;
  for (const material of highlightMaterials) {
    if (material.emissive) material.emissiveIntensity = intensity;
  }
}

/* ------------------------------------------------------------
   Selection + explosion
   ------------------------------------------------------------ */

function closeMobilePanels() {
  dom.partsPanel.classList.remove('is-mobile-open');
  dom.infoPanel.classList.remove('is-mobile-open');
}

function revealInfoOnMobile() {
  if (window.innerWidth > 920 || !state.selection) return;
  dom.partsPanel.classList.remove('is-mobile-open');
  dom.infoPanel.classList.add('is-mobile-open');
}

function getSelectionNodes() {
  if (!state.selection) return [];
  if (state.selection.kind === 'group') {
    return sceneGroups[state.selection.groupId]?.objects || [];
  }
  if (state.selection.kind === 'part') {
    return codeNodes.get(state.selection.partCode) || [];
  }
  return [];
}

function selectGroup(groupId, options = {}) {
  if (!state.ready) return;
  const group = sceneGroups[groupId];
  if (!group) return;

  if (state.isolate && !state.selection) state.isolate = false;
  state.mode = 'single';
  state.selection = { kind: 'group', groupId, partCode: null };

  for (const id of GROUP_IDS) {
    sceneGroups[id].target = id === groupId ? 1 : 0;
  }

  highlightNodes(group.objects, group.accent);
  updateLabelContent();
  updateAuraColor(group.accent);
  renderGroupInfo(groupId);
  updateAllUI();
  applyIsolation();
  revealInfoOnMobile();

  if (options.toast) {
    showToast(`${group.code} / ${group.name} · 展开 ${group.count} 件`, 2400);
  }
}

function selectPart(partCode, groupId = null, options = {}) {
  if (!state.ready) return;
  const part = PART_TYPES[partCode];
  if (!part) return;

  const resolvedGroup = groupId
    || (part.group && part.group !== 'hardware' ? part.group : null);
  const preserveAll = Boolean(options.preserveAll && state.mode === 'all');

  state.selection = {
    kind: 'part',
    groupId: resolvedGroup,
    partCode
  };

  if (preserveAll) {
    state.mode = 'all';
    for (const id of GROUP_IDS) sceneGroups[id].target = 1;
  } else {
    state.mode = resolvedGroup ? 'single' : 'assembled';
    for (const id of GROUP_IDS) {
      sceneGroups[id].target = resolvedGroup && id === resolvedGroup ? 1 : 0;
    }
  }

  const selectionNodes = codeNodes.get(partCode) || [];
  const group = resolvedGroup ? sceneGroups[resolvedGroup] : null;
  const accent = group?.accent || CATEGORY_ACCENTS[part.cat] || '#64e4ff';

  highlightNodes(selectionNodes, accent);
  updateLabelContent();
  updateAuraColor(accent);
  renderPartInfo(partCode);
  updateAllUI();
  applyIsolation();
  revealInfoOnMobile();

  if (options.toast) {
    showToast(`${partCode} / ${part.name} · ${part.qty} 件`, 2400);
  }
}

function handleEmptyClick() {
  if (!state.selection) {
    if (state.mode === 'all') return;
    resetAll({ silent: true });
    return;
  }
  dismissSelection();
}

function dismissSelection() {
  if (!state.ready) return;
  if (state.mode === 'all') {
    state.selection = null;
    state.isolate = false;
    clearHighlight();
    updateLabelContent();
    renderOverview();
    updateAllUI();
    applyIsolation();
    closeMobilePanels();
    return;
  }

  resetAll({ silent: true });
}

function resetAll(options = {}) {
  if (!state.ready) return;
  state.mode = 'assembled';
  state.selection = null;
  state.isolate = false;
  clearHighlight();

  for (const id of GROUP_IDS) {
    sceneGroups[id].target = 0;
  }

  renderOverview();
  updateLabelContent();
  updateAllUI();
  applyIsolation();
  closeMobilePanels();
  tweenCamera(getHomePosition(), HOME_TARGET, 1.05);

  if (!options.silent) {
    showToast('装配体已复位 / READY', 1800);
  }
}

function toggleExplodeAll() {
  if (!state.ready) return;

  if (state.mode === 'all') {
    resetAll();
    return;
  }

  state.mode = 'all';
  state.selection = null;
  state.isolate = false;
  clearHighlight();
  for (const id of GROUP_IDS) sceneGroups[id].target = 1;

  renderOverview();
  updateLabelContent();
  updateAllUI();
  applyIsolation();
  closeMobilePanels();
  tweenCamera(getExplodePosition(), EXPLODE_TARGET, 1.15);
  showToast('全量拆解 · 9 个装配层 / 461 个构件已展开', 3200);
}

function applyIsolation() {
  if (!state.isolate || !state.selection) {
    for (const node of nodes) node.object.visible = true;
    updateAllUI();
    return;
  }

  if (state.selection.kind === 'group') {
    for (const node of nodes) {
      node.object.visible = node.groupId === state.selection.groupId;
    }
  } else {
    const code = state.selection.partCode;
    for (const node of nodes) {
      node.object.visible = node.partCode === code;
    }
  }
  updateAllUI();
}

function toggleIsolation() {
  if (!state.selection) {
    showToast('请先选择一个构件', 1800);
    return;
  }
  state.isolate = !state.isolate;
  applyIsolation();
  updateAllUI();
  showToast(state.isolate ? '隔离显示已开启' : '隔离显示已关闭', 1800);
}

function updateAuraColor(accent) {
  if (!auraMaterial) return;
  auraMaterial.color.set(accent);
  if (selectionLight) selectionLight.color.set(accent);
}

function updateAura(time) {
  if (!state.selection || state.selection.groupId === null) {
    aura.visible = false;
    if (selectionLight) selectionLight.intensity = 0;
    return;
  }

  const group = sceneGroups[state.selection.groupId];
  if (!group || !group.objects.length) {
    aura.visible = false;
    return;
  }

  const progress = group.value;
  const center = group.center.clone().addScaledVector(group.avgOffset, progress);
  aura.position.copy(center);
  aura.visible = true;
  const pulse = 1 + Math.sin(time * 2.4) * 0.06;
  aura.scale.setScalar(group.auraScale * (1 + progress * 0.42) * pulse);
  auraMaterial.opacity = 0.2 + Math.max(progress, 0.15) * 0.22;
  if (selectionLight) {
    selectionLight.position.copy(center);
    selectionLight.intensity = 0.75 + progress * 0.6;
  }
}

/* ------------------------------------------------------------
   Animation
   ------------------------------------------------------------ */

function updateGroups(dt) {
  for (const id of GROUP_IDS) {
    const group = sceneGroups[id];
    const previous = group.value;
    group.value = THREE.MathUtils.damp(group.value, group.target, 7.2, Math.min(dt, 0.05));

    if (Math.abs(group.value - group.target) < 0.0008) {
      group.value = group.target;
    }

    if (group.value !== previous || group.value !== group.target) {
      const count = group.objects.length;
      for (let i = 0; i < count; i++) {
        const node = group.objects[i];
        const delay = count > 10 ? (i / count) * 0.14 : 0;
        const local = clamp01((group.value - delay) / (1 - delay || 1));
        const amount = group.value === 0 ? 0 : easeOutCubic(local);
        node.object.position.copy(node.originalPosition).addScaledVector(node.offset, amount);
      }
    }
  }
}

function updateCameraTween(dt) {
  if (introTween) {
    introTween.elapsed += dt;
    const t = clamp01(introTween.elapsed / introTween.duration);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(introTween.fromPosition, introTween.toPosition, e);
    controls.target.lerpVectors(introTween.fromTarget, introTween.toTarget, e);
    if (t >= 1) introTween = null;
  }

  if (cameraTween) {
    cameraTween.elapsed += dt;
    const t = clamp01(cameraTween.elapsed / cameraTween.duration);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, e);
    controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, e);
    if (t >= 1) cameraTween = null;
  }
}

function tweenCamera(toPosition, toTarget, duration = 0.9) {
  cameraTween = {
    elapsed: 0,
    duration,
    fromPosition: camera.position.clone(),
    toPosition: toPosition.clone(),
    fromTarget: controls.target.clone(),
    toTarget: toTarget.clone()
  };
}

function focusSelection() {
  if (!state.ready || !state.selection) return;
  const selected = getSelectionNodes().filter((node) => node.object.visible);
  if (!selected.length) {
    showToast('没有可聚焦的构件', 1800);
    return;
  }

  tempBox.makeEmpty();
  for (const node of selected) {
    node.object.updateWorldMatrix(true, true);
    tempBox.expandByObject(node.object, true);
  }
  if (tempBox.isEmpty()) return;

  tempBox.getCenter(tempVec);
  tempBox.getBoundingSphere(tempSphere);
  const radius = Math.max(tempSphere.radius, 0.012);
  const fovRadians = camera.fov * Math.PI / 180;
  const distance = Math.max(0.13, (radius / Math.tan(fovRadians / 2)) * 1.55);

  const direction = camera.position.clone().sub(controls.target);
  if (direction.lengthSq() < 0.00001) direction.set(0.7, 0.55, 0.8);
  direction.normalize();

  const target = tempVec.clone();
  target.y = Math.max(target.y, 0.02);
  const position = target.clone().addScaledVector(direction, distance);

  tweenCamera(position, target, 0.95);
  showToast(`聚焦 ${state.selection?.partCode || '当前装配层'}`, 1700);
}

function updateParticles(time) {
  if (!particleField || !particleBase) return;
  const positions = particleGeometry.attributes.position.array;
  const seeds = particleGeometry.userData.seeds;
  for (let i = 0; i < positions.length / 3; i++) {
    const phase = seeds[i * 3];
    const speed = seeds[i * 3 + 1];
    positions[i * 3 + 1] = ((particleBase[i * 3 + 1] + time * speed + phase * 0.004) % 0.34) - 0.004;
  }
  particleGeometry.attributes.position.needsUpdate = true;
  particleField.rotation.y = time * 0.007;
}

function updateExplosionReadout() {
  let sum = 0;
  for (const id of GROUP_IDS) sum += sceneGroups[id]?.value ?? 0;
  const percent = Math.round((sum / GROUP_IDS.length) * 100);
  if (dom.explodePct.textContent !== String(percent).padStart(2, '0')) {
    dom.explodePct.textContent = String(percent).padStart(2, '0');
    dom.explodeBar.style.width = `${percent}%`;
  }
}

/* ------------------------------------------------------------
   UI: groups + parts
   ------------------------------------------------------------ */

function buildGroupList() {
  dom.groupsList.innerHTML = GROUPS.map((group) => `
    <button class="group-row" type="button" data-group="${group.id}" style="--accent:${group.accent}">
      <span class="grp-index">${group.index}</span>
      <span class="grp-main">
        <span class="grp-code">${group.code}</span>
        <span class="grp-name">${group.name}<em>${group.en}</em></span>
      </span>
      <span class="grp-count">${group.count}<small>${group.custom}+${group.hardware}</small></span>
      <span class="grp-arrow">↗</span>
    </button>
  `).join('');

  dom.groupsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-group]');
    if (!button) return;
    selectGroup(button.dataset.group);
  });
}

function buildPartsList() {
  dom.filterRow.innerHTML = Object.entries(CATEGORY_LABELS)
    .map(([value, label]) => `
      <button class="filter-chip${value === 'all' ? ' is-active' : ''}" type="button" data-cat="${value}">${label}</button>
    `).join('');

  dom.filterRow.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-cat]');
    if (!chip) return;
    state.partFilter = chip.dataset.cat;
    $$('.filter-chip', dom.filterRow).forEach((item) => {
      item.classList.toggle('is-active', item.dataset.cat === state.partFilter);
    });
    renderPartsList();
  });

  dom.partSearch.addEventListener('input', () => {
    state.partQuery = dom.partSearch.value.trim().toLowerCase();
    renderPartsList();
  });

  renderPartsList();
}

function renderPartsList() {
  const query = state.partQuery;
  const filter = state.partFilter;
  const filtered = PART_ORDER.filter((code) => {
    const part = PART_TYPES[code];
    if (!part) return false;
    if (filter !== 'all' && part.cat !== filter) return false;
    if (!query) return true;
    return `${code} ${part.name} ${part.en} ${part.form} ${part.material}`.toLowerCase().includes(query);
  });

  const custom = filtered.filter((code) => !code.startsWith('H_'));
  const hardware = filtered.filter((code) => code.startsWith('H_'));

  if (!filtered.length) {
    dom.partsList.innerHTML = '<div class="part-empty">没有匹配的零件 — 尝试更换关键词</div>';
    syncActiveRows();
    return;
  }

  const rows = [];
  if (custom.length) {
    rows.push(`<div class="parts-section-title"><span>CUSTOM MACHINED / 加工件</span><span>${custom.length} TYPES</span></div>`);
    rows.push(custom.map((code) => partRowHTML(code)).join(''));
  }
  if (hardware.length) {
    rows.push(`<div class="parts-section-title"><span>PURCHASED HARDWARE / 采购件</span><span>${hardware.length} TYPES</span></div>`);
    rows.push(hardware.map((code) => partRowHTML(code)).join(''));
  }
  dom.partsList.innerHTML = rows.join('');

  dom.partsList.onclick = (event) => {
    const row = event.target.closest('[data-part]');
    if (!row) return;
    selectPart(row.dataset.part, null, { preserveAll: state.mode === 'all' });
  };

  syncActiveRows();
}

function partRowHTML(code) {
  const part = PART_TYPES[code];
  if (!part) return '';
  const group = GROUP_META[part.group];
  const accent = group?.accent || (code.startsWith('H_') ? CATEGORY_ACCENTS.fastener : CATEGORY_ACCENTS[part.cat] || '#64e4ff');
  return `
    <button class="part-row" type="button" data-part="${code}" style="--part-accent:${accent}">
      <span class="part-code">${code}</span>
      <span class="part-name">${part.name}<small>${part.form}</small></span>
      <span class="part-qty">×${part.qty}</span>
    </button>
  `;
}

function setTab(tab) {
  const isGroups = tab === 'groups';
  dom.tabGroups.classList.toggle('is-active', isGroups);
  dom.tabParts.classList.toggle('is-active', !isGroups);
  dom.tabGroups.setAttribute('aria-selected', String(isGroups));
  dom.tabParts.setAttribute('aria-selected', String(!isGroups));
  dom.groupsPane.hidden = !isGroups;
  dom.groupsPane.classList.toggle('is-active', isGroups);
  dom.partsPane.hidden = isGroups;
  dom.partsPane.classList.toggle('is-active', !isGroups);

  if (!isGroups) {
    dom.partsPane.scrollTop = 0;
    setTimeout(() => dom.partSearch.focus({ preventScroll: true }), 40);
  }
}

function syncActiveRows() {
  const selectedGroup = state.selection?.groupId;
  const selectedPart = state.selection?.partCode;

  $$('.group-row', dom.groupsList).forEach((row) => {
    row.classList.toggle('is-active', row.dataset.group === selectedGroup);
  });

  $$('.part-row', dom.partsList).forEach((row) => {
    row.classList.toggle('is-active', row.dataset.part === selectedPart);
  });

  for (const entry of labelEntries) {
    entry.label.classList.toggle('is-selected', entry.id === selectedGroup);
  }
}

/* ------------------------------------------------------------
   UI: info panel
   ------------------------------------------------------------ */

function renderOverview() {
  dom.infoEyebrow.textContent = 'SYSTEM / OVERVIEW';
  dom.infoStatus.textContent = 'READY';
  dom.infoStatus.className = 'status-pill';
  dom.infoStatus.innerHTML = '<i></i>READY';
  dom.infoClose.hidden = true;
  dom.infoActions.hidden = true;

  const totalWidth = Math.round(MODEL.total);
  const groupRows = GROUPS.map((group) => `
    <button class="stack-row" type="button" data-stack-group="${group.id}" style="--accent:${group.accent}">
      <span class="stack-bar"><i style="--w:${Math.max(9, (group.count / MAX_GROUP_COUNT) * 100)}%"></i></span>
      <span class="stack-name">${group.name}<small>${group.code}</small></span>
      <span class="stack-qty">${group.count}</span>
    </button>
  `).join('');

  dom.infoContent.innerHTML = `
    <div class="overview-kicker">MODEL / V11-STA</div>
    <h2 class="overview-title">不锈钢舞台<br>数字总装</h2>
    <p class="overview-en">STAINLESS STAGE / DIGITAL ASSEMBLY</p>
    <div class="overview-hero">
      <span class="overview-number">${totalWidth}</span>
      <div class="overview-unit"><b>COMPONENTS</b>${MODEL.customPieces} 加工件 + ${MODEL.hardwarePieces} 紧固件</div>
    </div>
    <div class="overview-grid">
      <div class="overview-cell"><span>外廓 / SPAN</span><b>${MODEL.diameter}<small> mm</small></b></div>
      <div class="overview-cell"><span>总高 / HEIGHT</span><b>${MODEL.height}<small> mm</small></b></div>
      <div class="overview-cell"><span>加工类型 / TYPES</span><b>${MODEL.customTypes}<small> + ${MODEL.hardwareTypes} hw</small></b></div>
      <div class="overview-cell"><span>材料 / MATERIAL</span><b style="font-size:12px">${MODEL.material}</b></div>
    </div>
    <div class="section-label">装配层级 / STACK</div>
    ${groupRows}
    <div class="section-label">材料与表面 / FINISH</div>
    <div class="material-line"><i style="--swatch:#b7c4d2"></i>304 不锈钢 · 拉丝 / 2.0 / 1.5 / 1.0 / 0.8 mm</div>
    <div class="material-line"><i style="--swatch:#d0a35f"></i>香槟金 · 中央平台 / 罗马数字 / 曲线嵌片</div>
    <div class="material-line"><i style="--swatch:#0b5a98"></i>双面蓝膜 · 8 块屏幕与中央圆屏</div>
    <div class="overview-note">
      点击任意三维构件触发所在装配层拆解；左侧「零件清单」可按编号与名称检索 55 种零件。模型按实际毫米坐标载入。
    </div>
  `;

  dom.infoContent.querySelectorAll('[data-stack-group]').forEach((row) => {
    row.addEventListener('click', () => selectGroup(row.dataset.stackGroup));
  });
}

function renderGroupInfo(groupId) {
  const group = sceneGroups[groupId];
  if (!group) return;

  dom.infoEyebrow.textContent = `GROUP / ${group.index}`;
  dom.infoStatus.className = 'status-pill is-selected';
  dom.infoStatus.innerHTML = '<i></i>ASSEMBLY';
  dom.infoClose.hidden = false;
  dom.infoActions.hidden = false;

  const specs = group.specs.map(([label, value]) => `
    <div class="param"><label>${label}</label><strong>${value}</strong></div>
  `).join('');

  const chips = group.partCodes.map((code) => {
    const part = PART_TYPES[code];
    return part ? `<button class="part-chip" type="button" data-part-code="${code}">${code}</button>` : '';
  }).join('');

  dom.infoContent.innerHTML = `
    <div class="detail-breadcrumb"><button type="button" data-overview>装配层</button><b>/</b><span>${group.index}</span></div>
    <div class="detail-code-row" style="--accent:${group.accent}">
      <span class="detail-code">${group.code}</span>
      <span class="detail-qty">${group.count} PCS</span>
    </div>
    <h2 class="detail-title">${group.name}</h2>
    <p class="detail-en">${group.en}</p>
    <div class="detail-tags">
      <span class="detail-tag hot">${group.tag}</span>
      <span class="detail-tag">装配层 ${group.index}</span>
      <span class="detail-tag">${group.custom} 加工件</span>
      <span class="detail-tag">${group.hardware} 紧固件</span>
    </div>
    <p class="detail-desc">${group.summary}</p>
    <div class="group-stat-row">
      <div class="group-stat"><b>${group.custom}</b><small>CUSTOM PARTS</small></div>
      <div class="group-stat"><b>${group.hardware}</b><small>FASTENERS</small></div>
      <div class="group-stat"><b>${group.count}</b><small>TOTAL PIECES</small></div>
    </div>
    <div class="param-grid">${specs}</div>
    <div class="detail-block">
      <div class="detail-block-label">装配顺序 / SEQUENCE</div>
      <p>${group.assembly}</p>
    </div>
    <div class="detail-block">
      <div class="detail-block-label">连接与配合 / NOTES</div>
      <p>${group.detail}</p>
    </div>
    <div class="detail-block">
      <div class="detail-block-label">包含零件 / COMPONENTS</div>
      <div class="part-chip-row">${chips}</div>
    </div>
  `;

  bindInfoLinks();
  dom.infoActions.hidden = false;
  syncActionButtons();
}

function renderPartInfo(partCode) {
  const part = PART_TYPES[partCode];
  if (!part) return;
  const group = part.group && part.group !== 'hardware' ? sceneGroups[part.group] : null;
  const accent = group?.accent || CATEGORY_ACCENTS[part.cat] || '#64e4ff';
  const category = CATEGORY_LABELS[part.cat] || part.cat;

  dom.infoEyebrow.textContent = partCode.startsWith('H_') ? 'HARDWARE / DETAIL' : 'COMPONENT / DETAIL';
  dom.infoStatus.className = 'status-pill is-selected';
  dom.infoStatus.innerHTML = '<i></i>SELECTED';
  dom.infoClose.hidden = false;
  dom.infoActions.hidden = false;

  const breadcrumb = group
    ? `<button type="button" data-group-link="${group.id}">${group.name}</button><b>/</b><span>${group.code}</span>`
    : `<span>全舞台</span><b>/</b><span>紧固件</span>`;

  dom.infoContent.innerHTML = `
    <div class="detail-breadcrumb">${breadcrumb}</div>
    <div class="detail-code-row" style="--accent:${accent}">
      <span class="detail-code">${partCode}</span>
      <span class="detail-qty">×${part.qty}</span>
    </div>
    <h2 class="detail-title">${part.name}</h2>
    <p class="detail-en">${part.en}</p>
    <div class="detail-tags">
      <span class="detail-tag hot">${category}</span>
      <span class="detail-tag">${part.qty} 件</span>
      ${part.cat === 'fastener' ? '<span class="detail-tag">采购标准件</span>' : '<span class="detail-tag">加工件</span>'}
    </div>
    <p class="detail-desc">${part.desc}</p>
    <div class="param-grid">
      <div class="param"><label>材料 / MATERIAL</label><strong>${part.material}</strong></div>
      <div class="param"><label>规格 / FORM</label><strong>${part.form}</strong></div>
      <div class="param"><label>工艺 / PROCESS</label><strong>${part.process}</strong></div>
      <div class="param"><label>数量 / QTY</label><strong>${part.qty} 件</strong></div>
      <div class="param wide"><label>安装定位 / POSITION</label><strong>${part.position}</strong></div>
    </div>
    <div class="detail-block">
      <div class="detail-block-label">装配说明 / NOTES</div>
      <p>${part.desc}</p>
    </div>
    ${group ? `
      <div class="detail-block">
        <div class="detail-block-label">所属装配层 / GROUP</div>
        <div class="part-chip-row">
          <button class="part-chip" type="button" data-group-link="${group.id}">${group.index} · ${group.name}</button>
        </div>
      </div>
    ` : ''}
  `;

  bindInfoLinks();
  dom.infoActions.hidden = false;
  syncActionButtons();
}

function bindInfoLinks() {
  dom.infoContent.querySelectorAll('[data-part-code]').forEach((button) => {
    button.addEventListener('click', () => selectPart(button.dataset.partCode, null, { preserveAll: state.mode === 'all' }));
  });
  dom.infoContent.querySelectorAll('[data-group-link]').forEach((button) => {
    button.addEventListener('click', () => selectGroup(button.dataset.groupLink));
  });
  dom.infoContent.querySelectorAll('[data-overview]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selection = null;
      clearHighlight();
      if (state.mode !== 'all') {
        resetAll({ silent: true });
      } else {
        renderOverview();
        updateAllUI();
      }
    });
  });
}

function syncActionButtons() {
  if (!dom.btnIsolate) return;
  dom.btnIsolate.classList.toggle('is-active', state.isolate);
  const label = dom.btnIsolate.querySelector('span');
  if (label) label.textContent = state.isolate ? '取消隔离' : '隔离';
}

/* ------------------------------------------------------------
   UI sync
   ------------------------------------------------------------ */

function updateAllUI() {
  const selectionGroup = state.selection?.groupId;
  const selectionPart = state.selection?.partCode;

  $$('.group-row', dom.groupsList).forEach((row) => {
    row.classList.toggle('is-active', row.dataset.group === selectionGroup);
  });
  $$('.part-row', dom.partsList).forEach((row) => {
    row.classList.toggle('is-active', row.dataset.part === selectionPart);
  });
  for (const entry of labelEntries) {
    entry.label.classList.toggle('is-selected', entry.id === selectionGroup);
  }

  const isAll = state.mode === 'all';
  dom.btnExplode.classList.toggle('is-active', isAll);
  dom.explodeLabel.textContent = isAll ? '全部复位' : '全量拆解';
  dom.btnAuto.classList.toggle('is-active', state.autoRotate);
  dom.btnLabels.classList.toggle('is-active', state.labelsVisible);

  if (!state.selection) {
    dom.infoStatus.className = 'status-pill';
    dom.infoStatus.innerHTML = '<i></i>READY';
  }

  syncActionButtons();
  syncActiveRows();
}

/* ------------------------------------------------------------
   Camera + responsive
   ------------------------------------------------------------ */

function onResize() {
  if (!renderer || !camera) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);

  const minDistance = getViewFitDistance(state.mode === 'all');
  const direction = camera.position.clone().sub(controls.target);
  if (direction.length() < minDistance) {
    camera.position.copy(controls.target).addScaledVector(direction.normalize(), minDistance);
    controls.update();
  }

  updateLabels();
}

function isTypingTarget(target) {
  return target instanceof HTMLElement
    && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

/* ------------------------------------------------------------
   UI events
   ------------------------------------------------------------ */

function bindUIEvents() {
  dom.tabGroups.addEventListener('click', () => setTab('groups'));
  dom.tabParts.addEventListener('click', () => setTab('parts'));

  dom.btnLabels.addEventListener('click', () => toggleLabels());
  dom.btnParts.addEventListener('click', () => {
    if (window.innerWidth <= 920) {
      dom.partsPanel.classList.add('is-mobile-open');
    } else {
      setTab('parts');
      dom.partsPanel.animate(
        [{ transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }],
        { duration: 240, easing: 'ease-out' }
      );
    }
  });

  dom.btnHelp.addEventListener('click', () => openHelp());
  dom.btnGuide.addEventListener('click', () => openHelp());
  dom.btnHelpClose.addEventListener('click', () => closeHelp());
  dom.helpModal.addEventListener('click', (event) => {
    if (event.target === dom.helpModal) closeHelp();
  });

  dom.btnFullscreen.addEventListener('click', toggleFullscreen);

  dom.btnReset.addEventListener('click', () => resetAll());
  dom.btnExplode.addEventListener('click', toggleExplodeAll);
  dom.btnAuto.addEventListener('click', toggleAutoRotate);
  dom.btnFocus.addEventListener('click', focusSelection);
  dom.btnIsolate.addEventListener('click', toggleIsolation);
  dom.btnCollapse.addEventListener('click', () => resetAll());
  dom.infoClose.addEventListener('click', dismissSelection);

  dom.btnMobileParts.addEventListener('click', () => {
    dom.infoPanel.classList.remove('is-mobile-open');
    dom.partsPanel.classList.toggle('is-mobile-open');
  });
  dom.partsClose.addEventListener('click', closeMobilePanels);
  dom.btnMobileInfo.addEventListener('click', () => {
    dom.partsPanel.classList.remove('is-mobile-open');
    dom.infoPanel.classList.add('is-mobile-open');
  });

  dom.infoContent.addEventListener('click', (event) => {
    const groupLink = event.target.closest('[data-group-link]');
    if (groupLink) return;
    const partLink = event.target.closest('[data-part-code]');
    if (partLink) return;
  });

  window.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event) {
  if (event.key === 'Escape') {
    if (dom.helpModal.classList.contains('is-open')) {
      closeHelp();
      return;
    }
    if (state.selection) {
      dismissSelection();
    } else if (state.mode === 'all') {
      resetAll();
    }
    return;
  }

  if (isTypingTarget(event.target)) return;

  const key = event.key.toLowerCase();
  if (key === 'r') {
    event.preventDefault();
    resetAll();
  } else if (key === 'e') {
    event.preventDefault();
    toggleExplodeAll();
  } else if (key === 'l') {
    event.preventDefault();
    toggleLabels();
  } else if (key === ' ') {
    event.preventDefault();
    toggleAutoRotate();
  } else if (key === '?') {
    event.preventDefault();
    openHelp();
  } else if (key === '/') {
    event.preventDefault();
    setTab('parts');
    dom.partSearch.focus({ preventScroll: true });
  }
}

function toggleAutoRotate() {
  state.autoRotate = !state.autoRotate;
  controls.autoRotate = state.autoRotate;
  updateAllUI();
  showToast(state.autoRotate ? '自动巡航已开启 / ORBIT' : '自动巡航已关闭', 1600);
}

function openHelp() {
  dom.helpModal.classList.add('is-open');
  dom.helpModal.setAttribute('aria-hidden', 'false');
}

function closeHelp() {
  dom.helpModal.classList.remove('is-open');
  dom.helpModal.setAttribute('aria-hidden', 'true');
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen unavailable', error);
  }
}

/* ------------------------------------------------------------
   Main loop
   ------------------------------------------------------------ */

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (state.ready) {
    elapsed += dt;
    updateCameraTween(dt);
    controls.update();
    updateGroups(dt);
    updateHover(now);
    updateLabels();
    updateAura(elapsed);
    pulseHighlight(elapsed);
    updateParticles(elapsed);
    updateExplosionReadout();
  } else {
    elapsed += dt;
    updateParticles(elapsed);
    if (camera) {
      const home = getHomePosition();
      camera.position.x = home.x + Math.sin(elapsed * 0.16) * 0.012;
      camera.position.z = home.z + Math.cos(elapsed * 0.16) * 0.012;
      camera.lookAt(HOME_TARGET);
    }
  }

  if (renderer && scene && camera) renderer.render(scene, camera);
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */

function boot() {
  initScene();
  bindUIEvents();
  setTab('groups');
  requestAnimationFrame(animate);
  loadModel();
}

try {
  boot();
} catch (error) {
  console.error('[V11] Boot error', error);
  failLoading(error);
}
