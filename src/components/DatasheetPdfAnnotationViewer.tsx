import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Highlighter,
  Square,
  MessageSquare,
  PenTool,
  Eraser,
  Undo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Search,
  Sliders,
  Printer,
  Tag,
  Clock,
  User,
  Plus,
  StickyNote,
  Palette,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MousePointer,
  MoveRight,
  Ruler,
  Stamp,
  Camera,
  FileSpreadsheet,
  Award,
  Share2,
  Hand,
  Move,
  Expand,
  Crosshair,
  RotateCcw
} from 'lucide-react';
import { EquipmentModel, EquipmentSpecification } from '../types';

export type AnnotationTool =
  | 'select'
  | 'pan'
  | 'highlight'
  | 'box'
  | 'comment'
  | 'pen'
  | 'sticky'
  | 'arrow'
  | 'measure'
  | 'stamp'
  | 'eraser';

export interface CanvasAnnotation {
  id: string;
  modelId: string;
  page: number;
  type: 'highlight' | 'box' | 'comment' | 'pen' | 'sticky' | 'arrow' | 'measure' | 'stamp';
  x: number; // Normalized coordinate in base units (0 to 800)
  y: number; // Normalized coordinate in base units (0 to 1130)
  width?: number;
  height?: number;
  points?: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth?: number;
  commentText?: string;
  authorName?: string;
  authorRole?: string;
  createdAt: string;
  status?: 'open' | 'resolved';
  linkedSpecId?: string;
  linkedParamName?: string;
  linkedDisplayName?: string;
  tag?: string;
  isCollapsed?: boolean;
  // Extra fields for new tools
  measureValue?: string;
  stampType?: 'JIS_PASSED' | 'IEC_CERTIFIED' | 'RECHECK' | 'EPC_APPROVED' | 'JET_VERIFIED';
  stampTitle?: string;
}

export const STAMP_PRESETS = [
  {
    type: 'JIS_PASSED' as const,
    title: 'ĐÃ DUYỆT JIS C 8955',
    sub: 'Đạt kiểm định kết cấu bão gió Nhật Bản',
    code: 'JIS-PASSED',
    color: '#16a34a',
    bg: '#dcfce7',
    border: '#15803d'
  },
  {
    type: 'IEC_CERTIFIED' as const,
    title: 'ĐẠT CHUẨN IEC 61215/61730',
    sub: 'An toàn cơ điện & Độ tin cậy quang điện',
    code: 'IEC-OK',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#0369a1'
  },
  {
    type: 'RECHECK' as const,
    title: 'CẦN TÍNH TOÁN LẠI (RECHECK)',
    sub: 'Hệ số suy giảm nhiệt độ Voc & Tải trọng tuyết',
    code: 'HOLD-RECHECK',
    color: '#dc2626',
    bg: '#fee2e2',
    border: '#b91c1c'
  },
  {
    type: 'EPC_APPROVED' as const,
    title: 'PHÊ DUYỆT THI CÔNG EPC',
    sub: 'Duyệt cấu hình đấu nối chuỗi DC 1500V',
    code: 'EPC-RELEASE',
    color: '#d97706',
    bg: '#fef3c7',
    border: '#b45309'
  },
  {
    type: 'JET_VERIFIED' as const,
    title: 'CHỨNG NHẬN JET-PV',
    sub: 'Tổ chức Thử nghiệm Thiết bị Điện Nhật Bản',
    code: 'JET-JAPAN',
    color: '#9333ea',
    bg: '#f3e8ff',
    border: '#7e22ce'
  }
];

export const MEASURE_PRESETS = [
  { label: 'Chiều dài module (2278 mm)', val: '2278 mm' },
  { label: 'Chiều rộng module (1134 mm)', val: '1134 mm' },
  { label: 'Độ dày khung nhôm (30 mm)', val: '30 mm' },
  { label: 'Khoảng cách lỗ kẹp bão JIS (1400 mm)', val: '1400 mm' },
  { label: 'Khoảng cách lỗ bu lông M8 (400 mm)', val: '400 mm' }
];

interface DatasheetPdfAnnotationViewerProps {
  model: EquipmentModel | null;
  specifications: EquipmentSpecification[];
  selectedSpecId: string | null;
  onSelectSpec: (specId: string) => void;
  onAddSpecFromAnnotation?: (data: {
    parameterName: string;
    displayName: string;
    rawValue: string;
    rawUnit: string;
    sourcePage: number;
  }) => void;
  currentUser?: any;
}

const BASE_PAGE_WIDTH = 800;
const BASE_PAGE_HEIGHT = 1130;

const THICKNESS_OPTIONS = [
  { label: 'Mảnh (2px)', value: 2, lineH: 2, desc: 'Đường nét mảnh / Ghi chú chi tiết' },
  { label: 'Vừa (4px)', value: 4, lineH: 4, desc: 'Tiêu chuẩn thẩm định kỹ thuật' },
  { label: 'Đậm (8px)', value: 8, lineH: 8, desc: 'Khoanh vùng & Cảnh báo JIS' },
  { label: 'Rất đậm (14px)', value: 14, lineH: 14, desc: 'Marker vệt lớn / Tiêu đề' }
];

const COLOR_PALETTE = [
  {
    label: 'Vàng dạ quang',
    usage: 'Thông số STC & Pmax',
    value: '#facc15',
    bgClass: 'bg-yellow-400',
    pastelBg: '#fef9c3',
    textClass: 'text-yellow-950'
  },
  {
    label: 'Xanh lục JIS',
    usage: 'Đã xác thực JIS C 8955',
    value: '#22c55e',
    bgClass: 'bg-green-500',
    pastelBg: '#dcfce7',
    textClass: 'text-green-950'
  },
  {
    label: 'Xanh dương',
    usage: 'Điện áp Voc/Vmp & Dòng',
    value: '#0284c7',
    bgClass: 'bg-sky-600',
    pastelBg: '#e0f2fe',
    textClass: 'text-sky-950'
  },
  {
    label: 'Cam cảnh báo',
    usage: 'Cần rà soát lại / Lưu ý',
    value: '#f97316',
    bgClass: 'bg-orange-500',
    pastelBg: '#ffedd5',
    textClass: 'text-orange-950'
  },
  {
    label: 'Đỏ san hô',
    usage: 'Sai lệch / Bất đồng dữ liệu',
    value: '#ef4444',
    bgClass: 'bg-red-500',
    pastelBg: '#fee2e2',
    textClass: 'text-red-950'
  },
  {
    label: 'Tím tiêu chuẩn',
    usage: 'JET-PV & Bảo hành 30 năm',
    value: '#a855f7',
    bgClass: 'bg-purple-500',
    pastelBg: '#f3e8ff',
    textClass: 'text-purple-950'
  },
  {
    label: 'Trắng viền',
    usage: 'Vẽ nét viền nổi bật',
    value: '#ffffff',
    bgClass: 'bg-white border border-slate-300',
    pastelBg: '#ffffff',
    textClass: 'text-slate-900'
  },
  {
    label: 'Xám đậm than',
    usage: 'Ghi chú kỹ thuật & thước đo',
    value: '#1e293b',
    bgClass: 'bg-slate-800',
    pastelBg: '#f1f5f9',
    textClass: 'text-slate-900'
  }
];

