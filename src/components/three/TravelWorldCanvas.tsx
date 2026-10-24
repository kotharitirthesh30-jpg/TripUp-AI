import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createKyotoPagoda,
  createEiffelTower,
  createAlpinePeak,
  createAtollIsland,
  createAmalfiVilla,
  createTravelerAirplane,
  createLighthouse,
  createProceduralCloud,
} from './procedural-models';
import {
  createWaterTexture,
  createTerrainTexture,
  createContactShadowTexture,
} from './procedural-textures';
import { Compass, Eye, Sun, Moon, Sparkles, ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';

export type LandmarkId = 'overview' | 'kyoto' | 'paris' | 'swiss' | 'bali' | 'amalfi';

interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const CAMERA_TARGETS: Record<LandmarkId, CameraTarget> = {
  overview: {
    position: new THREE.Vector3(0, 14, 20),
    lookAt: new THREE.Vector3(0, 1.5, 0),
  },
  kyoto: {
    position: new THREE.Vector3(-4.5, 5.2, 5.5),
    lookAt: new THREE.Vector3(-4.5, 2.5, 0),
  },
  paris: {
    position: new THREE.Vector3(4.5, 7.5, 5.0),
    lookAt: new THREE.Vector3(4.5, 3.5, 0),
  },
  swiss: {
    position: new THREE.Vector3(0, 7.0, -2.5),
    lookAt: new THREE.Vector3(0, 3.0, -6.5),
  },
  bali: {
    position: new THREE.Vector3(-5.5, 4.0, -3.0),
    lookAt: new THREE.Vector3(-6.0, 1.0, -5.0),
  },
  amalfi: {
    position: new THREE.Vector3(5.5, 4.5, -3.0),
    lookAt: new THREE.Vector3(6.0, 1.5, -4.5),
  },
};

interface TravelWorldCanvasProps {
  onSelectLandmark?: (landmarkId: LandmarkId) => void;
  selectedLandmark?: LandmarkId;
  heightClass?: string;
  showControls?: boolean;
}

export const TravelWorldCanvas: React.FC<TravelWorldCanvasProps> = ({
  onSelectLandmark,
  selectedLandmark = 'overview',
  heightClass = 'h-[580px] md:h-[680px]',
  showControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<LandmarkId>(selectedLandmark);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [lightingMode, setLightingMode] = useState<'golden' | 'day' | 'twilight'>('golden');
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // Sync external prop changes
  useEffect(() => {
    if (selectedLandmark && selectedLandmark !== activePreset) {
      setActivePreset(selectedLandmark);
    }
  }, [selectedLandmark]);

  const activePresetRef = useRef<LandmarkId>(activePreset);
  activePresetRef.current = activePreset;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const lightingModeRef = useRef(lightingMode);
  lightingModeRef.current = lightingMode;

  const onSelectLandmarkRef = useRef(onSelectLandmark);
  onSelectLandmarkRef.current = onSelectLandmark;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c120f);
    scene.fog = new THREE.FogExp2(0x0c120f, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    const initialTarget = CAMERA_TARGETS[activePresetRef.current];
    camera.position.copy(initialTarget.position);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment Map
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment generation skipped:', e);
    }

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xd4e5ff, 0x1d3629, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff1d6, 2.2);
    dirLight.position.set(15, 22, 12);
    dirLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -16;
      dirLight.shadow.camera.right = 16;
      dirLight.shadow.camera.top = 16;
      dirLight.shadow.camera.bottom = -16;
      dirLight.shadow.bias = -0.0004;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x73b39c, 0.65);
    rimLight.position.set(-14, 10, -14);
    scene.add(rimLight);

    // Main Floating Island Foundation
    const islandRoot = new THREE.Group();
    islandRoot.name = 'IslandRoot';
    scene.add(islandRoot);

    // Geological Rock Core & Terraces
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x272b28,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const terrainTexture = createTerrainTexture();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x22422f,
      map: terrainTexture,
      roughness: 0.75,
      metalness: 0.05,
      flatShading: true,
    });

    // Tier 1 Base Plinth
    const baseRockGeom = new THREE.CylinderGeometry(11.5, 6.0, 3.5, 14);
    const baseRockMesh = new THREE.Mesh(baseRockGeom, rockMat);
    baseRockMesh.position.y = -1.75;
    baseRockMesh.castShadow = true;
    baseRockMesh.receiveShadow = true;
    islandRoot.add(baseRockMesh);

    // Top Plateau Landscape
    const plateauGeom = new THREE.CylinderGeometry(11.8, 11.5, 0.8, 16);
    const plateauMesh = new THREE.Mesh(plateauGeom, terrainMat);
    plateauMesh.position.y = 0.4;
    plateauMesh.receiveShadow = true;
    islandRoot.add(plateauMesh);

    // Shimmering Procedural Water Disk (Lagoon ring)
    const waterTexture = createWaterTexture();
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x165457,
      map: waterTexture,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const waterGeom = new THREE.CylinderGeometry(11.2, 11.2, 0.15, 32);
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.y = 0.82;
    islandRoot.add(waterMesh);

    // Radial Soft Contact Shadow underneath entire island
    const shadowTexture = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -3.52;
    scene.add(shadowPlane);

    // Place Procedural Landmarks on the Island
    // 1. Kyoto Pagoda (West sector)
    const kyotoGroup = createKyotoPagoda();
    kyotoGroup.position.set(-4.5, 0.8, 0.5);
    kyotoGroup.scale.set(0.9, 0.9, 0.9);
    kyotoGroup.userData = { landmarkId: 'kyoto', name: 'Kyoto Pagoda' };
    islandRoot.add(kyotoGroup);

    // 2. Eiffel Tower (East sector)
    const eiffelGroup = createEiffelTower();
    eiffelGroup.position.set(4.5, 0.8, 0.5);
    eiffelGroup.scale.set(0.85, 0.85, 0.85);
    eiffelGroup.userData = { landmarkId: 'paris', name: 'Eiffel Tower' };
    islandRoot.add(eiffelGroup);

    // 3. Alpine Peak (North Ridge sector)
    const alpineGroup = createAlpinePeak();
    alpineGroup.position.set(0, 0.8, -6.5);
    alpineGroup.scale.set(1.0, 1.0, 1.0);
    alpineGroup.userData = { landmarkId: 'swiss', name: 'Swiss Alps' };
    islandRoot.add(alpineGroup);

    // 4. Tropical Atoll & Palm Grove (South-West Lagoon sector)
    const atollGroup = createAtollIsland();
    atollGroup.position.set(-6.0, 0.8, -4.5);
    atollGroup.scale.set(0.85, 0.85, 0.85);
    atollGroup.userData = { landmarkId: 'bali', name: 'Bali Atoll' };
    islandRoot.add(atollGroup);

    // 5. Mediterranean Villa (South-East Coast sector)
    const amalfiGroup = createAmalfiVilla();
    amalfiGroup.position.set(6.0, 0.8, -4.0);
    amalfiGroup.scale.set(0.85, 0.85, 0.85);
    amalfiGroup.userData = { landmarkId: 'amalfi', name: 'Amalfi Villa' };
    islandRoot.add(amalfiGroup);

    // 6. Coastal Lighthouse (South tip)
    const lighthouseGroup = createLighthouse();
    lighthouseGroup.position.set(0, 0.8, 6.2);
    lighthouseGroup.scale.set(0.8, 0.8, 0.8);
    islandRoot.add(lighthouseGroup);

    // 7. Traveler Glider Airplane circling island
    const planePivot = new THREE.Group();
    scene.add(planePivot);

    const airplane = createTravelerAirplane();
    airplane.position.set(13.5, 5.5, 0);
    airplane.scale.set(0.9, 0.9, 0.9);
    airplane.rotation.y = -Math.PI / 2;
    planePivot.add(airplane);

    // 8. Atmospheric Clouds drifting around perimeter
    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);

    const cloudPositions = [
      [11, 7.5, 8, 1.1],
      [-10, 6.8, 10, 0.9],
      [-12, 8.2, -7, 1.2],
      [10, 6.2, -11, 1.0],
      [0, 8.8, 12, 0.85],
    ];

    cloudPositions.forEach(([x, y, z, s]) => {
      const cloud = createProceduralCloud();
      cloud.position.set(x, y, z);
      cloud.scale.set(s, s, s);
      cloudsGroup.add(cloud);
    });

    // Pre-allocated math objects to ensure zero GC in animation loop
    const _currentCamPos = new THREE.Vector3().copy(camera.position);
    const _currentLookAt = new THREE.Vector3(0, 1.5, 0);
    const _targetCamPos = new THREE.Vector3();
    const _targetLookAt = new THREE.Vector3();
    const _raycaster = new THREE.Raycaster();
    const _mouse = new THREE.Vector2();

    // Raycast targets for click & hover
    const clickableLandmarks = [kyotoGroup, eiffelGroup, alpineGroup, atollGroup, amalfiGroup];

    // Pointer Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        prevMouseX = clientX;
        prevMouseY = clientY;

        rotationVelocityX = deltaX * 0.005;
        rotationVelocityY = deltaY * 0.005;

        islandRoot.rotation.y += rotationVelocityX;
      } else {
        // Raycasting for hover
        _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, camera);
        const intersects = _raycaster.intersectObjects(clickableLandmarks, true);

        if (intersects.length > 0) {
          let rootObj: THREE.Object3D | null = intersects[0].object;
          while (rootObj && !rootObj.userData?.landmarkId && rootObj.parent) {
            rootObj = rootObj.parent;
          }
          if (rootObj && rootObj.userData?.name) {
            setHoveredLandmark(rootObj.userData.name);
            container.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredLandmark(null);
        container.style.cursor = 'grab';
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        isDragging = false;
      }

      // Check if this was a click
      const rect = container.getBoundingClientRect();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(clickableLandmarks, true);

      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.userData?.landmarkId && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.userData?.landmarkId) {
          const lId = rootObj.userData.landmarkId as LandmarkId;
          setActivePreset(lId);
          onSelectLandmarkRef.current?.(lId);
        }
      }
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Software-GL guard
    let frameId = 0;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : null;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Adjust lighting according to lighting mode
      const mode = lightingModeRef.current;
      if (mode === 'golden') {
        dirLight.color.setHex(0xffdfa8);
        dirLight.intensity = 2.4;
        hemiLight.color.setHex(0xffe5cc);
      } else if (mode === 'day') {
        dirLight.color.setHex(0xffffff);
        dirLight.intensity = 2.8;
        hemiLight.color.setHex(0xebf4ff);
      } else {
        // twilight
        dirLight.color.setHex(0xb57c82);
        dirLight.intensity = 1.6;
        hemiLight.color.setHex(0x3e5266);
      }

      if (!isPausedRef.current) {
        // Subtle idle rotation when not dragging
        if (!isDragging) {
          islandRoot.rotation.y += 0.0018;
        }

        // Airplane flight orbit & propeller spin
        planePivot.rotation.y += 0.008;
        const prop = airplane.getObjectByName('propeller');
        if (prop) prop.rotation.z += 0.6;

        // Lighthouse searchlight beam rotation
        const beam = lighthouseGroup.getObjectByName('lightBeam');
        if (beam) beam.parent!.rotation.y += 0.02;

        // Gentle floating cloud bob
        cloudsGroup.children.forEach((cloud, idx) => {
          cloud.position.y += Math.sin(elapsed * 0.8 + idx) * 0.0015;
        });

        // Water texture wave drift
        waterTexture.offset.x += 0.0004;
        waterTexture.offset.y += 0.0003;
      }

      // Smooth camera interpolation towards target
      const targetPreset = CAMERA_TARGETS[activePresetRef.current] || CAMERA_TARGETS.overview;
      _targetCamPos.copy(targetPreset.position);
      _targetLookAt.copy(targetPreset.lookAt);

      const dampFactor = 1 - Math.exp(-4.5 * delta);
      _currentCamPos.lerp(_targetCamPos, dampFactor);
      _currentLookAt.lerp(_targetLookAt, dampFactor);

      camera.position.copy(_currentCamPos);
      camera.lookAt(_currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      renderer.dispose();
      waterTexture.dispose();
      terrainTexture.dispose();
      shadowTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handlePresetSelect = (preset: LandmarkId) => {
    setActivePreset(preset);
    onSelectLandmark?.(preset);
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden bg-[#0c120f] select-none rounded-2xl border border-[#23352b]`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Spec Badge & Mode */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#121c17]/90 border border-[#2b4437] text-xs font-medium px-3 py-1.5 rounded-full text-[#e2ded5] shadow-lg backdrop-blur-none">
          <Compass className="w-3.5 h-3.5 text-[#52b788]" />
          <span>Interactive 3D Travel World</span>
        </div>
        {hoveredLandmark && (
          <div className="bg-[#1b2b23] border border-[#52b788]/60 text-xs text-[#b7e4c7] px-3 py-1.5 rounded-full font-medium shadow-md animate-in fade-in duration-200">
            Click to inspect: {hoveredLandmark}
          </div>
        )}
      </div>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsPaused(p => !p)}
          className="p-2 rounded-lg bg-[#14201a]/90 hover:bg-[#1f3128] border border-[#2b4437] text-[#c9c4b8] transition-colors"
          title={isPaused ? 'Resume 3D Motion' : 'Pause 3D Motion'}
          aria-label={isPaused ? 'Resume Motion' : 'Pause Motion'}
        >
          {isPaused ? <Play className="w-4 h-4 text-[#52b788]" /> : <Pause className="w-4 h-4" />}
        </button>
        <button
          onClick={() => handlePresetSelect('overview')}
          className="p-2 rounded-lg bg-[#14201a]/90 hover:bg-[#1f3128] border border-[#2b4437] text-[#c9c4b8] transition-colors"
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Zero Viewport Occlusion) */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-[760px] flex flex-col items-center">
          {/* Collapse Toggle Tab */}
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider bg-[#14201a] hover:bg-[#1e3027] border border-[#2b4437] border-b-0 text-[#95a59d] hover:text-[#d8e2dc] px-3 py-1 rounded-t-lg transition-colors shadow-md"
            aria-label={isControlsOpen ? 'Collapse 3D Controls' : 'Expand 3D Controls'}
          >
            {isControlsOpen ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show 3D Landmarks & Atmosphere</span>
              </>
            )}
          </button>

          {/* Dock Content */}
          {isControlsOpen && (
            <div className="w-full bg-[#121c17] border border-[#2b4437] rounded-xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
              {/* Landmark Selection Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#74877e] font-medium mr-1 hidden sm:inline">Landmark:</span>
                {(
                  [
                    { id: 'overview', label: 'Archipelago' },
                    { id: 'kyoto', label: 'Kyoto' },
                    { id: 'paris', label: 'Paris' },
                    { id: 'swiss', label: 'Alps' },
                    { id: 'bali', label: 'Bali' },
                    { id: 'amalfi', label: 'Amalfi' },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handlePresetSelect(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activePreset === id
                        ? 'bg-[#2d5743] text-white border border-[#52b788]/60 shadow-sm'
                        : 'bg-[#182620] hover:bg-[#20332b] text-[#b3af9f] border border-[#2b4437]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Lighting / Atmosphere Switcher */}
              <div className="flex items-center gap-1 border-l border-[#24372d] pl-2.5">
                <span className="text-[11px] text-[#74877e] font-medium mr-1 hidden md:inline">Light:</span>
                <button
                  onClick={() => setLightingMode('golden')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    lightingMode === 'golden' ? 'bg-[#3d3319] text-[#ffd166]' : 'text-[#8c948d] hover:text-[#e0dcd3]'
                  }`}
                  title="Golden Hour Lighting"
                  aria-label="Golden Hour Lighting"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightingMode('day')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    lightingMode === 'day' ? 'bg-[#1b3445] text-[#90e0ef]' : 'text-[#8c948d] hover:text-[#e0dcd3]'
                  }`}
                  title="Crisp Midday Sun"
                  aria-label="Midday Sun"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLightingMode('twilight')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    lightingMode === 'twilight' ? 'bg-[#3b233a] text-[#f49097]' : 'text-[#8c948d] hover:text-[#e0dcd3]'
                  }`}
                  title="Twilight Glow"
                  aria-label="Twilight Glow"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
