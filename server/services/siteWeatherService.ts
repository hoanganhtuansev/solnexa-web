
export interface SiteLocation {
  lat: number;
  lon: number;
  prefecture: string | null;
  municipality: string | null;
  locality: string | null;
  municipalityCode: string | null;
  elevationM: number | null;
}

export interface VerticalSnowResult {
  status: 'verified' | 'not_covered_v1' | 'outside_japan' | 'error';
  depthCm: number | null;
  rule: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  note: string | null;
}

export interface AmedasStationResult {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  altitudeM: number | null;
  distanceKm: number;
}

export interface AmedasObservationResult {
  observedAt: string | null;
  station: AmedasStationResult | null;
  temperatureC: number | null;
  precipitation1hMm: number | null;
  precipitation24hMm: number | null;
  humidityPercent: number | null;
  windSpeedMs: number | null;
  windDirectionCode: number | null;
  windDirectionLabel: string | null;
  pressureHpa: number | null;
  snowDepthCm: number | null;
  snow24hCm: number | null;
  snowStation: AmedasStationResult | null;
  snowStationDepthCm: number | null;
  snowStation24hCm: number | null;
}

export interface ForecastDay {
  date: string;
  weather: string | null;
  weatherCode: string | null;
  wind: string | null;
  popPercent: number | null;
  tempMinC: number | null;
  tempMaxC: number | null;
}

export interface ForecastResult {
  officeCode: string | null;
  officeName: string | null;
  forecastAreaCode: string | null;
  forecastAreaName: string | null;
  reportDatetime: string | null;
  days: ForecastDay[];
}

export interface SiteWeatherResult {
  location: SiteLocation;
  verticalSnow: VerticalSnowResult;
  amedas: AmedasObservationResult;
  forecast: ForecastResult;
  siteNotes: Array<{
    level: 'info' | 'caution' | 'warning';
    text: string;
  }>;
  sources: Array<{
    label: string;
    url: string;
  }>;
}

type JsonRecord = Record<string, any>;

const GSI_REVERSE_URL = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress';
const GSI_ELEVATION_URL = 'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php';
const GSI_MUNI_URL = 'https://maps.gsi.go.jp/js/muni.js';
const GSI_ADDRESS_SEARCH_URL = 'https://msearch.gsi.go.jp/address-search/AddressSearch';
const JMA_AREA_URL = 'https://www.jma.go.jp/bosai/common/const/area.json';
const JMA_AMEDAS_STATIONS_URL = 'https://www.jma.go.jp/bosai/amedas/const/amedastable.json';
const JMA_AMEDAS_LATEST_URL = 'https://www.jma.go.jp/bosai/amedas/data/latest_time.txt';
const JMA_AMEDAS_MAP_BASE = 'https://www.jma.go.jp/bosai/amedas/data/map';
const JMA_FORECAST_BASE = 'https://www.jma.go.jp/bosai/forecast/data/forecast';

const FETCH_TIMEOUT_MS = 10000;

let muniMapPromise: Promise<Record<string, { prefecture: string; municipality: string }>> | null = null;
let jmaAreaPromise: Promise<JsonRecord> | null = null;
let amedasStationsPromise: Promise<JsonRecord> | null = null;

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'User-Agent': 'SOLNEXA-SiteWeather/1.0 (+https://solnexa-web.vercel.app/)',
        ...(init.headers || {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson<T = any>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  return (await res.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetchWithTimeout(url, { headers: { Accept: 'text/plain,*/*' } });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  return res.text();
}

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function extractAmedasValue(raw: unknown): number | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return toFiniteNumber(raw[0]);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function windDirectionLabel(code: number | null): string | null {
  if (code == null) return null;
  const labels = [
    '静穏',
    '北北東',
    '北東',
    '東北東',
    '東',
    '東南東',
    '南東',
    '南南東',
    '南',
    '南南西',
    '南西',
    '西南西',
    '西',
    '西北西',
    '北西',
    '北北西',
    '北'
  ];
  return labels[code] ?? null;
}

async function getMunicipalityMap(): Promise<Record<string, { prefecture: string; municipality: string }>> {
  if (!muniMapPromise) {
    muniMapPromise = (async () => {
      const text = await fetchText(GSI_MUNI_URL);
      const out: Record<string, { prefecture: string; municipality: string }> = {};
      const regex = /GSI\.MUNI_ARRAY\["(\d+)"\]\s*=\s*'([^']+)'/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const parts = match[2].split(',');
        if (parts.length >= 4) {
          out[match[1]] = {
            prefecture: parts[1].trim(),
            municipality: parts.slice(3).join(',').trim()
          };
        }
      }
      return out;
    })().catch(err => {
      muniMapPromise = null;
      throw err;
    });
  }
  return muniMapPromise;
}

