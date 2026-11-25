// Vercel Function: Official YouTube Channel RSS Feed (@DesiBoysCars / Desi Hood Cars)

const YT_CHANNEL_ID = 'UCWKBK7BDWRUyAdVWxLt4t1w';
const YT_HANDLE = '@DesiBoysCars';
const YT_CHANNEL_URL = 'https://www.youtube.com/@DesiBoysCars';
const YT_SUBSCRIBE_URL = 'https://www.youtube.com/@DesiBoysCars?sub_confirmation=1';
const YT_RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

function decodeXmlEntities(str = '') {
  return String(str)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block, tagName) {
  const escaped = tagName.replace(':', '\\:');
  const re = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  const m = block.match(re);
  return m ? decodeXmlEntities(m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1')) : '';
}

export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5500);

  try {
    const res = await fetch(YT_RSS_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesiHoodCarsYouTubeBot/1.0)',
        'Accept': 'application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      }
    });

    if (!res.ok) {
      console.error('YouTube RSS HTTP error:', res.status);
      return Response.json(
        {
          ok: false,
          channelId: YT_CHANNEL_ID,
          handle: YT_HANDLE,
          channelTitle: 'Desi Hood Cars',
          channelUrl: YT_CHANNEL_URL,
          subscribeUrl: YT_SUBSCRIBE_URL,
          videos: [],
          error: `HTTP ${res.status}`
        },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const videos = [];
    const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
    let m;

    while ((m = entryRe.exec(xml)) !== null && videos.length < 15) {
      const entry = m[1];
      const videoId = extractTag(entry, 'yt:videoId');
      const title = extractTag(entry, 'title');
      const publishedRaw = extractTag(entry, 'published');
      const description = extractTag(entry, 'media:description');
      const thumbMatch = entry.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      const viewsMatch = entry.match(/<media:statistics[^>]+views=["']([^"']+)["']/i);

      const publishedDate = publishedRaw ? publishedRaw.split('T')[0] : '';
      const thumbnail = thumbMatch ? thumbMatch[1] : (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
      const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : YT_CHANNEL_URL;
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

      if (videoId && title) {
        videos.push({
          videoId,
          title,
          url,
          embedUrl,
          thumbnail,
          publishedRaw,
          publishedDate,
          views: viewsMatch ? Number(viewsMatch[1]) : 0,
          description: description.slice(0, 260)
        });
      }
    }

    return Response.json(
      {
        ok: true,
        fetchedAt: new Date().toISOString(),
        channelId: YT_CHANNEL_ID,
        handle: YT_HANDLE,
        channelTitle: 'Desi Hood Cars',
        channelUrl: YT_CHANNEL_URL,
        subscribeUrl: YT_SUBSCRIBE_URL,
        videos
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300'
        }
      }
    );
  } catch (err) {
    console.error('youtube GET failed:', err);
    return Response.json(
      {
        ok: false,
        channelId: YT_CHANNEL_ID,
        handle: YT_HANDLE,
        channelTitle: 'Desi Hood Cars',
        channelUrl: YT_CHANNEL_URL,
        subscribeUrl: YT_SUBSCRIBE_URL,
        videos: [],
        error: err?.message || 'YouTube feed unavailable'
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timer);
  }
}
