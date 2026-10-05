
import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  ExternalLink,
  Gauge,
  MapPin,
  RefreshCw,
  Search,
  Snowflake,
  Thermometer,
  Wind
} from 'lucide-react';

type NoteLevel = 'info' | 'caution' | 'warning';

interface SiteWeatherResponse {
  location: {
    lat: number;
    lon: number;
    prefecture: string | null;
    municipality: string | null;
    locality: string | null;
    municipalityCode: string | null;
    elevationM: number | null;
  };
  verticalSnow: {
    status: 'verified' | 'not_covered_v1' | 'outside_japan' | 'error';
    depthCm: number | null;
    rule: string | null;
    sourceLabel: string | null;
    sourceUrl: string | null;
    note: string | null;
  };
  amedas: {
    observedAt: string | null;
    station: {
      code: string;
      name: string;
      latitude: number;
      longitude: number;
      altitudeM: number | null;
      distanceKm: number;
    } | null;
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
    snowStation: {
      code: string;
      name: string;
      latitude: number;
      longitude: number;
      altitudeM: number | null;
      distanceKm: number;
    } | null;
    snowStationDepthCm: number | null;
    snowStation24hCm: number | null;
  };
  forecast: {
    officeCode: string | null;
    officeName: string | null;
    forecastAreaCode: string | null;
    forecastAreaName: string | null;
    reportDatetime: string | null;
    days: Array<{
      date: string;
      weather: string | null;
      weatherCode: string | null;
      wind: string | null;
      popPercent: number | null;
      tempMinC: number | null;
      tempMaxC: number | null;
    }>;
  };
  siteNotes: Array<{
    level: NoteLevel;
    text: string;
  }>;
  sources: Array<{
    label: string;
    url: string;
  }>;
}

function display(value: number | null | undefined, unit = '', digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toFixed(digits) + unit;
}

function formatObservationTime(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  } catch {
    return value;
  }
}