async function getJmaAreaData(): Promise<JsonRecord> {
  if (!jmaAreaPromise) {
    jmaAreaPromise = fetchJson<JsonRecord>(JMA_AREA_URL).catch(err => {
      jmaAreaPromise = null;
      throw err;
    });
  }
  return jmaAreaPromise;
}

async function getAmedasStations(): Promise<JsonRecord> {
  if (!amedasStationsPromise) {
    amedasStationsPromise = fetchJson<JsonRecord>(JMA_AMEDAS_STATIONS_URL).catch(err => {
      amedasStationsPromise = null;
      throw err;
    });
  }
  return amedasStationsPromise;
}

export async function geocodeJapaneseAddress(query: string): Promise<{ lat: number; lon: number; title: string } | null> {
  const q = query.trim();
  if (!q) return null;
  const url = GSI_ADDRESS_SEARCH_URL + '?q=' + encodeURIComponent(q);
  const data = await fetchJson<any[]>(url);
  if (!Array.isArray(data) || data.length === 0) return null;

  const first = data[0];
  const coords = first?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lon = toFiniteNumber(coords[0]);
  const lat = toFiniteNumber(coords[1]);
  if (lat == null || lon == null) return null;

  return {
    lat,
    lon,
    title: String(first?.properties?.title || q)
  };
}

async function reverseGeocode(lat: number, lon: number): Promise<{
  municipalityCode: string | null;
  prefecture: string | null;
  municipality: string | null;
  locality: string | null;
}> {
  try {
    const data = await fetchJson<JsonRecord>(
      GSI_REVERSE_URL + '?lat=' + encodeURIComponent(String(lat)) + '&lon=' + encodeURIComponent(String(lon))
    );
    const municipalityCode = data?.results?.muniCd ? String(data.results.muniCd) : null;
    const locality = data?.results?.lv01Nm ? String(data.results.lv01Nm) : null;

    if (municipalityCode) {
      const map = await getMunicipalityMap();
      const muni = map[municipalityCode];
      if (muni) {
        return {
          municipalityCode,
          prefecture: muni.prefecture,
          municipality: muni.municipality,
          locality
        };
      }
    }
  } catch (err) {
    console.warn('[site-weather] GSI reverse geocoder failed:', err);
  }

  return {
    municipalityCode: null,
    prefecture: null,
    municipality: null,
    locality: null
  };
}

async function getElevation(lat: number, lon: number): Promise<number | null> {
  try {
    const data = await fetchJson<JsonRecord>(
      GSI_ELEVATION_URL +
        '?lon=' +
        encodeURIComponent(String(lon)) +
        '&lat=' +
        encodeURIComponent(String(lat)) +
        '&outtype=JSON'
    );
    return toFiniteNumber(data?.elevation);
  } catch (err) {
    console.warn('[site-weather] GSI elevation failed:', err);
    return null;
  }
}

