// Netlify Function: Live Car Newsroom RSS Aggregator
// Powered by Google News RSS feeds for Pakistan automotive brands & Global Vehicles

const NEWSROOM_FEEDS = [
  {
    id: 'toyota',
    brand: 'Toyota',
    label: 'Toyota Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Toyota%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'suzuki',
    brand: 'Suzuki',
    label: 'Suzuki Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Suzuki%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'honda',
    brand: 'Honda',
    label: 'Honda Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Honda%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'kia',
    brand: 'Kia',
    label: 'Kia Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Kia%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'hyundai',
    brand: 'Hyundai',
    label: 'Hyundai Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Hyundai%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'daihatsu',
    brand: 'Daihatsu',
    label: 'Daihatsu Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Daihatsu%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'nissan',
    brand: 'Nissan',
    label: 'Nissan Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Nissan%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'mitsubishi',
    brand: 'Mitsubishi',
    label: 'Mitsubishi Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Mitsubishi%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'changan',
    brand: 'Changan',
    label: 'Changan Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Changan%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'proton',
    brand: 'Proton',
    label: 'Proton Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=Proton%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'mg',
    brand: 'MG',
    label: 'MG Pakistan',
    rssUrl: 'https://news.google.com/rss/search?q=MG%20Pakistan%20cars&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'auto-industry',
    brand: 'Auto Industry',
    label: 'Google News: Cars & Auto Industry',
    rssUrl: 'https://news.google.com/rss/search?q=%22automotive%20industry%22%20OR%20%22new%20car%20launch%22%20OR%20automakers%20when%3A7d&hl=en-US&gl=US&ceid=US:en'
  },
  {
    id: 'pk-auto-industry',
    brand: 'PK Auto Industry',
    label: 'Google News: Pakistan Auto Industry',
    rssUrl: 'https://news.google.com/rss/search?q=Pakistan%20auto%20industry%20OR%20PAMA%20cars%20when%3A30d&hl=en-PK&gl=PK&ceid=PK:en'
  },
  {
    id: 'ev-industry',
    brand: 'EV & Launches',
    label: 'Google News: EV & New Cars',
    rssUrl: 'https://news.google.com/rss/search?q=%22electric%20vehicle%22%20OR%20%22hybrid%20car%22%20OR%20%22car%20sales%22%20when%3A7d&hl=en-US&gl=US&ceid=US:en'
  },
  {
    id: 'global-vehicles',
    brand: 'Google Vehicles',
    label: 'Google News Vehicles Topic',
    rssUrl: 'https://news.google.com/rss/topics/CAAqIAgKIhpDQkFTRFFvSEwyMHZNR3MwYWhJQ1pXNG9BQVAB?hl=en-US&gl=US&ceid=US%3Aen'
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

function extractXmlTag(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(re);
  if (!match) return '';
  return match[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').trim();
}

function makeShortId(str = '') {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

async function fetchRssChannel(feedCfg) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(feedCfg.rssUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesiHoodCarsNewsroomBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      }
    });

    if (!res.ok) {
      return {
        ...feedCfg,
        ok: false,
        status: res.status,
        items: [],
        error: `HTTP ${res.status}`
      };
    }

    const xml = await res.text();
    const items = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/gi;
    const maxItems = (feedCfg.id === 'auto-industry' || feedCfg.id === 'pk-auto-industry' || feedCfg.id === 'ev-industry' || feedCfg.id === 'global-vehicles') ? 6 : 4;
    let m;

    while ((m = itemRe.exec(xml)) !== null && items.length < maxItems) {
      const block = m[1];
      const rawTitle = decodeHtmlEntities(extractXmlTag(block, 'title'));
      const link = decodeHtmlEntities(extractXmlTag(block, 'link'));
      const guid = extractXmlTag(block, 'guid') || link || rawTitle;
      const pubDateRaw = extractXmlTag(block, 'pubDate');
      const sourceMatch = block.match(/<source[^>]*url=["']([^"']*)["'][^>]*>([\s\S]*?)<\/source>/i);
      const sourceUrl = decodeHtmlEntities(sourceMatch ? sourceMatch[1] : '');
      const sourceName = decodeHtmlEntities(sourceMatch ? sourceMatch[2] : 'Google News');

      const title = sourceName && rawTitle.endsWith(` - ${sourceName}`)
        ? rawTitle.slice(0, -(` - ${sourceName}`).length).trim()
        : rawTitle;

      const rawDesc = decodeHtmlEntities(extractXmlTag(block, 'description'));
      const relatedHeadlines = [];
      const liRe = /<a[^>]*>([\s\S]*?)<\/a>(?:\s*&nbsp;\s*<font[^>]*>([\s\S]*?)<\/font>)?/gi;
      let lm;
      while ((lm = liRe.exec(rawDesc)) !== null && relatedHeadlines.length < 3) {
        const subHeadline = decodeHtmlEntities(lm[1].replace(/<[^>]+>/g, ' '));
        const subSource = decodeHtmlEntities((lm[2] || '').replace(/<[^>]+>/g, ' '));
        if (subHeadline && subHeadline.toLowerCase() !== title.toLowerCase()) {
          relatedHeadlines.push(subSource ? `${subHeadline} (${subSource})` : subHeadline);
        }
      }

      const parsedDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
      const timestamp = isNaN(parsedDate.getTime()) ? Date.now() : parsedDate.getTime();
      const publishedDate = new Date(timestamp).toISOString().split('T')[0];

      if (title && link) {
        items.push({
          id: `${feedCfg.id}-${makeShortId(guid)}`,
          brandId: feedCfg.id,
          brand: feedCfg.brand,
          title,
          link,
          pubDate: pubDateRaw,
          publishedDate,
          timestamp,
          sourceName,
          sourceUrl,
          relatedHeadlines
        });
      }
    }

    return {
      ...feedCfg,
      ok: true,
      status: res.status,
      items
    };
  } catch (err) {
    return {
      ...feedCfg,
      ok: false,
      status: 0,
      items: [],
      error: err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'RSS fetch failed')
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async () => {
  const channels = await Promise.all(NEWSROOM_FEEDS.map(fetchRssChannel));
  const stories = channels
    .flatMap(c => c.items || [])
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return Response.json(
    {
      fetchedAt: new Date().toISOString(),
      channels: channels.map(({ id, brand, label, rssUrl, ok, status, error, items }) => ({
        id,
        brand,
        label,
        rssUrl,
        ok,
        status,
        error: error || '',
        count: (items || []).length
      })),
      stories
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=180'
      }
    }
  );
};
