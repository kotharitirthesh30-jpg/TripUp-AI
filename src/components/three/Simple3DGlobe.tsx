import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, RotateCw, ZoomIn, ZoomOut, Sparkles, MapPin, ArrowRight, Play, Pause } from 'lucide-react';

export interface GlobeDestination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  badge: string;
  desc: string;
  budget: string;
  weather: string;
  color: string;
}

export const GLOBE_DESTINATIONS: GlobeDestination[] = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    lat: 35.0116,
    lng: 135.7681,
    badge: '🌸 Zen Temples',
    desc: 'Ancient imperial shrines, bamboo groves, and traditional tea ceremonies.',
    budget: '$140/day',
    weather: '19°C · Crisp',
    color: '#e63946',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    badge: '🗼 Art & Architecture',
    desc: 'The City of Light, world-class museums, Seine river cruises, and cafes.',
    budget: '€210/day',
    weather: '17°C · Mild',
    color: '#457b9d',
  },
  {
    id: 'swiss',
    name: 'Swiss Alps',
    country: 'Switzerland',
    lat: 45.9765,
    lng: 7.7491,
    badge: '🏔️ Matterhorn Peak',
    desc: 'Car-free alpine villages, crystalline glacier lakes, and scenic cogwheel trains.',
    budget: 'CHF 260/day',
    weather: '11°C · Sunny',
    color: '#52b788',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    lat: -8.4095,
    lng: 115.1889,
    badge: '🏝️ Tropical Retreat',
    desc: 'Emerald terraced rice paddies, cliffside sea temples, and holistic spas.',
    budget: '$75/day',
    weather: '28°C · Tropical',
    color: '#f4a261',
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    lat: 40.634,
    lng: 14.6027,
    badge: '🍋 Pastel Cliffs',
    desc: 'Pastel cliffside villas cascading into the azure Tyrrhenian Sea.',
    budget: '€230/day',
    weather: '22°C · Coastal Sun',
    color: '#e76f51',
  },
  {
    id: 'cairo',
    name: 'Cairo & Giza',
    country: 'Egypt',
    lat: 29.9792,
    lng: 31.1342,
    badge: '🏛️ Ancient Pyramids',
    desc: 'The Great Pyramids, enigmatic Sphinx, and bustling historic bazaars.',
    budget: '$95/day',
    weather: '26°C · Desert Sun',
    color: '#ffd166',
  },
  {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    badge: '🗽 Skyline & Broadway',
    desc: 'Central Park walks, world-class theaters, and boundless culinary energy.',
    budget: '$250/day',
    weather: '16°C · Clear',
    color: '#2a9d8f',
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    badge: '🇬🇧 Royal Palaces & Thames',
    desc: 'Historic Westminster Abbey, West End shows, vibrant markets, and riverside strolls.',
    budget: '£180/day',
    weather: '15°C · Overcast',
    color: '#3a86ff',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    badge: '⛵ Opera House & Harbour',
    desc: 'Iconic harbor sailings, coastal clifftop walks, and golden surf beaches.',
    budget: 'A$230/day',
    weather: '23°C · Sunny',
    color: '#06d6a0',
  },
  {
    id: 'rio',
    name: 'Rio de Janeiro',
    country: 'Brazil',
    lat: -22.9068,
    lng: -43.1729,
    badge: '🏖️ Copacabana & Sugarloaf',
    desc: 'Breathtaking coastal mountains, lively samba culture, and iconic Atlantic beaches.',
    budget: '$85/day',
    weather: '27°C · Sunny',
    color: '#e76f51',
  },
];

interface Simple3DGlobeProps {
  onSelectDestination?: (dest: GlobeDestination) => void;
  onPlanTrip?: (destName: string) => void;
  heightClass?: string;
}