function evaluateNaraSnow(municipality: string | null, elevationM: number | null): VerticalSnowResult {
  const sourceUrl = 'https://www.pref.nara.lg.jp/n155/65562.html';
  const sourceLabel = '奈良県 建築基準法施行細則第20条（垂直積雪量について）';

  if (!municipality || elevationM == null) {
    return {
      status: 'error',
      depthCm: null,
      rule: null,
      sourceLabel,
      sourceUrl,
      note: '市区町村または標高を取得できないため判定できません。'
    };
  }

  // Cities with their own authority are intentionally not inferred from the prefectural fallback.
  if (['奈良市', '橿原市', '生駒市'].includes(municipality)) {
    return {
      status: 'not_covered_v1',
      depthCm: null,
      rule: null,
      sourceLabel,
      sourceUrl,
      note: municipality + 'は奈良県表の「その他の区域」から除外されているため、V1では自動判定しません。'
    };
  }

  const group30 = [
    '大和高田市',
    '大和郡山市',
    '天理市',
    '桜井市',
    '御所市',
    '香芝市',
    '葛城市',
    '平群町',
    '三郷町',
    '斑鳩町',
    '安堵町',
    '川西町',
    '三宅町',
    '田原本町',
    '高取町',
    '明日香村',
    '上牧町',
    '王寺町',
    '広陵町',
    '河合町',
    '吉野町',
    '大淀町',
    '下市町',
    '十津川村'
  ];

  const group40 = ['山添村', '東吉野村', '下北山村'];
  const group50 = ['曽爾村', '黒滝村', '上北山村', '川上村'];
  const specialThresholds: Array<{ names: string[]; max: number; depth: number }> = [
    { names: group30, max: 220, depth: 30 },
    { names: group40, max: 330, depth: 40 },
    { names: group50, max: 440, depth: 50 },
    { names: ['御杖村'], max: 550, depth: 60 },
    { names: ['天川村'], max: 660, depth: 70 },
    { names: ['野迫川村'], max: 880, depth: 90 }
  ];

  const matched = specialThresholds.find(item => item.names.includes(municipality) && elevationM <= item.max);
  if (matched) {
    return {
      status: 'verified',
      depthCm: matched.depth,
      rule: municipality + '・標高 ' + elevationM.toFixed(1) + 'm ≤ ' + matched.max + 'm → ' + matched.depth + 'cm',
      sourceLabel,
      sourceUrl,
      note: '奈良県公式の地域・標高区分による値です。'
    };
  }

  // 五條市 and 宇陀市 contain legacy-area exceptions that cannot be resolved by current municipality code alone.
  if (['五條市', '宇陀市'].includes(municipality)) {
    return {
      status: 'not_covered_v1',
      depthCm: null,
      rule: null,
      sourceLabel,
      sourceUrl,
      note: municipality + 'は旧市町村区域による例外があるため、V1では自動判定を停止します。'
    };
  }

  // Nara prefecture fallback: d = 0.0009 * H + 0.21 [m], truncate below first decimal place in meters.
  // Official text: 小数点以下第一位未満の端数を切り捨てる.
  const rawM = 0.0009 * elevationM + 0.21;
  const truncatedM = Math.floor(rawM * 10) / 10;
  const depthCm = Math.round(truncatedM * 100);

  return {
    status: 'verified',
    depthCm,
    rule:
      'その他の区域: d = 0.0009 × ' +
      elevationM.toFixed(1) +
      ' + 0.21 = ' +
      rawM.toFixed(3) +
      'm → 0.1m未満切捨て = ' +
      truncatedM.toFixed(1) +
      'm',
    sourceLabel,
    sourceUrl,
    note: '奈良県公式の「その他の区域」算定式による値です。'
  };
}

function evaluateVerticalSnow(
  prefecture: string | null,
  municipality: string | null,
  elevationM: number | null
): VerticalSnowResult {
  if (!prefecture) {
    return {
      status: 'error',
      depthCm: null,
      rule: null,
      sourceLabel: null,
      sourceUrl: null,
      note: '所在地を特定できませんでした。'
    };
  }

  if (prefecture === '奈良県') {
    return evaluateNaraSnow(municipality, elevationM);
  }

  return {
    status: 'not_covered_v1',
    depthCm: null,
    rule: null,
    sourceLabel: null,
    sourceUrl: null,
    note:
      prefecture +
      'の特定行政庁ルールはV1データセット未登録です。気象データは利用できますが、垂直積雪量は推測しません。'
  };
}

