import * as THREE from 'three';

/**
 * Creates a procedural water ripple & caustic CanvasTexture
 */
export function createWaterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic turquoise gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#10393b');
  grad.addColorStop(0.5, '#195554');
  grad.addColorStop(1, '#0c2729');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Concentric water ripple waves
  ctx.strokeStyle = 'rgba(120, 220, 210, 0.25)';
  ctx.lineWidth = 2.5;

  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    const cx = 150 + Math.sin(i) * 80;
    const cy = 200 + Math.cos(i) * 80;
    const r = (i * 26) % 250;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Secondary caustics
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  for (let j = 0; j < 12; j++) {
    ctx.beginPath();
    const cx2 = 360 + Math.cos(j * 1.5) * 60;
    const cy2 = 340 + Math.sin(j * 1.5) * 60;
    const r2 = (j * 32) % 200;
    ctx.arc(cx2, cy2, r2, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates procedural terrain contour & stone CanvasTexture
 */
export function createTerrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Earthy forest green base
  ctx.fillStyle = '#1e3828';
  ctx.fillRect(0, 0, 512, 512);

  // Varied organic grass patches
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 20 + Math.random() * 50;
    const patchGrad = ctx.createRadialGradient(x, y, 2, x, y, radius);
    patchGrad.addColorStop(0, '#2e543c');
    patchGrad.addColorStop(1, 'rgba(30, 56, 40, 0)');
    ctx.fillStyle = patchGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle topography contour lines
  ctx.strokeStyle = 'rgba(240, 230, 210, 0.08)';
  ctx.lineWidth = 1.2;
  for (let line = 0; line < 16; line++) {
    ctx.beginPath();
    const yBase = line * 32;
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= 512; x += 32) {
      const yOffset = Math.sin(x * 0.02 + line) * 16 + Math.cos(x * 0.04) * 8;
      ctx.lineTo(x, yBase + yOffset);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates soft contact shadow disk texture
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const radGrad = ctx.createRadialGradient(128, 128, 0, 128, 128, 120);
  radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  radGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.1)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
