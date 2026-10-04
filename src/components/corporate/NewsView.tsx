import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  ArrowRight, 
  Download, 
  Tag, 
  Share2, 
  Search,
  Filter,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { ArticleEditorModal, ArticleData } from './ArticleEditorModal';

interface NewsViewProps {
  onOpenContact: () => void;
  isAdmin?: boolean;
  currentUser?: any;
}

export const NewsView: React.FC<NewsViewProps> = ({ onOpenContact, isAdmin: propIsAdmin, currentUser }) => {
  const isAdmin = Boolean(currentUser?.isAdmin || propIsAdmin);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleData, setEditingArticleData] = useState<ArticleData | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const newsList = [
    {
      id: 'news-2026-09-24',
      date: '2026.09.24',
      category: '政策・法令',
      title: '経済産業省・資源エネルギー庁、「系統用蓄電池のノンファーム型接続運用ルールおよび出力制御補償」最新解説公表',
      author: 'ソルネクサ 法規動向調査グループ',
      summary: '基幹送電線の混雑対策として導入が進むノンファーム型接続において、蓄電所の充放電スケジュールおよびリアルタイム制御シグナル受信要件が改定されました。',
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
      content: `FIP制度（Feed-in Premium）への全面移行に伴い、太陽光発電事業における最大の課題は「発電予測誤差によるインバランスペナルティ」と「市場価格連動による売電単価下落リスク」です。

本実証論文では、15MWの太陽光発電所に30MWhの蓄電池を併設した実運用データに基づき、以下の効果を定量的に検証しました:
・インバランス発生率: 単体時 8.4% → 蓄電池併設時 0.3% へ激減。
・売電単価向上効果: 昼間のマイナス価格・底値時間帯の充電と、夕方ピーク（25円/kWh〜）放電により、平均売電単価が約4.2円/kWh上昇。
・IRR（内部収益率）の改善: 投資回収期間が2.5年短縮されることを確認。

技術論文の全文PDFは、資料請求フォームよりお取り寄せいただけます。`
    },
    {
      id: 'news-2026-09-02',
      date: '2026.09.02',
      category: '補助金情報',
      title: '令和8年度 経済産業省「再生可能エネルギー導入加速化・系統用蓄電池等導入支援補助金」の公募要領が発表',
      author: 'ソルネクサ 補助金申請支援デスク',
      summary: '蓄電容量10MWh以上の系統用蓄電所に対する設備費補助（最大1/3）の申請枠が拡充されました。申請事前相談を受付中です。',
      content: `経済産業省は、令和8年度当初予算案における「再生可能エネルギー導入加速化・系統用蓄電池等導入支援事業」の公募要領を発表しました。

公募要領の概要:
・対象設備: 系統連系する独立型蓄電所（スタンドアローンBESS）および再エネ併設蓄電設備。
・補助率: 対象経費（蓄電池本体、PCS、受変電設備、工事費）の 1/3 以内（上限額あり）。
・公募締切: 2026年11月末日（予定）。

ソルネクサの補助金サポート:
当社では、補助金申請に必要な事業計画書、単線結線図（SLD）、概算見積書、充放電シミュレーションシートの作成をワンストップで支援しております。お気軽にお問い合わせください。`
    },
    {
      id: 'news-2026-08-20',
      date: '2026.08.20',
      category: '政策・法令',
      title: '総務省消防庁、リチウムイオン蓄電池設備の火災予防安全ガイドラインの運用FAQを更新',
      author: 'ソルネクサ 法務保安室',
      summary: '屋外設置コンテナ蓄電池の保有空地（離隔距離3m）の防火壁緩和条件、少量危険物貯蔵取扱所の届出書式に関する詳細FAQが整理されました。',
      content: `総務省消防庁危険物保安室より、近年急増する系統用大型蓄電設備に関する火災予防条例の全国統一的な運用FAQが発出されました。

主なポイント:
・隣接建築物が不燃材料で造られ開口部がない場合における保有空地の特例的緩和（所轄消防本部判断）。
・FK-5-1-12等ガス系消火設備の点検基準と、蓄電コンテナ開口部ダンパーの自動閉鎖要件。
・自治体ごとの火災予防条例届出時期（着工の7日前〜30日前）の遵守。`
    }
  ];

  const [articlesList, setArticlesList] = useState(newsList);

  // Fetch single source of truth from backend
  useEffect(() => {
    fetch('/api/news')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load news');
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setArticlesList(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch news from backend, using defaults:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleEditArticle = (item: any) => {
    setEditingArticleData({
      id: item.id,
      category: item.category,
      title: item.title,
      author: item.author || '株式会社ソルネクサ 広報室',
      readTime: '所要時間 約8分',
      date: item.date,
      summary: item.summary,
      content: item.content || item.summary
    });
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingArticleData(null);
    setIsEditorOpen(true);
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を削除してもよろしいですか？`)) return;
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || '管理者権限がないか、削除に失敗しました。');
        return;
      }
      setArticlesList(prev => prev.filter(a => a.id !== id));
      showToast('ニュース記事を正常に削除しました。');
    } catch {
      showToast('通信エラーが発生しました。');
    }
  };

  const handleSaveSuccess = async (savedArticle: ArticleData) => {
    const isEdit = editingArticleData !== null;
    try {
      const endpoint = isEdit ? `/api/news/${savedArticle.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(savedArticle)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || '保存に失敗しました。管理者権限を確認してください。');
        return;
      }

      const resData = await res.json();
      const updatedItem = resData.news || savedArticle;

      setArticlesList(prev => {
        const exists = prev.some(a => a.id === updatedItem.id);
        if (exists) {
          return prev.map(a => a.id === updatedItem.id ? { ...a, ...updatedItem } : a);
        }
        return [updatedItem, ...prev];
      });
      showToast(`Đã lưu bài viết "${savedArticle.title}" thành công!`);
      setIsEditorOpen(false);
    } catch {
      showToast('Lỗi khi lưu bài viết lên hệ thống.');
    }
  };

  const categories = ['all', '政策・法令', 'プレスリリース', '技術動向', '補助金情報'];

  const filtered = articlesList.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#002244] text-white rounded-xl p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              SOLNEXA News &amp; Market Insights
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ADMIN CMS
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            ニュース・市場動向・法令速報
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            経済産業省の告示、電力広域的運営推進機関（OCCTO）のルール改定、消防法ガイドライン、補助金情報、および当社の最新プレスリリースをお届けします。
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedCategory === c
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c === 'all' ? 'すべて' : c}
            </button>
          ))}
        </div>

        {/* Search and Admin Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="キーワードで記事を検索..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleAddNew}
              className="px-3.5 py-1.5 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
              title="Tạo bản tin hoặc thông cáo báo chí mới"
            >
              <Plus className="w-4 h-4" />
              <span>+ Viết bài mới</span>
            </button>
          )}
        </div>
      </div>

      {/* News Article List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            該当するニュース記事が見つかりませんでした。
          </div>
        ) : (
          filtered.map((item) => (
            <article 
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-slate-600">{item.date}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-semibold text-[#003366]">{item.category}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{item.author}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#003366] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs">
                  <span className="font-bold text-[#003366] group-hover:underline flex items-center gap-1">
                    <span>記事全文を読む</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Admin Direct Edit and Delete Buttons */}
              {isAdmin && (
                <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditArticle(item);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Chỉnh sửa trực tiếp tiêu đề và nội dung bài viết này"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteArticle(item.id, item.title);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Xóa bài viết này khỏi hệ thống"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Article Editor Modal */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingArticleData(null);
        }}
        onSaveSuccess={handleSaveSuccess}
        targetType="news"
        initialData={editingArticleData}
        mode={editingArticleData ? 'edit' : 'create'}
      />

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-slate-700">{activeArticle.date}</span>
                  <span>·</span>
                  <span className="font-bold text-[#003366]">{activeArticle.category}</span>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕ 閉じる
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {activeArticle.title}
              </h2>
              <p className="text-xs text-slate-500">発信: {activeArticle.author}</p>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
              {activeArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  alert('この記事のURLをクリップボードにコピーしました。');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>記事を共有</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    onOpenContact();
                  }}
                  className="px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-md hover:bg-[#002244]"
                >
                  この記事について問い合わせる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
