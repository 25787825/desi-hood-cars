// Netlify Function: Live Auto News Metadata Fetcher for Global Automaker Portals

const BRAND_SOURCES = [
  {
    id: 'mercedes',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-Benz Media',
    url: 'https://media.mercedes-benz.com/',
    badge: 'Official Media Room'
  },
  {
    id: 'bmw',
    brand: 'BMW Group',
    name: 'BMW Group News',
    url: 'https://www.bmwgroup.com/en.html',
    badge: 'Official Group Portal'
  },
  {
    id: 'rangerover',
    brand: 'Range Rover',
    name: 'Range Rover Official',
    url: 'https://www.rangerover.com/en-xi/index.html',
    badge: 'Official Brand Hub'
  },
  {
    id: 'toyota-global',
    brand: 'Toyota Global',
    name: 'Toyota Global Newsroom',
    url: 'https://global.toyota/en/',
    badge: 'Official Global Portal'
  },
  {
    id: 'toyota-indus',
    brand: 'Toyota Indus Pakistan',
    name: 'Toyota Indus Motor (IMC)',
    url: 'https://toyota-indus.com/',
    badge: 'Official Pakistan Portal'
  },
  {
    id: 'honda-global',
    brand: 'Honda Global',
    name: 'Honda Global Newsroom',
    url: 'https://global.honda/en/',
    badge: 'Official Global Portal'
  },
  {
    id: 'suzuki-global',
    brand: 'Suzuki Global',
    name: 'Global Suzuki News',
    url: 'https://www.globalsuzuki.com/',
    badge: 'Official Global Portal'
  },
  {
    id: 'byd-global',
    brand: 'BYD',
    name: 'BYD Official Global',
    url: 'https://www.byd.com/en',
    badge: 'Official EV Portal'
  },
  {
    id: 'gwm-global',
    brand: 'GWM Global',
    name: 'GWM Global News',
    url: 'https://www.gwm-global.com/',
    badge: 'Official Global Portal'
  },
  {
    id: 'mg-pakistan',
    brand: 'MG Motors Pakistan',
    name: 'MG Motors Pakistan',
    url: 'https://mgmotors.com.pk/',
    badge: 'Official Pakistan Portal'
  },
  {
    id: 'ford-global',
    brand: 'Ford',
    name: 'Ford Official',
    url: 'https://www.ford.com/',
    badge: 'Official Portal'
  },
  {
    id: 'lexus-global',
    brand: 'Lexus',
    name: 'Lexus Official',
    url: 'https://www.lexus.com/',
    badge: 'Official Luxury Portal'
  },
  {
    id: 'kia-global',
    brand: 'Kia Worldwide',
    name: 'Kia Worldwide Newsroom',
    url: 'https://worldwide.kia.com/en/newsroom',
    badge: 'Official Global Newsroom'
  },
  {
    id: 'hyundai-nishat',
    brand: 'Hyundai Nishat PK',
    name: 'Hyundai Nishat Pakistan',
    url: 'https://hyundai-nishat.com/',
    badge: 'Official Pakistan Portal'
  },
  {
    id: 'chevrolet-global',
    brand: 'Chevrolet',
    name: 'Chevrolet Official',
    url: 'https://www.chevrolet.com/',
    badge: 'Official Portal'
  },
  {
    id: 'hyundai-worldwide',
    brand: 'Hyundai Worldwide',
    name: 'Hyundai Worldwide',
    url: 'https://www.hyundai.com/worldwide/en',
    badge: 'Official Global Portal'
  }
];

function decodeHtmlEntities(str = '') {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&hellip;/gi, '...')
    .replace(/&raquo;|&laquo;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, attrName, attrValue) {
  const re = new RegExp(
    `<meta[^>]+${attrName}=["']${attrValue}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+${attrName}=["']${attrValue}["']`,
    'i'
  );
  const match = html.match(re);
  return decodeHtmlEntities(match ? (match[1] || match[2] || '') : '');
}

function extractHeadlines(html) {
  const titles = [];
  const seen = new Set();
  const re = /<(?:h1|h2|h3)[^>]*>([\s\S]*?)<\/(?:h1|h2|h3)>/gi;
  let m;
  while ((m = re.exec(html)) !== null && titles.length < 4) {
    const stripped = m[1]
      .replace(/<(?:style|script|svg)[\s\S]*?<\/(?:style|script|svg)>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    const clean = decodeHtmlEntities(stripped);
    if (
      clean.length >= 16 &&
      clean.length <= 160 &&
      !/\{|\}|\.cls-|ダミー/.test(clean) &&
      !seen.has(clean.toLowerCase())
    ) {
      seen.add(clean.toLowerCase());
      titles.push(clean);
    }
  }
  return titles;
}

async function fetchBrandFeed(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4200);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesiHoodCarsAutoNewsBot/1.0; +https://desi-hood-cars-ahmad-raza.netlify.app/)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      return {
        ...source,
        ok: false,
        status: res.status,
        title: '',
        description: '',
        headlines: [],
        error: `HTTP ${res.status}`
      };
    }

    const html = (await res.text()).slice(0, 180000);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = decodeHtmlEntities(titleMatch ? titleMatch[1] : '');
    const ogTitle = extractMeta(html, 'property', 'og:title');
    const description =
      extractMeta(html, 'property', 'og:description') ||
      extractMeta(html, 'name', 'description');
    const headlines = extractHeadlines(html);

    return {
      ...source,
      ok: true,
      status: res.status,
      title: ogTitle || title,
      description,
      headlines
    };
  } catch (err) {
    return {
      ...source,
      ok: false,
      status: 0,
      title: '',
      description: '',
      headlines: [],
      error: err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'Fetch unavailable')
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async () => {
  const feeds = await Promise.all(BRAND_SOURCES.map(fetchBrandFeed));
  return Response.json(
    {
      fetchedAt: new Date().toISOString(),
      feeds
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300'
      }
    }
  );
};
