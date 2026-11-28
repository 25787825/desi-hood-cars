const SITE_ORIGIN = 'https://desi-hood-cars.vercel.app';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/gallery/gallery-1.jpg`;

const BUILTIN_BLOGS = {
  'blog-1': {
    title: '2026 Bugatti Tourbillon V16: The Mechanical Masterpiece Inside 1,800 HP',
    description: 'Dihedral butterfly doors, Swiss skeletonized gauges, and 8.3L V16 hybrid architecture.',
    image: `${SITE_ORIGIN}/gallery/gallery-1.jpg`
  },
  'blog-2': {
    title: 'Audi RS e-tron Concept Black: Future of Stealth Electric Performance',
    description: 'Vertical scissor studio doors, 920 HP dual motors, and stealth diamond-matrix LEDs.',
    image: `${SITE_ORIGIN}/gallery/gallery-2.jpg`
  },
  'blog-3': {
    title: 'Complete Car Buying & Inspection Checklist for 2026 (PKR & Global Markets)',
    description: 'Verify auction sheets, VIN history, customs clearance, and dealer records before buying.',
    image: `${SITE_ORIGIN}/gallery/gallery-3.jpg`
  },
  'blog-4': {
    title: 'Top Spare Parts Upgrades: Carbon-Ceramic Brakes & Titanium Exhausts',
    description: 'Genuine OEM and motorsport components delivering weight reduction and zero fade.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
  }
};

function escapeHtml(val = '') {
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeImageUrl(rawImg = '') {
  const val = String(rawImg || '').trim();
  if (!val || val.startsWith('data:') || val.length > 1000) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(val)) return val;
  if (val.startsWith('//')) return `https:${val}`;
  const cleanRel = val.replace(/^\/+/, '');
  return `${SITE_ORIGIN}/${cleanRel}`;
}

export default function handler(req, res) {
  const q = req.query || {};
  const articleId = String(q.article || q.id || '').trim();
  const builtin = BUILTIN_BLOGS[articleId] || null;

  const title = String(q.title || builtin?.title || 'Desi Hood Cars | Automotive News & Reviews').slice(0, 180);
  const desc = String(q.desc || builtin?.description || 'Latest car reviews, automotive industry news & verified showroom listings on Desi Hood Cars.').slice(0, 300);
  const image = normalizeImageUrl(q.img || builtin?.image || DEFAULT_IMAGE);

  const destUrl = articleId
    ? `${SITE_ORIGIN}/auto-news-blogs?article=${encodeURIComponent(articleId)}`
    : `${SITE_ORIGIN}/auto-news-blogs`;

  const shareUrl = `${SITE_ORIGIN}${req.url || '/share'}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Desi Hood Cars</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${escapeHtml(destUrl)}">

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Desi Hood Cars">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">

  <meta http-equiv="refresh" content="0;url=${escapeHtml(destUrl)}">
  <script>window.location.replace(${JSON.stringify(destUrl)});</script>
</head>
<body style="background:#060608;color:#f1f5f9;font-family:Arial,sans-serif;padding:32px;text-align:center;">
  <div style="max-width:640px;margin:40px auto;background:#0f172a;border:1px solid #334155;border-radius:18px;overflow:hidden;">
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="width:100%;max-height:340px;object-fit:cover;display:block;">
    <div style="padding:24px;">
      <h1 style="font-size:22px;margin:0 0 10px;color:#fff;">${escapeHtml(title)}</h1>
      <p style="font-size:14px;color:#cbd5e1;margin:0 0 20px;">${escapeHtml(desc)}</p>
      <a href="${escapeHtml(destUrl)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#ef4444;color:#fff;font-weight:700;text-decoration:none;">Read Full Story on Desi Hood Cars &rarr;</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
}