function parseStation(code: string, info: JsonRecord, lat: number, lon: number): AmedasStationResult | null {
  const latArr = info?.lat;
  const lonArr = info?.lon;
  if (!Array.isArray(latArr) || !Array.isArray(lonArr) || latArr.length < 2 || lonArr.length < 2) return null;

  const stationLat = Number(latArr[0]) + Number(latArr[1]) / 60;
  const stationLon = Number(lonArr[0]) + Number(lonArr[1]) / 60;
  if (!Number.isFinite(stationLat) || !Number.isFinite(stationLon)) return null;

  return {
    code,
    name: String(info?.kjName || info?.enName || code),
    latitude: stationLat,
    longitude: stationLon,
    altitudeM: toFiniteNumber(info?.alt),
    distanceKm: Number(haversineKm(lat, lon, stationLat, stationLon).toFixed(1))
  };
}

function latestTimeToMapKey(latest: string): string {
  const m = latest.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!m) throw new Error('Unexpected JMA latest_time format: ' + latest);
  return m.slice(1).join('');
}

async function fetchAmedas(lat: number, lon: number): Promise<AmedasObservationResult> {
  const empty: AmedasObservationResult = {
    observedAt: null,
    station: null,
    temperatureC: null,
    precipitation1hMm: null,
    precipitation24hMm: null,
    humidityPercent: null,
    windSpeedMs: null,
    windDirectionCode: null,
    windDirectionLabel: null,
    pressureHpa: null,
    snowDepthCm: null,
    snow24hCm: null,
    snowStation: null,
    snowStationDepthCm: null,
    snowStation24hCm: null
  };

  try {
    const [stationTable, latestText] = await Promise.all([getAmedasStations(), fetchText(JMA_AMEDAS_LATEST_URL)]);
    const mapKey = latestTimeToMapKey(latestText);
    const observations = await fetchJson<JsonRecord>(JMA_AMEDAS_MAP_BASE + '/' + mapKey + '.json');

    const stations = Object.entries(stationTable)
      .map(([code, info]) => parseStation(code, info as JsonRecord, lat, lon))
      .filter((x): x is AmedasStationResult => Boolean(x))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const primary = stations.find(s => observations[s.code]);
    const snowStation = stations.find(s => {
      const obs = observations[s.code];
      return obs && (Array.isArray(obs.snow) || Array.isArray(obs.snow24h));
    });

    const obs = primary ? observations[primary.code] : null;
    const snowObs = snowStation ? observations[snowStation.code] : null;

    const windDirectionCode = extractAmedasValue(obs?.windDirection);

    return {
      observedAt: latestText.trim(),
      station: primary || null,
      temperatureC: extractAmedasValue(obs?.temp),
      precipitation1hMm: extractAmedasValue(obs?.precipitation1h),
      precipitation24hMm: extractAmedasValue(obs?.precipitation24h),
      humidityPercent: extractAmedasValue(obs?.humidity),
      windSpeedMs: extractAmedasValue(obs?.wind),
      windDirectionCode,
      windDirectionLabel: windDirectionLabel(windDirectionCode),
      pressureHpa: extractAmedasValue(obs?.pressure) ?? extractAmedasValue(obs?.normalPressure),
      snowDepthCm: extractAmedasValue(obs?.snow),
      snow24hCm: extractAmedasValue(obs?.snow24h),
      snowStation: snowStation || null,
      snowStationDepthCm: extractAmedasValue(snowObs?.snow),
      snowStation24hCm: extractAmedasValue(snowObs?.snow24h)
    };
  } catch (err) {
    console.warn('[site-weather] AMeDAS fetch failed:', err);
    return empty;
  }
}