const MetricCard: React.FC<{
  label: string;
  ja?: string;
  value: string;
  detail?: string;
  icon: React.ReactNode;
}> = ({ label, ja, value, detail, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
        {ja && <p className="mt-0.5 text-[10px] text-slate-400">{ja}</p>}
      </div>
      <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
    </div>
    <div className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</div>
    {detail && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{detail}</p>}
  </div>
);

const NoteBadge: React.FC<{ level: NoteLevel; text: string }> = ({ level, text }) => {
  const cls =
    level === 'warning'
      ? 'border-red-200 bg-red-50 text-red-800'
      : level === 'caution'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-blue-200 bg-blue-50 text-blue-900';

  return (
    <div className={'flex gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ' + cls}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
};

export const SiteWeatherTool: React.FC = () => {
  const [query, setQuery] = useState('34.444658, 135.745248');
  const [data, setData] = useState<SiteWeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nearestSnowDepth = data?.amedas.snowStationDepthCm ?? data?.amedas.snowDepthCm ?? null;
  const nearestSnow24h = data?.amedas.snowStation24hCm ?? data?.amedas.snow24hCm ?? null;

  const locationLabel = useMemo(() => {
    if (!data) return '—';
    return [data.location.prefecture, data.location.municipality, data.location.locality].filter(Boolean).join(' ');
  }, [data]);

  const runLookup = async () => {
    setLoading(true);
    setError(null);

    try {
      const normalized = query.trim().replace(/，/g, ',');
      const coordinateMatch = normalized.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*$/);

      let lat: number;
      let lon: number;

      if (coordinateMatch) {
        lat = Number(coordinateMatch[1]);
        lon = Number(coordinateMatch[2]);
      } else {
        const geocodeRes = await fetch('/api/site-weather/geocode?q=' + encodeURIComponent(normalized));
        const geocodeBody = await geocodeRes.json();
        if (!geocodeRes.ok) throw new Error(geocodeBody?.message || '住所検索に失敗しました。');
        lat = Number(geocodeBody.lat);
        lon = Number(geocodeBody.lon);
      }

      const res = await fetch('/api/site-weather?lat=' + encodeURIComponent(String(lat)) + '&lon=' + encodeURIComponent(String(lon)));
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'サイト条件の取得に失敗しました。');

      setData(body as SiteWeatherResponse);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'データ取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-sky-300" />
                <h2 className="text-lg font-bold">BESS Site Weather</h2>
                <span className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold">
                  SITE CONDITIONS
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                垂直積雪量・標高・AMeDAS観測・7日天気予報を座標または住所から確認
              </p>
            </div>

            <div className="text-[10px] leading-relaxed text-slate-400">
              <div>Official data: 国土地理院 / 気象庁 / 自治体</div>
              <div>構造計算は行いません</div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <label className="mb-2 block text-xs font-bold text-slate-700">住所 / 緯度・経度</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') runLookup();
                }}
                placeholder="例: 34.444658, 135.745248 または 奈良県御所市"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-hidden transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
              />
            </div>
            <button
              type="button"
              onClick={runLookup}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? '取得中...' : 'サイト条件を確認'}
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
              {error}
            </div>
          )}
        </div>
      </section>

      {data && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">Site</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">{locationLabel || '所在地未取得'}</h3>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {data.location.lat.toFixed(6)}, {data.location.lon.toFixed(6)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">
                  標高 {display(data.location.elevationM, ' m', 1)}
                </span>
                {data.location.municipalityCode && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700">
                    市区町村コード {data.location.municipalityCode}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Snow &amp; Current Weather</h3>
                <p className="text-[11px] text-slate-500">積雪条件・近傍AMeDAS観測値</p>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                観測: {formatObservationTime(data.amedas.observedAt)}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Vertical snow"
                ja="垂直積雪量"
                value={data.verticalSnow.depthCm == null ? '未確認' : display(data.verticalSnow.depthCm, ' cm', 0)}
                detail={
                  data.verticalSnow.status === 'verified'
                    ? data.verticalSnow.rule || '自治体規定'
                    : data.verticalSnow.note || '自治体規定を確認してください'
                }
                icon={<Snowflake className="h-4 w-4" />}
              />
              <MetricCard
                label="Observed snow"
                ja="近傍観測所 積雪深"
                value={display(nearestSnowDepth, ' cm', 0)}
                detail={
                  data.amedas.snowStation
                    ? data.amedas.snowStation.name + ' / ' + data.amedas.snowStation.distanceKm.toFixed(1) + ' km'
                    : '積雪観測所データなし'
                }
                icon={<Snowflake className="h-4 w-4" />}
              />
              <MetricCard
                label="Temperature"
                ja="気温"
                value={display(data.amedas.temperatureC, ' °C', 1)}
                detail={data.amedas.station ? data.amedas.station.name + ' / ' + data.amedas.station.distanceKm.toFixed(1) + ' km' : undefined}
                icon={<Thermometer className="h-4 w-4" />}
              />
              <MetricCard
                label="Wind"
                ja="風速・風向"
                value={display(data.amedas.windSpeedMs, ' m/s', 1)}
                detail={data.amedas.windDirectionLabel || '風向データなし'}
                icon={<Wind className="h-4 w-4" />}
              />
              <MetricCard
                label="24h snowfall"
                ja="24時間降雪量"
                value={display(nearestSnow24h, ' cm', 0)}
                detail="近傍の積雪観測点"
                icon={<Snowflake className="h-4 w-4" />}
              />
              <MetricCard
                label="24h rain"
                ja="24時間降水量"
                value={display(data.amedas.precipitation24hMm, ' mm', 1)}
                detail={'1時間: ' + display(data.amedas.precipitation1hMm, ' mm', 1)}
                icon={<CloudRain className="h-4 w-4" />}
              />
              <MetricCard
                label="Humidity"
                ja="湿度"
                value={display(data.amedas.humidityPercent, ' %', 0)}
                icon={<Gauge className="h-4 w-4" />}
              />
              <MetricCard
                label="Pressure"
                ja="気圧"
                value={display(data.amedas.pressureHpa, ' hPa', 1)}
                icon={<Gauge className="h-4 w-4" />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">7-Day Forecast</h3>
                <p className="text-[11px] text-slate-500">
                  7日予報 {data.forecast.forecastAreaName ? '・' + data.forecast.forecastAreaName : ''}
                </p>
              </div>
              <div className="text-[10px] text-slate-400">
                {data.forecast.officeName || '気象庁'} / {formatObservationTime(data.forecast.reportDatetime)}
              </div>
            </div>

            {data.forecast.days.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">予報データを取得できませんでした。</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {data.forecast.days.map(day => (
                  <div key={day.date} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{day.date}</span>
                      <span className="text-[10px] font-semibold text-blue-700">
                        降水 {day.popPercent == null ? '—' : day.popPercent + '%'}
                      </span>
                    </div>
                    <p className="mt-2 min-h-8 text-xs font-medium leading-relaxed text-slate-700">
                      {day.weather || '天気コード ' + (day.weatherCode || '—')}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
                      <span>低 {day.tempMinC == null ? '—' : day.tempMinC + '°C'}</span>
                      <span>高 {day.tempMaxC == null ? '—' : day.tempMaxC + '°C'}</span>
                    </div>
                    {day.wind && <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{day.wind}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">BESS Site Notes</h3>
              <p className="mb-3 mt-0.5 text-[11px] text-slate-500">サイト確認時の注意事項</p>
              <div className="space-y-2">
                {data.siteNotes.map((note, index) => (
                  <NoteBadge key={index} level={note.level} text={note.text} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Sources</h3>
              <p className="mb-3 mt-0.5 text-[11px] text-slate-500">出典・確認先</p>
              <div className="space-y-2">
                {data.sources.map(source => (
                  <a
                    key={source.url + source.label}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span>{source.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                  </a>
                ))}
              </div>

              {data.verticalSnow.note && (
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[10px] leading-relaxed text-slate-500">
                  {data.verticalSnow.note}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
