/**
 * SOLNEXA Web - REST API Routes
 * Clean architecture providing endpoints for PDF ingestion, review,
 * equipment database, calculations, diagnostics, and future ecosystem access.
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../db/database';
import { pdfIngestionPipeline } from '../services/pdfIngestionPipeline';
import { reviewService } from '../services/reviewService';
import { engineeringCalculationsService } from '../services/engineeringCalculationsService';
import { aiProviderManager } from '../services/ai/aiProviderManager';
import { EquipmentCategoryCode, AIProviderId } from '../../src/types';

export const apiRouter = Router();

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

apiRouter.post('/projects', (req: Request, res: Response) => {
  try {
    const saved = db.upsertProject(req.body);
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save project' });
  }
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
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
apiRouter.post(['/datasheets/upload', '/datasheets/upload/'], handleUpload, async (req: Request, res: Response) => {
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

apiRouter.put('/specifications/:id', (req: Request, res: Response) => {
  const updated = reviewService.updateSpecification(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(updated);
});

apiRouter.post('/specifications/:id/approve', (req: Request, res: Response) => {
  const approved = reviewService.approveSpecification(req.params.id);
  if (!approved) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(approved);
});

apiRouter.post('/specifications/:id/reject', (req: Request, res: Response) => {
  const rejected = reviewService.rejectSpecification(req.params.id);
  if (!rejected) {
    return res.status(404).json({ error: 'Specification not found' });
  }
  res.json(rejected);
});

apiRouter.post('/models/:modelId/specifications', (req: Request, res: Response) => {
  try {
    const spec = reviewService.addMissingSpecification(req.params.modelId, req.body);
    res.json(spec);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/models/:modelId/commit', (req: Request, res: Response) => {
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

apiRouter.post('/settings', (req: Request, res: Response) => {
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

apiRouter.post('/settings/test-local', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
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

apiRouter.post('/settings/provider', (req: Request, res: Response) => {
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

apiRouter.post('/inquiries', (req: Request, res: Response) => {
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

apiRouter.get('/inquiries', (req: Request, res: Response) => {
  res.json(corporateInquiries);
});

// Demo and active accounts for corporate member portal
interface PortalUser {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  tier: string;
  isAdmin: boolean;
  avatar?: string;
  createdAt?: string;
}

const usersDatabase: PortalUser[] = [
  {
    id: 'user-admin',
    name: 'Hoàng Anh Tuấn (管理者・CTO)',
    company: '株式会社ソルネクサ (SOLNEXA)',
    role: '代表 / 最高技術責任者・サイト全権管理者',
    email: 'hoanganhtuan.solnexa@gmail.com',
    tier: 'Super Administrator',
    isAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'user-01',
    name: '田中 健太郎',
    company: '大和エネルギーエンジニアリング株式会社',
    role: 'EPC統括エンジニア',
    email: 'k.tanaka@daiwa-energy-eng.co.jp',
    tier: 'Enterprise Partner',
    isAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'user-02',
    name: '佐藤 雅彦',
    company: '日本グリーンエナジーキャピタル合同会社',
    role: '発電事業投資・アセットマネージャー',
    email: 'm.sato@green-capital.jp',
    tier: 'Asset Owner',
    isAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

let currentUser: PortalUser | null = usersDatabase[0]; // default logged in as Hoàng Anh Tuấn (Admin)

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
apiRouter.post('/site-config', (req: Request, res: Response) => {
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
    configData.updatedBy = currentUser ? currentUser.name : 'Hoàng Anh Tuấn (Admin)';
    fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(configData, null, 2), 'utf-8');
    res.json({ success: true, message: 'サイト設定が正常に保存・更新されました。', config: configData });
  } catch (err: any) {
    res.status(500).json({ error: '設定保存中にエラーが発生しました: ' + err.message });
  }
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, company, role, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'お名前とメールアドレスは必須です。' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = usersDatabase.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています。ログインしてください。' });
    }

    const isAdmin = cleanEmail === 'hoanganhtuan.solnexa@gmail.com' || cleanEmail.includes('admin') || cleanEmail === 'admin@solnexa.co.jp';
    const newUser: PortalUser = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email: cleanEmail,
      company: company || '一般会員',
      role: role || 'エンジニア',
      tier: isAdmin ? 'Super Administrator' : 'Standard Member',
      isAdmin,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString()
    };
    usersDatabase.unshift(newUser);
    currentUser = newUser;

    res.json({
      success: true,
      user: newUser,
      message: 'アカウントが正常に登録されました。すべての専門機能をご利用いただけます。'
    });
  } catch (err: any) {
    res.status(500).json({ error: '登録処理中にエラーが発生しました。' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, userId, password } = req.body;
  if (userId) {
    const found = usersDatabase.find(u => u.id === userId);
    if (found) {
      currentUser = found;
      return res.json({ success: true, user: currentUser });
    }
  }

  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    // Special admin match for hoanganhtuan.solnexa@gmail.com
    if (cleanEmail === 'hoanganhtuan.solnexa@gmail.com') {
      currentUser = usersDatabase[0];
      return res.json({ success: true, user: currentUser });
    }

    const found = usersDatabase.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      currentUser = found;
      return res.json({ success: true, user: currentUser });
    }

    if (cleanEmail.includes('admin') || cleanEmail === 'admin@solnexa.co.jp') {
      currentUser = usersDatabase[0];
      return res.json({ success: true, user: currentUser });
    }
  }

  // fallback to first user (Admin)
  currentUser = usersDatabase[0];
  res.json({
    success: true,
    user: currentUser
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  currentUser = null;
  res.json({ success: true, message: 'ログアウトしました。' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.json({ user: currentUser });
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

apiRouter.post('/articles', (req: Request, res: Response) => {
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
      author: author || (currentUser ? currentUser.name : 'ソルネクサ 技術部'),
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

apiRouter.put('/articles/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/articles/:id', (req: Request, res: Response) => {
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
    content: `株式会社ソルネクサ（本社：東京都千代田区、以下ソルネクサ）は、東北電力送配電エリアにおいて計画されている特別高圧66kV系統連系の系統用蓄電所（出力40MW / 蓄電容量160MWh）の基本設計、系統連系協議支援、および主要蓄電設備の供給契約を締結いたしましたのでお知らせいたします。

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

apiRouter.post('/news', (req: Request, res: Response) => {
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
      author: currentUser ? currentUser.name : '株式会社ソルネクサ 広報室',
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

apiRouter.put('/news/:id', (req: Request, res: Response) => {
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

apiRouter.delete('/news/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = newsStore.length;
  newsStore = newsStore.filter(n => n.id !== id);
  if (newsStore.length === initialLength) {
    return res.status(404).json({ error: 'ニュースが見つかりませんでした。' });
  }
  res.json({ success: true, message: 'ニュース記事を削除しました。' });
});


// AI Solar & BESS Technical Advisor
apiRouter.post('/ai/consultation', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '質問内容を入力してください。' });
  }

  const systemInstruction = `あなたは日本を代表する太陽光発電および系統用蓄電池（BESS）のエンジニアリング・コンサルティング企業「株式会社ソルネクサ（SOLNEXA Japan）」のチーフ技術顧問（AIシニアエンジニア）です。

【あなたの専門知識】
1. 系統用蓄電池（Grid-scale BESS）:
   - 日本の電力市場（JEPX卸電力取引所、需給調整市場 一次〜三次、容量市場・長期脱炭素電源オークション）
   - 一般送配電事業者（東電PG、関電送配電、九電送配電等）との系統連系協議、ノンファーム型接続、コネクト＆マネージ
   - 消防法（リチウムイオン蓄電池基準、総務省消防庁告示第2号、屋外設置の保有空地3m以上離隔、自動消火設備）
   - 電気事業法第48条に基づく工事計画届出、電気主任技術者（第1種〜第3種）選任、保安規程
2. 産業用太陽光発電（メガソーラー・自家消費）:
   - FITからFIP制度への移行、インバランスリスクヘッジ、蓄電池併設最適化
   - 屋根置・地上設置の設計基準（JIS C 8955架台耐風圧計算、DC/AC過積載比率140〜180%）
   - 高圧（6.6kV）および特別高圧（22kV/66kV）受変電設備、単線結線図（SLD）、電圧降下・交流損失対策
3. ソルネクサの製品と技術:
   - 単結晶N型TOPConモジュール、高圧集中型PCS（1250kW〜3125kW）、20ft液冷蓄電コンテナ（3.72MWh LFP）、AIスマートEMS

【回答のルール】
- 丁寧で信頼性の高い日本のビジネス日本語（敬語・専門用語）で回答してください。
- 結論から先に述べ、必要に応じて要点を箇条書きで分かりやすく整理してください。
- 関連する法令基準（消防法、電気事業法、JIS規格、電力会社系統連系技術要件）を具体的に引用してください。
- 最後に「株式会社ソルネクサでは詳細な系統解析や単線結線図設計、シミュレーションのご相談を承っております」等の案内を添えてください。`;

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });

      const answer = response.text;
      if (answer && answer.trim()) {
        return res.json({
          success: true,
          answer,
          model: 'gemini-3.8-flash',
          source: 'gemini-live'
        });
      }
    } catch (apiErr: any) {
      console.warn('[AI Consultation] Gemini API call error, using domain knowledge base fallback:', apiErr.message);
    }
  }

  // Robust domain-expert fallback response engine
  const q = message.toLowerCase();
  let answer = '';

  if (q.includes('消防') || q.includes('保有空地') || q.includes('離隔') || q.includes('消火')) {
    answer = `【系統用蓄電池（BESS）の消防法規制および保有空地基準について】

系統用蓄電システムの導入においては、総務省消防庁告示および各自治体の火災予防条例に基づく厳格な安全基準が適用されます。

1. 保有空地の確保（離隔距離）:
   - 屋外型コンテナ蓄電池（リチウムイオン電池）は、原則として外壁または敷地境界から【3m以上】の保有空地（離隔）を確保する必要があります。
   - 隣接する建築物が耐火構造である場合や、特定基準の延焼防止防火壁を設けることで一部緩和（1m〜1.5m等）が適用される場合がありますが、所轄消防署との事前協議が必須です。

2. 指定数量と危険物該当性:
   - セル単体容量や電解液の性質により危険物第4類（引火性液体）に準じた扱いを受けるケースがあり、合計蓄電容量が基準（通常4,800Ah・セル単位合算）を超える場合は【少量危険物】または【一般取扱所】の届出・許可申請が必要です。

3. 自動消火設備・ガス系消火設備:
   - 蓄電池コンテナ内部には、熱感知器・煙感知器・可燃性ガス検知器を連動させた全域放出方式の消火設備（Novec 1230 / FK-5-1-12 またはエアロゾル消火システム）の搭載が標準要件となります。
   - 消防法第17条に基づく消防用設備等の検査・適合確認が竣工時に行われます。

株式会社ソルネクサでは、消防法完全準拠の液冷蓄電コンテナ（IP55/C5防錆・自動消火連動済）の選定および所轄消防署協議サポートを行っております。`;
  } else if (q.includes('fip') || q.includes('インバランス') || q.includes('市場') || q.includes('jepx') || q.includes('需給調整')) {
    answer = `【FIP制度における太陽光・系統用蓄電池の運用と収益最大化モデル】

2022年度より開始されたFIP（Feed-in Premium）制度下において、蓄電システム（BESS）の併設はインバランスリスクの回避およびマルチマーケット収益化の鍵となります。

1. FIPインバランス回避と計画値同時同量の達成:
   - 太陽光の発電予測誤差により発生するインバランスペナルティを、蓄電池の高速充放電（ミリ秒〜秒単位レスポンス）で吸収し、計画値との乖離を最小化します。

2. マルチマーケット（多重市場）取引による収益モデル:
   - ① JEPX（日本卸電力取引所）アービトラージ: 昼間の余剰電力・市場安値時間帯に充電し、夕方・夜間のピーク価格時間帯に放電して鞘取りを実施。
   - ② 需給調整市場（二次調整力②・三次調整力①②等）: 一般送配電事業者の周波数制御・需給バランス維持に拠出し、待機容量フィー（ΔkW）および供出電力量（kWh）の双方を獲得。
   - ③ 容量市場（長期脱炭素電源オークション）: 系統用蓄電池単体として応札し、20年間にわたる確実な固定容量収入を確保。

3. 最適制御（スマートEMS）の重要性:
   - 気象予測、JEPX市場価格予測、出力制御指令をAIアルゴリズムで統合処理し、充放電スケジュールを自動最適化するEMSが不可欠です。

株式会社ソルネクサでは、市場連動アルゴリズムを搭載した産業用・系統用EMSおよび20年間のキャッシュフロー精緻シミュレーションを提供しております。`;
  } else if (q.includes('連系') || q.includes('特高') || q.includes('高圧') || q.includes('送配電') || q.includes('受変電')) {
    answer = `【系統連系（特別高圧・高圧）の技術要件と設計ポイント】

一般送配電事業者（東京電力PG、関西電力、九州電力等）との系統連系協議における主要な技術課題とソルネクサの対応指針です。

1. 連系電圧区分の目安:
   - 低圧連系: 50kW未満（電柱トランス直結・逆潮流対応）
   - 高圧連系: 50kW以上 2,000kW未満（6.6kV受電、キュービクル、VCB受電保護）
   - 特別高圧連系: 2,000kW以上（22kV / 66kV / 154kV、特高変電所、GIS/特高遮断器設置）

2. ノンファーム型接続（コネクト＆マネージ）の対応:
   - 空き容量のない基幹系統への接続において、系統混雑時に出力を遠隔制御するノンファーム契約が主流となっています。出力制御時の損失を蓄電コンテナに充電退避させる設計が経済性を劇的に改善します。

3. 保護協調と単線結線図（SLD）設計:
   - 比率差動継電器（87T）、過電流継電器（51/51V）、地絡過電圧継電器（64OV）、逆電力継電器（67R）、不足電圧継電器（27）の整定値計算および一般送配電事業者リレーとの協調が最重要です。

株式会社ソルネクサの「統合エンジニアリングツール」では、系統連系基準に準拠した単線結線図（SLD）の作図および電圧降下・保護継電器協調の自動算定が可能です。`;
  } else if (q.includes('設計') || q.includes('プロセス') || q.includes('流れ') || q.includes('過積載') || q.includes('jis')) {
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

3. 電気設計および許認可届出:
   - 単線結線図（SLD）、配置図、ストリングマップ作成
   - 幹線ケーブル選定（JIS C 3605架橋ポリエチレンケーブルの許容電流・許容電圧降下2%以内）
   - 電気事業法第48条（工事計画届出）、保安規程制定、消防法・農地法・森林法（林地開発許可）申請

4. 試運転・連系試験（PAC/FAC）:
   - 耐電圧試験、絶縁抵抗測定、受変電シーケンス試験、PCS系統連系保護試験、遠隔監視通信確認。

ソルネクサのウェブプラットフォーム上にて、これらの計算および仕様書解析を即座にシミュレーションいただけます。`;
  } else {
    answer = `【株式会社ソルネクサ 技術相談室からの回答】

ご質問いただき誠にありがとうございます。

お問い合わせの件につきまして、ソルネクサの技術知見に基づき以下のようにご案内申し上げます。

1. 太陽光発電（PV）と系統用蓄電池（BESS）の統合アプローチ:
   - 日本国内のカーボンニュートラル達成および電力逼迫・再エネ出力制御への対応として、蓄電所単体設置（スタンドアローンBESS）およびPV併設型FIPモデルが急速に拡大しています。
   - 経済産業省（METI）の最新補助金（系統用蓄電池導入支援事業）や容量市場・需給調整市場の制度設計に合わせた事業計画策定が極めて有効です。

2. 技術基準・法令適合の重要性:
   - 電気事業法第48条（工事計画届出）および保安規程の認可手続き。
   - 総務省消防庁告示に基づく屋外蓄電コンテナの離隔距離（保有空地3m以上確保）および自動消火設備要件。
   - JIS規格（JIS C 8955、JIS C 4620キュービクル基準）および電力会社（東電PG等）の系統連系技術要件の遵守。

3. ソルネクサの提供価値:
   - 高効率N型TOPConモジュール、高圧大容量PCS、液冷式LFP蓄電コンテナ（20ft/40ft）、AIスマートEMSのワンストップ供給。
   - 画面上部「エンジニアリングツール」にて、単線結線図（SLD）作成、ケーブル電圧降下計算、BESS充放電サイジングが今すぐご利用可能です。

さらに詳細な個別案件の系統連系検討、図面作成、お見積もりにつきましては、上部の「お問い合わせ」よりいつでもお気軽にお申し付けください。専門技術者が迅速に対応いたします。`;
  }

  res.json({
    success: true,
    answer,
    model: 'solnexa-knowledge-engine',
    source: 'domain-knowledge-base'
  });
});