function findJmaArea(areaData: JsonRecord, municipality: string | null, prefecture: string | null): {
  officeCode: string | null;
  officeName: string | null;
  forecastAreaCode: string | null;
  forecastAreaName: string | null;
} {
  const class20s = areaData?.class20s || {};
  const class15s = areaData?.class15s || {};
  const class10s = areaData?.class10s || {};
  const offices = areaData?.offices || {};

  if (municipality) {
    const cityEntry = Object.entries(class20s).find(([, value]: any) => value?.name === municipality);
    if (cityEntry) {
      const city = cityEntry[1] as JsonRecord;
      const class15Code = city.parent || null;
      const class15 = class15Code ? class15s[class15Code] : null;
      const class10Code = class15?.parent || null;
      const class10 = class10Code ? class10s[class10Code] : null;
      const officeCode = class10?.parent || null;
      const office = officeCode ? offices[officeCode] : null;

      return {
        officeCode,
        officeName: office?.name || prefecture,
        forecastAreaCode: class10Code,
        forecastAreaName: class10?.name || null
      };
    }
  }

  if (prefecture) {
    const officeEntry = Object.entries(offices).find(([, value]: any) => value?.name === prefecture.replace(/[都府県]$/, ''));
    if (officeEntry) {
      return {
        officeCode: officeEntry[0],
        officeName: (officeEntry[1] as JsonRecord)?.name || prefecture,
        forecastAreaCode: null,
        forecastAreaName: null
      };
    }
  }

  return { officeCode: null, officeName: null, forecastAreaCode: null, forecastAreaName: null };
}

function maxPopByDate(series: JsonRecord | undefined, areaCode: string | null): Record<string, number> {
  const out: Record<string, number> = {};
  if (!series) return out;
  const times: string[] = Array.isArray(series.timeDefines) ? series.timeDefines : [];
  const areas: JsonRecord[] = Array.isArray(series.areas) ? series.areas : [];
  const area =
    areas.find(a => String(a?.area?.code || '') === String(areaCode || '')) ||
    areas[0];
  const pops: string[] = Array.isArray(area?.pops) ? area.pops : [];

  times.forEach((time, i) => {
    const date = String(time).slice(0, 10);
    const value = Number(pops[i]);
    if (Number.isFinite(value)) out[date] = Math.max(out[date] ?? 0, value);
  });
  return out;
}