export const Simple3DGlobe: React.FC<Simple3DGlobeProps> = ({
  onSelectDestination,
  onPlanTrip,
  heightClass = 'h-[500px] md:h-[580px]',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedDest, setSelectedDest] = useState<GlobeDestination>(GLOBE_DESTINATIONS[0]);
  const [isRotating, setIsRotating] = useState(true);

  const selectedDestRef = useRef(selectedDest);
  selectedDestRef.current = selectedDest;

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c120f);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.5, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Procedural Earth Texture (Clean, elegant dark emerald & ivory cartography)
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = 1024;
    mapCanvas.height = 512;
    const ctx = mapCanvas.getContext('2d')!;

    // Deep ocean
    ctx.fillStyle = '#0f1f18';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle latitude and longitude grid lines
    ctx.strokeStyle = 'rgba(82, 183, 136, 0.12)';
    ctx.lineWidth = 1;

    for (let lat = 0; lat <= 512; lat += 32) {
      ctx.beginPath();
      ctx.moveTo(0, lat);
      ctx.lineTo(1024, lat);
      ctx.stroke();
    }
    for (let lon = 0; lon <= 1024; lon += 64) {
      ctx.beginPath();
      ctx.moveTo(lon, 0);
      ctx.lineTo(lon, 512);
      ctx.stroke();
    }

    // Stylized continent landmasses (soft organic shapes)
    ctx.fillStyle = '#1c3d2b';

    // North America
    ctx.beginPath();
    ctx.ellipse(220, 150, 110, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // South America
    ctx.beginPath();
    ctx.ellipse(300, 320, 60, 100, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(520, 140, 65, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Africa
    ctx.beginPath();
    ctx.ellipse(530, 270, 75, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asia
    ctx.beginPath();
    ctx.ellipse(720, 160, 160, 90, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.ellipse(840, 350, 60, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Japan archipelago island strip
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.ellipse(860, 170, 15, 35, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Coastline highlights
    ctx.strokeStyle = 'rgba(82, 183, 136, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(mapCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // Globe Core Mesh
    const globeRadius = 3.2;
    const globeGeom = new THREE.SphereGeometry(globeRadius, 36, 36);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Glowing Atmospheric Outer Rim
    const atmosGeom = new THREE.SphereGeometry(globeRadius * 1.025, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x52b788,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    scene.add(atmosMesh);

    // Orbital ring
    const ringGeom = new THREE.RingGeometry(globeRadius * 1.25, globeRadius * 1.26, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x52b788,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    scene.add(ring);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3dc, 2.2);
    sunLight.position.set(10, 8, 12);
    scene.add(sunLight);

    // Helper: Lat/Lng to Vector3 on Globe
    function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Add Destination Beacon Pins
    const pinGroup = new THREE.Group();
    globe.add(pinGroup);

    const pinMeshes: { mesh: THREE.Mesh; dest: GlobeDestination }[] = [];

    GLOBE_DESTINATIONS.forEach(dest => {
      const pos = latLngToVector3(dest.lat, dest.lng, globeRadius);

      // Pin head
      const pinGeom = new THREE.SphereGeometry(0.09, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(dest.color) });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.copy(pos);
      pinGroup.add(pinMesh);

      // Pin stem
      const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.copy(pos.clone().multiplyScalar(1.03));
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      pinGroup.add(stem);

      // Pulsing outer halo
      const ringMarkerGeom = new THREE.RingGeometry(0.12, 0.16, 16);
      const ringMarkerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(dest.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMarker = new THREE.Mesh(ringMarkerGeom, ringMarkerMat);
      ringMarker.position.copy(pos.clone().multiplyScalar(1.01));
      ringMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      pinGroup.add(ringMarker);

      pinMeshes.push({ mesh: pinMesh, dest });
    });

    // Flight route arcs between major hubs (SFO to Kyoto, Paris to Kyoto, etc.)
    const sfoPos = latLngToVector3(37.7749, -122.4194, globeRadius);
    const kyotoPos = latLngToVector3(35.0116, 135.7681, globeRadius);
    const parisPos = latLngToVector3(48.8566, 2.3522, globeRadius);

    function createRouteCurve(v1: THREE.Vector3, v2: THREE.Vector3): THREE.Line {
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(globeRadius * 1.35); // arc apex
      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(30);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x52b788,
        transparent: true,
        opacity: 0.6,
      });
      return new THREE.Line(geom, mat);
    }

    globe.add(createRouteCurve(sfoPos, kyotoPos));
    globe.add(createRouteCurve(parisPos, kyotoPos));

    // Drag Interaction
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const curX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const curY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = curX - prevX;
      const deltaY = curY - prevY;
      prevX = curX;
      prevY = curY;

      globe.rotation.y += deltaX * 0.006;
      globe.rotation.x += deltaY * 0.004;
      globe.rotation.x = Math.max(-0.6, Math.min(0.6, globe.rotation.x));
    };

    const handleUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    container.addEventListener('touchstart', handleDown, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp, { passive: true });

    // Click Raycasting on Pin markers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targetList = pinMeshes.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(targetList, false);

      if (intersects.length > 0) {
        const hit = pinMeshes.find(p => p.mesh === intersects[0].object);
        if (hit) {
          setSelectedDest(hit.dest);
          onSelectDestination?.(hit.dest);
        }
      }
    };
    container.addEventListener('click', handleClick);

    // Target rotation angles when a destination is selected
    let targetRotY = 0;
    let targetRotX = 0;

    // Render loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      frameId = window.setTimeout(cb, 80);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);

      if (!isDragging) {
        if (selectedDestRef.current) {
          // Calculate target rotation to face selected destination
          const dest = selectedDestRef.current;
          // lng to target Y rotation: when globe rotated by targetRotY, dest.lng faces +Z
          const targetY = -((dest.lng + 90) * (Math.PI / 180));
          const targetX = (dest.lat * (Math.PI / 180)) * 0.4;

          targetRotY = targetY;
          targetRotX = targetX;

          // Smooth interpolation
          globe.rotation.y = THREE.MathUtils.damp(globe.rotation.y, targetRotY, 3.5, delta);
          globe.rotation.x = THREE.MathUtils.damp(globe.rotation.x, targetRotX, 3.5, delta);
        } else if (isRotatingRef.current) {
          globe.rotation.y += 0.003;
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    if (isSoftwareGl) afterDraw(tick);
    else frameId = requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      container.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      earthTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleDestinationClick = (dest: GlobeDestination) => {
    setSelectedDest(dest);
    onSelectDestination?.(dest);
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl bg-[#0c120f] border border-[#23352b] shadow-2xl`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121c17]/95 border border-[#2b4437] text-xs font-semibold text-[#e2ded5] shadow-lg">
          <Compass className="w-3.5 h-3.5 text-[#52b788]" />
          <span>Interactive 3D Travel Globe</span>
        </div>
      </div>

      {/* Top Right Quick Rotation Switch */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsRotating(r => !r)}
          className="p-2 rounded-xl bg-[#14201a]/95 hover:bg-[#1f3128] border border-[#2b4437] text-[#c9c4b8] transition-colors"
          title={isRotating ? 'Pause rotation' : 'Resume auto rotation'}
          aria-label={isRotating ? 'Pause rotation' : 'Resume auto rotation'}
        >
          {isRotating ? <Pause className="w-4 h-4 text-[#52b788]" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* City Quick-Pills Bar (Pinned across top-center for effortless navigation) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
        {GLOBE_DESTINATIONS.map(d => {
          const isSelected = selectedDest.id === d.id;
          return (
            <button
              key={d.id}
              onClick={() => handleDestinationClick(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shadow-md flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#2e5d4b] border-[#52b788] text-white scale-105'
                  : 'bg-[#14201a]/95 border-[#263b2f] text-[#c0d1c7] hover:bg-[#1a2c22]'
              }`}
            >
              <span>{d.badge.split(' ')[0]}</span>
              <span>{d.name}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Floating Selected City Card */}
      {selectedDest && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg bg-[#121c17]/95 border border-[#2b4437] rounded-2xl p-4 shadow-2xl space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedDest.badge.split(' ')[0]}</span>
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-1.5">
                  <span>{selectedDest.name}</span>
                  <span className="text-xs font-normal text-[#8ca395]">({selectedDest.country})</span>
                </h3>
                <span className="text-[11px] text-[#52b788] font-medium">{selectedDest.badge.substring(2)}</span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-[#718b7e] block uppercase">Est. Daily</span>
              <span className="font-bold text-white">{selectedDest.budget}</span>
            </div>
          </div>

          <p className="text-xs text-[#9eb2a7] leading-relaxed">
            {selectedDest.desc}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-[#1e3025]">
            <span className="text-[11px] text-[#8aa395]">Climate: {selectedDest.weather}</span>
            <button
              onClick={() => onPlanTrip?.(`${selectedDest.name}, ${selectedDest.country}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#40916c] text-[#0c120f] font-bold text-xs shadow-md transition-all"
            >
              <span>Plan Trip to {selectedDest.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
