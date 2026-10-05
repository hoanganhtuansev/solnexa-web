
import { Router } from 'express';
import { geocodeJapaneseAddress, getSiteWeather } from '../services/siteWeatherService';

export const siteWeatherRouter = Router();

siteWeatherRouter.get('/geocode', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: '住所または地名を入力してください。'
      });
    }

    const result = await geocodeJapaneseAddress(q);
    if (!result) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '該当する住所・地名が見つかりませんでした。'
      });
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

siteWeatherRouter.get('/', async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        error: 'INVALID_COORDINATES',
        message: 'lat / lon を数値で指定してください。例: ?lat=34.444658&lon=135.745248'
      });
    }

    const result = await getSiteWeather(lat, lon);
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=900');
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