async function fetchForecast(
  municipality: string | null,
  prefecture: string | null
): Promise<ForecastResult> {
  const empty: ForecastResult = {
    officeCode: null,
    officeName: null,
    forecastAreaCode: null,
    forecastAreaName: null,
    reportDatetime: null,
    days: []
  };

  try {
    const areaData = await getJmaAreaData();
    const resolved = findJmaArea(areaData, municipality, prefecture);
    if (!resolved.officeCode) return { ...empty, ...resolved };

    const raw = await fetchJson<any[]>(JMA_FORECAST_BASE + '/' + resolved.officeCode + '.json');
    if (!Array.isArray(raw) || raw.length === 0) return { ...empty, ...resolved };

    const short = raw[0] || {};
    const weekly = raw[1] || {};
    const shortSeries: JsonRecord[] = Array.isArray(short.timeSeries) ? short.timeSeries : [];
    const weeklySeries: JsonRecord[] = Array.isArray(weekly.timeSeries) ? weekly.timeSeries : [];

    const weatherSeries = shortSeries[0] || {};
    const weatherAreas: JsonRecord[] = Array.isArray(weatherSeries.areas) ? weatherSeries.areas : [];
    const weatherArea =
      weatherAreas.find(a => String(a?.area?.code || '') === String(resolved.forecastAreaCode || '')) ||
      weatherAreas[0];

    const weatherTimes: string[] = Array.isArray(weatherSeries.timeDefines) ? weatherSeries.timeDefines : [];
    const weatherCodes: string[] = Array.isArray(weatherArea?.weatherCodes) ? weatherArea.weatherCodes : [];
    const weathers: string[] = Array.isArray(weatherArea?.weathers) ? weatherArea.weathers : [];
    const winds: string[] = Array.isArray(weatherArea?.winds) ? weatherArea.winds : [];
    const shortPops = maxPopByDate(shortSeries[1], resolved.forecastAreaCode);

    const byDate: Record<string, ForecastDay> = {};

    weatherTimes.forEach((time, i) => {
      const date = String(time).slice(0, 10);
      byDate[date] = {
        date,
        weather: weathers[i] || null,
        weatherCode: weatherCodes[i] || null,
        wind: winds[i] || null,
        popPercent: shortPops[date] ?? null,
        tempMinC: null,
        tempMaxC: null
      };
    });

    // Short-term temperatures: JMA provides representative AMeDAS station values.
    const tempSeries = shortSeries[2];
    if (tempSeries) {
      const tempTimes: string[] = Array.isArray(tempSeries.timeDefines) ? tempSeries.timeDefines : [];
      const tempArea: JsonRecord | undefined = Array.isArray(tempSeries.areas) ? tempSeries.areas[0] : undefined;
      const temps: string[] = Array.isArray(tempArea?.temps) ? tempArea.temps : [];
      tempTimes.forEach((time, i) => {
        const date = String(time).slice(0, 10);
        if (!byDate[date]) return;
        const n = Number(temps[i]);
        if (!Number.isFinite(n)) return;
        // 00:00 is typically Tmin and 09:00 Tmax in the short-term feed.
        const hour = Number(String(time).slice(11, 13));
        if (hour === 0) byDate[date].tempMinC = n;
        else byDate[date].tempMaxC = n;
      });
    }

    // Weekly data extends the result to 7 days.
    const weeklyWeather = weeklySeries[0];
    if (weeklyWeather) {
      const times: string[] = Array.isArray(weeklyWeather.timeDefines) ? weeklyWeather.timeDefines : [];
      const area: JsonRecord | undefined = Array.isArray(weeklyWeather.areas) ? weeklyWeather.areas[0] : undefined;
      const codes: string[] = Array.isArray(area?.weatherCodes) ? area.weatherCodes : [];
      const pops: string[] = Array.isArray(area?.pops) ? area.pops : [];
      times.forEach((time, i) => {
        const date = String(time).slice(0, 10);
        const popN = Number(pops[i]);
        if (!byDate[date]) {
          byDate[date] = {
            date,
            weather: null,
            weatherCode: codes[i] || null,
            wind: null,
            popPercent: Number.isFinite(popN) ? popN : null,
            tempMinC: null,
            tempMaxC: null
          };
        } else if (byDate[date].popPercent == null && Number.isFinite(popN)) {
          byDate[date].popPercent = popN;
        }
      });
    }

    const weeklyTemps = weeklySeries[1];
    if (weeklyTemps) {
      const times: string[] = Array.isArray(weeklyTemps.timeDefines) ? weeklyTemps.timeDefines : [];
      const area: JsonRecord | undefined = Array.isArray(weeklyTemps.areas) ? weeklyTemps.areas[0] : undefined;
      const mins: string[] = Array.isArray(area?.tempsMin) ? area.tempsMin : [];
      const maxs: string[] = Array.isArray(area?.tempsMax) ? area.tempsMax : [];
      times.forEach((time, i) => {
        const date = String(time).slice(0, 10);
        if (!byDate[date]) return;
        const tMin = Number(mins[i]);
        const tMax = Number(maxs[i]);
        if (byDate[date].tempMinC == null && Number.isFinite(tMin)) byDate[date].tempMinC = tMin;
        if (byDate[date].tempMaxC == null && Number.isFinite(tMax)) byDate[date].tempMaxC = tMax;
      });
    }

    return {
      officeCode: resolved.officeCode,
      officeName: short.publishingOffice || resolved.officeName,
      forecastAreaCode: resolved.forecastAreaCode || weatherArea?.area?.code || null,
      forecastAreaName: resolved.forecastAreaName || weatherArea?.area?.name || null,
      reportDatetime: short.reportDatetime || null,
      days: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7)
    };
  } catch (err) {
    console.warn('[site-weather] JMA forecast failed:', err);
    return empty;
  }
}

