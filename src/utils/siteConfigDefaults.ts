import { SiteConfig } from '../types/siteConfig';
import { APP_IMAGES } from '../assets/images';

export interface BgImagePreset {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  recommendedTheme: 'solar-frontier-light' | 'airy-blue' | 'clean-neutral';
}

export const BG_IMAGE_PRESETS: BgImagePreset[] = [
  {
    id: 'preset-solar-frontier-prime',
    name: 'Solar Frontier Signature - Cánh Đồng Nắng Ban Ngày Tươi Sáng',
    category: 'Solar Frontier Style (Chuẩn Nhật)',
    url: APP_IMAGES.solarFrontierDaylight,
    description: 'Phong cách web Solar Frontier đích thực: Ánh nắng tự nhiên rực rỡ, đồi cỏ xanh ngắt, trời trong vắt không một gợn tối, các dãy pin sáng bóng sắc nét.',
    recommendedTheme: 'solar-frontier-light'
  },
  {
    id: 'preset-bess-substation-prime',
    name: 'Clean White Substation - Trạm Điện & BESS Trắng Hiện Đại',
    category: 'BESS & 特高変電設備',
    url: APP_IMAGES.cleanWhiteSubstation,
    description: 'Kiến trúc trạm pin container trắng tinh tế, thiết bị biến áp sáng màu dưới nắng sớm chan hòa, không gian rộng thoáng sạch sẽ.',
    recommendedTheme: 'solar-frontier-light'
  },
  {
    id: 'preset-solar-frontier',
    name: 'Daylight Rolling Hills - Đồi Năng Lượng Mặt Trời Sáng Tươi',
    category: 'Mega Solar (Nhật Bản)',
    url: APP_IMAGES.brightSolarLandscape,
    description: 'Cánh đồng quang điện quy mô lớn, góc nhìn khoáng đạt, ánh sáng tự nhiên với nền trời xanh dịu mát.',
    recommendedTheme: 'solar-frontier-light'
  },
  {
    id: 'preset-bess-clean',
    name: 'Architectural BESS Facility - Cụm Pin Lưu Trữ Kiến Trúc Sáng',
    category: 'BESS 系統用蓄電池',
    url: APP_IMAGES.cleanBessFacility,
    description: 'Container pin màu trắng kiến trúc đặt giữa cảnh quan xanh mát, trạm biến áp gọn gàng, ánh sáng tươi sáng và hiện đại.',
    recommendedTheme: 'solar-frontier-light'
  },
  {
    id: 'preset-solar-sky',
    name: 'Daylight Sky - Tấm Thu Năng Lượng Bầu Trời Cao',
    category: 'Industrial PV',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=2000&q=85',
    description: 'Cận cảnh dãy pin năng lượng mặt trời công nghiệp phản chiếu trời xanh mây trắng trong veo.',
    recommendedTheme: 'airy-blue'
  },
  {
    id: 'preset-architecture-glass',
    name: 'Tokyo Modern Engineering - Kiến Trúc Kỹ Thuật Kính Sáng',
    category: 'Corporate Architecture',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
    description: 'Tòa nhà trụ sở văn phòng kỹ thuật sáng sủa, không gian kính thoáng đãng và đẳng cấp quốc tế.',
    recommendedTheme: 'clean-neutral'
  },
  {
    id: 'preset-substation-grid',
    name: 'Clean Grid Substation - Trạm Đấu Nối Lưới Điện Sáng',
    category: 'Grid & High Voltage',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=2000&q=85',
    description: 'Hạ tầng truyền tải năng lượng tái tạo, đường nét kỹ thuật sắc sảo trên nền trời bình minh rực rỡ.',
    recommendedTheme: 'solar-frontier-light'
  }
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  hero: {
    tagline: 'SMARTER ENERGY. BRIGHTER TOMORROW.',
    titleLine1: '持続可能な未来を、',
    titleLine2: '太陽光と系統用蓄電池の',
    titleLine3: '最先端技術で創る。',
    jpSubtitle: 'エネルギーの未来を、設計する。',
    description: '株式会社ソルネクサ（SOLNEXA）は、特別高圧メガソーラー開発、系統用大型蓄電システム（BESS）の設計・機器供給、FIP市場運用最適化、そしてJIS規格・消防法に準拠した統合クラウド設計ツールを提供する総合エンジニアリング企業です。',
    bgImage: APP_IMAGES.solarFrontierDaylight,
    bgBrightness: 1.05,
    overlayType: 'light-clean',
    overlayOpacity: 0.12,
    accentBadge: 'SOL (太陽) + NEXT (未来) + A (創生) ｜ JIS & 消防法告示第2号完全準拠',
    showSlogan: true,
    textColor: 'dark',
    buttons: [
      {
        id: 'btn-solutions',
        label: '法人のお客様へ（ソリューション）',
        target: 'solutions',
        style: 'primary-red',
        icon: 'arrow',
        visible: true
      },
      {
        id: 'btn-tools',
        label: 'エンジニアリング設計ツール (PRO)',
        target: 'tools',
        style: 'deep-navy',
        icon: 'cpu',
        visible: true
      },
      {
        id: 'btn-ai',
        label: 'AI技術相談室',
        target: 'ai-advisor',
        style: 'outline',
        icon: 'sparkles',
        visible: true
      }
    ],
    metrics: [
      { id: 'm-1', label: '国内累計設計・調達実績', value: '1.4', unit: 'GW+', sub: 'メガソーラー・系統用蓄電池' },
      { id: 'm-2', label: '系統連系協議採択率', value: '98.4', unit: '%', sub: '特高66kV/高圧22kV連系' },
      { id: 'm-3', label: '消防法・電気事業法適合', value: '100', unit: '%', sub: '保有空地3m・第48条完全適合' },
      { id: 'm-4', label: 'ライフサイクル運用年数', value: '20', unit: '年', sub: 'FIP・JEPX・容量市場最適化' }
    ]
  },
  theme: {
    primaryAccent: '#d81a28',
    fontFamily: 'noto',
    fontSizeScale: 'normal',
    heroTheme: 'solar-frontier-light'
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Hoàng Anh Tuấn (Admin)'
};
