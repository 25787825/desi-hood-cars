// Netlify Function: New Cars (2024-2026) API Proxy & Live Currency Exchange Engine (API-Ninjas)

const API_NINJAS_BASE = 'https://api.api-ninjas.com/v1';
const API_NINJAS_KEY = process.env.API_NINJAS_KEY || 'RljHIbcX1gBVtmq6WzjZgmbfOE1bUsEzfTEGy2Xw';

const DEFAULT_RATES = {
  USD: 1,
  PKR: 278.5,
  AED: 3.6725,
  EUR: 0.92
};

const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
]);

const CATALOG_QUERIES = [
  { year: 2025, make: 'honda' },
  { year: 2025, make: 'bmw' },
  { year: 2025, make: 'toyota' },
  { year: 2025, make: 'audi' },
  { year: 2025, make: 'mercedes-benz' },
  { year: 2025, make: 'porsche' },
  { year: 2025, make: 'kia' },
  { year: 2025, make: 'hyundai' },
  { year: 2024, make: 'toyota' },
  { year: 2024, make: 'jaguar' },
  { year: 2024, make: 'ford' },
  { year: 2024, make: 'chevrolet' },
  { year: 2024, make: 'lexus' },
  { year: 2026, make: 'toyota' },
  { year: 2026, make: 'bmw' }
];

function recommendCurrencyForCountry(countryCode = 'PK') {
  const cc = String(countryCode || '').toUpperCase();
  if (cc === 'PK') return 'PKR';
  if (cc === 'AE') return 'AED';
  if (EU_COUNTRIES.has(cc)) return 'EUR';
  if (cc === 'US') return 'USD';
  return 'PKR';
}

async function fetchJsonWithTimeout(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'X-Api-Key': API_NINJAS_KEY,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLiveExchangeRates() {
  const pairs = ['USD_PKR', 'USD_AED', 'USD_EUR'];
  const results = await Promise.all(
    pairs.map(pair => fetchJsonWithTimeout(`${API_NINJAS_BASE}/exchangerate?pair=${pair}`, 4000))
  );

  const rates = { ...DEFAULT_RATES };
  let liveRatesCount = 0;

  results.forEach(item => {
    if (item && item.currency_pair && typeof item.exchange_rate === 'number') {
      const target = item.currency_pair.split('_')[1];
      if (target && item.exchange_rate > 0) {
        rates[target] = item.exchange_rate;
        liveRatesCount++;
      }
    }
  });

  return {
    liveRatesOk: liveRatesCount > 0,
    rates
  };
}

function formatTitleCase(str = '') {
  return String(str)
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildEngineLabel(car) {
  const parts = [];
  if (typeof car.displacement === 'number' && car.displacement > 0) {
    parts.push(`${car.displacement.toFixed(1)}L`);
  }
  if (typeof car.cylinders === 'number' && car.cylinders > 0) {
    parts.push(`${car.cylinders}-Cyl`);
  }
  if (car.fuel_type) {
    const ft = String(car.fuel_type).toLowerCase();
    parts.push(ft === 'gas' ? 'Petrol' : formatTitleCase(ft));
  }
  if (car.transmission) {
    parts.push(car.transmission === 'a' ? 'Automatic' : car.transmission === 'm' ? 'Manual' : formatTitleCase(car.transmission));
  }
  return parts.join(' • ') || 'Factory New Spec';
}

export default async (req, context) => {
  const urlObj = new URL(req.url);
  const queryMake = (urlObj.searchParams.get('make') || '').trim().toLowerCase();
  const queryYear = parseInt(urlObj.searchParams.get('year') || '0', 10);

  const countryHeader =
    context?.geo?.country?.code ||
    req.headers.get('x-country') ||
    req.headers.get('cf-ipcountry') ||
    'PK';

  const queries = queryMake
    ? ([2024, 2025, 2026].includes(queryYear)
        ? [{ year: queryYear, make: queryMake }]
        : [{ year: 2025, make: queryMake }, { year: 2024, make: queryMake }, { year: 2026, make: queryMake }])
    : ([2024, 2025, 2026].includes(queryYear)
        ? CATALOG_QUERIES.filter(q => q.year === queryYear)
        : CATALOG_QUERIES);

  const [fxResult, ...carResponses] = await Promise.all([
    fetchLiveExchangeRates(),
    ...queries.map(q =>
      fetchJsonWithTimeout(`${API_NINJAS_BASE}/cars?year=${q.year}&make=${encodeURIComponent(q.make)}`, 4500)
    )
  ]);

  const seen = new Set();
  const apiCars = [];

  carResponses.forEach(list => {
    if (!Array.isArray(list)) return;
    list.forEach(raw => {
      const yr = Number(raw.year);
      if (yr !== 2024 && yr !== 2025 && yr !== 2026) return;
      const make = formatTitleCase(raw.make || '');
      const model = formatTitleCase(raw.model || '');
      if (!make || !model) return;
      const key = `${yr}|${make.toLowerCase()}|${model.toLowerCase()}|${raw.displacement || ''}`;
      if (seen.has(key)) return;
      seen.add(key);

      apiCars.push({
        id: `ninjas-${yr}-${make.toLowerCase().replace(/[^a-z0-9]/g, '')}-${model.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        year: yr,
        make,
        model,
        name: `${yr} ${make} ${model}`,
        className: formatTitleCase(raw.class || 'New Model'),
        drive: raw.drive ? String(raw.drive).toUpperCase() : 'FWD/AWD',
        fuelType: raw.fuel_type === 'gas' ? 'Petrol' : formatTitleCase(raw.fuel_type || 'Petrol'),
        engine: buildEngineLabel(raw),
        source: 'API-Ninjas'
      });
    });
  });

  apiCars.sort((a, b) => b.year - a.year || a.make.localeCompare(b.make));

  return Response.json(
    {
      fetchedAt: new Date().toISOString(),
      detectedCountry: countryHeader,
      recommendedCurrency: recommendCurrencyForCountry(countryHeader),
      liveRatesOk: fxResult.liveRatesOk,
      rates: fxResult.rates,
      apiCars
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=180'
      }
    }
  );
};