function buildSiteNotes(
  verticalSnow: VerticalSnowResult,
  amedas: AmedasObservationResult,
  forecast: ForecastResult
): SiteWeatherResult['siteNotes'] {
  const notes: SiteWeatherResult['siteNotes'] = [];

  if (verticalSnow.status === 'verified' && verticalSnow.depthCm != null) {
    notes.push({
      level: verticalSnow.depthCm >= 100 ? 'warning' : verticalSnow.depthCm >= 50 ? 'caution' : 'info',
      text: '法定の垂直積雪量は ' + verticalSnow.depthCm + 'cm。構造計算値ではなく、サイト条件確認用の法規情報として表示しています。'
    });
  } else {
    notes.push({
      level: 'caution',
      text: '垂直積雪量は自動判定対象外です。特定行政庁の最新規定を確認してください。'
    });
  }

  const snowNow = amedas.snowStationDepthCm ?? amedas.snowDepthCm;
  const snow24 = amedas.snowStation24hCm ?? amedas.snow24hCm;
  if ((snowNow ?? 0) > 0 || (snow24 ?? 0) > 0) {
    notes.push({
      level: 'caution',
      text:
        '近傍AMeDASで積雪を観測しています' +
        (snowNow != null ? '（積雪深 ' + snowNow + 'cm）' : '') +
        (snow24 != null ? '。24時間降雪 ' + snow24 + 'cm' : '') +
        '。現地との差（標高・地形）に注意してください。'
    });
  }

  if ((amedas.windSpeedMs ?? 0) >= 10) {
    notes.push({
      level: 'warning',
      text: '近傍AMeDASの風速が 10m/s 以上です。フェンス際・機器間の吹きだまりや飛来物に注意してください。'
    });
  } else if ((amedas.windSpeedMs ?? 0) >= 5) {
    notes.push({
      level: 'caution',
      text: 'やや強い風が観測されています。降雪時は局所的な吹きだまりに注意してください。'
    });
  }

  const minForecast = forecast.days
    .map(d => d.tempMinC)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (minForecast.length > 0 && Math.min(...minForecast) <= 0) {
    notes.push({
      level: 'caution',
      text: '7日予報に 0℃以下の最低気温が含まれます。排水・配管・ドレン・機器周辺の凍結に注意してください。'
    });
  }

  if (notes.length === 1) {
    notes.push({
      level: 'info',
      text: '現在の近傍観測値では、積雪・強風・凍結に関する追加警告条件は検出されていません。'
    });
  }

  return notes;
}

export async function getSiteWeather(lat: number, lon: number): Promise<SiteWeatherResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 20 || lat > 50 || lon < 120 || lon > 155) {
    throw new Error('日本国内の有効な緯度・経度を指定してください。');
  }

  const [reverse, elevationM, amedas] = await Promise.all([
    reverseGeocode(lat, lon),
    getElevation(lat, lon),
    fetchAmedas(lat, lon)
  ]);

  const location: SiteLocation = {
    lat,
    lon,
    prefecture: reverse.prefecture,
    municipality: reverse.municipality,
    locality: reverse.locality,
    municipalityCode: reverse.municipalityCode,
    elevationM
  };

  const [forecast] = await Promise.all([fetchForecast(reverse.municipality, reverse.prefecture)]);
  const verticalSnow = evaluateVerticalSnow(reverse.prefecture, reverse.municipality, elevationM);
  const siteNotes = buildSiteNotes(verticalSnow, amedas, forecast);

  const sources: SiteWeatherResult['sources'] = [
    { label: '国土地理院 標高API / 逆ジオコーダ', url: 'https://maps.gsi.go.jp/' },
    { label: '気象庁 AMeDAS', url: 'https://www.jma.go.jp/bosai/amedas/' },
    { label: '気象庁 天気予報', url: 'https://www.jma.go.jp/bosai/forecast/' }
  ];

  if (verticalSnow.sourceUrl && verticalSnow.sourceLabel) {
    sources.unshift({ label: verticalSnow.sourceLabel, url: verticalSnow.sourceUrl });
  }

  return {
    location,
    verticalSnow,
    amedas,
    forecast,
    siteNotes,
    sources
  };
}
