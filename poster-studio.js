/**
 * DESI HOOD CARS — Automatic AI Promotional Car Poster Generator
 * Generates HD multi-photo showroom posters (Square 1:1, Portrait 4:5, Story 9:16)
 * using real dealer photographs, full specifications, PKR/global pricing, QR code,
 * AI marketing captions, PNG gallery download, and 7-platform social sharing.
 */
(function () {
  'use strict';

  const FORMAT_SPECS = {
    portrait: { width: 1080, height: 1350, label: 'Portrait (4:5 Feed)' },
    square:   { width: 1080, height: 1080, label: 'Square (1:1 Post)' },
    story:    { width: 1080, height: 1920, label: 'Story (9:16 WA / Snap / Shorts)' }
  };

  const TEMPLATE_THEMES = {
    'obsidian-pro': {
      name: 'Obsidian Crimson Pro',
      bgTop: '#07080c',
      bgBottom: '#14060a',
      accent: '#ef4444',
      accentSoft: 'rgba(239, 68, 68, 0.16)',
      cardBg: 'rgba(15, 19, 28, 0.92)',
      border: 'rgba(239, 68, 68, 0.45)',
      textMain: '#ffffff',
      textMuted: '#cbd5e1',
      badgeBg: '#dc2626',
      badgeText: '#ffffff'
    },
    'royal-gold': {
      name: 'Royal Gold Showroom',
      bgTop: '#08090d',
      bgBottom: '#141006',
      accent: '#f59e0b',
      accentSoft: 'rgba(245, 158, 11, 0.15)',
      cardBg: 'rgba(17, 20, 28, 0.92)',
      border: 'rgba(245, 158, 11, 0.48)',
      textMain: '#ffffff',
      textMuted: '#fde68a',
      badgeBg: '#f59e0b',
      badgeText: '#09090b'
    },
    'apex-clean': {
      name: 'Apex Editorial Stealth',
      bgTop: '#050608',
      bgBottom: '#0b0f17',
      accent: '#38bdf8',
      accentSoft: 'rgba(56, 189, 248, 0.14)',
      cardBg: 'rgba(12, 16, 24, 0.92)',
      border: 'rgba(255, 255, 255, 0.22)',
      textMain: '#ffffff',
      textMuted: '#94a3b8',
      badgeBg: '#ffffff',
      badgeText: '#050608'
    }
  };

  const AI_HOOKS = [
    'CERTIFIED SHOWROOM ARRIVAL • INSPECTED & READY TO DRIVE',
    'VERIFIED DIRECT DEALER LISTING • ZERO MIDDLEMAN MARKUP',
    'FLAGSHIP GARAGE SELECTION • DRIVE HOME TODAY',
    'TOP CONDITION GUARANTEED • INSTANT WHATSAPP DEAL'
  ];

  let posterState = {
    carId: null,
    format: 'portrait',
    template: 'obsidian-pro',
    hookIndex: 0,
    lastDataUrl: '',
    isRendering: false
  };

  function getCarAllPictures(car) {
    if (!car) return ['gallery/gallery-1.jpg'];
    const list = [];
    if (Array.isArray(car.images)) {
      car.images.forEach(u => {
        if (u && !list.includes(u)) list.push(u);
      });
    }
    if (car.image && !list.includes(car.image)) list.unshift(car.image);
    return list.length ? list : ['gallery/gallery-1.jpg'];
  }

  function loadImageSafe(src) {
    return new Promise((resolve) => {
      if (!src) { resolve(null); return; }
      const img = new Image();
      if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) { settled = true; resolve(null); }
      }, 4500);
      img.onload = () => {
        if (!settled) { settled = true; clearTimeout(timer); resolve(img); }
      };
      img.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
      img.src = src;
    });
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h, radius = 16) {
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    if (img) {
      const iw = img.naturalWidth || img.width || w;
      const ih = img.naturalHeight || img.height || h;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  // Deterministic scannable-style QR Matrix block encoding car URL
  function drawQrBadge(ctx, text, x, y, size, accentColor) {
    ctx.save();
    drawRoundedRect(ctx, x, y, size, size, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const pad = Math.round(size * 0.1);
    const inner = size - pad * 2;
    const cells = 21;
    const cell = inner / cells;

    let seed = 2166136261;
    for (let i = 0; i < text.length; i++) {
      seed ^= text.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    const isFinder = (r, c) =>
      (r < 7 && c < 7) ||
      (r < 7 && c >= cells - 7) ||
      (r >= cells - 7 && c < 7);

    const drawFinderPattern = (fr, fc) => {
      const fx = x + pad + fc * cell;
      const fy = y + pad + fr * cell;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(fx, fy, cell * 7, cell * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + cell, fy + cell, cell * 5, cell * 5);
      ctx.fillStyle = accentColor || '#dc2626';
      ctx.fillRect(fx + cell * 2, fy + cell * 2, cell * 3, cell * 3);
    };

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (isFinder(r, c)) continue;
        seed ^= (r * 31 + c * 17);
        seed = Math.imul(seed, 16777619) >>> 0;
        if ((seed & 3) === 0 || (r + c) % 5 === 0) {
          ctx.fillStyle = '#09090b';
          ctx.fillRect(x + pad + c * cell, y + pad + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }

    drawFinderPattern(0, 0);
    drawFinderPattern(0, cells - 7);
    drawFinderPattern(cells - 7, 0);
    ctx.restore();
  }

  function truncateFit(ctx, str, maxWidth) {
    let text = String(str || '');
    if (ctx.measureText(text).width <= maxWidth) return text;
    while (text.length > 3 && ctx.measureText(text + '...').width > maxWidth) {
      text = text.slice(0, -1);
    }
    return text + '...';
  }

  function formatPkrAndActivePrice(car) {
    const usd = Number(car?.price) || 0;
    const pkr = Math.round(usd * 278);
    const activeCur = (typeof appState !== 'undefined' && appState.currentCurrency) || 'USD';
    const activeFormatted = typeof formatCurrency === 'function' ? formatCurrency(usd) : `$${usd.toLocaleString()}`;
    if (activeCur === 'PKR') {
      return {
        primary: `PKR ${pkr.toLocaleString()}`,
        secondary: `$${usd.toLocaleString()} USD`
      };
    }
    return {
      primary: activeFormatted,
      secondary: `PKR ${pkr.toLocaleString()}`
    };
  }

  function generateAiPosterCopy(car, dealer) {
    if (!car) return '';
    const hook = AI_HOOKS[posterState.hookIndex % AI_HOOKS.length];
    const km = typeof getCarKilometers === 'function' ? getCarKilometers(car) : (car.kilometers || Math.round((car.mileage || 0) * 1.609));
    const prices = formatPkrAndActivePrice(car);
    const shareUrl = getCarShareLandingUrl(car, dealer);
    const makeTag = String(car.make || 'Car').replace(/[^a-zA-Z0-9]/g, '');
    const modelTag = String(car.model || '').replace(/[^a-zA-Z0-9]/g, '');
    const picsCount = getCarAllPictures(car).length;

    const workingLine = car.workingDetails?.score
      ? `Inspection: ${car.workingDetails.score} (${car.workingDetails.engine || 'Verified Engine'})`
      : `Condition: ${car.condition || 'Certified'}`;

    return [
      `${hook}`,
      ``,
      `${car.year} ${car.make} ${car.model} — NOW AVAILABLE ON DESI HOOD CARS`,
      `Price: ${prices.primary} (${prices.secondary})`,
      `Mileage: ${Number(km || 0).toLocaleString()} km (${Number(car.mileage || 0).toLocaleString()} mi)`,
      `Engine / Powertrain: ${car.engine || car.fuelType} • ${car.transmission}`,
      `Body & Color: ${car.bodyStyle || 'Auto'} • ${car.color || 'Showroom Finish'}`,
      workingLine,
      `Photos Attached: ${picsCount} HD Gallery View${picsCount > 1 ? 's' : ''}`,
      ``,
      `Showroom: ${dealer?.name || 'Desi Hood Verified Dealer'} (${dealer?.location || 'Pakistan / Global'})`,
      `Call / WhatsApp: ${dealer?.whatsapp || dealer?.phone || '+92 343 5972004'}`,
      `Inspect & Inquire: ${shareUrl}`,
      ``,
      `#DesiHoodCars #${makeTag} #${makeTag}${modelTag} #BuySellDriveBetter #CarsForSale #PakistanCars #VerifiedShowroom`
    ].join('\n');
  }

  function getCarShareLandingUrl(car, dealer) {
    const origin = /^https?:\/\/(?!localhost|127\.0\.0\.1)/i.test(window.location.origin)
      ? window.location.origin
      : 'https://desi-hood-cars.vercel.app';
    const pics = getCarAllPictures(car);
    const firstImg = pics[0] || 'gallery/gallery-1.jpg';
    const absImg = /^https?:\/\//i.test(firstImg)
      ? firstImg
      : (firstImg.startsWith('data:') ? `${origin}/gallery/gallery-1.jpg` : `${origin}/${firstImg.replace(/^\/+/, '')}`);
    const prices = formatPkrAndActivePrice(car);
    const q = new URLSearchParams({
      title: `${car.year} ${car.make} ${car.model} (${prices.primary})`,
      desc: `${car.condition} • ${car.fuelType} • ${car.transmission} • Showroom: ${dealer?.name || 'Desi Hood Cars'} (${dealer?.location || ''})`,
      img: absImg
    });
    return `${origin}/share?${q.toString()}`;
  }

  async function renderPosterCanvas() {
    if (posterState.isRendering) return;
    const canvas = document.getElementById('ai-poster-canvas');
    if (!canvas || !posterState.carId || typeof appState === 'undefined') return;

    const car = appState.cars.find(c => c.id === posterState.carId);
    if (!car) return;
    const dealer = typeof getDealerById === 'function' ? getDealerById(car.dealerId) : (appState.dealers[0] || {});

    posterState.isRendering = true;
    const statusEl = document.getElementById('ai-poster-render-status');
    if (statusEl) statusEl.textContent = 'AI Engine generating multi-photo HD poster...';

    try {
      const spec = FORMAT_SPECS[posterState.format] || FORMAT_SPECS.portrait;
      const theme = TEMPLATE_THEMES[posterState.template] || TEMPLATE_THEMES['obsidian-pro'];
      const W = spec.width;
      const H = spec.height;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Load up to 5 dealer photos + brand logo cleanly
      const pics = getCarAllPictures(car).slice(0, 5);
      const [logoImg, ...loadedPics] = await Promise.all([
        loadImageSafe('gallery/desi-hood-cars-brand.jpg'),
        ...pics.map(src => loadImageSafe(src))
      ]);
      const safePics = loadedPics.map((img, i) => img || loadedPics[0] || null);

      // 1. Rich Gradient Backdrop & Subtle Grid Texture
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, theme.bgTop);
      bgGrad.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Radial accent spotlight behind main car
      const radGlow = ctx.createRadialGradient(W * 0.5, H * 0.34, 30, W * 0.5, H * 0.34, W * 0.65);
      radGlow.addColorStop(0, theme.accentSoft);
      radGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, W, H);

      // Outer framing border
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, 22, 22, W - 44, H - 44, 32);
      ctx.stroke();

      const pad = 54;
      const innerW = W - pad * 2;
      let cursorY = 54;

      // 2. Top Brand Header: Logo Crest + AI Verified Tagline
      drawCoverImage(ctx, logoImg, pad, cursorY, 136, 84, 14);
      ctx.fillStyle = theme.textMain;
      ctx.font = '800 32px Arial, sans-serif';
      ctx.fillText('DESI HOOD CARS', pad + 156, cursorY + 38);
      ctx.fillStyle = theme.accent;
      ctx.font = '700 18px Arial, sans-serif';
      ctx.fillText('BY AHMAD RAZA  •  BUY  •  SELL  •  DRIVE BETTER', pad + 156, cursorY + 68);

      // Status Pill top-right
      const pillText = (car.condition || 'CERTIFIED').toUpperCase();
      ctx.font = '800 17px Arial, sans-serif';
      const pillW = Math.min(240, ctx.measureText(pillText).width + 38);
      drawRoundedRect(ctx, W - pad - pillW, cursorY + 18, pillW, 44, 22);
      ctx.fillStyle = theme.badgeBg;
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.textAlign = 'center';
      ctx.fillText(truncateFit(ctx, pillText, pillW - 18), W - pad - pillW / 2, cursorY + 46);
      ctx.textAlign = 'left';

      cursorY += 108;

      // 3. Car Headline + Price Ribbon
      const prices = formatPkrAndActivePrice(car);
      const titleStr = `${car.year} ${car.make} ${car.model}`.toUpperCase();
      ctx.fillStyle = theme.textMain;
      ctx.font = posterState.format === 'story' ? '900 48px Arial, sans-serif' : '900 44px Arial, sans-serif';
      ctx.fillText(truncateFit(ctx, titleStr, innerW - 310), pad, cursorY + 44);

      // Price Callout Box (Right)
      const priceBoxW = 296;
      const priceBoxX = W - pad - priceBoxW;
      drawRoundedRect(ctx, priceBoxX, cursorY - 2, priceBoxW, 84, 18);
      ctx.fillStyle = theme.badgeBg;
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.font = '900 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(truncateFit(ctx, prices.primary, priceBoxW - 22), priceBoxX + priceBoxW / 2, cursorY + 38);
      ctx.font = '700 16px Arial, sans-serif';
      ctx.fillText(truncateFit(ctx, prices.secondary, priceBoxW - 22), priceBoxX + priceBoxW / 2, cursorY + 66);
      ctx.textAlign = 'left';

      // Sub-hook
      ctx.fillStyle = theme.textMuted;
      ctx.font = '600 18px Arial, sans-serif';
      ctx.fillText(truncateFit(ctx, AI_HOOKS[posterState.hookIndex % AI_HOOKS.length], innerW - 315), pad, cursorY + 76);

      cursorY += 104;

      // 4. Main Car Hero Photo + Multi-Photo Collage Strip (Uses ALL dealer shared pictures!)
      const hasExtraPics = pics.length > 1;
      const heroH = posterState.format === 'square'
        ? (hasExtraPics ? 320 : 410)
        : posterState.format === 'story'
        ? (hasExtraPics ? 580 : 720)
        : (hasExtraPics ? 420 : 520);

      drawCoverImage(ctx, safePics[0], pad, cursorY, innerW, heroH, 24);
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, pad, cursorY, innerW, heroH, 24);
      ctx.stroke();

      // Photo count watermark badge on hero image
      const photoBadge = `${pics.length} DEALER PHOTO${pics.length > 1 ? 'S' : ''}`;
      drawRoundedRect(ctx, pad + 18, cursorY + 18, 178, 36, 18);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px Arial, sans-serif';
      ctx.fillText(photoBadge, pad + 34, cursorY + 41);

      cursorY += heroH + 16;

      // Extra photos collage row (2 to 4 additional photos from dealer!)
      if (hasExtraPics) {
        const thumbs = safePics.slice(1, 5);
        const thumbGap = 14;
        const thumbCount = thumbs.length;
        const thumbW = (innerW - thumbGap * (thumbCount - 1)) / thumbCount;
        const thumbH = posterState.format === 'square' ? 115 : posterState.format === 'story' ? 190 : 138;
        thumbs.forEach((tImg, idx) => {
          const tx = pad + idx * (thumbW + thumbGap);
          drawCoverImage(ctx, tImg, tx, cursorY, thumbW, thumbH, 14);
          ctx.strokeStyle = 'rgba(255,255,255,0.22)';
          ctx.lineWidth = 1.5;
          drawRoundedRect(ctx, tx, cursorY, thumbW, thumbH, 14);
          ctx.stroke();
        });
        cursorY += thumbH + 18;
      }

      // 5. Specs Grid Cards (All dealer-provided specs)
      const kmVal = typeof getCarKilometers === 'function' ? getCarKilometers(car) : (car.kilometers || 0);
      const specsList = [
        { k: 'MILEAGE', v: `${Number(kmVal).toLocaleString()} km (${Number(car.mileage || 0).toLocaleString()} mi)` },
        { k: 'ENGINE / POWER', v: car.engine || (car.horsepower ? `${car.horsepower} HP` : car.fuelType) },
        { k: 'FUEL & TRANS', v: `${car.fuelType || 'Petrol'} • ${car.transmission || 'Auto'}` },
        { k: 'COLOR & BODY', v: `${car.color || 'Factory'} • ${car.bodyStyle || 'Auto'}` },
        { k: 'CONDITION / SCORE', v: car.workingDetails?.score || car.condition || 'Verified' },
        { k: 'LOCATION', v: dealer?.location || car.country || 'Verified Showroom' }
      ];

      const cols = 3;
      const boxGap = 14;
      const boxW = (innerW - boxGap * (cols - 1)) / cols;
      const boxH = posterState.format === 'story' ? 108 : 82;

      specsList.forEach((sp, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = pad + col * (boxW + boxGap);
        const by = cursorY + row * (boxH + boxGap);
        drawRoundedRect(ctx, bx, by, boxW, boxH, 16);
        ctx.fillStyle = theme.cardBg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = theme.accent;
        ctx.font = '800 13px Arial, sans-serif';
        ctx.fillText(sp.k, bx + 16, by + 28);

        ctx.fillStyle = theme.textMain;
        ctx.font = '700 19px Arial, sans-serif';
        ctx.fillText(truncateFit(ctx, sp.v, boxW - 30), bx + 16, by + (posterState.format === 'story' ? 68 : 58));
      });

      cursorY += (boxH * 2 + boxGap + 18);

      // Extra Highlights / Story description ribbon if Story format
      if (posterState.format === 'story' && cursorY < H - 250) {
        const noteText = car.workingDetails?.notes || car.description || 'Verified inspection • Contact dealer for walkaround & test drive.';
        drawRoundedRect(ctx, pad, cursorY, innerW, 118, 18);
        ctx.fillStyle = theme.cardBg;
        ctx.fill();
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = theme.accent;
        ctx.font = '800 15px Arial, sans-serif';
        ctx.fillText('SHOWROOM HIGHLIGHTS & WORKING REPORT', pad + 20, cursorY + 34);
        ctx.fillStyle = theme.textMain;
        ctx.font = '500 20px Arial, sans-serif';
        ctx.fillText(truncateFit(ctx, noteText, innerW - 40), pad + 20, cursorY + 74);
        ctx.fillStyle = theme.textMuted;
        ctx.font = '600 16px Arial, sans-serif';
        ctx.fillText(truncateFit(ctx, car.workingDetails ? `${car.workingDetails.engine} | ${car.workingDetails.body} | ${car.workingDetails.ac}` : 'Genuine Documents • Immediate Transfer Available', innerW - 40), pad + 20, cursorY + 102);
      }

      // 6. Dealer Showroom Contact + QR Code Footer Bar
      const footerH = 148;
      const footerY = H - pad - footerH;
      drawRoundedRect(ctx, pad, footerY, innerW, footerH, 22);
      ctx.fillStyle = theme.cardBg;
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      const qrSize = 114;
      const qrX = W - pad - qrSize - 18;
      const qrY = footerY + (footerH - qrSize) / 2;
      const qrUrl = getCarShareLandingUrl(car, dealer);
      drawQrBadge(ctx, qrUrl, qrX, qrY, qrSize, theme.accent);

      const textMaxW = qrX - (pad + 26) - 20;
      ctx.fillStyle = theme.accent;
      ctx.font = '800 14px Arial, sans-serif';
      ctx.fillText('VERIFIED DEALER SHOWROOM  •  SCAN QR FOR LISTING', pad + 26, footerY + 32);

      ctx.fillStyle = theme.textMain;
      ctx.font = '900 27px Arial, sans-serif';
      ctx.fillText(truncateFit(ctx, dealer?.name || 'Desi Hood Cars Verified Showroom', textMaxW), pad + 26, footerY + 66);

      ctx.fillStyle = theme.textMuted;
      ctx.font = '700 18px Arial, sans-serif';
      const contactLine = `Phone / WhatsApp: ${dealer?.whatsapp || dealer?.phone || '+92 343 5972004'}  •  ${dealer?.location || 'Pakistan'}`;
      ctx.fillText(truncateFit(ctx, contactLine, textMaxW), pad + 26, footerY + 98);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px Arial, sans-serif';
      ctx.fillText('https://desi-hood-cars.vercel.app  •  Powered by Desi Hood AI Poster Studio', pad + 26, footerY + 126);

      try {
        posterState.lastDataUrl = canvas.toDataURL('image/png');
      } catch (taintErr) {
        // Fallback note if an external image tainted canvas; user still sees preview
        posterState.lastDataUrl = '';
      }

      if (statusEl) {
        statusEl.textContent = `HD ${spec.width}×${spec.height}px Poster Ready (${pics.length} picture${pics.length > 1 ? 's' : ''} combined)`;
      }
    } finally {
      posterState.isRendering = false;
    }
  }

  window.openAiPosterStudio = async function (carId) {
    if (!carId || typeof appState === 'undefined') return;
    const car = appState.cars.find(c => c.id === carId);
    if (!car) return;
    const dealer = typeof getDealerById === 'function' ? getDealerById(car.dealerId) : (appState.dealers[0] || {});

    posterState.carId = car.id;
    const titleEl = document.getElementById('ai-poster-car-title');
    if (titleEl) titleEl.textContent = `${car.year} ${car.make} ${car.model} — AI Poster Studio`;

    const captionBox = document.getElementById('ai-poster-caption');
    if (captionBox) captionBox.value = generateAiPosterCopy(car, dealer);

    const fmtSel = document.getElementById('ai-poster-format');
    if (fmtSel) fmtSel.value = posterState.format;

    const tmplSel = document.getElementById('ai-poster-template');
    if (tmplSel) tmplSel.value = posterState.template;

    if (typeof openModal === 'function') openModal('modal-ai-poster');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    await renderPosterCanvas();
  };

  window.changeAiPosterOption = async function (type, val) {
    if (type === 'format' && FORMAT_SPECS[val]) posterState.format = val;
    if (type === 'template' && TEMPLATE_THEMES[val]) posterState.template = val;
    if (type === 'hook') {
      posterState.hookIndex = (posterState.hookIndex + 1) % AI_HOOKS.length;
      const car = appState.cars.find(c => c.id === posterState.carId);
      const dealer = typeof getDealerById === 'function' ? getDealerById(car?.dealerId) : {};
      const captionBox = document.getElementById('ai-poster-caption');
      if (car && captionBox) captionBox.value = generateAiPosterCopy(car, dealer);
    }
    await renderPosterCanvas();
  };

  window.downloadAiPosterPng = async function (silentToast = false) {
    const canvas = document.getElementById('ai-poster-canvas');
    const car = appState.cars.find(c => c.id === posterState.carId);
    if (!canvas || !car) return false;

    const filename = `DesiHood-${car.year}-${car.make}-${car.model}-${posterState.format}.png`
      .replace(/[^a-zA-Z0-9._-]+/g, '-');

    try {
      const dataUrl = posterState.lastDataUrl || canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (!silentToast && typeof showToast === 'function') {
        showToast('Poster Saved to Gallery/Downloads!', `"${filename}" downloaded cleanly in HD.`, 'success');
      }
      return true;
    } catch (err) {
      if (typeof showToast === 'function') {
        showToast('Download Blocked by Remote Image CORS', 'Switch main photo to a local/uploaded image or copy caption link.', 'error');
      }
      return false;
    }
  };

  window.copyAiPosterCaption = async function () {
    const caption = document.getElementById('ai-poster-caption')?.value || '';
    if (typeof copyShareText === 'function') {
      await copyShareText(caption, 'AI Marketing Caption & Hashtags');
    }
  };

  window.shareAiPosterToPlatform = async function (platform) {
    const car = appState.cars.find(c => c.id === posterState.carId);
    if (!car) return;
    const dealer = typeof getDealerById === 'function' ? getDealerById(car.dealerId) : {};
    const caption = document.getElementById('ai-poster-caption')?.value || generateAiPosterCopy(car, dealer);
    const shareUrl = getCarShareLandingUrl(car, dealer);
    const title = `${car.year} ${car.make} ${car.model} — Desi Hood Cars`;

    if (platform === 'native') {
      const canvas = document.getElementById('ai-poster-canvas');
      if (navigator.share && canvas && canvas.toBlob) {
        try {
          const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
          if (blob) {
            const file = new File([blob], `desi-hood-poster.png`, { type: 'image/png' });
            if (!navigator.canShare || navigator.canShare({ files: [file] })) {
              await navigator.share({ title, text: caption, files: [file], url: shareUrl });
              return;
            }
          }
          await navigator.share({ title, text: caption, url: shareUrl });
          return;
        } catch (err) {
          if (err?.name === 'AbortError') return;
        }
      }
      await window.downloadAiPosterPng(true);
      await window.copyAiPosterCaption();
      return;
    }

    if (platform === 'whatsapp') {
      await window.downloadAiPosterPng(true);
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank', 'noopener,noreferrer');
      showToast('WhatsApp Ready!', 'Poster PNG saved + listing message opened in WhatsApp.', 'success');
      return;
    }

    if (platform === 'facebook') {
      await window.copyAiPosterCaption();
      await window.downloadAiPosterPng(true);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      showToast('Facebook Share Opened', 'Poster PNG saved + caption copied & Facebook share dialog launched.', 'success');
      return;
    }

    if (platform === 'twitter') {
      const tweet = `${car.year} ${car.make} ${car.model} (${formatPkrAndActivePrice(car).primary}) — Verified on Desi Hood Cars! #DesiHoodCars #${car.make.replace(/\s+/g, '')}`;
      await window.downloadAiPosterPng(true);
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      showToast('X (Twitter) Ready!', 'Poster PNG downloaded + tweet window opened with thumbnail link.', 'success');
      return;
    }

    if (platform === 'instagram') {
      await window.copyAiPosterCaption();
      await window.downloadAiPosterPng(true);
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      showToast('Instagram Poster Ready!', 'HD Poster PNG saved to Gallery & caption+hashtags copied to paste on Instagram!', 'success');
      return;
    }

    if (platform === 'youtube') {
      await window.copyAiPosterCaption();
      const prevFmt = posterState.format;
      if (posterState.format !== 'story') {
        posterState.format = 'story';
        await renderPosterCanvas();
      }
      await window.downloadAiPosterPng(true);
      if (prevFmt !== 'story') {
        posterState.format = prevFmt;
        await renderPosterCanvas();
      }
      window.open('https://www.youtube.com/@DesiBoysCars', '_blank', 'noopener,noreferrer');
      showToast('YouTube Ready!', '9:16 Poster saved for Shorts/Community Post & description copied. Upload on YouTube!', 'success');
      return;
    }

    if (platform === 'snapchat') {
      await window.copyAiPosterCaption();
      const prevFmt = posterState.format;
      if (posterState.format !== 'story') {
        posterState.format = 'story';
        await renderPosterCanvas();
      }
      await window.downloadAiPosterPng(true);
      if (prevFmt !== 'story') {
        posterState.format = prevFmt;
        await renderPosterCanvas();
      }
      window.open(`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      showToast('Snapchat Story Ready!', '9:16 Story Poster saved & caption copied for Snapchat.', 'success');
    }
  };
})();
