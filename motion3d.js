/**
 * DESI HOOD CARS — Interactive 3D Motion & Scroll Ascent Engine
 * Inspired by luxury dark 3D editorial showcase studios.
 * Renders a 60fps 3D geometric centerpiece, stepped hyper-blocks,
 * low-poly mountain/highway horizon, particle field, cursor parallax,
 * scroll-driven camera stages, and hardware 3D card tilt.
 */
(function () {
  'use strict';

  const STAGES = [
    { id: '01', name: 'BASE', alt: '0,000', label: 'GEAR 01 · BASE · SCROLL TO DRIVE' },
    { id: '02', name: 'TURBO', alt: '3,240', label: 'RPM 4,800 · STAGE 02 · THE TURN' },
    { id: '03', name: 'BOOST', alt: '6,180', label: 'RPM 7,100 · STAGE 03 · ABOVE THE PACK' },
    { id: '04', name: 'APEX', alt: '8,840', label: 'RPM 8,840 · SUMMIT · APEX REACHED' }
  ];

  const THEME_PALETTES = {
    obsidian: { primary: [239, 68, 68], secondary: [255, 255, 255], glow: 'rgba(220, 38, 38, 0.34)', bg: '#060608' },
    crimson:  { primary: [244, 63, 94], secondary: [251, 191, 36],  glow: 'rgba(244, 63, 94, 0.38)', bg: '#110306' },
    emerald:  { primary: [16, 185, 129], secondary: [251, 191, 36], glow: 'rgba(16, 185, 129, 0.32)', bg: '#02120c' },
    navy:     { primary: [56, 189, 248], secondary: [147, 197, 253], glow: 'rgba(59, 130, 246, 0.35)', bg: '#050b1c' },
    carbon:   { primary: [245, 158, 11], secondary: [255, 255, 255], glow: 'rgba(245, 158, 11, 0.32)', bg: '#030304' }
  };

  function getActivePalette() {
    const body = document.body;
    if (!body) return THEME_PALETTES.obsidian;
    for (const key of Object.keys(THEME_PALETTES)) {
      if (body.classList.contains('theme-' + key)) return THEME_PALETTES[key];
    }
    return THEME_PALETTES.obsidian;
  }

  // Generate an Icosahedron mesh (vertices + triangle faces + unique edges)
  function createIcosahedron(radius) {
    const t = (1 + Math.sqrt(5)) / 2;
    const raw = [
      [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
      [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
      [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1]
    ];
    const verts = raw.map(v => {
      const len = Math.hypot(v[0], v[1], v[2]);
      return [(v[0] / len) * radius, (v[1] / len) * radius, (v[2] / len) * radius];
    });
    const faces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    return { verts, faces };
  }

  // Create stepped 3D geometric "ascent slabs" inspired by Apex Motions Studio
  function createSteppedBlocks() {
    const blocks = [];
    for (let i = 0; i < 9; i++) {
      const w = 44 + (i % 3) * 14;
      const h = 10 + (i % 2) * 5;
      const d = 32;
      const x = -150 + i * 36;
      const y = 70 - i * 19;
      const z = -90 + (i % 4) * 42;
      blocks.push({ x, y, z, w, h, d });
    }
    return blocks;
  }

  // Rotate 3D point
  function rotate3D(p, rx, ry, rz) {
    let [x, y, z] = p;
    // Rotate X
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    let y1 = y * cosX - z * sinX;
    let z1 = y * sinX + z * cosX;
    y = y1; z = z1;
    // Rotate Y
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let x2 = x * cosY + z * sinY;
    let z2 = -x * sinY + z * cosY;
    x = x2; z = z2;
    // Rotate Z
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    let x3 = x * cosZ - y * sinZ;
    let y3 = x * sinZ + y * cosZ;
    return [x3, y3, z];
  }

  function project(p, cx, cy, fov, camZ) {
    const z = p[2] + camZ;
    if (z <= 20) return null;
    const scale = fov / z;
    return [cx + p[0] * scale, cy + p[1] * scale, scale, z];
  }

  function initMotionCanvas() {
    const canvas = document.getElementById('dh-3d-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ico = createIcosahedron(132);
    const outerRingIco = createIcosahedron(205);
    const blocks = createSteppedBlocks();

    // Floating 3D shards & depth stars
    const particles = [];
    for (let i = 0; i < 88; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1400,
        y: (Math.random() - 0.5) * 900,
        z: Math.random() * 750 - 150,
        size: 1.1 + Math.random() * 2.4,
        speed: 0.25 + Math.random() * 0.65,
        isShard: i % 5 === 0,
        rot: Math.random() * Math.PI * 2
      });
    }

    let width = 0, height = 0, dpr = 1;
    let targetMouseX = 0, targetMouseY = 0;
    let mouseX = 0, mouseY = 0;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function updateScrollHUD() {
      const docHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      targetScrollProgress = Math.max(0, Math.min(1, window.scrollY / docHeight));

      const stageIdx = Math.min(STAGES.length - 1, Math.floor(targetScrollProgress * STAGES.length));
      const stage = STAGES[stageIdx];

      const hudLabel = document.getElementById('dh-hud-label');
      if (hudLabel) hudLabel.textContent = stage.label;

      const hudFill = document.getElementById('dh-hud-fill');
      if (hudFill) hudFill.style.height = Math.max(12, targetScrollProgress * 100) + '%';

      const hudStageNum = document.getElementById('dh-hud-stage-num');
      if (hudStageNum) hudStageNum.textContent = stage.id;
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', updateScrollHUD, { passive: true });
    window.addEventListener('mousemove', function (e) {
      targetMouseX = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      targetMouseY = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    }, { passive: true });

    resize();
    updateScrollHUD();

    let startTime = performance.now();

    function frame(now) {
      const elapsed = (now - startTime) * 0.001;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;

      ctx.clearRect(0, 0, width, height);
      const pal = getActivePalette();
      const [pr, pg, pb] = pal.primary;
      const [sr, sg, sb] = pal.secondary;

      const isMobile = width < 768;
      const cx = width * 0.5 + mouseX * 32;
      // Camera shifts upward gracefully as user scrolls (Apex ascent feel)
      const cy = height * (isMobile ? 0.34 : 0.42) - scrollProgress * (height * 0.14) + mouseY * 22;
      const fov = isMobile ? 430 : 620;
      const camZ = 560 - scrollProgress * 110;

      // 1. Glowing Cosmic / Tachometer Halo Orb behind 3D geometry
      const orbX = width * (0.72 - scrollProgress * 0.22) + mouseX * 18;
      const orbY = height * (0.28 - scrollProgress * 0.06) + mouseY * 14;
      const orbRadius = isMobile ? 210 : 340;
      const grad = ctx.createRadialGradient(orbX, orbY, 8, orbX, orbY, orbRadius);
      grad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.24)`);
      grad.addColorStop(0.45, `rgba(${pr}, ${pg}, ${pb}, 0.08)`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Perspective 3D Horizon Grid & Low-Poly Peaks near lower viewport
      ctx.save();
      const horizonY = height * 0.78 - scrollProgress * 45;
      ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.11)`;
      ctx.lineWidth = 1;
      const gridCols = isMobile ? 10 : 18;
      for (let i = -gridCols; i <= gridCols; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 26, horizonY);
        ctx.lineTo(cx + i * 165, height + 40);
        ctx.stroke();
      }
      for (let r = 1; r <= 6; r++) {
        const t = Math.pow(r / 6, 1.8);
        const yLine = horizonY + t * (height - horizonY + 25);
        ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, ${(0.03 + t * 0.06).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, yLine);
        ctx.lineTo(width, yLine);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Floating 3D Stepped Ascent Blocks
      const bRx = 0.24 + mouseY * 0.14;
      const bRy = -0.35 + mouseX * 0.18 + scrollProgress * 0.65;
      ctx.save();
      blocks.forEach((b, idx) => {
        const floatY = Math.sin(elapsed * 0.9 + idx * 0.6) * 5;
        const corners = [
          [b.x - b.w / 2, b.y - b.h / 2 + floatY, b.z - b.d / 2],
          [b.x + b.w / 2, b.y - b.h / 2 + floatY, b.z - b.d / 2],
          [b.x + b.w / 2, b.y + b.h / 2 + floatY, b.z - b.d / 2],
          [b.x - b.w / 2, b.y + b.h / 2 + floatY, b.z - b.d / 2],
          [b.x - b.w / 2, b.y - b.h / 2 + floatY, b.z + b.d / 2],
          [b.x + b.w / 2, b.y - b.h / 2 + floatY, b.z + b.d / 2],
          [b.x + b.w / 2, b.y + b.h / 2 + floatY, b.z + b.d / 2],
          [b.x - b.w / 2, b.y + b.h / 2 + floatY, b.z + b.d / 2]
        ].map(pt => rotate3D(pt, bRx, bRy, 0));

        const pts = corners.map(pt => project(pt, cx, cy + 40, fov, camZ + 120));
        if (pts.some(p => !p)) return;

        // Top face fill
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.lineTo(pts[1][0], pts[1][1]);
        ctx.lineTo(pts[5][0], pts[5][1]);
        ctx.lineTo(pts[4][0], pts[4][1]);
        ctx.closePath();
        ctx.fillStyle = idx === blocks.length - 1
          ? `rgba(${pr}, ${pg}, ${pb}, 0.16)`
          : 'rgba(18, 22, 32, 0.42)';
        ctx.fill();
        ctx.strokeStyle = idx === blocks.length - 1
          ? `rgba(${pr}, ${pg}, ${pb}, 0.5)`
          : `rgba(${sr}, ${sg}, ${sb}, 0.12)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // 4. Centerpiece 3D Rotating Faceted Polyhedron (Apex centerpiece)
      const rotSpeed = prefersReducedMotion ? 0.04 : 0.22;
      const rx = elapsed * rotSpeed * 0.7 + scrollProgress * 2.1 + mouseY * 0.45;
      const ry = elapsed * rotSpeed + scrollProgress * 3.4 + mouseX * 0.55;
      const rz = Math.sin(elapsed * 0.3) * 0.2;

      const rotVerts = ico.verts.map(v => rotate3D(v, rx, ry, rz));
      const projVerts = rotVerts.map(v => project(v, cx, cy, fov, camZ));

      // Sort faces back-to-front (Painter's algorithm)
      const sortedFaces = ico.faces.map(f => {
        const p0 = projVerts[f[0]], p1 = projVerts[f[1]], p2 = projVerts[f[2]];
        if (!p0 || !p1 || !p2) return null;
        const avgZ = (p0[3] + p1[3] + p2[3]) / 3;
        // Normal in 3D space for specular lighting
        const v0 = rotVerts[f[0]], v1 = rotVerts[f[1]], v2 = rotVerts[f[2]];
        const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
        const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const nLen = Math.hypot(nx, ny, nz) || 1;
        // Light from top-right orb
        const light = Math.max(0, (nx * 0.45 - ny * 0.55 - nz * 0.7) / nLen);
        return { p0, p1, p2, avgZ, light, isFront: nz < 0 };
      }).filter(Boolean).sort((a, b) => b.avgZ - a.avgZ);

      sortedFaces.forEach(face => {
        ctx.beginPath();
        ctx.moveTo(face.p0[0], face.p0[1]);
        ctx.lineTo(face.p1[0], face.p1[1]);
        ctx.lineTo(face.p2[0], face.p2[1]);
        ctx.closePath();

        if (face.isFront) {
          const r = Math.round(14 + face.light * (pr * 0.45));
          const g = Math.round(16 + face.light * (pg * 0.25));
          const b = Math.round(24 + face.light * (pb * 0.28));
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(0.42 + face.light * 0.25).toFixed(3)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${(0.22 + face.light * 0.55).toFixed(3)})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, 0.06)`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      });

      // Outer faint geodesic wireframe ring
      const outerVerts = outerRingIco.verts.map(v => rotate3D(v, -rx * 0.45, -ry * 0.38, rz));
      const outerProj = outerVerts.map(v => project(v, cx, cy, fov, camZ));
      ctx.beginPath();
      ico.faces.forEach(f => {
        const a = outerProj[f[0]], b = outerProj[f[1]], c = outerProj[f[2]];
        if (!a || !b || !c) return;
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
      });
      ctx.strokeStyle = `rgba(${sr}, ${sg}, ${sb}, 0.065)`;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // 5. Floating 3D Depth Particles & Geometric Shards
      particles.forEach(pt => {
        if (!prefersReducedMotion) {
          pt.z -= pt.speed * (1 + scrollProgress * 2.2);
          if (pt.z < -260) pt.z = 540;
        }
        const p = project([pt.x + mouseX * 45, pt.y + mouseY * 35, pt.z], cx, cy, fov, camZ);
        if (!p || p[0] < -20 || p[0] > width + 20 || p[1] < -20 || p[1] > height + 20) return;

        const alpha = Math.max(0.08, Math.min(0.65, 1 - p[3] / 1100));
        if (pt.isShard) {
          const s = pt.size * p[2] * 3.2;
          const a = pt.rot + elapsed * 0.6;
          ctx.beginPath();
          ctx.moveTo(p[0] + Math.cos(a) * s, p[1] + Math.sin(a) * s);
          ctx.lineTo(p[0] + Math.cos(a + 2.1) * s, p[1] + Math.sin(a + 2.1) * s);
          ctx.lineTo(p[0] + Math.cos(a + 4.2) * s, p[1] + Math.sin(a + 4.2) * s);
          ctx.closePath();
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${(alpha * 0.48).toFixed(3)})`;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${sr}, ${sg}, ${sb}, ${(alpha * 0.55).toFixed(3)})`;
          ctx.fillRect(p[0], p[1], Math.max(1.2, pt.size * p[2] * 1.4), Math.max(1.2, pt.size * p[2] * 1.4));
        }
      });

      if (!prefersReducedMotion) {
        updateCursorTextParallax(mouseX, mouseY, isMobile);
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  // Smooth global 3D cursor-tracked motion for website text & headings
  function updateCursorTextParallax(mx, my, isMobile) {
    if (isMobile) return;

    const layers = document.querySelectorAll('[data-3d-depth], main section h2, .dh-parallax-text');
    for (let i = 0; i < layers.length; i++) {
      const el = layers[i];
      // Skip elements inside modals or hidden tabs
      if (el.offsetParent === null) continue;

      const depth = parseFloat(el.getAttribute('data-3d-depth')) || 11;
      const tilt = parseFloat(el.getAttribute('data-3d-tilt')) || 0.35;

      const tx = mx * depth;
      const ty = my * depth * 0.65;
      const rx = -my * tilt * 5.0;
      const ry = mx * tilt * 6.2;

      el.style.transform = `perspective(1000px) translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, ${Math.round(depth * 0.6)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

      if (el.id === 'hero-3d-title') {
        const sx = (-mx * 10).toFixed(1);
        const sy = (-my * 8).toFixed(1);
        el.style.textShadow = `${sx}px ${sy}px 28px rgba(239, 68, 68, 0.32), ${(sx * 0.4).toFixed(1)}px ${(sy * 0.4).toFixed(1)}px 10px rgba(0, 0, 0, 0.85)`;
      }
    }
  }

  // Interactive cursor-tracked 3D perspective tilt + inner text parallax for cards & magnetic buttons
  function init3DTiltCards() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    let activeCard = null;
    let activeMag = null;

    function resetCard(card) {
      if (!card) return;
      card.style.transform = '';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
      const depthEls = card.querySelectorAll('.dh-depth-layer, h3, p, .dh-outline-num');
      depthEls.forEach(d => {
        d.style.removeProperty('--tx');
        d.style.removeProperty('--ty');
        d.style.transform = '';
      });
    }

    document.addEventListener('mousemove', function (e) {
      // 1. Magnetic CTA / Brand Logo pull
      const mag = e.target.closest('.dh-magnetic');
      if (activeMag && activeMag !== mag) {
        activeMag.style.transform = '';
        activeMag = null;
      }
      if (mag) {
        activeMag = mag;
        const mRect = mag.getBoundingClientRect();
        const mdx = ((e.clientX - mRect.left) / Math.max(mRect.width, 1) - 0.5) * 14;
        const mdy = ((e.clientY - mRect.top) / Math.max(mRect.height, 1) - 0.5) * 10;
        mag.style.transform = `translate3d(${mdx.toFixed(2)}px, ${mdy.toFixed(2)}px, 12px)`;
      }

      // 2. 3D Card tilt + inner text counter-parallax
      const card = e.target.closest('.dh-3d-tilt, .glass-card');
      if (activeCard && activeCard !== card) {
        resetCard(activeCard);
        activeCard = null;
      }
      if (!card) return;
      activeCard = card;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotY = (px - 0.5) * 9.5;
      const rotX = (0.5 - py) * 9.5;
      const innerX = (px - 0.5) * 16;
      const innerY = (py - 0.5) * 12;

      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-5px) scale3d(1.015, 1.015, 1.015)`;

      const depthEls = card.querySelectorAll('.dh-depth-layer, .dh-outline-num');
      depthEls.forEach(d => {
        d.style.setProperty('--tx', innerX.toFixed(2) + 'px');
        d.style.setProperty('--ty', innerY.toFixed(2) + 'px');
        if (!d.classList.contains('dh-depth-layer')) {
          d.style.transform = `translate3d(${(innerX * 0.7).toFixed(2)}px, ${(innerY * 0.7).toFixed(2)}px, 24px)`;
        }
      });
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
      if (activeMag) {
        activeMag.style.transform = '';
        activeMag = null;
      }
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMotionCanvas();
    init3DTiltCards();
  });
})();
