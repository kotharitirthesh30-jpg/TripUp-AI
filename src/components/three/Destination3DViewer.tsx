import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createKyotoPagoda,
  createEiffelTower,
  createAlpinePeak,
  createAtollIsland,
  createAmalfiVilla,
} from './procedural-models';
import { createContactShadowTexture } from './procedural-textures';
import { RotateCw, Sun, Moon, Maximize2 } from 'lucide-react';

interface Destination3DViewerProps {
  type: 'kyoto_pagoda' | 'eiffel_tower' | 'alpine_peak' | 'atoll_island' | 'amalfi_villa' | 'ancient_pyramid';
  destinationName: string;
}

export const Destination3DViewer: React.FC<Destination3DViewerProps> = ({ type, destinationName }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

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
    scene.background = new THREE.Color(0x0e1713);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 3.8, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.warn(e);
    }

    // Lights
    const hemi = new THREE.HemisphereLight(0xfff3e0, 0x1b2d24, 0.9);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 2.5);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = !isSoftwareGl;
    scene.add(dirLight);

    // Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let subject: THREE.Group;
    if (type === 'kyoto_pagoda') {
      subject = createKyotoPagoda();
      camera.position.set(0, 3.0, 7.5);
    } else if (type === 'eiffel_tower') {
      subject = createEiffelTower();
      camera.position.set(0, 4.2, 9.5);
    } else if (type === 'alpine_peak') {
      subject = createAlpinePeak();
      camera.position.set(0, 3.0, 7.5);
    } else if (type === 'atoll_island') {
      subject = createAtollIsland();
      camera.position.set(0, 2.6, 6.8);
    } else {
      subject = createAmalfiVilla();
      camera.position.set(0, 2.8, 6.8);
    }

    modelGroup.add(subject);

    // Ground Contact Shadow Disk
    const shadowTexture = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // Drag rotation
    let isDragging = false;
    let prevX = 0;
    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      prevX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const curX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = curX - prevX;
      prevX = curX;
      modelGroup.rotation.y += delta * 0.008;
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

    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      frameId = window.setTimeout(cb, 80);
    }

    function tick() {
      const delta = clock.getDelta();
      if (!isDragging && autoRotate) {
        modelGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
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
      renderer.dispose();
      shadowTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, autoRotate]);

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#0e1713] border border-[#23352b]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-3 bg-[#14201a]/90 text-xs px-2.5 py-1 rounded-md text-[#d8e2dc] border border-[#2b4437]">
        3D Architectural Landmark Preview
      </div>
      <button
        onClick={() => setAutoRotate(r => !r)}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#14201a]/90 hover:bg-[#1e3027] text-[#c9c4b8] border border-[#2b4437]"
        title="Toggle Rotation"
        aria-label="Toggle Rotation"
      >
        <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'text-[#52b788]' : ''}`} />
      </button>
    </div>
  );
};
