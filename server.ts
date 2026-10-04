/**
 * SOLNEXA Web - Server Entry Point
 * Express + Vite Full-Stack Application
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';
import { authDb } from './server/db/authDatabase';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

async function startServer() {
  // Initialize persistent SQLite authentication & session engine
  await authDb.init();

  const app = express();

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Cookie parser with secret key for signed HttpOnly session cookies
  app.use(cookieParser(process.env.SESSION_SECRET || 'solnexa-production-session-secret-2026'));

  // Basic middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes mounted FIRST
  app.use('/api', apiRouter);

  // Guard: NEVER allow any /api request to fall through to Vite SPA / HTML
  app.all(['/api', '/api/*'], (req, res) => {
    res.status(404).json({
      error: 'Endpoint không tồn tại',
      message: `API route not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Global Error Handler for API routes: guarantees JSON responses, never HTML
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Unhandled Error]:', err);
    res.status(err.status || 500).json({
      error: err.name || 'Lỗi xử lý API',
      message: err.message || 'Đã xảy ra lỗi nội bộ trên máy chủ.'
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[SOLNEXA Web] Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SOLNEXA Web] Failed to start server:', err);
  process.exit(1);
});