export const DatasheetPdfAnnotationViewer: React.FC<DatasheetPdfAnnotationViewerProps> = ({
  model,
  specifications,
  selectedSpecId,
  onSelectSpec,
  onAddSpecFromAnnotation,
  currentUser
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
  const [activeColor, setActiveColor] = useState<string>('#facc15');
  const [strokeThickness, setStrokeThickness] = useState<number>(4);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isThicknessPickerOpen, setIsThicknessPickerOpen] = useState<boolean>(false);
  const [isFloatingToolbarMinimized, setIsFloatingToolbarMinimized] = useState<boolean>(false);

  // New Engineering Tool States: Stamp, Measure & Arrow
  const [selectedStampPreset, setSelectedStampPreset] = useState(STAMP_PRESETS[0]);
  const [isStampPickerOpen, setIsStampPickerOpen] = useState<boolean>(false);
  const [currentArrowPos, setCurrentArrowPos] = useState<{ x: number; y: number } | null>(null);
  const [currentMeasurePos, setCurrentMeasurePos] = useState<{ x: number; y: number } | null>(null);
  const [activeMeasurePreset, setActiveMeasurePreset] = useState<string | null>(null);
  const [isMeasurePresetOpen, setIsMeasurePresetOpen] = useState<boolean>(false);

  // Extract to Spec Modal & Drawer Filters
  const [isExtractModalOpen, setIsExtractModalOpen] = useState<boolean>(false);
  const [extractParamName, setExtractParamName] = useState<string>('nominal_max_power_pmax');
  const [extractDisplayName, setExtractDisplayName] = useState<string>('Công suất cực đại Pmax');
  const [extractRawValue, setExtractRawValue] = useState<string>('580');
  const [extractRawUnit, setExtractRawUnit] = useState<string>('W');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isExportingSnapshot, setIsExportingSnapshot] = useState<boolean>(false);

  // Sticky note dragging state
  const [draggingStickyId, setDraggingStickyId] = useState<string | null>(null);
  const [dragStickyOffset, setDragStickyOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  // Pan and Viewport Navigation States
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; startPanX: number; startPanY: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [annotations, setAnnotations] = useState<CanvasAnnotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Zoom to Fit: Calculates ideal scale so entire datasheet page fits neatly into visible viewport
  const handleZoomToFit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const paddingX = 48;
    const paddingY = 90;
    const availableW = viewport.clientWidth - paddingX;
    const availableH = viewport.clientHeight - paddingY;
    if (availableW <= 0 || availableH <= 0) return;

    const scaleW = availableW / BASE_PAGE_WIDTH;
    const scaleH = availableH / BASE_PAGE_HEIGHT;
    const fitScale = Math.min(scaleW, scaleH);
    const clamped = Math.max(0.35, Math.min(1.8, Number(fitScale.toFixed(2))));
    setZoomScale(clamped);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Fit Width: Scales datasheet so width matches viewport width
  const handleFitWidth = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const paddingX = 40;
    const availableW = viewport.clientWidth - paddingX;
    if (availableW <= 0) return;

    const scaleW = availableW / BASE_PAGE_WIDTH;
    const clamped = Math.max(0.4, Math.min(2.0, Number(scaleW.toFixed(2))));
    setZoomScale(clamped);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Reset to 100% scale and center pan
  const handleResetView = useCallback(() => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Reset Pan only
  const handleResetPan = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Panning movement helpers
  const startPanning = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    panStartRef.current = {
      clientX,
      clientY,
      startPanX: panOffset.x,
      startPanY: panOffset.y
    };
  }, [panOffset]);

  const updatePanning = useCallback((clientX: number, clientY: number) => {
    if (!panStartRef.current) return;
    const dx = clientX - panStartRef.current.clientX;
    const dy = clientY - panStartRef.current.clientY;
    setPanOffset({
      x: Math.round(panStartRef.current.startPanX + dx),
      y: Math.round(panStartRef.current.startPanY + dy)
    });
  }, []);

  const stopPanning = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  // Wheel event: smooth pan or zoom with Ctrl/Meta/Alt
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomScale(prev => {
        return Math.max(0.35, Math.min(2.0, Number((prev + delta).toFixed(2))));
      });
    } else {
      const target = e.target as HTMLElement;
      if (target.closest('.overflow-y-auto') || target.closest('textarea')) return;

      const deltaX = e.shiftKey ? e.deltaY : e.deltaX;
      const deltaY = e.shiftKey ? 0 : e.deltaY;
      setPanOffset(prev => ({
        x: Math.round(prev.x - deltaX),
        y: Math.round(prev.y - deltaY)
      }));
    }
  }, []);

  // Viewport background pointer handlers for click-drag panning
  const handleViewportPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('.floating-popover-panel') ||
      target.closest('.sticky-note-card') ||
      target.tagName === 'CANVAS'
    ) {
      return;
    }
    startPanning(e.clientX, e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  }, [startPanning]);

  const handleViewportPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      updatePanning(e.clientX, e.clientY);
    }
  }, [isPanning, updatePanning]);

  const handleViewportPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      stopPanning();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  }, [isPanning, stopPanning]);

  // Initial fit on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleZoomToFit();
    }, 150);
    return () => clearTimeout(timer);
  }, [handleZoomToFit]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentDragRect, setCurrentDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [currentPenPath, setCurrentPenPath] = useState<Array<{ x: number; y: number }>>([]);

  // Popover & Drawer states
  const [editingCommentAnnotation, setEditingCommentAnnotation] = useState<CanvasAnnotation | null>(null);
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState<boolean>(false);
  const [filterCommentStatus, setFilterCommentStatus] = useState<'all' | 'open' | 'resolved'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unique storage key per model
  const storageKey = useMemo(() => {
    return model ? `solnexa_datasheet_annotations_${model.id}` : 'solnexa_datasheet_annotations_default';
  }, [model]);

  // Load annotations from localStorage (or populate sample annotations on first open)
  useEffect(() => {
    if (!model) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAnnotations(JSON.parse(saved));
      } else {
        // Generate realistic initial verification annotations for engineers
        const initialSample: CanvasAnnotation[] = [
          {
            id: `anno-init-1-${model.id}`,
            modelId: model.id,
            page: 1,
            type: 'highlight',
            x: 48,
            y: 215,
            width: 704,
            height: 28,
            color: '#facc15',
            commentText: 'STC Peak Power đã đối chiếu chuẩn IEC 61215: 1000 W/m², AM1.5, Cell temp 25°C',
            authorName: 'Hoàng Anh Tuấn (CTO)',
            authorRole: 'Chief Engineer',
            createdAt: '2026-10-07 05:30',
            status: 'resolved',
            tag: 'Kiểm định STC',
            linkedParamName: 'rated_power_pmax',
            linkedDisplayName: 'Peak Power Pmax (STC)'
          },
          {
            id: `anno-init-2-${model.id}`,
            modelId: model.id,
            page: 1,
            type: 'box',
            x: 48,
            y: 285,
            width: 704,
            height: 56,
            color: '#0284c7',
            commentText: 'Điện áp Voc 51.42V và dòng Isc 14.42A đạt chuẩn kết nối PCS chuỗi 1500V DC',
            authorName: 'Kenji Sato',
            authorRole: 'PV Electrical Lead',
            createdAt: '2026-10-07 05:35',
            status: 'open',
            tag: 'Thông số điện áp',
            linkedParamName: 'open_circuit_voltage_voc',
            linkedDisplayName: 'Open Circuit Voltage Voc'
          },
          {
            id: `anno-init-stamp-${model.id}`,
            modelId: model.id,
            page: 1,
            type: 'stamp',
            x: 680,
            y: 110,
            color: '#16a34a',
            stampType: 'JIS_PASSED',
            stampTitle: 'ĐÃ DUYỆT JIS C 8955',
            authorName: 'Hoàng Anh Tuấn (CTO)',
            createdAt: '2026-10-07',
            status: 'resolved',
            tag: 'Phê duyệt tiêu chuẩn'
          },
          {
            id: `anno-init-measure-${model.id}`,
            modelId: model.id,
            page: 3,
            type: 'measure',
            x: 180,
            y: 640,
            points: [
              { x: 180, y: 640 },
              { x: 620, y: 640 }
            ],
            color: '#0284c7',
            measureValue: '1400 mm Pitch (JIS Clamp Zone)',
            authorName: 'Kỹ sư Thẩm định',
            createdAt: '2026-10-07',
            status: 'resolved',
            tag: 'Kích thước cơ khí'
          },
          {
            id: `anno-init-3-${model.id}`,
            page: 2,
            type: 'comment',
            modelId: model.id,
            x: 210,
            y: 395,
            color: '#f97316',
            commentText: 'Hệ số suy giảm nhiệt độ Voc -0.24%/°C: Cần tính toán lại tại nhiệt độ cực tiểu -15°C khu vực Tohoku.',
            authorName: 'Kỹ sư Thẩm định',
            authorRole: 'EPC Design Engineer',
            createdAt: '2026-10-07 05:40',
            status: 'open',
            tag: 'Lưu ý thiết kế'
          }
        ];
        setAnnotations(initialSample);
        localStorage.setItem(storageKey, JSON.stringify(initialSample));
      }
    } catch (e) {
      console.warn('Failed to load annotations:', e);
    }
  }, [model, storageKey]);

  // Save annotations to localStorage
  const saveAnnotations = useCallback((newAnnotations: CanvasAnnotation[]) => {
    setAnnotations(newAnnotations);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newAnnotations));
    } catch (e) {
      console.warn('Failed to save annotations:', e);
    }
  }, [storageKey]);

  // When selectedSpecId changes from table, switch page and focus
  useEffect(() => {
    if (!selectedSpecId) return;
    const spec = specifications.find(s => s.id === selectedSpecId);
    if (spec && spec.sourcePage && spec.sourcePage >= 1 && spec.sourcePage <= totalPages) {
      setCurrentPage(spec.sourcePage);
      // Find linked annotation or create visual focus
      const linked = annotations.find(
        a => a.linkedSpecId === spec.id || (a.linkedParamName && a.linkedParamName === spec.parameterName)
      );
      if (linked) {
        setSelectedAnnotationId(linked.id);
      }
    }
  }, [selectedSpecId, specifications, totalPages, annotations]);

  // Canvas render loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = BASE_PAGE_WIDTH * zoomScale;
    const displayHeight = BASE_PAGE_HEIGHT * zoomScale;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const scale = zoomScale;

    // Filter annotations for current page
    const pageAnnos = annotations.filter(a => a.page === currentPage);

    // 1. Draw Highlights
    pageAnnos
      .filter(a => a.type === 'highlight')
      .forEach(a => {
        const x = a.x * scale;
        const y = a.y * scale;
        const w = (a.width || 100) * scale;
        const h = (a.height || 24) * scale;
        const isSelected = selectedAnnotationId === a.id;

        ctx.save();
        ctx.fillStyle = a.color;
        ctx.globalAlpha = 0.38;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.fill();

        // Border highlight
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = isSelected ? 2.5 : 1;
        if (isSelected) {
          ctx.setLineDash([]);
        }
        ctx.stroke();

        if (isSelected) {
          // Draw subtle glow corners
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
        }
        ctx.restore();
      });

    // 2. Draw Bounding Boxes
    pageAnnos
      .filter(a => a.type === 'box')
      .forEach(a => {
        const x = a.x * scale;
        const y = a.y * scale;
        const w = (a.width || 120) * scale;
        const h = (a.height || 40) * scale;
        const isSelected = selectedAnnotationId === a.id;

        ctx.save();
        // Soft translucent fill
        ctx.fillStyle = a.color;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x, y, w, h);

        // Crisp border
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.setLineDash(isSelected ? [6, 3] : []);
        ctx.strokeRect(x, y, w, h);

        // Corner handles
        const handleSize = 6 * Math.min(1.2, scale);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        // 4 corners
        [
          [x, y],
          [x + w, y],
          [x, y + h],
          [x + w, y + h]
        ].forEach(([cx, cy]) => {
          ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
        });

        // Label Tag if present
        if (a.linkedDisplayName || a.tag) {
          const labelText = a.linkedDisplayName || a.tag || '';
          ctx.font = `bold ${Math.max(10, 11 * scale)}px sans-serif`;
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillStyle = a.color;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.roundRect(x, y - 18 * scale, textWidth + 12, 18 * scale, [4, 4, 0, 0]);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, x + 6, y - 5 * scale);
        }

        ctx.restore();
      });

    // 3. Draw Freehand Pen Strokes
    pageAnnos
      .filter(a => a.type === 'pen' && a.points && a.points.length > 1)
      .forEach(a => {
        const pts = a.points!;
        ctx.save();
        ctx.strokeStyle = a.color;
        ctx.lineWidth = (a.strokeWidth || strokeThickness || 3) * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.88;

        ctx.beginPath();
        ctx.moveTo(pts[0].x * scale, pts[0].y * scale);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * scale, pts[i].y * scale);
        }
        ctx.stroke();
        ctx.restore();
      });

    // 4. Draw Comment & Sticky Pins on Canvas (for export & backdrop)
    pageAnnos
      .filter(a => a.type === 'comment' || a.type === 'sticky')
      .forEach((a, idx) => {
        const x = a.x * scale;
        const y = a.y * scale;
        const isSelected = selectedAnnotationId === a.id;
        const pinRadius = 14 * Math.min(1.2, scale);

        ctx.save();
        // Pin shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        // Pin bubble
        ctx.fillStyle = a.status === 'resolved' ? '#10b981' : a.color;
        ctx.beginPath();
        ctx.arc(x, y, pinRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pin border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = isSelected ? '#1e293b' : '#ffffff';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Icon text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, 11 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.type === 'sticky' ? `📌${idx + 1}` : `💬${idx + 1}`, x, y);

        ctx.restore();
      });

    // 5. Draw Arrows (Engineering pointers to graphs, curves & tables)
    pageAnnos
      .filter(a => a.type === 'arrow' && a.points && a.points.length >= 2)
      .forEach(a => {
        const start = a.points![0];
        const end = a.points![1];
        const sx = start.x * scale;
        const sy = start.y * scale;
        const ex = end.x * scale;
        const ey = end.y * scale;
        const isSelected = selectedAnnotationId === a.id;

        ctx.save();
        ctx.strokeStyle = a.color;
        ctx.lineWidth = (a.strokeWidth || strokeThickness || 3) * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw shaft
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(ey - sy, ex - sx);
        const headlen = 15 * Math.min(1.4, scale);
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - headlen * Math.cos(angle - Math.PI / 6),
          ey - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ex - headlen * Math.cos(angle + Math.PI / 6),
          ey - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(
            Math.min(sx, ex) - 6,
            Math.min(sy, ey) - 6,
            Math.abs(ex - sx) + 12,
            Math.abs(ey - sy) + 12
          );
        }
        ctx.restore();
      });

    // 6. Draw Dimension Calipers / Mechanical Measures (Mounting Pitch & Dimensions)
    pageAnnos
      .filter(a => a.type === 'measure' && a.points && a.points.length >= 2)
      .forEach(a => {
        const start = a.points![0];
        const end = a.points![1];
        const sx = start.x * scale;
        const sy = start.y * scale;
        const ex = end.x * scale;
        const ey = end.y * scale;
        const isSelected = selectedAnnotationId === a.id;
        const dist = Math.hypot(ex - sx, ey - sy);
        const label = a.measureValue || `${Math.round((dist / scale) * 2.85)} mm`;

        ctx.save();
        ctx.strokeStyle = a.color;
        ctx.lineWidth = (a.strokeWidth || 2.5) * scale;

        // Dimension line
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Extension perpendicular ticks
        const angle = Math.atan2(ey - sy, ex - sx);
        const perpAngle = angle + Math.PI / 2;
        const tickLen = 9 * scale;

        [[sx, sy], [ex, ey]].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.moveTo(px - tickLen * Math.cos(perpAngle), py - tickLen * Math.sin(perpAngle));
          ctx.lineTo(px + tickLen * Math.cos(perpAngle), py + tickLen * Math.sin(perpAngle));
          ctx.stroke();
        });

        // Midpoint measurement badge
        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;

        ctx.font = `bold ${Math.max(10, 11 * scale)}px sans-serif`;
        const textWidth = ctx.measureText(`📏 ${label}`).width;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(midX - (textWidth + 14) / 2, midY - 11 * scale, textWidth + 14, 22 * scale, 4);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : a.color;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📏 ${label}`, midX, midY);

        ctx.restore();
      });

    // 7. Draw Official Engineering Stamps (JIS C 8955, IEC 61215, RECHECK, EPC APPROVED)
    pageAnnos
      .filter(a => a.type === 'stamp')
      .forEach(a => {
        const x = a.x * scale;
        const y = a.y * scale;
        const isSelected = selectedAnnotationId === a.id;
        const w = 186 * Math.min(1.2, scale);
        const h = 76 * Math.min(1.2, scale);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.06); // -3.5 degrees realistic rubber stamp slant

        // Tint background
        ctx.fillStyle = a.color === '#16a34a' ? '#f0fdf4' : a.color === '#dc2626' ? '#fef2f2' : '#eff6ff';
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 8);
        ctx.fill();

        // Outer thick rubber border
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Inner thin border
        ctx.lineWidth = 1;
        ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);

        // Header: SOLNEXA REVIEW
        ctx.fillStyle = a.color;
        ctx.font = `bold ${Math.max(8, 9 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('★ SOLNEXA VERIFIED REVIEW ★', 0, -h / 2 + 7);

        // Main Stamp Title
        ctx.font = `900 ${Math.max(11, 13 * scale)}px sans-serif`;
        ctx.fillText(a.stampTitle || 'ĐÃ DUYỆT JIS C 8955', 0, -h / 2 + 23 * scale);

        // Date & Signer
        ctx.font = `normal ${Math.max(8, 9 * scale)}px monospace`;
        ctx.fillText(`${a.createdAt || '2026-10-07'} ｜ ${a.authorName || 'Kỹ sư'}`, 0, -h / 2 + 47 * scale);

        if (isSelected) {
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6);
        }

        ctx.restore();
      });

    // 8. Draw In-progress Interactive Drafts (Dragging Rect, Pen, Arrow or Measure)
    if (isDrawing && dragStartPos) {
      if (activeTool === 'highlight' && currentDragRect) {
        ctx.save();
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = 0.42;
        ctx.fillRect(
          currentDragRect.x * scale,
          currentDragRect.y * scale,
          currentDragRect.w * scale,
          currentDragRect.h * scale
        );
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = Math.max(1.5, strokeThickness / 2) * scale;
        ctx.strokeRect(
          currentDragRect.x * scale,
          currentDragRect.y * scale,
          currentDragRect.w * scale,
          currentDragRect.h * scale
        );
        ctx.restore();
      } else if (activeTool === 'box' && currentDragRect) {
        ctx.save();
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = 0.12;
        ctx.fillRect(
          currentDragRect.x * scale,
          currentDragRect.y * scale,
          currentDragRect.w * scale,
          currentDragRect.h * scale
        );
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = Math.max(2, strokeThickness / 2) * scale;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(
          currentDragRect.x * scale,
          currentDragRect.y * scale,
          currentDragRect.w * scale,
          currentDragRect.h * scale
        );
        ctx.restore();
      } else if (activeTool === 'pen' && currentPenPath.length > 1) {
        ctx.save();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeThickness * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.88;

        ctx.beginPath();
        ctx.moveTo(currentPenPath[0].x * scale, currentPenPath[0].y * scale);
        for (let i = 1; i < currentPenPath.length; i++) {
          ctx.lineTo(currentPenPath[i].x * scale, currentPenPath[i].y * scale);
        }
        ctx.stroke();
        ctx.restore();
      } else if (activeTool === 'arrow' && currentArrowPos) {
        // Live Arrow preview
        ctx.save();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = strokeThickness * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(dragStartPos.x * scale, dragStartPos.y * scale);
        ctx.lineTo(currentArrowPos.x * scale, currentArrowPos.y * scale);
        ctx.stroke();

        const angle = Math.atan2(
          (currentArrowPos.y - dragStartPos.y) * scale,
          (currentArrowPos.x - dragStartPos.x) * scale
        );
        const headlen = 15 * Math.min(1.4, scale);
        ctx.fillStyle = activeColor;
        ctx.beginPath();
        ctx.moveTo(currentArrowPos.x * scale, currentArrowPos.y * scale);
        ctx.lineTo(
          currentArrowPos.x * scale - headlen * Math.cos(angle - Math.PI / 6),
          currentArrowPos.y * scale - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          currentArrowPos.x * scale - headlen * Math.cos(angle + Math.PI / 6),
          currentArrowPos.y * scale - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (activeTool === 'measure' && currentMeasurePos) {
        // Live Measure preview
        ctx.save();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2.5 * scale;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(dragStartPos.x * scale, dragStartPos.y * scale);
        ctx.lineTo(currentMeasurePos.x * scale, currentMeasurePos.y * scale);
        ctx.stroke();
        ctx.setLineDash([]);

        const dist = Math.hypot(currentMeasurePos.x - dragStartPos.x, currentMeasurePos.y - dragStartPos.y);
        const liveLabel = `${Math.round(dist * 2.85)} mm`;
        const midX = ((dragStartPos.x + currentMeasurePos.x) / 2) * scale;
        const midY = ((dragStartPos.y + currentMeasurePos.y) / 2) * scale;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(midX - 45, midY - 12, 90, 24);
        ctx.strokeStyle = activeColor;
        ctx.strokeRect(midX - 45, midY - 12, 90, 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`📏 ${liveLabel}`, midX, midY);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [
    annotations,
    currentPage,
    zoomScale,
    selectedAnnotationId,
    isDrawing,
    dragStartPos,
    activeTool,
    activeColor,
    currentDragRect,
    currentPenPath,
    currentArrowPos,
    currentMeasurePos,
    strokeThickness
  ]);

  // Trigger re-render whenever dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer coordinate calculation relative to base page
  const getPointerBaseCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const x = Math.max(0, Math.min(BASE_PAGE_WIDTH, clientX / zoomScale));
    const y = Math.max(0, Math.min(BASE_PAGE_HEIGHT, clientY / zoomScale));
    return { x, y };
  };

  // Pointer Down Handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // 0. If in Pan tool or holding Space or using middle mouse button: initiate PAN
    if (activeTool === 'pan' || isSpacePressed || e.button === 1) {
      e.preventDefault();
      startPanning(e.clientX, e.clientY);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch (err) {}
      return;
    }

    const { x, y } = getPointerBaseCoords(e);

    // 1. If tool is Eraser: find clicked annotation and delete it
    if (activeTool === 'eraser') {
      const hit = findHitAnnotation(x, y);
      if (hit) {
        const next = annotations.filter(a => a.id !== hit.id);
        saveAnnotations(next);
        if (selectedAnnotationId === hit.id) setSelectedAnnotationId(null);
      }
      return;
    }

    // 2. If tool is Select: check if clicked an existing annotation
    if (activeTool === 'select') {
      const hit = findHitAnnotation(x, y);
      if (hit) {
        setSelectedAnnotationId(hit.id);
        if (hit.linkedSpecId) {
          onSelectSpec(hit.linkedSpecId);
        }
        if (hit.type === 'comment' || hit.commentText) {
          setEditingCommentAnnotation(hit);
        }
      } else {
        setSelectedAnnotationId(null);
      }
      return;
    }

    // 3. If tool is Stamp: stamp directly on click
    if (activeTool === 'stamp') {
      const newStampAnno: CanvasAnnotation = {
        id: `anno-stamp-${Date.now()}`,
        modelId: model?.id || 'unknown',
        page: currentPage,
        type: 'stamp',
        x: Math.round(x),
        y: Math.round(y),
        color: selectedStampPreset.color,
        stampType: selectedStampPreset.type,
        stampTitle: selectedStampPreset.title,
        authorName: currentUser?.name || 'Hoàng Anh Tuấn (CTO)',
        authorRole: currentUser?.role || 'Lead Auditor',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        status: 'resolved',
        tag: 'Kiểm định tiêu chuẩn'
      };
      const updated = [...annotations, newStampAnno];
      saveAnnotations(updated);
      setSelectedAnnotationId(newStampAnno.id);
      setActiveTool('select');
      return;
    }

    // 4. If tool is Sticky Note or Comment: place sticky note directly on click
    if (activeTool === 'sticky' || activeTool === 'comment') {
      const newStickyAnno: CanvasAnnotation = {
        id: `anno-sticky-${Date.now()}`,
        modelId: model?.id || 'unknown',
        page: currentPage,
        type: 'sticky',
        x: Math.round(Math.max(10, Math.min(BASE_PAGE_WIDTH - 260, x))),
        y: Math.round(Math.max(10, Math.min(BASE_PAGE_HEIGHT - 160, y))),
        color: activeColor,
        authorName: currentUser?.name || 'Kỹ sư Thẩm định',
        authorRole: currentUser?.role || 'Reviewer Engineer',
        createdAt: new Date().toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'open',
        tag: 'Ghi chú kỹ thuật',
        commentText: '',
        isCollapsed: false
      };
      const updated = [...annotations, newStickyAnno];
      saveAnnotations(updated);
      setSelectedAnnotationId(newStickyAnno.id);
      setActiveTool('select');
      return;
    }

    // 5. If tool is Arrow or Measure: begin drag vector
    if (activeTool === 'arrow') {
      setIsDrawing(true);
      setDragStartPos({ x, y });
      setCurrentArrowPos({ x, y });
      return;
    }

    if (activeTool === 'measure') {
      setIsDrawing(true);
      setDragStartPos({ x, y });
      setCurrentMeasurePos({ x, y });
      return;
    }

    // 6. If tool is Highlight, Box, or Pen: begin drag
    setIsDrawing(true);
    setDragStartPos({ x, y });
    if (activeTool === 'pen') {
      setCurrentPenPath([{ x, y }]);
    } else {
      setCurrentDragRect({ x, y, w: 0, h: 0 });
    }
  };

  // Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      updatePanning(e.clientX, e.clientY);
      return;
    }

    if (!isDrawing || !dragStartPos) return;
    const { x, y } = getPointerBaseCoords(e);

    if (activeTool === 'arrow') {
      setCurrentArrowPos({ x, y });
    } else if (activeTool === 'measure') {
      setCurrentMeasurePos({ x, y });
    } else if (activeTool === 'pen') {
      setCurrentPenPath(prev => [...prev, { x, y }]);
    } else if (activeTool === 'highlight' || activeTool === 'box') {
      const startX = Math.min(dragStartPos.x, x);
      const startY = Math.min(dragStartPos.y, y);
      const w = Math.abs(x - dragStartPos.x);
      const h = Math.abs(y - dragStartPos.y);
      setCurrentDragRect({ x: startX, y: startY, w, h });
    }
  };

  // Pointer Up Handler
  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      stopPanning();
      if (e) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'arrow' && dragStartPos && currentArrowPos) {
      if (Math.hypot(currentArrowPos.x - dragStartPos.x, currentArrowPos.y - dragStartPos.y) > 10) {
        const newAnno: CanvasAnnotation = {
          id: `anno-arrow-${Date.now()}`,
          modelId: model?.id || 'unknown',
          page: currentPage,
          type: 'arrow',
          x: Math.round(Math.min(dragStartPos.x, currentArrowPos.x)),
          y: Math.round(Math.min(dragStartPos.y, currentArrowPos.y)),
          points: [dragStartPos, currentArrowPos],
          color: activeColor,
          strokeWidth: strokeThickness,
          authorName: currentUser?.name || 'Kỹ sư Thẩm định',
          createdAt: new Date().toLocaleString('vi-VN'),
          status: 'open',
          tag: 'Mũi tên chỉ dẫn'
        };
        const updated = [...annotations, newAnno];
        saveAnnotations(updated);
        setSelectedAnnotationId(newAnno.id);
      }
    } else if (activeTool === 'measure' && dragStartPos && currentMeasurePos) {
      const dist = Math.hypot(currentMeasurePos.x - dragStartPos.x, currentMeasurePos.y - dragStartPos.y);
      if (dist > 10) {
        const computedVal = activeMeasurePreset || `${Math.round(dist * 2.85)} mm`;
        const newAnno: CanvasAnnotation = {
          id: `anno-measure-${Date.now()}`,
          modelId: model?.id || 'unknown',
          page: currentPage,
          type: 'measure',
          x: Math.round(Math.min(dragStartPos.x, currentMeasurePos.x)),
          y: Math.round(Math.min(dragStartPos.y, currentMeasurePos.y)),
          points: [dragStartPos, currentMeasurePos],
          color: activeColor,
          strokeWidth: 2.5,
          measureValue: computedVal,
          authorName: currentUser?.name || 'Kỹ sư Thẩm định',
          createdAt: new Date().toLocaleString('vi-VN'),
          status: 'resolved',
          tag: 'Kích thước cơ khí'
        };
        const updated = [...annotations, newAnno];
        saveAnnotations(updated);
        setSelectedAnnotationId(newAnno.id);
      }
    } else if ((activeTool === 'highlight' || activeTool === 'box') && currentDragRect) {
      // Only keep if size is reasonable (> 8px)
      if (currentDragRect.w > 8 && currentDragRect.h > 8) {
        // Try to automatically link to closest spec if on page 1
        let linkedSpec = specifications.find(
          s => s.sourcePage === currentPage && Math.abs(s.sourcePage - currentPage) === 0
        );
        if (selectedSpecId) {
          const sel = specifications.find(s => s.id === selectedSpecId);
          if (sel) linkedSpec = sel;
        }

        const newAnno: CanvasAnnotation = {
          id: `anno-${Date.now()}`,
          modelId: model?.id || 'unknown',
          page: currentPage,
          type: activeTool,
          x: Math.round(currentDragRect.x),
          y: Math.round(currentDragRect.y),
          width: Math.round(currentDragRect.w),
          height: Math.round(currentDragRect.h),
          color: activeColor,
          strokeWidth: strokeThickness,
          authorName: currentUser?.name || 'Kỹ sư Thẩm định',
          authorRole: currentUser?.role || 'Reviewer Engineer',
          createdAt: new Date().toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: 'open',
          linkedSpecId: linkedSpec?.id,
          linkedParamName: linkedSpec?.parameterName,
          linkedDisplayName: linkedSpec?.displayName,
          commentText: linkedSpec ? `Đã gắn với thông số: ${linkedSpec.displayName}` : ''
        };

        const updated = [...annotations, newAnno];
        saveAnnotations(updated);
        setSelectedAnnotationId(newAnno.id);
      }
    } else if (activeTool === 'pen' && currentPenPath.length > 2) {
      const minX = Math.min(...currentPenPath.map(p => p.x));
      const minY = Math.min(...currentPenPath.map(p => p.y));
      const newAnno: CanvasAnnotation = {
        id: `anno-pen-${Date.now()}`,
        modelId: model?.id || 'unknown',
        page: currentPage,
        type: 'pen',
        x: Math.round(minX),
        y: Math.round(minY),
        points: currentPenPath,
        color: activeColor,
        strokeWidth: strokeThickness,
        createdAt: new Date().toLocaleString('vi-VN')
      };
      const updated = [...annotations, newAnno];
      saveAnnotations(updated);
    }

    setDragStartPos(null);
    setCurrentDragRect(null);
    setCurrentPenPath([]);
    setCurrentArrowPos(null);
    setCurrentMeasurePos(null);
  };

  // Helper function to test point-to-segment distance
  const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  };

  // Hit test helper
  const findHitAnnotation = (x: number, y: number): CanvasAnnotation | undefined => {
    const pageAnnos = annotations.filter(a => a.page === currentPage);
    // Search in reverse order (topmost first)
    for (let i = pageAnnos.length - 1; i >= 0; i--) {
      const a = pageAnnos[i];
      if (a.type === 'stamp') {
        if (Math.abs(x - a.x) <= 95 && Math.abs(y - a.y) <= 40) return a;
      } else if (a.type === 'arrow' || a.type === 'measure') {
        if (a.points && a.points.length >= 2) {
          const d = distToSegment(x, y, a.points[0].x, a.points[0].y, a.points[1].x, a.points[1].y);
          if (d <= 14) return a;
        }
      } else if (a.type === 'comment' || a.type === 'sticky') {
        const dist = Math.hypot(x - a.x, y - a.y);
        if (dist <= 24) return a;
        if (!a.isCollapsed && x >= a.x && x <= a.x + 250 && y >= a.y && y <= a.y + 180) {
          return a;
        }
      } else if (a.type === 'highlight' || a.type === 'box') {
        const w = a.width || 100;
        const h = a.height || 30;
        if (x >= a.x && x <= a.x + w && y >= a.y && y <= a.y + h) {
          return a;
        }
      } else if (a.type === 'pen' && a.points) {
        for (const pt of a.points) {
          if (Math.hypot(x - pt.x, y - pt.y) <= 8) return a;
        }
      }
    }
    return undefined;
  };

  // Undo Last Action
  const handleUndo = () => {
    if (annotations.length === 0) return;
    const pageAnnos = annotations.filter(a => a.page === currentPage);
    if (pageAnnos.length === 0) return;
    const lastId = pageAnnos[pageAnnos.length - 1].id;
    const next = annotations.filter(a => a.id !== lastId);
    saveAnnotations(next);
    if (selectedAnnotationId === lastId) setSelectedAnnotationId(null);
  };

  // Clear Page Annotations
  const handleClearCurrentPage = () => {
    if (!window.confirm(`Bạn có chắc muốn xóa toàn bộ ghi chú trên Trang ${currentPage}?`)) return;
    const next = annotations.filter(a => a.page !== currentPage);
    saveAnnotations(next);
    setSelectedAnnotationId(null);
  };

  // Save changes to a comment
  const handleSaveComment = (annoId: string, updates: Partial<CanvasAnnotation>) => {
    const updated = annotations.map(a => (a.id === annoId ? { ...a, ...updates } : a));
    saveAnnotations(updated);
    setEditingCommentAnnotation(null);
  };

  // Delete annotation
  const handleDeleteAnnotation = (annoId: string) => {
    const updated = annotations.filter(a => a.id !== annoId);
    saveAnnotations(updated);
    if (selectedAnnotationId === annoId) setSelectedAnnotationId(null);
    if (editingCommentAnnotation?.id === annoId) setEditingCommentAnnotation(null);
  };

  // Drag sticky note handlers
  const handleStickyPointerDown = (annoId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedAnnotationId(annoId);
    setDraggingStickyId(annoId);
    const cardEl = (e.currentTarget as HTMLElement).closest('.sticky-note-card');
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setDragStickyOffset({
        x: (e.clientX - rect.left) / zoomScale,
        y: (e.clientY - rect.top) / zoomScale
      });
    }
  };

  useEffect(() => {
    if (!draggingStickyId) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newX = Math.max(10, Math.min(BASE_PAGE_WIDTH - 250, (e.clientX - rect.left) / zoomScale - dragStickyOffset.x));
      const newY = Math.max(10, Math.min(BASE_PAGE_HEIGHT - 120, (e.clientY - rect.top) / zoomScale - dragStickyOffset.y));

      setAnnotations(prev =>
        prev.map(a => (a.id === draggingStickyId ? { ...a, x: Math.round(newX), y: Math.round(newY) } : a))
      );
    };

    const handlePointerUp = () => {
      setDraggingStickyId(null);
      saveAnnotations(annotations);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingStickyId, dragStickyOffset, zoomScale, annotations, saveAnnotations]);

  // Click outside to close color, thickness, and stamp popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-popover-panel') && !target.closest('.floating-popover-trigger')) {
        setIsColorPickerOpen(false);
        setIsThicknessPickerOpen(false);
        setIsStampPickerOpen(false);
        setIsMeasurePresetOpen(false);
      }
    };
    if (isColorPickerOpen || isThicknessPickerOpen || isStampPickerOpen || isMeasurePresetOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isColorPickerOpen, isThicknessPickerOpen, isStampPickerOpen, isMeasurePresetOpen]);

  // Keyboard shortcuts (Space=Pan hold, H=Pan, V=Select, P=Pen, G=Highlight, S=Sticky, B=Box, A=Arrow, M=Measure, T=Stamp, E=Eraser, F/0=Zoom to Fit, W=Fit Width, 1=100%, Ctrl+Z=Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Spacebar hold to temporarily Pan
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          setActiveTool('pan');
          break;
        case 'v':
          setActiveTool('select');
          break;
        case 'p':
        case '2':
          setActiveTool('pen');
          break;
        case 'g':
        case '3':
          setActiveTool('highlight');
          break;
        case 's':
        case '4':
          setActiveTool('sticky');
          break;
        case 'b':
        case '5':
          setActiveTool('box');
          break;
        case 'a':
        case '6':
          setActiveTool('arrow');
          break;
        case 'm':
        case '7':
          setActiveTool('measure');
          break;
        case 't':
        case '8':
          setActiveTool('stamp');
          break;
        case 'e':
        case '9':
          setActiveTool('eraser');
          break;
        case 'f':
        case '0':
          e.preventDefault();
          handleZoomToFit();
          break;
        case 'w':
          e.preventDefault();
          handleFitWidth();
          break;
        case '1':
          if (!e.shiftKey) {
            handleResetView();
          }
          break;
        case '=':
        case '+':
          e.preventDefault();
          setZoomScale(s => Math.min(2.0, Number((s + 0.15).toFixed(2))));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setZoomScale(s => Math.max(0.35, Number((s - 0.15).toFixed(2))));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [annotations, currentPage, handleZoomToFit, handleFitWidth, handleResetView]);

  // Export High-Resolution Annotated Snapshot PNG
  const handleExportSnapshot = () => {
    setIsExportingSnapshot(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const exportCanvas = document.createElement('canvas');
      const w = BASE_PAGE_WIDTH * 2;
      const h = BASE_PAGE_HEIGHT * 2;
      exportCanvas.width = w;
      exportCanvas.height = h;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw header watermark banner
      ctx.save();
      ctx.scale(2, 2);
      ctx.fillStyle = '#002B49';
      ctx.fillRect(32, 20, BASE_PAGE_WIDTH - 64, 4);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(model?.manufacturerName || 'SOLNEXA', 32, 48);

      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(model?.modelName || 'Vertex N Series TOPCon Module', 32, 70);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText(
        `JIS C 8955 / IEC 61215 ｜ DATASHEET SPECIFICATION ｜ PAGE ${currentPage}/3`,
        32,
        90
      );
      ctx.fillText(
        `KIỂM ĐỊNH: ${currentUser?.name || 'Hoàng Anh Tuấn (CTO)'} ｜ ${new Date().toLocaleDateString('vi-VN')}`,
        32,
        106
      );
      ctx.restore();

      // Draw canvas drawing layer on top
      ctx.drawImage(canvas, 0, 0, w, h);

      // Download snapshot
      const link = document.createElement('a');
      link.download = `SOLNEXA_ThamDinh_${model?.modelName || 'Module'}_P${currentPage}_${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export snapshot:', err);
    } finally {
      setIsExportingSnapshot(false);
    }
  };

  // Export full audit summary as CSV
  const handleExportCSV = () => {
    try {
      const rows = [
        [
          'Mã Ghi Chú',
          'Trang',
          'Loại Chú Thích',
          'Nội Dung Thẩm Định',
          'Thông Số Liên Kết',
          'Người Thẩm Định',
          'Thời Gian',
          'Trạng Thái'
        ]
      ];
      annotations.forEach((a, idx) => {
        rows.push([
          a.id || `anno-${idx + 1}`,
          `Trang ${a.page}`,
          a.type.toUpperCase(),
          `"${(a.commentText || a.stampTitle || a.measureValue || 'Ghi chú kỹ thuật').replace(/"/g, '""')}"`,
          `"${(a.linkedDisplayName || a.linkedParamName || 'Không có').replace(/"/g, '""')}"`,
          `"${(a.authorName || 'Kỹ sư Thẩm định').replace(/"/g, '""')}"`,
          `"${a.createdAt || ''}"`,
          a.status === 'resolved' ? 'ĐÃ DUYỆT (PASSED)' : 'CHỜ DUYỆT (OPEN)'
        ]);
      });
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `SOLNEXA_KiemDinh_${model?.modelName || 'Module'}_Annotations.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  // Count annotations on current page and total
  const currentPageAnnotationsCount = annotations.filter(a => a.page === currentPage).length;
  const totalCommentsCount = annotations.filter(a => a.type === 'comment' || a.commentText).length;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col font-sans select-none">
      {/* 1. TOP HEADER & TOOLBAR */}
      <div className="bg-slate-950/95 border-b border-slate-800/90 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Left: Document info & Page Switcher */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PDF INGESTED VIEWER &amp; CANVAS LAYER
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate max-w-[220px]">
                {model?.datasheetFilename || 'Datasheet_Source.pdf'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
              <span>{model ? `${model.manufacturerName} ${model.modelName}` : 'Tài liệu kỹ thuật thiết bị'}</span>
              <span className="text-xs text-slate-400 font-normal">
                (Trang {currentPage} / {totalPages})
              </span>
            </h3>
          </div>
        </div>

        {/* Center: Multi-page Buttons */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3].map(pg => {
            const pageAnnoCount = annotations.filter(a => a.page === pg).length;
            return (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <span>Trang {pg}</span>
                {pageAnnoCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title={`${pageAnnoCount} ghi chú`} />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
            title="Trang tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Comments Drawer Toggle & Zoom Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="inline-flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setZoomScale(s => Math.max(0.65, Number((s - 0.15).toFixed(2))))}
              className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              title="Thu nhỏ (-15%)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-300 min-w-[42px] text-center font-bold">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(s => Math.min(1.75, Number((s + 0.15).toFixed(2))))}
              className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              title="Phóng to (+15%)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomScale(1.0)}
              className="px-2 py-0.5 text-[10px] bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded font-mono cursor-pointer ml-1"
              title="Tỷ lệ 100%"
            >
              Reset
            </button>
          </div>

          {/* Comments List Drawer Button */}
          <button
            type="button"
            onClick={() => setIsCommentsDrawerOpen(!isCommentsDrawerOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
              isCommentsDrawerOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
            }`}
            title="Mở danh sách nhận xét kỹ sư"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ghi chú</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-900/60 font-mono font-bold">
              {totalCommentsCount}
            </span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: DATASHEET DOCUMENT + FLOATING TOOLBAR + CANVAS OVERLAY */}
      <div className="relative flex-1 bg-slate-950 p-4 sm:p-6 overflow-auto flex flex-col items-center min-h-[640px]">
        {/* ============================================================== */}
        {/* FLOATING TOOLBAR (ReviewWorkbench Annotation Layer)            */}
        {/* ============================================================== */}
        <div className="sticky top-2 z-40 mb-3 flex flex-col items-center pointer-events-auto select-none">
          {isFloatingToolbarMinimized ? (
            /* Minimized Floating Pill */
            <div
              onClick={() => setIsFloatingToolbarMinimized(false)}
              className="group backdrop-blur-xl bg-slate-900/95 hover:bg-slate-800/95 text-white border border-slate-700/80 hover:border-blue-500/60 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-3 cursor-pointer transition-all duration-200"
              title="Nhấp để mở rộng thanh công cụ ghi chú"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1.5">
                {activeTool === 'select' && <MousePointer className="w-3.5 h-3.5 text-blue-400" />}
                {activeTool === 'pen' && <PenTool className="w-3.5 h-3.5 text-purple-400" />}
                {activeTool === 'highlight' && <Highlighter className="w-3.5 h-3.5 text-amber-400" />}
                {activeTool === 'sticky' && <StickyNote className="w-3.5 h-3.5 text-emerald-400" />}
                {activeTool === 'box' && <Square className="w-3.5 h-3.5 text-sky-400" />}
                {activeTool === 'eraser' && <Eraser className="w-3.5 h-3.5 text-rose-400" />}
                <span className="text-xs font-bold text-slate-200">
                  {activeTool === 'select'
                    ? 'Con trỏ'
                    : activeTool === 'pen'
                    ? 'Bút vẽ'
                    : activeTool === 'highlight'
                    ? 'Dạ quang'
                    : activeTool === 'sticky'
                    ? 'Ghi chú dán'
                    : activeTool === 'box'
                    ? 'Khoanh vùng'
                    : 'Tẩy xóa'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700">
                <span
                  className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
                  style={{ backgroundColor: activeColor }}
                />
                <span className="text-[10px] font-mono text-slate-400">{strokeThickness}px</span>
              </div>

              <div className="flex items-center text-slate-400 group-hover:text-blue-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          ) : (
            /* Full Floating Toolbar */
            <div className="relative">
              <div className="backdrop-blur-xl bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 transition-all duration-200">
                {/* Grip handle & Title tag */}
                <div className="flex items-center pl-1 pr-1 text-slate-400 space-x-1 hidden lg:flex">
                  <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                    ANNOTATE
                  </span>
                </div>

                {/* 1. Tool Selection Segmented Control */}
                <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/70 gap-0.5 flex-wrap sm:flex-nowrap">
                  {/* Select Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('select')}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'select'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Con trỏ chọn & di chuyển (Phím: V)"
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Chọn</span>
                  </button>

                  {/* Pen Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('pen')}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'pen'
                        ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Bút vẽ tự do (Phím: P)"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Bút vẽ</span>
                  </button>

                  {/* Highlighter Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('highlight')}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'highlight'
                        ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-400/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Bút dạ quang highlight thông số kỹ thuật (Phím: H)"
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Dạ quang</span>
                  </button>

                  {/* Sticky Note Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('sticky')}
                    className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'sticky'
                        ? 'bg-emerald-500 text-slate-950 shadow-xs ring-1 ring-emerald-400/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Ghi chú dán (Sticky note) - Nhấp lên trang để dán ghi chú (Phím: S)"
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Ghi chú dán</span>
                  </button>

                  {/* Bounding Box Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('box')}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'box'
                        ? 'bg-sky-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Khoanh vùng khung chữ nhật (Phím: B)"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Khoanh vùng</span>
                  </button>

                  {/* Arrow Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('arrow')}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'arrow'
                        ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Mũi tên chỉ dẫn kỹ thuật vào biểu đồ / thông số (Phím: A)"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Mũi tên</span>
                  </button>

                  {/* Measure Tool */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool('measure');
                      setIsMeasurePresetOpen(!isMeasurePresetOpen);
                      setIsStampPickerOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'measure'
                        ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Thước đo cơ khí / Khoảng cách lỗ kẹp bão JIS (Phím: M)"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Thước đo</span>
                  </button>

                  {/* Stamp Tool */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool('stamp');
                      setIsStampPickerOpen(!isStampPickerOpen);
                      setIsMeasurePresetOpen(false);
                    }}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'stamp'
                        ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Con dấu Thẩm định Tiêu chuẩn JIS C 8955 & IEC (Phím: T)"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Con dấu</span>
                  </button>

                  {/* Eraser Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('eraser')}
                    className={`px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                      activeTool === 'eraser'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Tẩy xóa ghi chú khi nhấp (Phím: E)"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-800" />

                {/* 2. Color Selector Trigger & Popover */}
                <div className="relative floating-popover-trigger">
                  <button
                    type="button"
                    onClick={() => {
                      setIsColorPickerOpen(!isColorPickerOpen);
                      setIsThicknessPickerOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      isColorPickerOpen
                        ? 'bg-slate-800 border-blue-400 ring-1 ring-blue-400/40 text-white'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Chọn màu sắc (Bút vẽ, Dạ quang & Ghi chú dán)"
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/80 shadow-xs"
                      style={{ backgroundColor: activeColor }}
                    />
                    <span className="text-xs font-bold hidden sm:inline">Màu</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Color Popover */}
                  {isColorPickerOpen && (
                    <div
                      className="floating-popover-panel absolute top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-amber-400" />
                          Bảng màu thẩm định
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsColorPickerOpen(false)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {COLOR_PALETTE.map(c => {
                          const isSelected = activeColor === c.value;
                          return (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => {
                                setActiveColor(c.value);
                                setIsColorPickerOpen(false);
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-800 border-white/60 ring-1 ring-white/40'
                                  : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full shrink-0 border border-white/60 shadow-xs flex items-center justify-center"
                                style={{ backgroundColor: c.value }}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />}
                              </span>
                              <div className="truncate">
                                <span className="text-[11px] font-bold block text-slate-200 truncate">
                                  {c.label}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block truncate">
                                  {c.usage}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Stroke Thickness Selector Trigger & Popover */}
                <div className="relative floating-popover-trigger">
                  <button
                    type="button"
                    onClick={() => {
                      setIsThicknessPickerOpen(!isThicknessPickerOpen);
                      setIsColorPickerOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      isThicknessPickerOpen
                        ? 'bg-slate-800 border-blue-400 ring-1 ring-blue-400/40 text-white'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Chọn độ dày nét vẽ (Pen & Highlight)"
                  >
                    <div className="w-4 flex flex-col justify-center items-center h-4">
                      <span
                        className="w-full rounded-full transition-all"
                        style={{
                          height: `${Math.min(6, strokeThickness)}px`,
                          backgroundColor: activeColor
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {strokeThickness}px
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Thickness Popover */}
                  {isThicknessPickerOpen && (
                    <div
                      className="floating-popover-panel absolute top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          Độ dày nét bút vẽ
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsThicknessPickerOpen(false)}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {THICKNESS_OPTIONS.map(opt => {
                          const isSelected = strokeThickness === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setStrokeThickness(opt.value);
                                setIsThicknessPickerOpen(false);
                              }}
                              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-800 border-blue-400 ring-1 ring-blue-400/40 text-white'
                                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold">{opt.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                                </div>
                                <span className="text-[10px] text-slate-400 block font-sans">
                                  {opt.desc}
                                </span>
                              </div>

                              {/* Visual stroke preview bar */}
                              <div className="w-14 h-6 flex items-center justify-center bg-slate-950/60 rounded px-1.5">
                                <div
                                  className="w-full rounded-full"
                                  style={{
                                    height: `${opt.lineH}px`,
                                    backgroundColor: activeColor
                                  }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stamp Preset Selector (Active when stamp tool is selected or clicked) */}
                {activeTool === 'stamp' && (
                  <div className="relative floating-popover-trigger">
                    <button
                      type="button"
                      onClick={() => setIsStampPickerOpen(!isStampPickerOpen)}
                      className="px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:text-white cursor-pointer"
                      title="Chọn mẫu con dấu kiểm định"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold truncate max-w-[120px] hidden sm:inline">
                        {selectedStampPreset.title}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    {isStampPickerOpen && (
                      <div
                        className="floating-popover-panel absolute top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 font-sans"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Stamp className="w-3.5 h-3.5 text-emerald-400" />
                            Chọn mẫu con dấu thẩm định
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsStampPickerOpen(false)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {STAMP_PRESETS.map(stamp => {
                            const isSel = selectedStampPreset.type === stamp.type;
                            return (
                              <button
                                key={stamp.type}
                                type="button"
                                onClick={() => {
                                  setSelectedStampPreset(stamp);
                                  setIsStampPickerOpen(false);
                                }}
                                className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                  isSel
                                    ? 'bg-slate-800 border-emerald-400 ring-1 ring-emerald-400/40 text-white'
                                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                                }`}
                              >
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 mt-0.5 border"
                                  style={{ backgroundColor: stamp.color, borderColor: stamp.border }}
                                />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-white">{stamp.title}</span>
                                    {isSel && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block">{stamp.sub}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Measure Preset Selector (Active when measure tool is selected) */}
                {activeTool === 'measure' && (
                  <div className="relative floating-popover-trigger">
                    <button
                      type="button"
                      onClick={() => setIsMeasurePresetOpen(!isMeasurePresetOpen)}
                      className="px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all bg-cyan-950/60 border-cyan-500/60 text-cyan-300 hover:text-white cursor-pointer"
                      title="Chọn mẫu khoảng cách chuẩn JIS"
                    >
                      <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold truncate max-w-[130px] hidden sm:inline">
                        {activeMeasurePreset || 'Tự do (Auto mm)'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    {isMeasurePresetOpen && (
                      <div
                        className="floating-popover-panel absolute top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 font-sans"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                            Kích thước chuẩn cơ khí JIS
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsMeasurePresetOpen(false)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMeasurePreset(null);
                              setIsMeasurePresetOpen(false);
                            }}
                            className={`w-full p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              !activeMeasurePreset
                                ? 'bg-cyan-600/30 border-cyan-400 text-white'
                                : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            Tự động tính theo tỷ lệ chuột (Auto mm)
                          </button>

                          {MEASURE_PRESETS.map(m => (
                            <button
                              key={m.val}
                              type="button"
                              onClick={() => {
                                setActiveMeasurePreset(m.val);
                                setIsMeasurePresetOpen(false);
                              }}
                              className={`w-full p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                                activeMeasurePreset === m.val
                                  ? 'bg-cyan-600/30 border-cyan-400 text-white font-bold'
                                  : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{m.label}</span>
                              <span className="font-mono text-cyan-400 font-bold">{m.val}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-slate-800" />

                {/* 4. Action Buttons (Undo, Clear, Snapshot PNG, CSV, Notes Drawer, Minimize) */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={currentPageAnnotationsCount === 0}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Hoàn tác nét vẽ cuối (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCurrentPage}
                    disabled={currentPageAnnotationsCount === 0}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Xóa tất cả ghi chú trên trang hiện tại"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Export High-Res Snapshot PNG */}
                  <button
                    type="button"
                    onClick={handleExportSnapshot}
                    disabled={isExportingSnapshot}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Chụp ảnh trang đã ghi chú (Xuất ảnh PNG 2x)"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Export CSV Audit Summary */}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={annotations.length === 0}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Xuất bảng tổng hợp kiểm định kỹ thuật (CSV)"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCommentsDrawerOpen(!isCommentsDrawerOpen)}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                      isCommentsDrawerOpen
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Danh sách ghi chú toàn datasheet"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {totalCommentsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-bold flex items-center justify-center">
                        {totalCommentsCount}
                      </span>
                    )}
                  </button>

                  {/* Minimize toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsFloatingToolbarMinimized(true);
                      setIsColorPickerOpen(false);
                      setIsThicknessPickerOpen(false);
                      setIsStampPickerOpen(false);
                      setIsMeasurePresetOpen(false);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Thu nhỏ thanh công cụ"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Document Container with strict relative dimensions */}
        <div
          ref={containerRef}
          style={{
            width: `${BASE_PAGE_WIDTH * zoomScale}px`,
            height: `${BASE_PAGE_HEIGHT * zoomScale}px`
          }}
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden shrink-0 border border-slate-300 transition-all select-none"
        >
          {/* A. AUTHENTIC HIGH-FIDELITY VECTOR DATASHEET PAGE CONTENT (Rendered underneath Canvas) */}
          <div
            style={{
              width: `${BASE_PAGE_WIDTH}px`,
              height: `${BASE_PAGE_HEIGHT}px`,
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top left'
            }}
            className="absolute top-0 left-0 bg-white text-slate-900 pointer-events-none p-8 font-sans leading-tight flex flex-col justify-between"
          >
            {/* PAGE 1: ELECTRICAL SPECIFICATIONS (STC & NMOT) */}
            {currentPage === 1 && (
              <div className="space-y-5">
                {/* Header Banner */}
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black text-[#002B49] tracking-tighter uppercase font-mono">
                        {model?.manufacturerName || 'SOLNEXA'}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold rounded">
                        OFFICIAL DATASHEET
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                      {model?.modelName || 'TSM-580NE19R Vertex N Series'}
                    </h1>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Bifacial Dual-Glass High Efficiency N-type TOPCon Solar PV Module ｜ 1500V DC
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">JIS C 8955 / IEC 61215</span>
                    <span className="text-xs font-bold font-mono text-slate-800">REV: v{model?.revision || 1}.0</span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">● VERIFIED SOURCE</span>
                  </div>
                </div>

                {/* Top Highlights Grid on Page 1 */}
                <div className="grid grid-cols-4 gap-2.5 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Peak Power (Pmax)</span>
                    <span className="text-lg font-black text-slate-900 font-mono">580 W</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Module Efficiency</span>
                    <span className="text-lg font-black text-emerald-700 font-mono">22.5 %</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Voc (STC 25°C)</span>
                    <span className="text-lg font-black text-slate-900 font-mono">51.42 V</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Isc (STC 25°C)</span>
                    <span className="text-lg font-black text-slate-900 font-mono">14.42 A</span>
                  </div>
                </div>

                {/* Electrical Characteristics Table (STC) */}
                <div>
                  <div className="bg-[#002B49] text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
                      Electrical Characteristics (STC: Irradiance 1000 W/m², Cell Temp 25°C, AM1.5)
                    </h4>
                    <span className="text-[9px] font-mono text-amber-300">TABLE 1.1</span>
                  </div>

                  <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50/60 font-semibold">
                        <td className="p-2 text-slate-600 font-mono w-1/2">Rated Peak Power — Pmax (W)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">580 W</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Open Circuit Voltage — Voc (V)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">51.42 V</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Short Circuit Current — Isc (A)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">14.42 A</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Maximum Power Voltage — Vmp (V)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">42.80 V</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Maximum Power Current — Imp (A)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">13.55 A</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Module Efficiency — ηm (%)</td>
                        <td className="p-2 font-mono font-bold text-emerald-700">22.5 %</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Power Tolerance Output</td>
                        <td className="p-2 font-mono text-slate-800">0 ~ +5 W</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Max System Voltage (IEC/UL)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">1500 V DC</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Maximum Series Fuse Rating</td>
                        <td className="p-2 font-mono text-slate-800">30 A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Electrical Characteristics (NMOT) */}
                <div>
                  <div className="bg-slate-800 text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
                      Nominal Module Operating Temperature (NMOT: 800 W/m², Amb 20°C, Wind 1m/s)
                    </h4>
                    <span className="text-[9px] font-mono text-slate-300">TABLE 1.2</span>
                  </div>

                  <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 text-slate-600 font-mono w-1/2">Maximum Power (Pmax) @ NMOT</td>
                        <td className="p-2 font-mono text-slate-900">442 W</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Open Circuit Voltage (Voc) @ NMOT</td>
                        <td className="p-2 font-mono text-slate-900">48.80 V</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Short Circuit Current (Isc) @ NMOT</td>
                        <td className="p-2 font-mono text-slate-900">11.64 A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footnote stamp */}
                <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>* Measurement tolerance: Pmax ±3%, Voc ±2%, Isc ±2% (JIS C 8955 Testing Standards)</span>
                  <span className="text-slate-700 font-bold">PAGE 1 OF 3</span>
                </div>
              </div>
            )}

            {/* PAGE 2: MECHANICAL SPECIFICATIONS & TEMPERATURE RATINGS */}
            {currentPage === 2 && (
              <div className="space-y-5">
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-xl font-black text-[#002B49] tracking-tighter uppercase font-mono">
                      {model?.manufacturerName || 'SOLNEXA'} — MECHANICAL &amp; THERMAL
                    </span>
                    <h1 className="text-xl font-black text-slate-900 mt-1">
                      Mechanical Characteristics &amp; Temperature Ratings
                    </h1>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">SECTION 2</span>
                </div>

                {/* Mechanical Data Table */}
                <div>
                  <div className="bg-[#002B49] text-white px-3 py-1.5 rounded-t-lg">
                    <h4 className="text-xs font-bold uppercase font-mono">Mechanical Specifications</h4>
                  </div>
                  <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 text-slate-600 font-mono w-1/2">Module Dimensions (L × W × H)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">2384 × 1134 × 35 mm</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Weight (kg)</td>
                        <td className="p-2 font-mono font-bold text-slate-900">33.7 kg (±3%)</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Front / Back Glass</td>
                        <td className="p-2 font-mono text-slate-800">2.0 mm, AR Coated Heat Strengthened</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Frame Material</td>
                        <td className="p-2 font-mono text-slate-800">35mm Anodized Aluminium Alloy</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Junction Box Protection Class</td>
                        <td className="p-2 font-mono text-slate-800">IP68 Rated (3 bypass diodes)</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Output Cable Specification</td>
                        <td className="p-2 font-mono text-slate-800">TUV 4.0 mm² ｜ Portrait 1400 mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Temperature Ratings Table */}
                <div>
                  <div className="bg-amber-600 text-white px-3 py-1.5 rounded-t-lg">
                    <h4 className="text-xs font-bold uppercase font-mono">
                      Temperature Coefficients &amp; Thermal Ratings
                    </h4>
                  </div>
                  <table className="w-full text-xs border border-slate-300 divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2 text-slate-600 font-mono w-1/2">Temperature Coefficient of Pmax (γ)</td>
                        <td className="p-2 font-mono font-bold text-amber-700">-0.30 % / °C</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Temperature Coefficient of Voc (β)</td>
                        <td className="p-2 font-mono font-bold text-amber-700">-0.24 % / °C</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Temperature Coefficient of Isc (α)</td>
                        <td className="p-2 font-mono font-bold text-amber-700">+0.04 % / °C</td>
                      </tr>
                      <tr className="bg-slate-50/60">
                        <td className="p-2 text-slate-600 font-mono">Nominal Module Operating Temp (NMOT)</td>
                        <td className="p-2 font-mono text-slate-800">43 ± 2 °C</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-600 font-mono">Operating Temperature Range</td>
                        <td className="p-2 font-mono text-slate-800">-40 °C ~ +85 °C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mechanical Load Ratings */}
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-sky-950 font-mono block">
                    Structural Mechanical Loads (JIS C 8955 Compliant):
                  </span>
                  <div className="flex justify-between font-mono text-[11px] text-sky-900">
                    <span>Front Side Max Static Load (Tuyết phủ Snow Load): <strong>5400 Pa</strong></span>
                    <span>Rear Side Max Static Load (Áp lực gió Wind Load): <strong>2400 Pa</strong></span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">PAGE 2 OF 3</div>
              </div>
            )}

            {/* PAGE 3: IV CURVES, WARRANTY & CERTIFICATIONS */}
            {currentPage === 3 && (
              <div className="space-y-5">
                <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-xl font-black text-[#002B49] tracking-tighter uppercase font-mono">
                      {model?.manufacturerName || 'SOLNEXA'} — CURVES &amp; WARRANTY
                    </span>
                    <h1 className="text-xl font-black text-slate-900 mt-1">
                      Characteristic Curves &amp; Quality Certifications
                    </h1>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">SECTION 3</span>
                </div>

                {/* Simulated IV Curves Graphic */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase font-mono text-slate-800 block">
                    Current-Voltage &amp; Power-Voltage Curves (TSM-580W @ Various Irradiances)
                  </span>
                  <div className="h-44 w-full bg-white rounded border border-slate-300 p-3 relative flex flex-col justify-between font-mono text-[9px] text-slate-400">
                    <div className="flex justify-between">
                      <span>I (A) 16A —</span>
                      <span className="text-amber-600 font-bold">1000 W/m² (STC)</span>
                      <span className="text-blue-600">800 W/m²</span>
                      <span className="text-slate-500">600 W/m²</span>
                    </div>

                    {/* SVG Curve Lines */}
                    <svg className="w-full h-28" viewBox="0 0 600 120" fill="none">
                      {/* Grid lines */}
                      <path d="M 0 30 H 600 M 0 60 H 600 M 0 90 H 600" stroke="#f1f5f9" strokeWidth="1" />
                      <path d="M 150 0 V 120 M 300 0 V 120 M 450 0 V 120" stroke="#f1f5f9" strokeWidth="1" />
                      {/* 1000W curve */}
                      <path
                        d="M 20 10 C 200 10, 480 15, 520 115"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* 800W curve */}
                      <path
                        d="M 20 35 C 200 35, 470 40, 510 115"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* 600W curve */}
                      <path
                        d="M 20 60 C 200 60, 460 65, 500 115"
                        stroke="#64748b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span>0 V</span>
                      <span>10 V</span>
                      <span>20 V</span>
                      <span>30 V</span>
                      <span>42.8 V (Vmp)</span>
                      <span>51.4 V (Voc)</span>
                    </div>
                  </div>
                </div>

                {/* 30-Year Warranty Bar */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-950 font-mono uppercase">
                    Solnexa Verified Linear Power Output Warranty
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Năm 1 suy giảm</span>
                      <span className="font-bold font-mono text-emerald-800">≤ 1.0 %</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Năm 2-30 hàng năm</span>
                      <span className="font-bold font-mono text-emerald-800">≤ 0.40 % / năm</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Năm thứ 30 còn lại</span>
                      <span className="font-bold font-mono text-emerald-800">≥ 87.4 %</span>
                    </div>
                  </div>
                </div>

                {/* Badges of Compliance */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-600">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-slate-200 rounded font-bold">JIS C 8955</span>
                    <span className="px-2 py-0.5 bg-slate-200 rounded font-bold">JET-PV</span>
                    <span className="px-2 py-0.5 bg-slate-200 rounded font-bold">IEC 61215</span>
                    <span className="px-2 py-0.5 bg-slate-200 rounded font-bold">ISO 9001</span>
                  </div>
                  <span>PAGE 3 OF 3</span>
                </div>
              </div>
            )}

            {/* Bottom Global Footer for All Pages */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>SOLNEXA Engineering Datasheet Verification Layer ｜ All Rights Reserved</span>
              <span>CONFIDENTIAL — FOR ENGINEERING VERIFICATION ONLY</span>
            </div>
          </div>

          {/* B. THE INTERACTIVE HTML5 CANVAS OVERLAY LAYER */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
              width: `${BASE_PAGE_WIDTH * zoomScale}px`,
              height: `${BASE_PAGE_HEIGHT * zoomScale}px`,
              cursor:
                activeTool === 'select'
                  ? 'default'
                  : activeTool === 'eraser'
                  ? 'not-allowed'
                  : activeTool === 'sticky' || activeTool === 'comment'
                  ? 'cell'
                  : 'crosshair'
            }}
            className="absolute top-0 left-0 w-full h-full pointer-events-auto touch-none z-10"
          />

          {/* C. INTERACTIVE STICKY NOTES ON DATASHEET PAGE */}
          {annotations
            .filter(a => a.page === currentPage && (a.type === 'sticky' || a.type === 'comment'))
            .map((anno, idx) => {
              const isSelected = selectedAnnotationId === anno.id;
              const isCollapsed = anno.isCollapsed;
              const colorConfig = COLOR_PALETTE.find(c => c.value === anno.color) || COLOR_PALETTE[0];
              const pastelBg = colorConfig.pastelBg || '#fef9c3';

              if (isCollapsed) {
                return (
                  <div
                    key={anno.id}
                    style={{
                      left: `${anno.x * zoomScale}px`,
                      top: `${anno.y * zoomScale}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedAnnotationId(anno.id);
                      setAnnotations(prev =>
                        prev.map(a => (a.id === anno.id ? { ...a, isCollapsed: false } : a))
                      );
                    }}
                    className={`absolute z-20 group cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border transition-all hover:scale-105 select-none ${
                      anno.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                    title="Nhấp để mở rộng ghi chú dán"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] font-bold font-mono">#{idx + 1}</span>
                    <span className="text-[11px] font-semibold max-w-[120px] truncate">
                      {anno.commentText || 'Ghi chú kỹ sư'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold group-hover:text-slate-900">▼</span>
                  </div>
                );
              }

              return (
                <div
                  key={anno.id}
                  style={{
                    left: `${anno.x * zoomScale}px`,
                    top: `${anno.y * zoomScale}px`,
                    width: `${Math.min(280, Math.max(220, 250 * zoomScale))}px`,
                    backgroundColor: pastelBg
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedAnnotationId(anno.id);
                  }}
                  className={`sticky-note-card absolute z-20 rounded-2xl shadow-xl border p-3 flex flex-col gap-2 font-sans text-slate-900 select-text transition-all ${
                    isSelected
                      ? 'ring-2 ring-amber-500 shadow-2xl border-amber-400'
                      : 'border-amber-300/80 hover:shadow-2xl'
                  }`}
                >
                  {/* Sticky Note Top Header (Draggable) */}
                  <div
                    onPointerDown={e => handleStickyPointerDown(anno.id, e)}
                    className="flex items-center justify-between pb-1.5 border-b border-black/10 cursor-move select-none"
                    title="Kéo thả để di chuyển vị trí ghi chú"
                  >
                    <div className="flex items-center space-x-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-950">
                        Ghi chú #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Color switcher dots */}
                      {COLOR_PALETTE.slice(0, 5).map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setAnnotations(prev =>
                              prev.map(a => (a.id === anno.id ? { ...a, color: c.value } : a))
                            );
                            saveAnnotations(
                              annotations.map(a => (a.id === anno.id ? { ...a, color: c.value } : a))
                            );
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 cursor-pointer ${
                            anno.color === c.value ? 'ring-1 ring-black scale-110' : 'opacity-70'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}

                      {/* Collapse button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setAnnotations(prev =>
                            prev.map(a => (a.id === anno.id ? { ...a, isCollapsed: true } : a))
                          );
                        }}
                        className="p-1 text-slate-600 hover:text-black rounded cursor-pointer"
                        title="Thu nhỏ ghi chú"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteAnnotation(anno.id);
                        }}
                        className="p-1 text-rose-600 hover:text-rose-800 rounded cursor-pointer"
                        title="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Author & Timestamp */}
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
                    <span className="font-bold truncate max-w-[140px]">
                      {anno.authorName || 'Kỹ sư Thẩm định'}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {anno.createdAt?.split(' ')[0] || ''}
                    </span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={3}
                    value={anno.commentText || ''}
                    placeholder="Nhập ghi chú kỹ thuật, lưu ý kiểm định JIS..."
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      const nextText = e.target.value;
                      setAnnotations(prev =>
                        prev.map(a => (a.id === anno.id ? { ...a, commentText: nextText } : a))
                      );
                    }}
                    onBlur={() => saveAnnotations(annotations)}
                    className="w-full text-xs bg-white/70 border border-black/10 rounded-lg p-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden resize-none leading-relaxed placeholder:text-slate-400 font-sans"
                  />

                  {/* Link Spec Selector & Resolve */}
                  <div
                    className="flex items-center justify-between gap-1 text-[10px]"
                    onClick={e => e.stopPropagation()}
                  >
                    <select
                      value={anno.linkedParamName || ''}
                      onChange={e => {
                        const selParam = e.target.value;
                        const found = specifications.find(s => s.parameterName === selParam);
                        const updated = annotations.map(a =>
                          a.id === anno.id
                            ? {
                                ...a,
                                linkedParamName: selParam,
                                linkedDisplayName: found?.displayName,
                                linkedSpecId: found?.id
                              }
                            : a
                        );
                        saveAnnotations(updated);
                      }}
                      className="text-[10px] bg-white/80 border border-black/10 rounded p-1 text-slate-700 outline-hidden truncate max-w-[140px]"
                    >
                      <option value="">(Liên kết thông số)</option>
                      {specifications.map(s => (
                        <option key={s.id} value={s.parameterName}>
                          {s.displayName}
                        </option>
                      ))}
                    </select>

                    {/* Status resolve toggle */}
                    <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-slate-700 shrink-0">
                      <input
                        type="checkbox"
                        checked={anno.status === 'resolved'}
                        onChange={e => {
                          const checked = e.target.checked;
                          const nextStatus: 'open' | 'resolved' = checked ? 'resolved' : 'open';
                          const updated = annotations.map(a =>
                            a.id === anno.id ? { ...a, status: nextStatus } : a
                          );
                          saveAnnotations(updated);
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={anno.status === 'resolved' ? 'text-emerald-700' : ''}>
                        {anno.status === 'resolved' ? 'Đã duyệt' : 'Chưa duyệt'}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}

          {/* D. FLOATING CONTEXTUAL ACTION PILL FOR SELECTED ANNOTATION */}
          {(() => {
            const selAnno = annotations.find(a => a.id === selectedAnnotationId && a.page === currentPage);
            if (!selAnno) return null;
            const isBoxOrHighlight = selAnno.type === 'box' || selAnno.type === 'highlight';
            const posX = Math.max(10, Math.min(BASE_PAGE_WIDTH * zoomScale - 240, selAnno.x * zoomScale));
            const posY = Math.max(10, selAnno.y * zoomScale - 42);

            return (
              <div
                style={{ left: `${posX}px`, top: `${posY}px` }}
                onClick={e => e.stopPropagation()}
                className="absolute z-30 flex items-center gap-1.5 bg-slate-900/95 text-white border border-slate-700/90 px-2 py-1.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in select-none"
              >
                {isBoxOrHighlight && onAddSpecFromAnnotation && (
                  <button
                    type="button"
                    onClick={() => {
                      setExtractDisplayName(selAnno.linkedDisplayName || selAnno.tag || 'Thông số trích xuất');
                      setExtractParamName(selAnno.linkedParamName || 'extracted_param_' + Date.now().toString().slice(-4));
                      setExtractRawValue(selAnno.commentText?.replace(/[^0-9.]/g, '') || '580');
                      setExtractRawUnit(
                        selAnno.commentText?.includes('V') ? 'V' : selAnno.commentText?.includes('A') ? 'A' : 'W'
                      );
                      setIsExtractModalOpen(true);
                    }}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Trích xuất vùng này vào bảng thông số kỹ thuật ReviewWorkbench"
                  >
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>⚡ Trích xuất thông số</span>
                  </button>
                )}

                {selAnno.type === 'measure' && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = prompt('Nhập kích thước cơ khí đo được (ví dụ: 2278 mm):', selAnno.measureValue || '1400 mm');
                      if (nextVal) {
                        const updated = annotations.map(a => (a.id === selAnno.id ? { ...a, measureValue: nextVal } : a));
                        saveAnnotations(updated);
                      }
                    }}
                    className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Đổi số đo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteAnnotation(selAnno.id)}
                  className="p-1 text-rose-400 hover:text-white hover:bg-rose-600/40 rounded cursor-pointer"
                  title="Xóa chú thích này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}

          {/* E. FLOATING COMMENT EDIT POPOVER */}
          {editingCommentAnnotation && (
            <div
              style={{
                left: `${Math.min(
                  BASE_PAGE_WIDTH * zoomScale - 320,
                  Math.max(10, editingCommentAnnotation.x * zoomScale - 40)
                )}px`,
                top: `${Math.min(
                  BASE_PAGE_HEIGHT * zoomScale - 260,
                  editingCommentAnnotation.y * zoomScale + 25
                )}px`
              }}
              className="absolute z-30 w-80 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 space-y-3 backdrop-blur-md animate-in fade-in zoom-in-95 font-sans"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white">Nhận xét kỹ sư thẩm định</span>
                </div>
                <button
                  onClick={() => setEditingCommentAnnotation(null)}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Author and Date metadata */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-400" />
                  {editingCommentAnnotation.authorName || 'Kỹ sư Thẩm định'}
                </span>
                <span>{editingCommentAnnotation.createdAt}</span>
              </div>

              {/* Comment Content Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nội dung ghi chú:</label>
                <textarea
                  rows={3}
                  value={editingCommentAnnotation.commentText || ''}
                  onChange={e =>
                    setEditingCommentAnnotation({
                      ...editingCommentAnnotation,
                      commentText: e.target.value
                    })
                  }
                  placeholder="Ghi chú đối chiếu thông số với tiêu chuẩn JIS C 8955, ghi nhận sai lệch..."
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none font-sans"
                />
              </div>

              {/* Linked Specification dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                  <span>Liên kết thông số kỹ thuật:</span>
                  {editingCommentAnnotation.linkedDisplayName && (
                    <span className="text-blue-400 font-mono">Đã liên kết</span>
                  )}
                </label>
                <select
                  value={editingCommentAnnotation.linkedParamName || ''}
                  onChange={e => {
                    const selParam = e.target.value;
                    const found = specifications.find(s => s.parameterName === selParam);
                    setEditingCommentAnnotation({
                      ...editingCommentAnnotation,
                      linkedParamName: selParam,
                      linkedDisplayName: found?.displayName,
                      linkedSpecId: found?.id
                    });
                  }}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 outline-hidden"
                >
                  <option value="">(Chưa liên kết thông số nào)</option>
                  {specifications.map(s => (
                    <option key={s.id} value={s.parameterName}>
                      {s.displayName} ({s.rawValue})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingCommentAnnotation.status === 'resolved'}
                    onChange={e =>
                      setEditingCommentAnnotation({
                        ...editingCommentAnnotation,
                        status: e.target.checked ? 'resolved' : 'open'
                      })
                    }
                    className="rounded text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>Đã kiểm tra (Resolved)</span>
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(editingCommentAnnotation.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded cursor-pointer"
                    title="Xóa ghi chú này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveComment(editingCommentAnnotation.id, {
                        commentText: editingCommentAnnotation.commentText,
                        status: editingCommentAnnotation.status,
                        linkedParamName: editingCommentAnnotation.linkedParamName,
                        linkedDisplayName: editingCommentAnnotation.linkedDisplayName,
                        linkedSpecId: editingCommentAnnotation.linkedSpecId
                      })
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: EXTRACT ANNOTATION TO SPECIFICATION TABLE */}
        {isExtractModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4 font-sans animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Trích xuất vùng chọn vào bảng thông số</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExtractModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Thêm thông số kỹ thuật mới được khoanh vùng trên datasheet vào hệ thống thẩm định:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tên hiển thị:</label>
                  <input
                    type="text"
                    value={extractDisplayName}
                    onChange={e => setExtractDisplayName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Mã tham số:</label>
                    <input
                      type="text"
                      value={extractParamName}
                      onChange={e => setExtractParamName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Trang PDF:</label>
                    <span className="block bg-slate-800 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold">
                      Trang {currentPage}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Giá trị:</label>
                    <input
                      type="text"
                      value={extractRawValue}
                      onChange={e => setExtractRawValue(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Đơn vị:</label>
                    <input
                      type="text"
                      value={extractRawUnit}
                      onChange={e => setExtractRawUnit(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExtractModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onAddSpecFromAnnotation) {
                      onAddSpecFromAnnotation({
                        parameterName: extractParamName,
                        displayName: extractDisplayName,
                        rawValue: extractRawValue,
                        rawUnit: extractRawUnit,
                        sourcePage: currentPage
                      });
                    }
                    if (selectedAnnotationId) {
                      const updated = annotations.map(a =>
                        a.id === selectedAnnotationId
                          ? {
                              ...a,
                              linkedDisplayName: extractDisplayName,
                              linkedParamName: extractParamName,
                              commentText: `Đã liên kết thông số: ${extractDisplayName} = ${extractRawValue} ${extractRawUnit}`
                            }
                          : a
                      );
                      saveAnnotations(updated);
                    }
                    setIsExtractModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Xác nhận &amp; Thêm vào bảng</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* F. SIDE COMMENTS & AUDIT LIST DRAWER (Slide-out panel for Reviewer Engineers) */}
        {isCommentsDrawerOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200 text-white font-sans">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Danh sách ghi chú datasheet ({annotations.length})</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCommentsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keyword Search Bar */}
            <div className="p-2.5 border-b border-slate-800 bg-slate-950/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  placeholder="Tìm kiếm nội dung ghi chú, thông số..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter buttons */}
            <div className="p-2.5 border-b border-slate-800 flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterCommentStatus('all')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  filterCommentStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Tất cả ({annotations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCommentStatus('open')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  filterCommentStatus === 'open' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Chờ duyệt ({annotations.filter(a => a.status === 'open').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCommentStatus('resolved')}
                className={`flex-1 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  filterCommentStatus === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Đã duyệt ({annotations.filter(a => a.status === 'resolved').length})
              </button>
            </div>

            {/* Type Filter Chips */}
            <div className="px-2.5 py-1.5 border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[10px]">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'sticky', label: '📌 Ghi chú dán' },
                { id: 'highlight', label: '🖍️ Dạ quang' },
                { id: 'box', label: '🔲 Vùng chọn' },
                { id: 'arrow', label: '➔ Mũi tên' },
                { id: 'measure', label: '📏 Thước đo' },
                { id: 'stamp', label: '★ Con dấu' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterType(t.id)}
                  className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
                    filterType === t.id
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs">
              {annotations.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Chưa có ghi chú nào được tạo trên datasheet này.</p>
                  <p className="text-[11px] mt-1">Dùng thanh công cụ nổi để vẽ, đo lường hoặc đóng dấu kiểm định.</p>
                </div>
              ) : (
                annotations
                  .filter(a => filterCommentStatus === 'all' || a.status === filterCommentStatus)
                  .filter(a => filterType === 'all' || a.type === filterType)
                  .filter(a => {
                    if (!searchKeyword.trim()) return true;
                    const kw = searchKeyword.toLowerCase();
                    return (
                      (a.commentText && a.commentText.toLowerCase().includes(kw)) ||
                      (a.stampTitle && a.stampTitle.toLowerCase().includes(kw)) ||
                      (a.measureValue && a.measureValue.toLowerCase().includes(kw)) ||
                      (a.linkedDisplayName && a.linkedDisplayName.toLowerCase().includes(kw)) ||
                      (a.authorName && a.authorName.toLowerCase().includes(kw))
                    );
                  })
                  .map((a, idx) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setCurrentPage(a.page);
                        setSelectedAnnotationId(a.id);
                        if (a.linkedSpecId) onSelectSpec(a.linkedSpecId);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                        selectedAnnotationId === a.id
                          ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                          <span className="font-bold text-white uppercase text-[10px] font-mono">
                            Trang {a.page} ｜ {a.type}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            a.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {a.status === 'resolved' ? 'RESOLVED' : 'OPEN'}
                        </span>
                      </div>

                      {/* Content or Stamp/Measure Label */}
                      <p className="text-slate-200 text-xs leading-relaxed font-sans">
                        {a.stampTitle ? (
                          <strong className="text-emerald-400 block font-mono">★ {a.stampTitle}</strong>
                        ) : a.measureValue ? (
                          <strong className="text-cyan-400 block font-mono">📏 Kích thước: {a.measureValue}</strong>
                        ) : null}
                        {a.commentText || (
                          <span className="italic text-slate-500">
                            {a.stampTitle || a.measureValue ? '' : '(Chưa có nội dung chi tiết)'}
                          </span>
                        )}
                      </p>

                      {/* Linked spec pill */}
                      {a.linkedDisplayName && (
                        <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-[11px] font-mono text-blue-300">
                          Thẩm định: <strong>{a.linkedDisplayName}</strong>
                        </div>
                      )}

                      {/* Footer actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px] text-slate-400">
                        <span>{a.authorName || 'Kỹ sư Thẩm định'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setEditingCommentAnnotation(a);
                            }}
                            className="text-blue-400 hover:underline cursor-pointer"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteAnnotation(a.id);
                            }}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Drawer Footer with Export Actions */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap gap-2 justify-between items-center text-xs">
              <span className="text-slate-400 text-[11px] font-mono">
                {annotations.length} mục kiểm định
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Tải tệp bảng tính CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportSnapshot}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Xuất ảnh PNG chất lượng cao"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In / PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM STATUS BAR */}
      <div className="bg-slate-950 border-t border-slate-800/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-mono">
              Trang {currentPage}/{totalPages} ｜ {currentPageAnnotationsCount} ghi chú trên trang
            </span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            Kéo chuột để vẽ dạ quang/khoanh vùng. Bấm &quot;Ghim nhận xét&quot; để tạo ghi chú kỹ sư.
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {selectedAnnotationId && (
            <span className="text-amber-400 font-mono text-[11px] font-bold">
              Đang chọn ghi chú #{selectedAnnotationId.slice(-6)}
            </span>
          )}
          <span className="text-slate-500 font-mono">SOLNEXA Ingested Canvas Engine v2.5</span>
        </div>
      </div>
    </div>
  );
};
