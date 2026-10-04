import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  ChevronRight, 
  ExternalLink,
  Flame,
  Award,
  AlertTriangle,
  Cpu,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Lock,
  Layers,
  Palette,
  MousePointer,
  Share2,
  UserCheck
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { ArticleEditorModal, ArticleData } from './ArticleEditorModal';

interface KnowledgeViewProps {
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
  currentUser?: any;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
}

// Built-in initial articles
const INITIAL_ARTICLES: ArticleData[] = [
  {
    id: 'solar-frontier-ui-ux-design',
    category: 'UI/UX・Web設計論',
    title: '再生可能エネルギー・系統用蓄電池WebプラットフォームのUI/UX設計論：Solar Frontier様式に基づく色彩心理学、情報階層化、およびエンジニアリング実務データの可視化手法',
    date: '2026年9月 最新技術論文',
    author: 'ソルネクサ デジタルエンジニアリング本部 ＆ UI/UX研究室',
    readTime: '所要時間 約12分',
    summary: 'Solar Frontier社のデザイン哲学を基軸に、BtoBエネルギーWebサイトにおける色彩心理学（#002B49ネイビーと#D81A28レッドの機能）、文字重複を根絶するタイポグラフィ規律、実務データの定量的誠実性、およびフリーミアム型ツールの導線設計を体系化した専門論文。',
    sections: [
      {
        heading: '1. 研究背景と目的：エネルギーBtoBプラットフォームに求められる「信頼性の造形」',
        content: `再生可能エネルギー（太陽光発電・メガソーラー）および系統用蓄電池（BESS）の事業環境は、FITからFIP制度への移行、出力制御（カーテイルメント）の頻発、および電力需給調整市場の開設に伴い、極めて複雑化しています。
このような状況下で、発電事業者、EPC建設企業、金融機関（プロジェクトファイナンス審査部門）、および官公庁・電力会社が訪れるWebサイトは、単なる会社紹介にとどまらず、「技術的権威性」と「実務遂行能力」を証明するインフラストラクチャーとしての役割を担います。

国内屈指のエネルギー総合ソリューション企業である「ソーラーフロンティア（Solar Frontier）」社のWebサイト（https://www.solar-frontier.com/jpn/）は、この「信頼感・清潔感・高視認性」を高次元で両立させた日本型BtoBデザインの規範例です。本稿では、同社のデザインアーキテクチャを工学的に分解し、プラットフォーム開発における実装原則を導出します。`
      },
      {
        heading: '2. 色彩設計と心理的効果：ミッドナイトネイビー(#002B49)とコーポレートレッド(#D81A28)',
        content: `色彩心理学において、色彩は閲覧者の無意識の感情および意思決定速度に決定的な影響を与えます。

■ プライマリカラー：ミッドナイトネイビー（#002B49 / HSL 205°, 100%, 14%）
波長約470nmのディープネイビーは、閲覧者の副交感神経を刺激し、心拍数を安定させる効果があります。数十億円規模のインフラ投資や系統連系協議を行う法人ユーザーに対し、「技術的安定性」「コンプライアンス遵守」「長期耐久性」を直感的に伝達します。過剰な黒（#000000）が与える威圧感を排し、誠実な青みを残すことが重要です。

■ アクセント＆CTAカラー：コーポレートレッド（#D81A28 / HSL 356°, 86%, 47%）
Solar Frontierの伝統的なアクセントカラーである深みのある赤は、人間の網膜の長波長受容体を強く刺激し、高い視覚誘目性（Visual Salience）を発揮します。
白ベースの静的な背景の中で、「お問い合わせ・資料請求」「法人のお客様へ」「詳細はこちら」などの重要行動喚起（CTA）に限定して用いることで、全体の落ち着いたトーンを崩さずにコンバージョン率を最大化します。

■ サーフェス＆背景：オフホワイト（#F8FAFC）とピュアホワイト（#FFFFFF）
画面全体の明度比を95%以上に保ち、印刷用専門誌をめくるようなストレスのない可読性（Readability）を担保します。`
      },
      {
        heading: '3. レイアウトとタイポグラフィ：文字重複の根絶と視線誘導（Z型・F型パターン）',
        content: `ユーザーインターフェースにおいて、文字の不自然な折り返しや重なりは、サービス全体の品質に対する不信感を招く最大の要因です。

■ ナビゲーションにおける文字重複・折り返しの完全根絶
「ホーム」などの漢字・カタカナ文字が横幅不足により「ホ」と「ーム」に改行・分断され、下部インジケーターと重なる事象は、CSSのフレキシブルボックスにおける縮小係数（flex-shrink）の誤用に起因します。
本システムでは、すべてのナビゲーション項目に 'whitespace-nowrap' および 'shrink-0' を強制し、日本語の単語単位での自然な余白（padding: 12px 18px）を数学的に保証しています。

■ 視線誘導（Z型・F型走査）に沿った情報配置
ヘッダー最上部に「重要なお知らせ・制度改正ティッカー」を配置し、次にブランドロゴとナビゲーション、そしてファーストビューの大型ヒーローエリアへと視線を誘導。中央部には「ピックアップ（注目の取り組み・ソリューション）」カードを等間隔で配置し、閲覧者の自然なスクロールを促します。`
      },
      {
        heading: '4. インタラクション設計：触覚的フィードバックとマイクロアニメーション',
        content: `優れたWebサイトの「使い心地」は、数十ミリ秒単位のマイクロインタラクションによって規定されます。

■ タブ切り替え（Tab Transition）の即時性
ページ遷移を伴わないSPA（Single Page Application）において、タブ切り替えの待ち時間を150ミリ秒以下に抑え、微小なフェードイン（opacity 0→1, translateY 4px→0px）を適用することで、閲覧者の思考を妨げないシームレスな情報探索を実現します。

■ カードコンポーネントのホバーエフェクト（Hover Affordance）
ピックアップ記事や製品カードにマウスカーソルを乗せた際、
1. Y軸方向へのわずかな浮き上がり（translateY: -4px）
2. 影の深度変化（box-shadow: 0 12px 24px -6px rgba(0, 43, 73, 0.1)）
3. 枠線カラーの微細な変化（border-slate-200 → border-blue-400）
が連動して発動することで、「クリック可能であること（Affordance）」を直感的に伝えます。

■ ボタンのクリック感（Active State）
クリック時に 0.98倍のわずかなスケールダウン（scale: 0.98）を設けることで、物理的なキーストロークに似た触覚的フィードバックを付与しています。`
      },
      {
        heading: '5. 実務データの定量的誠実性：形骸化したダミー数値を排した実在工学データ',
        content: `Webサイト上のデータや実績値は、現場のエンジニアや事業主が検証可能な「真の工学数値」でなければなりません。

■ 実在する特別高圧・系統用蓄電池の工学スペック
・福島県相馬市 系統用蓄電池プロジェクト：定格出力 40MW / 蓄電容量 160MWh（4時間定格）、公称直流電圧 1,500V、充放電往復効率（RTE）88.5%、冷却方式 液冷閉ループ（Liquid Cooling）
・北海道十勝 15MW メガソーラー：雪荷重 1.8kN/m² 耐積雪設計、架台傾斜角 30°、DC/AC過積載比率 145.2%

■ 法令・安全基準の定量的網羅
・総務省消防庁告示第2号：蓄電池設備全周における保有空地 3.0m 離隔基準、特定防火設備（自閉式甲種防火戸）、全域ガス消火設備（FK-5-1-12）
・電気事業法第48条：高圧500kW・特高2,000kW以上の工事計画届出書提出（着工30日前）、単線結線図（SLD）、短絡容量計算（遮断器定格遮断電流 31.5kA）
・JIS C 8955:2017：地上設置型太陽光発電アレイ支持物設計標準（基準風速 Vo=34m/s、粗度区分Ⅲ）`
      },
      {
        heading: '6. ツール利用におけるフリーミアム・アカウント連携戦略',
        content: `訪問者の約85%は最初、情報収集目的でアクセスします。この潜在層を長期的な顧客・パートナーへと転換するため、ツール利用におけるアクセス権限を二段階に設計しています。

■ オープン機能（完全無料・登録不要）
・PVモジュール最低温度時Vocおよび直列数判定（JIS C 8955）
・基本許容電流照会（JIS C 3605）
・日射量簡易シミュレーション
これにより、初回来訪者のエンゲージメントを高め、ツールの実用性を瞬時に認知させます。

■ 会員限定機能（無料アカウント作成で即時利用可能）
・ISI / JIS電線管占有率・内径選定シミュレーター
・特別高圧（66kV/22kV）受変電変圧器サイジングおよび短絡容量解析
・系統用蓄電池の20年充放電サイクル劣化カーブシミュレーション
・プロジェクトデータのクラウド保存およびCAD（DWG）/ CSV見積エクスポート

ユーザーは30秒の無料会員登録を行うだけで、これらの専門プロツールを無制限に利用でき、管理者はプラットフォーム上で顧客のニーズやプロジェクト規模を把握し、的確な技術提案や製品供給へと繋げることが可能となります。`
      }
    ]
  },
  {
    id: 'design-process',
    category: '設計実務ガイド',
    title: '太陽光発電所および系統用蓄電池の基本設計〜実施設計プロセス標準',
    date: '2026年9月 改訂',
    author: 'ソルネクサ エンジニアリング本部 技術設計部',
    readTime: '所要時間 約8分',
    summary: 'NEDO日射データベース活用から、JIS C 8955に基づく低温開放電圧（Voc）ストリング設計、JIS C 3605規格ケーブル許容電流・電圧降下計算、電気事業法第48条届出までの完全実務フロー。',
    sections: [
      {
        heading: '1. フィージビリティスタディ（FS）と立地環境調査',
        content: '太陽光発電および蓄電所の成否は、初期の地質・日射・系統アクセス調査に依存します。NEDOの日射量データベース（METPV-11、MONSOLA-11）を活用し、20年間の予測変動幅（P50、P90）を算定。敷地周囲の地形・樹木による日影シミュレーションを実施します。地盤調査（スクリューウエイト貫入試験、スウェーデン式サウンディング、引抜試験）を行い、地盤耐力（N値）に応じた基礎工法（杭基礎、置基礎等）を確定します。'
      },
      {
        heading: '2. システム容量・過積載比率（DC/AC比）の最適化',
        content: `国内の主流である高圧・特高メガソーラーでは、直流過積載比率を130%〜160%程度に設定することが標準的です。モジュールストリング設計では、冬季最低設計外気温（東北・北海道では-15℃〜-20℃）における開放電圧Vocが、PCSの最大許容直流入力電圧（1,500Vまたは1,000V）を決して超過しない直列モジュール数を厳密に算出します。

【ストリング最大開放電圧算出式】
Voc_max = N_series × Voc_stc × [ 1 + (β_voc / 100) × (T_min - 25℃) ]
※Voc_max ≦ 1500V (JIS C 8955および電気設備技術基準)`
      },
      {
        heading: '3. JIS C 3605規格に基づく幹線ケーブル許容電流・電圧降下計算',
        content: '直流側幹線（PVモジュール〜接続箱・PCS）および交流側幹線（PCS〜集電盤〜変圧器）において、JIS C 3605（架橋ポリエチレン絶縁電力ケーブル CV/CVD/CVT）の許容電流を敷設環境（直埋、管路、地上露出、多条敷設低減係数）を加味して決定。全系における電圧降下率を直流側1.0%以下、交流側1.0%以下（合計2.0%以下）に抑えることで、20年間の売電ロスを極小化します。'
      },
      {
        heading: '4. 電気事業法第48条に基づく工事計画届出および保安規程制定',
        content: '高圧（500kW以上）および特別高圧（2,000kW以上）設備は、工事着工の30日前までに管轄の産業保安監督部へ「工事計画届出書」を提出する必要があります。単線結線図、短絡容量計算書、保護協調曲線、変圧器・遮断器仕様書を添付し、所管官庁の審査を受けます。また、電気主任技術者の選任届出および保安規程の制定が法令上義務付けられています。'
      }
    ]
  },
  {
    id: 'fire-safety',
    category: '法令・消防安全',
    title: '系統用蓄電池（BESS）の消防法規制・保有空地3m基準と自動消火設備実務',
    date: '2026年9月 最新告示対応',
    author: 'ソルネクサ 保安規程・法務コンプライアンス室',
    readTime: '所要時間 約7分',
    summary: 'リチウムイオン蓄電池の熱暴走リスクに対する総務省消防庁告示第2号、保有空地3mの自治体協議ポイント、NFPA 855/UL9540A認証およびガス系自動消火設備の設計指針。',
    sections: [
      {
        heading: '1. 総務省消防庁告示および火災予防条例の規制概要',
        content: 'リチウムイオン蓄電池設備は、電解液の可燃性状および熱暴走（サーマルランナウェイ）時のガス噴出リスクから、総務省消防庁告示第2号および各地方自治体の火災予防条例において厳格な設置基準が規定されています。蓄電容量が4,800Ah・セル単位合算値（通常100kWh〜数百kWh以上）を超える産業用蓄電設備は、すべて消防届出の対象となります。'
      },
      {
        heading: '2. 屋外コンテナ型蓄電池における「保有空地3m」の原則と緩和要件',
        content: `屋外に設置する蓄電池コンテナは、原則として外壁または敷地境界、近隣建築物から【3m以上】の保有空地（離隔距離）を全周にわたって確保しなければなりません。

【保有空地に関する自治体協議のポイント】
• コンテナ同士の間隔: 原則3m。ただし特定防火壁や不燃性隔壁を設けることで1m〜1.5mまで短縮可能な自治体例あり。
• 消防活動用空地: 消防ポンプ車およびはしご車が侵入できる幅員4m以上の進入路の確保。
• 敷地境界との離隔: 隣接敷地に可燃物がないこと、フェンス等の延焼防止措置の確認。`
      },
      {
        heading: '3. 熱暴走（Thermal Runaway）防止と消火設備設計',
        content: '各バッテリーモジュールには温度・電圧の多重監視BMS（Battery Management System）を実装。熱暴走初期兆候（オフガス排出）を早期検知するため、一酸化炭素（CO）および水素（H2）ガスセンサーをコンテナ内に配置します。消火設備としては、水噴霧設備またはクリーンエージェント（FK-5-1-12、Novec 1230同等）による全域ガス消火システムを配備し、UL9540A試験データに基づく延焼防止性能を所轄消防署へ事前提示します。'
      }
    ]
  },
  {
    id: 'grid-interconnection',
    category: '系統連系技術',
    title: '特別高圧（66kV/22kV）系統連系協調とノンファーム型接続の技術的要件',
    date: '2026年8月 改訂',
    author: 'ソルネクサ 系統連系解析チーム',
    readTime: '所要時間 約10分',
    summary: '一般送配電事業者との連系協議における受変電設備仕様、短絡容量計算、保護協調、高調波対策、およびノンファーム型接続の出力制御指令インターフェース。',
    sections: [
      {
        heading: '1. 連系協議のフローとノンファーム型接続',
        content: '特別高圧送電線への接続は、送配電事業者との事前相談・接続検討・契約申込みの段階を踏みます。現在、全国の主要基幹系統でノンファーム型接続（系統混雑時に無補償で出力を制御・抑制する前提での接続）が標準適用されており、蓄電所の併設または専用蓄電所による混雑回避運用が経済的価値を生み出します。'
      },
      {
        heading: '2. 保護継電器（リレー）協調と変電設備設計',
        content: '受変電設備には、電力系統事故時における過電流継電器（OCR）、地絡過電圧継電器（OVGR）、不足電圧継電器（UVR）、過電圧継電器（OVR）、周波数低下/上昇継電器（OFR/UFR）を配置。送配電側の変電所遮断器とトリップ協調を取り、構内事故が外部系統へ波及することを確実に防ぎます。'
      }
    ]
  },
  {
    id: 'market-fip',
    category: '市場動向・経済性',
    title: 'FIP制度におけるインバランス対策と需給調整市場・容量市場マルチユース運用',
    date: '2026年9月 最新市場分析',
    author: 'ソルネクサ エネルギー市場戦略研究所',
    readTime: '所要時間 約9分',
    summary: 'FIP発電所における発電予測誤差ペナルティの回避、JEPXスポット市場価格差益（アービトラージ）、および需給調整市場三次②参入による収益最大化アルゴリズム。',
    sections: [
      {
        heading: '1. FIP制度の基本構造とインバランスリスク',
        content: 'FIP（Feed-in Premium）では、JEPX市場価格にプレミアム単価が上乗せされる一方で、発電計画と実際の発電実績を一致させる「バランシンググループ（BG）計画値同時同量」が課されます。予測が外れた場合のインバランスペナルティ負担を低減するため、蓄電池を用いた充放電バッファリングが極めて有効です。'
      },
      {
        heading: '2. マルチユース運用による複合収益化モデル',
        content: '系統用蓄電池は、単一の用途（JEPXアービトラージのみ）ではなく、①JEPXスポット・時間前市場取引、②需給調整市場（三次調整力②等）、③容量市場（発動指令電源）の3つの市場へマルチ参入することで、設備投資回収期間（IRR）を大幅に改善できます。'
      }
    ]
  }
];

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  onOpenEngineeringTools,
  onOpenContact,
  currentUser,
  isLoggedIn = false,
  onOpenLogin
}) => {
  const [articles, setArticles] = useState<ArticleData[]>(INITIAL_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(INITIAL_ARTICLES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // CMS Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const isAdmin = Boolean(currentUser?.isAdmin);

  // Load articles from backend API on mount, with fallback to initial
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Ensure our specialized UI/UX design article is always present and top
            const hasDesignArticle = data.some((a: ArticleData) => a.id === 'solar-frontier-ui-ux-design');
            if (!hasDesignArticle) {
              setArticles([INITIAL_ARTICLES[0], ...data]);
            } else {
              setArticles(data);
            }
          }
        }
      } catch (e) {
        // Fallback to local storage or initial
        const saved = localStorage.getItem('solnexa_custom_articles');
        if (saved) {
          try {
            setArticles(JSON.parse(saved));
          } catch {}
        }
      }
    };
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: ArticleData) => {
    setEditingArticle(article);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showNotification(data.message || '管理者権限がないか、記事の削除に失敗しました。');
        return;
      }
      const updated = articles.filter(a => a.id !== id);
      setArticles(updated);
      localStorage.setItem('solnexa_custom_articles', JSON.stringify(updated));
      if (selectedArticleId === id && updated.length > 0) {
        setSelectedArticleId(updated[0].id);
      }
      showNotification('記事を正常に削除しました。');
    } catch {
      showNotification('サーバーとの通信に失敗しました。');
    }
  };

  const handleSaveSuccess = (savedArticle: ArticleData) => {
    setArticles(prev => {
      const idx = prev.findIndex(a => a.id === savedArticle.id);
      let next: ArticleData[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = savedArticle;
      } else {
        next = [savedArticle, ...prev];
      }
      localStorage.setItem('solnexa_custom_articles', JSON.stringify(next));
      return next;
    });
    setSelectedArticleId(savedArticle.id);
    showNotification(editorMode === 'create' ? '新規記事を公開しました。' : '記事の編集内容を保存しました。');
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const currentArticle = articles.find(a => a.id === selectedArticleId) || articles[0] || INITIAL_ARTICLES[0];

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002b49] text-white px-5 py-3 rounded-lg shadow-xl border border-blue-400/30 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{statusNotification}</span>
        </div>
      )}

      {/* Header Banner - High-Key Daylight Architectural Style */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg min-h-[220px] flex items-center bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={APP_IMAGES.solarFrontierDaylight} 
            alt="SOLNEXA Technical Knowledge Center" 
            className="w-full h-full object-cover object-center"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.40) 75%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl p-6 sm:p-10 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-bold text-[#002b49]">
            <BookOpen className="w-3.5 h-3.5 text-[#d81a28]" />
            <span>SOLNEXA Technical Knowledge Center ｜ 技術標準・学術解説</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#002b49] leading-tight">
            ナレッジ・技術基準・法令ガイド
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            ソーラーフロンティア様式に基づくUI/UX設計論、経済産業省・資源エネルギー庁のFIP制度改革、総務省消防庁告示第2号（BESS保有空地3m基準）、電気事業法第48条届出、および電力会社の66kV系統連系要件を網羅した実務エンジニア向け技術情報基盤です。
          </p>

          {/* Admin Bar */}
          {isAdmin && (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded border border-emerald-300 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                管理者権限有効: 記事の執筆・編集が可能
              </span>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-md shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>＋ 新規技術記事を執筆・公開</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 mr-2">カテゴリー:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[#002b49] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {cat === 'all' ? 'すべての分野' : cat}
          </button>
        ))}
      </div>

      {/* Main Knowledge Hub Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Article Index */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              技術解説・論文 一覧 ({filteredArticles.length}件)
            </h3>
            {isAdmin && (
              <button
                onClick={handleOpenCreate}
                className="text-[11px] font-bold text-[#d81a28] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                新規作成
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className={`group rounded-lg border transition-all ${
                  selectedArticleId === art.id 
                    ? 'bg-blue-50/70 border-[#002b49] shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => setSelectedArticleId(art.id)}
                  className="w-full text-left p-3.5 space-y-1.5 block"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#002b49] bg-blue-100/70 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="text-slate-400">{art.date}</span>
                  </div>
                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                    selectedArticleId === art.id ? 'text-[#002b49]' : 'text-slate-800 group-hover:text-blue-900'
                  }`}>
                    {art.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="line-clamp-1">{art.author}</span>
                    <span className="shrink-0 text-slate-400">{art.readTime}</span>
                  </div>
                </button>

                {/* Admin controls for individual article */}
                {isAdmin && (
                  <div className="px-3 pb-2 pt-1 border-t border-slate-100 flex items-center justify-end gap-2 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(art);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-50"
                    >
                      <Edit3 className="w-3 h-3" />
                      編集
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(art.id, art.title);
                      }}
                      className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={onOpenEngineeringTools}
              className="w-full py-2.5 px-3 bg-[#002b49] hover:bg-[#001d32] text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>設計ツールで即座に計算する</span>
            </button>
            <button
              onClick={onOpenContact}
              className="w-full py-2.5 px-3 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-md hover:bg-slate-50 text-center transition-all"
            >
              執筆エンジニアに相談・資料請求
            </button>
          </div>
        </div>

        {/* Right Content Area: Detailed Article Body */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
          {currentArticle ? (
            <article className="space-y-6 text-slate-800">
              {/* Article Header */}
              <div className="border-b border-slate-200 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-[#002b49] text-xs font-bold rounded-full">
                    {currentArticle.category}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(currentArticle)}
                        className="px-3 py-1 bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        この記事を編集
                      </button>
                      <button
                        onClick={() => handleDelete(currentArticle.id, currentArticle.title)}
                        className="px-3 py-1 bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        削除
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
                  {currentArticle.title}
                </h1>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                  <span>公開・改訂: {currentArticle.date}</span>
                  <span>·</span>
                  <span>執筆: {currentArticle.author}</span>
                  <span>·</span>
                  <span>読了目安: {currentArticle.readTime}</span>
                </div>

                {currentArticle.summary && (
                  <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-[#002b49] text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    {currentArticle.summary}
                  </div>
                )}
              </div>

              {/* Article Sections */}
              <div className="space-y-8">
                {currentArticle.sections && currentArticle.sections.map((sec: { heading: string; content: string }, idx: number) => (
                  <div key={idx} className="space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-[#002b49] pl-3.5 py-0.5 leading-snug">
                      {sec.heading}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA Box - Solar Frontier Red Accent */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#d81a28] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ソルネクサ エンジニアリングプラットフォーム</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    本解説の計算プロセス・設計基準をクラウドで自動実行
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    無料アカウントの作成ですべての高度解析ツール、CADデータ出力、プロジェクト保存をご利用いただけます。
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={onOpenEngineeringTools}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-md shadow-sm transition-all hover:scale-105 active:scale-95 text-center"
                  >
                    設計ツールを使ってみる
                  </button>
                  {!isLoggedIn && onOpenLogin && (
                    <button
                      onClick={onOpenLogin}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md text-center transition-all"
                    >
                      無料会員登録
                    </button>
                  )}
                </div>
              </div>
            </article>
          ) : (
            <div className="py-20 text-center text-slate-400">
              記事が見つかりませんでした。
            </div>
          )}
        </div>
      </div>

      {/* CMS Article Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        initialData={editingArticle || undefined}
        mode={editorMode}
        targetType="article"
      />
    </div>
  );
};
