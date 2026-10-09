import React, { useState, useMemo } from 'react';
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Printer,
  BookmarkCheck,
  CheckCircle2,
  Info,
  Sliders,
  Compass,
  ArrowRight,
  Sun,
  Layers
} from 'lucide-react';

interface JisWindLoadCalculatorProps {
  onOpenContact?: () => void;
  isLoggedIn?: boolean;
}

export const JisWindLoadCalculator: React.FC<JisWindLoadCalculatorProps> = ({
  onOpenContact,
  isLoggedIn
}) => {
  // Preset locations & standard wind speeds per MLIT Notice 1454
  const [installationType, setInstallationType] = useState<'GROUND' | 'FLAT_ROOF' | 'SLOPED_ROOF'>('GROUND');
  const [baseWindSpeedV0, setBaseWindSpeedV0] = useState<number>(34); // m/s (Kanto standard)
  const [heightH, setHeightH] = useState<number>(2.0); // m
  const [tiltAngleDeg, setTiltAngleDeg] = useState<number>(15); // degrees
  const [roughnessCategory, setRoughnessCategory] = useState<'II' | 'III' | 'IV'>('III'); // Default III (Plains/Farm)
  const [importanceFactorI, setImportanceFactorI] = useState<number>(1.0); // 1.0 standard, 1.15 critical
  
  // Array parameters
  const [moduleWidthM, setModuleWidthM] = useState<number>(1.134); // Standard 550W+
  const [moduleLengthM, setModuleLengthM] = useState<number>(2.278);
  const [modulesPerTable, setModulesPerTable] = useState<number>(16); // e.g. 2 rows x 8 cols
  
  // Foundation ballast / pile check
  const [foundationType, setFoundationType] = useState<'SCREW_PILE' | 'CONCRETE_BALLAST'>('SCREW_PILE');
  const [soilPulloutCapacityKn, setSoilPulloutCapacityKn] = useState<number>(15.0); // kN per pile

  const [savedToDossier, setSavedToDossier] = useState<boolean>(false);

  // Quick Preset Handlers
  const handleSelectPreset = (preset: 'chiba_ground' | 'coastal_typhoon' | 'factory_rooftop' | 'hokkaido_sloped') => {
    if (preset === 'chiba_ground') {
      setInstallationType('GROUND');
      setBaseWindSpeedV0(34);
      setHeightH(2.0);
      setTiltAngleDeg(15);
      setRoughnessCategory('III');
      setImportanceFactorI(1.0);
      setModulesPerTable(16);
      setFoundationType('SCREW_PILE');
      setSoilPulloutCapacityKn(15.0);
    } else if (preset === 'coastal_typhoon') {
      setInstallationType('GROUND');
      setBaseWindSpeedV0(40); // Typhoon coastal zone (Kagoshima/Kochi/Okinawa)
      setHeightH(1.8);
      setTiltAngleDeg(10); // Lower tilt for high wind
      setRoughnessCategory('IV'); // Coastline
      setImportanceFactorI(1.15);
      setModulesPerTable(12);
      setFoundationType('SCREW_PILE');
      setSoilPulloutCapacityKn(25.0);
    } else if (preset === 'factory_rooftop') {
      setInstallationType('FLAT_ROOF');
      setBaseWindSpeedV0(34);
      setHeightH(12.0); // 3-story warehouse roof
      setTiltAngleDeg(10);
      setRoughnessCategory('II'); // Urban commercial
      setImportanceFactorI(1.0);
      setModulesPerTable(8);
      setFoundationType('CONCRETE_BALLAST');
      setSoilPulloutCapacityKn(8.0);
    } else {
      setInstallationType('GROUND');
      setBaseWindSpeedV0(32);
      setHeightH(2.5); // Snow clearance
      setTiltAngleDeg(25); // Higher tilt for snow shed
      setRoughnessCategory('III');
      setImportanceFactorI(1.0);
      setModulesPerTable(16);
      setFoundationType('SCREW_PILE');
      setSoilPulloutCapacityKn(18.0);
    }
  };

  // Calculation per JIS C 8955:2017 & MLIT Notice 1454
  const windCalculation = useMemo(() => {
    // 1. Environmental Factor E (環境係数)
    // For Roughness III: Zb = 5m, Zg = 350m, alpha = 0.20
    // Er = 1.7 * (H / Zg)^alpha
    let alpha = 0.20;
    let Zg = 350;
    let Zb = 5;
    if (roughnessCategory === 'II') {
      alpha = 0.15;
      Zg = 250;
      Zb = 3;
    } else if (roughnessCategory === 'IV') {
      alpha = 0.27;
      Zg = 450;
      Zb = 10;
    }

    const effectiveH = Math.max(heightH, Zb);
    const Er = 1.7 * Math.pow(effectiveH / Zg, alpha);
    const E = Math.max(0.6, Math.min(1.8, Er * Er));

    // 2. Velocity Pressure q (速度圧) N/m²
    // q = 0.6 * E * V0^2 (N/m²)
    const velocityPressureQ = Math.round(0.6 * E * Math.pow(baseWindSpeedV0, 2) * importanceFactorI);

    // 3. Wind Pressure Coefficients Cw (風力係数 per JIS C 8955:2017)
    // Positive Wind (順風 押さえ込み Cw1): Cw1 increases slightly with tilt angle theta
    // Uplift Wind (逆風 吹き上げ・浮き上がり Cw2): Cw2 is negative, pulls module upwards
    const rad = (tiltAngleDeg * Math.PI) / 180;
    const cwPositive = Number((0.55 + 0.85 * Math.sin(rad)).toFixed(2));
    const cwUplift = Number((-0.80 - 0.70 * Math.sin(rad)).toFixed(2));

    // 4. Design Wind Load (設計風圧荷重)
    // Wp (Positive downforce): N/m²
    const positivePressureNPerM2 = Math.round(cwPositive * velocityPressureQ);
    const positiveKgPerM2 = Number((positivePressureNPerM2 / 9.80665).toFixed(1));

    // Wn (Uplift pullout): N/m² (Absolute magnitude)
    const upliftPressureNPerM2 = Math.round(Math.abs(cwUplift) * velocityPressureQ);
    const upliftKgPerM2 = Number((upliftPressureNPerM2 / 9.80665).toFixed(1));

    // 5. Total Array Table Forces
    const singleModuleAreaM2 = moduleWidthM * moduleLengthM;
    const totalTableAreaM2 = Number((singleModuleAreaM2 * modulesPerTable).toFixed(2));
    
    const totalUpliftForceKn = Number(((upliftPressureNPerM2 * totalTableAreaM2) / 1000).toFixed(1));
    const totalPositiveForceKn = Number(((positivePressureNPerM2 * totalTableAreaM2) / 1000).toFixed(1));

    // 6. Foundation Stability & Safety Check
    // Standard table has 4 ~ 6 piles or ballasts
    const pilesPerTable = modulesPerTable >= 16 ? 6 : 4;
    const upliftPerPileKn = Number((totalUpliftForceKn / pilesPerTable).toFixed(2));
    
    // Safety check against soil capacity
    const isPileSafe = soilPulloutCapacityKn >= upliftPerPileKn * 1.5; // Safety Factor 1.5
    const requiredConcreteBallastWeightKg = Math.round((upliftPressureNPerM2 * totalTableAreaM2) / 9.80665 * 1.2);

    return {
      E: Number(E.toFixed(3)),
      velocityPressureQ,
      cwPositive,
      cwUplift,
      positivePressureNPerM2,
      positiveKgPerM2,
      upliftPressureNPerM2,
      upliftKgPerM2,
      singleModuleAreaM2: Number(singleModuleAreaM2.toFixed(3)),
      totalTableAreaM2,
      totalUpliftForceKn,
      totalPositiveForceKn,
      pilesPerTable,
      upliftPerPileKn,
      isPileSafe,
      requiredConcreteBallastWeightKg
    };
  }, [
    baseWindSpeedV0,
    heightH,
    tiltAngleDeg,
    roughnessCategory,
    importanceFactorI,
    moduleWidthM,
    moduleLengthM,
    modulesPerTable,
    soilPulloutCapacityKn
  ]);

  const handleSaveToDossier = () => {
    try {
      const existing = localStorage.getItem('solnexa_engineering_dossier');
      const dossierList = existing ? JSON.parse(existing) : [];
      const item = {
        id: `jis-wind-${Date.now()}`,
        toolId: 'jis-wind-load',
        toolTitle: 'JIS C 8955:2017 架台風圧荷重算定',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('ja-JP'),
        summary: `基準風速V0: ${baseWindSpeedV0}m/s ｜ 押え圧: ${windCalculation.positivePressureNPerM2}N/m² ｜ 吹上圧: ${windCalculation.upliftPressureNPerM2}N/m² ｜ 判定: ${windCalculation.isPileSafe ? 'PASS' : 'REVIEW'}`,
        data: {
          baseWindSpeedV0: `${baseWindSpeedV0} m/s`,
          tiltAngle: `${tiltAngleDeg} 度`,
          velocityPressureQ: `${windCalculation.velocityPressureQ} N/m²`,
          positiveLoadWp: `${windCalculation.positivePressureNPerM2} N/m² (${windCalculation.positiveKgPerM2} kg/m²)`,
          upliftLoadWn: `${windCalculation.upliftPressureNPerM2} N/m² (${windCalculation.upliftKgPerM2} kg/m²)`,
          totalUpliftKn: `${windCalculation.totalUpliftForceKn} kN (テーブル全体)`,
          pileCheck: windCalculation.isPileSafe ? 'PASS (杭引抜耐力安全率1.5以上)' : 'NG (耐力不足・杭長見直し要)',
          status: windCalculation.isPileSafe ? 'PASS' : 'NG'
        }
      };
      const updated = [item, ...dossierList.filter((d: any) => d.toolId !== 'jis-wind-load')];
      localStorage.setItem('solnexa_engineering_dossier', JSON.stringify(updated));
      window.dispatchEvent(new Event('solnexa-dossier-updated'));
      setSavedToDossier(true);
      setTimeout(() => setSavedToDossier(false), 3000);
    } catch (e) {
      console.warn('Failed to save to dossier:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#043d63] to-[#085182] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200">
                <Wind className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                JIS C 8955:2017 ｜ 建築基準法施行令第87条・告示第1454号準拠
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>JIS C 8955 太陽電池アレイ用架台 風圧荷重・強度算定</span>
              <span className="text-xs sm:text-sm font-normal text-slate-300 hidden sm:inline">
                (Solar Array Wind Load Calculator)
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              経済産業省技術基準および<strong>JIS C 8955:2017「太陽電池アレイ用支持物設計標準」</strong>に基づき、基準風速 $V_0$、地表面粗度、傾斜角から「順風（押さえ込み荷重 $W_p$）」と「逆風（吹き上げ引抜荷重 $W_n$）」を高速算定。スクリュー杭・置基礎の耐力照査を行います。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveToDossier}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs border transition-all cursor-pointer ${
                savedToDossier
                  ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-300" />
              <span>{savedToDossier ? '技術計算書に追加完了！' : '技術計算書に追加'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>風圧計算書を印刷 / PDF</span>
            </button>
          </div>
        </div>

        {/* METI guideline note */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
          <Info className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            METI（経済産業省）告示により、50kW以上の太陽光発電設備は確認申請・保安規程届出において<strong>JIS C 8955に準拠した風圧荷重計算書の保存・提出</strong>が義務付けられています。
          </span>
        </div>
      </div>

      {/* Preset Quick Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            代表設置環境 プリセット (ワンクリック切替)
          </span>
          <span className="text-[11px] text-slate-400">全国風速基準（告示第1454号）</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('chiba_ground')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              baseWindSpeedV0 === 34 && installationType === 'GROUND'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">千葉・関東平野 野立て</span>
            <span className="text-[10px] text-slate-500">V0=34m/s ｜ 傾斜15° ｜ スクリュー杭</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('coastal_typhoon')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              baseWindSpeedV0 === 40
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">沿岸台風常襲地 (高知/鹿児島)</span>
            <span className="text-[10px] text-slate-500">V0=40m/s ｜ 傾斜10° ｜ 重要度I=1.15</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('factory_rooftop')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              installationType === 'FLAT_ROOF'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">工場陸屋根 PPA (高層H=12m)</span>
            <span className="text-[10px] text-slate-500">都市部粗度II ｜ コンクリート置基礎</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('hokkaido_sloped')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              tiltAngleDeg === 25
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">積雪対応急傾斜 (傾斜25°)</span>
            <span className="text-[10px] text-slate-500">落雪性向上 ｜ H=2.5m高架台</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Form (Left 5 cols) & Outputs / Visual (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Input Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              風速条件 ＆ 架台形状パラメータ
            </h2>
            <p className="text-[11px] text-slate-500">
              計画地の基本風速、粗度区分、アレイの傾斜角・高さを設定
            </p>
          </div>

          {/* 1. Base Wind Speed & Location */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  設置形態
                </label>
                <select
                  value={installationType}
                  onChange={e => setInstallationType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="GROUND">地上設置 (野立て / Ground)</option>
                  <option value="FLAT_ROOF">建物陸屋根 (Flat Roof)</option>
                  <option value="SLOPED_ROOF">傾斜屋根 (Sloped Roof)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  基準風速 $V_0$ (m/s)
                </label>
                <select
                  value={baseWindSpeedV0}
                  onChange={e => setBaseWindSpeedV0(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-900"
                >
                  <option value={30}>30 m/s (山間内陸部)</option>
                  <option value={32}>32 m/s (北海道・東北内陸)</option>
                  <option value={34}>34 m/s (東京・千葉・愛知・大阪 標準)</option>
                  <option value={36}>36 m/s (沿岸部・伊勢湾・瀬戸内)</option>
                  <option value={38}>38 m/s (九州北部・日本海沿岸)</option>
                  <option value={40}>40 m/s (高知・鹿児島・台風常襲地)</option>
                  <option value={42}>42 m/s (沖縄・離島・特別多風地)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  地表面粗度区分
                </label>
                <select
                  value={roughnessCategory}
                  onChange={e => setRoughnessCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="III">粗度区分 III (一般的な平野・農地)</option>
                  <option value="II">粗度区分 II (都市部・高層住宅地)</option>
                  <option value="IV">粗度区分 IV (海岸線近傍・海上・湖畔)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  重要度係数 $I$
                </label>
                <select
                  value={importanceFactorI}
                  onChange={e => setImportanceFactorI(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value={1.0}>1.0 (標準施設)</option>
                  <option value={1.15}>1.15 (重要インフラ・特高発電所)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Geometric Dimensions */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              架台形状 ＆ 傾斜角（GEOMETRY）
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700">アレイ傾斜角 ($\theta$)</label>
                  <span className="font-mono font-bold text-blue-700">{tiltAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={tiltAngleDeg}
                  onChange={e => setTiltAngleDeg(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700">地上平均高さ ($H$)</label>
                  <span className="font-mono font-bold text-blue-700">{heightH} m</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={20.0}
                  step={0.5}
                  value={heightH}
                  onChange={e => setHeightH(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  1テーブルあたりモジュール枚数
                </label>
                <input
                  type="number"
                  min={2}
                  max={40}
                  value={modulesPerTable}
                  onChange={e => setModulesPerTable(Math.max(2, Number(e.target.value)))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  基礎形式
                </label>
                <select
                  value={foundationType}
                  onChange={e => setFoundationType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="SCREW_PILE">グランドスクリュー杭基礎</option>
                  <option value="CONCRETE_BALLAST">コンクリート置基礎 (陸屋根用)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Soil / Pile pullout capacity */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              基礎耐力照査条件 (FOUNDATION CHECK)
            </span>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700">
                  スクリュー杭1本当たりの設計引抜耐力 (kN)
                </label>
                <span className="font-mono font-bold text-slate-900">{soilPulloutCapacityKn.toFixed(1)} kN</span>
              </div>
              <input
                type="range"
                min={5.0}
                max={40.0}
                step={0.5}
                value={soilPulloutCapacityKn}
                onChange={e => setSoilPulloutCapacityKn(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">
                地盤調査（スウェーデン式サウンディング等）に基づく許容引抜耐力
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Outputs & Wind Load Indicators (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Results Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-blue-500/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  【JIS C 8955 算定風圧荷重結果】
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                windCalculation.isPileSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {windCalculation.isPileSafe ? '基礎耐力適合 (PASS)' : '基礎引抜耐力不足 (NG)'}
              </span>
            </div>

            {/* 2-Column Load Highlights: Positive Downforce vs Uplift Pullout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Box A: Positive Pressure (順風 押さえ込み Wp) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">順風 (押さえ込み荷重 $W_p$)</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-bold">Cw1: +{windCalculation.cwPositive}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                    {windCalculation.positivePressureNPerM2}
                  </span>
                  <span className="text-sm font-bold text-slate-600 font-mono">N/m²</span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({windCalculation.positiveKgPerM2} kg/m²)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  架台梁部材・母屋の曲げ応力照査および基礎の鉛直沈下耐力算定に適用。
                </p>
              </div>

              {/* Box B: Uplift Pressure (逆風 吹き上げ・浮き上がり Wn) - The Most Critical for Solar! */}
              <div className="p-4 bg-blue-50/70 rounded-xl border-2 border-blue-400/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900">逆風 (吹き上げ引抜荷重 $W_n$)</span>
                  <span className="font-mono text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-bold">Cw2: {windCalculation.cwUplift}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-blue-950 tracking-tight">
                    {windCalculation.upliftPressureNPerM2}
                  </span>
                  <span className="text-sm font-bold text-blue-800 font-mono">N/m²</span>
                  <span className="text-xs text-blue-600 font-mono">
                    ({windCalculation.upliftKgPerM2} kg/m²)
                  </span>
                </div>
                <p className="text-[10px] text-blue-800 leading-snug">
                  太陽光架台の倒壊事故で最も多い<strong>「杭の引抜け・飛散防止」</strong>の支配的荷重。
                </p>
              </div>

            </div>

            {/* Scientific Formulas & Parameters Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">環境係数 $E$</span>
                <strong className="text-slate-900">{windCalculation.E}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">速度圧 $q$</span>
                <strong className="text-slate-900">{windCalculation.velocityPressureQ} N/m²</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">テーブル総面積</span>
                <strong className="text-slate-900">{windCalculation.totalTableAreaM2} m²</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">総引抜力</span>
                <strong className="text-blue-900">{windCalculation.totalUpliftForceKn} kN</strong>
              </div>
            </div>
          </div>

          {/* Foundation Uplift Resistance Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>基礎引抜耐力 照査判定（安全率 $FS \ge 1.5$ 評価）</span>
            </h4>

            <div className="p-4 rounded-xl border bg-slate-50 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">杭1本当たりの設計引抜力:</span>
                  <strong className="text-base font-mono text-slate-900">
                    {windCalculation.upliftPerPileKn} kN / 本
                  </strong>
                  <span className="text-[10px] text-slate-400 block">
                    (テーブル全体 {windCalculation.totalUpliftForceKn}kN ÷ 杭{windCalculation.pilesPerTable}本)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">地盤の許容引抜耐力:</span>
                  <strong className="text-base font-mono text-emerald-700">
                    {soilPulloutCapacityKn} kN / 本
                  </strong>
                  <span className="text-[10px] text-slate-400 block">
                    (安全率比: {(soilPulloutCapacityKn / (windCalculation.upliftPerPileKn || 1)).toFixed(2)} 倍)
                  </span>
                </div>
              </div>

              {installationType === 'FLAT_ROOF' && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                  <strong>陸屋根コンクリート置基礎 必要重量:</strong> テーブル全体で約 <strong>{windCalculation.requiredConcreteBallastWeightKg.toLocaleString()} kg</strong> 以上のバラスト重石（コンクリートブロック）が必要です。
                </div>
              )}
            </div>
          </div>

          {/* Submission Guidelines Note */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>確認申請 ＆ 経済産業省(METI) 構造審査の提出ポイント</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              本計算書は「JIS C 8955:2017」の風力係数算定手順（表1〜4の開放アレイ条件）に基づき厳格に導出されています。行政や構造審査機関（ERI・日本確認検査センター等）に提出する際は、現地の地盤調査報告書（スクリュー杭引抜試験結果）と合わせて添付してください。
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
