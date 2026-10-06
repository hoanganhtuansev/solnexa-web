/**
 * SOLNEXA Web - REST API Routes
 * Clean architecture providing endpoints for PDF ingestion, review,
 * equipment database, calculations, diagnostics, and future ecosystem access.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../db/database';
import { pdfIngestionPipeline } from '../services/pdfIngestionPipeline';
import { reviewService } from '../services/reviewService';
import { engineeringCalculationsService } from '../services/engineeringCalculationsService';
import { aiProviderManager } from '../services/ai/aiProviderManager';
import { snowEngineService } from '../snowEngine/snowEngineService';
import { EquipmentCategoryCode, AIProviderId } from '../../src/types';

export const apiRouter = Router();

// --- Section: User & Session Storage (Persistent SQLite Database with Bcrypt) ---
import { authDb, PortalUser, PortalUserRecord, UserSession } from '../db/authDatabase';

export type { PortalUser, PortalUserRecord, UserSession };

// Delegate password hashing & verification to Bcrypt engine
export function hashPassword(password: string): string {
  return authDb.hashPassword(password);
}

export function verifyPassword(password: string, user: PortalUserRecord): boolean {
  return authDb.verifyPassword(password, user);
}

// --- In-Memory Sliding Window Rate Limiting ---
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const store = new Map<string, RateLimitRecord>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = store.get(ip);
    if (!record || record.resetTime <= now) {
      record = { count: 1, resetTime: now + options.windowMs };
      store.set(ip, record);
      return next();
    }
    record.count++;
    if (record.count > options.max) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `${options.message} (Vui lòng đợi ${waitSeconds}s)`,
        retryAfter: waitSeconds
      });
    }
    next();
  };
}

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Bạn đã thực hiện quá nhiều thao tác xác thực trong thời gian ngắn.'
});

export const aiChatLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Bạn đã gửi tin nhắn AI quá nhanh.'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Bạn đã tải lên quá nhiều tệp trong thời gian ngắn.'
});

export const inquiryLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: 'Bạn đã gửi quá nhiều yêu cầu tư vấn.'
});

// SSRF Safety Validator for Local AI Endpoints
export function isValidLocalAiEndpoint(rawUrl: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Chỉ chấp nhận giao thức http hoặc https.' };
    }
    const hostname = parsed.hostname.toLowerCase();
    // Block cloud metadata & AWS/GCP/Azure link-local addresses
    if (
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.internal') ||
      hostname === '0.0.0.0'
    ) {
      return { valid: false, error: 'Endpoint bị chặn vì lý do an toàn mạng (SSRF Protection).' };
    }
    // Block internal RFC1918 private subnets unless localhost
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (!isLocalhost) {
      if (
        /^10\./.test(hostname) ||
        /^192\.168\./.test(hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
      ) {
        return { valid: false, error: 'Không được phép kết nối tới mạng nội bộ riêng tư (Private Subnet).' };
      }
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'URL không đúng định dạng.' };
  }
}

// Authentication Middleware: extract session from HttpOnly Cookie or Bearer header
export const authenticateSession = (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Signed or plain cookie
  if (req.cookies && req.cookies.solnexa_session) {
    token = req.cookies.solnexa_session;
  } else if ((req as any).signedCookies && (req as any).signedCookies.solnexa_session) {
    token = (req as any).signedCookies.solnexa_session;
  }

  // 2. Authorization Bearer header
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    }
  }

  if (token) {
    const session = authDb.getSession(token);
    if (session && session.expiresAt > Date.now()) {
      (req as any).user = session.user;
      (req as any).sessionToken = token;
      return next();
    }
  }

  (req as any).user = null;
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    return res.status(401).json({
      error: '認証が必要です',
      message: 'この操作を実行するにはログインが必要です。'
    });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !user.isAdmin) {
    return res.status(403).json({
      error: '管理者権限が必要です',
      message: 'この操作を実行する権限がありません。管理者としてログインしてください。'
    });
  }
  next();
};

// Mount session authenticator on all API routes
apiRouter.use(authenticateSession);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});

// Middleware wrapper for multer to catch and format any upload errors as JSON
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      console.error('Multer file upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'Tệp PDF quá lớn',
          message: 'Dung lượng tệp PDF vượt quá giới hạn cho phép (30MB). Vui lòng chọn tệp nhỏ hơn.'
        });
      }
      return res.status(400).json({
        error: 'Lỗi tải lên tệp PDF',
        message: err.message || 'Không thể đọc tệp PDF tải lên'
      });
    }
    next();
  });
};

// --- Health Check ---
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    app: 'SOLNEXA Web',
    timestamp: new Date().toISOString()
  });
});

// --- BESS Snow & Weather Checker (積雪・気象条件チェック) ---
apiRouter.get('/snow-weather/check', async (req: Request, res: Response) => {
  try {
    const { address, lat, lon, offline } = req.query;
    const parsedLat = lat !== undefined && lat !== '' ? parseFloat(String(lat)) : undefined;
    const parsedLon = lon !== undefined && lon !== '' ? parseFloat(String(lon)) : undefined;
    const offlineOnly = offline === 'true' || offline === '1';

    const result = await snowEngineService.analyzeLocation({
      address: address ? String(address) : undefined,
      lat: parsedLat,
      lon: parsedLon,
      offlineOnly
    });

    res.json(result);
  } catch (err: any) {
    console.error('[SnowWeather API Error]:', err);
    res.status(500).json({
      error: '積雪・気象データの取得に失敗しました',
      message: err.message || 'サーバー内部エラーが発生しました。'
    });
  }
});

// --- Dashboard & Analytics ---
apiRouter.get('/stats', (req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  res.json(stats);
});

// --- Projects API ---
apiRouter.get('/projects', (req: Request, res: Response) => {
  const { type, status, search } = req.query;
  const projects = db.getProjects({
    type: type ? String(type) : undefined,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined
  });
  res.json(projects);
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

apiRouter.post('/projects', requireAuth, (req: Request, res: Response) => {
  try {
    const saved = db.upsertProject(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save project' });
  }
});

apiRouter.delete('/projects/:id', requireAuth, (req: Request, res: Response) => {
  const ok = db.deleteProject(req.params.id);
  res.json({ success: ok });
});

// --- Cables & Price Book ---
apiRouter.get('/cables', (req: Request, res: Response) => {
  res.json(db.getCables());
});

apiRouter.get('/price-book', (req: Request, res: Response) => {
  res.json(db.getPriceBook());
});

// --- Manufacturers & Categories ---
apiRouter.get('/manufacturers', (req: Request, res: Response) => {
  res.json(db.getManufacturers());
});

apiRouter.get('/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

// --- Datasheet PDF Upload & Ingestion ---
apiRouter.post(['/datasheets/upload', '/datasheets/upload/'], requireAuth, uploadLimiter, handleUpload, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Chưa có tệp PDF',
        message: 'Vui lòng cung cấp tệp PDF datasheet trong trường "file".'
      });
    }

    const result = await pdfIngestionPipeline.ingest(req.file.originalname, req.file.buffer);
    res.json(result);
  } catch (err: any) {
    console.error('PDF ingestion pipeline failed:', err);
    res.status(500).json({
      error: 'Lỗi bóc tách PDF',
      message: err.message || 'Đã xảy ra lỗi khi bóc tách thông số kỹ thuật PDF.',
      details: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }
});

// Quick Sample Datasheet Ingestions for demonstration and testing
apiRouter.post('/datasheets/sample/:sampleId', async (req: Request, res: Response) => {
  const { sampleId } = req.params;

  // Realistic sample datasheet text representations with tables
  const sampleData: Record<string, { filename: string; text: string }> = {
    'huawei-sun2000': {
      filename: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf',
      text: `HUAWEI FusionSolar Smart PV Solution
SUN2000-50KTL-NHM3 Smart String Inverter
Technical Specifications

Efficiency:
Max. Efficiency: 98.5%
European Efficiency: 98.0%

Input (DC):
Max. Input Voltage: 1,100 V
Operating Voltage Range: 200 V ~ 1,000 V
Start-up Voltage: 200 V
Nominal Input Voltage: 600 V
Max. Input Current per MPPT: 30 A
Max. Short Circuit Current per MPPT: 40 A
Number of MPPTs: 4
Max. Number of Inputs per MPPT: 2

Output (AC):
Rated AC Active Power: 50 kW
Max. AC Apparent Power: 55 kVA
Rated Output Voltage: 400 V / 380 V, 3W + N + PE
Rated AC Grid Frequency: 50 Hz / 60 Hz
Rated Output Current: 72.2 A @ 400 V
Adjustable Power Factor: 0.8 leading ... 0.8 lagging
Total Harmonic Distortion (THDi): < 3%

General Data:
Dimensions (W x H x D): 640 x 530 x 270 mm
Weight: 49 kg
Operating Temperature Range: -25°C ~ 60°C
Cooling Method: Smart Air Cooling
Protection Degree: IP66`
    },
    'trina-vertex': {
      filename: 'Trina_Vertex_S_Plus_NEG9R28_440W_Datasheet.pdf',
      text: `Trina Solar Vertex S+ Dual-Glass N-type TOPCon PV Module
TSM-440NEG9R.28
ELECTRICAL DATA (STC):
Peak Power Watts - Pmax (Wp): 440 W
Open Circuit Voltage - Voc (V): 52.2 V
Short Circuit Current - Isc (A): 10.67 A
Maximum Power Voltage - Vmp (V): 43.6 V
Maximum Power Current - Imp (A): 10.10 A
Module Efficiency (%): 22.0 %

TEMPERATURE RATINGS:
Temperature Coefficient of Pmax: -0.30 %/°C
Temperature Coefficient of Voc: -0.24 %/°C
Temperature Coefficient of Isc: +0.04 %/°C
Maximum System Voltage: 1500 V DC
Max Series Fuse Rating: 25 A
Weight: 21.0 kg`
    },
    'catl-enerone': {
      filename: 'CATL_EnerOne_Outdoor_Liquid_Cooling_BESS_Datasheet.pdf',
      text: `Contemporary Amperex Technology Co., Limited (CATL)
EnerOne 372.7kWh Outdoor Liquid Cooling BESS Cabinet
Technical Data:
Nominal Energy Capacity: 372.7 kWh
Cell Chemistry: LFP (Lithium Iron Phosphate)
DC Voltage Range: 850 V ~ 1,500 V
Rated Continuous C-Rate: 0.5C
Cycle Life (80% EOL): 10,000 cycles
Operating Temperature: -30°C ~ 55°C
Cooling System: Liquid Cooling
Protection Rating: IP66 & C5
Dimensions: 1,300 x 1,300 x 2,300 mm
Weight: 3,800 kg`
    },
    'schneider-acb': {
      filename: 'Schneider_Electric_MasterPact_MTZ2_1600A_ACB_Datasheet.pdf',
      text: `Schneider Electric
MasterPact MTZ2 16 H1 Air Circuit Breaker
Specifications:
Rated Current (In): 1600 A
Rated Operational Voltage (Ue): 690 V
Breaking Capacity (Icu @ 415V): 66 kA
Short-time Withstand Current (Icw 1s): 66 kA
Poles: 3P
Trip Unit: Micrologic 2.0 X
Protection Class: IP30`
    }
  };

  const sample = sampleData[sampleId];
  if (!sample) {
    return res.status(404).json({ error: `Sample ${sampleId} not found` });
  }

  try {
    const fakeBuffer = Buffer.from(sample.text, 'utf-8');
    const result = await pdfIngestionPipeline.ingest(sample.filename, fakeBuffer);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sample ingestion failed' });
  }
});

apiRouter.get('/datasheets', (req: Request, res: Response) => {
  res.json(db.getDatasheets());
});

// --- Equipment Library & Models ---
apiRouter.get('/equipment', (req: Request, res: Response) => {
  const { category, manufacturerId, search, isApproved } = req.query;

  const models = db.getModels({
    category: category ? (category as EquipmentCategoryCode) : undefined,
    manufacturerId: manufacturerId ? String(manufacturerId) : undefined,
    search: search ? String(search) : undefined,
    isApproved: isApproved !== undefined ? isApproved === 'true' : undefined
  });

  res.json(models);
});

apiRouter.get('/equipment/:id', (req: Request, res: Response) => {
  const model = db.getModelById(req.params.id);
  if (!model) {
    return res.status(404).json({ error: 'Equipment model not found' });
  }
  res.json(model);
});

// --- Review Workflow Endpoints ---
apiRouter.get('/review/pending', (req: Request, res: Response) => {
  const pending = reviewService.getPendingEquipment();
  res.json(pending);
});

apiRouter.get('/review/:modelId', (req: Request, res: Response) => {
  const details = reviewService.getModelReviewDetails(req.params.modelId);
  if (!details) {
    return res.status(404).json({ error: 'Equipment model not found' });
  }
  res.json(details);
});

apiRouter.put('/specifications/:id', requireAuth, (req: Request, res: Response) => {
  const updated = reviewService.updateSpecification(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(updated);
});

apiRouter.post('/specifications/:id/approve', requireAuth, (req: Request, res: Response) => {
  const approved = reviewService.approveSpecification(req.params.id);
  if (!approved) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(approved);
});

apiRouter.post('/specifications/:id/reject', requireAuth, (req: Request, res: Response) => {
  const rejected = reviewService.rejectSpecification(req.params.id);
  if (!rejected) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(rejected);
});

apiRouter.post('/models/:modelId/specifications', requireAuth, (req: Request, res: Response) => {
  try {
    const spec = reviewService.addMissingSpecification(req.params.modelId, req.body);
    res.json(spec);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/models/:modelId/commit', requireAuth, (req: Request, res: Response) => {
  try {
    const committed = reviewService.approveAllAndCommit(req.params.modelId, req.body);
    res.json(committed);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Engineering Calculations ---
apiRouter.post('/calculations/voltage-drop', (req: Request, res: Response) => {
  try {
    const result = engineeringCalculationsService.calculateVoltageDrop(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/calculations/cable-selection', (req: Request, res: Response) => {
  try {
    const result = engineeringCalculationsService.selectCable(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/calculations/pv-string-design', (req: Request, res: Response) => {
  try {
    const result = engineeringCalculationsService.designPVString(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Extraction Diagnostics ---
apiRouter.get('/diagnostics/runs', (req: Request, res: Response) => {
  const { datasheetId } = req.query;
  const runs = db.getExtractionRuns(datasheetId ? String(datasheetId) : undefined);
  res.json(runs);
});

// --- Settings & AI Provider Config ---
apiRouter.get('/settings', (req: Request, res: Response) => {
  res.json({
    settings: aiProviderManager.getSettings(),
    activeProviderName: aiProviderManager.getActiveProviderName(),
    providers: aiProviderManager.getAvailableProviders()
  });
});

apiRouter.post('/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = aiProviderManager.updateSettings(req.body);
    res.json({
      success: true,
      settings: updated,
      activeProviderName: aiProviderManager.getActiveProviderName()
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Lỗi cập nhật cấu hình' });
  }
});

// SSRF-Protected Local Endpoint Verification (Admin Only)
apiRouter.post('/settings/test-local', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      const validation = isValidLocalAiEndpoint(endpoint);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error || 'Endpoint không hợp lệ hoặc bị từ chối do chính sách bảo mật SSRF.'
        });
      }
    }
    const result = await aiProviderManager.testLocalConnection(endpoint);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi kiểm tra kết nối local'
    });
  }
});

// Backward-compatible endpoints
apiRouter.get('/settings/providers', (req: Request, res: Response) => {
  res.json({
    active: aiProviderManager.getActiveProviderId(),
    activeName: aiProviderManager.getActiveProviderName(),
    providers: aiProviderManager.getAvailableProviders()
  });
});

apiRouter.post('/settings/provider', requireAdmin, (req: Request, res: Response) => {
  const { provider } = req.body;
  const updated = aiProviderManager.updateSettings({ activeProvider: provider });
  res.json({ success: true, active: updated.activeProvider });
});

// --- Section 17: Future SOLNEXA Ecosystem REST API ---
// Future systems (SOLNEXA CAD, AutoCAD plugin, AI Agent) can query technical specs:
// Example: GET /api/v1/equipment/Huawei%20SUN2000-50KTL-NHM3/specifications
apiRouter.get('/v1/equipment/:modelQuery/specifications', (req: Request, res: Response) => {
  const query = decodeURIComponent(req.params.modelQuery).toLowerCase();
  const models = db.getModels({ isApproved: true });

  const matched = models.find(m =>
    m.modelName.toLowerCase() === query ||
    `${m.manufacturerName} ${m.modelName}`.toLowerCase() === query ||
    m.modelName.toLowerCase().includes(query)
  );

  if (!matched) {
    return res.status(404).json({
      error: 'Approved equipment not found in SOLNEXA database',
      query: req.params.modelQuery
    });
  }

  const approvedSpecs = (matched.specifications || []).filter(s => s.reviewStatus === 'APPROVED');
  const specMap: Record<string, any> = {};
  approvedSpecs.forEach(s => {
    specMap[s.parameterName] = {
      displayName: s.displayName,
      value: s.normalizedValue,
      unit: s.normalizedUnit,
      sourceDocument: s.sourceDocument,
      sourcePage: s.sourcePage,
      confidence: s.confidence
    };
  });

  res.json({
    ecosystemVersion: '1.0',
    equipment: {
      id: matched.id,
      manufacturer: matched.manufacturerName,
      model: matched.modelName,
      category: matched.categoryCode,
      series: matched.series,
      description: matched.description,
      revision: matched.revision,
      updatedAt: matched.updatedAt
    },
    specifications: specMap
  });
});

// --- Section 18: Corporate Portal Endpoints (AI Q&A, Inquiries, Auth) ---

// Memory store for corporate inquiries
const corporateInquiries: any[] = [];

apiRouter.post('/inquiries', inquiryLimiter, (req: Request, res: Response) => {
  try {
    const { type, company, department, name, email, phone, message, interest } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: '必須項目（お名前、メールアドレス、お問い合わせ内容）を入力してください。' });
    }
    const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newInquiry = {
      id: inquiryId,
      type: type || 'technical_consulting',
      company: company || '一般',
      department: department || '',
      name,
      email,
      phone: phone || '',
      message,
      interest: interest || 'solar_and_bess',
      createdAt: new Date().toISOString(),
      status: 'RECEIVED'
    };
    corporateInquiries.unshift(newInquiry);
    res.json({
      success: true,
      inquiryId,
      message: 'お問い合わせを受け付けました。担当技術エンジニアより2営業日以内にご連絡差し上げます。'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'お問い合わせの送信に失敗しました。' });
  }
});

apiRouter.get('/inquiries', requireAdmin, (_req: Request, res: Response) => {
  res.json(corporateInquiries);
});

apiRouter.get('/company/info', (_req: Request, res: Response) => {
  res.json({
    companyName: '株式会社ソルネクサ (SOLNEXA Inc.)',
    slogan: 'SMARTER ENERGY. BRIGHTER TOMORROW.',
    meaning: 'SOL (太陽) + NEXT (未来) + A (行動・創生)',
    phone: '070-8982-1052',
    email: 'hoanganhtuan.solnexa@gmail.com',
    headquarters: '東京本社: 〒116-0002 東京都荒川区荒川5-6-7 302号',
    postalCode: '〒116-0002',
    address: '東京都荒川区荒川5-6-7 302号',
    adminContact: 'Hoàng Anh Tuấn (代表 / 最高技術責任者・サイト管理者)',
    businessHours: '平日 9:00〜18:00 (土日祝除く)',
    licenses: [
      '電気工事業 国土交通大臣許可（特定）',
      '電気保安法人認可 / JIS・IEC規格準拠'
    ]
  });
});

const SITE_CONFIG_FILE = path.join(process.cwd(), 'data', 'solnexa_site_config.json');

// Get persistent site visual configuration
apiRouter.get('/site-config', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(SITE_CONFIG_FILE)) {
      const data = fs.readFileSync(SITE_CONFIG_FILE, 'utf-8');
      return res.json({ success: true, config: JSON.parse(data) });
    }
  } catch (err) {
    console.error('Error reading site config:', err);
  }
  res.json({ success: true, config: null });
});

// Save persistent site visual configuration (Admin only)
apiRouter.post('/site-config', requireAdmin, (req: Request, res: Response) => {
  try {
    const configData = req.body;
    if (!configData || !configData.hero) {
      return res.status(400).json({ error: '無効な設定データです。' });
    }
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    configData.lastUpdated = new Date().toISOString();
    configData.updatedBy = (req as any).user ? (req as any).user.name : 'Administrator';
    fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');
    res.json({ success: true, message: 'サイト設定が正常に保存・更新されました。', config: configData });
  } catch (err: any) {
    res.status(500).json({ error: '設定保存中にエラーが発生しました: ' + err.message });
  }
});

function sanitizeUser(u: PortalUserRecord | PortalUser): PortalUser {
  return {
    id: u.id,
    name: u.name,
    company: u.company,
    role: u.role,
    email: u.email,
    tier: u.tier,
    isAdmin: Boolean(u.isAdmin),
    avatar: u.avatar,
    createdAt: u.createdAt
  };
}

apiRouter.post('/auth/register', authLimiter, (req: Request, res: Response) => {
  try {
    const { name, email, company, role, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'お名前、メールアドレス、パスワードは必須です。' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'パスワードは6文字以上で入力してください。' });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const existing = authDb.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています。ログインしてください。' });
    }

    const newUserRecord = authDb.createUser({
      name: String(name).trim(),
      email: cleanEmail,
      company: company ? String(company).trim() : '一般会員',
      role: role ? String(role).trim() : 'エンジニア',
      password: String(password)
    });

    const safeUser = sanitizeUser(newUserRecord);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    const session = authDb.createSession(safeUser, maxAge);

    res.cookie('solnexa_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      signed: true
    });

    res.json({
      success: true,
      authenticated: true,
      user: safeUser,
      message: 'アカウントが正常に登録されました。すべての専門機能をご利用いただけます。'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || '登録処理中にエラーが発生しました。' });
  }
});

apiRouter.post('/auth/login', authLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください。' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const user = authDb.findUserByEmail(cleanEmail);
  if (!user || !authDb.verifyPassword(String(password), user)) {
    return res.status(401).json({
      error: '認証エラー',
      message: 'メールアドレスまたはパスワードが正しくありません。'
    });
  }

  const safeUser = sanitizeUser(user);
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const session = authDb.createSession(safeUser, maxAge);

  res.cookie('solnexa_session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    signed: true
  });

  res.json({
    success: true,
    authenticated: true,
    user: safeUser
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  let token: string | undefined;
  if (req.cookies && req.cookies.solnexa_session) {
    token = req.cookies.solnexa_session;
  } else if ((req as any).signedCookies && (req as any).signedCookies.solnexa_session) {
    token = (req as any).signedCookies.solnexa_session;
  }
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    }
  }

  if (token) {
    authDb.deleteSession(token);
  }

  res.clearCookie('solnexa_session');
  res.json({ success: true, message: 'ログアウトしました。' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user || null;
  res.json({ user });
});

// --- Dynamic CMS Data Store for Technical Knowledge & News ---
interface ArticleItem {
  id: string;
  category: string;
  title: string;
  date: string;
  author: string;
  readTime: string;
  content: string;
  summary: string;
  updatedAt?: string;
}

let articlesStore: ArticleItem[] = [
  {
    id: 'design-process',
    category: '設計実務ガイド',
    title: '太陽光発電所および系統用蓄電池の基本設計〜実施設計プロセス標準',
    date: '2026年9月 改訂',
    author: 'ソルネクサ エンジニアリング本部 技術設計部',
    readTime: '所要時間 約8分',
    summary: 'NEDO日射量データベースからJIS C 8955耐風圧計算、冬季最低気温Voc余裕度計算、JIS C 3605ケーブル許容電流・電圧降下低減設計までの一連の標準手順。',
    content: `太陽光発電および蓄電所の成否は、初期の地質・日射・系統アクセス調査に依存します。NEDOの日射量データベース（METPV-11、MONSOLA-11）を活用し、20年間の予測変動幅（P50、P90）を算定。敷地周囲の地形・樹木による日影シミュレーションを実施します。

【直流過積載（DC/AC比）と冬季Voc安全設計】
高圧・特高メガソーラーでは、直流過積載比率を130%〜160%程度に設定することが標準的です。モジュールストリング設計では、冬季最低設計外気温（-15℃〜-20℃）における開放電圧Vocが、PCSの最大許容直流入力電圧（1,500V）を決して超過しない直列モジュール数を厳密に算出します。

【JIS C 3605規格に基づく幹線ケーブル許容電流・電圧降下計算】
直流側幹線（PVモジュール〜接続箱・PCS）および交流側幹線（PCS〜集電盤〜変圧器）において、JIS C 3605（架橋ポリエチレン絶縁電力ケーブル CV/CVD/CVT）の許容電流を敷設環境（直埋、管路、地上露出、多条敷設低減係数）を加味して決定。全系における電圧降下率を合計2.0%以下に抑えることで、20年間の売電ロスを極小化します。

【電気事業法第48条に基づく工事計画届出および保安規程制定】
高圧（500kW以上）および特別高圧（2,000kW以上）設備は、工事着工の30日前までに管轄の産業保安監督部へ「工事計画届出書」を提出する必要があります。単線結線図、短絡容量計算書、保護協調曲線、変圧器・遮断器仕様書を添付し、所管官庁の審査を受けます。`
  },
  {
    id: 'fire-safety',
    category: '法令・消防安全',
    title: '系統用蓄電池（BESS）の消防法規制・保有空地3m基準と自動消火設備実務',
    date: '2026年9月 最新告示対応',
    author: 'ソルネクサ 保安規程・法務コンプライアンス室',
    readTime: '所要時間 約7分',
    summary: '総務省消防庁告示第2号に基づく屋外蓄電コンテナの離隔距離（保有空地3m）の原則と緩和条件、FK-5-1-12ガス系全域放出消火設備の技術仕様。',
    content: `リチウムイオン蓄電池設備は、電解液の可燃性状および熱暴走時のガス噴出リスクから、総務省消防庁告示第2号および各地方自治体の火災予防条例において厳格な設置基準が規定されています。

【保有空地3mの原則と隣接離隔】
屋外に設置する蓄電池コンテナは、原則として外壁または敷地境界、近隣建築物から【3m以上】の保有空地（離隔距離）を全周にわたって確保しなければなりません。コンテナ間に耐火壁を設置することで1m〜1.5mへ短縮可能な自治体もありますが、所轄消防本部との事前協議が必須となります。

【自動消火設備（ガス系・全域放出方式）】
蓄電池コンテナ内には、熱感知器・煙感知器・可燃性ガス検知器が連動する全域放出型消火設備が要求されます。水損被害のないFK-5-1-12（Novec 1230代替品）や固形エアロゾル消火装置が標準的です。`
  },
  {
    id: 'grid-interconnection',
    category: '系統連系技術',
    title: '特別高圧（66kV/22kV）系統連系協調とノンファーム型接続の技術的要件',
    date: '2026年8月 改訂',
    author: 'ソルネクサ 系統連系解析チーム',
    readTime: '所要時間 約10分',
    summary: 'コネクト＆マネージ制度下でのノンファーム接続における遠隔出力制御追従、87T比率差動リレー・51過電流リレー等の保護協調整定。',
    content: `日本国内の基幹送電線（154kV/66kV）では、再エネの大量連系により熱容量の空きがないエリアが全国に広がっています。これに対し導入された「コネクト＆マネージ（ノンファーム型接続）」は、系統混雑時に出力を無補償で抑制することを条件に接続を認める制度です。

系統用蓄電池の併設により、出力制御指示が出ている時間帯に太陽光電力を蓄電池へ充電し、夕方以降のピーク需要時間帯に放電することで、出力抑制による発電損失を最小化できます。連系点遮断器および特高変電所における保護継電器（87T, 51, 64OV, 67R）の適正な整定値算出が必須です。`
  },
  {
    id: 'market-fip',
    category: '市場動向・経済性',
    title: 'FIP制度におけるインバランス対策と需給調整市場・容量市場マルチユース運用',
    date: '2026年9月 最新市場分析',
    author: 'ソルネクサ エネルギー市場戦略研究所',
    readTime: '所要時間 約9分',
    summary: 'JEPXスポット市場の昼夜価格差を活用したアービトラージ、計画値同時同量達成によるインバランスペナルティゼロ化、容量市場20年収益の獲得手法。',
    content: `FIP（Feed-in Premium）制度では、発電事業者に計画値同時同量が義務付けられ、発電予測誤差によるインバランス料金が発生します。蓄電池のミリ秒応答制御により、予測誤差を瞬時に相殺することが可能です。

さらに、蓄電池単独でのマルチマーケット運用として、①JEPX安値時間帯の充電・ピーク時放電、②需給調整市場（三次調整力①②等）への供出、③容量市場（長期脱炭素電源オークション）での20年固定容量収入の獲得を組み合わせることで、強固な事業採算性を確立できます。`
  }
];

// Articles CMS Endpoints
apiRouter.get('/articles', (_req: Request, res: Response) => {
  res.json(articlesStore);
});

apiRouter.post('/articles', requireAdmin, (req: Request, res: Response) => {
  try {
    const { category, title, author, readTime, summary, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'タイトルと内容は必須です。' });
    }
    const newArt: ArticleItem = {
      id: `art-${Date.now().toString(36)}`,
      category: category || '技術解説',
      title,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' }),
      author: author || ((req as any).user ? (req as any).user.name : 'ソルネクサ 技術部'),
      readTime: readTime || '所要時間 約5分',
      summary: summary || content.slice(0, 100) + '...',
      content,
      updatedAt: new Date().toISOString()
    };
    articlesStore.unshift(newArt);
    res.json({ success: true, article: newArt, message: '新しい技術解説記事を公開しました。' });
  } catch (err: any) {
    res.status(500).json({ error: '記事作成に失敗しました。' });
  }
});

apiRouter.put('/articles/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { category, title, author, readTime, summary, content } = req.body;
  const idx = articlesStore.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: '指定された記事が見つかりません。' });
  }
  articlesStore[idx] = {
    ...articlesStore[idx],
    category: category || articlesStore[idx].category,
    title: title || articlesStore[idx].title,
    author: author || articlesStore[idx].author,
    readTime: readTime || articlesStore[idx].readTime,
    summary: summary || articlesStore[idx].summary,
    content: content || articlesStore[idx].content,
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, article: articlesStore[idx], message: '記事を更新しました。' });
});

apiRouter.delete('/articles/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = articlesStore.length;
  articlesStore = articlesStore.filter(a => a.id !== id);
  if (articlesStore.length === initialLength) {
    return res.status(404).json({ error: '記事が見つかりませんでした。' });
  }
  res.json({ success: true, message: '記事を削除しました。' });
});

// Dynamic News Store
interface NewsItem {
  id: string;
  date: string;
  category: string;
  title: string;
  author: string;
  summary: string;
  content: string;
  isHot?: boolean;
}

let newsStore: NewsItem[] = [
  {
    id: 'news-2026-09-24',
    date: '2026.09.24',
    category: '政策・法令',
    title: '経済産業省・資源エネルギー庁、「系統用蓄電池のノンファーム型接続運用ルールおよび出力制御補償」最新解説公表',
    author: 'ソルネクサ 法規動向調査グループ',
    summary: '基幹送電線の混雑対策として導入が進むノンファーム型接続において、蓄電所の充放電スケジュールおよびリアルタイム制御シグナル受信要件が改定されました。',
    isHot: true,
    content: `経済産業省および電力広域的運営推進機関（OCCTO）は、2026年度以降の系統混雑地域における蓄電所接続の運用指針を正式に改定公表しました。

主な改定ポイント:
1. ノンファーム型接続における制御指令の高速通信プロトコル（IEC 61850およびDNP3規格）への対応義務化。
2. 出力制御時間帯における充電需要の優先割当枠の設定（余剰電力吸収のインセンティブ強化）。
3. 蓄電所の同時同量達成状況に対するインバランス算出算定式の精緻化。

ソルネクサの考察と対応:
当社の系統用蓄電コンテナ（SOLNEXA-BESSシリーズ）およびAIスマートEMSは、今回の告示改定に先行対応しており、一般送配電事業者からの制御指令を100ミリ秒以内で受信・充放電追従する機能を標準装備しています。既存計画案件におかれましても、速やかな接続検討変更手続きが可能です。`
  },
  {
    id: 'news-2026-09-18',
    date: '2026.09.18',
    category: 'プレスリリース',
    title: 'ソルネクサ、東北エリアにて特別高圧66kV系統連系 40MW / 160MWh 系統用蓄電所の設計・主要機器供給を受注',
    author: '株式会社ソルネクサ 広報室',
    summary: '国内最大級の系統用蓄電所プロジェクトにおいて、消防法告示第2号に適合した液冷LFPコンテナ蓄電池40台および66kV特高スキッド一括納入が決定いたしました。',
    isHot: true,
    content: `株式会社ソルネクサ（本社：東京都荒川区荒川5-6-7 302号、以下ソルネクサ）は、東北電力送配電エリアにおいて計画されている特別高圧66kV系統連系の系統用蓄電所（出力40MW / 蓄電容量160MWh）の基本設計、系統連系協議支援、および主要蓄電設備の供給契約を締結いたしましたのでお知らせいたします。

本プロジェクトの特長:
・蓄電容量160MWh（4時間定格放電）により、長期脱炭素電源オークション（容量市場）の落札要件を完全に充足。
・敷地境界に対する消防法保有空地3m離隔を確保した最適なコンテナ配置設計。
・耐震・積雪対策を施した寒冷地特化型の特高受変電スキッドを採用。
・2027年春の営業運転開始を予定しており、地域の再エネ出力制御の緩和と電力安定供給に寄与します。`
  },
  {
    id: 'news-2026-09-10',
    date: '2026.09.10',
    category: '技術動向',
    title: '【技術論文公開】FIP太陽光発電所におけるインバランスペナルティ最小化と蓄電池併設マルチユース運用の実証データ',
    author: 'ソルネクサ エネルギー市場戦略研究所',
    summary: 'NEDO予測データベースとJEPXスポット市場価格変動を連動させた蓄電池運用の最新実証分析結果を公開いたしました。',
    isHot: false,
    content: `FIP制度（Feed-in Premium）への全面移行に伴い、太陽光発電事業における最大の課題は「発電予測誤差によるインバランスペナルティ」と「市場価格連動による売電単価下落リスク」です。

本実証論文では、15MWの太陽光発電所に30MWhの蓄電池を併設した実運用データに基づき、以下の効果を定量的に検証しました:
・インバランス発生率: 単体時 8.4% → 蓄電池併設時 0.3% へ激減。
・売電単価向上効果: 昼間のマイナス価格・底値時間帯の充電と、夕方ピーク（25円/kWh〜）放電により、平均売電単価が約4.2円/kWh上昇。
・IRR（内部収益率）の改善: 投資回収期間が2.5年短縮されることを確認。`
  },
  {
    id: 'news-2026-09-02',
    date: '2026.09.02',
    category: '補助金情報',
    title: '令和8年度 経済産業省「再生可能エネルギー導入加速化・系統用蓄電池等導入支援補助金」の公募要領が発表',
    author: 'ソルネクサ 補助金申請支援デスク',
    summary: '蓄電容量10MWh以上の系統用蓄電所に対する設備費補助（最大1/3）の申請枠が拡充されました。申請事前相談を受付中です。',
    isHot: false,
    content: `経済産業省は、令和8年度当初予算案における「再生可能エネルギー導入加速化・系統用蓄電池等導入支援事業」の公募要領を発表しました。

公募要領の概要:
・対象設備: 系統連系する独立型蓄電所（スタンドアローンBESS）および再エネ併設蓄電設備。
・補助率: 対象経費（蓄電池本体、PCS、受変電設備、工事費）の 1/3 以内（上限額あり）。
・公募締切: 2026年11月末日（予定）。`
  }
];

// News CMS Endpoints
apiRouter.get('/news', (_req: Request, res: Response) => {
  res.json(newsStore);
});

apiRouter.post('/news', requireAdmin, (req: Request, res: Response) => {
  try {
    const { category, title, summary, content, isHot } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'タイトルと内容は必須です。' });
    }
    const newNews: NewsItem = {
      id: `news-${Date.now().toString(36)}`,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      category: category || 'お知らせ',
      title,
      author: ((req as any).user ? (req as any).user.name : '株式会社ソルネクサ 広報室'),
      summary: summary || content.slice(0, 100) + '...',
      content,
      isHot: Boolean(isHot)
    };
    newsStore.unshift(newNews);
    res.json({ success: true, news: newNews, message: 'ニュース記事を公開しました。' });
  } catch (err: any) {
    res.status(500).json({ error: 'ニュースの作成に失敗しました。' });
  }
});

apiRouter.put('/news/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { category, title, summary, content, isHot } = req.body;
  const idx = newsStore.findIndex(n => n.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: '指定されたニュースが見つかりません。' });
  }
  newsStore[idx] = {
    ...newsStore[idx],
    category: category || newsStore[idx].category,
    title: title || newsStore[idx].title,
    summary: summary || newsStore[idx].summary,
    content: content || newsStore[idx].content,
    isHot: isHot !== undefined ? isHot : newsStore[idx].isHot
  };
  res.json({ success: true, news: newsStore[idx], message: 'ニュース記事を更新しました。' });
});

apiRouter.delete('/news/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = newsStore.length;
  newsStore = newsStore.filter(n => n.id !== id);
  if (newsStore.length === initialLength) {
    return res.status(404).json({ error: 'ニュースが見つかりませんでした。' });
  }
  res.json({ success: true, message: 'ニュース記事を削除しました。' });
});


// AI Solar & BESS Technical Advisor & Multi-Turn Chatbot
const SOLNEXA_AI_SYSTEM_INSTRUCTION = `あなたは日本を代表する太陽光発電および系統用蓄電池（Grid-scale BESS）の総合エンジニアリング企業「株式会社ソルネクサ（SOLNEXA Japan）」の専属AIチーフ技術顧問（シニアエネルギーエンジニア）です。

【役割とペルソナ】
- 丁寧、冷静、正確で信頼性の高い日本のビジネス技術日本語（専門用語を的確に使用）で対話します。
- 過去の対話履歴（会話コンテキスト）を正確に記憶・参照し、連続した技術相談に対応します。
- 太陽光・系統用蓄電池の設計実務、法令基準、電力市場運用、機器選定を的確に支援します。

【専門知識領域】
1. 系統用蓄電池（Grid-scale BESS）:
   - 消防法（総務省消防庁告示第2号・屋外設置の保有空地3m以上離隔基準、FK-5-1-12等自動消火設備、少量危険物届出）
   - 電気事業法第48条に基づく工事計画届出、電気主任技術者（第1種〜第3種）選任、保安規程制定
   - 日本卸電力取引所（JEPX）アービトラージ、FIPインバランスヘッジ、需給調整市場（一次〜三次）、容量市場（長期脱炭素電源オークション）
2. 産業用太陽光発電（メガソーラー・高圧/特高）:
   - モジュールストリング設計（冬季Voc安全余裕度計算、PCS最大許容直流入力電圧1,500V制限）
   - 架台耐風圧構造計算（JIS C 8955:2017設計基準、地表面粗度区分、積雪荷重）
   - 幹線ケーブル選定（JIS C 3605規格、許容電流、多条敷設低減係数、往復電圧降下率2.0%以内抑制）
   - 高圧（6.6kV）および特別高圧（22kV/66kV）受変電設備、単線結線図（SLD）、保護協調（87T比率差動, 51過電流, 64OV地絡過電圧）
3. ソルネクサの製品とツール:
   - 単結晶N型TOPConモジュール、高圧集中型PCS（1,250kW〜3,125kW）、20ft液冷蓄電コンテナ（3.72MWh LFP）、AIスマートEMS
   - 画面上部「設計ツール（SOLNEXA TOOLS）」でJIS計算・単線結線図作成が今すぐ利用可能

【回答のルール】
- 結論から先に述べ、必要に応じて要点を箇条書きで論理的に整理してください。
- 関連する法令基準（消防法、電気事業法、JIS規格、電力会社系統連系技術要件）を具体的に引用してください。
- ユーザーの対話履歴を文脈として踏まえ、追加の質問や計算条件に対しても自然に深掘りしてください。
- 必要に応じて「SOLNEXA TOOLS」の活用や専門エンジニアへの設計見積・特注相談（無料）を案内してください。`;

async function executeGeminiMultiTurnChat(message: string, history?: any[], requestedModel?: string) {
  let targetModel = 'gemini-2.5-flash';
  if (requestedModel === 'gemini-2.5-pro' || requestedModel === 'gemini-3.8-flash' || requestedModel === 'gemini-3.1-pro-preview') {
    targetModel = requestedModel;
  }

  // Try real Gemini API first if configured
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Construct multi-turn contents array
      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          if (!item.content || typeof item.content !== 'string') continue;
          const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
          contents.push({
            role,
            parts: [{ text: item.content }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          systemInstruction: `${SOLNEXA_AI_SYSTEM_INSTRUCTION}
【言語対応】ユーザーが日本語、ベトナム語、英語のいずれで質問しても、その言語（日本語には自然で丁寧なビジネス技術日本語、ベトナム語には正確な専門エンジニアリングベトナム語）で正確かつ親切に回答してください。`,
          temperature: 0.4
        }
      });

      const answer = response.text;
      if (answer && answer.trim()) {
        return {
          success: true,
          answer: answer.trim(),
          model: targetModel,
          source: 'gemini-live'
        };
      }
    } catch (apiErr: any) {
      console.warn('[AI Multi-Turn Chat] Gemini API call error, using domain knowledge base fallback:', apiErr.message);
    }
  }

  // Robust domain-expert fallback response engine supporting JA & VI & EN
  const q = message.toLowerCase();
  let answer = '';

  const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(message) ||
    q.includes('pin') || q.includes('lưu trữ') || q.includes('sụt áp') || q.includes('phòng cháy') || q.includes('đấu nối') || q.includes('chào') || q.includes('chat boot');

  if (isVietnamese) {
    if (q.includes('bess') || q.includes('lưu trữ') || q.includes('pin')) {
      answer = `【Tư vấn Kỹ thuật Hệ thống Pin Lưu trữ BESS (Grid-Scale Storage) - SOLNEXA】

1. Tiêu chuẩn PCCC và Khoảng cách an toàn (保有空地 3m):
   - Theo Thông tư số 2 của Cơ quan Cứu hỏa Nhật Bản, cụm container BESS ngoài trời phải duy trì khoảng cách an toàn tối thiểu 3m từ tường container đến ranh giới khu đất hoặc công trình kế cận.
   - Có thể rút ngắn xuống 1m - 1.5m khi bổ sung vách ngăn chống cháy chịu nhiệt đặc thù sau khi thống nhất với cơ quan PCCC sở tại.

2. Cấu hình Kỹ thuật Container BESS của SOLNEXA:
   - Module LFP (Lithium Iron Phosphate) mật độ năng lượng cao, hệ thống làm mát bằng chất lỏng (Liquid Cooling) ổn định nhiệt độ chênh lệch <2.5°C giữa các cell.
   - Hệ thống chữa cháy khí sạch tự động FK-5-1-12 liên động cảm biến khói, nhiệt và khí Hydro sớm.
   - Đạt chuẩn kiểm định an toàn UL9540A và chống ăn mòn ven biển cấp C5.

3. Vận hành Thị trường & Doanh thu:
   - Tối ưu hóa chênh lệch giá JEPX (mua sạc giờ điện mặt trời giá rẻ, xả bán giờ cao điểm tối).
   - Tham gia thị trường công suất (Long-term Decarbonization Auction) với hợp đồng cố định 20 năm.

Bạn có thể mở mục "SOLNEXA TOOLS" trên thanh menu để mô phỏng suy giảm công suất và hiệu suất BESS 20 năm ngay lập tức.`;
    } else if (q.includes('phòng cháy') || q.includes('pccc') || q.includes('cháy')) {
      answer = `【Quy định An toàn PCCC & Khoảng cách 3m cho Hệ thống BESS tại Nhật Bản】

Hệ thống lưu trữ năng lượng sử dụng pin Lithium-ion chịu sự điều chỉnh của Thông tư PCCC số 2 và Quy chế phòng cháy địa phương:

1. Khoảng cách an toàn 3m:
   - Container đặt ngoài trời bắt buộc có khoảng trống an toàn (保有空地) tối thiểu 3m bao quanh để ngăn ngừa cháy lan và đảm bảo lối tiếp cận cho xe cứu hỏa.
   - Bố trí đường vào tối thiểu 4m cho phương tiện chuyên dụng.

2. Báo cháy và Chữa cháy tự động:
   - Trang bị cảm biến nhiệt độ đa điểm, cảm biến khói quang điện và đầu dò khí gas sớm (CO / H2).
   - Hệ thống xả khí chữa cháy toàn diện (Total Flooding) FK-5-1-12 hoặc Sol khí Aerosol không gây tổn hại mạch điện tử.

3. Thủ tục Pháp lý:
   - Đăng ký lưu giữ chất nguy hại số lượng nhỏ (少量危険物届出) tại phòng cứu hỏa quận/huyện sở tại trước khi khởi công ít nhất 7-30 ngày.`;
    } else if (q.includes('cáp') || q.includes('sụt áp') || q.includes('jis c 3605') || q.includes('dây')) {
      answer = `【Tính toán Tiết diện Cáp & Độ sụt áp theo Tiêu chuẩn JIS C 3605】

1. Tiêu chuẩn áp dụng:
   - JIS C 3605 đối với cáp điện lực cách điện XLPE (CV / CVD / CVT 600V & 6.6kV).
   - Hệ số suy giảm dòng cho phép dựa theo môi trường lắp đặt: đi trong ống ngầm, máng cáp hở, rãnh bê tông và hệ số đi nhiều sợi liền kề.

2. Tiêu chí sụt áp tối ưu:
   - Tuyến DC (Tấm PV ➔ Hộp gom / Inverter): Sụt áp ΔV ≤ 1.0%.
   - Tuyến AC (Inverter ➔ Trạm biến áp ➔ Điểm đấu nối): Sụt áp ΔV ≤ 1.0%.
   - Tổng độ sụt áp toàn hệ thống khuyến nghị ≤ 2.0% để bảo toàn dòng tiền bán điện trong suốt vòng đời dự án 20 năm.

3. Công thức tính sụt áp 3 pha 3 dây:
   ΔV = √3 × I × L × (R·cosφ + X·sinφ) / 1000
   Trong đó: I (Dòng định mức A), L (Khoảng cách m), R (Điện trở ruột dẫn Ω/km ở 90°C), X (Điện kháng cảm Ω/km).`;
    } else if (q.includes('đấu nối') || q.includes('biến áp') || q.includes('trung thế') || q.includes('cao thế') || q.includes('sld')) {
      answer = `【Quy trình Đấu nối Lưới điện Cao thế (22kV/66kV) & Sơ đồ Đơn tuyến SLD】

1. Phân cấp điện áp đấu nối:
   - Hạ thế: < 50 kW (Đấu nối lưới phân phối hạ thế trạm biến áp cực).
   - Cao thế (高圧): 50 kW ~ dưới 2,000 kW (Lưới 6.6kV, trạm biến áp hợp bộ Cubicle, máy cắt chân không VCB).
   - Đặc biệt cao thế (特高): Từ 2,000 kW trở lên (Lưới 22kV / 66kV / 154kV, trạm biến áp ngoài trời hoặc GIS).

2. Đấu nối Không cam kết truyền tải (Non-firm Connect & Manage):
   - Đấu nối vào các đường dây nghẽn với điều kiện tiết giảm công suất khi lưới đầy tải. Kết hợp trạm pin lưu trữ BESS giúp sạc giữ lại lượng điện bị tiết giảm để phát lại vào giờ giá cao.

3. Phối hợp bảo vệ rơ-le (Protection Coordination):
   - Tính toán trị số chỉnh định cho rơ-le so lệch tỷ lệ (87T), rơ-le quá dòng (51/51V), chạm đất quá áp (64OV) và chống phát ngược công suất (67R).`;
    } else {
      answer = `【SOLNEXA AI - Cố vấn Kỹ thuật Trưởng Năng lượng Tái tạo & BESS】

Xin chào! Tôi là trợ lý AI chuyên môn của Công ty Cổ phần SOLNEXA (株式会社ソルネクサ - Nhật Bản).

Chúng tôi chuyên sâu về:
1. Thiết kế kỹ thuật Điện mặt trời (Utility Solar) & Trạm pin lưu trữ lưới (Grid-scale BESS).
2. Pháp lý Nhật Bản: Báo cáo kế hoạch thi công Điện lực Điều 48, Quy chuẩn PCCC Nhật Bản (Thông tư số 2, khoảng trống 3m).
3. Tối ưu hóa doanh thu FIP, thị trường chênh lệch giá JEPX và thị trường công suất dài hạn.
4. Công cụ tính toán kỹ thuật chuẩn JIS (JIS C 8955 kết cấu giàn, JIS C 3605 tính cáp & độ sụt áp, sơ đồ đơn tuyến SLD).

Bạn có thể đặt câu hỏi về dự án cụ thể hoặc sử dụng các công cụ tính toán chuyên nghiệp trên thanh công cụ!`;
    }
  } else if (q.includes('消防') || q.includes('保有空地') || q.includes('離隔') || q.includes('消火')) {
    answer = `【系統用蓄電池（BESS）の消防法規制および保有空地基準について】

系統用蓄電システムの導入においては、総務省消防庁告示第2号および各自治体の火災予防条例に基づく厳格な安全基準が適用されます。

1. 保有空地の確保（離隔距離）:
   - 屋外型コンテナ蓄電池（リチウムイオン電池）は、原則として外壁または敷地境界から【3m以上】の保有空地（離隔）を全周に確保する必要があります。
   - 隣接する建築物が耐火構造である場合や、特定基準の延焼防止耐火壁を設けることで一部緩和（1m〜1.5m等）が適用される自治体もありますが、所轄消防本部との事前協議が必須です。

2. 指定数量と危険物該当性:
   - 電解液の可燃性状により危険物第4類（引火性液体）に準じた扱いを受けるケースがあり、合計蓄電容量が基準（通常4,800Ah・セル単位合算）を超える場合は【少量危険物届出】または【一般取扱所】の許可申請が必要です。

3. 自動消火設備・ガス系消火設備:
   - 蓄電池コンテナ内部には、熱感知器・煙感知器・可燃性ガス検知器を連動させた全域放出方式の消火設備（Novec 1230 / FK-5-1-12 またはエアロゾル消火システム）の搭載が標準要件となります。

株式会社ソルネクサでは、消防法完全準拠の液冷蓄電コンテナ（IP55/C5防錆・自動消火連動済）の選定および所轄消防署協議サポートを行っております。`;
  } else if (q.includes('fip') || q.includes('インバランス') || q.includes('市場') || q.includes('jepx') || q.includes('需給調整') || q.includes('アービトラージ')) {
    answer = `【FIP制度における太陽光・系統用蓄電池の運用と収益最大化モデル】

2022年度より本格導入されたFIP（Feed-in Premium）制度下において、蓄電システム（BESS）の併設はインバランスリスクの回避およびマルチマーケット収益化の鍵となります。

1. FIPインバランス回避と計画値同時同量の達成:
   - 太陽光の発電予測誤差により発生するインバランスペナルティを、蓄電池のミリ秒応答充放電で即座に吸収し、計画値との乖離をゼロ化します。

2. マルチマーケット（多重市場）取引による収益モデル:
   - ① JEPX（日本卸電力取引所）アービトラージ: 昼間の余剰電力・市場安値時間帯に充電し、夕方・夜間のピーク価格時間帯に放電して鞘取りを実施。
   - ② 需給調整市場（二次調整力②・三次調整力①②等）: 一般送配電事業者の周波数制御・需給バランス維持に拠出し、待機容量フィー（ΔkW）および供出電力量（kWh）の双方を獲得。
   - ③ 容量市場（長期脱炭素電源オークション）: 系統用蓄電池単体として応札し、20年間にわたる確実な固定容量収入を確保。

3. 最適制御（スマートEMS）の重要性:
   - 気象予測、JEPX市場価格予測、出力制御指令をAIアルゴリズムで統合処理し、充放電スケジュールを自動最適化するEMSが不可欠です。

株式会社ソルネクサでは、市場連動アルゴリズムを搭載した産業用・系統用EMSおよび20年間のキャッシュフロー精緻シミュレーションを提供しております。`;
  } else if (q.includes('連系') || q.includes('特高') || q.includes('高圧') || q.includes('送配電') || q.includes('受変電') || q.includes('sld')) {
    answer = `【系統連系（特別高圧・高圧）の技術要件と設計ポイント】

一般送配電事業者（東京電力PG、関西電力、九州電力等）との系統連系協議における主要な技術課題とソルネクサの対応指針です。

1. 連系電圧区分の目安:
   - 低圧連系: 50kW未満（電柱トランス直結・逆潮流対応）
   - 高圧連系: 50kW以上 2,000kW未満（6.6kV受電、キュービクル、VCB受電保護）
   - 特別高圧連系: 2,000kW以上（22kV / 66kV / 154kV、特高変電所、GIS/特高遮断器設置）

2. ノンファーム型接続（コネクト＆マネージ）の対応:
   - 空き容量のない基幹系統への接続において、系統混雑時に出力を遠隔制御するノンファーム契約が主流です。出力制御時の損失を蓄電コンテナに充電退避させる設計が経済性を劇的に改善します。

3. 保護協調と単線結線図（SLD）設計:
   - 比率差動継電器（87T）、過電流継電器（51/51V）、地絡過電圧継電器（64OV）、逆電力継電器（67R）、不足電圧継電器（27）の整定値計算および一般送配電事業者リレーとの協調が最重要です。

画面上部「設計ツール」にて、系統連系基準に準拠した単線結線図（SLD）の作図および電圧降下・保護継電器協調の自動算定が可能です。`;
  } else if (q.includes('設計') || q.includes('プロセス') || q.includes('流れ') || q.includes('過積載') || q.includes('jis') || q.includes('ケーブル')) {
    answer = `【太陽光発電および蓄電所の基本設計〜実施設計プロセス】

高品質なEPCプロジェクトを遂行するための標準設計フロー（ソルネクサ推奨標準）をご案内します。

1. フィージビリティスタディ（FS）・基本検討:
   - 敷地測量・日影解析・地盤調査（N値確認・引抜試験）
   - NEDO日射量データベース（METPV-11/MONSOLA-11）に基づく20年発電量試算（P50/P90）
   - 系統アクセス事前相談（一般送配電事業者への接続検討照会）

2. システム最適化設計:
   - DC/AC過積載比率の最適化（最新トレンドは130%〜160%）
   - モジュールストリング設計: 冬季最低気温（-10℃〜-20℃）時の開放電圧VocがPCS最大入力電圧（1500V等）を超えない直列数の選定
   - 架台強度計算: JIS C 8955:2017に準拠した基準風速・積雪荷重・地表面粗度区分に基づく応力解析
   - 幹線ケーブル選定: JIS C 3605規格に基づく許容電流および往復電圧降下率2.0%以下抑制

3. 電気設計および許認可届出:
   - 単線結線図（SLD）、配置図、ストリングマップ作成
   - 電気事業法第48条（工事計画届出）、保安規程制定、消防法・農地法・森林法（林地開発許可）申請

ソルネクサのウェブプラットフォーム上にて、これらの計算および仕様書解析を即座にシミュレーションいただけます。`;
  } else {
    answer = `【株式会社ソルネクサ AI技術相談室からの回答】

ご質問いただき誠にありがとうございます。対話履歴を踏まえて以下の通り回答いたします。

1. 太陽光発電（PV）と系統用蓄電池（BESS）の統合アプローチ:
   - 日本国内のカーボンニュートラル達成および電力需給逼迫・再エネ出力制御への対応として、蓄電所単体設置（スタンドアローンBESS）およびPV併設型FIPモデルが急速に拡大しています。
   - 経済産業省（METI）の補助金や容量市場・需給調整市場の制度設計に合わせた事業計画策定が極めて有効です。

2. 技術基準・法令適合の重要性:
   - 電気事業法第48条（工事計画届出）および保安規程の認可手続き。
   - 総務省消防庁告示に基づく屋外蓄電コンテナの離隔距離（保有空地3m以上確保）および自動消火設備要件。
   - JIS規格（JIS C 8955、JIS C 3605、JIS C 4620キュービクル基準）および電力会社系統連系技術要件の遵守。

3. ソルネクサの提供価値:
   - 高効率N型TOPConモジュール、高圧大容量PCS、液冷式LFP蓄電コンテナ（20ft/40ft）、AIスマートEMSのワンストップ供給。
   - 画面上部「設計ツール」にて、単線結線図（SLD）作成、ケーブル電圧降下計算、BESS充放電サイジングが今すぐご利用可能です。

さらに詳細な個別案件の系統連系検討、図面作成、お見積もりにつきましては、上部の「お問い合わせ」よりいつでもお気軽にお申し付けください。専門技術者が迅速に対応いたします。`;
  }

  return {
    success: true,
    answer,
    model: targetModel,
    source: 'solnexa-knowledge-engine'
  };
}

// 1. Dedicated Multi-Turn AI Chatbot endpoint with Rate Limiting
apiRouter.post('/ai/chat', aiChatLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, model } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'メッセージ内容を入力してください。' });
    }

    const result = await executeGeminiMultiTurnChat(message, history, model);
    res.json(result);
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: 'AIチャットボットの処理中にエラーが発生しました。' });
  }
});

// 2. Consultation endpoint (backward-compatible) with Rate Limiting
apiRouter.post('/ai/consultation', aiChatLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, model } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '質問内容を入力してください。' });
    }

    const result = await executeGeminiMultiTurnChat(message, history, model);
    res.json(result);
  } catch (err: any) {
    console.error('Consultation endpoint error:', err);
    res.status(500).json({ error: 'AI技術相談の処理中にエラーが発生しました。' });
  }
});

